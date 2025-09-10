'use client';

import { GelatoRelay } from '@gelatonetwork/relay-sdk'

const GELATO_SPONSOR_API_KEY = process.env.NEXT_PUBLIC_GELATO_SPONSOR_API_KEY || ''

// Only initialize if API key is available
export const gelatoRelay = GELATO_SPONSOR_API_KEY ? new GelatoRelay() : null

// Check if Gelato is properly configured
export const isGelatoConfigured = !!GELATO_SPONSOR_API_KEY

// LISK Sepolia configuration
export const LISK_CHAIN_ID = 4202
export const LISK_RPC_URL = 'https://rpc.sepolia-api.lisk.com'

// Gelato relay configuration for LISK
export const RELAY_CONFIG = {
  chainId: LISK_CHAIN_ID,
  rpcUrl: LISK_RPC_URL,
  sponsorApiKey: GELATO_SPONSOR_API_KEY
}

// Helper function to send gasless transaction
export async function sendGaslessTransaction(
  target: string,
  data: string,
  userAddress: string
) {
  if (!gelatoRelay || !GELATO_SPONSOR_API_KEY) {
    throw new Error('Gelato not configured - gasless transactions unavailable')
  }

  try {
    const request = {
      chainId: LISK_CHAIN_ID,
      target: target as `0x${string}`,
      data: data as `0x${string}`,
      user: userAddress as `0x${string}`
    }

    const response = await gelatoRelay.sponsoredCall(request, GELATO_SPONSOR_API_KEY)
    return response
  } catch (error) {
    throw error
  }
}