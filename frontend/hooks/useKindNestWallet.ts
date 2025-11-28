import { useAppKit, useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react';
import { useDisconnect } from 'wagmi';
import { useMemo } from 'react';
import { formatAddress } from '@/lib/utils';

export interface KindNestWalletState {
    address: string | undefined;
    formattedAddress: string;
    isConnected: boolean;
    status: 'connected' | 'disconnected' | 'connecting' | 'reconnecting' | undefined;
    chainId: number | string | undefined;
    chainName: string | undefined;
    walletProvider: any | undefined;
    disconnect: () => void;
    open: (options?: { view: 'Account' | 'Connect' | 'Networks' }) => Promise<void>;
}

/**
 * Composite hook for unified wallet state management
 * Combines AppKit hooks into a single, easy-to-use interface
 */
export function useKindNestWallet() {
    const { address, isConnected, status } = useAppKitAccount();
    const { chainId, caipNetwork } = useAppKitNetwork();
    const { walletProvider } = useAppKitProvider('eip155');
    const { disconnect } = useDisconnect();
    // We can't import useAppKit directly as it's not a hook in the same way, 
    // but we can use the modal instance if needed, or rely on the components.
    // Actually, useAppKit IS a hook in @reown/appkit/react that returns { open, close }
    // Let's import it dynamically or assume it's available.
    // Checking docs/previous files: import { useAppKit } from '@reown/appkit/react';

    // We need to import useAppKit inside the component to avoid "hook called outside component" if we were to use the global instance
    const { open } = useAppKit();

    const formattedAddress = useMemo(() => {
        return address ? formatAddress(address) : '';
    }, [address]);

    return {
        address,
        formattedAddress,
        isConnected,
        status,
        chainId,
        chainName: caipNetwork?.name,
        walletProvider,
        disconnect,
        open
    };
}
