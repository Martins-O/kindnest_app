'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCustomAuth } from '@/hooks/useCustomAuth'
import { aaManager } from '@/lib/account-abstraction'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Wallet, Copy, RefreshCw, Send, QrCode, ExternalLink } from 'lucide-react'

export function SmartWallet() {
  const { user, isAuthenticated } = useCustomAuth()
  const [balance, setBalance] = useState('0.0')
  const [isDeployed, setIsDeployed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sendAmount, setSendAmount] = useState('')
  const [sendTo, setSendTo] = useState('')
  const [showFunding, setShowFunding] = useState(false)

  const loadWalletInfo = useCallback(async () => {
    if (!user?.smartAccountAddress) return
    
    setLoading(true)
    try {
      const [walletBalance, deployed] = await Promise.all([
        aaManager.getSmartAccountBalance(user.smartAccountAddress),
        aaManager.isSmartAccountDeployed(user.smartAccountAddress)
      ])
      
      setBalance(walletBalance)
      setIsDeployed(deployed)
    } catch (error) {
      console.error('Error loading wallet info:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.smartAccountAddress])

  // Load wallet info when user changes
  useEffect(() => {
    if (user?.smartAccountAddress) {
      loadWalletInfo()
    }
  }, [user, loadWalletInfo])

  const deployWallet = async () => {
    if (!user?.email) return
    
    setLoading(true)
    try {
      const result = await aaManager.deploySmartAccount(user.email)
      console.log('Wallet deployed:', result)
      
      // Poll for deployment status with retries
      const checkDeployment = async (maxRetries = 15, initialDelay = 3000, subsequentDelay = 2000) => {
        console.log('🔄 Starting deployment polling...')
        
        // First wait a bit longer for Gelato to process
        await new Promise(resolve => setTimeout(resolve, initialDelay))
        
        for (let i = 0; i < maxRetries; i++) {
          console.log(`🔄 Polling attempt ${i + 1}/${maxRetries}`)
          const deployed = await aaManager.isSmartAccountDeployed(user.smartAccountAddress!)
          
          if (deployed) {
            console.log('✅ Deployment detected! Refreshing wallet info...')
            await loadWalletInfo()
            return true
          }
          
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, subsequentDelay))
          }
        }
        
        console.log('⏰ Polling timeout - doing final refresh')
        // Final refresh even if not detected as deployed
        await loadWalletInfo()
        return false
      }
      
      await checkDeployment()
      
    } catch (error) {
      console.error('Deployment failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendTransaction = async () => {
    if (!user?.email || !sendTo || !sendAmount) return
    
    setLoading(true)
    try {
      const result = await aaManager.sendGaslessTransaction(
        user.email,
        sendTo,
        sendAmount
      )
      
      console.log('Transaction sent:', result)
      
      // Reset form and refresh balance
      setSendAmount('')
      setSendTo('')
      setTimeout(loadWalletInfo, 3000)
      
    } catch (error) {
      console.error('Transaction failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = () => {
    if (user?.smartAccountAddress) {
      navigator.clipboard.writeText(user.smartAccountAddress)
    }
  }

  const openExplorer = () => {
    if (user?.smartAccountAddress) {
      window.open(`https://sepolia-blockscout.lisk.com/address/${user.smartAccountAddress}`, '_blank')
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const fundingInfo = user.smartAccountAddress ? aaManager.getFundingInstructions(user.smartAccountAddress) : null

  return (
    <div className="wallet-card p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl">
          <Wallet className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800">Your Smart Wallet</h2>
          <p className="text-slate-600 text-lg">Gasless transactions powered by account abstraction</p>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 mb-6 border border-slate-200">
        <label className="block text-sm font-bold mb-3 text-slate-700">Smart Account Address</label>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-slate-300 rounded-xl px-4 py-3 font-mono text-sm break-all">
              {user.smartAccountAddress || 'Not generated'}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={copyAddress}
              className="bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={openExplorer}
              className="bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Wallet Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl p-6 border border-emerald-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">₿</span>
            </div>
            <span className="text-emerald-800 font-semibold">Balance</span>
          </div>
          <div className="text-3xl font-black text-emerald-800 mb-1">{balance} ETH</div>
          <p className="text-emerald-600 text-sm">Available for transactions</p>
        </div>

        <div className={`rounded-2xl p-6 border ${
          isDeployed 
            ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-200' 
            : 'bg-gradient-to-br from-orange-100 to-yellow-100 border-orange-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDeployed ? 'bg-green-500' : 'bg-orange-500'
            }`}>
              <span className="text-white text-lg">{isDeployed ? '✅' : '⏳'}</span>
            </div>
            <span className={`font-semibold ${
              isDeployed ? 'text-green-800' : 'text-orange-800'
            }`}>Status</span>
          </div>
          <div className={`text-3xl font-black mb-1 ${
            isDeployed ? 'text-green-800' : 'text-orange-800'
          }`}>
            {isDeployed ? 'Deployed' : 'Pending'}
          </div>
          <p className={`text-sm ${
            isDeployed ? 'text-green-600' : 'text-orange-600'
          }`}>
            {isDeployed ? 'Ready for transactions' : 'Click deploy to activate'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6 border border-indigo-200">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Wallet Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={loadWalletInfo} 
            variant="outline" 
            loading={loading}
            className="bg-white border-slate-300 text-slate-600 hover:bg-slate-50 px-6 py-3 rounded-xl"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
          
          {!isDeployed && (
            <Button 
              onClick={deployWallet} 
              loading={loading} 
              className="kindnest-button px-6 py-3"
            >
              Deploy Wallet
            </Button>
          )}
          
          <Button 
            onClick={() => setShowFunding(!showFunding)} 
            variant="outline"
            className="bg-white border-slate-300 text-slate-600 hover:bg-slate-50 px-6 py-3 rounded-xl"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Fund Wallet
          </Button>
        </div>
      </div>

      {/* Deployment Instructions */}
      {!isDeployed && (
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-2xl">📋</span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-blue-800 mb-2">Deployment Guide</h4>
              <p className="text-blue-700 mb-4">
                Click &quot;Deploy Wallet&quot; to create your smart account on-chain. 
                This process takes 30-60 seconds via Gelato relay and will automatically update your status.
              </p>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                <p className="text-blue-600 text-sm font-semibold">
                  💡 Tip: Check your browser console for detailed deployment progress
                </p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Funding Instructions */}
      {showFunding && fundingInfo && (
        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-emerald-800 mb-2">Fund Your Wallet</h4>
              <p className="text-emerald-700">
                Send ETH to your smart account address on {fundingInfo.network}
              </p>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-emerald-800">Your Address</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white border border-emerald-300 rounded-xl px-4 py-3 font-mono text-sm break-all">
                {fundingInfo.address}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={copyAddress}
                className="bg-white border-emerald-300 text-emerald-600 hover:bg-emerald-50"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 text-xl">⚠️</span>
              <div>
                <p className="text-yellow-800 font-semibold mb-1">Testnet Only</p>
                <p className="text-yellow-700 text-sm">
                  This is Lisk Sepolia testnet. Get free testnet ETH from the{' '}
                  <a 
                    href="https://sepolia-faucet.pk910.de/" 
                    target="_blank" 
                    className="underline hover:no-underline font-semibold"
                  >
                    Lisk Sepolia Faucet
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Transaction */}
      {isDeployed && parseFloat(balance) > 0 && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Send className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-purple-800 mb-2">Send ETH (Gasless)</h4>
              <p className="text-purple-700">Send funds without paying gas fees using account abstraction</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-purple-800">Recipient Address</label>
              <Input
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                placeholder="0x..."
                className="kindnest-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2 text-purple-800">Amount (ETH)</label>
              <Input
                type="number"
                step="0.001"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="0.01"
                className="kindnest-input"
              />
            </div>
            
            <Button 
              onClick={sendTransaction} 
              loading={loading}
              disabled={!sendTo || !sendAmount}
              className="w-full kindnest-button text-lg py-4"
            >
              <Send className="h-5 w-5 mr-3" />
              {loading ? 'Sending...' : 'Send (No Gas Fees!)'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}