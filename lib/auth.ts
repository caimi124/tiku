import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('需要设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export function getSupabaseClient(): SupabaseClient {
  return supabaseClient
}

export function createServerSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('需要设置 SUPABASE_SERVICE_ROLE_KEY 用于服务端请求')
  }
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function getCurrentUser(token?: string): Promise<User | null> {
  if (token) {
    const { data } = await supabaseClient.auth.getUser(token)
    return data.user
  }

  if (typeof window !== 'undefined') {
    const { data } = await supabaseClient.auth.getUser()
    return data.user
  }

  return null
}

