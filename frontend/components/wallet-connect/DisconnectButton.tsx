'use client';

import { useState } from 'react';
import { useKindNestWallet } from '@/hooks/useKindNestWallet';
import { LogOut } from 'lucide-react';

interface DisconnectButtonProps {
    showConfirmation?: boolean;
    variant?: 'default' | 'outline' | 'ghost';
    className?: string;
    onDisconnect?: () => void;
}

export function DisconnectButton({
    showConfirmation = true,
    variant = 'default',
    className = '',
    onDisconnect
}: DisconnectButtonProps) {
    const { disconnect } = useKindNestWallet();
    const [showDialog, setShowDialog] = useState(false);

    const handleDisconnect = () => {
        if (showConfirmation) {
            setShowDialog(true);
        } else {
            disconnect();
            onDisconnect?.();
        }
    };

    const confirmDisconnect = () => {
        disconnect();
        setShowDialog(false);
        onDisconnect?.();
    };

    const variantStyles = {
        default: 'bg-red-500 hover:bg-red-600 text-white',
        outline: 'border-2 border-red-500 text-red-500 hover:bg-red-50',
        ghost: 'text-red-500 hover:bg-red-50'
    };

    return (
        <>
            <button
                onClick={handleDisconnect}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${variantStyles[variant]} ${className}`}
                aria-label="Disconnect wallet"
            >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Disconnect</span>
            </button>

            {/* Confirmation Dialog */}
            {showDialog && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="disconnect-dialog-title"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm mx-4 shadow-xl">
                        <h2
                            id="disconnect-dialog-title"
                            className="text-xl font-bold text-gray-900 dark:text-white mb-2"
                        >
                            Disconnect Wallet?
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to disconnect your wallet?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={confirmDisconnect}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                autoFocus
                            >
                                Disconnect
                            </button>
                            <button
                                onClick={() => setShowDialog(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
