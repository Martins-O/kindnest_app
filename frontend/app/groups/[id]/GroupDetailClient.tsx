'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Users, Receipt, HandHeart, UserPlus, Wallet, CreditCard, FileText, ChevronLeft, ChevronRight, Trash2, AlertTriangle, Heart, Leaf, DollarSign } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  useGroupExpenses, 
  useGroupMembers, 
  useGroupName, 
  useMemberInfo,
  useMemberBalance,
  useAddMember,
  useAddExpense,
  useSettleDebt,
  useDebtTo,
  useIsMember,
  useMemberNickname,
  useDeactivateGroup,
  useGroupInfo
} from '@/lib/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatETH, parseETH, shortenAddress, formatDateTime } from '@/lib/utils';

// Component to display member with nickname
function MemberDisplay({ groupAddress, memberAddress, showYou = false }: { 
  groupAddress: string; 
  memberAddress: string; 
  showYou?: boolean;
}) {
  const nickname = useMemberNickname(groupAddress, memberAddress);
  const { address } = useAccount();
  
  return (
    <div>
      <div className="text-white font-medium">{nickname}</div>
      <div className="text-white/70 text-sm">{shortenAddress(memberAddress)}</div>
      {showYou && memberAddress === address && (
        <div className="text-kindnest-400 text-sm font-medium flex items-center gap-1">
          <Heart className="h-3 w-3" />
          You
        </div>
      )}
    </div>
  );
}

// Component for select option with nickname
function MemberOption({ groupAddress, memberAddress }: { 
  groupAddress: string; 
  memberAddress: string; 
}) {
  const nickname = useMemberNickname(groupAddress, memberAddress);
  
  return (
    <option value={memberAddress} className="bg-gray-800">
      {nickname} ({shortenAddress(memberAddress)})
    </option>
  );
}

// Component to display "Paid by" with nickname
function PaidByDisplay({ groupAddress, paidBy }: { 
  groupAddress: string; 
  paidBy: string; 
}) {
  const nickname = useMemberNickname(groupAddress, paidBy);
  
  return (
    <div className="flex items-center gap-2">
      <span>💝 Covered by:</span>
      <span className="text-white/90">{nickname}</span>
    </div>
  );
}

// Component to display receipt hash if available
function ReceiptHashDisplay({ receiptHash }: { receiptHash: string }) {
  const isEmptyHash = receiptHash === '0x0000000000000000000000000000000000000000000000000000000000000000';
  
  if (isEmptyHash) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-2">
      <FileText className="h-3 w-3" />
      <span>Receipt:</span>
      <span className="text-white/90 font-mono text-xs">
        {receiptHash.slice(0, 8)}...{receiptHash.slice(-6)}
      </span>
    </div>
  );
}

