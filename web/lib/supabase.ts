import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserProfile = {
  id: string
  email: string
  full_name: string
  phone: string | null
  country: string
  currency: string
  language: string
  user_type: string
  subscription_tier: string
  onboarding_completed: boolean
  preferences: Record<string, any>
  created_at: string
}

export type Account = {
  id: string
  user_id: string
  name: string
  account_type: string
  institution_name: string | null
  current_balance: number
  currency: string
  color: string
  is_active: boolean
}

export type Transaction = {
  id: string
  user_id: string
  account_id: string | null
  transaction_date: string
  amount: number
  currency: string
  transaction_type: string
  merchant_name: string | null
  description: string | null
  category: string | null
  ai_category: string | null
  is_recurring: boolean
  source: string
  created_at: string
}

export type Goal = {
  id: string
  user_id: string
  name: string
  emoji: string
  goal_type: string
  target_amount: number
  current_amount: number
  currency: string
  target_date: string | null
  status: string
}

export type Debt = {
  id: string
  user_id: string
  name: string
  debt_type: string
  lender: string | null
  original_amount: number
  current_balance: number
  interest_rate: number
  minimum_payment: number
  status: string
}

export type Insight = {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  severity: string
  impact_amount: number | null
  is_read: boolean
  created_at: string
}

export type ChatMessage = {
  id: string
  user_id: string
  conversation_id: string
  role: string
  content: string
  created_at: string
}