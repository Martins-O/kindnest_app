'use client';

import { ReactNode } from 'react';
import { useKindNestWallet } from '@/hooks/useKindNestWallet';
import { baseSepolia, base } from 'wagmi/chains';
import { AlertTriangle } from 'lucide-react';

interface ChainCheckerProps {
    children: ReactNode;
    requiredChainId?: number;
    showWarning?: boolean;
    className?: string;
}

export function ChainChecker({
    children,
    requiredChainId,
    showWarning = true,
    className = ''
}: ChainCheckerProps) {
    const { chainId, open, isConnected } = useKindNestWallet();

    if (!isConnected) {
        return <>{children}</>;
    }

    const currentChainId = typeof chainId === 'number' ? chainId : parseInt(String(chainId || '0'));
    const isCorrectChain = requiredChainId
        ? currentChainId === requiredChainId
        : currentChainId === baseSepolia.id || currentChainId === base.id;

    const getChainName = (id: number) => {
        if (id === baseSepolia.id) return 'Base Sepolia';
        if (id === base.id) return 'Base';
        return `Chain ${id}`;
    };

    if (isCorrectChain) {
        return <div className={className}>{children}</div>;
    }

    if (!showWarning) {
        return null;
    }

    return (
        <div className={className}>
            <div
                className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 mb-4"
                role="alert"
                aria-live="assertive"
            >
                <div className="flex items-start gap-3">
                    <AlertTriangle
                        className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                    />
                    <div className="flex-1">
                        <h3 className="font-bold text-yellow-900 dark:text-yellow-100 mb-1">
                            Wrong Network
                        </h3>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                            You&apos;re currently on {getChainName(currentChainId)}.
                            {requiredChainId && ` Please switch to ${getChainName(requiredChainId)}.`}
                        </p>
                        <button
                            onClick={() => open({ view: 'Networks' })}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            aria-label="Switch network"
                        >
                            Switch Network
                        </button>
                    </div>
                </div>
            </div>
            <div className="opacity-50 pointer-events-none" aria-disabled="true">
                {children}
            </div>
        </div>
    );
}
