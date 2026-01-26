/**
 * 获取考点内容模块 API
 * GET /api/knowledge-point/blocks/[code]
 * 
 * 查询参数:
 * - stage: 阶段 (stage1, stage2, stage3) - 可选
 * - module: 模块 (M02, M03, M04, M05, M06) - 可选
 * 
 * 返回指定 code 的模块内容，用于 AI 出题
 * 如果指定 stage 和 module，返回单个模块
 * 如果只指定 stage，返回该阶段所有模块
 * 如果都不指定，返回所有模块
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const client = await pool.connect()
  
  try {
    const { code } = await params
    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage')
    const moduleParam = searchParams.get('module')
    
    if (!code) {
      return NextResponse.json(
        { success: false, error: '考点 code 不能为空' },
        { status: 400 }
      )
    }
    
    // 验证 stage 参数
    if (stage && !['stage1', 'stage2', 'stage3'].includes(stage)) {
      return NextResponse.json(
        { success: false, error: 'stage 参数必须是 stage1, stage2 或 stage3' },
        { status: 400 }
      )
    }
    
    // 验证 module 参数
    if (moduleParam && !['M02', 'M03', 'M04', 'M05', 'M06'].includes(moduleParam)) {
      return NextResponse.json(
        { success: false, error: 'module 参数必须是 M02, M03, M04, M05 或 M06' },
        { status: 400 }
      )
    }
    
    // 构建查询
    let query = `
      SELECT 
        id,
        code,
        stage,
        module,
        title,
        content,
        source,
        file_name,
        file_hash,
        parsed_version,
        updated_at,
        created_at
      FROM knowledge_point_content_blocks
      WHERE UPPER(code) = UPPER($1)
    `
    
    const queryParams: any[] = [code]
    let paramIndex = 2
    
    if (stage) {
      query += ` AND stage = $${paramIndex}`
      queryParams.push(stage)
      paramIndex++
    }
    
    if (moduleParam) {
      query += ` AND module = $${paramIndex}`
      queryParams.push(moduleParam)
      paramIndex++
    }
    
    query += ` ORDER BY stage, module`
    
    const result = await client.query(query, queryParams)
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `未找到考点 ${code} 的内容模块`,
          code,
          stage: stage || null,
          module: module || null
        },
        { status: 404 }
      )
    }
    
    // 如果指定了 stage 和 module，返回单个模块
    if (stage && module) {
      return NextResponse.json({
        success: true,
        data: {
          code: result.rows[0].code,
          stage: result.rows[0].stage,
          module: result.rows[0].module,
          title: result.rows[0].title,
          content: result.rows[0].content,
          source: result.rows[0].source,
          file_name: result.rows[0].file_name,
          updated_at: result.rows[0].updated_at
        }
      })
    }
    
    // 否则返回所有匹配的模块
    return NextResponse.json({
      success: true,
      data: {
        code,
        stage: stage || null,
        module: module || null,
        blocks: result.rows.map(row => ({
          id: row.id,
          stage: row.stage,
          module: row.module,
          title: row.title,
          content: row.content,
          source: row.source,
          file_name: row.file_name,
          updated_at: row.updated_at
        })),
        count: result.rows.length
      }
    })
    
  } catch (error) {
    console.error('获取考点内容模块失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '获取考点内容模块失败',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
