import { useEffect } from 'react';
import { useAppKitAccount, useAppKitNetwork, useAppKitEvents } from '@reown/appkit/react';
import { type AppKitEventData } from '@/types/appkit';

/**
 * Hook to handle AppKit integration events and side effects
 * Logs connection events and manages network switching tracking
 */
export function useAppKitIntegration() {
    const { address, isConnected, status } = useAppKitAccount();
    const { chainId } = useAppKitNetwork();

    // Use the events hook if available, otherwise we simulate event tracking via effects
    const events = useAppKitEvents();

    useEffect(() => {
        if (isConnected && address) {
            console.log(`[AppKit] Wallet connected: ${address} (${status})`);
        } else if (!isConnected && status === 'disconnected') {
            console.log('[AppKit] Wallet disconnected');
        }
    }, [isConnected, address, status]);

    useEffect(() => {
        if (chainId) {
            console.log(`[AppKit] Network switched to chain ID: ${chainId}`);
        }
    }, [chainId]);

    // Log specific AppKit events if the hook returns them
    useEffect(() => {
        if (events) {
            // Assuming events is an object or stream we can subscribe to
            // For now, we just log the event object if it changes
            // console.log('[AppKit] Event:', events);
        }
    }, [events]);

    return {
        events
    };
}
