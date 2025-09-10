'use client';

import { ethers } from 'ethers'
import { gelatoRelay, isGelatoConfigured, LISK_CHAIN_ID } from './gelato'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Multisig Wallet ABI (simplified Safe-like interface)
const MULTISIG_WALLET_ABI = [
  'function submitTransaction(address destination, uint256 value, bytes data) external returns (uint256 txId)',
  'function confirmTransaction(uint256 txId) external',
  'function executeTransaction(uint256 txId) external',
  'function revokeConfirmation(uint256 txId) external',
  'function getTransactionCount() external view returns (uint256)',
  'function getTransaction(uint256 txId) external view returns (address destination, uint256 value, bytes data, bool executed, uint256 confirmations)',
  'function isConfirmed(uint256 txId) external view returns (bool)',
  'function getConfirmationCount(uint256 txId) external view returns (uint256)',
  'function hasConfirmed(uint256 txId, address owner) external view returns (bool)',
  'function owners(uint256 index) external view returns (address)',
  'function required() external view returns (uint256)',
  'function getOwners() external view returns (address[] memory)'
]

// Transaction proposal interface
export interface TransactionProposal {
  _id: string
  groupAddress: string
  groupName: string
  proposerEmail: string
  proposerAddress: string
  destination: string
  amount: string
  description: string
  data: string
  txId: string | null // On-chain transaction ID
  status: 'pending' | 'approved' | 'executed' | 'rejected'
  requiredSignatures: number
  currentSignatures: number
  signatures: ProposalSignature[]
  createdAt: string
  executedAt?: string
}

export interface ProposalSignature {
  signerEmail: string
  signerAddress: string
  signedAt: string
  onChainConfirmed: boolean
}

