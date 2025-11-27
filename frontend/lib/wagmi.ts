import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia, base], // Testnet first for development
  connectors: [
    // metaMask(),
    coinbaseWallet({ appName: 'KindNest - Community Care Platform' }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
  },
})

// Export chain configs for use throughout app
export { base, baseSepolia }
export const defaultChain = baseSepolia // Use testnet for development