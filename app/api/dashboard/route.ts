/**
 * Dashboard API
 * 
 * 返回学习仪表盘数据：总体掌握度、本周学习时长、总体正确率、各章节掌握度
 * 
 * Requirements: 3.1, 3.4
 * Property 9: 仪表盘数据完整性
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ============================================
// 类型定义
// ============================================

export interface ChapterMastery {
  id: string
  code: string
  title: string
  mastery_score: number
  total_points: number
  mastered_points: number
  weak_points: number
}

export interface DashboardData {
  /** 总体掌握度 (0-100) */
  overallMastery: number
  /** 本周学习时长 (小时) */
  weeklyStudyTime: number
  /** 总体正确率 (0-100) */
  overallAccuracy: number
  /** 薄弱考点数量 */
  weakPointsCount: number
  /** 各章节掌握度 */
  chapterMastery: ChapterMastery[]
  /** 总考点数 */
  totalPoints: number
  /** 已掌握考点数 */
  masteredPoints: number
  /** 本周答题数 */
  weeklyQuestions: number
  /** 连续学习天数 */
  learningStreak: number
}

// ============================================
// 辅助函数（不导出，仅内部使用）
// ============================================

/**
 * 计算总体掌握度
 * 基于各章节掌握度的加权平均
 */
function calculateOverallMastery(chapters: ChapterMastery[]): number {
  if (chapters.length === 0) return 0
  
  let totalWeightedScore = 0
  let totalPoints = 0
  
  for (const chapter of chapters) {
    totalWeightedScore += chapter.mastery_score * chapter.total_points
    totalPoints += chapter.total_points
  }
  
  if (totalPoints === 0) return 0
  return Math.round(totalWeightedScore / totalPoints)
}

/**
 * 计算薄弱考点数量
 * 掌握度 < 60% 的考点
 */
function countWeakPoints(chapters: ChapterMastery[]): number {
  return chapters.reduce((sum, ch) => sum + ch.weak_points, 0)
}

/**
 * 计算已掌握考点数量
 * 掌握度 >= 80% 的考点
 */
function countMasteredPoints(chapters: ChapterMastery[]): number {
  return chapters.reduce((sum, ch) => sum + ch.mastered_points, 0)
}

/**
 * 计算总考点数
 */
function countTotalPoints(chapters: ChapterMastery[]): number {
  return chapters.reduce((sum, ch) => sum + ch.total_points, 0)
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

    // 获取用户ID（从查询参数或认证）
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // 1. 获取章节数据和掌握度
    const { data: chapters, error: chaptersError } = await supabase
      .from('knowledge_tree')
      .select('id, code, title, importance')
      .eq('type', 'chapter')
      .order('code')

    if (chaptersError) {
      console.error('获取章节数据失败:', chaptersError)
      return NextResponse.json(
        { error: '获取章节数据失败' },
        { status: 500 }
      )
    }

    // 2. 获取每个章节的知识点统计
    const chapterMastery: ChapterMastery[] = []
    
    for (const chapter of chapters || []) {
      // 获取该章节下的所有知识点
      const { data: points, error: pointsError } = await supabase
        .from('knowledge_tree')
        .select('id')
        .like('parent_id', `${chapter.id}%`)
        .eq('type', 'point')

      if (pointsError) {
        console.error(`获取章节 ${chapter.id} 知识点失败:`, pointsError)
        continue
      }

      const pointIds = points?.map(p => p.id) || []
      const totalPoints = pointIds.length

      // 如果有用户ID，获取用户掌握度数据
      let masteredPoints = 0
      let weakPoints = 0
      let totalMastery = 0

      if (userId && pointIds.length > 0) {
        const { data: masteryData, error: masteryError } = await supabase
          .from('user_knowledge_mastery')
          .select('mastery_score')
          .eq('user_id', userId)
          .in('knowledge_point_id', pointIds)

        if (!masteryError && masteryData) {
          for (const m of masteryData) {
            totalMastery += m.mastery_score || 0
            if (m.mastery_score >= 80) masteredPoints++
            if (m.mastery_score < 60) weakPoints++
          }
        }
      }

      const avgMastery = totalPoints > 0 ? Math.round(totalMastery / totalPoints) : 0

      chapterMastery.push({
        id: chapter.id,
        code: chapter.code,
        title: chapter.title,
        mastery_score: avgMastery,
        total_points: totalPoints,
        mastered_points: masteredPoints,
        weak_points: weakPoints,
      })
    }

    // 3. 获取本周学习统计
    let weeklyStudyTime = 0
    let weeklyQuestions = 0
    let overallAccuracy = 0
    let learningStreak = 0

    if (userId) {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]

      const { data: weeklyStats, error: statsError } = await supabase
        .from('daily_learning_stats')
        .select('study_minutes, questions_done, correct_count')
        .eq('user_id', userId)
        .gte('stat_date', weekAgoStr)

      if (!statsError && weeklyStats) {
        let totalMinutes = 0
        let totalQuestions = 0
        let totalCorrect = 0

        for (const stat of weeklyStats) {
          totalMinutes += stat.study_minutes || 0
          totalQuestions += stat.questions_done || 0
          totalCorrect += stat.correct_count || 0
        }

        weeklyStudyTime = Math.round(totalMinutes / 60 * 10) / 10 // 转换为小时，保留1位小数
        weeklyQuestions = totalQuestions
        overallAccuracy = totalQuestions > 0 
          ? Math.round(totalCorrect / totalQuestions * 100) 
          : 0
      }

      // 获取连续学习天数
      const { data: streakData, error: streakError } = await supabase
        .rpc('get_learning_streak', { p_user_id: userId })

      if (!streakError && streakData !== null) {
        learningStreak = streakData
      }
    }

    // 4. 计算汇总数据
    const overallMastery = calculateOverallMastery(chapterMastery)
    const weakPointsCount = countWeakPoints(chapterMastery)
    const totalPoints = countTotalPoints(chapterMastery)
    const masteredPoints = countMasteredPoints(chapterMastery)

    const dashboardData: DashboardData = {
      overallMastery,
      weeklyStudyTime,
      overallAccuracy,
      weakPointsCount,
      chapterMastery,
      totalPoints,
      masteredPoints,
      weeklyQuestions,
      learningStreak,
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
