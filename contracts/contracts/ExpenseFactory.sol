// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GroupTreasury.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ExpenseFactory is Ownable, ReentrancyGuard {
    struct GroupInfo {
        address groupAddress;
        string name;
        address creator;
        uint256 createdAt;
        bool active;
    }

    mapping(address => address[]) private userGroups;
    mapping(address => GroupInfo) public groupInfos;
    address[] private allGroups;

    uint256 public maxGroupsPerUser = 10;
    uint256 public creationFee = 0;

    event GroupCreated(
        address indexed group,
        address indexed creator,
        string name,
        uint256 timestamp
    );
    event GroupDeactivated(address indexed group, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    function createGroup(
        string memory _name,
        string memory _creatorNickname
    ) external payable nonReentrant returns (address) {
        require(
            bytes(_name).length > 0 && bytes(_name).length <= 50,
            "Invalid name"
        );
        require(
            bytes(_creatorNickname).length > 0 &&
                bytes(_creatorNickname).length <= 32,
            "Invalid nickname"
        );
        require(msg.value >= creationFee, "Insufficient fee");
        require(
            userGroups[msg.sender].length < maxGroupsPerUser,
            "Max groups reached"
        );

        GroupTreasury newGroup = new GroupTreasury(
            _name,
            msg.sender,
            _creatorNickname
        );
        address groupAddress = address(newGroup);

        groupInfos[groupAddress] = GroupInfo({
            groupAddress: groupAddress,
            name: _name,
            creator: msg.sender,
            createdAt: block.timestamp,
            active: true
        });

        userGroups[msg.sender].push(groupAddress);
        allGroups.push(groupAddress);

        if (msg.value > creationFee) {
            (bool success, ) = msg.sender.call{value: msg.value - creationFee}(
                ""
            );
            require(success, "Refund failed");
        }

        emit GroupCreated(groupAddress, msg.sender, _name, block.timestamp);
        return groupAddress;
    }

    function addUserToGroup(address _user, address _groupAddress) external {
        require(msg.sender == _groupAddress, "Only group can add users");
        require(groupInfos[_groupAddress].active, "Group inactive");

        address[] storage currentGroups = userGroups[_user];
        for (uint256 i = 0; i < currentGroups.length; i++) {
            if (currentGroups[i] == _groupAddress) return; // Already member
        }

        require(currentGroups.length < maxGroupsPerUser, "Max groups reached");
        userGroups[_user].push(_groupAddress);
    }

    function deactivateGroup(address _groupAddress) external {
        require(
            msg.sender == groupInfos[_groupAddress].creator ||
                msg.sender == _groupAddress ||
                msg.sender == owner(),
            "Not authorized"
        );
        groupInfos[_groupAddress].active = false;
        emit GroupDeactivated(_groupAddress, block.timestamp);
    }

    function getUserGroups(
        address _user
    ) external view returns (address[] memory) {
        address[] memory userGroupAddresses = userGroups[_user];
        uint256 activeCount = 0;

        for (uint256 i = 0; i < userGroupAddresses.length; i++) {
            if (groupInfos[userGroupAddresses[i]].active) activeCount++;
        }

        address[] memory activeGroups = new address[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < userGroupAddresses.length; i++) {
            if (groupInfos[userGroupAddresses[i]].active) {
                activeGroups[index++] = userGroupAddresses[i];
            }
        }
        return activeGroups;
    }

    function getGroupInfo(
        address _groupAddress
    ) external view returns (GroupInfo memory) {
        require(groupInfos[_groupAddress].active, "Group inactive");
        return groupInfos[_groupAddress];
    }

    function getAllGroups() external view returns (address[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allGroups.length; i++) {
            if (groupInfos[allGroups[i]].active) activeCount++;
        }

        address[] memory activeGroups = new address[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allGroups.length; i++) {
            if (groupInfos[allGroups[i]].active) {
                activeGroups[index++] = allGroups[i];
            }
        }
        return activeGroups;
    }

    function setCreationFee(uint256 _newFee) external onlyOwner {
        creationFee = _newFee;
    }

    function setMaxGroupsPerUser(uint256 _newMax) external onlyOwner {
        require(_newMax > 0 && _newMax <= 100, "Invalid max");
        maxGroupsPerUser = _newMax;
    }

    function withdrawFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees");
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function getTotalGroupsCount() external view returns (uint256) {
        return allGroups.length;
    }

    receive() external payable {}
}
