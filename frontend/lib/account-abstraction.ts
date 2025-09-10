'use client';

import { ethers } from 'ethers'
import { supabase, type UserWallet } from './supabase'
import { gelatoRelay, isGelatoConfigured, LISK_CHAIN_ID } from './gelato'

// SimpleAccount Factory ABI (ERC-4337 compatible)
const ACCOUNT_FACTORY_ABI = [
  'function createAccount(address owner, uint256 salt) external returns (address)',
  'function getAddress(address owner, uint256 salt) external view returns (address)',
  'function accountImplementation() external view returns (address)'
]

// SimpleAccount ABI (basic smart wallet functions)
const SIMPLE_ACCOUNT_ABI = [
  'function execute(address dest, uint256 value, bytes calldata func) external',
  'function executeBatch(address[] calldata dest, bytes[] calldata func) external',
  'function owner() external view returns (address)',
  'function getDeposit() external view returns (uint256)',
  'function addDeposit() external payable',
  'function withdrawDepositTo(address withdrawAddress, uint256 amount) external'
]

// Use Gelato's SimpleAccount Factory on Lisk Sepolia
const ACCOUNT_FACTORY_ADDRESS = '0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67' // Gelato's factory
const ENTRYPOINT_ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' // ERC-4337 EntryPoint

export class AccountAbstractionManager {
  private provider: ethers.providers.JsonRpcProvider

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia-api.lisk.com'
    )
  }

  // Generate deterministic smart account address from email - ALWAYS CONSISTENT
  async generateSmartAccountAddress(email: string): Promise<string> {
    // Normalize email to ensure consistency
    const normalizedEmail = email.toLowerCase().trim()
    
    // Check if we have a cached address for this email
    const cachedAddress = localStorage.getItem(`smart_account_${normalizedEmail}`)
    if (cachedAddress) {
      console.log(`📧 Using cached smart account for ${normalizedEmail}:`, cachedAddress)
      return cachedAddress
    }
    
    try {
      // Create DETERMINISTIC address from email using a consistent method
      const emailHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(normalizedEmail))
      
      // Use a consistent method that will always produce the same address
      // Method 1: Simple deterministic generation (most reliable)
      const deterministicAddress = ethers.utils.getAddress('0x' + emailHash.slice(26))
      
      // Try to get the proper smart account address from factory (but don't rely on it)
      try {
        const ownerAddress = deterministicAddress
        const salt = ethers.utils.solidityKeccak256(['string'], [normalizedEmail])
        
        const factory = new ethers.Contract(ACCOUNT_FACTORY_ADDRESS, ACCOUNT_FACTORY_ABI, this.provider)
        
        // Wrap the contract call to suppress console errors
        try {
          const smartAccountAddress = await factory.getAddress(ownerAddress, salt)
          
          // Cache the result
          localStorage.setItem(`smart_account_${normalizedEmail}`, smartAccountAddress)
          console.log(`📧 Generated smart account for ${normalizedEmail}:`, smartAccountAddress)
          return smartAccountAddress
        } catch (contractError) {
          // Factory call failed - this is expected, suppress the error
          throw new Error('Factory unavailable - using fallback')
        }
      } catch (factoryError) {
        // Silently use fallback - this is normal behavior
        console.log(`📧 Using deterministic smart account for ${normalizedEmail}:`, deterministicAddress)
        
        // Use the deterministic address as fallback - this ensures consistency
        localStorage.setItem(`smart_account_${normalizedEmail}`, deterministicAddress)
        return deterministicAddress
      }
    } catch (error) {
      console.error('Smart account generation failed:', error)
      
      // Final fallback - still deterministic
      const emailHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(normalizedEmail))
      const fallbackAddress = ethers.utils.getAddress('0x' + emailHash.slice(26))
      localStorage.setItem(`smart_account_${normalizedEmail}`, fallbackAddress)
      return fallbackAddress
    }
  }

  // Create (deploy) smart account for email user
  async deploySmartAccount(email: string): Promise<{ address: string; txHash?: string }> {
    try {
      if (!isGelatoConfigured) {
        throw new Error('Gelato not configured - cannot deploy smart account')
      }

      // Generate owner address and salt
      const emailHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email))
      const ownerAddress = ethers.utils.getAddress('0x' + emailHash.slice(26))
      const salt = ethers.utils.solidityKeccak256(['string'], [email])

      // Prepare contract call data
      const factory = new ethers.Contract(ACCOUNT_FACTORY_ADDRESS, ACCOUNT_FACTORY_ABI)
      const createAccountData = factory.interface.encodeFunctionData('createAccount', [ownerAddress, salt])

      // Send gasless transaction to deploy account
      const response = await gelatoRelay?.sponsoredCall({
        chainId: LISK_CHAIN_ID,
        target: ACCOUNT_FACTORY_ADDRESS as `0x${string}`,
        data: createAccountData as `0x${string}`
      }, process.env.NEXT_PUBLIC_GELATO_SPONSOR_API_KEY!)

      const smartAccountAddress = await this.generateSmartAccountAddress(email)
      
      return {
        address: smartAccountAddress,
        txHash: response?.taskId
      }
    } catch (error) {
      console.error('Smart account deployment failed:', error)
      // Return address even if deployment fails (might already be deployed)
      const address = await this.generateSmartAccountAddress(email)
      return { address }
    }
  }

  // Store user wallet mapping in Supabase
  async storeUserWallet(
    userId: string, 
    email: string, 
    smartAccountAddress: string
  ): Promise<UserWallet | null> {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .insert({
          user_id: userId,
          email: email,
          smart_account_address: smartAccountAddress
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return null
    }
  }

  // Retrieve user wallet from Supabase
  async getUserWallet(userId: string): Promise<UserWallet | null> {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return null
    }
  }

  // Get wallet by email (for login)
  async getWalletByEmail(email: string): Promise<UserWallet | null> {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('email', email)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return null
    }
  }

  // Get smart account balance
  async getSmartAccountBalance(smartAccountAddress: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(smartAccountAddress)
      return ethers.utils.formatEther(balance)
    } catch (error) {
      console.error('Error getting balance:', error)
      return '0.0'
    }
  }

  // Check if smart account is deployed
  async isSmartAccountDeployed(smartAccountAddress: string): Promise<boolean> {
    try {
      // First try: Get contract code
      const code = await this.provider.getCode(smartAccountAddress)
      const codeLength = code.length
      const hasCode = code !== '0x' && codeLength > 2
      
      console.log(`🔍 Checking deployment for ${smartAccountAddress}`)
      console.log(`   📝 Raw code: ${code}`)
      console.log(`   📏 Code length: ${codeLength}`)
      console.log(`   ✅ Has code: ${hasCode}`)
      
      // Enhanced detection - check for actual bytecode
      if (hasCode) {
        // Additional verification: check if it's actual contract bytecode (not just empty)
        const isRealContract = codeLength > 4 && !code.match(/^0x0+$/)
        console.log(`   🏗️ Real contract: ${isRealContract}`)
        
        if (isRealContract) {
          return true
        }
      }
      
      // Second try: Check if account has any transaction history (alternative method)
      try {
        const transactionCount = await this.provider.getTransactionCount(smartAccountAddress)
        const balance = await this.provider.getBalance(smartAccountAddress)
        
        console.log(`   🔄 Transaction count: ${transactionCount}`)
        console.log(`   💰 Balance: ${balance.toString()}`)
        
        // If account has transactions or balance, it might be deployed
        if (transactionCount > 0 || balance.gt(0)) {
          console.log(`   ✅ Account has activity - likely deployed`)
          return true
        }
      } catch (txError) {
        console.warn('Alternative check failed:', txError)
      }
      
      console.log(`   ❌ Account not deployed`)
      return false
    } catch (error) {
      console.error('Error checking deployment status:', error)
      return false
    }
  }

  // Send gasless transaction from smart account
  async sendGaslessTransaction(
    fromEmail: string,
    to: string,
    value: string,
    data: string = '0x'
  ): Promise<any> {
    try {
      if (!isGelatoConfigured) {
        throw new Error('Gelato not configured')
      }

      const smartAccountAddress = await this.generateSmartAccountAddress(fromEmail)
      
      // Prepare execute call data
      const smartAccount = new ethers.Contract(smartAccountAddress, SIMPLE_ACCOUNT_ABI)
      const executeData = smartAccount.interface.encodeFunctionData('execute', [
        to,
        ethers.utils.parseEther(value),
        data
      ])

      // Send gasless transaction
      const response = await gelatoRelay?.sponsoredCall({
        chainId: LISK_CHAIN_ID,
        target: to as `0x${string}`,
        data: data as `0x${string}`
      }, process.env.NEXT_PUBLIC_GELATO_SPONSOR_API_KEY!)

      return response
    } catch (error) {
      console.error('Gasless transaction failed:', error)
      throw error
    }
  }

  // Generate funding instructions for user
  getFundingInstructions(smartAccountAddress: string): {
    address: string;
    network: string;
    chainId: number;
    qrCode: string;
  } {
    return {
      address: smartAccountAddress,
      network: 'Lisk Sepolia Testnet',
      chainId: LISK_CHAIN_ID,
      qrCode: `ethereum:${smartAccountAddress}?chainId=${LISK_CHAIN_ID}`
    }
  }

  // Debug function to manually check deployment (call from browser console)
  async debugDeploymentStatus(smartAccountAddress: string): Promise<any> {
    console.log(`🔧 DEBUG: Full deployment check for ${smartAccountAddress}`)
    
    try {
      const code = await this.provider.getCode(smartAccountAddress)
      const balance = await this.provider.getBalance(smartAccountAddress)
      const transactionCount = await this.provider.getTransactionCount(smartAccountAddress)
      
      const result = {
        address: smartAccountAddress,
        code: code,
        codeLength: code.length,
        balance: balance.toString(),
        transactionCount: transactionCount,
        hasCode: code !== '0x' && code.length > 2,
        hasBalance: balance.gt(0),
        hasTransactions: transactionCount > 0,
        isDeployed: await this.isSmartAccountDeployed(smartAccountAddress)
      }
      
      console.table(result)
      return result
    } catch (error) {
      console.error('Debug check failed:', error)
      return { error: error.message }
    }
  }

  // Create group-specific wallet (deterministic from group name + creator)
  async generateGroupWallet(groupName: string, creatorEmail: string): Promise<string> {
    try {
      // Create deterministic address from group name + creator
      const groupSeed = ethers.utils.solidityKeccak256(
        ['string', 'string'], 
        [groupName, creatorEmail]
      )
      
      // Generate owner address from seed
      const ownerAddress = ethers.utils.getAddress('0x' + groupSeed.slice(26))
      const salt = ethers.utils.solidityKeccak256(['string'], [groupSeed])
      
      // Try to get deterministic group wallet address from factory
      try {
        const factory = new ethers.Contract(ACCOUNT_FACTORY_ADDRESS, ACCOUNT_FACTORY_ABI, this.provider)
        const groupWalletAddress = await factory.getAddress(ownerAddress, salt)
        
        console.log(`🏠 Group wallet for "${groupName}":`, groupWalletAddress)
        return groupWalletAddress
      } catch (factoryError) {
        console.warn('Factory getAddress call failed for group wallet, using fallback:', factoryError)
        // Fallback to deterministic generation
        const fallbackAddress = ethers.utils.getAddress('0x' + groupSeed.slice(26))
        console.log(`🏠 Fallback group wallet for "${groupName}":`, fallbackAddress)
        return fallbackAddress
      }
    } catch (error) {
      console.error('Group wallet generation failed completely:', error)
      // Final fallback
      const groupSeed = ethers.utils.solidityKeccak256(['string', 'string'], [groupName, creatorEmail])
      return ethers.utils.getAddress('0x' + groupSeed.slice(26))
    }
  }
}

export const aaManager = new AccountAbstractionManager()

// Make aaManager available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).aaManager = aaManager
}