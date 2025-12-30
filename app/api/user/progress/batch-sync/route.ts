import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const completedPointsInput = Array.isArray(body?.completedPoints) ? body.completedPoints : []
    const completedPoints = Array.from(new Set(completedPointsInput.filter(Boolean)))

    if (!completedPoints.length) {
      return NextResponse.json({ syncedCount: 0 })
    }

    const supabase = createServerSupabaseClient()
    const accessToken = cookies().get('sb-access-token')?.value
    if (!accessToken) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 },
      )
    }

    const { data: userData, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !userData?.user) {
      return NextResponse.json(
        { error: '登录信息无效' },
        { status: 401 },
      )
    }

    const payload = completedPoints.map((pointId) => ({
      user_id: userData.user.id,
      point_id: pointId,
      completed_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('user_point_completion')
      .upsert(payload, { onConflict: 'user_id,point_id' })

    if (error) {
      console.error('同步学习进度失败', error)
      return NextResponse.json(
        { error: '同步失败' },
        { status: 500 },
      )
    }

    return NextResponse.json({ syncedCount: completedPoints.length })
  } catch (error) {
    console.error('batch-sync 异常', error)
    return NextResponse.json(
      { error: '同步失败' },
      { status: 500 },
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getSupabaseClient } from '@/lib/auth'

interface BatchSyncBody {
  completedPoints?: string[]
  chapterCodeMap?: Record<string, string>
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('sb-access-token')?.value
  if (!token) {
    return NextResponse.json({ success: false, error: '需要登录' }, { status: 401 })
  }

  const client = getSupabaseClient()
  const { data: userData, error: authError } = await client.auth.getUser(token)
  if (authError || !userData.user) {
    return NextResponse.json({ success: false, error: '登录信息无效' }, { status: 401 })
  }

  const body: BatchSyncBody = await request.json().catch(() => ({}))
  const completedPoints = Array.isArray(body.completedPoints)
    ? Array.from(new Set(body.completedPoints.filter(Boolean)))
    : []

  if (completedPoints.length === 0) {
    return NextResponse.json({ success: true, syncedCount: 0 })
  }

  const chapterMap = body.chapterCodeMap ?? {}
  const serverClient = createServerSupabaseClient()

  const payload = completedPoints.map((pointId) => ({
    user_id: userData.user?.id,
    point_id: pointId,
    chapter_code: chapterMap[pointId] ?? null,
    completed_at: new Date().toISOString(),
  }))

  const { error } = await serverClient
    .from('user_point_completion')
    .upsert(payload, { onConflict: 'user_id,point_id' })

  if (error) {
    console.error('批量同步学习进度失败', error)
    return NextResponse.json({ success: false, error: '同步失败' }, { status: 500 })
  }

  return NextResponse.json({ success: true, syncedCount: completedPoints.length })
}

