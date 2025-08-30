'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { useEffect, useState } from 'react';
import { CONTRACTS, EXPENSE_FACTORY_ABI, GROUP_TREASURY_ABI } from './contracts';
import { shortenAddress } from './utils';
import { groupSync } from './groupSync';
import type { GroupInfo, Expense, Member } from '@/types';

// Factory hooks
export function useCreateGroup() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createGroup = (name: string, creatorNickname: string) => {
    writeContract({
      address: CONTRACTS.EXPENSE_FACTORY,
      abi: EXPENSE_FACTORY_ABI,
      functionName: 'createGroup',
      args: [name, creatorNickname],
    } as any);
  };

  return {
    createGroup,
    hash,
    isPending,
    isConfirming,
    isSuccess,
  };
}

export function useUserGroups(userAddress?: string) {
  const result = useReadContract({
    address: CONTRACTS.EXPENSE_FACTORY,
    abi: EXPENSE_FACTORY_ABI,
    functionName: 'getUserGroups',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000, // More aggressive refetching every 5 seconds
      staleTime: 2000, // Consider data stale after 2 seconds
      retry: 3, // Retry failed requests 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
  });

  // Set up cross-tab sync for this user
  useEffect(() => {
    if (userAddress && result.refetch) {
      groupSync.onUserGroupsChange(userAddress, result.refetch);
      
      return () => {
        groupSync.removeListener(userAddress);
      };
    }
  }, [userAddress, result.refetch]);

  return result;
}

// Enhanced hook that combines user groups with event listening
export function useUserGroupsWithEventListener(userAddress?: string) {
  const { data, isLoading, error, refetch } = useUserGroups(userAddress);

  // Listen for GroupCreated events - new groups might mean this user was added
  useWatchContractEvent({
    address: CONTRACTS.EXPENSE_FACTORY,
    abi: EXPENSE_FACTORY_ABI,
    eventName: 'GroupCreated',
    enabled: !!userAddress,
    onLogs(logs) {
      console.log('📡 New group created, checking for membership changes:', logs);
      // Refetch after a short delay to allow blockchain state to sync
      setTimeout(() => {
        console.log('🔄 Auto-refetching user groups after GroupCreated event');
        refetch();
      }, 3000);
    },
  });

  return { data, isLoading, error, refetch };
}

export function useGroupInfo(groupAddress?: string) {
  return useReadContract({
    address: CONTRACTS.EXPENSE_FACTORY,
    abi: EXPENSE_FACTORY_ABI,
    functionName: 'getGroupInfo',
    args: groupAddress ? [groupAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!groupAddress,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 30000, // Cache for 30 seconds
    },
  });
}

// Group Treasury hooks
export function useGroupExpenses(groupAddress?: string, offset = 0, limit = 10) {
  return useReadContract({
    address: groupAddress as `0x${string}`,
    abi: GROUP_TREASURY_ABI,
    functionName: 'getExpensesPaginated',
    args: [BigInt(offset), BigInt(limit)],
    query: {
      enabled: !!groupAddress,
    },
  });
}

export function useGroupMembers(groupAddress?: string, offset = 0, limit = 20) {
  return useReadContract({
    address: groupAddress as `0x${string}`,
    abi: GROUP_TREASURY_ABI,
    functionName: 'getMembersPaginated',
    args: [BigInt(offset), BigInt(limit)],
    query: {
      enabled: !!groupAddress,
    },
  });
}

export function useGroupName(groupAddress?: string) {
  return useReadContract({
    address: groupAddress as `0x${string}`,
    abi: GROUP_TREASURY_ABI,
    functionName: 'groupName',
    query: {
      enabled: !!groupAddress,
    },
  });
}

export function useMemberInfo(groupAddress?: string, memberAddress?: string) {
  return useReadContract({
    address: groupAddress as `0x${string}`,
    abi: GROUP_TREASURY_ABI,
    functionName: 'getMemberInfo',
    args: memberAddress ? [memberAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!(groupAddress && memberAddress),
      retry: false, // Don't retry on revert
    },
  });
}

