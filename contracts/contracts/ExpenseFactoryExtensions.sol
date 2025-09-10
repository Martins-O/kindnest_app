// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ExpenseFactory.sol";

contract ExpenseFactoryExtensions {
    ExpenseFactory public immutable factory;

    struct GroupStats {
        uint256 totalGroups;
        uint256 activeGroups;
        uint256 totalMembers;
        uint256 totalExpenses;
    }

    constructor(address _factory) {
        factory = ExpenseFactory(payable(_factory));
    }

    function getAllGroupsPaginated(
        uint256 _offset,
        uint256 _limit
    ) external view returns (address[] memory groups, uint256 total) {
        address[] memory allActiveGroups = factory.getAllGroups();
        uint256 activeCount = allActiveGroups.length;

        if (_offset >= activeCount) {
            return (new address[](0), activeCount);
        }

        uint256 end = _offset + _limit;
        if (end > activeCount) {
            end = activeCount;
        }

        uint256 length = end - _offset;
        address[] memory paginatedGroups = new address[](length);

        for (uint256 i = 0; i < length; i++) {
            paginatedGroups[i] = allActiveGroups[_offset + i];
        }

        return (paginatedGroups, activeCount);
    }

    function searchGroups(
        string memory _nameQuery
    ) external view returns (address[] memory) {
        bytes memory query = bytes(_nameQuery);
        require(query.length > 0, "Empty search query");

        address[] memory allActiveGroups = factory.getAllGroups();
        address[] memory results = new address[](allActiveGroups.length);
        uint256 resultCount = 0;

        for (uint256 i = 0; i < allActiveGroups.length; i++) {
            (, string memory groupName, , , , , , , , , ) = factory.groupInfos(
                allActiveGroups[i]
            );
            bytes memory groupNameBytes = bytes(groupName);

            if (_contains(groupNameBytes, query)) {
                results[resultCount] = allActiveGroups[i];
                resultCount++;
            }
        }

        // Resize array to actual results
        assembly {
            mstore(results, resultCount)
        }

        return results;
    }

    function getUserGroupsWithInfo(
        address _user
    ) external view returns (ExpenseFactory.GroupInfo[] memory) {
        address[] memory userGroups = factory.getUserGroups(_user);
        ExpenseFactory.GroupInfo[]
            memory groupInfos = new ExpenseFactory.GroupInfo[](
                userGroups.length
            );

        for (uint256 i = 0; i < userGroups.length; i++) {
            groupInfos[i] = factory.getGroupInfo(userGroups[i]);
        }

        return groupInfos;
    }

    function getFactoryStats() external view returns (GroupStats memory) {
        address[] memory allActiveGroups = factory.getAllGroups();
        uint256 totalGroups = factory.getTotalGroupsCount();

        // For a more complete implementation, you'd need to add member counting
        // This is simplified for the extension contract
        return
            GroupStats({
                totalGroups: totalGroups,
                activeGroups: allActiveGroups.length,
                totalMembers: 0, // Would need additional tracking
                totalExpenses: 0 // Would need additional tracking
            });
    }

    function _contains(
        bytes memory _text,
        bytes memory _query
    ) internal pure returns (bool) {
        if (_query.length > _text.length) return false;

        for (uint256 i = 0; i <= _text.length - _query.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < _query.length; j++) {
                if (_text[i + j] != _query[j]) {
                    found = false;
                    break;
                }
            }
            if (found) return true;
        }
        return false;
    }
}
