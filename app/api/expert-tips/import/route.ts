/**
 * 老司机带路内容批量导入 API
 * 
 * POST /api/expert-tips/import - 批量导入老司机内容
 * 
 * Requirements: 6.2
 */

import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

// Types for import data
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

interface ExpertTipImportData {
  pointId: string
  examPatterns?: ExamPattern[]
  trapAnalysis?: TrapAnalysis[]
  memoryTechniques?: MemoryTechnique[]
  examTactics?: ExamTactic[]
  predictions?: Prediction[]
}

interface ImportRequest {
  tips: ExpertTipImportData[]
}

// Validation functions
function validateExamPattern(pattern: any): pattern is ExamPattern {
  return (
    typeof pattern === 'object' &&
    typeof pattern.title === 'string' && pattern.title.length > 0 &&
    typeof pattern.questionExample === 'string' &&
    Array.isArray(pattern.options) && pattern.options.length >= 2 &&
    typeof pattern.correctAnswer === 'string'
  )
}

function validateTrapAnalysis(trap: any): trap is TrapAnalysis {
  return (
    typeof trap === 'object' &&
    typeof trap.trapName === 'string' && trap.trapName.length > 0 &&
    typeof trap.description === 'string' &&
    typeof trap.commonMistake === 'string' &&
    typeof trap.solution === 'string'
  )
}

function validateMemoryTechnique(technique: any): technique is MemoryTechnique {
  return (
    typeof technique === 'object' &&
    ['mnemonic', 'association', 'scenario'].includes(technique.type) &&
    typeof technique.content === 'string' && technique.content.length > 0
  )
}

function validateExamTactic(tactic: any): tactic is ExamTactic {
  return (
    typeof tactic === 'object' &&
    typeof tactic.trigger === 'string' && tactic.trigger.length > 0 &&
    typeof tactic.reaction === 'string' && tactic.reaction.length > 0
  )
}

function validatePrediction(prediction: any): prediction is Prediction {
  return (
    typeof prediction === 'object' &&
    typeof prediction.question === 'string' && prediction.question.length > 0 &&
    typeof prediction.answer === 'string' &&
    typeof prediction.probability === 'number' &&
    prediction.probability >= 0 && prediction.probability <= 100
  )
}

function validateImportData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.pointId || typeof data.pointId !== 'string') {
    errors.push('缺少有效的 pointId')
  }
  
  if (data.examPatterns) {
    if (!Array.isArray(data.examPatterns)) {
      errors.push('examPatterns 必须是数组')
    } else {
      data.examPatterns.forEach((p: any, i: number) => {
        if (!validateExamPattern(p)) {
          errors.push(`examPatterns[${i}] 格式无效`)
        }
      })
    }
  }
  
  if (data.trapAnalysis) {
    if (!Array.isArray(data.trapAnalysis)) {
      errors.push('trapAnalysis 必须是数组')
    } else {
      data.trapAnalysis.forEach((t: any, i: number) => {
        if (!validateTrapAnalysis(t)) {
          errors.push(`trapAnalysis[${i}] 格式无效`)
        }
      })
    }
  }
  
  if (data.memoryTechniques) {
    if (!Array.isArray(data.memoryTechniques)) {
      errors.push('memoryTechniques 必须是数组')
    } else {
      data.memoryTechniques.forEach((m: any, i: number) => {
        if (!validateMemoryTechnique(m)) {
          errors.push(`memoryTechniques[${i}] 格式无效`)
        }
      })
    }
  }
  
  if (data.examTactics) {
    if (!Array.isArray(data.examTactics)) {
      errors.push('examTactics 必须是数组')
    } else {
      data.examTactics.forEach((t: any, i: number) => {
        if (!validateExamTactic(t)) {
          errors.push(`examTactics[${i}] 格式无效`)
        }
      })
    }
  }
  
  if (data.predictions) {
    if (!Array.isArray(data.predictions)) {
      errors.push('predictions 必须是数组')
    } else {
      data.predictions.forEach((p: any, i: number) => {
        if (!validatePrediction(p)) {
          errors.push(`predictions[${i}] 格式无效`)
        }
      })
    }
  }
  
  return { valid: errors.length === 0, errors }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const body = await request.json() as ImportRequest
    
    if (!body.tips || !Array.isArray(body.tips)) {
      return NextResponse.json(
        { success: false, error: '请求体必须包含 tips 数组' },
        { status: 400 }
      )
    }
    
    if (body.tips.length === 0) {
      return NextResponse.json(
        { success: false, error: 'tips 数组不能为空' },
        { status: 400 }
      )
    }
    
    // Validate all items first
    const validationResults = body.tips.map((tip, index) => ({
      index,
      pointId: tip.pointId,
      ...validateImportData(tip)
    }))
    
    const invalidItems = validationResults.filter(r => !r.valid)
    if (invalidItems.length > 0) {
      return NextResponse.json({
        success: false,
        error: '部分数据验证失败',
        details: invalidItems.map(item => ({
          index: item.index,
          pointId: item.pointId,
          errors: item.errors
        }))
      }, { status: 400 })
    }
    
    // Begin transaction
    await client.query('BEGIN')
    
    const results = {
      inserted: 0,
      updated: 0,
      failed: 0,
      errors: [] as { pointId: string; error: string }[]
    }
    
    for (const tip of body.tips) {
      try {
        // Check if knowledge point exists
        const pointCheck = await client.query(
          'SELECT id FROM knowledge_tree WHERE id = $1',
          [tip.pointId]
        )
        
        if (pointCheck.rows.length === 0) {
          results.failed++
          results.errors.push({
            pointId: tip.pointId,
            error: '考点ID不存在'
          })
          continue
        }
        
        // Upsert expert tips
        const upsertQuery = `
          INSERT INTO expert_tips (
            knowledge_point_id,
            exam_patterns,
            trap_analysis,
            memory_techniques,
            exam_tactics,
            predictions
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (knowledge_point_id) 
          DO UPDATE SET
            exam_patterns = COALESCE($2, expert_tips.exam_patterns),
            trap_analysis = COALESCE($3, expert_tips.trap_analysis),
            memory_techniques = COALESCE($4, expert_tips.memory_techniques),
            exam_tactics = COALESCE($5, expert_tips.exam_tactics),
            predictions = COALESCE($6, expert_tips.predictions),
            updated_at = NOW()
          RETURNING (xmax = 0) AS inserted
        `
        
        const result = await client.query(upsertQuery, [
          tip.pointId,
          JSON.stringify(tip.examPatterns || []),
          JSON.stringify(tip.trapAnalysis || []),
          JSON.stringify(tip.memoryTechniques || []),
          JSON.stringify(tip.examTactics || []),
          JSON.stringify(tip.predictions || [])
        ])
        
        if (result.rows[0].inserted) {
          results.inserted++
        } else {
          results.updated++
        }
        
      } catch (error) {
        results.failed++
        results.errors.push({
          pointId: tip.pointId,
          error: String(error)
        })
      }
    }
    
    await client.query('COMMIT')
    
    return NextResponse.json({
      success: true,
      data: {
        total: body.tips.length,
        inserted: results.inserted,
        updated: results.updated,
        failed: results.failed,
        errors: results.errors.length > 0 ? results.errors : undefined
      }
    })
    
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('导入老司机内容失败:', error)
    return NextResponse.json(
      { success: false, error: '导入失败', details: String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
