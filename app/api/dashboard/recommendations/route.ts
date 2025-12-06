/**
 * Dashboard Recommendations API
 * 
 * 基于艾宾浩斯遗忘曲线生成今日复习推荐
 * 返回 Top 10 高频考点掌握情况
 * 
 * Requirements: 5.1, 5.3
 * Property 13: 复习推荐算法正确性
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  getNextReviewDate, 
  needsImmediateReview, 
  calculateReviewPriority,
} from '@/lib/mastery'
import {
  shouldReviewToday,
  daysSinceLastReview,
  getMasteryStatusInfo,
  formatRelativeTime,
} from '@/lib/review-utils'

// ============================================
// 类型定义
// ============================================

interface ReviewRecommendation {
  id: string
  title: string
  importance: number
  mastery_score: number
  last_review: string | null
  last_review_days: number
  correct_rate: number
  next_review_date: string
  is_urgent: boolean
  priority_score: number
}

interface HighFrequencyPoint {
  id: string
  title: string
  importance: number
  mastery_score: number
  status: 'mastered' | 'review' | 'weak' | 'unlearned'
  status_text: string
  practice_count: number
}

interface RecommendationsData {
  /** 今日推荐复习列表 */
  todayReview: ReviewRecommendation[]
  /** Top 10 高频考点 */
  highFrequencyPoints: HighFrequencyPoint[]
  /** 需要立即复习的数量 */
  urgentCount: number
  /** 今日已复习数量 */
  reviewedToday: number
}

// ============================================
// API Handler
// ============================================

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: '数据库配置缺失' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 获取用户ID
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')

    // 1. 获取高频考点（重要性 >= 4）
    const { data: highFreqPoints, error: hfError } = await supabase
      .from('knowledge_tree')
      .select('id, title, importance')
      .eq('type', 'point')
      .gte('importance', 4)
      .order('importance', { ascending: false })
      .limit(10)

    if (hfError) {
      console.error('获取高频考点失败:', hfError)
    }

    // 2. 获取用户掌握度数据
    let userMasteryMap: Map<string, { mastery_score: number; last_review_at: Date | null; practice_count: number; correct_rate: number }> = new Map()
    
    if (userId) {
      const { data: masteryData, error: masteryError } = await supabase
        .from('user_knowledge_mastery')
        .select('knowledge_point_id, mastery_score, last_review_at, practice_count, correct_rate')
        .eq('user_id', userId)

      if (!masteryError && masteryData) {
        for (const m of masteryData) {
          userMasteryMap.set(m.knowledge_point_id, {
            mastery_score: m.mastery_score || 0,
            last_review_at: m.last_review_at ? new Date(m.last_review_at) : null,
            practice_count: m.practice_count || 0,
            correct_rate: m.correct_rate || 0,
          })
        }
      }
    }

    // 3. 构建高频考点列表
    const highFrequencyPoints: HighFrequencyPoint[] = (highFreqPoints || []).map(point => {
      const userMastery = userMasteryMap.get(point.id)
      const masteryScore = userMastery?.mastery_score || 0
      const statusInfo = getMasteryStatusInfo(masteryScore)
      
      return {
        id: point.id,
        title: point.title,
        importance: point.importance,
        mastery_score: masteryScore,
        status: statusInfo.status,
        status_text: statusInfo.text,
        practice_count: userMastery?.practice_count || 0,
      }
    })

    // 4. 获取需要复习的考点
    const todayReview: ReviewRecommendation[] = []
    let urgentCount = 0
    let reviewedToday = 0

    if (userId) {
      // 获取所有知识点
      const { data: allPoints, error: pointsError } = await supabase
        .from('knowledge_tree')
        .select('id, title, importance')
        .eq('type', 'point')

      if (!pointsError && allPoints) {
        const candidates: ReviewRecommendation[] = []

        for (const point of allPoints) {
          const userMastery = userMasteryMap.get(point.id)
          const masteryScore = userMastery?.mastery_score || 0
          const lastReviewAt = userMastery?.last_review_at || null
          const correctRate = userMastery?.correct_rate || 0
          
          // 检查是否需要今日复习
          if (shouldReviewToday(masteryScore, lastReviewAt)) {
            const daysSince = daysSinceLastReview(lastReviewAt)
            const isUrgent = needsImmediateReview(masteryScore, point.importance)
            const priorityScore = calculateReviewPriority(masteryScore, point.importance, daysSince)
            
            const nextReview = getNextReviewDate(masteryScore, lastReviewAt)
            
            candidates.push({
              id: point.id,
              title: point.title,
              importance: point.importance,
              mastery_score: masteryScore,
              last_review: formatRelativeTime(lastReviewAt),
              last_review_days: daysSince,
              correct_rate: correctRate,
              next_review_date: nextReview.nextReviewDate.toISOString().split('T')[0],
              is_urgent: isUrgent,
              priority_score: priorityScore,
            })

            if (isUrgent) urgentCount++
          }
        }

        // 按优先级排序，取前 N 个
        candidates.sort((a, b) => b.priority_score - a.priority_score)
        todayReview.push(...candidates.slice(0, limit))
      }

      // 获取今日已复习数量
      const today = new Date().toISOString().split('T')[0]
      const { data: todayStats, error: statsError } = await supabase
        .from('daily_learning_stats')
        .select('weak_points_reviewed')
        .eq('user_id', userId)
        .eq('stat_date', today)
        .single()

      if (!statsError && todayStats) {
        reviewedToday = todayStats.weak_points_reviewed || 0
      }
    }

    const recommendationsData: RecommendationsData = {
      todayReview,
      highFrequencyPoints,
      urgentCount,
      reviewedToday,
    }

    return NextResponse.json(recommendationsData)

  } catch (error) {
    console.error('Recommendations API error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
