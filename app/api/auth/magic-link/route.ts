import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth'

export const runtime = 'nodejs'

const debugLogEnabled = process.env.RECO_DEBUG_LOG === 'true'

function logDebug(message: string, meta?: Record<string, unknown>) {
  if (debugLogEnabled) {
    console.log(`[magic-link] ${message}`, meta ?? {})
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    if (!email) {
      return NextResponse.json({ success: false, error: '需要提供邮箱' }, { status: 400 })
    }

    const envPresence = {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      NEXT_PUBLIC_SITE_URL: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    }
    logDebug('env presence', envPresence)

    const requestUrl = new URL(request.url)
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '')
    if (!siteUrl) {
      siteUrl = `${requestUrl.protocol}//${requestUrl.host}`
      console.warn('[magic-link] NEXT_PUBLIC_SITE_URL 未配置，使用请求来源', { origin: siteUrl })
    }
    const redirectTo = `${siteUrl}/auth/callback`
    logDebug('redirect target', { redirectTo })

    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    })

    logDebug('signInWithOtp response', {
      hasError: Boolean(error),
      errorMessage: error?.message,
    })

    if (error) {
      console.error('Magic Link 发送失败', error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Magic Link API 出错', error)
    return NextResponse.json({ success: false, error: '发送失败，请重试' }, { status: 500 })
  }
}

