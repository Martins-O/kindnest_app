'use client'

import { useState, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Users, User, RefreshCw, Copy, ExternalLink } from 'lucide-react'
import { GROUP_TREASURY_ABI } from '@/lib/contracts'
import { shortenAddress } from '@/lib/utils'

interface Member {
  wallet: string
  nickname: string
  totalOwed: bigint
  totalOwing: bigint
  active: boolean
  joinedAt: bigint
}

interface GroupMembersProps {
  groupAddress: string
  isCreator?: boolean
  onMemberClick?: (address: string) => void
}

export function GroupMembers({ groupAddress, isCreator = false, onMemberClick }: GroupMembersProps) {
  const [memberAddresses, setMemberAddresses] = useState<string[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)

  // Get member addresses with pagination
  const { data: membersData, refetch: refetchMembers } = useReadContract({
    address: groupAddress as `0x${string}`,
    abi: GROUP_TREASURY_ABI,
    functionName: 'getMembersPaginated',
    args: [BigInt(0), BigInt(100)], // Get first 100 members
    query: {
      enabled: !!groupAddress,
    },
  })

  // Load member details
  const loadMemberDetails = (addresses: string[]) => {
    if (!addresses.length) {
      setMembers([])
      return
    }

    setLoading(true)
    // Create fallback member objects - in a production app, we'd use multicall or individual contract calls
    // For now, showing basic member info with placeholders for balances
    const fallbackMembers = addresses.map(address => ({
      wallet: address,
      nickname: shortenAddress(address),
      totalOwed: BigInt(0),
      totalOwing: BigInt(0),
      active: true,
      joinedAt: BigInt(Date.now())
    }))
    
    setMembers(fallbackMembers)
    setLoading(false)
  }

  // Update member list when data changes
  useEffect(() => {
    if (membersData && Array.isArray(membersData) && membersData.length >= 1) {
      const [addresses] = membersData as [string[], bigint]
      setMemberAddresses(addresses)
      loadMemberDetails(addresses)
    }
  }, [membersData])

  const refreshMembers = () => {
    refetchMembers()
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  const openExplorer = (address: string) => {
    window.open(`https://sepolia-blockscout.lisk.com/address/${address}`, '_blank')
  }

  const formatBalance = (owing: bigint, owed: bigint) => {
    const balance = Number(owing) - Number(owed)
    const ethBalance = balance / 1e18
    
    if (balance === 0) {
      return { text: '0.00 ETH', color: 'text-gray-500' }
    } else if (balance > 0) {
      return { text: `+${ethBalance.toFixed(4)} ETH`, color: 'text-green-600' }
    } else {
      return { text: `${ethBalance.toFixed(4)} ETH`, color: 'text-red-600' }
    }
  }

  return (
    <Card className="bg-white border-gray-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900 flex items-center gap-2 font-bold">
            <Users className="h-5 w-5" />
            Group Members ({memberAddresses.length})
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={refreshMembers}
            className="bg-gray-100 border-gray-200 text-gray-900 hover:bg-gray-200 shadow-sm font-semibold"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-600 font-medium">Loading member details...</div>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-600 font-medium">No members found</div>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member, index) => {
              const balance = formatBalance(member.totalOwing, member.totalOwed)
              
              return (
                <Card 
                  key={member.wallet} 
                  className={`bg-gray-50 border-gray-200 shadow-sm ${onMemberClick ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
                  onClick={() => onMemberClick?.(member.wallet)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-gray-900 font-bold">
                            {member.nickname}
                          </div>
                          <div className="text-gray-600 text-sm font-mono font-medium">
                            {shortenAddress(member.wallet)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-sm font-medium ${balance.color}`}>
                            {balance.text}
                          </div>
                          <div className="text-gray-500 text-xs font-medium">
                            Balance
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyAddress(member.wallet)
                            }}
                            className="bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 px-2 shadow-sm"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              openExplorer(member.wallet)
                            }}
                            className="bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 px-2 shadow-sm"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {(member.totalOwed > BigInt(0) || member.totalOwing > BigInt(0)) && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-white/40">Owes Others</div>
                            <div className="text-red-400">
                              {(Number(member.totalOwed) / 1e18).toFixed(4)} ETH
                            </div>
                          </div>
                          <div>
                            <div className="text-white/40">Owed by Others</div>
                            <div className="text-green-400">
                              {(Number(member.totalOwing) / 1e18).toFixed(4)} ETH
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}