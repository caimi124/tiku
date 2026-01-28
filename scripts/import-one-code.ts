/**
 * 只导入指定 code 的考点内容块到 knowledge_point_content_blocks
 *
 * 用法：npx tsx scripts/import-one-code.ts C8.4.10
 *
 * 行为：
 * - 在 E:\tiku\shuju\执业药师西药二考点\ 目录中查找以该 code 开头的 txt（忽略大小写）
 * - 复用 import-point-content-blocks 的解析逻辑（三阶段 + M02-M06）
 * - 导入前先删除该 code 现有 blocks，再插入新 blocks（强制写入，不走“未变化跳过”）
 * - 使用项目现有 DB 连接（.env.local 中的 DATABASE_URL）
 */

import { config } from 'dotenv'
import { Pool } from 'pg'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { createHash } from 'crypto'

config({ path: '.env.local' })

const KNOWLEDGE_POINT_DIR = join(process.cwd(), 'shuju', '执业药师西药二考点')

// 与 import-point-content-blocks.ts 一致的解析结构
interface ParsedContent {
  stages: Array<{
    stageName: string
    modules: Array<{
      moduleCode: string
      moduleName: string
      content: string
    }>
  }>
  rawContent: string
}

/**
 * 解析考点文件内容，识别三阶段和 M02-M06 模块（与 import-point-content-blocks 一致）
 */
function parsePointContent(content: string): ParsedContent {
  const lines = content.split('\n')
  const stages: ParsedContent['stages'] = []
  let currentStage: ParsedContent['stages'][0] | null = null
  let currentModule: ParsedContent['stages'][0]['modules'][0] | null = null
  let currentModuleLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    const stageMatch = line.match(/^第[一二三]阶段[：:\s]/)
    if (stageMatch) {
      if (currentModule && currentModuleLines.length > 0) {
        let c = currentModuleLines.join('\n')
        c = c.replace(/\n+$/, '')
        currentModule.content = c
        if (currentStage) currentStage.modules.push(currentModule)
        currentModuleLines = []
      }
      if (currentStage) stages.push(currentStage)
      currentStage = { stageName: line.trim(), modules: [] }
      currentModule = null
      continue
    }

    const moduleMatch = line.match(/【考点\s+[^｜]+\｜(M0[2-6])\｜([^】]+)】/)
    if (moduleMatch) {
      if (currentModule && currentModuleLines.length > 0) {
        let c = currentModuleLines.join('\n')
        c = c.replace(/\n+$/, '')
        currentModule.content = c
        if (currentStage) currentStage.modules.push(currentModule)
        currentModuleLines = []
      }
      currentModule = {
        moduleCode: moduleMatch[1],
        moduleName: moduleMatch[2].trim(),
        content: '',
      }
      continue
    }

    if (currentModule) {
      currentModuleLines.push(line)
    } else if (currentStage && !currentModule) {
      if (line.trim() || currentModuleLines.length > 0) {
        currentModuleLines.push(line)
      }
    }
  }

  if (currentModule && currentModuleLines.length > 0) {
    let c = currentModuleLines.join('\n')
    c = c.replace(/\n+$/, '')
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

/**
 * 在考点目录中查找以 code 开头的 txt 文件（忽略大小写）
 */
async function findFileByCode(code: string): Promise<string | null> {
  const codeNorm = code.trim().toLowerCase()
  const files = await readdir(KNOWLEDGE_POINT_DIR)
  const matched = files.find(
    (f) => f.toLowerCase().startsWith(codeNorm) && f.endsWith('.txt')
  )
  return matched ? matched : null
}

async function main() {
  const codeArg = process.argv[2]
  if (!codeArg) {
    console.error('用法: npx tsx scripts/import-one-code.ts <code>')
    console.error('例:   npx tsx scripts/import-one-code.ts C8.4.10')
    process.exit(1)
  }

  const code = codeArg.trim().toUpperCase()
  if (!/^C\d+\.\d+\.\d+$/.test(code)) {
    console.error('code 格式须为 Cx.y.z，例如 C8.4.10')
    process.exit(1)
  }

  console.log(`\n📌 导入考点内容块: ${code}`)
  console.log(`   目录: ${KNOWLEDGE_POINT_DIR}\n`)

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  const client = await pool.connect()

  try {
    // 1) 查找文件
    const filename = await findFileByCode(code)
    if (!filename) {
      console.error(`❌ 未找到以 ${code} 开头的 txt 文件`)
      process.exit(1)
    }
    console.log(`✅ 找到文件: ${filename}`)

    const filePath = join(KNOWLEDGE_POINT_DIR, filename)
    const content = await readFile(filePath, 'utf-8')
    const fileHash = createHash('sha256').update(content, 'utf8').digest('hex')

    // 2) 解析
    const parsed = parsePointContent(content)
    const validModules = parsed.stages.flatMap((s) =>
      s.modules.filter((m) => ['M02', 'M03', 'M04', 'M05', 'M06'].includes(m.moduleCode))
    )
    const blocksCount = validModules.length
    console.log(`✅ 解析出 blocks 数量: ${blocksCount}`)

    if (blocksCount === 0) {
      console.error('❌ 解析后无有效 M02–M06 模块，退出')
      process.exit(1)
    }

    // 3) 删除该 code 下已有 blocks
    const del = await client.query(
      `DELETE FROM knowledge_point_content_blocks WHERE UPPER(code) = UPPER($1)`,
      [code]
    )
    console.log(`🗑️  已删除该 code 原有 blocks 行数: ${del.rowCount ?? 0}`)

    // 4) 插入新 blocks
    let inserted = 0
    for (const stage of parsed.stages) {
      const stageId = stageNameToStageId(stage.stageName)
      if (!stageId) continue
      for (const module of stage.modules) {
        if (!['M02', 'M03', 'M04', 'M05', 'M06'].includes(module.moduleCode)) continue
        await client.query(
          `INSERT INTO knowledge_point_content_blocks (
            code, stage, module, title, content, source, file_name, file_hash, parsed_version, updated_at
          ) VALUES ($1, $2, $3, $4, $5, 'file', $6, $7, 1, NOW())`,
          [
            code,
            stageId,
            module.moduleCode,
            module.moduleName,
            module.content,
            filename,
            fileHash,
          ]
        )
        inserted++
      }
    }

    console.log(`✅ 写入成功数量: ${inserted}`)
    console.log('\n--- 汇总 ---')
    console.log(`找到的文件名: ${filename}`)
    console.log(`解析出的 blocks 数量: ${blocksCount}`)
    console.log(`写入成功数量: ${inserted}`)
    console.log('')
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
