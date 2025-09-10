'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { aaManager } from '@/lib/account-abstraction'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('Processing...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('Confirming email...')
        
        // Handle the auth callback from URL hash/search params
        const { data, error } = await supabase.auth.getSession()
        
        // Also try to exchange code from URL if getSession doesn't work
        if (!data.session) {
          const urlParams = new URLSearchParams(window.location.search)
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          
          // Check for access_token in hash (magic link)
          if (hashParams.get('access_token')) {
            await supabase.auth.setSession({
              access_token: hashParams.get('access_token')!,
              refresh_token: hashParams.get('refresh_token')!
            })
          }
        }
        
        if (error) {
          setStatus('Authentication failed')
          setTimeout(() => router.push('/?error=auth_failed'), 2000)
          return
        }

        if (data.session && data.session.user) {
          setStatus('Creating your smart account...')
          
          // Create smart account mapping if it doesn't exist
          const existingWallet = await aaManager.getUserWallet(data.session.user.id)
          
          if (!existingWallet && data.session.user.email) {
            const smartAccountAddress = await aaManager.generateSmartAccountAddress(data.session.user.email)
            await aaManager.storeUserWallet(
              data.session.user.id,
              data.session.user.email,
              smartAccountAddress
            )
          }
          
          setStatus('Welcome to KindNest!')
          setTimeout(() => router.push('/dashboard'), 1500)
        } else {
          setStatus('No session found')
          setTimeout(() => router.push('/'), 2000)
        }
      } catch (error) {
        setStatus('Something went wrong')
        setTimeout(() => router.push('/?error=callback_failed'), 2000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white">Completing sign in...</p>
      </div>
    </div>
  )
}