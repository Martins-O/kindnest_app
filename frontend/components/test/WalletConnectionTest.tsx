'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useEffect, useState } from 'react'

export function WalletConnectionTest() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [connectionStatus, setConnectionStatus] = useState<string>('')

  useEffect(() => {
    if (isConnected && chain) {
      setConnectionStatus(`✅ Connected to ${chain.name} (ID: ${chain.id})`)
    } else {
      setConnectionStatus('❌ Not connected')
    }
  }, [isConnected, chain])

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">LISK Network Connection Test</h3>
      
      <div className="mb-4">
        <p><strong>Status:</strong> {connectionStatus}</p>
        {address && <p><strong>Address:</strong> {address}</p>}
        {chain && (
          <div>
            <p><strong>Chain:</strong> {chain.name}</p>
            <p><strong>Chain ID:</strong> {chain.id}</p>
            <p><strong>Expected:</strong> LISK Sepolia (4202)</p>
          </div>
        )}
      </div>

      <div className="space-x-2">
        {!isConnected ? (
          connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              disabled={isPending}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Connect {connector.name}
            </button>
          ))
        ) : (
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  )
}