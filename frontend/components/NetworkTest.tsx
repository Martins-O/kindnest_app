'use client';

import { useEffect, useState } from 'react';
import { useAccount, useBlockNumber } from 'wagmi';

export function NetworkTest() {
  const { isConnected } = useAccount();
  const { data: blockNumber, error: blockError, isLoading: blockLoading } = useBlockNumber({
    query: {
      refetchInterval: 5000,
    },
  });
  const [rpcTest, setRpcTest] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    result?: string;
    error?: string;
  }>({ status: 'idle' });

  useEffect(() => {
    const testRpcDirectly = async () => {
      setRpcTest({ status: 'loading' });
      try {
        const response = await fetch('https://rpc.sepolia-api.lisk.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error.message);
        }
        
        setRpcTest({
          status: 'success',
          result: `Block: ${parseInt(data.result, 16)}`,
        });
      } catch (error: any) {
        setRpcTest({
          status: 'error',
          error: error.message || 'Unknown error',
        });
      }
    };

    if (isConnected) {
      testRpcDirectly();
    }
  }, [isConnected]);

  if (!isConnected) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-xs">
      <div className="text-yellow-400 font-bold mb-2">🔍 Network Debug</div>
      
      <div className="space-y-1">
        <div>
          Wagmi Block: {blockLoading ? '⏳' : blockError ? '❌' : blockNumber ? `${blockNumber}` : '?'}
        </div>
        
        <div>
          Direct RPC: {
            rpcTest.status === 'loading' ? '⏳' :
            rpcTest.status === 'error' ? `❌ ${rpcTest.error}` :
            rpcTest.status === 'success' ? `✅ ${rpcTest.result}` :
            '?'
          }
        </div>
      </div>
      
      {blockError && (
        <div className="text-red-400 text-xs mt-2">
          Wagmi Error: {blockError.message}
        </div>
      )}
    </div>
  );
}