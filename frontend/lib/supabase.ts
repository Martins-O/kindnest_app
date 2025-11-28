'use client';

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables. Using placeholders for build.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types for TypeScript
export interface UserWallet {
  id: string
  user_id: string
  email: string
  smart_account_address: string
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      user_wallets: {
        Row: UserWallet
        Insert: Omit<UserWallet, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserWallet, 'id' | 'created_at'>>
      }
    }
  }
}