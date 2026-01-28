/**
 * 单点诊断脚本：只诊断指定 code（如 C8.4.10）
 *
 * 用法：npx tsx scripts/diagnose-one-point.ts C8.4.10
 *
 * 输出：
 * 1) 环境变量（NEXT_PUBLIC_SUPABASE_URL 前30字、SUPABASE_SERVICE_ROLE_KEY 是否存在、DATABASE_URL 前30字）
 * 2) 文件系统：目录及匹配 c8.4.10*.txt 的文件完整路径、文件名、文件前200字预览
 * 3) 解析结果：阶段数、每阶段名称、每阶段模块数；解析到的模块 code 与 title 前20字；若 0 模块则打印“为什么”及关键行
 * 4) 生产库：WHERE UPPER(code)=UPPER($1) 的 count
 * 5) 若该 code 不存在：相似 code 查询 ILIKE '%8.4.10%' 的 code 与 count
 */

import { config } from 'dotenv'
import { Pool } from 'pg'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

config({ path: '.env.local' })

const KNOWLEDGE_POINT_DIR = join(process.cwd(), 'shuju', '执业药师西药二考点')

// 与 import-point-content-blocks 当前解析结构一致，便于对照
interface ParsedContent {
  stages: Array<{
    stageName: string
    modules: Array<{ moduleCode: string; moduleName: string; content: string }>
  }>
  rawContent: string
}

/** 阶段标题：第一阶段/第二阶段/第三阶段，支持冒号或空格 */
const STAGE_REG = /^第[一二三]阶段[：:\s]/
/** 模块标题：考点 + code + 竖线(全角｜或半角|) + M02-M06 + 竖线 + title */
const MODULE_REG = /【考点\s*[cC]?\d+\.\d+\.\d+[｜|](M0[2-6])[｜|]([^】]+)】/

function parsePointContent(content: string): ParsedContent {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const stages: ParsedContent['stages'] = []
  let currentStage: ParsedContent['stages'][0] | null = null
  let currentModule: ParsedContent['stages'][0]['modules'][0] | null = null
  let currentModuleLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (STAGE_REG.test(line)) {
      if (currentModule && currentModuleLines.length > 0) {
        const c = currentModuleLines.join('\n').replace(/\n+$/, '')
        currentModule.content = c
        if (currentStage) currentStage.modules.push(currentModule)
        currentModuleLines = []
      }
      if (currentStage) stages.push(currentStage)
      currentStage = { stageName: line.trim(), modules: [] }
      currentModule = null
      continue
    }

    const moduleMatch = line.match(MODULE_REG)
    if (moduleMatch) {
      if (currentModule && currentModuleLines.length > 0) {
        const c = currentModuleLines.join('\n').replace(/\n+$/, '')
        currentModule.content = c
        if (currentStage) currentStage.modules.push(currentModule)
        currentModuleLines = []
      }
      currentModule = {
        moduleCode: moduleMatch[1],
        moduleName: moduleMatch[2].trim(),
        content: '',
      }
      currentModuleLines = []
      continue
    }

    if (currentModule) {
      currentModuleLines.push(line)
    } else if (currentStage && !currentModule && (line.trim() || currentModuleLines.length > 0)) {
      currentModuleLines.push(line)
    }
  }

  if (currentModule && currentModuleLines.length > 0) {
    const c = currentModuleLines.join('\n').replace(/\n+$/, '')
    currentModule.content = c
    if (currentStage) currentStage.modules.push(currentModule)
  }
  if (currentStage) stages.push(currentStage)

  return { stages, rawContent: content }
}

