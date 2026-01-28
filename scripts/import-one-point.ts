/**
 * 单点导入：只导入指定 code 的考点内容块到 knowledge_point_content_blocks
 *
 * 用法：npx tsx scripts/import-one-point.ts C8.4.10
 *
 * 行为：
 * 1) 在 E:\tiku\shuju\执业药师西药二考点\ 中查找 c8.4.10*.txt（忽略大小写）
 * 2) 用鲁棒解析（三阶段 + M02–M06，竖线支持全角｜与半角|，考点与 code 间可有空格）
 * 3) 写入时 code 统一为 'C8.4.10'（大写 C）
 * 4) 写入前：DELETE FROM knowledge_point_content_blocks WHERE UPPER(code)=UPPER($1)
 * 5) 再 INSERT 所有 blocks，每次检查并打印 error
 * 6) 写入后立刻查 COUNT(*) 验证并打印
 */

import { config } from 'dotenv'
import { Pool } from 'pg'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { createHash } from 'crypto'

config({ path: '.env.local' })

const KNOWLEDGE_POINT_DIR = join(process.cwd(), 'shuju', '执业药师西药二考点')

interface ParsedContent {
  stages: Array<{
    stageName: string
    modules: Array<{ moduleCode: string; moduleName: string; content: string }>
  }>
  rawContent: string
}

/** 阶段标题：第一阶段/第二阶段/第三阶段，支持冒号或空格 */
const STAGE_REG = /^第[一二三]阶段[：:\s]/
/** 模块标题：考点 + 可选空格 + code(c/C?+数字.数字.数字) + 全角｜或半角| + M02–M06 + 竖线 + title */
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

function stageNameToStageId(stageName: string): 'stage1' | 'stage2' | 'stage3' | null {
  if (stageName.includes('第一阶段') || stageName.includes('第1阶段')) return 'stage1'
  if (stageName.includes('第二阶段') || stageName.includes('第2阶段')) return 'stage2'
  if (stageName.includes('第三阶段') || stageName.includes('第3阶段')) return 'stage3'
  return null
}

async function findFileByCode(code: string): Promise<string | null> {
  const codeLower = code.replace(/^c/i, '').trim().toLowerCase()
  const prefix = 'c' + codeLower
  const files = await readdir(KNOWLEDGE_POINT_DIR)
  const m = files.find(
    (f) =>
      f.endsWith('.txt') &&
      (f.toLowerCase().startsWith(prefix) || f.toLowerCase().startsWith(codeLower))
  )
  return m ?? null
}

async function main() {
  const codeArg = process.argv[2]
  if (!codeArg) {
    console.error('用法: npx tsx scripts/import-one-point.ts <code>')
    console.error('例:   npx tsx scripts/import-one-point.ts C8.4.10')
    process.exit(1)
  }

  const codeRaw = codeArg.trim()
  const code = codeRaw.toUpperCase().startsWith('C') ? codeRaw.toUpperCase() : 'C' + codeRaw.replace(/^c/i, '').toUpperCase()
  if (!/^C\d+\.\d+\.\d+$/.test(code)) {
    console.error('code 格式须为 Cx.y.z，例如 C8.4.10')
    process.exit(1)
  }

  console.log('\n📌 单点导入考点内容块:', code)
  console.log('   目录:', KNOWLEDGE_POINT_DIR, '\n')

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  const client = await pool.connect()

  try {
    const filename = await findFileByCode(code)
    if (!filename) {
      console.error('❌ 未找到匹配 ' + code + ' 的 txt 文件（c' + code.replace(/^C/i, '') + '*.txt）')
      process.exit(1)
    }
    console.log('✅ 找到文件:', filename)

    const filePath = join(KNOWLEDGE_POINT_DIR, filename)
    const content = await readFile(filePath, 'utf-8')
    const fileHash = createHash('sha256').update(content, 'utf8').digest('hex')

    const parsed = parsePointContent(content)
    const validModules = parsed.stages.flatMap((s) =>
      s.modules.filter((m) => ['M02', 'M03', 'M04', 'M05', 'M06'].includes(m.moduleCode))
    )
    const blocksCount = validModules.length
    console.log('✅ 解析出 blocks 数量:', blocksCount)

    if (blocksCount === 0) {
      console.error('❌ 解析后无有效 M02–M06 模块，退出')
      process.exit(1)
    }

    const del = await client.query(
      'DELETE FROM knowledge_point_content_blocks WHERE UPPER(code)=UPPER($1)',
      [code]
    )
    console.log('🗑️  已删除该 code 原有 blocks 行数:', del.rowCount ?? 0)

    let inserted = 0
    let errors: string[] = []
    for (const stage of parsed.stages) {
      const stageId = stageNameToStageId(stage.stageName)
      if (!stageId) continue
      for (const module of stage.modules) {
        if (!['M02', 'M03', 'M04', 'M05', 'M06'].includes(module.moduleCode)) continue
        try {
          const res = await client.query(
            `INSERT INTO knowledge_point_content_blocks (
              code, stage, module, title, content, source, file_name, file_hash, parsed_version, updated_at
            ) VALUES ($1, $2, $3, $4, $5, 'file', $6, $7, 1, NOW())`,
            [code, stageId, module.moduleCode, module.moduleName, module.content, filename, fileHash]
          )
          if (res.rowCount !== undefined && res.rowCount < 1) {
            errors.push(`${stageId}/${module.moduleCode}: rowCount=0`)
          }
          inserted++
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e)
          errors.push(`${stageId}/${module.moduleCode}: ${msg}`)
          console.error('❌ insert error', stageId, module.moduleCode, msg)
        }
      }
    }

    if (errors.length) {
      console.error('部分写入失败:', errors.length, '条')
      errors.forEach((s) => console.error('  ', s))
    }
    console.log('✅ 写入成功数量:', inserted)

    const verify = await client.query(
      'SELECT COUNT(*) AS c FROM knowledge_point_content_blocks WHERE UPPER(code)=UPPER($1)',
      [code]
    )
    const count = Number(verify.rows[0]?.c ?? 0)
    console.log('✅ 写入后验证 COUNT(*) 该 code:', count)

    console.log('\n--- 汇总 ---')
    console.log('找到的文件名:', filename)
    console.log('解析出的 blocks 数量:', blocksCount)
    console.log('写入成功数量:', inserted)
    console.log('验证 count:', count)
    console.log('')
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
