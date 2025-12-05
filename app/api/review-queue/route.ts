/**
 * 复习队列 API
 * 
 * POST /api/review-queue - 将知识点加入复习队列
 * GET /api/review-queue - 获取用户的复习队列
 * DELETE /api/review-queue - 从复习队列移除知识点
 * 
 * Requirements: 4.4, 4.5
 */

import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { calculateReviewPriority } from '@/lib/mastery'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

export interface ReviewQueueItem {
  id: string
  knowledge_point_id: string
  user_id: string
  priority: number
  added_at: string
  // 关联的知识点信息
  title?: string
  importance?: number
  mastery_score?: number
  drug_name?: string
}

/**
 * POST - 将知识点加入复习队列
 */
export async function POST(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const body = await request.json()
    const { knowledgePointId, userId } = body
    
    if (!knowledgePointId || !userId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }
    
    // 获取知识点信息以计算优先级
    const pointQuery = `
      SELECT 
        kt.id,
        kt.title,
        kt.importance,
        ukm.mastery_score,
        ukm.last_review_at
      FROM knowledge_tree kt
      LEFT JOIN user_knowledge_mastery ukm 
        ON kt.id = ukm.knowledge_point_id 
        AND ukm.user_id = $2
      WHERE kt.id = $1
    `
    const pointResult = await client.query(pointQuery, [knowledgePointId, userId])
    
    if (pointResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '知识点不存在' },
        { status: 404 }
      )
    }
    
    const point = pointResult.rows[0]
    
    // 计算复习优先级
    const masteryScore = point.mastery_score || 0
    const importance = point.importance || 3
    const daysSinceReview = point.last_review_at 
      ? Math.floor((Date.now() - new Date(point.last_review_at).getTime()) / (1000 * 60 * 60 * 24))
      : 30
    
    const priority = calculateReviewPriority(masteryScore, importance, daysSinceReview)
    
    // 插入或更新复习队列
    const upsertQuery = `
      INSERT INTO review_queue (id, knowledge_point_id, user_id, priority, added_at)
      VALUES (gen_random_uuid(), $1, $2, $3, NOW())
      ON CONFLICT (knowledge_point_id, user_id) 
      DO UPDATE SET priority = $3, added_at = NOW()
      RETURNING id, knowledge_point_id, user_id, priority, added_at
    `
    
    const result = await client.query(upsertQuery, [knowledgePointId, userId, priority])
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: '已加入复习队列',
    })
    
  } catch (error) {
    console.error('加入复习队列失败:', error)
    
    // 如果表不存在，尝试创建
    if (String(error).includes('relation "review_queue" does not exist')) {
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS review_queue (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            knowledge_point_id TEXT NOT NULL,
            user_id UUID NOT NULL,
            priority INT DEFAULT 50,
            added_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(knowledge_point_id, user_id)
          )
        `)
        return NextResponse.json(
          { success: false, error: '复习队列表已创建，请重试' },
          { status: 500 }
        )
      } catch (createError) {
        console.error('创建表失败:', createError)
      }
    }
    
    return NextResponse.json(
      { success: false, error: '加入复习队列失败', details: String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

/**
 * GET - 获取用户的复习队列
 */
export async function GET(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      )
    }
    
    const query = `
      SELECT 
        rq.id,
        rq.knowledge_point_id,
        rq.user_id,
        rq.priority,
        rq.added_at,
        kt.title,
        kt.importance,
        kt.drug_name,
        ukm.mastery_score
      FROM review_queue rq
      JOIN knowledge_tree kt ON rq.knowledge_point_id = kt.id
      LEFT JOIN user_knowledge_mastery ukm 
        ON kt.id = ukm.knowledge_point_id 
        AND ukm.user_id = rq.user_id
      WHERE rq.user_id = $1
      ORDER BY rq.priority DESC, rq.added_at DESC
      LIMIT $2
    `
    
    const result = await client.query(query, [userId, limit])
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
    })
    
  } catch (error) {
    console.error('获取复习队列失败:', error)
    return NextResponse.json(
      { success: false, error: '获取复习队列失败', details: String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

/**
 * DELETE - 从复习队列移除知识点
 */
export async function DELETE(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const { searchParams } = new URL(request.url)
    const knowledgePointId = searchParams.get('knowledgePointId')
    const userId = searchParams.get('userId')
    
    if (!knowledgePointId || !userId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }
    
    const query = `
      DELETE FROM review_queue
      WHERE knowledge_point_id = $1 AND user_id = $2
      RETURNING id
    `
    
    const result = await client.query(query, [knowledgePointId, userId])
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '该知识点不在复习队列中' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: '已从复习队列移除',
    })
    
  } catch (error) {
    console.error('移除复习队列失败:', error)
    return NextResponse.json(
      { success: false, error: '移除复习队列失败', details: String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
