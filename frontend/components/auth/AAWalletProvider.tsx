'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAAWallet } from '@/hooks/useAAWallet'

const AAWalletContext = createContext<ReturnType<typeof useAAWallet> | null>(null)

export function AAWalletProvider({ children }: { children: ReactNode }) {
  const aaWallet = useAAWallet()

  return (
    <AAWalletContext.Provider value={aaWallet}>
      {children}
    </AAWalletContext.Provider>
  )
}

export function useAAWalletContext() {
  const context = useContext(AAWalletContext)
  if (!context) {
    throw new Error('useAAWalletContext must be used within AAWalletProvider')
  }
  return context
}