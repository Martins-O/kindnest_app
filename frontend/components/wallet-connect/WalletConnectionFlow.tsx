'use client';

import { useState } from 'react';
import { useKindNestWallet } from '@/hooks/useKindNestWallet';
import { WalletConnectButton } from './WalletConnectButton';
import { Mail, ArrowRight, Check } from 'lucide-react';

interface WalletConnectionFlowProps {
    onComplete?: () => void;
    className?: string;
}

export function WalletConnectionFlow({ onComplete, className = '' }: WalletConnectionFlowProps) {
    const { isConnected, open } = useKindNestWallet();
    const [step, setStep] = useState<'intro' | 'method' | 'connecting'>('intro');

    if (isConnected) {
        return (
            <div className={`text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-2xl ${className}`}>
                <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-4">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Wallet Connected!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    You&apos;re ready to start using KindNest.
                </p>
                <button
                    onClick={onComplete}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                    Continue
                </button>
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden ${className}`}>
            {/* Progress Bar */}
            <div className="h-1 bg-gray-100 dark:bg-gray-800">
                <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: step === 'intro' ? '33%' : step === 'method' ? '66%' : '100%' }}
                />
            </div>

            <div className="p-8">
                {step === 'intro' && (
                    <div className="text-center animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Welcome to KindNest
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                            Connect your wallet to start sharing expenses and managing groups with your community.
                        </p>
                        <button
                            onClick={() => setStep('method')}
                            className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
                        >
                            Get Started
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {step === 'method' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                            Choose Connection Method
                        </h3>

                        <div className="space-y-4">
                            <button
                                onClick={() => open()}
                                className="w-full p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 transition-all flex items-center gap-4 group"
                            >
                                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-900 dark:text-white">Email or Social</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Connect with Google, Apple, or Email</div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or use a wallet</span>
                                </div>
                            </div>

                            <WalletConnectButton
                                className="w-full justify-center py-4 text-lg"
                                label="Connect Crypto Wallet"
                            />
                        </div>

                        <button
                            onClick={() => setStep('intro')}
                            className="mt-6 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 w-full text-center"
                        >
                            Back to Introduction
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
