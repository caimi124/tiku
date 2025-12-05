/**
 * 知识点详情 API
 * 
 * GET /api/knowledge-point/[id] - 获取单个知识点详情
 * 
 * 查询参数:
 * - userId: 用户ID (可选，获取用户掌握度数据)
 * 
 * Requirements: 4.1, 4.3
 */

import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

export interface ContentItemAccuracy {
  item_key: string      // 内容项标识（如 "适应证"、"禁忌" 等）
  total_count: number   // 总答题次数
  correct_count: number // 正确次数
  accuracy: number      // 正确率 (0-100)
}

export interface KnowledgePointDetail {
  id: string
  code: string
  title: string
  content: string
  node_type: string
  point_type?: string
  drug_name?: string
  importance: number
  memory_tips?: string
  parent_id?: string
  subject_code: string
  level: number
  sort_order: number
  // 用户掌握度数据
  mastery_score?: number
  mastery_status?: 'mastered' | 'review' | 'weak' | 'unlearned'
  is_weak_point?: boolean
  last_review_at?: string
  practice_count?: number
  correct_rate?: number
  // 父节点信息（面包屑）
  breadcrumb?: BreadcrumbItem[]
  // 相关考点
  related_points?: RelatedPoint[]
  // 内容项正确率
  content_item_accuracy?: ContentItemAccuracy[]
}

export interface BreadcrumbItem {
  id: string
  title: string
  level: number
}

export interface RelatedPoint {
  id: string
  title: string
  importance: number
  mastery_score?: number
}

