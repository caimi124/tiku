import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) ?? {}
    const completedPoints = Array.from(
      new Set(
        Array.isArray(body.completedPoints) ? body.completedPoints.filter(Boolean) : [],
      ),
    )

    if (!completedPoints.length) {
      return NextResponse.json({ syncedCount: 0 })
    }

    const token = cookies().get('sb-access-token')?.value
    if (!token) {
      return NextResponse.json({ error: '需要登录' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { data: session, error: authError } = await supabase.auth.getUser(token)
    if (authError || !session?.user) {
      return NextResponse.json({ error: '登录信息无效' }, { status: 401 })
    }

    const payload = completedPoints.map((pointId) => ({
      user_id: session.user.id,
      point_id: pointId,
      completed_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('user_point_completion')
      .upsert(payload, { onConflict: 'user_id,point_id' })

    if (error) {
      console.error('同步学习进度失败', error)
      return NextResponse.json({ error: '同步失败' }, { status: 500 })
    }

    return NextResponse.json({ syncedCount: completedPoints.length })
  } catch (error) {
    console.error('batch-sync 异常', error)
    return NextResponse.json({ error: '同步失败' }, { status: 500 })
  }
}

