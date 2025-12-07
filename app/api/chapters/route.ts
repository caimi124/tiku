/**
 * 章节列表 API
 * 
 * GET /api/chapters - 获取所有章节列表
 * 
 * 查询参数:
 * - subject: 科目代码 (默认: xiyao_yaoxue_er)
 * - userId: 用户ID (可选，合并掌握度数据)
 * 
 * Requirements: 1.1
 */

import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

export interface ChapterSummary {
  id: string
  code: string
  title: string
  section_count: number
  point_count: number
  high_frequency_count: number
  mastery_score: number
}

export interface ChaptersResponse {
  success: boolean
  data: {
    chapters: ChapterSummary[]
    stats: {
      total_chapters: number
      total_sections: number
      total_points: number
      overall_mastery: number
    }
  }
}

export async function GET(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const { searchParams } = new URL(request.url)
    const subjectCode = searchParams.get('subject') || 'xiyao_yaoxue_er'
    const userId = searchParams.get('userId')

    // 获取章节列表及其统计信息
    const chaptersQuery = userId
      ? `
        WITH chapter_stats AS (
          SELECT 
            c.id AS chapter_id,
            COUNT(DISTINCT s.id) AS section_count,
            COUNT(DISTINCT p.id) AS point_count,
            COUNT(DISTINCT CASE WHEN p.importance >= 4 THEN p.id END) AS high_frequency_count,
            COALESCE(AVG(ukm.mastery_score), 0) AS mastery_score
          FROM knowledge_tree c
          LEFT JOIN knowledge_tree s ON s.parent_id = c.id AND s.node_type IN ('section', 'section_summary')
          LEFT JOIN knowledge_tree p ON p.parent_id = s.id AND p.node_type IN ('point', 'subsection', 'knowledge_point')
          LEFT JOIN user_knowledge_mastery ukm ON ukm.knowledge_point_id = p.id AND ukm.user_id = $2
          WHERE c.subject_code = $1 AND c.node_type = 'chapter'
          GROUP BY c.id
        )
        SELECT 
          kt.id,
          kt.code,
          kt.title,
          COALESCE(cs.section_count, 0)::int AS section_count,
          COALESCE(cs.point_count, 0)::int AS point_count,
          COALESCE(cs.high_frequency_count, 0)::int AS high_frequency_count,
          ROUND(COALESCE(cs.mastery_score, 0)::numeric, 1) AS mastery_score
        FROM knowledge_tree kt
        LEFT JOIN chapter_stats cs ON cs.chapter_id = kt.id
        WHERE kt.subject_code = $1 AND kt.node_type = 'chapter'
        ORDER BY kt.sort_order, kt.code
      `
      : `
        WITH chapter_stats AS (
          SELECT 
            c.id AS chapter_id,
            COUNT(DISTINCT s.id) AS section_count,
            COUNT(DISTINCT p.id) AS point_count,
            COUNT(DISTINCT CASE WHEN p.importance >= 4 THEN p.id END) AS high_frequency_count
          FROM knowledge_tree c
          LEFT JOIN knowledge_tree s ON s.parent_id = c.id AND s.node_type IN ('section', 'section_summary')
          LEFT JOIN knowledge_tree p ON p.parent_id = s.id AND p.node_type IN ('point', 'subsection', 'knowledge_point')
          WHERE c.subject_code = $1 AND c.node_type = 'chapter'
          GROUP BY c.id
        )
        SELECT 
          kt.id,
          kt.code,
          kt.title,
          COALESCE(cs.section_count, 0)::int AS section_count,
          COALESCE(cs.point_count, 0)::int AS point_count,
          COALESCE(cs.high_frequency_count, 0)::int AS high_frequency_count,
          0 AS mastery_score
        FROM knowledge_tree kt
        LEFT JOIN chapter_stats cs ON cs.chapter_id = kt.id
        WHERE kt.subject_code = $1 AND kt.node_type = 'chapter'
        ORDER BY kt.sort_order, kt.code
      `

    const chaptersParams = userId ? [subjectCode, userId] : [subjectCode]
    const chaptersResult = await client.query(chaptersQuery, chaptersParams)

    // 获取整体统计信息
    const statsQuery = userId
      ? `
        SELECT 
          COUNT(DISTINCT c.id)::int AS total_chapters,
          COUNT(DISTINCT s.id)::int AS total_sections,
          COUNT(DISTINCT p.id)::int AS total_points,
          ROUND(COALESCE(AVG(ukm.mastery_score), 0)::numeric, 1) AS overall_mastery
        FROM knowledge_tree c
        LEFT JOIN knowledge_tree s ON s.parent_id = c.id AND s.node_type IN ('section', 'section_summary')
        LEFT JOIN knowledge_tree p ON p.parent_id = s.id AND p.node_type IN ('point', 'subsection', 'knowledge_point')
        LEFT JOIN user_knowledge_mastery ukm ON ukm.knowledge_point_id = p.id AND ukm.user_id = $2
        WHERE c.subject_code = $1 AND c.node_type = 'chapter'
      `
      : `
        SELECT 
          COUNT(DISTINCT c.id)::int AS total_chapters,
          COUNT(DISTINCT s.id)::int AS total_sections,
          COUNT(DISTINCT p.id)::int AS total_points,
          0 AS overall_mastery
        FROM knowledge_tree c
        LEFT JOIN knowledge_tree s ON s.parent_id = c.id AND s.node_type IN ('section', 'section_summary')
        LEFT JOIN knowledge_tree p ON p.parent_id = s.id AND p.node_type IN ('point', 'subsection', 'knowledge_point')
        WHERE c.subject_code = $1 AND c.node_type = 'chapter'
      `

    const statsParams = userId ? [subjectCode, userId] : [subjectCode]
    const statsResult = await client.query(statsQuery, statsParams)

    return NextResponse.json({
      success: true,
      data: {
        chapters: chaptersResult.rows as ChapterSummary[],
        stats: {
          total_chapters: statsResult.rows[0]?.total_chapters || 0,
          total_sections: statsResult.rows[0]?.total_sections || 0,
          total_points: statsResult.rows[0]?.total_points || 0,
          overall_mastery: parseFloat(statsResult.rows[0]?.overall_mastery) || 0
        }
      }
    })

  } catch (error) {
    console.error('获取章节列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取章节列表失败', details: String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
