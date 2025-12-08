/**
 * 用户收藏/标记API
 * 
 * POST /api/user/favorites - 添加/移除收藏或复习标记
 * GET /api/user/favorites - 获取用户收藏或待复习列表
 * 
 * Requirements: 12.1, 12.2, 12.4
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface FavoriteItem {
  id: string
  point_id: string
  type: 'favorite' | 'review'
  title: string
  section_title: string
  chapter_title: string
  created_at: string
}

/**
 * GET - 获取用户收藏或待复习列表
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 获取当前用户
    const cookieStore = cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '请先登录' }
      }, { status: 401 })
    }
    
    const { data: { user } } = await supabase.auth.getUser(accessToken)
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '请先登录' }
      }, { status: 401 })
    }
    
    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'favorite' | 'review' | null
    
    // 构建查询
    let query = supabase
      .from('user_favorites')
      .select(`
        id,
        point_id,
        type,
        created_at,
        knowledge_tree!inner (
          id,
          title,
          parent_id
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (type) {
      query = query.eq('type', type)
    }
    
    const { data: favorites, error } = await query
    
    if (error) {
      console.error('获取收藏列表失败:', error)
      return NextResponse.json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: '获取收藏列表失败' }
      }, { status: 500 })
    }
    
    // 获取章节和小节信息
    const items: FavoriteItem[] = []
    
    for (const fav of favorites || []) {
      const point = fav.knowledge_tree as any
      
      // 获取小节信息
      const { data: section } = await supabase
        .from('knowledge_tree')
        .select('id, title, parent_id')
        .eq('id', point.parent_id)
        .single()
      
      let chapterTitle = ''
      if (section?.parent_id) {
        const { data: chapter } = await supabase
          .from('knowledge_tree')
          .select('title')
          .eq('id', section.parent_id)
          .single()
        chapterTitle = chapter?.title || ''
      }
      
      items.push({
        id: fav.id,
        point_id: fav.point_id,
        type: fav.type,
        title: point.title,
        section_title: section?.title || '',
        chapter_title: chapterTitle,
        created_at: fav.created_at
      })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        items,
        count: items.length
      }
    })
    
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: '服务器错误' }
    }, { status: 500 })
  }
}

/**
 * POST - 添加/移除收藏或复习标记
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 获取当前用户
    const cookieStore = cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '请先登录' }
      }, { status: 401 })
    }
    
    const { data: { user } } = await supabase.auth.getUser(accessToken)
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '请先登录' }
      }, { status: 401 })
    }
    
    // 解析请求体
    const body = await request.json()
    const { point_id, type, action } = body
    
    if (!point_id || !type || !action) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: '缺少必要参数' }
      }, { status: 400 })
    }
    
    if (!['favorite', 'review'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_TYPE', message: '无效的类型' }
      }, { status: 400 })
    }
    
    if (!['add', 'remove', 'toggle'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_ACTION', message: '无效的操作' }
      }, { status: 400 })
    }
    
    // 检查考点是否存在
    const { data: point } = await supabase
      .from('knowledge_tree')
      .select('id')
      .eq('id', point_id)
      .single()
    
    if (!point) {
      return NextResponse.json({
        success: false,
        error: { code: 'POINT_NOT_FOUND', message: '考点不存在' }
      }, { status: 404 })
    }
    
    // 检查当前状态
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('point_id', point_id)
      .eq('type', type)
      .single()
    
    let result: { added: boolean }
    
    if (action === 'toggle') {
      // 切换状态
      if (existing) {
        await supabase
          .from('user_favorites')
          .delete()
          .eq('id', existing.id)
        result = { added: false }
      } else {
        await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            point_id,
            type
          })
        result = { added: true }
      }
    } else if (action === 'add') {
      if (!existing) {
        await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            point_id,
            type
          })
      }
      result = { added: true }
    } else {
      // remove
      if (existing) {
        await supabase
          .from('user_favorites')
          .delete()
          .eq('id', existing.id)
      }
      result = { added: false }
    }
    
    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('操作收藏失败:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: '服务器错误' }
    }, { status: 500 })
  }
}
