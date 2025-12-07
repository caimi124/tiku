/**
 * 小节总结 API
 * 
 * GET /api/section-summary/[id] - 获取小节总结内容
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

const HIGH_FREQUENCY_THRESHOLD = 4

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect()
  
  try {
    const { id } = await params
    
    // 获取小节总结节点
    const summaryResult = await client.query(`
      SELECT 
        kt.id,
        kt.code,
        kt.title,
        kt.content,
        kt.parent_id
      FROM knowledge_tree kt
      WHERE kt.id = $1
    `, [id])
    
    if (summaryResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '小节总结不存在' },
        { status: 404 }
      )
    }
    
    const summaryNode = summaryResult.rows[0]
    
    // 获取父节点（节）信息
    const sectionResult = await client.query(`
      SELECT 
        kt.id,
        kt.title,
        parent.title as chapter_title
      FROM knowledge_tree kt
      LEFT JOIN knowledge_tree parent ON kt.parent_id = parent.id
      WHERE kt.id = $1
    `, [summaryNode.parent_id])
    
    const sectionInfo = sectionResult.rows[0] || {}
    
    // 获取该节下的所有考点（排除小节总结本身）
    const pointsResult = await client.query(`
      SELECT 
        kt.id,
        kt.title,
        kt.importance,
        ukm.mastery_score
      FROM knowledge_tree kt
      LEFT JOIN user_knowledge_mastery ukm ON kt.id = ukm.knowledge_point_id
      WHERE kt.parent_id = $1 
        AND kt.node_type = 'point'
      ORDER BY kt.sort_order
    `, [summaryNode.parent_id])
    
    // 处理考点数据
    const points = pointsResult.rows.map(point => ({
      id: point.id,
      title: point.title,
      importance: point.importance,
      mastery_score: point.mastery_score,
      is_high_frequency: point.importance >= HIGH_FREQUENCY_THRESHOLD,
      exam_years: []  // TODO: 从数据库获取历年考查年份
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        id: summaryNode.id,
        code: summaryNode.code,
        title: sectionInfo.title || summaryNode.title,
        content: summaryNode.content,
        parent_title: sectionInfo.chapter_title || '',
        points,
        reinforcement_image: null  // TODO: 从数据库获取重点强化图
      }
    })
    
  } catch (error) {
    console.error('获取小节总结失败:', error)
    return NextResponse.json(
      { success: false, error: '获取小节总结失败', details: String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