async function main() {
  const codeArg = process.argv[2]
  if (!codeArg) {
    console.error('用法: npx tsx scripts/diagnose-one-point.ts <code>')
    console.error('例:   npx tsx scripts/diagnose-one-point.ts C8.4.10')
    process.exit(1)
  }
  const code = codeArg.trim()
  const codeLower = code.toLowerCase() // 匹配文件名忽略大小写，如 c8.4.10

  console.log('\n========== 1) 环境 ==========')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const dbUrl = process.env.DATABASE_URL ?? ''
  console.log('NEXT_PUBLIC_SUPABASE_URL（前30字符）:', supabaseUrl.substring(0, 30))
  console.log('SUPABASE_SERVICE_ROLE_KEY 是否存在:', !!serviceKey)
  console.log('DATABASE_URL（前30字符）:', dbUrl.substring(0, 30))

  console.log('\n========== 2) 文件系统 ==========')
  console.log('目录:', KNOWLEDGE_POINT_DIR)
  const files = await readdir(KNOWLEDGE_POINT_DIR).catch((e) => {
    console.error('读取目录失败:', e?.message ?? e)
    return [] as string[]
  })
  const candidates = files.filter(
    (f) => f.endsWith('.txt') && f.toLowerCase().startsWith(codeLower)
  )
  if (candidates.length === 0) {
    console.log('匹配 ' + codeLower + '*.txt 的文件: 无')
    console.log('目录下前 5 个 txt:', files.filter((f) => f.endsWith('.txt')).slice(0, 5))
  } else {
    for (const f of candidates) {
      const fullPath = join(KNOWLEDGE_POINT_DIR, f)
      console.log('找到文件完整路径:', fullPath)
      console.log('文件名:', f)
      const raw = await readFile(fullPath, 'utf-8').catch(() => '')
      console.log('文件前200字符预览:')
      console.log(raw.substring(0, 200))
      console.log('---')
    }
  }

  const chosen = candidates[0]
  if (!chosen) {
    console.log('\n========== 3) 解析 ==========')
    console.log('无文件可解析，跳过')
  } else {
    console.log('\n========== 3) 解析 ==========')
    const content = await readFile(join(KNOWLEDGE_POINT_DIR, chosen), 'utf-8')
    const parsed = parsePointContent(content)

    console.log('识别到的阶段数量:', parsed.stages.length)
    parsed.stages.forEach((s, i) => {
      console.log(`  阶段 ${i + 1}: "${s.stageName.substring(0, 40)}..." , 模块数: ${s.modules.length}`)
    })

    const allModules = parsed.stages.flatMap((s) => s.modules)
    const validModules = allModules.filter((m) => ['M02','M03','M04','M05','M06'].includes(m.moduleCode))
    console.log('解析到的模块 code 与 title（前20字）:')
    validModules.forEach((m) => {
      console.log(`  ${m.moduleCode} | ${(m.moduleName || '').substring(0, 20)}`)
    })
    console.log('解析到的 blocks 数量（M02–M06）:', validModules.length)

    if (validModules.length === 0) {
      console.log('\n【为何 0 模块】匹配规则: 阶段=' + STAGE_REG.source + ' ; 模块=' + MODULE_REG.source)
      const lines = content.split('\n')
      const moduleLike = lines.filter((l) => /【考点\s*[^】]*[｜|]M0[2-6]/.test(l) || /【考点\s*[^】]*\d+\.\d+\.\d+/.test(l))
      console.log('疑似模块标题行（用于 debug）:')
      moduleLike.slice(0, 15).forEach((l) => console.log('  ', l.substring(0, 80)))
    }
  }

  console.log('\n========== 4) 生产库（该 code 的 blocks 数）==========')
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  const client = await pool.connect()

  try {
    const r = await client.query(
      'SELECT COUNT(*) AS c FROM knowledge_point_content_blocks WHERE UPPER(code)=UPPER($1)',
      [code]
    )
    const count = Number(r.rows[0]?.c ?? 0)
    console.log('WHERE UPPER(code)=UPPER($1) 的 count:', count)

    if (count === 0) {
      console.log('\n========== 5) 相似 code（ILIKE %8.4.10%）==========')
      const digitPart = code.replace(/^c/i, '').trim() // 如 C8.4.10 -> 8.4.10
      const sim = await client.query(
        `SELECT code, COUNT(*) AS cnt FROM knowledge_point_content_blocks WHERE code ILIKE $1 GROUP BY code LIMIT 20`,
        ['%' + digitPart + '%']
      )
      if (sim.rows.length) {
        sim.rows.forEach((row: { code: string; cnt: string }) => console.log(`  code="${row.code}" count=${row.cnt}`))
      } else {
        console.log('  无相似 code')
      }
    }
  } finally {
    client.release()
    await pool.end()
  }
  console.log('\n诊断结束\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
