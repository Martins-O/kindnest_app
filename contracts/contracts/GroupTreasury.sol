// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IExpenseFactory {
    function addUserToGroup(address _user, address _groupAddress) external;
}

contract GroupTreasury is ReentrancyGuard, Ownable, Pausable {
    struct Expense {
        uint256 id;
        string description;
        uint256 totalAmount;
        address paidBy;
        address[] participants;
        uint256[] shares;
        bool settled;
        uint256 timestamp;
        bytes32 receiptHash; // For off-chain receipt storage
    }

    struct Member {
        address wallet;
        string nickname;
        uint256 totalOwed; // How much this member owes others
        uint256 totalOwing; // How much others owe this member
        bool active;
        uint256 joinedAt;
    }

    struct Settlement {
        address debtor;
        address creditor;
        uint256 amount;
        uint256 timestamp;
        bytes32 txHash;
    }

    string public groupName;
    uint256 private nextExpenseId;
    IExpenseFactory public immutable factory;

    mapping(address => Member) public members;
    mapping(uint256 => Expense) public expenses;
    mapping(address => mapping(address => uint256)) public balances; // debtor => creditor => amount
    mapping(uint256 => Settlement) public settlements;

    address[] public memberList;
    uint256[] public expenseList;
    uint256[] public settledExpenses;

    uint256 public constant MAX_MEMBERS = 50;
    uint256 public constant MAX_PARTICIPANTS_PER_EXPENSE = 20;
    uint256 private nextSettlementId;

    event MemberAdded(
        address indexed member,
        string nickname,
        uint256 timestamp
    );
    event ExpenseAdded(
        uint256 indexed expenseId,
        address indexed paidBy,
        uint256 amount,
        string description
    );
    event DebtSettled(
        address indexed debtor,
        address indexed creditor,
        uint256 amount,
        uint256 settlementId
    );
    event MemberRemoved(address indexed member, uint256 timestamp);
    event ExpenseUpdated(uint256 indexed expenseId, string newDescription);
    event OwnershipTransferRequested(address indexed newOwner);
    event GroupPaused(uint256 timestamp);
    event GroupUnpaused(uint256 timestamp);

    modifier onlyMember() {
        require(members[msg.sender].active, "Not a group member");
        _;
    }

    modifier validMember(address _member) {
        require(_member != address(0), "Invalid address");
        require(members[_member].active, "Member not active");
        _;
    }

    modifier notPaused() {
        require(!paused(), "Contract is paused");
        _;
    }

    modifier validExpense(uint256 _expenseId) {
        require(
            _expenseId > 0 && _expenseId < nextExpenseId,
            "Invalid expense ID"
        );
        _;
    }

    constructor(
        string memory _groupName,
        address _creator,
        string memory _creatorNickname
    ) Ownable(_creator) {
        require(bytes(_groupName).length > 0, "Group name required");
        require(
            bytes(_creatorNickname).length > 0,
            "Creator nickname required"
        );

        groupName = _groupName;
        nextExpenseId = 1;
        nextSettlementId = 1;
        factory = IExpenseFactory(msg.sender); // Factory is the deployer

        _addMember(_creator, _creatorNickname);
    }

    function addMember(
        address _member,
        string memory _nickname
    ) external onlyOwner notPaused {
        require(memberList.length < MAX_MEMBERS, "Maximum members reached");
        _addMember(_member, _nickname);

        // Notify factory - this call MUST succeed for group sync to work
        // If it fails, the entire transaction should revert
        factory.addUserToGroup(_member, address(this));
    }

    function _addMember(address _member, string memory _nickname) internal {
        require(_member != address(0), "Invalid address");
        require(!members[_member].active, "Member already exists");
        require(
            bytes(_nickname).length > 0 && bytes(_nickname).length <= 32,
            "Invalid nickname length"
        );

        members[_member] = Member({
            wallet: _member,
            nickname: _nickname,
            totalOwed: 0,
            totalOwing: 0,
            active: true,
            joinedAt: block.timestamp
        });

        memberList.push(_member);
        emit MemberAdded(_member, _nickname, block.timestamp);
    }

    function addExpense(
        string memory _description,
        uint256 _amount,
        address[] memory _participants,
        bytes32 _receiptHash
    ) external onlyMember notPaused returns (uint256) {
        require(_amount > 0, "Amount must be positive");
        require(
            _participants.length > 0 &&
                _participants.length <= MAX_PARTICIPANTS_PER_EXPENSE,
            "Invalid participants count"
        );
        require(
            bytes(_description).length > 0 && bytes(_description).length <= 200,
            "Invalid description length"
        );

        // Validate all participants are active members
        for (uint i = 0; i < _participants.length; i++) {
            require(members[_participants[i]].active, "Invalid participant");
            // Check for duplicates
            for (uint j = i + 1; j < _participants.length; j++) {
                require(
                    _participants[i] != _participants[j],
                    "Duplicate participant"
                );
            }
        }

        // More precise expense splitting
        uint256 sharePerPerson = _amount / _participants.length;
        uint256 remainder = _amount % _participants.length;

        uint256[] memory shares = new uint256[](_participants.length);
        uint256 totalShares = 0;

        for (uint i = 0; i < _participants.length; i++) {
            shares[i] = sharePerPerson;
            if (i < remainder) {
                shares[i] += 1;
            }
            totalShares += shares[i];
        }

        // Ensure no precision loss
        assert(totalShares == _amount);

        uint256 expenseId = nextExpenseId++;
        expenses[expenseId] = Expense({
            id: expenseId,
            description: _description,
            totalAmount: _amount,
            paidBy: msg.sender,
            participants: _participants,
            shares: shares,
            settled: false,
            timestamp: block.timestamp,
            receiptHash: _receiptHash
        });

        expenseList.push(expenseId);

        // Update balances with overflow protection
        for (uint i = 0; i < _participants.length; i++) {
            if (_participants[i] != msg.sender) {
                balances[_participants[i]][msg.sender] += shares[i];
                members[_participants[i]].totalOwed += shares[i];
                members[msg.sender].totalOwing += shares[i];
            }
        }

        emit ExpenseAdded(expenseId, msg.sender, _amount, _description);
        return expenseId;
    }

    function settleDebt(
        address _creditor
    ) external payable nonReentrant validMember(_creditor) notPaused {
        uint256 debt = balances[msg.sender][_creditor];
        require(debt > 0, "No debt to settle");
        require(msg.value >= debt, "Insufficient payment");

        // Update balances before external calls
        balances[msg.sender][_creditor] = 0;
        members[msg.sender].totalOwed -= debt;
        members[_creditor].totalOwing -= debt;

        uint256 settlementId = nextSettlementId++;
        settlements[settlementId] = Settlement({
            debtor: msg.sender,
            creditor: _creditor,
            amount: debt,
            timestamp: block.timestamp,
            txHash: keccak256(
                abi.encodePacked(block.timestamp, msg.sender, _creditor, debt)
            )
        });

        // Transfer payment to creditor
        (bool success, ) = _creditor.call{value: debt}("");
        require(success, "Payment failed");

        // Refund excess payment
        if (msg.value > debt) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - debt}(
                ""
            );
            require(refundSuccess, "Refund failed");
        }

        emit DebtSettled(msg.sender, _creditor, debt, settlementId);
    }

    function updateExpenseDescription(
        uint256 _expenseId,
        string memory _newDescription
    ) external validExpense(_expenseId) onlyMember notPaused {
        require(
            expenses[_expenseId].paidBy == msg.sender,
            "Only expense creator can update"
        );
        require(!expenses[_expenseId].settled, "Cannot update settled expense");
        require(
            bytes(_newDescription).length > 0 &&
                bytes(_newDescription).length <= 200,
            "Invalid description"
        );

        expenses[_expenseId].description = _newDescription;
        emit ExpenseUpdated(_expenseId, _newDescription);
    }

    function pauseGroup() external onlyOwner {
        _pause();
        emit GroupPaused(block.timestamp);
    }

    function unpauseGroup() external onlyOwner {
        _unpause();
        emit GroupUnpaused(block.timestamp);
    }

    // View functions with pagination support
    function getExpensesPaginated(
        uint256 _offset,
        uint256 _limit
    ) external view returns (Expense[] memory, uint256 total) {
        uint256 totalExpenses = expenseList.length;
        if (_offset >= totalExpenses) {
            return (new Expense[](0), totalExpenses);
        }

        uint256 end = _offset + _limit;
        if (end > totalExpenses) {
            end = totalExpenses;
        }

        uint256 length = end - _offset;
        Expense[] memory paginatedExpenses = new Expense[](length);

        for (uint256 i = 0; i < length; i++) {
            paginatedExpenses[i] = expenses[expenseList[_offset + i]];
        }

        return (paginatedExpenses, totalExpenses);
    }

    function getMembersPaginated(
        uint256 _offset,
        uint256 _limit
    ) external view returns (address[] memory, uint256 total) {
        uint256 totalMembers = memberList.length;
        if (_offset >= totalMembers) {
            return (new address[](0), totalMembers);
        }

        uint256 end = _offset + _limit;
        if (end > totalMembers) {
            end = totalMembers;
        }

        uint256 length = end - _offset;
        address[] memory paginatedMembers = new address[](length);

        for (uint256 i = 0; i < length; i++) {
            paginatedMembers[i] = memberList[_offset + i];
        }

        return (paginatedMembers, totalMembers);
    }

    function getBalance(address _member) external view returns (int256) {
        require(members[_member].active, "Member not found");
        return
            int256(members[_member].totalOwing) -
            int256(members[_member].totalOwed);
    }

    function getDebtTo(address _creditor) external view returns (uint256) {
        return balances[msg.sender][_creditor];
    }

    function getExpense(
        uint256 _expenseId
    ) external view validExpense(_expenseId) returns (Expense memory) {
        return expenses[_expenseId];
    }

    function getMemberInfo(
        address _member
    ) external view returns (Member memory) {
        require(members[_member].active, "Member not found");
        return members[_member];
    }

    function getGroupStats()
        external
        view
        returns (
            uint256 totalMembers,
            uint256 totalExpenses,
            uint256 totalAmount,
            uint256 totalSettlements
        )
    {
        totalMembers = memberList.length;
        totalExpenses = expenseList.length;
        totalSettlements = nextSettlementId - 1;

        for (uint256 i = 0; i < expenseList.length; i++) {
            totalAmount += expenses[expenseList[i]].totalAmount;
        }
    }

    function getSettlement(
        uint256 _settlementId
    ) external view returns (Settlement memory) {
        require(
            _settlementId > 0 && _settlementId < nextSettlementId,
            "Invalid settlement ID"
        );
        return settlements[_settlementId];
    }

    // Emergency functions
    function removeMember(
        address _member
    ) external onlyOwner validMember(_member) {
        require(_member != owner(), "Cannot remove owner");
        require(
            members[_member].totalOwed == 0 && members[_member].totalOwing == 0,
            "Member has outstanding balances"
        );

        members[_member].active = false;

        // Remove from member list efficiently
        for (uint i = 0; i < memberList.length; i++) {
            if (memberList[i] == _member) {
                memberList[i] = memberList[memberList.length - 1];
                memberList.pop();
                break;
            }
        }

        emit MemberRemoved(_member, block.timestamp);
    }

    function emergencyWithdraw() external onlyOwner {
        require(paused(), "Must be paused for emergency withdrawal");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = owner().call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }

    // Fallback function to receive ETH
    receive() external payable {
        // Allow contract to receive ETH for settlements and group payments
        // This function is called when ETH is sent directly to the contract
        // without any function call data

        // Only accept ETH from group members or during settlements
        require(
            members[msg.sender].active || msg.sender == owner(),
            "Only members can send ETH"
        );

        // Emit an event to track direct ETH deposits
        emit ETHReceived(msg.sender, msg.value, block.timestamp);

        // Optional: Could automatically distribute to members with negative balances
        // or hold for future settlements
    }

    // Event for tracking direct ETH deposits
    event ETHReceived(
        address indexed sender,
        uint256 amount,
        uint256 timestamp
    );
}
