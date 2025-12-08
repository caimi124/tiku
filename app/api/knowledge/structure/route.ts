/**
 * 知识结构API
 * 
 * 返回章节和小节结构（不含考点详情），用于首页三级手风琴布局
 * 
 * GET /api/knowledge/structure?subject=xiyao_yaoxue_er
 * 
 * Requirements: 1.1, 1.2, 16.1
 * 
 * Updated: 2024-12-08 - 强制重新部署
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
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
  sections: SectionStructure[]
}

interface SectionStructure {
  id: string
  code: string
  title: string
  point_count: number
  high_frequency_count: number
  mastery_score: number
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
    const subject = searchParams.get('subject') || 'xiyao_yaoxue_er'
    const debug = searchParams.get('debug') === 'true'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 获取所有章节
    const { data: chapters, error: chaptersError, count } = await supabase
      .from('knowledge_tree')
      .select('id, code, title, parent_id, node_type, importance', { count: 'exact' })
      .eq('subject_code', subject)
      .in('node_type', ['chapter', 'section', 'point', 'knowledge_point'])
      .order('code')
    
    // 调试信息
    if (debug) {
      return NextResponse.json({
        debug: true,
        supabaseUrl: supabaseUrl?.substring(0, 30) + '...',
        subject,
        rawCount: count,
        dataLength: chapters?.length || 0,
        firstFew: chapters?.slice(0, 5).map(c => ({ code: c.code, title: c.title, node_type: c.node_type }))
      })
    }
    
    if (chaptersError) {
      console.error('获取知识结构失败:', chaptersError)
      return NextResponse.json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: '获取知识结构失败' }
      }, { status: 500 })
    }
    
    // 构建层级结构
    const chapterNodes = chapters?.filter(n => n.node_type === 'chapter') || []
    const sectionNodes = chapters?.filter(n => n.node_type === 'section') || []
    const pointNodes = chapters?.filter(n => 
      n.node_type === 'point' || n.node_type === 'knowledge_point'
    ) || []
    
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
      
      // 计算章节下的考点统计
      let chapterPointCount = 0
      let chapterHighFreqCount = 0
      
      const sections: SectionStructure[] = chapterSections.map(section => {
        const sectionPoints = pointNodes.filter(p => p.parent_id === section.id)
        const highFreqPoints = sectionPoints.filter(p => (p.importance || 0) >= 4)
        
        chapterPointCount += sectionPoints.length
        chapterHighFreqCount += highFreqPoints.length
        
        return {
          id: section.id,
          code: section.code,
          title: section.title,
          point_count: sectionPoints.length,
          high_frequency_count: highFreqPoints.length,
          mastery_score: 0 // TODO: 从用户掌握度数据计算
        }
      })
      
      return {
        id: chapter.id,
        code: chapter.code,
        title: chapter.title,
        point_count: chapterPointCount,
        high_frequency_count: chapterHighFreqCount,
        mastery_score: 0, // TODO: 从用户掌握度数据计算
        sections
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        structure,
        chapters: structure, // 向后兼容，同时提供 chapters 字段
        stats
      }
    })
    
  } catch (error) {
    console.error('知识结构API错误:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: '服务器错误' }
    }, { status: 500 })
  }
}
