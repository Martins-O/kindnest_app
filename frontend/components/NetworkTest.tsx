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
      // Only test once per session to avoid spamming
      const lastTest = localStorage.getItem('rpc_test_time');
      const now = Date.now();
      
      if (lastTest && now - parseInt(lastTest) < 60000) { // Don't test more than once per minute
        setRpcTest({ status: 'success', result: 'Cached OK' });
        return;
      }
      
      setRpcTest({ status: 'loading' });
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia-api.lisk.com', {
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
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error.message);
        }
        
        localStorage.setItem('rpc_test_time', now.toString());
        setRpcTest({
          status: 'success',
          result: `Block: ${parseInt(data.result, 16)}`,
        });
      } catch (error: any) {
        console.warn('RPC test failed:', error.message); // Use console.warn instead of error
        setRpcTest({
          status: 'error',
          error: error.name === 'AbortError' ? 'Timeout' : (error.message || 'Unknown error'),
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