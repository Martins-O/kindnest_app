'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCustomAuth } from '@/hooks/useCustomAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

type EmailForm = z.infer<typeof emailSchema>

export function EmailSignup() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmailValue] = useState('')
  const [otp, setOtp] = useState('')
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const { checkEmailExists, loginWithExistingEmail, sendOtpToEmail, verifyOtpCode, isAuthenticated } = useCustomAuth()
  const router = useRouter()

  // Handle redirect when authentication status changes
  useEffect(() => {
    if (shouldRedirect && isAuthenticated) {
      router.push('/dashboard')
      setShouldRedirect(false)
    }
  }, [shouldRedirect, isAuthenticated, router])

  const { register, handleSubmit, formState: { errors } } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema)
  })

  const handleEmailSubmit = async (data: EmailForm) => {
    setIsLoading(true)
    setMessage('')
    setEmailValue(data.email)

    try {
      // First check if email has existing wallet/account
      console.log('🔍 Checking if email exists:', data.email)
      const existingCheck = await loginWithExistingEmail(data.email)
      
      if (existingCheck.success && existingCheck.isExisting) {
        console.log('✅ Existing user found, logging in automatically')
        setMessage('✅ Welcome back! Logging you in automatically...')
        setShouldRedirect(true)
        return
      }
      
      console.log('📧 New user, sending OTP')
      // If no existing account, send OTP for new user signup
      const result = await sendOtpToEmail(data.email)
      console.log(result)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send OTP')
      }
      
      setStep('otp')
      setMessage('Check your email for the 6-digit code!')
    } catch (error) {
      setMessage(`Error: ${error.message || 'Something went wrong. Please try again.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) return

    setIsLoading(true)
    setMessage('')

    try {
      const result = await verifyOtpCode(email, otp)

      if (!result.success) {
        throw new Error(result.error || 'Verification failed')
      }

      if (result.user) {
        setMessage('✅ Verification successful! Redirecting to dashboard...')
        setShouldRedirect(true)
      }
    } catch (error) {
      setMessage('Invalid code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full bg-white/95 backdrop-blur-lg border border-slate-200 shadow-xl rounded-3xl">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-slate-800 text-2xl font-bold">Welcome to KindNest</CardTitle>
        <p className="text-slate-600 leading-relaxed">
          Enter your email to login or create your account instantly
        </p>
      </CardHeader>
      <CardContent>
        {step === 'email' ? (
          <form onSubmit={handleSubmit(handleEmailSubmit)} className="space-y-6">
            <div>
              <label className="block text-slate-700 font-semibold mb-3">Email Address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                disabled={isLoading}
                className="bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-indigo-400 rounded-xl py-3 text-lg"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-2">{errors.email.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 py-4 text-lg font-semibold rounded-2xl" 
              loading={isLoading}
            >
              {isLoading ? 'Checking account...' : 'Continue with Email'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-700 font-semibold mb-3">
                Enter the 6-digit code sent to {email}
              </label>
              <Input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={isLoading}
                className="bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-indigo-400 text-center text-2xl tracking-[0.5em] rounded-xl py-4 font-bold"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setStep('email')}
                className="border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 py-3 px-6 rounded-xl"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 py-3 font-semibold rounded-xl" 
                loading={isLoading}
                disabled={otp.length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify & Create Account'}
              </Button>
            </div>
          </form>
        )}

        {message && (
          <div className={`text-sm text-center p-4 rounded-xl mt-6 ${
            message.includes('✅') 
              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
              : message.includes('Error') || message.includes('Invalid')
                ? 'text-red-700 bg-red-50 border border-red-200'
                : 'text-blue-700 bg-blue-50 border border-blue-200'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500 leading-relaxed">
            By continuing, you agree to create or access a smart contract wallet that enables gasless transactions.
            Existing users will be logged in automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}