'use client';

import { useKindNestWallet } from '@/hooks/useKindNestWallet';
import { formatEther } from 'viem';
import { CheckCircle2, AlertCircle, ArrowRight, ExternalLink, Loader2 } from 'lucide-react';

interface TransactionConfirmationProps {
    to: string;
    value?: bigint;
    data?: string;
    estimatedGas?: bigint;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
    isProcessing: boolean;
    error?: Error | null;
    txHash?: string;
}

export function TransactionConfirmation({
    to,
    value = BigInt(0),
    data,
    estimatedGas,
    onConfirm,
    onCancel,
    isProcessing,
    error,
    txHash
}: TransactionConfirmationProps) {
    const { chainId } = useKindNestWallet();

    const getExplorerUrl = (hash: string) => {
        const baseUrl = chainId === 84532 ? 'https://sepolia.basescan.org' : 'https://basescan.org';
        return `${baseUrl}/tx/${hash}`;
    };

    if (txHash) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center animate-in fade-in zoom-in-95">
                <div className="mx-auto h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Transaction Submitted
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Your transaction has been submitted to the network.
                </p>
                <a
                    href={getExplorerUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                    View on Explorer
                    <ExternalLink className="h-4 w-4" />
                </a>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 w-full max-w-md">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Confirm Transaction
                </h3>
            </div>

            <div className="p-6 space-y-6">
                {/* Amount */}
                <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {formatEther(value)} ETH
                    </div>
                    {estimatedGas && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            + {formatEther(estimatedGas)} ETH (Gas)
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">To</span>
                        <span className="font-mono text-gray-900 dark:text-white truncate max-w-[200px]" title={to}>
                            {to}
                        </span>
                    </div>
                    {data && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Data</span>
                            <span className="font-mono text-gray-900 dark:text-white truncate max-w-[200px]">
                                {data}
                            </span>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-600 dark:text-red-400">
                            {error.message || 'Transaction failed'}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Confirming...
                            </>
                        ) : (
                            <>
                                Confirm
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
