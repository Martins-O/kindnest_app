'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit';
import { merge } from 'lodash';
import { config } from '@/lib/wagmi';

import '@rainbow-me/rainbowkit/styles.css';

// Custom KindNest theme for RainbowKit
const kindNestTheme = merge({
  blurs: {
    modalOverlay: 'blur(6px)',
  },
  colors: {
    accentColor: '#10b981', // emerald-500
    accentColorForeground: '#ffffff',
    actionButtonBorder: 'rgba(16, 185, 129, 0.2)',
    actionButtonBorderMobile: 'rgba(16, 185, 129, 0.2)',
    actionButtonSecondaryBackground: 'rgba(16, 185, 129, 0.1)',
    closeButton: 'rgba(255, 255, 255, 0.8)',
    closeButtonBackground: 'rgba(0, 0, 0, 0.2)',
    connectButtonBackground: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    connectButtonBackgroundError: '#ef4444',
    connectButtonInnerBackground: 'rgba(0, 0, 0, 0.5)',
    connectButtonText: '#ffffff',
    connectButtonTextError: '#ffffff',
    connectionIndicator: '#10b981',
    downloadBottomCardBackground: 'rgba(0, 0, 0, 0.8)',
    downloadTopCardBackground: 'rgba(0, 0, 0, 0.9)',
    error: '#ef4444',
    generalBorder: 'rgba(255, 255, 255, 0.1)',
    generalBorderDim: 'rgba(255, 255, 255, 0.05)',
    menuItemBackground: 'rgba(16, 185, 129, 0.1)',
    modalBackdrop: 'rgba(0, 0, 0, 0.8)',
    modalBackground: 'rgba(15, 23, 42, 0.95)',
    modalBorder: 'rgba(255, 255, 255, 0.1)',
    modalText: '#ffffff',
    modalTextDim: 'rgba(255, 255, 255, 0.7)',
    modalTextSecondary: 'rgba(255, 255, 255, 0.8)',
    profileAction: 'rgba(16, 185, 129, 0.1)',
    profileActionHover: 'rgba(16, 185, 129, 0.2)',
    profileForeground: 'rgba(15, 23, 42, 0.95)',
    selectedOptionBorder: 'rgba(16, 185, 129, 0.3)',
    standby: 'rgba(255, 255, 255, 0.5)',
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
  },
  radii: {
    actionButton: '16px',
    connectButton: '12px',
    menuButton: '12px',
    modal: '24px',
    modalMobile: '20px',
  },
  shadows: {
    connectButton: '0 4px 20px rgba(16, 185, 129, 0.3)',
    dialog: '0 25px 50px rgba(0, 0, 0, 0.5)',
    profileDetailsAction: '0 2px 8px rgba(0, 0, 0, 0.1)',
    selectedOption: '0 4px 16px rgba(16, 185, 129, 0.2)',
    selectedWallet: '0 4px 16px rgba(16, 185, 129, 0.2)',
    walletLogo: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
} as Theme);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  }));

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={kindNestTheme} showRecentTransactions={true}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}