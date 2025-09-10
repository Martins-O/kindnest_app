'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useCustomAuth } from './useCustomAuth'
import { sendGaslessTransaction, isGelatoConfigured } from '@/lib/gelato'

interface AAWalletState {
  smartAccountAddress: string | null
  isAAWallet: boolean
  loading: boolean
  balance: string
  sendGaslessTransaction: (target: string, data: string) => Promise<any>
  refreshBalance: () => Promise<void>
}

export function useAAWallet(): AAWalletState {
  const { user, isAuthenticated } = useCustomAuth()
  const [balance, setBalance] = useState('0')
  const [loading, setLoading] = useState(() => !isAuthenticated && user === null)

  // Set loading state
  useEffect(() => {
    setLoading(!isAuthenticated && user === null)
  }, [isAuthenticated, user])

  // Refresh balance
  const refreshBalance = async () => {
    if (!user?.smartAccountAddress) return

    try {
      // Get balance from LISK network
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      )
      const balanceWei = await provider.getBalance(user.smartAccountAddress)
      const balanceEth = ethers.utils.formatEther(balanceWei)
      setBalance(balanceEth)
    } catch (error) {
      setBalance('0')
    }
  }

  // Load balance on user change
  useEffect(() => {
    if (user?.smartAccountAddress) {
      refreshBalance()
    }
  }, [user])

  // Send gasless transaction
  const handleGaslessTransaction = async (target: string, data: string) => {
    if (!user?.smartAccountAddress) {
      throw new Error('No smart account available')
    }

    if (!isGelatoConfigured) {
      throw new Error('Gasless transactions not available - Gelato not configured')
    }

    try {
      const result = await sendGaslessTransaction(
        target,
        data,
        user.smartAccountAddress
      )
      
      // Refresh balance after transaction
      setTimeout(refreshBalance, 2000)
      
      return result
    } catch (error) {
      throw error
    }
  }

  return {
    smartAccountAddress: user?.smartAccountAddress || null,
    isAAWallet: !!user,
    loading,
    balance,
    sendGaslessTransaction: handleGaslessTransaction,
    refreshBalance
  }
}