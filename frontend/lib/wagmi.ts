import { cookieStorage, createStorage, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// Get projectId from environment
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set')
}

// Define networks
export const networks = [baseSepolia, base] as const

// Create Wagmi Adapter for Reown AppKit
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
})

export const config = wagmiAdapter.wagmiConfig

// Export chain configs for use throughout app
export { base, baseSepolia }
export const defaultChain = baseSepolia // Use testnet for development