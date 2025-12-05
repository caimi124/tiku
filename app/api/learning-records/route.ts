/**
 * 学习记录 API
 *
 * POST /api/learning-records - 记录答题数据
 * GET /api/learning-records - 获取用户学习记录
 *
 * Requirements: 2.1
 */

import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { calculateMastery } from '@/lib/mastery'

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
})

export interface LearningRecord {
  id: string
  user_id: string
  knowledge_point_id: string
  question_id?: string
  content_item?: string
  is_correct: boolean
  time_spent: number // 答题用时（秒）
  created_at: string
}

export interface CreateRecordInput {
  userId: string
  knowledgePointId: string
  questionId?: string
  contentItem?: string
  isCorrect: boolean
  timeSpent: number
}

/**
 * POST - 记录答题数据
 *
 * 请求体:
 * - userId: 用户ID
 * - knowledgePointId: 考点ID
 * - questionId: 题目ID (可选)
 * - contentItem: 内容项 (可选，如"适应证"、"禁忌"等)
 * - isCorrect: 是否正确
 * - timeSpent: 答题用时（秒）
 */
export async function POST(request: NextRequest) {
  const client = await pool.connect()

  try {
    const body: CreateRecordInput = await request.json()
    const { userId, knowledgePointId, questionId, contentItem, isCorrect, timeSpent } = body

    // 验证必要参数
    if (!userId || !knowledgePointId || isCorrect === undefined || timeSpent === undefined) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 })
    }

    // 开始事务
    await client.query('BEGIN')

    // 1. 插入学习记录
    const insertQuery = `
      INSERT INTO learning_records (
        id, user_id, knowledge_point_id, question_id, content_item, is_correct, time_spent, created_at
      )
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, user_id, knowledge_point_id, question_id, content_item, is_correct, time_spent, created_at
    `

    const insertResult = await client.query(insertQuery, [
      userId,
      knowledgePointId,
      questionId || null,
      contentItem || null,
      isCorrect,
      timeSpent,
    ])

    const record = insertResult.rows[0]

    // 2. 更新用户掌握度
    await updateUserMastery(client, userId, knowledgePointId)

    // 提交事务
    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      data: record,
      message: '学习记录已保存',
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('保存学习记录失败:', error)

    // 如果表不存在，尝试创建
    if (String(error).includes('relation "learning_records" does not exist')) {
      return NextResponse.json(
        { success: false, error: '学习记录表不存在，请先创建数据库表' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: '保存学习记录失败', details: String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

/**
 * GET - 获取用户学习记录
 *
 * 查询参数:
 * - userId: 用户ID (必需)
 * - knowledgePointId: 考点ID (可选，筛选特定考点)
 * - limit: 返回数量限制 (默认50)
 * - offset: 偏移量 (默认0)
 */
export async function GET(request: NextRequest) {
  const client = await pool.connect()

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const knowledgePointId = searchParams.get('knowledgePointId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json({ success: false, error: '缺少用户ID' }, { status: 400 })
    }

    let query: string
    const params: (string | number)[] = [userId, limit, offset]

    if (knowledgePointId) {
      query = `
        SELECT 
          lr.id,
          lr.user_id,
          lr.knowledge_point_id,
          lr.question_id,
          lr.content_item,
          lr.is_correct,
          lr.time_spent,
          lr.created_at,
          kt.title as knowledge_point_title
        FROM learning_records lr
        LEFT JOIN knowledge_tree kt ON lr.knowledge_point_id = kt.id
        WHERE lr.user_id = $1 AND lr.knowledge_point_id = $4
        ORDER BY lr.created_at DESC
        LIMIT $2 OFFSET $3
      `
      params.push(knowledgePointId)
    } else {
      query = `
        SELECT 
          lr.id,
          lr.user_id,
          lr.knowledge_point_id,
          lr.question_id,
          lr.content_item,
          lr.is_correct,
          lr.time_spent,
          lr.created_at,
          kt.title as knowledge_point_title
        FROM learning_records lr
        LEFT JOIN knowledge_tree kt ON lr.knowledge_point_id = kt.id
        WHERE lr.user_id = $1
        ORDER BY lr.created_at DESC
        LIMIT $2 OFFSET $3
      `
    }

    const result = await client.query(query, params)

    // 获取总数
    const countQuery = knowledgePointId
      ? 'SELECT COUNT(*) FROM learning_records WHERE user_id = $1 AND knowledge_point_id = $2'
      : 'SELECT COUNT(*) FROM learning_records WHERE user_id = $1'

    const countParams = knowledgePointId ? [userId, knowledgePointId] : [userId]
    const countResult = await client.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].count)

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + result.rows.length < total,
      },
    })
  } catch (error) {
    console.error('获取学习记录失败:', error)
    return NextResponse.json(
      { success: false, error: '获取学习记录失败', details: String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

/**
 * 更新用户掌握度
 * 根据最新的学习记录重新计算掌握度
 */
async function updateUserMastery(
  client: any,
  userId: string,
  knowledgePointId: string
): Promise<void> {
  // 获取该考点的所有学习记录统计
  const statsQuery = `
    SELECT 
      COUNT(*) as total_count,
      SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_count,
      AVG(time_spent) as avg_time_spent,
      MAX(created_at) as last_review_at
    FROM learning_records
    WHERE user_id = $1 AND knowledge_point_id = $2
  `

  const statsResult = await client.query(statsQuery, [userId, knowledgePointId])
  const stats = statsResult.rows[0]

  if (!stats || parseInt(stats.total_count) === 0) {
    return
  }

  const totalCount = parseInt(stats.total_count)
  const correctCount = parseInt(stats.correct_count)
  const baseAccuracy = (correctCount / totalCount) * 100

  // 获取最近5次答题的正确率
  const recentQuery = `
    SELECT is_correct
    FROM learning_records
    WHERE user_id = $1 AND knowledge_point_id = $2
    ORDER BY created_at DESC
    LIMIT 5
  `

  const recentResult = await client.query(recentQuery, [userId, knowledgePointId])
  const recentCorrect = recentResult.rows.filter((r: any) => r.is_correct).length
  const recentPerformance = (recentCorrect / recentResult.rows.length) * 100

  // 计算距离上次复习的天数
  const lastReviewAt = new Date(stats.last_review_at)
  const daysSinceLastReview = Math.floor(
    (Date.now() - lastReviewAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  // 获取考点难度
  const difficultyQuery = 'SELECT importance FROM knowledge_tree WHERE id = $1'
  const difficultyResult = await client.query(difficultyQuery, [knowledgePointId])
  const difficulty = difficultyResult.rows[0]?.importance || 3

  // 计算掌握度
  const masteryResult = calculateMastery({
    baseAccuracy,
    recentPerformance,
    daysSinceLastReview,
    averageDifficulty: difficulty,
  })

  // 更新或插入用户掌握度记录
  const upsertQuery = `
    INSERT INTO user_knowledge_mastery (
      id, user_id, knowledge_point_id, mastery_score, is_weak_point, 
      last_review_at, practice_count, correct_rate, updated_at
    )
    VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW()
    )
    ON CONFLICT (user_id, knowledge_point_id) 
    DO UPDATE SET 
      mastery_score = $3,
      is_weak_point = $4,
      last_review_at = $5,
      practice_count = $6,
      correct_rate = $7,
      updated_at = NOW()
  `

  await client.query(upsertQuery, [
    userId,
    knowledgePointId,
    masteryResult.score,
    masteryResult.isWeakPoint,
    lastReviewAt,
    totalCount,
    Math.round(baseAccuracy),
  ])
}