export class MultisigWalletManager {
  private provider: ethers.providers.JsonRpcProvider

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL
    )
  }

  // Local storage fallback for proposals when backend is unavailable
  private getLocalProposals(groupAddress: string): TransactionProposal[] {
    try {
      const stored = localStorage.getItem(`proposals_${groupAddress}`)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  private saveLocalProposals(groupAddress: string, proposals: TransactionProposal[]) {
    try {
      localStorage.setItem(`proposals_${groupAddress}`, JSON.stringify(proposals))
    } catch (error) {
      console.error('Failed to save proposals locally:', error)
    }
  }

  // Get auth token from localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem('kindnest_token')
  }

  // Create a transaction proposal (off-chain first)
  async createProposal(
    groupAddress: string,
    groupName: string,
    proposerEmail: string,
    proposerAddress: string,
    destination: string,
    amount: string,
    description: string,
    data: string = '0x'
  ): Promise<TransactionProposal | null> {
    try {
      const token = this.getAuthToken()
      if (!token) throw new Error('No auth token')

      // Try backend first with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      try {
        const response = await fetch(`${API_BASE_URL}/multisig/proposals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            groupAddress,
            groupName,
            destination,
            amount,
            description,
            data
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || `HTTP ${response.status}`)
        }

        console.log('📝 Transaction proposal created via backend:', result.proposal)
        return result.proposal as TransactionProposal
      } catch (fetchError) {
        clearTimeout(timeoutId)
        console.log('Backend unavailable, creating proposal locally')
        
        // Local fallback
        const proposals = this.getLocalProposals(groupAddress)
        const newProposal: TransactionProposal = {
          _id: `local_${Date.now()}`,
          groupAddress,
          groupName,
          proposerEmail,
          proposerAddress,
          destination,
          amount,
          description,
          data,
          txId: null,
          status: 'pending',
          requiredSignatures: 2,
          currentSignatures: 0,
          signatures: [],
          createdAt: new Date().toISOString()
        }
        
        proposals.push(newProposal)
        this.saveLocalProposals(groupAddress, proposals)
        
        console.log('📝 Transaction proposal created locally:', newProposal)
        return newProposal
      }
    } catch (error) {
      console.log('Failed to create proposal (expected if backend unavailable):', error.message)
      return null
    }
  }

  // Sign a proposal (add signature)
  async signProposal(
    proposalId: string,
    signerEmail: string,
    signerAddress: string
  ): Promise<boolean> {
    try {
      const token = this.getAuthToken()
      if (!token) throw new Error('No auth token')

      // Try backend first with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      try {
        const response = await fetch(`${API_BASE_URL}/multisig/proposals/${proposalId}/sign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal
        })

        clearTimeout(timeoutId)
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || `HTTP ${response.status}`)
        }

        console.log('✅ Proposal signed via backend:', proposalId, result.message)
        return true
      } catch (fetchError) {
        clearTimeout(timeoutId)
        console.log('Backend unavailable, signing proposal locally')
        
        // Local fallback - find and update the proposal
        if (proposalId.startsWith('local_')) {
          // Find the group address from local storage by scanning all proposals
          const keys = Object.keys(localStorage).filter(key => key.startsWith('proposals_'))
          
          for (const key of keys) {
            const groupAddress = key.replace('proposals_', '')
            const proposals = this.getLocalProposals(groupAddress)
            const proposalIndex = proposals.findIndex(p => p._id === proposalId)
            
            if (proposalIndex >= 0) {
              const proposal = proposals[proposalIndex]
              
              // Check if user already signed
              if (proposal.signatures.some(sig => sig.signerAddress === signerAddress)) {
                console.log('User already signed this proposal')
                return false
              }
              
              // Add signature
              proposal.signatures.push({
                signerEmail,
                signerAddress,
                signedAt: new Date().toISOString(),
                onChainConfirmed: false
              })
              
              proposal.currentSignatures = proposal.signatures.length
              
              // Check if proposal should be approved
              if (proposal.currentSignatures >= proposal.requiredSignatures) {
                proposal.status = 'approved'
              }
              
              proposals[proposalIndex] = proposal
              this.saveLocalProposals(groupAddress, proposals)
              
              console.log('✅ Proposal signed locally:', proposalId)
              return true
            }
          }
        }
        
        return false
      }
    } catch (error) {
      console.log('Failed to sign proposal (expected if backend unavailable):', error.message)
      return false
    }
  }

  // Execute approved proposal on-chain
  async executeProposal(proposal: TransactionProposal, executorEmail: string): Promise<boolean> {
    try {
      if (proposal.status !== 'approved') {
        throw new Error('Proposal not approved yet')
      }

      if (!isGelatoConfigured) {
        throw new Error('Gelato not configured')
      }

      // For now, we'll simulate multisig by sending directly from group wallet
      // In production, this would interact with a deployed multisig contract
      
      // Send gasless transaction through Gelato (simplified execution)
      const response = await gelatoRelay?.sponsoredCall({
        chainId: LISK_CHAIN_ID,
        target: proposal.destination as `0x${string}`,
        data: '0x' as `0x${string}` // Simple ETH transfer
      }, process.env.NEXT_PUBLIC_GELATO_SPONSOR_API_KEY!)

      // Update proposal status via backend
      const token = this.getAuthToken()
      if (!token) throw new Error('No auth token')

      const updateResponse = await fetch(`${API_BASE_URL}/multisig/proposals/${proposal._id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          txId: response?.taskId
        })
      })

      const result = await updateResponse.json()
      
      if (!updateResponse.ok) {
        throw new Error(result.error || `HTTP ${updateResponse.status}`)
      }

      console.log('🚀 Proposal executed:', proposal._id, response?.taskId)
      return true
    } catch (error) {
      console.error('Failed to execute proposal:', error)
      return false
    }
  }

  // Get proposals for a group
  async getGroupProposals(groupAddress: string): Promise<TransactionProposal[]> {
    try {
      const token = this.getAuthToken()
      if (!token) throw new Error('No auth token')

      // Try backend first with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      try {
        const response = await fetch(`${API_BASE_URL}/multisig/proposals/${groupAddress}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal
        })

        clearTimeout(timeoutId)
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || `HTTP ${response.status}`)
        }

        return result.proposals as TransactionProposal[]
      } catch (fetchError) {
        clearTimeout(timeoutId)
        console.log('Backend unavailable, using local proposals')
        return this.getLocalProposals(groupAddress)
      }
    } catch (error) {
      console.log('Failed to get proposals (expected if backend unavailable):', error.message)
      return this.getLocalProposals(groupAddress)
    }
  }

  // Get proposals that need user's signature
  async getPendingProposalsForUser(userAddress: string): Promise<TransactionProposal[]> {
    try {
      const token = this.getAuthToken()
      if (!token) throw new Error('No auth token')

      const response = await fetch(`${API_BASE_URL}/multisig/proposals/pending/${userAddress}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      return result.proposals as TransactionProposal[]
    } catch (error) {
      console.error('Failed to get pending proposals:', error)
      return []
    }
  }

  // Check if user can sign a proposal (is member of group)
  async canUserSign(proposalId: string, userAddress: string): Promise<boolean> {
    try {
      const token = this.getAuthToken()
      if (!token) throw new Error('No auth token')

      const response = await fetch(`${API_BASE_URL}/multisig/proposals/single/${proposalId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      const proposal = result.proposal as TransactionProposal

      // Check if user already signed
      const hasAlreadySigned = proposal.signatures?.some(
        (sig: ProposalSignature) => sig.signerAddress === userAddress
      )

      return !hasAlreadySigned
    } catch (error) {
      console.error('Failed to check signing permissions:', error)
      return false
    }
  }

  // Revoke signature (if not yet executed)
  async revokeSignature(proposalId: string, signerAddress: string): Promise<boolean> {
    try {
      const token = this.getAuthToken()
      if (!token) throw new Error('No auth token')

      // Try backend first with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      try {
        const response = await fetch(`${API_BASE_URL}/multisig/proposals/${proposalId}/signatures/${signerAddress}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal
        })

        clearTimeout(timeoutId)
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || `HTTP ${response.status}`)
        }

        console.log('🔄 Signature revoked via backend:', proposalId)
        return true
      } catch (fetchError) {
        clearTimeout(timeoutId)
        console.log('Backend unavailable, revoking signature locally')
        
        // Local fallback
        if (proposalId.startsWith('local_')) {
          const keys = Object.keys(localStorage).filter(key => key.startsWith('proposals_'))
          
          for (const key of keys) {
            const groupAddress = key.replace('proposals_', '')
            const proposals = this.getLocalProposals(groupAddress)
            const proposalIndex = proposals.findIndex(p => p._id === proposalId)
            
            if (proposalIndex >= 0) {
              const proposal = proposals[proposalIndex]
              
              // Remove signature
              const signatureIndex = proposal.signatures.findIndex(sig => sig.signerAddress === signerAddress)
              if (signatureIndex >= 0) {
                proposal.signatures.splice(signatureIndex, 1)
                proposal.currentSignatures = proposal.signatures.length
                
                // Update status if needed
                if (proposal.currentSignatures < proposal.requiredSignatures) {
                  proposal.status = 'pending'
                }
                
                proposals[proposalIndex] = proposal
                this.saveLocalProposals(groupAddress, proposals)
                
                console.log('🔄 Signature revoked locally:', proposalId)
                return true
              }
            }
          }
        }
        
        return false
      }
    } catch (error) {
      console.log('Failed to revoke signature (expected if backend unavailable):', error.message)
      return false
    }
  }
}

export const multisigManager = new MultisigWalletManager()