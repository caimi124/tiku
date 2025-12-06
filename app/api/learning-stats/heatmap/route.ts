/**
 * 学习热力图 API
 *
 * GET /api/learning-stats/heatmap - 获取近30天每日学习数据
 *
 * 查询参数:
 * - userId: 用户ID (必需)
 * - days: 天数 (默认30)
 *
 * Requirements: 7.1
 */

import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
})

export interface DailyLearningData {
  date: string // YYYY-MM-DD
  study_minutes: number
  questions_done: number
  correct_count: number
  accuracy: number // 0-100
  color: 'green' | 'yellow' | 'red' | 'gray'
}

export interface HeatmapResponse {
  data: DailyLearningData[]
  streak: number // 连续学习天数
  total_days: number // 有学习记录的总天数
  total_questions: number // 总答题数
  average_accuracy: number // 平均正确率
}

/**
 * GET - 获取近30天每日学习数据
 */
export async function GET(request: NextRequest) {
  const client = await pool.connect()

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const days = parseInt(searchParams.get('days') || '30')

    if (!userId) {
      return NextResponse.json({ success: false, error: '缺少用户ID' }, { status: 400 })
    }

    // 获取近N天的每日学习统计
    const query = `
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '${days - 1} days',
          CURRENT_DATE,
          '1 day'::interval
        )::date AS date
      ),
      daily_stats AS (
        SELECT 
          DATE(created_at) as stat_date,
          COUNT(*) as questions_done,
          SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_count,
          SUM(time_spent) / 60 as study_minutes
        FROM learning_records
        WHERE user_id = $1
          AND created_at >= CURRENT_DATE - INTERVAL '${days - 1} days'
        GROUP BY DATE(created_at)
      )
      SELECT 
        ds.date::text as date,
        COALESCE(st.study_minutes, 0)::int as study_minutes,
        COALESCE(st.questions_done, 0)::int as questions_done,
        COALESCE(st.correct_count, 0)::int as correct_count
      FROM date_series ds
      LEFT JOIN daily_stats st ON ds.date = st.stat_date
      ORDER BY ds.date ASC
    `

    const result = await client.query(query, [userId])

    // 处理数据，添加正确率和颜色
    const data: DailyLearningData[] = result.rows.map((row) => {
      const accuracy =
        row.questions_done > 0 ? Math.round((row.correct_count / row.questions_done) * 100) : 0

      return {
        date: row.date,
        study_minutes: row.study_minutes,
        questions_done: row.questions_done,
        correct_count: row.correct_count,
        accuracy,
        color: getHeatmapColor(row.questions_done, accuracy),
      }
    })

    // 计算连续学习天数
    const streak = calculateStreak(data)

    // 计算统计数据
    const daysWithActivity = data.filter((d) => d.questions_done > 0)
    const totalQuestions = data.reduce((sum, d) => sum + d.questions_done, 0)
    const totalCorrect = data.reduce((sum, d) => sum + d.correct_count, 0)
    const averageAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

    const response: HeatmapResponse = {
      data,
      streak,
      total_days: daysWithActivity.length,
      total_questions: totalQuestions,
      average_accuracy: averageAccuracy,
    }

    return NextResponse.json({
      success: true,
      ...response,
    })
  } catch (error) {
    console.error('获取热力图数据失败:', error)
    return NextResponse.json(
      { success: false, error: '获取热力图数据失败', details: String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

/**
 * 获取热力图颜色
 * Requirements: 7.2
 *
 * - 绿色: 正确率 > 80%
 * - 黄色: 正确率 60-80%
 * - 红色: 正确率 < 60%
 * - 灰色: 无学习记录
 */
function getHeatmapColor(
  questionsCount: number,
  accuracy: number
): 'green' | 'yellow' | 'red' | 'gray' {
  if (questionsCount === 0) return 'gray'
  if (accuracy >= 80) return 'green'
  if (accuracy >= 60) return 'yellow'
  return 'red'
}

/**
 * 计算连续学习天数
 * Requirements: 7.5
 *
 * 从今天往前数，连续有学习记录的天数
 */
function calculateStreak(data: DailyLearningData[]): number {
  // 从最后一天（今天）开始往前数
  let streak = 0
  const reversedData = [...data].reverse()

  for (const day of reversedData) {
    if (day.questions_done > 0) {
      streak++
    } else {
      break
    }
  }

  return streak
}