export function useMemberBalance(groupAddress?: string, memberAddress?: string) {
  return useReadContract({
    address: groupAddress as `0x${string}`,
    abi: GROUP_TREASURY_ABI,
    functionName: 'getBalance',
    args: memberAddress ? [memberAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!(groupAddress && memberAddress),
      retry: false, // Don't retry on revert
    },
  });
}

export function useDebtTo(groupAddress?: string, creditorAddress?: string) {
  return useReadContract({
    address: groupAddress as `0x${string}`,
    abi: GROUP_TREASURY_ABI,
    functionName: 'getDebtTo',
    args: creditorAddress ? [creditorAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!(groupAddress && creditorAddress),
    },
  });
}

// Helper hook to check if user is a member by checking the members list
export function useIsMember(groupAddress?: string, userAddress?: string) {
  const { data: membersData } = useGroupMembers(groupAddress);
  const members = membersData ? membersData[0] : [];
  
  if (!userAddress || !members) return false;
  
  return members.some(member => member.toLowerCase() === userAddress.toLowerCase());
}

// Helper hook to get member nickname
export function useMemberNickname(groupAddress?: string, memberAddress?: string) {
  const { data: memberInfo } = useMemberInfo(groupAddress, memberAddress);
  return memberInfo?.nickname || shortenAddress(memberAddress || '');
}

export function useCreationFee() {
  return useReadContract({
    address: CONTRACTS.EXPENSE_FACTORY,
    abi: EXPENSE_FACTORY_ABI,
    functionName: 'creationFee',
  });
}

export function useDeactivateGroup() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const deactivateGroup = (groupAddress: string) => {
    writeContract({
      address: CONTRACTS.EXPENSE_FACTORY,
      abi: EXPENSE_FACTORY_ABI,
      functionName: 'deactivateGroup',
      args: [groupAddress as `0x${string}`],
    } as any);
  };

  return {
    deactivateGroup,
    hash,
    isPending,
    isConfirming,
    isSuccess,
  };
}

// Write functions
export function useAddMember(groupAddress: string) {
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  const [lastAddedMember, setLastAddedMember] = useState<string | null>(null);
  const [lastAddedNickname, setLastAddedNickname] = useState<string | null>(null);

  const addMember = (memberAddress: string, nickname: string) => {
    setLastAddedMember(memberAddress);
    setLastAddedNickname(nickname);
    writeContract({
      address: groupAddress as `0x${string}`,
      abi: GROUP_TREASURY_ABI,
      functionName: 'addMember',
      args: [memberAddress as `0x${string}`, nickname],
    } as any);
  };

  // Trigger sync notification when member is successfully added
  useEffect(() => {
    if (isSuccess && lastAddedMember && hash) {
      console.log('✅ Member addition confirmed, triggering sync:', {
        member: lastAddedMember,
        nickname: lastAddedNickname,
        group: groupAddress,
        hash
      });
      
      // Notify all tabs that this user has been added to the group
      groupSync.notifyMemberAdded(lastAddedMember, groupAddress);
      setLastAddedMember(null);
      setLastAddedNickname(null);
    }
  }, [isSuccess, lastAddedMember, lastAddedNickname, groupAddress, hash]);

  const error = writeError || receiptError;

  return {
    addMember,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    lastAddedMember,
    lastAddedNickname,
  };
}

export function useAddExpense(groupAddress: string) {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const addExpense = (description: string, amount: bigint, participants: string[], receiptHash: string = '0x0000000000000000000000000000000000000000000000000000000000000000') => {
    writeContract({
      address: groupAddress as `0x${string}`,
      abi: GROUP_TREASURY_ABI,
      functionName: 'addExpense',
      args: [description, amount, participants.map(p => p as `0x${string}`), receiptHash as `0x${string}`],
    } as any);
  };

  return {
    addExpense,
    hash,
    isPending,
    isConfirming,
    isSuccess,
  };
}

export function useSettleDebt(groupAddress: string) {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const settleDebt = (creditorAddress: string, amount: bigint) => {
    writeContract({
      address: groupAddress as `0x${string}`,
      abi: GROUP_TREASURY_ABI,
      functionName: 'settleDebt',
      args: [creditorAddress as `0x${string}`],
      value: amount,
    } as any);
  };

  return {
    settleDebt,
    hash,
    isPending,
    isConfirming,
    isSuccess,
  };
}