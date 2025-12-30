/**
 * 知识结构API
 * 
 * 返回章节和小节结构（不含考点详情），用于首页三级手风琴布局
 * 
 * GET /api/knowledge/structure?subject=xiyao_yaoxue_er
 * 
 * Requirements: 1.1, 1.2, 16.1
 * Updated: 2025-12-08 - 西药药二完整数据（13章80节117知识点）
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface ChapterStructure {
  id: string
  code: string
  title: string
  point_count: number
  high_frequency_count: number
  mastery_score: number
  parent_id?: string | null
  node_type?: string
  level?: number | null
  sort_order?: number | null
  importance_level?: number | null
  learn_mode?: string | null
  error_pattern_tags?: string[] | null
  sections: SectionStructure[]
}

interface SectionStructure {
  id: string
  code: string
  title: string
  point_count: number
  high_frequency_count: number
  mastery_score: number
  parent_id?: string | null
  node_type?: string
  level?: number | null
  sort_order?: number | null
  importance_level?: number | null
  learn_mode?: string | null
  error_pattern_tags?: string[] | null
}

interface StructureStats {
  total_chapters: number
  total_sections: number
  total_points: number
  high_frequency_count: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectParam = searchParams.get('subject_code') || searchParams.get('subject')
    const subjectCode = subjectParam || 'xiyao_yaoxue_er'
    const debugEnabled = process.env.NODE_ENV !== 'production' || searchParams.get('debug') === '1'

    const supabase = createClient(supabaseUrl, supabaseKey)
    const cookieStore = cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const learningStatuses = ['in_progress', 'completed', 'mastered']
    let learnedPointIds: Set<string> | null = null

    if (accessToken) {
      const { data: session } = await supabase.auth.getUser(accessToken)
      const userId = session?.user?.id
      if (userId) {
        const [progressData, completionData] = await Promise.all([
          supabase
            .from('user_learning_progress')
            .select('point_id')
            .eq('user_id', userId)
            .in('status', learningStatuses),
          supabase
            .from('user_point_completion')
            .select('point_id')
            .eq('user_id', userId),
        ])

        const pointIds = new Set<string>()
        if (!progressData.error && progressData.data) {
          progressData.data.forEach((entry) => {
            if (entry.point_id) pointIds.add(entry.point_id)
          })
        }
        if (!completionData.error && completionData.data) {
          completionData.data.forEach((entry) => {
            if (entry.point_id) pointIds.add(entry.point_id)
          })
        }
        if (pointIds.size > 0) {
          learnedPointIds = pointIds
        }
      }
    }
    
    // 分别查询各类型节点（避免 .in() 可能的问题）
    // 使用 sort_order 排序确保章节按正确顺序显示（第一章、第二章...）
    const [chaptersRes, sectionsRes, pointsRes] = await Promise.all([
      supabase
        .from('knowledge_tree')
        .select('id, code, title, parent_id, node_type, level, importance, importance_level, learn_mode, error_pattern_tags, sort_order')
        .eq('subject_code', subjectCode)
        .eq('node_type', 'chapter')
        .order('sort_order', { ascending: true }),
      supabase
        .from('knowledge_tree')
        .select('id, code, title, parent_id, node_type, level, importance, importance_level, learn_mode, error_pattern_tags, sort_order')
        .eq('subject_code', subjectCode)
        .eq('node_type', 'section')
        .order('sort_order', { ascending: true }),
      supabase
        .from('knowledge_tree')
        .select('id, code, title, parent_id, node_type, level, importance, importance_level, learn_mode, error_pattern_tags, sort_order')
        .eq('subject_code', subjectCode)
        .in('node_type', ['point', 'knowledge_point'])
        .order('sort_order', { ascending: true })
    ])
    
    if (chaptersRes.error || sectionsRes.error || pointsRes.error) {
      console.error('获取知识结构失败:', chaptersRes.error || sectionsRes.error || pointsRes.error)
      return NextResponse.json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: '获取知识结构失败' }
      }, { status: 500 })
    }
    
    // 构建层级结构
    const chapterNodes = chaptersRes.data || []
    const sectionNodes = sectionsRes.data || []
    const pointNodes = pointsRes.data || []

    const sectionIdToChapterId = new Map<string, string>()
    sectionNodes.forEach((section) => {
      if (section.parent_id) {
        sectionIdToChapterId.set(section.id, section.parent_id)
      }
    })

    const pointsBySection = new Map<string, typeof pointNodes>()
    const pointIdToSectionId = new Map<string, string>()
    pointNodes.forEach((point) => {
      const sectionId = point.parent_id || ''
      pointIdToSectionId.set(point.id, sectionId)
      const existing = pointsBySection.get(sectionId) ?? []
      existing.push(point)
      pointsBySection.set(sectionId, existing)
    })

    const learnedPoints = learnedPointIds ?? new Set<string>()
    
    // 统计信息
    const stats: StructureStats = {
      total_chapters: chapterNodes.length,
      total_sections: sectionNodes.length,
      total_points: pointNodes.length,
      high_frequency_count: pointNodes.filter(p => (p.importance || 0) >= 4).length
    }
    
    // 构建章节结构
    const structure: ChapterStructure[] = chapterNodes.map(chapter => {
      const chapterSections = sectionNodes.filter(s => s.parent_id === chapter.id)
      
      let chapterPointCount = 0
      let chapterHighFreqCount = 0
      let chapterLearnedCount = 0

      const sections: SectionStructure[] = chapterSections.map(section => {
        const sectionPoints = pointsBySection.get(section.id) ?? []
        const highFreqPoints = sectionPoints.filter(p => (p.importance || 0) >= 4)
        const sectionLearnedCount = sectionPoints.filter((point) => learnedPoints.has(point.id)).length
        
        chapterPointCount += sectionPoints.length
        chapterHighFreqCount += highFreqPoints.length
        chapterLearnedCount += sectionLearnedCount

        const sectionMastery =
          sectionPoints.length > 0 ? Math.round((sectionLearnedCount / sectionPoints.length) * 100) : 0
        
        return {
          id: section.id,
          code: section.code,
          title: section.title,
          point_count: sectionPoints.length,
          high_frequency_count: highFreqPoints.length,
          mastery_score: sectionMastery,
          parent_id: section.parent_id,
          node_type: section.node_type,
          level: section.level,
          sort_order: section.sort_order,
          importance_level: section.importance_level,
          learn_mode: section.learn_mode,
          error_pattern_tags: section.error_pattern_tags
        }
      })
      
      const chapterMastery =
        chapterPointCount > 0 ? Math.round((chapterLearnedCount / chapterPointCount) * 100) : 0
      
      return {
        id: chapter.id,
        code: chapter.code,
        title: chapter.title,
        point_count: chapterPointCount,
        high_frequency_count: chapterHighFreqCount,
        mastery_score: chapterMastery,
        parent_id: chapter.parent_id,
        node_type: chapter.node_type,
        level: chapter.level,
        sort_order: chapter.sort_order,
        importance_level: chapter.importance_level,
        learn_mode: chapter.learn_mode,
        error_pattern_tags: chapter.error_pattern_tags,
        sections
      }
    })
    
    const responsePayload: Record<string, any> = {
      success: true,
      data: {
        structure,
        chapters: structure, // 向后兼容，同时提供 chapters 字段
        stats
      }
    }

    if (debugEnabled) {
      responsePayload.debug = {
        counts: {
          chapters: chapterNodes.length,
          sections: sectionNodes.length
        },
        sampleSections: sectionNodes.slice(0, 5).map(section => section.code)
      }
    }

    const response = NextResponse.json(responsePayload)
    
    // 禁用缓存，确保每次都从数据库获取最新数据
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
    
  } catch (error) {
    console.error('知识结构API错误:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: '服务器错误' }
    }, { status: 500 })
  }
}
