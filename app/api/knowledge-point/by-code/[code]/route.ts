/**
 * 根据考点编码查询考点详情
 * GET /api/knowledge-point/by-code/[code]
 */

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const client = await pool.connect()
  
  try {
    const { code } = await params
    
    const result = await client.query(`
      SELECT 
        id,
        code,
        title,
        content,
        node_type,
        point_type,
        drug_name,
        importance,
        importance_level,
        learn_mode,
        error_pattern_tags,
        memory_tips,
        parent_id,
        subject_code,
        level,
        sort_order,
        key_takeaway,
        exam_years,
        exam_frequency
      FROM knowledge_tree
      WHERE code = $1
      LIMIT 1
    `, [code])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: `考点 ${code} 不存在` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
    
  } catch (error) {
    console.error('查询考点失败:', error)
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