// Pagination component
function PaginationControls({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  label 
}: { 
  currentPage: number; 
  totalItems: number; 
  itemsPerPage: number; 
  onPageChange: (page: number) => void;
  label: string;
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-kindnest-500/20">
      <p className="text-white/60 text-sm">
        Showing {currentPage * itemsPerPage + 1}-{Math.min((currentPage + 1) * itemsPerPage, totalItems)} of {totalItems} {label}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="bg-kindnest-500/10 text-white border-kindnest-400/30 hover:bg-kindnest-500/20 disabled:opacity-50 transition-all duration-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-white/80 text-sm mx-2">
          Page {currentPage + 1} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="bg-kindnest-500/10 text-white border-kindnest-400/30 hover:bg-kindnest-500/20 disabled:opacity-50 transition-all duration-200"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function GroupDetailClient({ groupAddress }: { groupAddress: string }) {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [memberAddress, setMemberAddress] = useState('');
  const [memberNickname, setMemberNickname] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSettleDebt, setShowSettleDebt] = useState(false);
  const [settleToAddress, setSettleToAddress] = useState('');
  const [settleAmount, setSettleAmount] = useState('');
  const [receiptHash, setReceiptHash] = useState('');
  const [expensesPage, setExpensesPage] = useState(0);
  const [membersPage, setMembersPage] = useState(0);
  const expensesLimit = 5;
  const membersLimit = 10;
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Data hooks
  const { data: groupName } = useGroupName(groupAddress);
  const { data: expensesData, refetch: refetchExpenses } = useGroupExpenses(groupAddress, expensesPage * expensesLimit, expensesLimit);
  const { data: membersData, refetch: refetchMembers } = useGroupMembers(groupAddress, membersPage * membersLimit, membersLimit);
  const { data: memberInfo } = useMemberInfo(groupAddress, address);
  const { data: balance } = useMemberBalance(groupAddress, address);
  const isMember = useIsMember(groupAddress, address);
  const { data: groupInfo } = useGroupInfo(groupAddress);

  // Extract data from paginated responses
  const expenses = expensesData ? expensesData[0] : [];
  const totalExpenses = expensesData ? Number(expensesData[1]) : 0;
  const members = membersData ? membersData[0] : [];
  const totalMembers = membersData ? Number(membersData[1]) : 0;

  // Write hooks
  const { 
    addMember, 
    isPending: addingMember, 
    isSuccess: memberAdded, 
    hash: addMemberHash,
    error: addMemberError,
    lastAddedMember,
    lastAddedNickname
  } = useAddMember(groupAddress);
  const { addExpense, isPending: addingExpense, isSuccess: expenseAdded } = useAddExpense(groupAddress);
  const { settleDebt, isPending: settlingDebt, isSuccess: debtSettled } = useSettleDebt(groupAddress);
  const { deactivateGroup, isPending: deactivating, isSuccess: groupDeactivated } = useDeactivateGroup();

  useEffect(() => {
    setIsLoaded(true);
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  useEffect(() => {
    // Member addition status tracking
    
    // Handle successful member addition
    if (memberAdded && addMemberHash) {
      // Member added successfully
      setShowAddMember(false);
      setMemberAddress('');
      setMemberNickname('');
      setErrorMessage(null); // Clear any previous errors
      refetchMembers();
      
      // Show success message
      setErrorMessage(`✅ ${lastAddedNickname || 'Member'} has been invited to the nest!`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
    
    // Handle errors
    if (addMemberError) {
      // console.error('❌ Member addition failed:', addMemberError);
      let errorMsg = 'Failed to add member. ';
      
      if (addMemberError.message?.includes('OnlyOwner')) {
        errorMsg += 'Only the group owner can invite new members.';
      } else if (addMemberError.message?.includes('revert')) {
        errorMsg += 'Transaction was rejected by the contract.';
      } else {
        errorMsg += 'Please try again or check your connection.';
      }
      
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(null), 8000);
    }
  }, [addingMember, memberAdded, addMemberHash, addMemberError, lastAddedMember, lastAddedNickname, refetchMembers]);

  useEffect(() => {
    if (expenseAdded) {
      setShowAddExpense(false);
      setExpenseDescription('');
      setExpenseAmount('');
      setSelectedParticipants([]);
      setReceiptHash('');
      refetchExpenses();
      refetchMembers();
    }
  }, [expenseAdded, refetchExpenses, refetchMembers]);

  useEffect(() => {
    if (debtSettled) {
      setShowSettleDebt(false);
      setSettleToAddress('');
      setSettleAmount('');
      refetchMembers();
    }
  }, [debtSettled, refetchMembers]);

  useEffect(() => {
    if (groupDeactivated) {
      router.push('/dashboard');
    }
  }, [groupDeactivated, router]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get member nicknames for display
  const getMemberNicknames = async () => {
    if (!members) return {};
    const nicknames: { [address: string]: string } = {};
    // This would need to be implemented with batch calls or stored locally
    return nicknames;
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberAddress.trim() && memberNickname.trim()) {
      addMember(memberAddress.trim(), memberNickname.trim());
    } else {
      setErrorMessage('Please enter both member address and nickname');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseDescription.trim() && expenseAmount && selectedParticipants.length > 0) {
      try {
        const amount = parseETH(expenseAmount);
        const hashToUse = receiptHash.trim() || '0x0000000000000000000000000000000000000000000000000000000000000000';
        addExpense(expenseDescription.trim(), amount, selectedParticipants, hashToUse);
      } catch (error) {
        setErrorMessage('Invalid expense amount. Please enter a valid number.');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    }
  };

  const toggleParticipant = (memberAddress: string) => {
    setSelectedParticipants(prev => 
      prev.includes(memberAddress) 
        ? prev.filter(addr => addr !== memberAddress)
        : [...prev, memberAddress]
    );
  };

  const handleSettleDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (settleToAddress.trim() && settleAmount) {
      try {
        const amount = parseETH(settleAmount);
        settleDebt(settleToAddress.trim(), amount);
      } catch (error) {
        setErrorMessage('Invalid settlement amount. Please enter a valid number.');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    }
  };

  const handleDeactivateGroup = () => {
    if (groupAddress) {
      deactivateGroup(groupAddress);
    }
  };

  // Check if user is the group creator/admin
  const isGroupAdmin = groupInfo?.creator === address;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10 max-w-md mx-auto text-center">
          <Wallet className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-white/70 mb-8">Connect your Web3 wallet to access this group</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  const isGroupMember = isMember;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 overflow-hidden">
      {/* Animated background elements */}
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-10 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
          </div>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className={`transition-all duration-1000 ${isMounted && isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Your Nests
              </Button>
              {isGroupAdmin && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDeactivateConfirm(true)}
                  className="bg-red-500/10 text-red-400 border-red-400/20 hover:bg-red-500/20 backdrop-blur-sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Close Nest
                </Button>
              )}
            </div>
            <ConnectButton />
          </div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <Users className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-white/90 text-sm font-medium">
                Group: {shortenAddress(groupAddress)}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-4">
              {groupName || 'Loading...'}
            </h1>
            <p className="text-xl text-white/70">
              Manage expenses and track balances for your group
            </p>
          </div>
        </div>

        {/* Error/Success Message */}
        {errorMessage && (
          <div className={`mb-8 transition-all duration-500 ${
            errorMessage.startsWith('✅') 
              ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-500/30' 
              : 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/30'
          } backdrop-blur-lg rounded-2xl p-6 border`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                errorMessage.startsWith('✅') ? 'bg-emerald-500' : 'bg-red-500'
              }`}>
                {errorMessage.startsWith('✅') ? (
                  <Heart className="h-4 w-4 text-white" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-white" />
                )}
              </div>
              <p className="text-white font-medium">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Balance Card */}
        {isGroupMember && balance !== undefined && (
          <div className="mb-12">
            <div className={`bg-gradient-to-br ${Number(balance) >= 0 ? 'from-emerald-500/20 to-teal-500/20' : 'from-red-500/20 to-pink-500/20'} backdrop-blur-lg rounded-3xl p-8 border border-white/10`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Your Balance</h3>
                  <p className={`text-4xl font-black mb-3 ${Number(balance) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {Number(balance) >= 0 ? '+' : ''}
                    {formatETH(BigInt(balance.toString()))} ETH
                  </p>
                  <p className="text-white/70 text-lg">
                    {Number(balance) >= 0 ? '💝 Support flowing to you' : '🤲 You can contribute'}
                  </p>
                </div>
                <div className={`w-20 h-20 ${Number(balance) >= 0 ? 'bg-emerald-500' : 'bg-red-500'} rounded-2xl flex items-center justify-center`}>
                  <HandHeart className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {isGroupMember && (
          <div className="grid gap-4 sm:gap-6 mb-12" style={{
            gridTemplateColumns: `repeat(${
              (isGroupAdmin ? 1 : 0) + 1 + (balance && Number(balance) < 0 ? 1 : 0)
            }, 1fr)`
          }}>
            {/* Only show Invite Someone button to group owner */}
            {isGroupAdmin && (
              <div 
                onClick={() => setShowAddMember(true)}
                className="group cursor-pointer transition-all duration-300 hover:scale-105"
              >
                <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Invite Someone</h3>
                      <p className="text-white/70">Grow your nest with care</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div 
              onClick={() => setShowAddExpense(true)}
              className="group cursor-pointer transition-all duration-300 hover:scale-105"
            >
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Share a Cost</h3>
                    <p className="text-white/70">Record something that needs support</p>
                  </div>
                </div>
              </div>
            </div>

            {balance && Number(balance) < 0 && (
              <div 
                onClick={() => setShowSettleDebt(true)}
                className="group cursor-pointer transition-all duration-300 hover:scale-105"
              >
                <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Contribute Kindly</h3>
                      <p className="text-white/70">Share what you can</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Invite Member Form */}
        {showAddMember && (
          <div className="mb-12 transition-all duration-500 ease-out">
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Add Group Member</h2>
              </div>
              
              <form onSubmit={handleAddMember} className="space-y-6">
                <div>
                  <label className="block text-white/90 font-medium mb-3">Wallet Address</label>
                  <Input
                    value={memberAddress}
                    onChange={(e) => setMemberAddress(e.target.value)}
                    placeholder="0x..."
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/90 font-medium mb-3">Nickname</label>
                  <Input
                    value={memberNickname}
                    onChange={(e) => setMemberNickname(e.target.value)}
                    placeholder="How should this person appear in the group?"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    loading={addingMember}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0"
                  >
                    {addingMember ? 'Inviting...' : 'Send Invitation'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddMember(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Settle Debt Form */}
        {showSettleDebt && (
          <div className="mb-12 transition-all duration-500 ease-out">
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Settle Your Debt</h2>
              </div>
              
              <form onSubmit={handleSettleDebt} className="space-y-6">
                <div>
                  <label className="block text-white/90 font-medium mb-3">Pay To (Member Address)</label>
                  <select
                    value={settleToAddress}
                    onChange={(e) => setSettleToAddress(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:border-white/40 focus:outline-none"
                    required
                  >
                    <option value="" className="bg-gray-800">Select a member to pay</option>
                    {members?.filter(member => member !== address).map((memberAddr) => (
                      <MemberOption 
                        key={memberAddr} 
                        groupAddress={groupAddress} 
                        memberAddress={memberAddr} 
                      />
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/90 font-medium mb-3">Amount (ETH)</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    placeholder="0.1"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    loading={settlingDebt}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0"
                  >
                    {settlingDebt ? 'Settling...' : 'Settle Debt'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowSettleDebt(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Expense Form */}
        {showAddExpense && (
          <div className="mb-12 transition-all duration-500 ease-out">
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Add New Expense</h2>
              </div>
              
              <form onSubmit={handleAddExpense} className="space-y-6">
                <div>
                  <label className="block text-white/90 font-medium mb-3">Description</label>
                  <Input
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    placeholder="e.g., Dinner, Gas, Hotel"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/90 font-medium mb-3">Amount (ETH)</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="0.1"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/90 font-medium mb-3">Receipt Hash (Optional)</label>
                  <Input
                    value={receiptHash}
                    onChange={(e) => setReceiptHash(e.target.value)}
                    placeholder="0x... (optional IPFS hash or transaction hash)"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40"
                  />
                  <p className="text-white/50 text-sm mt-1">Optional: Add a hash reference to receipt documentation</p>
                </div>
                <div>
                  <label className="block text-white/90 font-medium mb-3">Participants</label>
                  <div className="space-y-3">
                    {members?.map((memberAddr) => (
                      <div key={memberAddr} className="flex items-center space-x-3 bg-white/5 rounded-xl p-3 border border-white/10">
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(memberAddr)}
                          onChange={() => toggleParticipant(memberAddr)}
                          className="w-5 h-5 rounded accent-purple-500"
                        />
                        <div className="flex-1">
                          <MemberDisplay 
                            groupAddress={groupAddress} 
                            memberAddress={memberAddr} 
                            showYou={true}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    loading={addingExpense}
                    disabled={selectedParticipants.length === 0}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0"
                  >
                    {addingExpense ? 'Adding...' : 'Add Expense'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddExpense(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Deactivate Group Confirmation */}
        {showDeactivateConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/10 max-w-md w-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Deactivate Group</h2>
                  <p className="text-white/70">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-white/90 mb-2">
                    <strong>Warning:</strong> Deactivating this group will:
                  </p>
                  <ul className="text-white/70 text-sm space-y-1 ml-4">
                    <li>• Make the group inactive and inaccessible</li>
                    <li>• Prevent new expenses from being added</li>
                    <li>• Hide the group from member dashboards</li>
                    <li>• This action is permanent and cannot be reversed</li>
                  </ul>
                </div>
                
                <p className="text-white/80">
                  Are you sure you want to deactivate &quot;{groupName}&quot;?
                </p>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={handleDeactivateGroup}
                  loading={deactivating}
                  className="bg-red-500 hover:bg-red-600 text-white border-0 flex-1"
                >
                  {deactivating ? 'Deactivating...' : 'Yes, Deactivate Group'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeactivateConfirm(false)}
                  className="border-kindnest-400/30 text-white hover:bg-kindnest-500/10 flex-1 transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Members & Expenses */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Members */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-kindnest-500 to-kindnest-600 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Members ({members?.length || 0})</h2>
            </div>
            
            <div className="space-y-4">
              {members?.map((memberAddr, index) => (
                <div 
                  key={memberAddr} 
                  className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-kindnest-500/20 hover:bg-kindnest-500/10 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-kindnest-400 to-kindnest-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">
                          {shortenAddress(memberAddr).slice(0, 2)}
                        </span>
                      </div>
                      <MemberDisplay 
                        groupAddress={groupAddress} 
                        memberAddress={memberAddr} 
                        showYou={true}
                      />
                    </div>
                    <div className="w-2 h-2 bg-kindnest-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
              
              {(!members || members.length === 0) && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-white/40 mx-auto mb-3" />
                  <p className="text-white/60">No members yet</p>
                </div>
              )}
            </div>
            
            <PaginationControls
              currentPage={membersPage}
              totalItems={totalMembers}
              itemsPerPage={membersLimit}
              onPageChange={setMembersPage}
              label="members"
            />
          </div>

          {/* Expenses */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Expenses ({expenses?.length || 0})</h2>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {expenses && expenses.length > 0 ? (
                expenses.map((expense, index) => (
                  <div 
                    key={expense.id.toString()}
                    className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-white font-medium">{expense.description}</div>
                        <div className="text-orange-400 font-bold">{formatETH(expense.totalAmount)} ETH</div>
                      </div>
                      <div className="space-y-1 text-sm text-white/70">
                        <PaidByDisplay 
                          groupAddress={groupAddress} 
                          paidBy={expense.paidBy} 
                        />
                        <div className="flex items-center gap-2">
                          <span>📅 Date:</span>
                          <span className="text-white/90">{formatDateTime(expense.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>👥 Participants:</span>
                          <span className="text-white/90">{expense.participants.length}</span>
                        </div>
                        <ReceiptHashDisplay receiptHash={expense.receiptHash} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-white/40 mx-auto mb-3" />
                  <p className="text-white/60">No expenses yet</p>
                  <p className="text-white/50 text-sm">Add your first expense to get started</p>
                </div>
              )}
            </div>
            
            <PaginationControls
              currentPage={expensesPage}
              totalItems={totalExpenses}
              itemsPerPage={expensesLimit}
              onPageChange={setExpensesPage}
              label="expenses"
            />
          </div>
        </div>

        {!isGroupMember && (
          <div className="text-center py-16">
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10 max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Users className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Not a Member Yet</h3>
              <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
                You&apos;re not a member of this group. Ask the group admin to add you as a member to participate in expense splitting.
              </p>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-white/60 text-sm">
                  💡 Share this group address with the admin: <br />
                  <span className="font-mono text-white/80">{shortenAddress(groupAddress)}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}