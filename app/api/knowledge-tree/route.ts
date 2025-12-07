/**
 * 知识点树 API (增强版)
 * 
 * GET /api/knowledge-tree - 获取知识点树结构
 * 
 * 查询参数:
 * - subject: 科目代码 (默认: xiyao_yaoxue_er)
 * - chapter: 章节ID (可选，获取特定章节)
 * - content: 是否包含详细内容 (true/false)
 * - userId: 用户ID (可选，合并掌握度数据)
 * - filter: 筛选条件 (weak/high-frequency/all)
 * - search: 搜索关键词
 * 
 * Requirements: 3.2, 3.3
 */

import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

// 支持的节点类型
const NODE_TYPES = {
  CHAPTER: 'chapter',
  SECTION: 'section',
  POINT: 'point',
  SECTION_SUMMARY: 'section_summary',
  KNOWLEDGE_POINT: 'knowledge_point'
}

// 掌握度阈值常量
const MASTERY_THRESHOLDS = {
  MASTERED: 80,    // ≥80% 已掌握
  REVIEW: 60,      // 60-79% 需复习
  WEAK: 60,        // <60% 薄弱
}

// 高频考点阈值
const HIGH_FREQUENCY_THRESHOLD = 4  // 重要性 >= 4 为高频

export interface KnowledgeNode {
  id: string
  code: string
  title: string
  content?: string
  node_type: 'chapter' | 'section' | 'subsection' | 'point' | 'knowledge_point' | 'section_summary'
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
  is_high_frequency?: boolean  // 高频考点标记
  children?: KnowledgeNode[]
}

export interface TreeStats {
  chapter_count: number
  section_count: number
  point_count: number
  high_importance_count: number
  // 用户相关统计
  mastered_count?: number
  review_count?: number
  weak_count?: number
  unlearned_count?: number
  overall_mastery?: number
}

