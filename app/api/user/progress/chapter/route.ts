/**
 * 记录章节级学习行为
 * 
 * POST /api/user/progress/chapter
 * 用于在用户进入章节时调用，用最小的点位记录在 user_learning_progress 中形成学习痕迹
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { parseChapterCode } from '@/lib/chapterWeight'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface ChapterProgressRequest {
  chapterId?: string
  chapterCode?: string
  subject?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ChapterProgressRequest = await request.json()
    const token = cookies().get('sb-access-token')?.value
    if (!token) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const { data: sessionData, error: authError } = await supabase.auth.getUser(token)
    if (authError || !sessionData.user) {
      return NextResponse.json({ success: false, error: '登录信息不可用' }, { status: 401 })
    }

    const userId = sessionData.user.id
    const subject = body.subject || 'xiyao_yaoxue_er'

    let resolvedChapterId = body.chapterId

    if (!resolvedChapterId && body.chapterCode) {
      const normalizedCode = parseChapterCode(body.chapterCode)
      if (normalizedCode) {
        const { data: chapterNode } = await supabase
          .from('knowledge_tree')
          .select('id')
          .eq('subject_code', subject)
          .eq('node_type', 'chapter')
          .eq('code', normalizedCode.toString())
          .limit(1)
          .single()

        resolvedChapterId = chapterNode?.id ?? undefined
      }
    }

    if (!resolvedChapterId) {
      return NextResponse.json({ success: false, error: '章节信息缺失' }, { status: 400 })
    }

    const { data: sections } = await supabase
      .from('knowledge_tree')
      .select('id')
      .eq('parent_id', resolvedChapterId)
      .eq('node_type', 'section')
      .order('sort_order')

    const sectionIds = (sections || []).map((section) => section.id)

    const { data: pointCandidates } = await supabase
      .from('knowledge_tree')
      .select('id')
      .eq('subject_code', subject)
      .eq('node_type', 'point')
      .in('parent_id', sectionIds.length ? sectionIds : [resolvedChapterId])
      .order('sort_order')
      .limit(1)

    const targetPointId = pointCandidates?.[0]?.id
    if (!targetPointId) {
      return NextResponse.json({ success: false, error: '章节下无考点' }, { status: 404 })
    }

    const { error: rpcError } = await supabase.rpc('update_learning_progress', {
      p_user_id: userId,
      p_point_id: targetPointId,
    })

    if (rpcError) {
      console.error('更新章节进度失败', rpcError)
      return NextResponse.json({ success: false, error: '记录学习进度失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('记录章节进度接口异常', error)
    return NextResponse.json({ success: false, error: '记录章节进度失败' }, { status: 500 })
  }
}

