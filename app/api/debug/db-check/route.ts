/**
 * 数据库诊断端点
 * 用于检查生产环境的数据库连接和数据状态
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: '环境变量未配置',
        env: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
          urlPrefix: supabaseUrl?.substring(0, 30) + '...'
        }
      })
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 查询数据库统计
    const { data: chapters, error: e1 } = await supabase
      .from('knowledge_tree')
      .select('id')
      .eq('subject_code', 'xiyao_yaoxue_er')
      .eq('node_type', 'chapter')
    
    const { data: sections, error: e2 } = await supabase
      .from('knowledge_tree')
      .select('id')
      .eq('subject_code', 'xiyao_yaoxue_er')
      .eq('node_type', 'section')
    
    const { data: points, error: e3 } = await supabase
      .from('knowledge_tree')
      .select('id')
      .eq('subject_code', 'xiyao_yaoxue_er')
      .in('node_type', ['point', 'knowledge_point'])
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      env: {
        supabaseUrl: supabaseUrl?.substring(0, 40) + '...',
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      stats: {
        chapters: chapters?.length || 0,
        sections: sections?.length || 0,
        points: points?.length || 0,
        total: (chapters?.length || 0) + (sections?.length || 0) + (points?.length || 0)
      },
      errors: {
        chapters: e1?.message,
        sections: e2?.message,
        points: e3?.message
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
