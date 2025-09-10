'use client'

import { useState, useEffect } from 'react'
import { sendOTP, verifyOTP, getUserProfile, logout, checkExistingEmail, type User } from '@/lib/auth-api'
import { aaManager } from '@/lib/account-abstraction'

export function useCustomAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('🔍 useCustomAuth: Loading user profile...')
        const { user, error } = await getUserProfile()
        console.log('🔍 useCustomAuth: Profile result:', { user: !!user, error })
        
        // If user exists but no smart account address, generate it locally
        if (user && !user.smartAccountAddress && user.email) {
          console.log('🔧 Generating smart account address locally for:', user.email)
          try {
            const smartAccountAddress = await aaManager.generateSmartAccountAddress(user.email)
            user.smartAccountAddress = smartAccountAddress
            console.log('✅ Generated smart account address:', smartAccountAddress)
          } catch (smartAccountError) {
            console.error('❌ Failed to generate smart account address:', smartAccountError)
          }
        }
        
        setUser(user)
        setIsAuthenticated(!!user)
        console.log('🔍 useCustomAuth: State updated - isAuthenticated:', !!user)
      } catch (error) {
        console.log('🔍 useCustomAuth: Error loading user:', error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const checkEmailExists = async (email: string) => {
    return await checkExistingEmail(email)
  }

  const loginWithExistingEmail = async (email: string) => {
    const result = await checkExistingEmail(email)
    if (result.exists && result.user) {
      // Auto-login the user
      const normalizedEmail = email.toLowerCase().trim()
      
      // Generate smart account address if not present
      if (!result.user.smartAccountAddress) {
        try {
          const smartAccountAddress = await aaManager.generateSmartAccountAddress(normalizedEmail)
          result.user.smartAccountAddress = smartAccountAddress
        } catch (error) {
          console.error('Failed to generate smart account address:', error)
        }
      }
      
      // For existing users, we should get a proper JWT token from backend
      // For now, let's verify through backend to get a real JWT
      try {
        console.log('🔄 Getting proper JWT token from backend for existing user')
        const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: result.user.email,
            smartAccountAddress: result.user.smartAccountAddress
          }),
        })

        if (loginResponse.ok) {
          const loginData = await loginResponse.json()
          if (loginData.token) {
            localStorage.setItem('kindnest_token', loginData.token)
            localStorage.setItem('kindnest_user_cache', JSON.stringify(result.user))
          } else {
            throw new Error('No token received from backend')
          }
        } else {
          throw new Error('Backend login failed')
        }
      } catch (backendError) {
        console.warn('Backend JWT token creation failed, using fallback:', backendError)
        // Fallback: create a temporary token (this should be improved)
        const sessionToken = `session-${result.user.id}-${Date.now()}`
        localStorage.setItem('kindnest_token', sessionToken)
        localStorage.setItem('kindnest_user_cache', JSON.stringify(result.user))
      }
      
      setUser(result.user)
      setIsAuthenticated(true)
      
      return { success: true, user: result.user, isExisting: true }
    }
    return { success: false, isExisting: false }
  }

  const sendOtpToEmail = async (email: string) => {
    return await sendOTP(email)
  }

  const verifyOtpCode = async (email: string, otp: string) => {
    const result = await verifyOTP(email, otp)
    
    if (result.success && result.user) {
      // Generate smart account address if not provided by backend
      if (!result.user.smartAccountAddress && result.user.email) {
        console.log('🔧 Generating smart account address after OTP verification for:', result.user.email)
        try {
          const smartAccountAddress = await aaManager.generateSmartAccountAddress(result.user.email)
          result.user.smartAccountAddress = smartAccountAddress
          console.log('✅ Generated smart account address after OTP:', smartAccountAddress)
        } catch (smartAccountError) {
          console.error('❌ Failed to generate smart account address after OTP:', smartAccountError)
        }
      }
      
      setUser(result.user)
      setIsAuthenticated(true)
    }
    
    return result
  }

  const signOut = async () => {
    await logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  return {
    user,
    loading,
    isAuthenticated,
    checkEmailExists,
    loginWithExistingEmail,
    sendOtpToEmail,
    verifyOtpCode,
    signOut
  }
}