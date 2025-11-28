// Type definitions for Reown AppKit integration

export type SocialProvider = 'google' | 'github' | 'apple' | 'discord' | 'x' | 'farcaster'

export type NetworkType = 'mainnet' | 'testnet'

export interface AppKitMetadata {
    name: string
    description: string
    url: string
    icons: string[]
}

export interface AppKitFeatures {
    analytics?: boolean
    email?: boolean
    emailShowWallets?: boolean
    socials?: readonly SocialProvider[]
    swaps?: boolean
    onramp?: boolean
}

export interface AppKitThemeVariables {
    '--w3m-font-family'?: string
    '--w3m-accent'?: string
    '--w3m-color-mix'?: string
    '--w3m-color-mix-strength'?: number
    '--w3m-border-radius-master'?: string
    '--w3m-font-size-master'?: string
    [key: string]: string | number | undefined
}

export interface AppKitWalletConfig {
    featuredWalletIds?: string[]
    includeWalletIds?: 'ALL' | 'ONLY_MOBILE' | 'ONLY_INJECTED' | string[]
    excludeWalletIds?: string[]
}

export interface AppKitConfig {
    projectId: string
    networks: readonly any[]
    defaultNetwork?: any
    metadata: AppKitMetadata
    features?: AppKitFeatures
    themeMode?: 'dark' | 'light'
    themeVariables?: AppKitThemeVariables
    walletConfig?: AppKitWalletConfig
    chainImages?: Record<number, string>
    connectorImages?: Record<string, string>
    termsConditionsUrl?: string
    privacyPolicyUrl?: string
    enableInstallPrompt?: boolean
    enableWalletConnect?: boolean
    enableInjected?: boolean
    enableCoinbase?: boolean
    allWallets?: 'SHOW' | 'HIDE' | 'ONLY_MOBILE'
}

// AppKit hook return types
export interface AppKitAccountInfo {
    address?: string
    isConnected: boolean
    caipAddress?: string
    status?: 'connected' | 'disconnected' | 'connecting' | 'reconnecting'
}

export interface AppKitNetworkInfo {
    selectedNetworkId?: number
    caipNetwork?: any
    switchNetwork?: (chainId: number) => Promise<void>
}

export interface AppKitStateInfo {
    open: boolean
    selectedNetworkId?: number
}

export interface AppKitModalOptions {
    view?: 'Account' | 'Connect' | 'Networks' | 'ApproveTransaction' | 'OnRampProviders'
}

// Connection event types
export type AppKitConnectionEvent =
    | 'CONNECT_SUCCESS'
    | 'DISCONNECT_SUCCESS'
    | 'SWITCH_NETWORK'
    | 'MODAL_OPEN'
    | 'MODAL_CLOSE'

export interface AppKitEventData {
    event: AppKitConnectionEvent
    data?: any
    timestamp: number
}
