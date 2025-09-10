'use client'

import { useState } from 'react'
import { useConnect, useAccount } from 'wagmi'
import { Sparkles } from 'lucide-react'
import { EmailSignup } from './EmailSignup'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export function WalletSelector() {
  const [showEmailSignup, setShowEmailSignup] = useState(false)
  const { connect, connectors, isPending } = useConnect()
  const { isConnected } = useAccount()

  if (isConnected) {
    return null // User already connected
  }

  if (showEmailSignup) {
    return (
      <div className="w-full max-w-sm mx-auto space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setShowEmailSignup(false)}
          className="mb-4 border-white/30 text-white hover:bg-white/10 hover:border-white/40"
        >
          ← Back to options
        </Button>
        <EmailSignup />
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Email First - Primary Option */}
      <div className="mb-4">
        <Button
          onClick={() => setShowEmailSignup(true)}
          className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] py-4 text-lg font-semibold"
          size="lg"
        >
          <div className="flex items-center justify-center space-x-3">
            <Sparkles className="h-5 w-5" />
            <span>Continue with Email</span>
            <div className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
              No Wallet Needed
            </div>
          </div>
        </Button>
        <div className="text-center mt-3 text-sm text-white/70">
          <div className="flex items-center justify-center gap-4">
            <span>✨ Instant setup</span>
            <span>⚡ Zero gas fees</span>
            <span>🔒 Secure</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white/10 px-4 text-white/70 font-medium backdrop-blur-sm rounded-full">
            or connect wallet
          </span>
        </div>
      </div>

      {/* Traditional Wallet Options */}
      <div className="space-y-2">
        {connectors.map((connector) => (
          <Button
            key={connector.id}
            onClick={() => connect({ connector })}
            disabled={isPending}
            variant="outline"
            className="w-full border-white/30 text-white hover:bg-white/10 hover:border-white/40 py-3 font-medium"
          >
            {connector.name}
          </Button>
        ))}
      </div>
    </div>
  )
}