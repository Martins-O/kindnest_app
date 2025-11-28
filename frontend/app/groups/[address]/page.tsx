'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useKindNestWallet } from '@/hooks/useKindNestWallet'
import { useCustomAuth } from '@/hooks/useCustomAuth'
import { useAAWalletContext } from '@/components/auth/AAWalletProvider'
import { GroupWallet } from '@/components/GroupWallet'
import { GroupMembers } from '@/components/GroupMembers'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useGroupInfo, useMemberInfo, useIsMember, useAddMember } from '@/lib/hooks'
import { ArrowLeft, Users, Calendar, User, UserPlus, Activity, Settings, BarChart3 } from 'lucide-react'
import { formatDate, shortenAddress } from '@/lib/utils'
import { ActivityFeed } from '@/components/ActivityFeed'
import { MemberProfile } from '@/components/MemberProfile'
import { GroupAnalytics } from '@/components/GroupAnalytics'
import { EngagementProvider } from '@/components/MemberEngagementTracker'

export default function GroupPage() {
  const params = useParams()
  const router = useRouter()
  const { address, isConnected } = useKindNestWallet()
  const { user, isAuthenticated } = useCustomAuth()
  const { smartAccountAddress } = useAAWalletContext()

  const groupAddress = params.address as string
  const userAddress = smartAccountAddress || address || user?.smartAccountAddress

  const { data: groupInfo, isLoading: groupLoading } = useGroupInfo(groupAddress)
  const { data: memberInfo } = useMemberInfo(groupAddress, userAddress)
  const isMember = useIsMember(groupAddress, userAddress)

  // Add member functionality
  const { addMember, isPending: addingMember, error: addMemberError } = useAddMember(groupAddress)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberAddress, setNewMemberAddress] = useState('')
  const [newMemberNickname, setNewMemberNickname] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'members' | 'analytics' | 'profile'>('overview')
  const [selectedMemberAddress, setSelectedMemberAddress] = useState<string | null>(null)

  const handleAddMember = async () => {
    if (!newMemberAddress || !newMemberNickname) return

    try {
      await addMember(newMemberAddress, newMemberNickname)
      setNewMemberAddress('')
      setNewMemberNickname('')
      setShowAddMember(false)
    } catch (error) {
      console.error('Error adding member:', error)
    }
  }

  if (groupLoading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-gray-900 font-bold">Loading group...</div>
      </div>
    )
  }

  if (!groupInfo) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-gray-900 font-bold">Group not found</div>
      </div>
    )
  }

  const isCreator = groupInfo.creator === userAddress

  return (
    <EngagementProvider>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="bg-white border-gray-200 text-gray-900 hover:bg-gray-50 shadow-sm font-semibold"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{groupInfo.name}</h1>
              <p className="text-gray-700 font-semibold">Group Treasury & Management</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex gap-2 mb-6 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview'
                  ? 'bg-white text-gray-900'
                  : 'text-white hover:bg-white/10'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'activity'
                  ? 'bg-white text-gray-900'
                  : 'text-white hover:bg-white/10'
                  }`}
              >
                <Activity className="h-4 w-4 mr-2 inline" />
                Activity
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'members'
                  ? 'bg-white text-gray-900'
                  : 'text-white hover:bg-white/10'
                  }`}
              >
                <Users className="h-4 w-4 mr-2 inline" />
                Members
              </button>
              {(isMember || isCreator) && (
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'analytics'
                    ? 'bg-white text-gray-900'
                    : 'text-white hover:bg-white/10'
                    }`}
                >
                  <BarChart3 className="h-4 w-4 mr-2 inline" />
                  Analytics
                </button>
              )}
              {userAddress && (
                <button
                  onClick={() => {
                    setActiveTab('profile')
                    setSelectedMemberAddress(userAddress)
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'profile'
                    ? 'bg-white text-gray-900'
                    : 'text-white hover:bg-white/10'
                    }`}
                >
                  <User className="h-4 w-4 mr-2 inline" />
                  Profile
                </button>
              )}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Group Info */}
              <div className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Group Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-white/90">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-medium">Created</span>
                        </div>
                        <div className="text-sm">{formatDate(groupInfo.createdAt)}</div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4" />
                          <span className="text-sm font-medium">Creator</span>
                        </div>
                        <div className="text-sm font-mono">{shortenAddress(groupInfo.creator)}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-white/90 mb-2">Contract Address</div>
                      <div className="text-sm font-mono text-white/70 bg-white/5 rounded px-3 py-2">
                        {groupAddress}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCreator ? (
                        <div className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
                          👑 You created this group
                        </div>
                      ) : isMember ? (
                        <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                          🤝 You&apos;re a member
                        </div>
                      ) : (
                        <div className="bg-gray-500/20 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                          👀 Not a member
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Member Actions */}
                {!isMember && (
                  <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Join This Group</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/70 mb-4">
                        Contact the group creator to request membership and start contributing to this nest of care.
                      </p>
                      <Button className="w-full" disabled>
                        Request Membership (Coming Soon)
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Creator Actions - Add Member */}
                {isCreator && (
                  <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Add New Member
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!showAddMember ? (
                        <div>
                          <p className="text-white/70 mb-4">
                            Invite new members to join your group and start sharing expenses together.
                          </p>
                          <Button
                            onClick={() => setShowAddMember(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Member
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-white/90 text-sm font-medium mb-2">
                              Member Wallet Address
                            </label>
                            <Input
                              value={newMemberAddress}
                              onChange={(e) => setNewMemberAddress(e.target.value)}
                              placeholder="0x..."
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            />
                          </div>

                          <div>
                            <label className="block text-white/90 text-sm font-medium mb-2">
                              Nickname
                            </label>
                            <Input
                              value={newMemberNickname}
                              onChange={(e) => setNewMemberNickname(e.target.value)}
                              placeholder="Enter a friendly nickname"
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              maxLength={32}
                            />
                          </div>

                          {addMemberError && (
                            <div className="text-red-400 text-sm bg-red-500/10 rounded p-2">
                              Error: {addMemberError.message || 'Failed to add member'}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              onClick={handleAddMember}
                              disabled={!newMemberAddress || !newMemberNickname || addingMember}
                              loading={addingMember}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              {addingMember ? 'Adding...' : 'Add Member'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowAddMember(false)
                                setNewMemberAddress('')
                                setNewMemberNickname('')
                              }}
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              Cancel
                            </Button>
                          </div>

                          <div className="text-xs text-white/60">
                            💡 The member will be able to participate in group expenses once added.
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Group Members */}
              <div>
                <GroupMembers
                  groupAddress={groupAddress}
                  isCreator={isCreator}
                />
              </div>

              {/* Group Wallet */}
              <div>
                <GroupWallet
                  groupName={groupInfo.name}
                  groupAddress={groupAddress}
                  creatorEmail={user?.email || 'unknown@example.com'} // TODO: Get creator email properly
                  isCreator={isCreator}
                />
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <ActivityFeed
                groupAddress={groupAddress}
                title={`${groupInfo.name} Activity`}
                limit={50}
                showStats={true}
                showFilters={true}
                className="max-w-4xl mx-auto"
              />
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <GroupMembers
                  groupAddress={groupAddress}
                  isCreator={isCreator}
                  onMemberClick={(address) => {
                    setSelectedMemberAddress(address)
                    setActiveTab('profile')
                  }}
                />
              </div>
              <div className="space-y-6">
                {/* Quick member profiles preview */}
                <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Member Highlights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70 text-sm mb-4">
                      Click on any member to view their full profile and achievements.
                    </p>
                    <Button
                      onClick={() => {
                        setSelectedMemberAddress(userAddress || '')
                        setActiveTab('profile')
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      View Your Profile
                    </Button>
                  </CardContent>
                </Card>

                {/* Creator Actions - Add Member */}
                {isCreator && (
                  <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Add New Member
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!showAddMember ? (
                        <div>
                          <p className="text-white/70 mb-4">
                            Invite new members to join your group and start sharing expenses together.
                          </p>
                          <Button
                            onClick={() => setShowAddMember(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Member
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-white/90 text-sm font-medium mb-2">
                              Member Wallet Address
                            </label>
                            <Input
                              value={newMemberAddress}
                              onChange={(e) => setNewMemberAddress(e.target.value)}
                              placeholder="0x..."
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            />
                          </div>

                          <div>
                            <label className="block text-white/90 text-sm font-medium mb-2">
                              Nickname
                            </label>
                            <Input
                              value={newMemberNickname}
                              onChange={(e) => setNewMemberNickname(e.target.value)}
                              placeholder="Enter a friendly nickname"
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              maxLength={32}
                            />
                          </div>

                          {addMemberError && (
                            <div className="text-red-400 text-sm bg-red-500/10 rounded p-2">
                              Error: {addMemberError.message || 'Failed to add member'}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              onClick={handleAddMember}
                              disabled={!newMemberAddress || !newMemberNickname || addingMember}
                              loading={addingMember}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              {addingMember ? 'Adding...' : 'Add Member'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowAddMember(false)
                                setNewMemberAddress('')
                                setNewMemberNickname('')
                              }}
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              Cancel
                            </Button>
                          </div>

                          <div className="text-xs text-white/60">
                            💡 The member will be able to participate in group expenses once added.
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (isMember || isCreator) && (
            <div className="space-y-6">
              <GroupAnalytics
                groupAddress={groupAddress}
                userAddress={userAddress}
                isAdmin={isCreator}
              />
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && selectedMemberAddress && (
            <div className="max-w-4xl mx-auto">
              <MemberProfile
                address={selectedMemberAddress}
                isOwner={selectedMemberAddress === userAddress}
                showEdit={selectedMemberAddress === userAddress}
                compact={false}
              />
            </div>
          )}
        </div>
      </div >
    </EngagementProvider >
  )
}