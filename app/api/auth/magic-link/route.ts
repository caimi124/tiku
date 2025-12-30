import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    if (!email) {
      return NextResponse.json({ success: false, error: '需要提供邮箱' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error('Magic Link 发送失败', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Magic Link API 出错', error)
    return NextResponse.json({ success: false, error: '发送失败，请重试' }, { status: 500 })
  }
}

