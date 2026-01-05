/**
 * 补充執业药师西药二在 knowledge_tree 表中缺失的小节节点
 * 使用方式：
 *   npx tsx scripts/add-missing-sections.ts
 * 确保执行时已经设置好 SUPABASE_SERVICE_ROLE_KEY 或 NEXT_PUBLIC_SUPABASE_ANON_KEY，以及 NEXT_PUBLIC_SUPABASE_URL。
 */

import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://tparjdkxxtnentsdazfw.supabase.co'
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_KEY) {
  throw new Error(
    '需要设置 SUPABASE_SERVICE_ROLE_KEY 或 NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

interface SectionSeed {
  code: string
  title: string
  parentCode: string
  sortOrder: number
}

const missingSections: SectionSeed[] = [
  { code: 'C1.2', title: '第二节 抗癫痫药', parentCode: 'C1', sortOrder: 2 },
  { code: 'C1.3', title: '第三节 抗抑郁药', parentCode: 'C1', sortOrder: 3 },
  { code: 'C6.5', title: '第五节 骨髓保护药', parentCode: 'C6', sortOrder: 5 },
  { code: 'C7.1', title: '第一节 利尿药', parentCode: 'C7', sortOrder: 1 },
  {
    code: 'C7.2',
    title: '第二节 治疗男性勃起功能障碍药',
    parentCode: 'C7',
    sortOrder: 2
  },
  {
    code: 'C9.5',
    title: '第五节 碳青霉烯类抗菌药物',
    parentCode: 'C9',
    sortOrder: 5
  },
  {
    code: 'C9.6',
    title: '第六节 其他β内酰胺类抗菌药物',
    parentCode: 'C9',
    sortOrder: 6
  },
  {
    code: 'C9.7',
    title: '第七节 氨基糖苷类抗菌药物',
    parentCode: 'C9',
    sortOrder: 7
  },
  {
    code: 'C9.8',
    title: '第八节 四环素类抗菌药物',
    parentCode: 'C9',
    sortOrder: 8
  },
  { code: 'C11.2', title: '第二节 微量元素与维生素', parentCode: 'C11', sortOrder: 2 },
  { code: 'C11.3', title: '第三节 肠内营养药', parentCode: 'C11', sortOrder: 3 }
]

async function main() {
  console.log('检测缺失的小节节点...')
  const parentCodes = Array.from(new Set(missingSections.map(s => s.parentCode)))

  const { data: parents, error: parentError } = await supabase
    .from('knowledge_tree')
    .select('id, code')
    .in('code', parentCodes)
    .eq('node_type', 'chapter')
  if (parentError) {
    throw parentError
  }

  const parentMap = new Map(parents?.map(parent => [parent.code, parent.id]))

  const toInsert = []

  for (const section of missingSections) {
    const existing = await supabase
      .from('knowledge_tree')
      .select('id')
      .eq('code', section.code)
      .maybeSingle()
    if (existing.data) {
      console.log(`跳过已有 section ${section.code}`)
      continue
    }

    const parentId = parentMap.get(section.parentCode)
    if (!parentId) {
      console.warn(
        `未找到章节 ${section.parentCode}，请确保章节先存在再插入小节`
      )
      continue
    }

    toInsert.push({
      id: randomUUID(),
      code: section.code,
      title: section.title,
      node_type: 'section',
      parent_id: parentId,
      subject_code: 'xiyao_yaoxue_er',
      level: 2,
      sort_order: section.sortOrder,
      importance: 3,
      importance_level: 3,
      learn_mode: 'BOTH',
      error_pattern_tags: [],
      memory_tips: null
    })
  }

  if (toInsert.length === 0) {
    console.log('无需插入，所有缺失小节已存在。')
    return
  }

  const { error: upsertError } = await supabase
    .from('knowledge_tree')
    .upsert(toInsert, { onConflict: 'id' })

  if (upsertError) {
    throw upsertError
  }

  console.log(`成功插入 ${toInsert.length} 个小节`)
}

main()
  .catch(error => {
    console.error('执行失败：', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit()
  })

