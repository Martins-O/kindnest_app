'use client';

import { useKindNestWallet } from '@/hooks/useKindNestWallet';
import { Loader2, Wallet, AlertCircle } from 'lucide-react';
import { formatAddress } from '@/lib/utils';

interface WalletConnectButtonProps {
    variant?: 'default' | 'outline' | 'ghost' | 'compact';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showBalance?: boolean;
    label?: string;
    loadingLabel?: string;
}

export function WalletConnectButton({
    variant = 'default',
    size = 'md',
    className = '',
    showBalance = false,
    label = 'Connect Wallet',
    loadingLabel = 'Connecting...'
}: WalletConnectButtonProps) {
    const { open, isConnected, address, status } = useKindNestWallet();
    const isLoading = status === 'connecting' || status === 'reconnecting';

    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg'
    };

    const variantStyles = {
        default: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm',
        outline: 'border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
        ghost: 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
        compact: 'p-2 aspect-square flex items-center justify-center'
    };

    const baseStyles = 'rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

    if (isLoading) {
        return (
            <button
                disabled
                className={`${baseStyles} ${variantStyles[variant]} ${variant !== 'compact' ? sizeStyles[size] : ''} ${className}`}
                aria-busy="true"
                aria-label={loadingLabel}
            >
                <Loader2 className="h-4 w-4 animate-spin" />
                {variant !== 'compact' && <span>{loadingLabel}</span>}
            </button>
        );
    }

    if (isConnected && address) {
        return (
            <button
                onClick={() => open({ view: 'Account' })}
                className={`${baseStyles} ${variantStyles[variant]} ${variant !== 'compact' ? sizeStyles[size] : ''} ${className}`}
                aria-label={`Account: ${formatAddress(address)}`}
            >
                {variant === 'compact' ? (
                    <div className="relative">
                        <Wallet className="h-5 w-5" />
                        <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                    </div>
                ) : (
                    <>
                        <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="font-mono">{formatAddress(address)}</span>
                    </>
                )}
            </button>
        );
    }

    return (
        <button
            onClick={() => open()}
            className={`${baseStyles} ${variantStyles[variant]} ${variant !== 'compact' ? sizeStyles[size] : ''} ${className}`}
            aria-label={label}
        >
            {variant === 'compact' ? (
                <Wallet className="h-5 w-5" />
            ) : (
                <>
                    <Wallet className="h-4 w-4" />
                    <span>{label}</span>
                </>
            )}
        </button>
    );
}
