import { WalletConnectionTest } from '@/components/test/WalletConnectionTest'

export default function TestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1>LISK Integration Test</h1>
      <WalletConnectionTest />
    </div>
  )
}