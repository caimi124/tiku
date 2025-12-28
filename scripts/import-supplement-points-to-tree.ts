/**
 * 将 `shuju/执业药师西药二补充.normalized.json` 中的考点导入 knowledge_tree（node_type = 'point'）.
 * 该 normalized 文件由 scripts/normalize-supplement.ts 生成，每项已包含 chapter / section / points 信息.
 *
 * 环境变量：
 * - NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - SUPPLEMENT_FILE (默认 shuju/执业药师西药二补充.normalized.json)
 * - DRY_RUN=1 时仅打印统计
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://tparjdkxxtnentsdazfw.supabase.co'
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function decodeJwt(token: string) {
  try {
    const [, payload] = token.split('.')
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(normalized, 'base64').toString('utf-8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

if (!SUPABASE_KEY) {
  throw new Error('需要设置 SUPABASE_SERVICE_ROLE_KEY 或 NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const jwtPayload = decodeJwt(SUPABASE_KEY)
if (jwtPayload?.role === 'anon') {
  console.warn(
    '⚠️ 当前 SUPABASE_KEY 的 JWT 中 role=anon，写入可能被 RLS 拦截，请使用 service_role key'
  )
}

const DRY_RUN = process.env.DRY_RUN === '1'
const SUPPLEMENT_FILE =
  process.env.SUPPLEMENT_FILE ||
  path.join(process.cwd(), 'shuju', '执业药师西药二补充.normalized.json')

const SUBJECT_CODE = 'xiyao_yaoxue_er'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

type NormalizedSupplement = {
  chapter: string
  section: string
  points: Array<{
    title: string
    content: string
  }>
}

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
  二十: 20
}

function parseChapter(text?: string): number | null {
  if (!text) return null
  const match = text.match(/C(\d+)/i)
  if (match) {
    return Number(match[1])
  }
  const ordinal = text.match(/第\s*([一二三四五六七八九十]+)\s*章/)
  if (ordinal) {
    return CHINESE_ORDINALS[ordinal[1]] ?? null
  }
  return null
}

function parseSection(text?: string): number | null {
  if (!text) return null
  const match = text.match(/C\d+\.(\d+)/i)
  if (match) {
    return Number(match[1])
  }
  const ordinal = text.match(/第\s*([一二三四五六七八九十]+)\s*节/)
  if (ordinal) {
    return CHINESE_ORDINALS[ordinal[1]] ?? null
  }
  return null
}

function loadNormalized(): NormalizedSupplement[] {
  if (!fs.existsSync(SUPPLEMENT_FILE)) {
    throw new Error(`normalized 文件不存在: ${SUPPLEMENT_FILE}`)
  }
  const raw = fs.readFileSync(SUPPLEMENT_FILE, 'utf-8')
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed)) {
    throw new Error('normalized 文件应为 JSON 数组')
  }
  return parsed
}

async function main() {
  const sectionsRes = await supabase
    .from('knowledge_tree')
    .select('id, code')
    .eq('subject_code', SUBJECT_CODE)
    .eq('node_type', 'section')

  if (sectionsRes.error) {
    throw sectionsRes.error
  }

  const sectionMap = new Map((sectionsRes.data || []).map(sec => [sec.code, sec.id]))

  const normalizedBlocks = loadNormalized()
  console.log('parsed blocks:', normalizedBlocks.length)

  const existingRes = await supabase
    .from('knowledge_tree')
    .select('code')
    .eq('subject_code', SUBJECT_CODE)
    .eq('node_type', 'point')

  if (existingRes.error) {
    throw existingRes.error
  }

  const existingCodes = new Set((existingRes.data || []).map(item => item.code))
  const preparedInsert: Record<string, any>[] = []
  const parsedPoints: string[] = []
  const missingSections: string[] = []
  let skippedExisting = 0

  normalizedBlocks.forEach(block => {
    const chapterIdx = parseChapter(block.chapter)
    const sectionIdx = parseSection(block.section)
    if (!chapterIdx || !sectionIdx) {
      missingSections.push(`${block.chapter} / ${block.section}`)
      return
    }
    const sectionCode = `C${chapterIdx}.${sectionIdx}`
    const parentId = sectionMap.get(sectionCode)
    if (!parentId) {
      missingSections.push(sectionCode)
      return
    }
    block.points?.forEach((point, idx) => {
      const code = `${sectionCode}.${idx + 1}`
      parsedPoints.push(code)
      if (existingCodes.has(code)) {
        skippedExisting += 1
        return
      }
      preparedInsert.push({
        id: code,
        code,
        title: point.title,
        content: point.content,
        node_type: 'point',
        parent_id: parentId,
        subject_code: SUBJECT_CODE,
        level: 3,
        sort_order: idx + 1,
        importance_level: 3,
        learn_mode: 'BOTH',
        error_pattern_tags: [],
        key_takeaway: point.title,
        importance: 3,
        exam_years: []
      })
    })
  })

  console.log('parsedPointsFromFile:', parsedPoints.length)
  console.log(
    'parsedSectionsFromFile:',
    new Set(parsedPoints.map(code => code.split('.').slice(0, 2).join('.'))).size
  )
  console.log('missingSections:', missingSections.length, missingSections.slice(0, 10))
  console.log('preparedInsert:', preparedInsert.length, 'skippedExisting:', skippedExisting)
  console.log('samplePointCodes:', preparedInsert.slice(0, 10).map(row => row.code))

  if (DRY_RUN) {
    console.log('DRY_RUN=1，未写入数据库')
    return
  }

  if (preparedInsert.length) {
    const { error } = await supabase
      .from('knowledge_tree')
      .upsert(preparedInsert, { onConflict: 'code' })
    if (error) throw error
    console.log('插入样例 code：', preparedInsert.slice(0, 10).map(row => row.code))
  } else {
    console.log('无新增点可写入')
  }
}

main()
  .catch(error => {
    console.error('导入失败:', error)
    process.exit(1)
  })
  .finally(() => process.exit(0))

