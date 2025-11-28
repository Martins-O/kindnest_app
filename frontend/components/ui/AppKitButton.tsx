'use client'

import { useAppKit, useAppKitAccount, useAppKitState } from '@reown/appkit/react'
import { Button } from './Button'
import { Wallet, LogOut, Copy, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { formatAddress } from '@/lib/utils'

interface AppKitButtonProps {
    variant?: 'default' | 'compact' | 'account-only'
    className?: string
    showBalance?: boolean
}

export function AppKitButton({
    variant = 'default',
    className = '',
    showBalance = false
}: AppKitButtonProps) {
    const { open } = useAppKit()
    const { address, isConnected } = useAppKitAccount()
    const { selectedNetworkId } = useAppKitState()
    const [copied, setCopied] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleCopyAddress = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (address) {
            await navigator.clipboard.writeText(address)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <Button
                variant="outline"
                className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200"
            >
                <Wallet className="h-4 w-4 mr-2" />
                Loading...
            </Button>
        )
    }

    // Compact variant - just the icon
    if (variant === 'compact') {
        return (
            <button
                onClick={() => open()}
                className={`p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white transition-all duration-300 hover:scale-105 shadow-lg ${className}`}
            >
                <Wallet className="h-5 w-5" />
            </button>
        )
    }

    // Account-only variant - show address and disconnect
    if (variant === 'account-only' && isConnected && address) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl shadow-lg">
                    <Wallet className="h-4 w-4" />
                    <div className="flex flex-col">
                        <span className="text-xs text-emerald-600 font-semibold">Connected</span>
                        <span className="font-mono text-sm font-bold">
                            {formatAddress(address)}
                        </span>
                    </div>
                    <button
                        onClick={handleCopyAddress}
                        className="p-1 hover:bg-emerald-200 rounded-lg transition-colors"
                        title="Copy address"
                    >
                        {copied ? (
                            <Check className="h-3 w-3 text-emerald-700" />
                        ) : (
                            <Copy className="h-3 w-3 text-emerald-700" />
                        )}
                    </button>
                </div>
                <button
                    onClick={() => open({ view: 'Account' })}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors"
                    title="Disconnect"
                >
                    <LogOut className="h-4 w-4" />
                </button>
            </div>
        )
    }

    // Default variant - full connect button
    if (!isConnected) {
        return (
            <Button
                onClick={() => open()}
                className={`bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] font-semibold ${className}`}
            >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
            </Button>
        )
    }

    return (
        <Button
            onClick={() => open({ view: 'Account' })}
            variant="outline"
            className={`bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-teal-100 transition-all duration-300 font-semibold ${className}`}
        >
            <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span className="font-mono text-sm font-bold">
                    {formatAddress(address || '')}
                </span>
            </div>
        </Button>
    )
}

interface NetworkButtonProps {
    className?: string
}

export function NetworkButton({ className = '' }: NetworkButtonProps) {
    const { open } = useAppKit()
    const { selectedNetworkId } = useAppKitState()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    const getNetworkName = (chainId?: number) => {
        switch (chainId) {
            case 84532:
                return 'Base Sepolia'
            case 8453:
                return 'Base'
            default:
                return 'Unknown Network'
        }
    }

    const isCorrectNetwork = selectedNetworkId === 84532 || selectedNetworkId === 8453

    return (
        <button
            onClick={() => open({ view: 'Networks' })}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${isCorrectNetwork
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                    : 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border border-red-200 animate-pulse'
                } ${className}`}
        >
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-blue-500' : 'bg-red-500'}`} />
                <span>{getNetworkName(selectedNetworkId)}</span>
            </div>
        </button>
    )
}
