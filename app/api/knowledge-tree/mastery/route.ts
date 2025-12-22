/**
 * 知识点掌握度 API
 * 
 * GET /api/knowledge-tree/mastery - 获取用户知识点掌握度
 * POST /api/knowledge-tree/mastery - 更新用户知识点掌握度
 * 
 * Requirements: 3.2, 3.3
 */

import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

// 掌握度阈值常量
const MASTERY_THRESHOLDS = {
  MASTERED: 80,
  REVIEW: 60,
  WEAK: 60,
}

interface MasteryData {
  knowledge_point_id: string
  mastery_score: number
  is_weak_point: boolean
  practice_count: number
  correct_rate: number
  last_review_at: string
}

/**
 * GET - 获取用户的知识点掌握度数据
 */
export async function GET(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const subjectCode = searchParams.get('subject') || 'xiyao_yaoxue_er'
    const knowledgePointId = searchParams.get('pointId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID参数' },
        { status: 400 }
      )
    }
    
    let query: string
    let params: any[]
    
    if (knowledgePointId) {
      // 获取单个知识点的掌握度
      query = `
        SELECT 
          ukm.*,
          kt.title as knowledge_point_title,
          kt.code as knowledge_point_code,
          kt.importance_level,
          kt.learn_mode,
          kt.error_pattern_tags
        FROM user_knowledge_mastery ukm
        JOIN knowledge_tree kt ON ukm.knowledge_point_id = kt.id
        WHERE ukm.user_id = $1 AND ukm.knowledge_point_id = $2
      `
      params = [userId, knowledgePointId]
    } else {
      // 获取该科目下所有知识点的掌握度
      query = `
        SELECT 
          ukm.*,
          kt.title as knowledge_point_title,
          kt.code as knowledge_point_code,
          kt.importance,
          kt.importance_level,
          kt.learn_mode,
          kt.error_pattern_tags
        FROM user_knowledge_mastery ukm
        JOIN knowledge_tree kt ON ukm.knowledge_point_id = kt.id
        WHERE ukm.user_id = $1 AND kt.subject_code = $2
        ORDER BY ukm.mastery_score ASC
      `
      params = [userId, subjectCode]
    }
    
    const result = await client.query(query, params)
    
    // 统计信息
    const statsQuery = `
      SELECT 
        COUNT(*) as total_points,
        COUNT(*) FILTER (WHERE ukm.mastery_score >= $3) as mastered_count,
        COUNT(*) FILTER (WHERE ukm.mastery_score >= $4 AND ukm.mastery_score < $3) as review_count,
        COUNT(*) FILTER (WHERE ukm.mastery_score > 0 AND ukm.mastery_score < $4) as weak_count,
        COALESCE(ROUND(AVG(ukm.mastery_score)::numeric, 1), 0) as average_mastery
      FROM user_knowledge_mastery ukm
      JOIN knowledge_tree kt ON ukm.knowledge_point_id = kt.id
      WHERE ukm.user_id = $1 AND kt.subject_code = $2
    `
    
    const statsResult = await client.query(statsQuery, [
      userId, 
      subjectCode, 
      MASTERY_THRESHOLDS.MASTERED, 
      MASTERY_THRESHOLDS.REVIEW
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        mastery_records: result.rows,
        stats: statsResult.rows[0],
        user_id: userId,
        subject_code: subjectCode,
      }
    })
    
  } catch (error) {
    console.error('获取掌握度数据失败:', error)
    return NextResponse.json(
      { success: false, error: '获取掌握度数据失败', details: String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

/**
 * POST - 更新用户的知识点掌握度
 */
export async function POST(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const body = await request.json()
    const { userId, knowledgePointId, isCorrect, practiceType } = body
    
    if (!userId || !knowledgePointId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数: userId, knowledgePointId' },
        { status: 400 }
      )
    }
    
    // 获取当前掌握度记录
    const existingQuery = `
      SELECT * FROM user_knowledge_mastery 
      WHERE user_id = $1 AND knowledge_point_id = $2
    `
    const existingResult = await client.query(existingQuery, [userId, knowledgePointId])
    
    let newMasteryScore: number
    let newPracticeCount: number
    let newCorrectCount: number
    let newCorrectRate: number
    
    if (existingResult.rows.length > 0) {
      // 更新现有记录
      const current = existingResult.rows[0]
      newPracticeCount = (current.practice_count || 0) + 1
      newCorrectCount = (current.correct_count || 0) + (isCorrect ? 1 : 0)
      newCorrectRate = Math.round((newCorrectCount / newPracticeCount) * 100)
      
      // 计算新的掌握度分数 (基于正确率和练习次数)
      const practiceWeight = Math.min(newPracticeCount / 10, 1) // 练习次数权重，最多10次
      newMasteryScore = Math.round(newCorrectRate * practiceWeight)
      
      const updateQuery = `
        UPDATE user_knowledge_mastery 
        SET 
          mastery_score = $3,
          practice_count = $4,
          correct_count = $5,
          correct_rate = $6,
          is_weak_point = $7,
          last_review_at = NOW(),
          updated_at = NOW()
        WHERE user_id = $1 AND knowledge_point_id = $2
        RETURNING *
      `
      
      const updateResult = await client.query(updateQuery, [
        userId,
        knowledgePointId,
        newMasteryScore,
        newPracticeCount,
        newCorrectCount,
        newCorrectRate,
        newMasteryScore < MASTERY_THRESHOLDS.WEAK
      ])
      
      return NextResponse.json({
        success: true,
        data: updateResult.rows[0],
        message: '掌握度已更新'
      })
      
    } else {
      // 创建新记录
      newPracticeCount = 1
      newCorrectCount = isCorrect ? 1 : 0
      newCorrectRate = isCorrect ? 100 : 0
      newMasteryScore = Math.round(newCorrectRate * 0.1) // 首次练习权重较低
      
      const insertQuery = `
        INSERT INTO user_knowledge_mastery (
          user_id, 
          knowledge_point_id, 
          mastery_score, 
          practice_count,
          correct_count,
          correct_rate,
          is_weak_point,
          last_review_at,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW())
        RETURNING *
      `
      
      const insertResult = await client.query(insertQuery, [
        userId,
        knowledgePointId,
        newMasteryScore,
        newPracticeCount,
        newCorrectCount,
        newCorrectRate,
        newMasteryScore < MASTERY_THRESHOLDS.WEAK
      ])
      
      return NextResponse.json({
        success: true,
        data: insertResult.rows[0],
        message: '掌握度记录已创建'
      })
    }
    
  } catch (error) {
    console.error('更新掌握度失败:', error)
    return NextResponse.json(
      { success: false, error: '更新掌握度失败', details: String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
