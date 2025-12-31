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
    // 检查必需的环境变量
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SITE_URL',
    ] as const

    for (const name of requiredEnvVars) {
      if (!process.env[name]) {
        console.error(`[magic-link] MISSING_ENV: ${name}`)
        return NextResponse.json(
          { success: false, error: `MISSING_ENV:${name}` },
          { status: 500 }
        )
      }
    }

    const body = await request.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    if (!email) {
      return NextResponse.json({ success: false, error: '需要提供邮箱' }, { status: 400 })
    }

    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL!.trim().replace(/\/$/, '')}/auth/callback`
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
      console.error('[magic-link] supabase error:', error?.message ?? error)
      const debug = process.env.RECO_DEBUG_LOG === 'true'
      return NextResponse.json(
        {
          success: false,
          error: debug ? `SUPABASE_OTP_ERROR:${error.message}` : '登录失败，请稍后再试',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[magic-link] API 出错', error)
    const debug = process.env.RECO_DEBUG_LOG === 'true'
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        success: false,
        error: debug ? `UNEXPECTED_ERROR:${errorMessage}` : '发送失败，请重试',
      },
      { status: 500 }
    )
  }
}

