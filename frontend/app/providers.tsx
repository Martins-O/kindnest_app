'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { WagmiProvider } from 'wagmi';
import { AAWalletProvider } from '@/components/auth/AAWalletProvider';
import {
  projectId,
  networks,
  metadata,
  features,
  themeMode,
  themeVariables,
  chainImages
} from '@/lib/appkit-config';

// Create WagmiAdapter instance
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
})

// Create Reown AppKit modal with advanced configuration
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  features: {
    ...features,
    // Enable all social login providers
    socials: ['google', 'github', 'apple', 'discord', 'x', 'farcaster'],
    // Enable email with wallet display
    email: true,
    emailShowWallets: true,
    // Enable analytics for tracking
    analytics: true,
    // Disable swaps and onramp for now
    swaps: false,
    onramp: false,
  },
  themeMode,
  themeVariables: {
    ...themeVariables,
    // Additional custom styling
    '--w3m-z-index': 1000,
  },
  chainImages,
  // Enable wallet features
  enableWalletConnect: true,
  enableInjected: true,
  enableCoinbase: true,
  // Additional wallet configuration
  allWallets: 'SHOW',
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
  ],
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1,
      },
    },
  }));

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AAWalletProvider>
          {children}
        </AAWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}