export async function GET(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const { searchParams } = new URL(request.url)
    const subjectCode = searchParams.get('subject') || 'xiyao_yaoxue_er'
    const chapterId = searchParams.get('chapter')
    const includeContent = searchParams.get('content') === 'true'
    const userId = searchParams.get('userId')
    const filter = searchParams.get('filter') || 'all'  // weak, high-frequency, all
    const searchKeyword = searchParams.get('search')
    
    // 构建查询
    let nodesQuery: string
    const queryParams: any[] = [subjectCode]
    let paramIndex = 2
    
    if (userId) {
      // 带用户掌握度数据的查询
      nodesQuery = `
        SELECT 
          kt.id,
          kt.code,
          kt.title,
          ${includeContent ? 'kt.content,' : ''}
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
          AND ukm.user_id = $${paramIndex}
        WHERE kt.subject_code = $1
      `
      queryParams.push(userId)
      paramIndex++
    } else {
      // 不带用户数据的查询
      nodesQuery = `
        SELECT 
          kt.id,
          kt.code,
          kt.title,
          ${includeContent ? 'kt.content,' : ''}
          kt.node_type,
          kt.point_type,
          kt.drug_name,
          kt.importance,
          kt.memory_tips,
          kt.parent_id,
          kt.subject_code,
          kt.level,
          kt.sort_order
        FROM knowledge_tree kt
        WHERE kt.subject_code = $1
      `
    }
    
    // 添加章节筛选
    if (chapterId) {
      nodesQuery += ` AND (kt.id = $${paramIndex} OR kt.parent_id = $${paramIndex} OR kt.parent_id IN (SELECT id FROM knowledge_tree WHERE parent_id = $${paramIndex}))`
      queryParams.push(chapterId)
      paramIndex++
    }
    
    // 添加搜索条件
    if (searchKeyword) {
      nodesQuery += ` AND (kt.title ILIKE $${paramIndex} OR kt.drug_name ILIKE $${paramIndex} OR kt.content ILIKE $${paramIndex})`
      queryParams.push(`%${searchKeyword}%`)
      paramIndex++
    }
    
    // 添加筛选条件
    if (filter === 'weak' && userId) {
      // 只看薄弱点：掌握度 < 60%
      nodesQuery += ` AND (ukm.mastery_score IS NULL OR ukm.mastery_score < ${MASTERY_THRESHOLDS.WEAK})`
    } else if (filter === 'high-frequency') {
      // 只看高频考点：重要性 >= 4
      nodesQuery += ` AND kt.importance >= ${HIGH_FREQUENCY_THRESHOLD}`
    }
    
    nodesQuery += ' ORDER BY kt.level, kt.sort_order, kt.code'
    
    const nodesResult = await client.query(nodesQuery, queryParams)
    
    // 处理节点数据，添加掌握状态和高频标记
    const processedNodes = nodesResult.rows.map(node => ({
      ...node,
      mastery_status: getMasteryStatus(node.mastery_score),
      is_weak_point: node.mastery_score !== null && node.mastery_score < MASTERY_THRESHOLDS.WEAK,
      is_high_frequency: node.importance >= HIGH_FREQUENCY_THRESHOLD,
    }))
    
    // 构建树结构
    const tree = buildTree(processedNodes)
    
    // 统计信息查询
    let statsQuery: string
    const statsParams: any[] = [subjectCode]
    
    if (userId) {
      statsQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE kt.node_type = 'chapter') as chapter_count,
          COUNT(*) FILTER (WHERE kt.node_type = 'section') as section_count,
          COUNT(*) FILTER (WHERE kt.node_type IN ('point', 'subsection', 'knowledge_point')) as point_count,
          COUNT(*) FILTER (WHERE kt.importance >= ${HIGH_FREQUENCY_THRESHOLD}) as high_importance_count,
          COUNT(*) FILTER (WHERE ukm.mastery_score >= ${MASTERY_THRESHOLDS.MASTERED}) as mastered_count,
          COUNT(*) FILTER (WHERE ukm.mastery_score >= ${MASTERY_THRESHOLDS.REVIEW} AND ukm.mastery_score < ${MASTERY_THRESHOLDS.MASTERED}) as review_count,
          COUNT(*) FILTER (WHERE ukm.mastery_score > 0 AND ukm.mastery_score < ${MASTERY_THRESHOLDS.REVIEW}) as weak_count,
          COUNT(*) FILTER (WHERE ukm.mastery_score IS NULL OR ukm.mastery_score = 0) as unlearned_count,
          COALESCE(ROUND(AVG(ukm.mastery_score)::numeric, 1), 0) as overall_mastery
        FROM knowledge_tree kt
        LEFT JOIN user_knowledge_mastery ukm 
          ON kt.id = ukm.knowledge_point_id 
          AND ukm.user_id = $2
        WHERE kt.subject_code = $1
      `
      statsParams.push(userId)
    } else {
      statsQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE node_type = 'chapter') as chapter_count,
          COUNT(*) FILTER (WHERE node_type = 'section') as section_count,
          COUNT(*) FILTER (WHERE node_type IN ('point', 'subsection', 'knowledge_point')) as point_count,
          COUNT(*) FILTER (WHERE importance >= ${HIGH_FREQUENCY_THRESHOLD}) as high_importance_count
        FROM knowledge_tree
        WHERE subject_code = $1
      `
    }
    
    const statsResult = await client.query(statsQuery, statsParams)
    
    return NextResponse.json({
      success: true,
      data: {
        tree,
        stats: statsResult.rows[0] as TreeStats,
        subject_code: subjectCode,
        filter_applied: filter,
        has_user_data: !!userId,
      }
    })
    
  } catch (error) {
    console.error('获取知识点树失败:', error)
    return NextResponse.json(
      { success: false, error: '获取知识点树失败', details: String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
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
 * 构建树结构
 */
function buildTree(nodes: KnowledgeNode[]): KnowledgeNode[] {
  const nodeMap = new Map<string, KnowledgeNode>()
  const roots: KnowledgeNode[] = []
  
  // 第一遍：创建节点映射
  nodes.forEach(node => {
    nodeMap.set(node.id, { ...node, children: [] })
  })
  
  // 第二遍：建立父子关系
  nodes.forEach(node => {
    const currentNode = nodeMap.get(node.id)!
    if (node.parent_id && nodeMap.has(node.parent_id)) {
      const parent = nodeMap.get(node.parent_id)!
      parent.children!.push(currentNode)
    } else if (!node.parent_id || node.level === 1) {
      roots.push(currentNode)
    }
  })
  
  // 计算父节点的聚合掌握度
  calculateAggregatedMastery(roots)
  
  return roots
}

/**
 * 递归计算父节点的聚合掌握度
 * 父节点的掌握度 = 子节点掌握度的平均值
 */
function calculateAggregatedMastery(nodes: KnowledgeNode[]): void {
  nodes.forEach(node => {
    if (node.children && node.children.length > 0) {
      // 先递归处理子节点
      calculateAggregatedMastery(node.children)
      
      // 计算子节点的平均掌握度
      const childScores = node.children
        .map(child => child.mastery_score)
        .filter((score): score is number => score !== null && score !== undefined)
      
      if (childScores.length > 0) {
        const avgScore = childScores.reduce((a, b) => a + b, 0) / childScores.length
        node.mastery_score = Math.round(avgScore * 10) / 10
        node.mastery_status = getMasteryStatus(node.mastery_score)
        node.is_weak_point = node.mastery_score < MASTERY_THRESHOLDS.WEAK
      }
    }
  })
}

/**
 * 获取高频考点列表 (Top N)
 * 内部辅助函数，不导出
 */
async function getHighFrequencyPoints(
  client: any,
  subjectCode: string,
  userId?: string,
  limit: number = 10
): Promise<KnowledgeNode[]> {
  const query = userId
    ? `
      SELECT 
        kt.id,
        kt.code,
        kt.title,
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
      WHERE kt.subject_code = $1
        AND kt.node_type = 'knowledge_point'
        AND kt.importance >= ${HIGH_FREQUENCY_THRESHOLD}
      ORDER BY kt.importance DESC, ukm.mastery_score ASC NULLS FIRST
      LIMIT $3
    `
    : `
      SELECT 
        id,
        code,
        title,
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
      WHERE subject_code = $1
        AND node_type = 'knowledge_point'
        AND importance >= ${HIGH_FREQUENCY_THRESHOLD}
      ORDER BY importance DESC
      LIMIT $2
    `
  
  const params = userId 
    ? [subjectCode, userId, limit]
    : [subjectCode, limit]
  
  const result = await client.query(query, params)
  
  return result.rows.map((node: any) => ({
    ...node,
    mastery_status: getMasteryStatus(node.mastery_score),
    is_weak_point: node.mastery_score !== null && node.mastery_score < MASTERY_THRESHOLDS.WEAK,
  }))
}
