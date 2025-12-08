/**
 * 获取下一个未完成考点 API
 * 
 * 用于顺序学习模式，返回第一个未完成的考点
 * 
 * Requirements: 11.2
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
    const userId = searchParams.get('userId') || 'demo-user'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 获取所有考点，按章节和小节顺序排列
    const { data: allPoints, error: pointsError } = await supabase
      .from('knowledge_tree')
      .select('id, code, title, parent_id')
      .eq('subject', subject)
      .in('node_type', ['point', 'knowledge_point'])
      .order('code')
    
    if (pointsError) {
      console.error('获取考点列表失败:', pointsError)
      return NextResponse.json({
        success: false,
        error: { message: '获取考点列表失败' }
      }, { status: 500 })
    }
    
    // 获取用户已完成的考点
    const { data: completedPoints } = await supabase
      .from('user_learning_progress')
      .select('point_id')
      .eq('user_id', userId)
      .eq('status', 'mastered')
    
    const completedIds = new Set((completedPoints || []).map(p => p.point_id))
    
    // 找到第一个未完成的考点
    const nextPoint = (allPoints || []).find(p => !completedIds.has(p.id))
    
    if (!nextPoint) {
      return NextResponse.json({
        success: true,
        data: {
          nextPoint: null,
          completed: true,
          progress: 100,
          totalPoints: (allPoints || []).length,
          completedPoints: completedIds.size
        }
      })
    }
    
    // 获取考点的章节和小节信息
    let sectionInfo = null
    let chapterInfo = null
    
    if (nextPoint.parent_id) {
      const { data: section } = await supabase
        .from('knowledge_tree')
        .select('id, title, parent_id')
        .eq('id', nextPoint.parent_id)
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
    
    const totalPoints = (allPoints || []).length
    const progress = totalPoints > 0 
      ? Math.round((completedIds.size / totalPoints) * 100)
      : 0
    
    return NextResponse.json({
      success: true,
      data: {
        nextPoint: {
          id: nextPoint.id,
          code: nextPoint.code,
          title: nextPoint.title,
          section_id: sectionInfo?.id,
          section_title: sectionInfo?.title,
          chapter_id: chapterInfo?.id,
          chapter_title: chapterInfo?.title
        },
        progress,
        totalPoints,
        completedPoints: completedIds.size
      }
    })
  } catch (error) {
    console.error('获取下一个考点失败:', error)
    return NextResponse.json(
      { success: false, error: { message: '获取下一个考点失败' } },
      { status: 500 }
    )
  }
}
