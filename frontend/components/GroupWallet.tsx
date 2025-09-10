'use client'

import { useState, useEffect, useCallback } from 'react'
import { aaManager } from '@/lib/account-abstraction'
import { useCustomAuth } from '@/hooks/useCustomAuth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Copy, RefreshCw, Send, Users, ExternalLink, Wallet } from 'lucide-react'
import { MultisigProposals } from './MultisigProposals'

interface GroupWalletProps {
  groupName: string
  groupAddress: string
  creatorEmail: string
  isCreator?: boolean
}

export function GroupWallet({ groupName, groupAddress, creatorEmail, isCreator = false }: GroupWalletProps) {
  const { user } = useCustomAuth()
  const [groupWalletAddress, setGroupWalletAddress] = useState('')
  const [balance, setBalance] = useState('0.0')
  const [loading, setLoading] = useState(false)
  const [contributionAmount, setContributionAmount] = useState('')
  const [showContribute, setShowContribute] = useState(false)

  const loadGroupWallet = useCallback(async () => {
    setLoading(true)
    try {
      // Generate group wallet address
      const walletAddress = await aaManager.generateGroupWallet(groupName, creatorEmail)
      setGroupWalletAddress(walletAddress)
      
      // Get balance
      const walletBalance = await aaManager.getSmartAccountBalance(walletAddress)
      setBalance(walletBalance)
    } catch (error) {
      console.error('Error loading group wallet:', error)
    } finally {
      setLoading(false)
    }
  }, [groupName, creatorEmail])

  useEffect(() => {
    loadGroupWallet()
  }, [loadGroupWallet])

  const contribute = async () => {
    if (!user?.email || !contributionAmount || !groupWalletAddress) return
    
    setLoading(true)
    try {
      // Send contribution from user's smart account to group wallet
      const result = await aaManager.sendGaslessTransaction(
        user.email,
        groupWalletAddress,
        contributionAmount
      )
      
      console.log('Contribution sent:', result)
      
      // Reset form and refresh balance
      setContributionAmount('')
      setShowContribute(false)
      setTimeout(loadGroupWallet, 3000)
      
    } catch (error) {
      console.error('Contribution failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = () => {
    if (groupWalletAddress) {
      navigator.clipboard.writeText(groupWalletAddress)
    }
  }

  const openExplorer = () => {
    if (groupWalletAddress) {
      window.open(`https://sepolia-blockscout.lisk.com/address/${groupWalletAddress}`, '_blank')
    }
  }

  const canContribute = user?.smartAccountAddress && parseFloat(balance) >= 0

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Wallet className="h-5 w-5" />
          {groupName} - Group Treasury
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Group Wallet Address */}
        <div>
          <label className="block text-sm font-medium mb-2">Group Wallet Address</label>
          <div className="flex items-center gap-2">
            <Input
              value={groupWalletAddress}
              readOnly
              className="font-mono text-sm bg-white"
              placeholder="Loading..."
            />
            <Button size="sm" variant="outline" onClick={copyAddress} disabled={!groupWalletAddress}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={openExplorer} disabled={!groupWalletAddress}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Treasury Balance */}
        <Card className="bg-white/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{balance} ETH</div>
              <p className="text-sm text-muted-foreground">Group Treasury Balance</p>
              <Button
                size="sm"
                variant="outline"
                onClick={loadGroupWallet}
                loading={loading}
                className="mt-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contribution Section */}
        {canContribute && (
          <div className="space-y-3">
            {!showContribute ? (
              <Button 
                onClick={() => setShowContribute(true)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Contribute to Group
              </Button>
            ) : (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Make a Contribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Contribution Amount (ETH)</label>
                    <Input
                      type="number"
                      step="0.001"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      placeholder="0.01"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={contribute} 
                      loading={loading}
                      disabled={!contributionAmount}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Contribute (Gasless)
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowContribute(false)
                        setContributionAmount('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    💡 This transaction is gasless - no fees required!
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Funding Instructions */}
        <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Users className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">How Group Funding Works</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Each group has its own dedicated wallet</li>
                <li>• Members can contribute ETH using gasless transactions</li>
                <li>• Anyone can send ETH directly to the group address</li>
                <li>• Funds are managed collectively by the group</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Creator Actions */}
        {isCreator && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">👑 Creator Actions</h4>
            <p className="text-sm text-yellow-700 mb-3">
              As the group creator, you can execute approved proposals and manage the treasury.
            </p>
          </div>
        )}
      </CardContent>

      {/* Multisig Proposals Section */}
      <CardContent className="pt-0">
        <MultisigProposals
          groupAddress={groupAddress}
          groupName={groupName}
          userAddress={user?.smartAccountAddress}
          isCreator={isCreator}
        />
      </CardContent>
    </Card>
  )
}