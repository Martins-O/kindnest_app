'use client';

import { useEffect, useState } from 'react';
import { useBalance } from 'wagmi';
import { useKindNestWallet } from '@/hooks/useKindNestWallet';
import { RefreshCw } from 'lucide-react';
import { formatEther } from 'viem';

interface WalletBalanceDisplayProps {
    showRefresh?: boolean;
    className?: string;
    decimals?: number;
}

export function WalletBalanceDisplay({
    showRefresh = true,
    className = '',
    decimals = 4
}: WalletBalanceDisplayProps) {
    const { address, isConnected } = useKindNestWallet();
    const { data: balance, isLoading, refetch } = useBalance({
        address: address as `0x${string}`,
    });
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    if (!isConnected || !address) {
        return null;
    }

    const formattedBalance = balance
        ? parseFloat(formatEther(balance.value)).toFixed(decimals)
        : '0.0000';

    return (
        <div
            className={`flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 ${className}`}
            role="status"
            aria-live="polite"
            aria-label="Wallet balance"
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                    <span className="sr-only">Loading balance...</span>
                </div>
            ) : (
                <>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Balance</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                            {formattedBalance} ETH
                        </span>
                    </div>
                    {showRefresh && (
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                            aria-label="Refresh balance"
                        >
                            <RefreshCw
                                className={`h-4 w-4 text-gray-600 dark:text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`}
                                aria-hidden="true"
                            />
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
