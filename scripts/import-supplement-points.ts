/**
 * 根据 `shuju/执业药师西药二补充.json` 为 `knowledge_points` 补全考点（针对 C1.2 等）。
 *
 * 用法：
 *   $Env:NEXT_PUBLIC_SUPABASE_URL="..." \
 *   $Env:SUPABASE_SERVICE_ROLE_KEY="..." \
 *   npx tsx scripts/import-supplement-points.ts
 *
 * 运行后会打印插入/更新/跳过数，并查询 `knowledge_points` 中 subject=xiyao_yaoxue_er 的总数以及 C1.2 的 sample。
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const SUBJECT = 'xiyao_yaoxue_er'
const EXAM_TYPE = '执业药师'
const DATA_FILE = path.join(process.cwd(), 'shuju', '执业药师西药二补充.json')

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

const CHINESE_ORDINALS: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
  十一: 11,
  十二: 12,
  十三: 13,
  十四: 14,
  十五: 15,
  十六: 16,
  十七: 17,
  十八: 18,
  十九: 19,
  二十: 20,
  二十一: 21,
  二十二: 22,
  二十三: 23,
  二十四: 24,
  二十五: 25,
  二十六: 26
}

type SupplementBlock = {
  章节信息?: {
    章?: string
    节?: string
  }
  考点梳理?: Array<{
    考点: string
    考查年份?: string
  }>
  考点透析?: string
  考点内容?: Array<Record<string, any>>
  chapter?: string
  section?: string
  points?: Array<Record<string, any>>
}

function parseOrdinal(text: string): number | null {
  if (!text) return null
  const match = text.match(/^第(.+?)节/) || text.match(/^第(.+?)章/)
  if (!match) return null
  const key = match[1]?.trim()
  return key ? CHINESE_ORDINALS[key] ?? null : null
}

function buildMarkdownTable(rows: Array<Record<string, any>>) {
  if (!rows?.length) return ''
  const headersSet = new Set<string>()
  rows.forEach(row => Object.keys(row || {}).forEach(key => headersSet.add(key)))
  const headers = Array.from(headersSet)
  if (!headers.length) return ''
  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`
  ]
  rows.forEach(row => {
    const cells = headers.map(header => {
      const value = row?.[header]
      if (Array.isArray(value)) return value.join('<br />')
      return String(value ?? '').replace(/\n/g, '<br />')
    })
    lines.push(`| ${cells.join(' | ')} |`)
  })
  return lines.join('\n')
}

function renderEntryContent(entry: Record<string, any>, intro?: string, summary?: { 考查年份?: string }) {
  const parts: string[] = []
  if (intro) {
    parts.push(`> 考点透析：${intro}`)
  }
  if (summary?.考查年份) {
    parts.push(`**考查年份：** ${summary.考查年份}`)
  }

  const contentValue = entry?.内容 || entry?.content
  if (Array.isArray(contentValue)) {
    parts.push(contentValue.map((line: string, idx: number) => `${idx + 1}. ${line}`).join('\n'))
  } else if (typeof contentValue === 'string') {
    parts.push(contentValue)
  }

  const tableKeys = ['内容表格', '表格']
  for (const key of tableKeys) {
    if (Array.isArray(entry?.[key]) && entry[key].length > 0) {
      parts.push(buildMarkdownTable(entry[key]))
    }
  }

  const otherKeys = Object.keys(entry || {}).filter(
    key => !['考点标题', '内容', '内容表格', '表格', 'content'].includes(key)
  )
  otherKeys.forEach(key => {
    const value = entry[key]
    if (typeof value === 'string' && value.trim()) {
      parts.push(`**${key}：** ${value}`)
    } else if (Array.isArray(value) && value.length) {
      parts.push(`**${key}：**\n${value.map((item: string, idx: number) => `${idx + 1}. ${item}`).join('\n')}`)
    }
  })

  return parts.join('\n\n').trim()
}

function normalizeText(value?: string) {
  return (value || '').replace(/\s+/g, '').replace(/考点\d*/g, '').toLowerCase()
}

function determineImportance(
  title: string,
  summaries?: SupplementBlock['考点梳理']
): { importance: number; examYears: number[] } {
  if (!summaries?.length) return { importance: 3, examYears: [] }
  const normalizedTitle = normalizeText(title)
  for (const summary of summaries) {
    const normalizedKey = normalizeText(summary.考点)
    if (!normalizedKey) continue
    if (normalizedTitle.includes(normalizedKey) || normalizedKey.includes(normalizedTitle)) {
      const yearsString = summary.考查年份 || ''
      const years = yearsString
        .split(/[\/、，,]/)
        .map(str => parseInt(str.trim(), 10))
        .filter(num => !Number.isNaN(num))
      const importance = years.length >= 2 || /2023|2024/.test(yearsString) ? 4 : 3
      return { importance, examYears: years }
    }
  }
  return { importance: 3, examYears: [] }
}

