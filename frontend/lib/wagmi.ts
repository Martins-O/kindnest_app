import { http, createConfig } from 'wagmi'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'

// Verify wagmi has LISK support
const liskChainConfig = {
  id: 1135,
  name: 'Lisk',
  network: 'lisk',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://rpc.api.lisk.com'] },
    default: { http: ['https://rpc.api.lisk.com'] },
  },
  blockExplorers: {
    etherscan: { name: 'Blockscout', url: 'https://blockscout.lisk.com' },
    default: { name: 'Blockscout', url: 'https://blockscout.lisk.com' },
  },
}

const liskSepoliaConfig = {
  id: 4202,
  name: 'Lisk Sepolia',
  network: 'lisk-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://rpc.sepolia-api.lisk.com'] },
    default: { http: ['https://rpc.sepolia-api.lisk.com'] },
  },
  blockExplorers: {
    etherscan: { name: 'Blockscout', url: 'https://sepolia-blockscout.lisk.com' },
    default: { name: 'Blockscout', url: 'https://sepolia-blockscout.lisk.com' },
  },
  testnet: true,
}

export const config = createConfig({
  chains: [liskSepoliaConfig, liskChainConfig], // Testnet first for development
  connectors: [
    // metaMask(),
    coinbaseWallet({ appName: 'KindNest - Community Care Platform' }),
  ],
  transports: {
    [liskSepoliaConfig.id]: http('https://rpc.sepolia-api.lisk.com'),
    [liskChainConfig.id]: http('https://rpc.api.lisk.com'),
  },
})

// Export chain configs for use throughout app
export { liskChainConfig as lisk, liskSepoliaConfig as liskSepolia }
export const defaultChain = liskSepoliaConfig // Use testnet for development