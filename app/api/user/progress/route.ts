/**
 * 用户学习进度API
 * 
 * GET /api/user/progress
 * 
 * 返回用户学习进度统计和最近学习的考点
 * 
 * Requirements: 7.2, 10.2
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface ProgressStats {
  total_points: number
  learned_count: number
  completed_count: number
  mastered_count: number
  review_count: number
  completion_percentage: number
}

interface RecentPoint {
  id: string
  title: string
  section_title: string
  chapter_title: string
  visited_at: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 获取当前用户（如果已登录）
    const cookieStore = cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    
    let userId: string | null = null
    
    if (accessToken) {
      const { data: { user } } = await supabase.auth.getUser(accessToken)
      userId = user?.id || null
    }
    
    // 获取总考点数
    const { count: totalPoints } = await supabase
      .from('knowledge_tree')
      .select('*', { count: 'exact', head: true })
      .in('node_type', ['point', 'knowledge_point'])
    
    // 如果用户未登录，返回基础统计
    if (!userId) {
      return NextResponse.json({
        success: true,
        data: {
          stats: {
            total_points: totalPoints || 0,
            learned_count: 0,
            completed_count: 0,
            mastered_count: 0,
            review_count: 0,
            completion_percentage: 0
          },
          recent_points: [],
          is_logged_in: false
        }
      })
    }
    
    // 获取用户学习进度统计
    const { data: progressData } = await supabase
      .from('user_learning_progress')
      .select('status')
      .eq('user_id', userId)
    
    const learnedCount = progressData?.filter(p => 
      ['in_progress', 'completed', 'mastered'].includes(p.status)
    ).length || 0
    
    const completedCount = progressData?.filter(p => 
      ['completed', 'mastered'].includes(p.status)
    ).length || 0
    
    const masteredCount = progressData?.filter(p => 
      p.status === 'mastered'
    ).length || 0
    
    // 获取待复习数量
    const { count: reviewCount } = await supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', 'review')
    
    // 计算完成百分比
    const completionPercentage = totalPoints && totalPoints > 0
      ? Math.round((completedCount / totalPoints) * 100)
      : 0
    
    const stats: ProgressStats = {
      total_points: totalPoints || 0,
      learned_count: learnedCount,
      completed_count: completedCount,
      mastered_count: masteredCount,
      review_count: reviewCount || 0,
      completion_percentage: completionPercentage
    }
    
    // 获取最近学习的5个考点
    const { data: recentLearning } = await supabase
      .from('recent_learning')
      .select(`
        point_id,
        visited_at,
        knowledge_tree!inner (
          id,
          title,
          parent_id
        )
      `)
      .eq('user_id', userId)
      .order('visited_at', { ascending: false })
      .limit(10)
    
    // 去重并获取前5个
    const seenPointIds = new Set<string>()
    const recentPoints: RecentPoint[] = []
    
    for (const record of recentLearning || []) {
      if (seenPointIds.has(record.point_id)) continue
      if (recentPoints.length >= 5) break
      
      seenPointIds.add(record.point_id)
      
      const point = record.knowledge_tree as any
      
      // 获取小节和章节信息
      const { data: section } = await supabase
        .from('knowledge_tree')
        .select('id, title, parent_id')
        .eq('id', point.parent_id)
        .single()
      
      let chapterTitle = ''
      if (section?.parent_id) {
        const { data: chapter } = await supabase
          .from('knowledge_tree')
          .select('title')
          .eq('id', section.parent_id)
          .single()
        chapterTitle = chapter?.title || ''
      }
      
      recentPoints.push({
        id: point.id,
        title: point.title,
        section_title: section?.title || '',
        chapter_title: chapterTitle,
        visited_at: record.visited_at
      })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        stats,
        recent_points: recentPoints,
        is_logged_in: true
      }
    })
    
  } catch (error) {
    console.error('获取用户进度失败:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: '服务器错误' }
    }, { status: 500 })
  }
}
