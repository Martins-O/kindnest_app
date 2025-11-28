'use client';

import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { Copy, Check, Wallet } from 'lucide-react';
import { useState } from 'react';
import { formatAddress } from '@/lib/utils';

interface AppKitButtonProps {
    variant?: 'default' | 'compact' | 'account-only';
    className?: string;
}

export function AppKitButton({ variant = 'default', className = '' }: AppKitButtonProps) {
    const { open } = useAppKit();
    const { address, isConnected } = useAppKitAccount();
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Compact variant - icon only
    if (variant === 'compact') {
        return (
            <button
                onClick={() => open()}
                className={`p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-colors ${className}`}
                aria-label="Connect Wallet"
            >
                <Wallet className="h-5 w-5 text-white" />
            </button>
        );
    }

    // Account-only variant - show address when connected
    if (variant === 'account-only' && isConnected && address) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 px-4 py-2 rounded-lg">
                    <span className="font-mono text-sm font-medium">
                        {formatAddress(address)}
                    </span>
                    <button
                        onClick={handleCopy}
                        className="p-1 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded transition-colors"
                        aria-label="Copy address"
                    >
                        {copied ? (
                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </button>
                </div>
                <button
                    onClick={() => open({ view: 'Account' })}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium"
                >
                    Account
                </button>
            </div>
        );
    }

    // Default variant - connect button or account button
    if (isConnected && address) {
        return (
            <button
                onClick={() => open({ view: 'Account' })}
                className={`px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2 ${className}`}
            >
                <span className="font-mono text-sm">{formatAddress(address)}</span>
            </button>
        );
    }

    return (
        <button
            onClick={() => open()}
            className={`px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium ${className}`}
        >
            Connect Wallet
        </button>
    );
}

// Network button component
export function NetworkButton({ className = '' }: { className?: string }) {
    const { open } = useAppKit();
    const { caipNetwork } = useAppKitNetwork();

    if (!caipNetwork) return null;

    return (
        <button
            onClick={() => open({ view: 'Networks' })}
            className={`px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-lg text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors ${className}`}
        >
            {caipNetwork.name}
        </button>
    );
}
