/**
 * 批量回填高频考法与易错点
 * Backfill script for high frequency patterns and pitfalls
 * 
 * 用法：
 *   $Env:SUPABASE_SERVICE_ROLE_KEY="..." \
 *   npx tsx scripts/backfill-highfreq.ts
 * 
 * 或者设置环境变量后直接运行：
 *   npm run backfill:highfreq:dry
 * 
 * Dry-run 模式（不实际更新数据库）：
 *   npx tsx scripts/backfill-highfreq.ts --dry-run
 */

// 加载环境变量（从 .env.local）
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { extractHighFreqAndPitfalls, formatForDatabase } from '../lib/knowledge/highFreqExtractor'
import type { ExamPointType } from '../lib/knowledge/examPointType'
import { isValidExamPointType } from '../lib/knowledge/examPointType'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://tparjdkxxtnentsdazfw.supabase.co'

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_KEY) {
  console.error('❌ 错误：需要设置 SUPABASE_SERVICE_ROLE_KEY 环境变量')
  console.error('')
  console.error('请在 PowerShell 中运行：')
  console.error('  $Env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"')
  console.error('  npm run backfill:highfreq:dry')
  console.error('')
  console.error('或者创建 .env.local 文件并添加：')
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  console.error('')
  throw new Error('需要设置 SUPABASE_SERVICE_ROLE_KEY 或 NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const PAGE_SIZE = 500
const DRY_RUN = process.argv.includes('--dry-run')

// 解析 --ids 参数
function parseIdsArg(): string[] | null {
  const idsArg = process.argv.find(arg => arg.startsWith('--ids='))
  if (idsArg) {
    const ids = idsArg.split('=')[1]
    if (ids && ids.trim()) {
      return ids.split(',').map(id => id.trim()).filter(id => id.length > 0)
    }
  }
  return null
}

const SPECIFIC_IDS = parseIdsArg()

interface KnowledgePointRow {
  id: string
  point_name: string
  point_content: string | null
  exam_point_type: string | null
  hf_patterns: string | null
  pitfalls: string | null
}

interface BackfillStats {
  total: number
  updated: number
  skipped: number
  byType: Record<ExamPointType | 'null', { updated: number; avgHf: number; avgPit: number }>
}

/**
 * 根据 ID 列表获取知识点
 */
async function fetchPointsByIds(ids: string[]): Promise<KnowledgePointRow[]> {
  const { data, error } = await supabase
    .from('knowledge_points')
    .select('id, point_name, point_content, exam_point_type, hf_patterns, pitfalls')
    .in('id', ids)

  if (error) {
    throw new Error(`获取知识点失败: ${error.message}`)
  }

  return (data || []) as KnowledgePointRow[]
}

/**
 * 获取所有需要回填的知识点（分页）
 */
async function fetchPointsInBatches(
  page: number,
  pageSize: number
): Promise<KnowledgePointRow[]> {
  const { data, error } = await supabase
    .from('knowledge_points')
    .select('id, point_name, point_content, exam_point_type, hf_patterns, pitfalls')
    .order('id')
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (error) {
    throw new Error(`获取知识点失败: ${error.message}`)
  }

  return (data || []) as KnowledgePointRow[]
}

/**
 * 更新知识点的高频考法和易错点
 */
async function updateHighFreqAndPitfalls(
  id: string,
  hfPatterns: string,
  pitfalls: string
): Promise<void> {
  if (DRY_RUN) {
    return // Dry-run 模式下不实际更新
  }

  const { error } = await supabase
    .from('knowledge_points')
    .update({
      hf_patterns: hfPatterns || null,
      pitfalls: pitfalls || null,
      hf_generated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw new Error(`更新知识点 ${id} 失败: ${error.message}`)
  }
}

/**
 * 检查是否需要更新（只更新空值）
 */
function shouldUpdate(point: KnowledgePointRow): boolean {
  return !point.hf_patterns || point.hf_patterns.trim() === '' ||
         !point.pitfalls || point.pitfalls.trim() === ''
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(60))
  console.log(DRY_RUN ? '🔍 DRY-RUN 模式：只打印，不更新数据库' : '🚀 开始批量回填高频考法与易错点')
  if (SPECIFIC_IDS) {
    console.log(`📌 指定 ID 模式：处理 ${SPECIFIC_IDS.length} 个知识点`)
  }
  console.log('='.repeat(60))
  console.log()

  const stats: BackfillStats = {
    total: 0,
    updated: 0,
    skipped: 0,
    byType: {
      single_drug: { updated: 0, avgHf: 0, avgPit: 0 },
      drug_class: { updated: 0, avgHf: 0, avgPit: 0 },
      clinical_selection: { updated: 0, avgHf: 0, avgPit: 0 },
      adr_interaction: { updated: 0, avgHf: 0, avgPit: 0 },
      mechanism_basic: { updated: 0, avgHf: 0, avgPit: 0 },
      null: { updated: 0, avgHf: 0, avgPit: 0 },
    },
  }

  const typeCounts: Record<string, { hf: number[]; pit: number[] }> = {}

  // 如果指定了 ID 列表，使用 ID 模式；否则使用分页模式
  if (SPECIFIC_IDS) {
    console.log(`📄 处理指定 ID 列表（共 ${SPECIFIC_IDS.length} 个）...`)
    
    const points = await fetchPointsByIds(SPECIFIC_IDS)
    stats.total = points.length

    if (points.length === 0) {
      console.log('⚠️  未找到匹配的知识点')
      return
    }

    for (const point of points) {
      // 只处理空值
      if (!shouldUpdate(point)) {
        stats.skipped++
        continue
      }

      // 获取 exam_point_type
      const examPointType = isValidExamPointType(point.exam_point_type)
        ? point.exam_point_type
        : null

      const typeKey = examPointType || 'null'

      // 抽取
      const result = extractHighFreqAndPitfalls(
        point.point_content || '',
        examPointType,
        point.point_name
      )

      // 格式化
      const hfPatternsText = formatForDatabase(result.hf_patterns)
      const pitfallsText = formatForDatabase(result.pitfalls)

      // 统计
      if (!typeCounts[typeKey]) {
        typeCounts[typeKey] = { hf: [], pit: [] }
      }
      typeCounts[typeKey].hf.push(result.hf_patterns.length)
      typeCounts[typeKey].pit.push(result.pitfalls.length)

      // 更新数据库
      if (DRY_RUN) {
        console.log(
          `  [DRY-RUN] ${point.id.substring(0, 8)}... | ${point.point_name.substring(0, 30).padEnd(30)} | ${typeKey.padEnd(20)} | HF:${result.hf_patterns.length} PIT:${result.pitfalls.length}`
        )
        if (result.debug.matched.length > 0) {
          result.debug.matched.slice(0, 3).forEach(m => {
            console.log(`    ${m}`)
          })
        }
      } else {
        await updateHighFreqAndPitfalls(point.id, hfPatternsText, pitfallsText)
      }

      stats.updated++
      if (isValidExamPointType(typeKey)) {
        stats.byType[typeKey].updated++
      } else {
        stats.byType.null.updated++
      }
    }

    console.log(`  ✅ 完成：扫描 ${points.length} 条，更新 ${stats.updated} 条，跳过 ${stats.skipped} 条`)
  } else {
    // 分页模式
    let page = 0
    let hasMore = true

    while (hasMore) {
      console.log(`📄 处理第 ${page + 1} 页（每页 ${PAGE_SIZE} 条）...`)

      const points = await fetchPointsInBatches(page, PAGE_SIZE)

      if (points.length === 0) {
        hasMore = false
        break
      }

    stats.total += points.length

    for (const point of points) {
      // 只处理空值
      if (!shouldUpdate(point)) {
        stats.skipped++
        continue
      }

      // 获取 exam_point_type
      const examPointType = isValidExamPointType(point.exam_point_type)
        ? point.exam_point_type
        : null

      const typeKey = examPointType || 'null'

      // 抽取
      const result = extractHighFreqAndPitfalls(
        point.point_content || '',
        examPointType,
        point.point_name
      )

      // 格式化
      const hfPatternsText = formatForDatabase(result.hf_patterns)
      const pitfallsText = formatForDatabase(result.pitfalls)

      // 统计
      if (!typeCounts[typeKey]) {
        typeCounts[typeKey] = { hf: [], pit: [] }
      }
      typeCounts[typeKey].hf.push(result.hf_patterns.length)
      typeCounts[typeKey].pit.push(result.pitfalls.length)

      // 更新数据库
      if (DRY_RUN) {
        console.log(
          `  [DRY-RUN] ${point.id.substring(0, 8)}... | ${point.point_name.substring(0, 30).padEnd(30)} | ${typeKey.padEnd(20)} | HF:${result.hf_patterns.length} PIT:${result.pitfalls.length}`
        )
        if (result.debug.matched.length > 0) {
          result.debug.matched.slice(0, 3).forEach(m => {
            console.log(`    ${m}`)
          })
        }
      } else {
        await updateHighFreqAndPitfalls(point.id, hfPatternsText, pitfallsText)
      }

      stats.updated++
      if (isValidExamPointType(typeKey)) {
        stats.byType[typeKey].updated++
      } else {
        stats.byType.null.updated++
      }
    }

    const pageUpdated = points.filter(p => shouldUpdate(p)).length
    console.log(`  ✅ 本页完成：扫描 ${points.length} 条，更新 ${pageUpdated} 条，跳过 ${points.length - pageUpdated} 条`)

      if (points.length < PAGE_SIZE) {
        hasMore = false
      } else {
        page++
      }
    }
  }

  // 计算平均值
  for (const [typeKey, counts] of Object.entries(typeCounts)) {
    const type = isValidExamPointType(typeKey) ? typeKey : 'null'
    if (counts.hf.length > 0) {
      stats.byType[type].avgHf = counts.hf.reduce((a, b) => a + b, 0) / counts.hf.length
    }
    if (counts.pit.length > 0) {
      stats.byType[type].avgPit = counts.pit.reduce((a, b) => a + b, 0) / counts.pit.length
    }
  }

  // 输出汇总
  console.log()
  console.log('='.repeat(60))
  console.log('📊 汇总统计')
  console.log('='.repeat(60))
  console.log(`总扫描数: ${stats.total}`)
  console.log(`总更新数: ${stats.updated}`)
  console.log(`跳过数（已有值）: ${stats.skipped}`)
  console.log()
  console.log('📈 各类型分布:')
  for (const [type, data] of Object.entries(stats.byType)) {
    if (data.updated > 0) {
      console.log(
        `  ${type.padEnd(20)}: 更新 ${data.updated.toString().padStart(4)} 条 | 平均 HF: ${data.avgHf.toFixed(1)} | 平均 PIT: ${data.avgPit.toFixed(1)}`
      )
    }
  }
  console.log()
  console.log('='.repeat(60))
  if (DRY_RUN) {
    console.log('🔍 DRY-RUN 完成：未实际更新数据库')
    console.log('💡 如需实际更新，请移除 --dry-run 参数后重新运行')
  } else {
    console.log('✅ 批量回填完成！')
  }
  console.log('='.repeat(60))
}

main()
  .catch(error => {
    console.error('❌ 执行失败：', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })

