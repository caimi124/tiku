/**
 * 老司机带路内容 API
 * 
 * GET /api/expert-tips/[pointId] - 获取指定考点的老司机内容
 * 
 * Requirements: 6.3, 6.5
 */

import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

// 默认提示内容
const DEFAULT_TIPS = {
  message: '暂无老司机带路内容，敬请期待',
  exam_patterns: [],
  trap_analysis: [],
  memory_techniques: [],
  exam_tactics: [],
  predictions: []
}

export interface ExpertTipsResponse {
  success: boolean
  data: {
    pointId: string
    examPatterns: ExamPattern[]
    trapAnalysis: TrapAnalysis[]
    memoryTechniques: MemoryTechnique[]
    examTactics: ExamTactic[]
    predictions: Prediction[]
    updatedAt: string | null
    version: number
    isEmpty: boolean
  } | null
  message?: string
}

interface ExamPattern {
  title: string
  questionExample: string
  options: string[]
  correctAnswer: string
}

interface TrapAnalysis {
  trapName: string
  description: string
  commonMistake: string
  solution: string
}

interface MemoryTechnique {
  type: 'mnemonic' | 'association' | 'scenario'
  content: string
}

interface ExamTactic {
  trigger: string
  reaction: string
}

interface Prediction {
  question: string
  answer: string
  explanation: string
  probability: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: { pointId: string } }
) {
  const client = await pool.connect()
  
  try {
    const { pointId } = params
    
    if (!pointId) {
      return NextResponse.json(
        { success: false, error: '缺少考点ID参数' },
        { status: 400 }
      )
    }
    
    // 查询老司机内容
    const query = `
      SELECT 
        id,
        knowledge_point_id,
        exam_patterns,
        trap_analysis,
        memory_techniques,
        exam_tactics,
        predictions,
        version,
        updated_at
      FROM expert_tips
      WHERE knowledge_point_id = $1
    `
    
    const result = await client.query(query, [pointId])
    
    // 如果没有找到内容，返回默认提示
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          pointId,
          examPatterns: DEFAULT_TIPS.exam_patterns,
          trapAnalysis: DEFAULT_TIPS.trap_analysis,
          memoryTechniques: DEFAULT_TIPS.memory_techniques,
          examTactics: DEFAULT_TIPS.exam_tactics,
          predictions: DEFAULT_TIPS.predictions,
          updatedAt: null,
          version: 0,
          isEmpty: true
        },
        message: DEFAULT_TIPS.message
      } as ExpertTipsResponse)
    }
    
    const row = result.rows[0]
    
    // 检查内容是否为空
    const isEmpty = (
      (!row.exam_patterns || row.exam_patterns.length === 0) &&
      (!row.trap_analysis || row.trap_analysis.length === 0) &&
      (!row.memory_techniques || row.memory_techniques.length === 0) &&
      (!row.exam_tactics || row.exam_tactics.length === 0) &&
      (!row.predictions || row.predictions.length === 0)
    )
    
    return NextResponse.json({
      success: true,
      data: {
        pointId: row.knowledge_point_id,
        examPatterns: row.exam_patterns || [],
        trapAnalysis: row.trap_analysis || [],
        memoryTechniques: row.memory_techniques || [],
        examTactics: row.exam_tactics || [],
        predictions: row.predictions || [],
        updatedAt: row.updated_at?.toISOString() || null,
        version: row.version || 1,
        isEmpty
      },
      message: isEmpty ? DEFAULT_TIPS.message : undefined
    } as ExpertTipsResponse)
    
  } catch (error) {
    console.error('获取老司机内容失败:', error)
    return NextResponse.json(
      { success: false, error: '获取老司机内容失败', details: String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
