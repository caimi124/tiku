/**
 * 批量回填考点类型 exam_point_type
 * Backfill script for exam_point_type field
 * 
 * 用法：
 *   $Env:SUPABASE_SERVICE_ROLE_KEY="..." \
 *   npx tsx scripts/backfill-exam-point-type.ts
 * 
 * Dry-run 模式（不实际更新数据库）：
 *   npx tsx scripts/backfill-exam-point-type.ts --dry-run
 */

import { createClient } from '@supabase/supabase-js'
import { inferExamPointType } from '../lib/knowledge/examPointTypeRules'
import type { ExamPointType } from '../lib/knowledge/examPointType'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://tparjdkxxtnentsdazfw.supabase.co'

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_KEY) {
  throw new Error('需要设置 SUPABASE_SERVICE_ROLE_KEY 或 NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const PAGE_SIZE = 500
const DRY_RUN = process.argv.includes('--dry-run')

interface KnowledgePointRow {
  id: string
  point_name: string
  point_content: string | null
  exam_point_type: string | null
  chapter?: string
  section?: string
}

interface ClassificationStats {
  total: number
  updated: number
  skipped: number
  byType: Record<ExamPointType, number>
  uncertain: Array<{
    id: string
    title: string
    inferredType: ExamPointType
    matchedRules: string[]
  }>
}

/**
 * 获取所有需要分类的知识点（分页）
 */
async function fetchPointsInBatches(
  page: number,
  pageSize: number
): Promise<KnowledgePointRow[]> {
  const { data, error } = await supabase
    .from('knowledge_points')
    .select('id, point_name, point_content, exam_point_type, chapter, section')
    .order('id')
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (error) {
    throw new Error(`获取知识点失败: ${error.message}`)
  }

  return (data || []) as KnowledgePointRow[]
}

/**
 * 更新知识点的 exam_point_type
 */
async function updateExamPointType(
  id: string,
  examPointType: ExamPointType
): Promise<void> {
  if (DRY_RUN) {
    return // Dry-run 模式下不实际更新
  }

  const { error } = await supabase
    .from('knowledge_points')
    .update({ exam_point_type: examPointType })
    .eq('id', id)

  if (error) {
    throw new Error(`更新知识点 ${id} 失败: ${error.message}`)
  }
}

/**
 * 检查是否需要更新（只更新 NULL/空值）
 */
function shouldUpdate(point: KnowledgePointRow): boolean {
  return !point.exam_point_type || point.exam_point_type.trim() === ''
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(60))
  console.log(DRY_RUN ? '🔍 DRY-RUN 模式：只打印，不更新数据库' : '🚀 开始批量回填 exam_point_type')
  console.log('='.repeat(60))
  console.log()

  const stats: ClassificationStats = {
    total: 0,
    updated: 0,
    skipped: 0,
    byType: {
      single_drug: 0,
      drug_class: 0,
      clinical_selection: 0,
      adr_interaction: 0,
      mechanism_basic: 0,
    },
    uncertain: [],
  }

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

      // 分类
      const result = inferExamPointType({
        id: point.id,
        point_name: point.point_name,
        title: point.point_name,
        point_content: point.point_content || '',
        content: point.point_content || '',
        chapter: point.chapter,
        section: point.section,
      })

      // 记录统计
      stats.byType[result.type]++

      // 记录不确定的点
      if (result.uncertain || result.confidence === 'low') {
        stats.uncertain.push({
          id: point.id,
          title: point.point_name,
          inferredType: result.type,
          matchedRules: result.matchedRules,
        })
      }

      // 更新数据库
      if (DRY_RUN) {
        console.log(
          `  [DRY-RUN] ${point.id.substring(0, 8)}... | ${point.point_name.substring(0, 30).padEnd(30)} | → ${result.type} (${result.confidence})`
        )
      } else {
        await updateExamPointType(point.id, result.type)
      }

      stats.updated++
    }

    const pageUpdated = points.filter(p => shouldUpdate(p)).length
    console.log(`  ✅ 本页完成：扫描 ${points.length} 条，更新 ${pageUpdated} 条，跳过 ${points.length - pageUpdated} 条`)

    if (points.length < PAGE_SIZE) {
      hasMore = false
    } else {
      page++
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
  console.log(`  single_drug (单药):        ${stats.byType.single_drug}`)
  console.log(`  drug_class (分类):         ${stats.byType.drug_class}`)
  console.log(`  clinical_selection (临床选择): ${stats.byType.clinical_selection}`)
  console.log(`  adr_interaction (不良反应):   ${stats.byType.adr_interaction}`)
  console.log(`  mechanism_basic (机制基础):   ${stats.byType.mechanism_basic}`)
  console.log()

  // 输出不确定的点（最多50个）
  if (stats.uncertain.length > 0) {
    console.log('='.repeat(60))
    console.log(`⚠️  不确定的点（共 ${stats.uncertain.length} 个，显示前 50 个）`)
    console.log('='.repeat(60))
    
    const topUncertain = stats.uncertain.slice(0, 50)
    topUncertain.forEach((item, idx) => {
      console.log(`${idx + 1}. [${item.id.substring(0, 8)}...] ${item.title}`)
      console.log(`   推断类型: ${item.inferredType}`)
      console.log(`   匹配规则: ${item.matchedRules.join(', ')}`)
      console.log()
    })

    if (stats.uncertain.length > 50) {
      console.log(`... 还有 ${stats.uncertain.length - 50} 个不确定的点未显示`)
    }
  } else {
    console.log('✅ 所有点分类置信度良好，无不确定项')
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

