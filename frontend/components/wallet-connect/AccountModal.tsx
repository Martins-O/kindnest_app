'use client';

import { useKindNestWallet } from '@/hooks/useKindNestWallet';
import { WalletBalanceDisplay } from './WalletBalanceDisplay';
import { DisconnectButton } from './DisconnectButton';
import { NetworkSwitcher } from './NetworkSwitcher';
import { X, Copy, ExternalLink, User } from 'lucide-react';
import { useState } from 'react';
import { formatAddress } from '@/lib/utils';

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AccountModal({ isOpen, onClose }: AccountModalProps) {
    const { address, isConnected, chainId } = useKindNestWallet();
    const [copied, setCopied] = useState(false);

    if (!isOpen || !isConnected || !address) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const explorerUrl = chainId === 84532 // Base Sepolia
        ? `https://sepolia.basescan.org/address/${address}`
        : `https://basescan.org/address/${address}`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-modal-title"
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 id="account-modal-title" className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-emerald-500" />
                        Account Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Network & Balance */}
                    <div className="flex items-center justify-between">
                        <NetworkSwitcher variant="minimal" />
                        <WalletBalanceDisplay showRefresh={false} className="!bg-transparent !p-0" />
                    </div>

                    {/* Address Card */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Connected Address</div>
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-lg font-medium text-gray-900 dark:text-white">
                                {formatAddress(address, 6)}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                    title="Copy Address"
                                    aria-label={copied ? "Address copied" : "Copy address"}
                                >
                                    <Copy className={`h-4 w-4 ${copied ? 'text-emerald-500' : ''}`} />
                                </button>
                                <a
                                    href={explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="View on Explorer"
                                    aria-label="View on block explorer"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2">
                        <DisconnectButton
                            variant="outline"
                            className="w-full justify-center border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/10 dark:hover:border-red-800"
                            onDisconnect={onClose}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