// 掌握度阈值
const MASTERY_THRESHOLDS = {
  MASTERED: 80,
  REVIEW: 60,
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect()
  
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // 获取知识点详情
    let pointQuery: string
    const queryParams: any[] = [id]
    
    if (userId) {
      pointQuery = `
        SELECT 
          kt.id,
          kt.code,
          kt.title,
          kt.content,
          kt.node_type,
          kt.point_type,
          kt.drug_name,
          kt.importance,
          kt.memory_tips,
          kt.parent_id,
          kt.subject_code,
          kt.level,
          kt.sort_order,
          ukm.mastery_score,
          ukm.is_weak_point,
          ukm.last_review_at,
          ukm.practice_count,
          ukm.correct_rate
        FROM knowledge_tree kt
        LEFT JOIN user_knowledge_mastery ukm 
          ON kt.id = ukm.knowledge_point_id 
          AND ukm.user_id = $2
        WHERE kt.id = $1
      `
      queryParams.push(userId)
    } else {
      pointQuery = `
        SELECT 
          id,
          code,
          title,
          content,
          node_type,
          point_type,
          drug_name,
          importance,
          memory_tips,
          parent_id,
          subject_code,
          level,
          sort_order
        FROM knowledge_tree
        WHERE id = $1
      `
    }
    
    const pointResult = await client.query(pointQuery, queryParams)
    
    if (pointResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '知识点不存在' },
        { status: 404 }
      )
    }
    
    const point = pointResult.rows[0]
    
    // 获取面包屑（父节点链）
    const breadcrumb = await getBreadcrumb(client, point.parent_id)
    
    // 获取相关考点（同一父节点下的其他考点）
    const relatedPoints = await getRelatedPoints(client, point.parent_id, point.id, userId)
    
    // 获取内容项正确率（如果有用户ID）
    const contentItemAccuracy = userId 
      ? await getContentItemAccuracy(client, id, userId)
      : parseContentForDisplay(point.content)
    
    // 处理掌握状态
    const masteryStatus = getMasteryStatus(point.mastery_score)
    
    const result: KnowledgePointDetail = {
      ...point,
      mastery_status: masteryStatus,
      is_weak_point: point.mastery_score !== null && point.mastery_score < MASTERY_THRESHOLDS.REVIEW,
      breadcrumb,
      related_points: relatedPoints,
      content_item_accuracy: contentItemAccuracy,
    }
    
    return NextResponse.json({
      success: true,
      data: result,
    })
    
  } catch (error) {
    console.error('获取知识点详情失败:', error)
    return NextResponse.json(
      { success: false, error: '获取知识点详情失败', details: String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

/**
 * 获取面包屑导航
 */
async function getBreadcrumb(client: any, parentId: string | null): Promise<BreadcrumbItem[]> {
  if (!parentId) return []
  
  const breadcrumb: BreadcrumbItem[] = []
  let currentId = parentId
  
  while (currentId) {
    const result = await client.query(
      'SELECT id, title, level, parent_id FROM knowledge_tree WHERE id = $1',
      [currentId]
    )
    
    if (result.rows.length === 0) break
    
    const node = result.rows[0]
    breadcrumb.unshift({
      id: node.id,
      title: node.title,
      level: node.level,
    })
    
    currentId = node.parent_id
  }
  
  return breadcrumb
}

/**
 * 获取相关考点
 */
async function getRelatedPoints(
  client: any,
  parentId: string | null,
  currentId: string,
  userId: string | null
): Promise<RelatedPoint[]> {
  if (!parentId) return []
  
  let query: string
  const params: any[] = [parentId, currentId]
  
  if (userId) {
    query = `
      SELECT 
        kt.id,
        kt.title,
        kt.importance,
        ukm.mastery_score
      FROM knowledge_tree kt
      LEFT JOIN user_knowledge_mastery ukm 
        ON kt.id = ukm.knowledge_point_id 
        AND ukm.user_id = $3
      WHERE kt.parent_id = $1 
        AND kt.id != $2
        AND kt.node_type = 'knowledge_point'
      ORDER BY kt.sort_order
      LIMIT 5
    `
    params.push(userId)
  } else {
    query = `
      SELECT 
        id,
        title,
        importance
      FROM knowledge_tree
      WHERE parent_id = $1 
        AND id != $2
        AND node_type = 'knowledge_point'
      ORDER BY sort_order
      LIMIT 5
    `
  }
  
  const result = await client.query(query, params)
  return result.rows
}

/**
 * 获取掌握状态
 */
function getMasteryStatus(score: number | null): 'mastered' | 'review' | 'weak' | 'unlearned' {
  if (score === null || score === undefined) return 'unlearned'
  if (score >= MASTERY_THRESHOLDS.MASTERED) return 'mastered'
  if (score >= MASTERY_THRESHOLDS.REVIEW) return 'review'
  if (score > 0) return 'weak'
  return 'unlearned'
}

/**
 * 获取内容项正确率
 * 从学习记录中统计每个内容项的正确率
 */
async function getContentItemAccuracy(
  client: any,
  knowledgePointId: string,
  userId: string
): Promise<ContentItemAccuracy[]> {
  try {
    // 查询该知识点的学习记录，按内容项分组统计
    const query = `
      SELECT 
        content_item as item_key,
        COUNT(*) as total_count,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_count
      FROM learning_records
      WHERE knowledge_point_id = $1 
        AND user_id = $2
        AND content_item IS NOT NULL
      GROUP BY content_item
      ORDER BY total_count DESC
    `
    
    const result = await client.query(query, [knowledgePointId, userId])
    
    return result.rows.map((row: any) => ({
      item_key: row.item_key,
      total_count: parseInt(row.total_count),
      correct_count: parseInt(row.correct_count),
      accuracy: row.total_count > 0 
        ? Math.round((parseInt(row.correct_count) / parseInt(row.total_count)) * 100)
        : 0,
    }))
  } catch (error) {
    // 如果表不存在或查询失败，返回空数组
    console.error('获取内容项正确率失败:', error)
    return []
  }
}

/**
 * 解析内容用于显示（无用户数据时）
 * 从内容中提取结构化的内容项
 */
function parseContentForDisplay(content: string): ContentItemAccuracy[] {
  if (!content) return []
  
  const items: ContentItemAccuracy[] = []
  const lines = content.split('\n')
  
  // 查找【】包裹的标题
  for (const line of lines) {
    const match = line.match(/【(.+?)】/)
    if (match) {
      items.push({
        item_key: match[1],
        total_count: 0,
        correct_count: 0,
        accuracy: 0,
      })
    }
  }
  
  return items
}