function parseSupplementFile(): SupplementBlock[] {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8')
  const matches = raw.match(/```json([\s\S]*?)```/g)
  if (matches?.length) {
    return matches
      .map(segment => segment.replace(/```json|```/g, '').trim())
      .filter(Boolean)
      .map(segment => {
        try {
          return JSON.parse(segment)
        } catch {
          return null
        }
      })
      .filter(Boolean) as SupplementBlock[]
  }
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch (error) {
    console.error('解析 supplement JSON 失败，前 3 个 raw preview：')
    raw
      .split(/\r?\n/)
      .slice(0, 3)
      .forEach(line => console.log(line))
    throw new Error('无法解析补充文件，请确保文件是合法 JSON 或包含 ```json``` 块')
  }
}

type NormalizedPoint = {
  chapterCode: string
  sectionCode: string
  title: string
  content: string
  examYears: number[]
  importance: number
}

async function main() {
  const blocks = parseSupplementFile()
  if (!blocks.length) {
    console.log('没有可导入的数据块')
    return
  }

  const normalizedPoints: NormalizedPoint[] = []
  const rawPreview = JSON.stringify(blocks.slice(0, 3), null, 2)

  blocks.forEach(block => {
    const chapterText = block.chapter || block.章节信息?.章
    const sectionText = block.section || block.章节信息?.节

    const chapterIndex = parseOrdinal(chapterText || '')
    const sectionIndex = parseOrdinal(sectionText || '')

    if (!chapterIndex || !sectionIndex) {
      console.warn('无法解析章节信息，跳过：', { chapterText, sectionText })
      console.log('raw preview:', rawPreview)
      return
    }

    const chapterCode = `C${chapterIndex}`
    const sectionCode = `${chapterCode}.${sectionIndex}`

    const summaries = block.考点梳理
    const intro = block.考点透析
    const entries: Array<Record<string, any>> =
      block.考点内容 || block.points || []

    entries.forEach((entry, idx) => {
      const title = entry?.考点标题 || entry?.title || `${sectionCode} 考点${idx + 1}`
      if (!title.trim()) return
      const { importance, examYears } = determineImportance(title, summaries)
      const content = renderEntryContent(
        entry,
        idx === 0 ? intro : undefined,
        summaries?.find(summary => {
          const normalizedKey = normalizeText(summary.考点)
          const normalizedTitle = normalizeText(title)
          return normalizedKey && normalizedTitle && (normalizedTitle.includes(normalizedKey) || normalizedKey.includes(normalizedTitle))
        })
      )
      normalizedPoints.push({
        chapterCode,
        sectionCode,
        title: title.trim(),
        content: content || entry?.内容 || entry?.content || '',
        examYears,
        importance
      })
    })
  })

  if (!normalizedPoints.length) {
    console.log('没有可以导入的考点条目')
    return
  }

  const { data: existing, error: existingError } = await supabase
    .from('knowledge_points')
    .select('chapter, section, point_name')
    .eq('subject', SUBJECT)

  if (existingError) {
    throw existingError
  }

  const existingSet = new Set(
    (existing || []).map(row => `${row.chapter}|${row.section}|${row.point_name}`)
  )

  const seenKeys = new Set<string>()
  const rowsToUpsert: any[] = []
  let insertedCount = 0
  let updatedCount = 0
  let skippedCount = 0

  normalizedPoints.forEach(point => {
    const key = `${point.chapterCode}|${point.sectionCode}|${point.title}`
    if (seenKeys.has(key)) {
      skippedCount += 1
      return
    }
    seenKeys.add(key)

    const isExisting = existingSet.has(key)
    if (isExisting) {
      updatedCount += 1
    } else {
      insertedCount += 1
    }

    rowsToUpsert.push({
      exam_type: EXAM_TYPE,
      subject: SUBJECT,
      chapter: point.chapterCode,
      section: point.sectionCode,
      point_name: point.title,
      point_content: point.content,
      importance_level: point.importance,
      frequency: 0,
      exam_years: point.examYears,
      learn_mode: 'BOTH',
      error_pattern_tags: []
    })
  })

  if (!rowsToUpsert.length) {
    console.log('所有考点已经在数据库中，跳过 upsert')
    return
  }

  const { error: upsertError } = await supabase
    .from('knowledge_points')
    .upsert(rowsToUpsert, { onConflict: 'subject,chapter,section,point_name' })

  if (upsertError) {
    throw upsertError
  }

  const { count: totalCount } = await supabase
    .from('knowledge_points')
    .select('id', { count: 'exact', head: true })
    .eq('subject', SUBJECT)

  const { data: sampleRows } = await supabase
    .from('knowledge_points')
    .select('chapter, section, point_name')
    .eq('subject', SUBJECT)
    .eq('section', 'C1.2')
    .limit(5)

  console.log(`插入: ${insertedCount}，更新: ${updatedCount}，跳过: ${skippedCount}`)
  console.log(`当前 knowledge_points (subject=${SUBJECT}) 总数: ${totalCount}`)
  console.log('C1.2 样例：', sampleRows || [])
}

main()
  .catch(error => {
    console.error('导入补充考点失败：', error)
    process.exit(1)
  })
  .finally(() => process.exit(0))

