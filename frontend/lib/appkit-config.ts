import { baseSepolia, base } from 'wagmi/chains'
import type { AppKitNetwork } from '@reown/appkit/networks'

// AppKit Configuration Constants
export const APPKIT_CONFIG = {
    // Project metadata
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',

    // Supported networks (explicitly typed for AppKit)
    networks: [baseSepolia, base] as [AppKitNetwork, ...AppKitNetwork[]],

    // Default network
    defaultNetwork: baseSepolia,

    // Metadata
    metadata: {
        name: 'KindNest',
        description: 'Support that feels human - Community expense sharing on Base',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://kindnest.app',
        icons: ['https://kindnest.app/icon.png'],
    },

    // Feature flags
    features: {
        analytics: true,
        email: true,
        emailShowWallets: true,
        socials: ['google', 'github', 'apple', 'discord', 'x', 'farcaster'] as const,
        swaps: false,
        onramp: false,
    },

    // Theme configuration
    themeMode: 'dark' as const,

    // Theme variables - KindNest brand colors
    themeVariables: {
        '--w3m-font-family': 'Inter, system-ui, sans-serif',
        '--w3m-accent': '#10b981', // emerald-500
        '--w3m-color-mix': '#10b981',
        '--w3m-color-mix-strength': 20,
        '--w3m-border-radius-master': '12px',
        '--w3m-font-size-master': '14px',
    },

    // Wallet configuration
    walletConfig: {
        // Featured wallets (shown first)
        featuredWalletIds: [
            'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
            'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
            '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
            '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
        ],

        // Include injected wallets
        includeWalletIds: 'ALL' as const,

        // Exclude specific wallets (if needed)
        excludeWalletIds: [],
    },

    // Chain images
    chainImages: {
        [baseSepolia.id]: 'https://avatars.githubusercontent.com/u/108554348?s=280&v=4',
        [base.id]: 'https://avatars.githubusercontent.com/u/108554348?s=280&v=4',
    },

    // Connector images
    connectorImages: {
        email: '/images/email-icon.svg',
    },

    // Terms of service and privacy policy
    termsConditionsUrl: 'https://kindnest.app/terms',
    privacyPolicyUrl: 'https://kindnest.app/privacy',

    // Enable session keys for gasless transactions
    enableInstallPrompt: true,
    enableWalletConnect: true,
    enableInjected: true,
    enableCoinbase: true,

    // AllWallets configuration
    allWallets: 'SHOW' as const,
}

// Validation
if (!APPKIT_CONFIG.projectId) {
    console.warn('⚠️ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. AppKit functionality may be limited.')
}

// Export individual configs for easier access
export const {
    projectId,
    networks,
    defaultNetwork,
    metadata,
    features,
    themeMode,
    themeVariables,
    walletConfig,
    chainImages,
    connectorImages,
} = APPKIT_CONFIG
