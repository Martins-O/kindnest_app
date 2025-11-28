'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi';
import { wagmiAdapter, projectId, networks } from '@/lib/wagmi';
import { AAWalletProvider } from '@/components/auth/AAWalletProvider';

// Create Reown AppKit modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata: {
    name: 'KindNest',
    description: 'Community expense sharing platform - Together is easier',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://kindnest.app',
    icons: ['https://kindnest.app/icon.png']
  },
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'github', 'apple', 'discord'],
    emailShowWallets: true,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': 'Inter, system-ui, sans-serif',
    '--w3m-accent': '#10b981', // emerald-500
    '--w3m-color-mix': '#10b981',
    '--w3m-color-mix-strength': 20,
    '--w3m-border-radius-master': '8px',
    '--w3m-font-size-master': '14px',
  }
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
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