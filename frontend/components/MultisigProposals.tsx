'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCustomAuth } from '@/hooks/useCustomAuth'
import { multisigManager, type TransactionProposal } from '@/lib/multisig-wallet'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { 
  Vote, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send, 
  Users, 
  Plus,
  Eye,
  Trash2
} from 'lucide-react'

interface MultisigProposalsProps {
  groupAddress: string
  groupName: string
  userAddress?: string
  isCreator?: boolean
}

export function MultisigProposals({ 
  groupAddress, 
  groupName, 
  userAddress, 
  isCreator = false 
}: MultisigProposalsProps) {
  const { user } = useCustomAuth()
  const [proposals, setProposals] = useState<TransactionProposal[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  // Create proposal form state
  const [newProposal, setNewProposal] = useState({
    destination: groupAddress, // Default to group address for treasury transactions
    amount: '',
    description: ''
  })

  const loadProposals = useCallback(async () => {
    setLoading(true)
    try {
      const groupProposals = await multisigManager.getGroupProposals(groupAddress)
      setProposals(groupProposals)
    } catch (error) {
      console.log('Error loading proposals (expected if backend unavailable):', error.message)
    } finally {
      setLoading(false)
    }
  }, [groupAddress])

  useEffect(() => {
    loadProposals()
  }, [loadProposals])

  const createProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email || !userAddress || !newProposal.destination || !newProposal.amount) return

    setLoading(true)
    try {
      const proposal = await multisigManager.createProposal(
        groupAddress,
        groupName,
        user.email,
        userAddress,
        newProposal.destination,
        newProposal.amount,
        newProposal.description
      )

      if (proposal) {
        setNewProposal({ destination: groupAddress, amount: '', description: '' })
        setShowCreateForm(false)
        loadProposals()
      }
    } catch (error) {
      console.log('Error creating proposal (expected if backend unavailable):', error.message)
    } finally {
      setLoading(false)
    }
  }

  const signProposal = async (proposalId: string) => {
    if (!user?.email || !userAddress) return

    setLoading(true)
    try {
      const success = await multisigManager.signProposal(proposalId, user.email, userAddress)
      if (success) {
        loadProposals()
      }
    } catch (error) {
      console.error('Error signing proposal:', error)
    } finally {
      setLoading(false)
    }
  }

  const executeProposal = async (proposal: TransactionProposal) => {
    if (!user?.email) return

    setLoading(true)
    try {
      const success = await multisigManager.executeProposal(proposal, user.email)
      if (success) {
        loadProposals()
      }
    } catch (error) {
      console.error('Error executing proposal:', error)
    } finally {
      setLoading(false)
    }
  }

  const revokeSignature = async (proposalId: string) => {
    if (!userAddress) return

    setLoading(true)
    try {
      const success = await multisigManager.revokeSignature(proposalId, userAddress)
      if (success) {
        loadProposals()
      }
    } catch (error) {
      console.error('Error revoking signature:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'executed': return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'executed': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const hasUserSigned = (proposal: TransactionProposal) => {
    return proposal.signatures?.some(sig => sig.signerAddress === userAddress)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Transaction Proposals
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={loadProposals}
              loading={loading}
            >
              <Eye className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            {userAddress && (
              <Button
                size="sm"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Proposal
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Proposal Form */}
        {showCreateForm && (
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-lg">Create Treasury Contribution Proposal</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Propose a contribution to the group treasury from your wallet.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={createProposal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Treasury Address (Recipient)
                  </label>
                  <Input
                    value={newProposal.destination}
                    onChange={(e) => setNewProposal(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="Group treasury address"
                    required
                    readOnly
                    className="bg-gray-50"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    💡 Funds will be sent to the group treasury address
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (ETH)</label>
                  <Input
                    type="number"
                    step="0.001"
                    value={newProposal.amount}
                    onChange={(e) => setNewProposal(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input
                    value={newProposal.description}
                    onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What is this transaction for?"
                    required
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" loading={loading} className="flex-1">
                    Create Proposal
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewProposal({ destination: groupAddress, amount: '', description: '' })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Proposals List */}
        {proposals.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Proposals Yet</h3>
            <p className="text-gray-500 mb-4">
              Create the first transaction proposal to start the democratic decision-making process.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <Card key={proposal._id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(proposal.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                          {proposal.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-medium">{proposal.description}</h4>
                      <p className="text-sm text-gray-600">
                        Proposed by {proposal.proposerEmail}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {proposal.amount} ETH
                      </div>
                      <div className="text-xs text-gray-500">
                        {proposal.currentSignatures}/{proposal.requiredSignatures} signatures
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500">TO</label>
                      <div className="font-mono text-sm break-all">
                        {proposal.destination}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">CREATED</label>
                      <div className="text-sm">
                        {new Date(proposal.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Signatures */}
                  {proposal.signatures && proposal.signatures.length > 0 && (
                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-500 mb-2 block">SIGNATURES</label>
                      <div className="space-y-1">
                        {proposal.signatures.map((signature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{signature.signerEmail}</span>
                            <span className="text-gray-500">
                              {new Date(signature.signedAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {userAddress && (
                    <div className="flex gap-2">
                      {proposal.status === 'pending' && !hasUserSigned(proposal) && (
                        <Button
                          size="sm"
                          onClick={() => signProposal(proposal._id)}
                          loading={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Vote className="h-4 w-4 mr-1" />
                          Sign & Approve
                        </Button>
                      )}
                      
                      {proposal.status === 'pending' && hasUserSigned(proposal) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => revokeSignature(proposal._id)}
                          loading={loading}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Revoke Signature
                        </Button>
                      )}
                      
                      {proposal.status === 'approved' && isCreator && (
                        <Button
                          size="sm"
                          onClick={() => executeProposal(proposal)}
                          loading={loading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Execute Transaction
                        </Button>
                      )}
                      
                      {proposal.status === 'executed' && proposal.txId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://sepolia-blockscout.lisk.com/tx/${proposal.txId}`, '_blank')}
                        >
                          View Transaction
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">How Multisig Works</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Anyone can propose transactions from the group treasury</li>
                  <li>• Proposals need {2} signatures to be approved</li>
                  <li>• Group creators can execute approved transactions</li>
                  <li>• All transactions are transparent and traceable</li>
                  <li>• Members can revoke signatures before execution</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}