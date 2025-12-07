/**
 * 小节列表API
 * GET /api/chapter/[chapterId]/sections
 * 
 * 返回指定章节下所有小节的卡片数据，包括：
 * - 小节标题、编号
 * - 考点数量、高频考点数量
 * - 掌握度
 * 
 * Requirements: 1.3
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface SectionSummary {
  id: string
  code: string
  title: string
  point_count: number
  high_frequency_count: number
  mastery_score: number
}

export interface SectionsResponse {
  success: boolean
  data?: {
    chapter: { id: string; title: string; code: string }
    sections: SectionSummary[]
    stats: {
      total_sections: number
      total_points: number
      high_frequency_count: number
      suggested_time: number
    }
  }
  error?: { code: string; message: string }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  try {
    const { chapterId } = params

    // 获取章节信息
    const { data: chapter, error: chapterError } = await supabase
      .from('knowledge_tree')
      .select('id, code, title')
      .eq('id', chapterId)
      .eq('node_type', 'chapter')
      .single()

    if (chapterError || !chapter) {
      return NextResponse.json({
        success: false,
        error: { code: 'CHAPTER_NOT_FOUND', message: '章节不存在' }
      }, { status: 404 })
    }

    // 获取该章节下的所有小节
    const { data: sections, error: sectionsError } = await supabase
      .from('knowledge_tree')
      .select('id, code, title')
      .eq('parent_id', chapterId)
      .eq('node_type', 'section')
      .order('code')

    if (sectionsError) {
      return NextResponse.json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: sectionsError.message }
      }, { status: 500 })
    }

    // 获取每个小节的统计数据
    const sectionSummaries: SectionSummary[] = []
    let totalPoints = 0
    let totalHighFrequency = 0

    for (const section of sections || []) {
      // 获取该小节下的所有考点 (兼容 point 和 knowledge_point 两种类型)
      const { data: points } = await supabase
        .from('knowledge_tree')
        .select('id, importance, exam_frequency')
        .eq('parent_id', section.id)
        .in('node_type', ['point', 'knowledge_point'])

      const pointCount = points?.length || 0
      totalPoints += pointCount

      // 高频考点
      const highFrequencyCount = points?.filter(p => 
        p.importance >= 4 || (p.exam_frequency && p.exam_frequency >= 3)
      ).length || 0
      totalHighFrequency += highFrequencyCount

      sectionSummaries.push({
        id: section.id,
        code: section.code,
        title: section.title,
        point_count: pointCount,
        high_frequency_count: highFrequencyCount,
        mastery_score: 0 // TODO: 从用户掌握度表获取
      })
    }

    // 建议学习时间：每个考点约6分钟
    const suggestedTime = totalPoints * 6

    return NextResponse.json({
      success: true,
      data: {
        chapter: {
          id: chapter.id,
          title: chapter.title,
          code: chapter.code
        },
        sections: sectionSummaries,
        stats: {
          total_sections: sectionSummaries.length,
          total_points: totalPoints,
          high_frequency_count: totalHighFrequency,
          suggested_time: suggestedTime
        }
      }
    })

  } catch (error) {
    console.error('获取小节列表失败:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' }
    }, { status: 500 })
  }
}
