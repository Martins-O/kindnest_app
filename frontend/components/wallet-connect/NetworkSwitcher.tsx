'use client';

import { useKindNestWallet } from '@/hooks/useKindNestWallet';
import { useAppKitNetwork } from '@reown/appkit/react';
import { ChevronDown, Globe, Loader2 } from 'lucide-react';
import { base, baseSepolia } from 'wagmi/chains';

interface NetworkSwitcherProps {
    variant?: 'default' | 'minimal';
    className?: string;
}

export function NetworkSwitcher({
    variant = 'default',
    className = ''
}: NetworkSwitcherProps) {
    const { open, isConnected } = useKindNestWallet();
    const { caipNetwork } = useAppKitNetwork();

    if (!isConnected) return null;

    const isTestnet = caipNetwork?.id === baseSepolia.id;

    if (variant === 'minimal') {
        return (
            <button
                onClick={() => open({ view: 'Networks' })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isTestnet
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    } ${className}`}
                aria-label={`Current network: ${caipNetwork?.name || 'Unknown'}. Click to switch.`}
            >
                <div className={`h-2 w-2 rounded-full ${isTestnet ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                <span>{caipNetwork?.name || 'Unknown Network'}</span>
            </button>
        );
    }

    return (
        <button
            onClick={() => open({ view: 'Networks' })}
            className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all ${className}`}
            aria-label="Switch Network"
        >
            <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                <Globe className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </div>

            <div className="flex flex-col items-start">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Network</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {caipNetwork?.name || 'Select Network'}
                </span>
            </div>

            <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
        </button>
    );
}
