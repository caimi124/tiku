/**
 * 考点列表API（懒加载版）
 * GET /api/section/[sectionId]/points
 * 
 * 返回指定小节下所有考点的行数据，用于首页手风琴展开时懒加载
 * 
 * 返回数据：
 * - 考点标题、编号
 * - 重要性星级
 * - 优先级标签（高频等）
 * - 一句话简介（≤30字，超出截断）
 * - 历年考查年份
 * 
 * 注意：不返回详细内容（作用机制、不良反应等）
 * 
 * Requirements: 1.5, 1.6, 6.1, 6.2, 16.2
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// 标签定义
const TAG_DEFINITIONS = {
  high_frequency: { label: '高频', color: '#EF4444' },
  must_test: { label: '必考', color: '#F97316' },
  easy_mistake: { label: '易错', color: '#EAB308' },
  basic: { label: '基础', color: '#3B82F6' },
  reinforce: { label: '强化', color: '#8B5CF6' },
}

export interface PointTag {
  type: string
  label: string
  color: string
}

export interface PointSummary {
  id: string
  code: string
  title: string
  key_takeaway: string
  tags: PointTag[]
  exam_years: number[]
  importance: number
  mastery_score: number
}

export interface PointOverview {
  total_points: number
  high_frequency_count: number
  tag_distribution: { [tag: string]: number }
  suggested_time: number
  trend_summary: string
  recommended_points: string[]
}


export async function GET(
  request: NextRequest,
  { params }: { params: { sectionId: string } }
) {
  try {
    const { sectionId } = params

    // 获取小节信息
    const { data: section, error: sectionError } = await supabase
      .from('knowledge_tree')
      .select('id, code, title, parent_id')
      .eq('id', sectionId)
      .eq('node_type', 'section')
      .single()

    if (sectionError || !section) {
      return NextResponse.json({
        success: false,
        error: { code: 'SECTION_NOT_FOUND', message: '小节不存在' }
      }, { status: 404 })
    }

    // 获取章节信息
    const { data: chapter } = await supabase
      .from('knowledge_tree')
      .select('id, code, title')
      .eq('id', section.parent_id)
      .single()

    // 获取该小节下的所有考点（仅入口页需要的字段）
    const { data: points, error: pointsError } = await supabase
      .from('knowledge_tree')
      .select('id, code, title, key_takeaway, importance, exam_years, exam_frequency')
      .eq('parent_id', sectionId)
      .in('node_type', ['point', 'knowledge_point'])
      .order('code')

    if (pointsError) {
      return NextResponse.json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: pointsError.message }
      }, { status: 500 })
    }

    // 获取考点标签
    const pointIds = points?.map(p => p.id) || []
    const { data: tags } = await supabase
      .from('point_tags')
      .select('point_id, tag_type')
      .in('point_id', pointIds)

    // 构建标签映射
    const tagsByPoint: { [pointId: string]: PointTag[] } = {}
    tags?.forEach(tag => {
      if (!tagsByPoint[tag.point_id]) {
        tagsByPoint[tag.point_id] = []
      }
      const def = TAG_DEFINITIONS[tag.tag_type as keyof typeof TAG_DEFINITIONS]
      if (def) {
        tagsByPoint[tag.point_id].push({
          type: tag.tag_type,
          label: def.label,
          color: def.color
        })
      }
    })

    // 构建考点摘要列表
    const pointSummaries: PointSummary[] = (points || []).map(point => {
      // 自动添加高频标签（如果importance >= 4 或 exam_frequency >= 3）
      const pointTags = tagsByPoint[point.id] || []
      const isHighFrequency = point.importance >= 4 || (point.exam_frequency && point.exam_frequency >= 3)
      if (isHighFrequency && !pointTags.some(t => t.type === 'high_frequency')) {
        pointTags.unshift({
          type: 'high_frequency',
          label: '高频',
          color: '#EF4444'
        })
      }

      // 简介限制30字，超出截断
      let keyTakeaway = point.key_takeaway || ''
      if (keyTakeaway.length > 30) {
        keyTakeaway = keyTakeaway.substring(0, 30) + '...'
      }

      return {
        id: point.id,
        code: point.code,
        title: point.title,
        key_takeaway: keyTakeaway,
        tags: pointTags,
        exam_years: point.exam_years || [],
        importance: point.importance || 3,
        mastery_score: 0 // TODO: 从用户掌握度表获取
      }
    })

    // 计算统计数据
    const highFrequencyCount = pointSummaries.filter(p => 
      p.tags.some(t => t.type === 'high_frequency')
    ).length

    // 标签分布
    const tagDistribution: { [tag: string]: number } = {}
    pointSummaries.forEach(p => {
      p.tags.forEach(t => {
        tagDistribution[t.type] = (tagDistribution[t.type] || 0) + 1
      })
    })

    // 推荐重点关注的考点（高频 + 重要性高）
    const recommendedPoints = pointSummaries
      .filter(p => p.importance >= 4)
      .slice(0, 3)
      .map(p => p.id)

    const overview: PointOverview = {
      total_points: pointSummaries.length,
      high_frequency_count: highFrequencyCount,
      tag_distribution: tagDistribution,
      suggested_time: pointSummaries.length * 6, // 每个考点约6分钟
      trend_summary: highFrequencyCount > pointSummaries.length / 2 
        ? '本节高频考点较多，建议重点复习' 
        : '本节考点分布均匀，建议全面学习',
      recommended_points: recommendedPoints
    }

    return NextResponse.json({
      success: true,
      data: {
        chapter: chapter ? {
          id: chapter.id,
          title: chapter.title,
          code: chapter.code
        } : null,
        section: {
          id: section.id,
          title: section.title,
          code: section.code
        },
        overview,
        points: pointSummaries
      }
    })

  } catch (error) {
    console.error('获取考点列表失败:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' }
    }, { status: 500 })
  }
}
