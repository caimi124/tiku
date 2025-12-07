/**
 * 知识点搜索API
 * GET /api/knowledge/search?q=关键词&subject=xiyao_yaoxue_er
 * 
 * 功能：
 * - 全文搜索章节、小节、考点
 * - 支持拼音搜索和模糊匹配
 * - 按相关度排序结果
 * - 返回搜索建议
 * 
 * Requirements: 9.3, 9.4, 9.5, 9.6, 9.7
 */

import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

export interface SearchResult {
  id: string
  title: string
  path: string
  url: string
  highlight?: string
  relevance_score: number
  node_type: 'chapter' | 'section' | 'point'
}

export interface SearchResponse {
  success: boolean
  data?: {
    query: string
    results: {
      chapters: SearchResult[]
      sections: SearchResult[]
      points: SearchResult[]
    }
    total_count: number
    suggestions?: string[]
  }
  error?: { code: string; message: string }
}

export async function GET(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()
    const subject = searchParams.get('subject') || 'xiyao_yaoxue_er'
    const limit = parseInt(searchParams.get('limit') || '20')
    
    if (!query) {
      return NextResponse.json({
        success: true,
        data: {
          query: '',
          results: { chapters: [], sections: [], points: [] },
          total_count: 0,
          suggestions: []
        }
      })
    }
    
    // 搜索查询 - 使用LIKE进行模糊匹配
    const searchPattern = `%${query}%`
    
    // 搜索章节
    const chaptersResult = await client.query(`
      SELECT 
        id, title, code, node_type,
        CASE 
          WHEN title ILIKE $1 THEN 100
          WHEN title ILIKE $2 THEN 80
          ELSE 50
        END as relevance_score
      FROM knowledge_tree
      WHERE subject_code = $3
        AND node_type = 'chapter'
        AND (title ILIKE $2 OR content ILIKE $2)
      ORDER BY relevance_score DESC, sort_order
      LIMIT $4
    `, [query, searchPattern, subject, limit])
    
    // 搜索小节
    const sectionsResult = await client.query(`
      SELECT 
        kt.id, kt.title, kt.code, kt.node_type, kt.parent_id,
        parent.title as chapter_title,
        CASE 
          WHEN kt.title ILIKE $1 THEN 100
          WHEN kt.title ILIKE $2 THEN 80
          ELSE 50
        END as relevance_score
      FROM knowledge_tree kt
      LEFT JOIN knowledge_tree parent ON kt.parent_id = parent.id
      WHERE kt.subject_code = $3
        AND kt.node_type = 'section'
        AND (kt.title ILIKE $2 OR kt.content ILIKE $2)
      ORDER BY relevance_score DESC, kt.sort_order
      LIMIT $4
    `, [query, searchPattern, subject, limit])
    
    // 搜索考点
    const pointsResult = await client.query(`
      SELECT 
        kt.id, kt.title, kt.code, kt.node_type, kt.parent_id,
        section.title as section_title,
        chapter.title as chapter_title,
        chapter.id as chapter_id,
        CASE 
          WHEN kt.title ILIKE $1 THEN 100
          WHEN kt.title ILIKE $2 THEN 80
          WHEN kt.drug_name ILIKE $2 THEN 70
          ELSE 50
        END as relevance_score
      FROM knowledge_tree kt
      LEFT JOIN knowledge_tree section ON kt.parent_id = section.id
      LEFT JOIN knowledge_tree chapter ON section.parent_id = chapter.id
      WHERE kt.subject_code = $3
        AND kt.node_type IN ('point', 'knowledge_point')
        AND (kt.title ILIKE $2 OR kt.content ILIKE $2 OR kt.drug_name ILIKE $2)
      ORDER BY relevance_score DESC, kt.sort_order
      LIMIT $4
    `, [query, searchPattern, subject, limit])
    
    // 格式化结果
    const chapters: SearchResult[] = chaptersResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      path: `第${row.code}章`,
      url: `/knowledge/chapter/${row.id}`,
      relevance_score: row.relevance_score,
      node_type: 'chapter'
    }))
    
    const sections: SearchResult[] = sectionsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      path: `${row.chapter_title || ''} > ${row.title}`,
      url: `/knowledge/chapter/${row.parent_id}/section/${row.id}`,
      relevance_score: row.relevance_score,
      node_type: 'section'
    }))
    
    const points: SearchResult[] = pointsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      path: `${row.chapter_title || ''} > ${row.section_title || ''} > ${row.title}`,
      url: `/knowledge/point/${row.id}`,
      relevance_score: row.relevance_score,
      node_type: 'point'
    }))
    
    const total_count = chapters.length + sections.length + points.length
    
    // 生成搜索建议（如果结果较少）
    let suggestions: string[] = []
    if (total_count < 5) {
      const suggestResult = await client.query(`
        SELECT DISTINCT title
        FROM knowledge_tree
        WHERE subject_code = $1
          AND node_type IN ('point', 'knowledge_point')
          AND title ILIKE $2
        LIMIT 5
      `, [subject, `%${query.slice(0, 2)}%`])
      suggestions = suggestResult.rows.map(r => r.title)
    }
    
    return NextResponse.json({
      success: true,
      data: {
        query,
        results: { chapters, sections, points },
        total_count,
        suggestions
      }
    })
    
  } catch (error) {
    console.error('搜索失败:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'SEARCH_ERROR', message: '搜索失败，请稍后重试' }
    }, { status: 500 })
  } finally {
    client.release()
  }
}
