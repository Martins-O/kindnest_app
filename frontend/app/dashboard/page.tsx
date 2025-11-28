'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { useAAWalletContext } from '@/components/auth/AAWalletProvider';
import { Plus, Users, Receipt, Wallet, HandHeart, RefreshCw, Heart, Leaf, Copy, Compass, Search } from 'lucide-react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useUserGroups, useUserGroupsWithEventListener, useCreateGroup, useGroupInfo, useCreationFee, useMemberInfo, useMemberBalance, useIsMember } from '@/lib/hooks';
import { groupSync } from '@/lib/groupSync';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api';
import { formatDate, shortenAddress, formatETH } from '@/lib/utils';
import { NetworkTest } from '@/components/NetworkTest';
import { SmartWallet } from '@/components/SmartWallet';
import { GroupWallet } from '@/components/GroupWallet';
import { GroupTemplateSelector } from '@/components/GroupTemplateSelector';
import { TemplateGroupCreator } from '@/components/TemplateGroupCreator';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated, loading, user } = useCustomAuth();
  const { smartAccountAddress } = useAAWalletContext();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [groupName, setGroupName] = useState('');
  const [nickname, setNickname] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('custom');
  const [privacy, setPrivacy] = useState('public');
  const [maxMembers, setMaxMembers] = useState('50');
  const [contributionFrequency, setContributionFrequency] = useState('as-needed');
  const [minimumContribution, setMinimumContribution] = useState('0.01');
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState({ city: '', region: '', country: '' });
  const [guidelines, setGuidelines] = useState('');

  // Use either traditional wallet address or smart account address
  // For email users, use their smart account address from the user object
  const userAddress = smartAccountAddress || address || user?.smartAccountAddress;
  const { data: userGroupAddresses, isLoading: groupsLoading, refetch: refetchGroups, error: groupsError } = useUserGroups(userAddress);

  // Debug logging removed for production security
  const { createGroup, isPending, isConfirming, isSuccess } = useCreateGroup();
  const { data: creationFee } = useCreationFee();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    console.log('🔍 Dashboard auth check:', { loading, isConnected, isAuthenticated, user: !!user });
    // Only redirect if user is neither wallet-connected nor email-authenticated
    // AND we're not still loading (to prevent premature redirects)
    if (!loading && !isConnected && !isAuthenticated) {
      console.log('🔍 Dashboard: Redirecting to sign-in (no auth)');
      router.push('/');
    } else if (!loading && (isConnected || isAuthenticated)) {
      console.log('🔍 Dashboard: User is authenticated, staying on dashboard');
    }
  }, [isConnected, isAuthenticated, loading, router, user]);

  const resetForm = () => {
    setGroupName('');
    setNickname('');
    setDescription('');
    setCategory('custom');
    setPrivacy('public');
    setMaxMembers('50');
    setContributionFrequency('as-needed');
    setMinimumContribution('0.01');
    setTags('');
    setLocation({ city: '', region: '', country: '' });
    setGuidelines('');
  };

  useEffect(() => {
    if (isSuccess) {
      setShowCreateGroup(false);
      setShowTemplateSelector(false);
      setSelectedTemplate(null);
      resetForm();
      refetchGroups();
    }
  }, [isSuccess, refetchGroups]);

  // Set up cross-tab dashboard sync
  useEffect(() => {
    if (address && refetchGroups) {
      // Setting up dashboard sync
      groupSync.onDashboardChange(refetchGroups);
      
      return () => {
        // Cleaning up dashboard sync
        groupSync.removeListener('dashboard-refresh');
      };
    }
  }, [address, refetchGroups]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !nickname.trim()) return;
    
    try {
      // Parse minimum contribution to wei (assuming input is in ETH)
      const minContributionWei = parseFloat(minimumContribution) * 1e18;
      
      // Create blockchain group first with all parameters
      createGroup(
        groupName.trim(), 
        nickname.trim(),
        description.trim(),
        category,
        privacy,
        parseInt(maxMembers),
        Math.floor(minContributionWei),
        contributionFrequency
      );
      
      // Note: We'll save to database after blockchain transaction succeeds
      // This is handled in the success useEffect above via API call
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  // Create database entry after blockchain success
  const saveToDatabaseAfterBlockchainSuccess = async () => {
    if (!userAddress || !groupName) return;
    
    try {
      const groupData = {
        name: groupName.trim(),
        description: description.trim(),
        contractAddress: 'pending', // Will be updated with actual address
        creator: {
          address: userAddress,
          email: user?.email,
          nickname: nickname.trim()
        },
        template: {
          category: category
        },
        settings: {
          privacy: privacy as 'public' | 'private' | 'invite-only',
          maxMembers: parseInt(maxMembers),
          contributionFrequency: contributionFrequency,
          minimumContribution: minimumContribution,
          autoApproveMembers: privacy === 'public'
        },
        guidelines: guidelines.split('\n').filter(g => g.trim()),
        tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t),
        location: location.city ? location : undefined,
        members: [{
          address: userAddress,
          nickname: nickname.trim(),
          role: 'admin',
          joinedAt: new Date().toISOString(),
          status: 'active'
        }]
      };
      
      await apiClient.createGroup(groupData);
    } catch (error) {
      console.error('Error saving group to database:', error);
    }
  };

  const handleTemplateGroupCreate = (groupData: {
    name: string;
    creatorNickname: string;
    template: any;
    customizations: any;
  }) => {
    // Extract template data or use defaults
    const templateCategory = groupData.template?.category || 'custom';
    const templatePrivacy = groupData.customizations?.privacy || 'public';
    const templateMaxMembers = groupData.customizations?.maxMembers || 50;
    const templateMinContribution = parseFloat(groupData.customizations?.minimumContribution || '0.01') * 1e18;
    const templateFrequency = groupData.customizations?.contributionFrequency || 'as-needed';
    const templateDescription = groupData.customizations?.description || '';

    // Create group with template data
    createGroup(
      groupData.name, 
      groupData.creatorNickname,
      templateDescription,
      templateCategory,
      templatePrivacy,
      templateMaxMembers,
      Math.floor(templateMinContribution),
      templateFrequency
    );
  };

  // Show loading screen while authentication status is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  // Only show connect prompt if user is neither wallet-connected nor email-authenticated
  if (!isConnected && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 bg-white/5 backdrop-blur-lg border-white/10">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4 text-white">Please connect your wallet</h2>
            <div className="text-center flex flex-col items-center gap-4">
              <w3m-button />
              <p className="text-white/60 text-sm">
                Or sign up with email for gasless transactions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-spin"></div>
          <div className="text-slate-600 font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="dashboard-card mb-12 p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-black">
                <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Your</span>
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent"> Support Circles</span>
              </h1>
              <p className="text-slate-600 text-lg">Manage your communities of care and mutual support</p>
              {userAddress && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Connected as {userAddress.slice(0, 6)}...{userAddress.slice(-4)}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => router.push('/directory')}
                variant="outline"
                className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 transition-all duration-300 font-semibold px-6 py-2 rounded-xl hover:scale-[1.02]"
              >
                <Compass className="h-4 w-4 mr-2" />
                Discover Communities
              </Button>
              <Button
                onClick={() => refetchGroups()}
                variant="outline"
                className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-teal-100 transition-all duration-300 font-semibold px-6 py-2 rounded-xl hover:scale-[1.02]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {/* Show AppKit button only for wallet users, show address for email users */}
              {isConnected ? (
                <w3m-button />
              ) : isAuthenticated && user?.smartAccountAddress ? (
                <div className="flex items-center gap-3 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 text-green-800 px-4 py-2 rounded-xl shadow-lg">
                  <Wallet className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="text-xs text-green-600">Smart Wallet</span>
                    <span className="font-mono text-sm font-bold">
                      {user.smartAccountAddress.slice(0, 8)}...{user.smartAccountAddress.slice(-6)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:bg-green-200 p-2 border-green-300 rounded-lg"
                    onClick={() => {
                      navigator.clipboard.writeText(user.smartAccountAddress);
                      // Could add a toast notification here
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Smart Wallet Section - Show for email authenticated users */}
        {isAuthenticated && user && !isConnected && (
          <div className="mb-8">
            <SmartWallet />
          </div>
        )}

        {/* Wallet Info Section - Show for wallet connected users */}
        {isConnected && !isAuthenticated && (
          <div className="mb-8">
            <div className="dashboard-card p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                Wallet Connected
              </h3>
              <p className="text-slate-600 mb-4">
                Your wallet is connected and ready to create support circles. All transactions will be processed through your connected wallet.
              </p>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="text-green-800 font-semibold text-sm">Ready to create groups</p>
                    <p className="text-green-700 text-xs">Start building your support community</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Selector */}
        {showTemplateSelector && !selectedTemplate && (
          <div className="mb-8">
            <GroupTemplateSelector
              onTemplateSelect={(template) => {
                setSelectedTemplate(template)
                setShowTemplateSelector(false)
              }}
              onCreateCustom={() => {
                setShowTemplateSelector(false)
                setShowCreateGroup(true)
              }}
            />
          </div>
        )}

        {/* Template-based Group Creator */}
        {selectedTemplate && (
          <div className="mb-8">
            <TemplateGroupCreator
              template={selectedTemplate}
              onCreateGroup={handleTemplateGroupCreate}
              onBack={() => setSelectedTemplate(null)}
            />
          </div>
        )}

        {/* Enhanced Create Group Form */}
        {showCreateGroup && (
          <div className="form-card mb-8 p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-black mb-3">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Create Your Support Circle</span>
              </h2>
              <p className="text-slate-600 text-lg">Set up your community with all the details that matter</p>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-3 text-slate-700">Circle Name *</label>
                    <Input
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g., Sarah's Recovery Fund"
                      required
                      maxLength={100}
                      className="kindnest-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-3 text-slate-700">Your Nickname *</label>
                    <Input
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="How should others see you?"
                      required
                      maxLength={32}
                      className="kindnest-input"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Description & Purpose</h3>
                <div>
                  <label className="block text-sm font-bold mb-3 text-slate-700">What&apos;s your circle about?</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the purpose and goals of your support circle..."
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 resize-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-slate-500">{description.length}/500 characters</div>
                    <div className="text-xs text-slate-500">Be specific about your needs and goals</div>
                  </div>
                </div>
              </div>

              {/* Category and Privacy */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Circle Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-3 text-slate-700">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="kindnest-input cursor-pointer"
                    >
                      <option value="custom">Custom Support Circle</option>
                      <option value="healthcare">Healthcare & Medical</option>
                      <option value="education">Education & Learning</option>
                      <option value="emergency">Emergency Assistance</option>
                      <option value="financial">Financial Support</option>
                      <option value="lifestyle">Lifestyle & Wellness</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-3 text-slate-700">Privacy Level</label>
                    <select
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value)}
                      className="kindnest-input cursor-pointer"
                    >
                      <option value="public">🌐 Public - Anyone can discover and join</option>
                      <option value="invite-only">👥 Invite Only - Members need approval</option>
                      <option value="private">🔒 Private - Hidden from discovery</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Advanced Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-3 text-slate-700">Max Members</label>
                    <Input
                      type="number"
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(e.target.value)}
                      min="2"
                      max="1000"
                      className="kindnest-input"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-3 text-slate-700">Contribution Frequency</label>
                    <select
                      value={contributionFrequency}
                      onChange={(e) => setContributionFrequency(e.target.value)}
                      className="kindnest-input cursor-pointer"
                    >
                      <option value="as-needed">💫 As Needed</option>
                      <option value="weekly">📅 Weekly</option>
                      <option value="monthly">🗓️ Monthly</option>
                      <option value="one-time">⚡ One-time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-3 text-slate-700">Min Contribution (ETH)</label>
                    <Input
                      type="number"
                      step="0.001"
                      value={minimumContribution}
                      onChange={(e) => setMinimumContribution(e.target.value)}
                      min="0"
                      className="kindnest-input"
                      placeholder="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Additional Information</h3>
                
                {/* Location */}
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-3 text-slate-700">Location (Optional)</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      value={location.city}
                      onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City"
                      className="kindnest-input"
                    />
                    <Input
                      value={location.region}
                      onChange={(e) => setLocation(prev => ({ ...prev, region: e.target.value }))}
                      placeholder="State/Region"
                      className="kindnest-input"
                    />
                    <Input
                      value={location.country}
                      onChange={(e) => setLocation(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Country"
                      className="kindnest-input"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-3 text-slate-700">Tags (comma-separated)</label>
                  <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="medical, support, community, recovery, family"
                    className="kindnest-input"
                  />
                  <div className="text-xs text-slate-500 mt-2">Help others find your circle with relevant keywords</div>
                </div>

                {/* Guidelines */}
                <div>
                  <label className="block text-sm font-bold mb-3 text-slate-700">Community Guidelines (one per line)</label>
                  <textarea
                    value={guidelines}
                    onChange={(e) => setGuidelines(e.target.value)}
                    placeholder="All funds will be used for verified expenses&#10;Monthly updates will be provided&#10;Receipts will be shared upon request&#10;Respectful communication is required"
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 placeholder:text-slate-400 resize-none"
                  />
                  <div className="text-xs text-slate-500 mt-2">Set clear expectations for your community</div>
                </div>
              </div>

              {/* Blockchain Fee Notice */}
              {creationFee && Number(creationFee) > 0 && (
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">i</span>
                    </div>
                    <h4 className="text-lg font-bold text-blue-800">Blockchain Creation Fee</h4>
                  </div>
                  <p className="text-blue-700">
                    {formatETH(creationFee)} ETH will be charged to deploy your circle on the blockchain.
                    This is a one-time fee for creating your smart contract.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="bg-gradient-to-r from-slate-100 to-blue-100 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    type="submit" 
                    loading={isPending || isConfirming}
                    disabled={!groupName.trim() || !nickname.trim()}
                    className="flex-1 kindnest-button text-lg py-4"
                  >
                    {isPending ? 'Creating Circle...' : isConfirming ? 'Confirming Transaction...' : 'Create Your Support Circle'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateGroup(false);
                      resetForm();
                    }}
                    className="px-8 py-4 border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400 rounded-2xl font-semibold"
                  >
                    Cancel
                  </Button>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-500">Your circle will be created on the blockchain and visible to your chosen audience</p>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Groups Grid */}
        <div className="grid gap-6">
          {/* Create Group Options */}
          {!showCreateGroup && !showTemplateSelector && !selectedTemplate && (
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Template-based Creation */}
              <div 
                className="group-card p-12 cursor-pointer"
                onClick={() => setShowTemplateSelector(true)}
              >
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-4">Quick Start Templates</h3>
                  <p className="text-slate-600 text-lg leading-relaxed mb-6">
                    Pre-configured circles for common support needs like medical expenses, education, or emergencies
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">🏥 Healthcare</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">🎓 Education</span>
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">🚨 Emergency</span>
                  </div>
                  <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold px-4 py-2 rounded-full">
                    <span>Recommended</span>
                    <span className="ml-2">⭐</span>
                  </div>
                </div>
              </div>

              {/* Custom Creation */}
              <div 
                className="group-card p-12 cursor-pointer"
                onClick={() => setShowCreateGroup(true)}
              >
                <div className="text-center">
                  <div className="w-24 h-24  rounded-3xl flex items-center justify-center mb-8 shadow-2xl mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Plus className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-4">Custom Support Circle</h3>
                  <p className="text-slate-600 text-lg leading-relaxed mb-6">
                    Build your own unique community from scratch with full control over all settings and features
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">🎨 Full Control</span>
                    <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">⚙️ All Features</span>
                    <span className="bg-pink-100 text-pink-800 text-xs font-bold px-3 py-1 rounded-full">🔧 Advanced</span>
                  </div>
                  <div className="inline-flex items-center bg-gradient-to-r from-slate-600 to-slate-700 text-white text-sm font-bold px-4 py-2 rounded-full">
                    <span>Full Customization</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Groups */}
          {groupsLoading ? (
            <div className="dashboard-card text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
                <Heart className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Finding Your Support Circles...</h3>
              <p className="text-slate-600 text-lg max-w-md mx-auto">
                Gathering all the communities where care and support flow naturally
              </p>
              <div className="flex justify-center gap-2 mt-8">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          ) : userGroupAddresses && userGroupAddresses.length > 0 ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Active Circles</h2>
                <p className="text-slate-600">Communities you&apos;re part of and supporting</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userGroupAddresses.map((groupAddress) => (
                  <GroupCard 
                    key={groupAddress}
                    groupAddress={groupAddress}
                    userAddress={userAddress}
                    onGroupClick={(addr) => router.push(`/groups/${addr}`)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="dashboard-card text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Heart className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">No Support Circles Yet</h3>
              <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                Ready to build your first community? Create a support circle to connect with people who care.
              </p>
              <Button 
                onClick={() => setShowCreateGroup(true)}
                className="kindnest-button text-lg px-8 py-4"
              >
                <Plus className="h-5 w-5 mr-3" />
                Create Your First Circle
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Network Debug Component */}
      <NetworkTest />
    </div>
  );
}

// Separate component to fetch and display group info
function GroupCard({ 
  groupAddress, 
  userAddress, 
  onGroupClick 
}: { 
  groupAddress: string; 
  userAddress?: string;
  onGroupClick: (address: string) => void;
}) {
  const { data: groupInfo, error: groupInfoError } = useGroupInfo(groupAddress);
  const { data: memberInfo, error: memberInfoError } = useMemberInfo(groupAddress, userAddress);
  const { data: balance, error: balanceError } = useMemberBalance(groupAddress, userAddress);
  const isMember = useIsMember(groupAddress, userAddress);

  // Debug logging
  useEffect(() => {
    if (groupInfoError) {
      // Error fetching group info
    }
    if (memberInfoError) {
      // Error fetching member info
    }
    if (balanceError) {
      // Error fetching balance
    }
  }, [groupAddress, groupInfoError, memberInfoError, balanceError]);

  if (!groupInfo) {
    return (
      <div className="group-card p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-slate-200 rounded-xl w-3/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded-lg w-full"></div>
            <div className="h-4 bg-slate-200 rounded-lg w-2/3"></div>
            <div className="h-4 bg-slate-200 rounded-lg w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group-card p-6 cursor-pointer"
      onClick={() => onGroupClick(groupAddress)}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{groupInfo.name}</h3>
              <p className="text-sm text-slate-500">{shortenAddress(groupAddress)}</p>
            </div>
          </div>
        </div>

        {/* Status & Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Receipt className="h-4 w-4" />
            <span>Created {formatDate(groupInfo.createdAt)}</span>
          </div>
          
          {/* Member Status */}
          {groupInfo.creator === userAddress ? (
            <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-3 py-2 rounded-xl text-sm font-semibold">
              <span className="text-lg">🌱</span>
              <span>You created this circle</span>
            </div>
          ) : isMember ? (
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-2 rounded-xl text-sm font-semibold">
              <span className="text-lg">🤝</span>
              <span>Active member</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-gradient-to-r from-slate-100 to-gray-100 text-slate-600 px-3 py-2 rounded-xl text-sm font-semibold">
              <span className="text-lg">👀</span>
              <span>Not a member</span>
            </div>
          )}
          
          {/* Balance Display */}
          {isMember && balance !== undefined && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200">
              <div className="flex items-center gap-2">
                <HandHeart className="h-4 w-4 text-purple-600" />
                <span className={`font-bold ${Number(balance) >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {Number(balance) >= 0 ? '+' : ''}
                  {formatETH(BigInt(balance.toString()))} ETH
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {Number(balance) >= 0 ? 'Available support for you' : 'You can contribute to help others'}
              </p>
            </div>
          )}
        </div>

        {/* Action indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <span className="text-sm text-slate-500">Click to view details</span>
          <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-slate-600 text-xs">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}
