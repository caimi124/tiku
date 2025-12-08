/**
 * 获取第一个考点 API
 * 
 * 用于顺序学习模式重新开始，返回第一个考点
 * 
 * Requirements: 11.1
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject') || 'xiyao_yaoxue_er'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 获取第一个考点
    const { data: firstPoint, error } = await supabase
      .from('knowledge_tree')
      .select('id, code, title, parent_id')
      .eq('subject_code', subject)
      .in('node_type', ['point', 'knowledge_point'])
      .order('code')
      .limit(1)
      .single()
    
    if (error || !firstPoint) {
      return NextResponse.json({
        success: true,
        data: {
          firstPoint: null
        }
      })
    }
    
    // 获取考点的章节和小节信息
    let sectionInfo = null
    let chapterInfo = null
    
    if (firstPoint.parent_id) {
      const { data: section } = await supabase
        .from('knowledge_tree')
        .select('id, title, parent_id')
        .eq('id', firstPoint.parent_id)
        .single()
      
      if (section) {
        sectionInfo = { id: section.id, title: section.title }
        
        if (section.parent_id) {
          const { data: chapter } = await supabase
            .from('knowledge_tree')
            .select('id, title')
            .eq('id', section.parent_id)
            .single()
          
          if (chapter) {
            chapterInfo = { id: chapter.id, title: chapter.title }
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        firstPoint: {
          id: firstPoint.id,
          code: firstPoint.code,
          title: firstPoint.title,
          section_id: sectionInfo?.id,
          section_title: sectionInfo?.title,
          chapter_id: chapterInfo?.id,
          chapter_title: chapterInfo?.title
        }
      }
    })
  } catch (error) {
    console.error('获取第一个考点失败:', error)
    return NextResponse.json(
      { success: false, error: { message: '获取第一个考点失败' } },
      { status: 500 }
    )
  }
}
