/**
 * 导入考点内容模块到数据库
 * 
 * 功能：
 * 1. 扫描考点文件目录
 * 2. 解析文件内容（三阶段 + M02-M06 模块）
 * 3. 计算文件hash，增量更新
 * 4. 存储到 knowledge_point_content_blocks 表
 * 
 * 运行命令：npx tsx scripts/import-point-content-blocks.ts
 */

import { config } from 'dotenv'
import { Pool } from 'pg'
import { readdir, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { writeFile } from 'fs/promises'
import { createHash } from 'crypto'

config({ path: '.env.local' })

const KNOWLEDGE_POINT_DIR = join(process.cwd(), 'shuju', '执业药师西药二考点')
const REPORT_DIR = join(process.cwd(), 'reports')
const REPORT_FILE = join(REPORT_DIR, 'import-blocks-summary.json')

// 复用解析逻辑（从 API route 提取）
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
 * 解析考点文件内容，识别三阶段和 M02-M06 模块
 */
function parsePointContent(content: string): ParsedContent {
  const lines = content.split('\n')
  const stages: ParsedContent['stages'] = []
  let currentStage: ParsedContent['stages'][0] | null = null
  let currentModule: ParsedContent['stages'][0]['modules'][0] | null = null
  let currentModuleLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // 识别阶段（第一阶段、第二阶段、第三阶段）
    // 支持格式：第一阶段：xxx 或 第一阶段 xxx（有无冒号都可以）
    const stageMatch = line.match(/^第[一二三]阶段[：:\s]/)
    if (stageMatch) {
      // 保存上一个模块
      if (currentModule && currentModuleLines.length > 0) {
        // 保持原样，只去掉末尾的连续空行
        let content = currentModuleLines.join('\n')
        content = content.replace(/\n+$/, '')
        currentModule.content = content
        if (currentStage) {
          currentStage.modules.push(currentModule)
        }
        currentModuleLines = []
      }
      
      // 保存上一个阶段
      if (currentStage) {
        stages.push(currentStage)
      }
      
      // 创建新阶段
      const stageName = line.trim()
      currentStage = {
        stageName,
        modules: []
      }
      currentModule = null
      continue
    }
    
    // 识别模块（M02-M06），格式：【考点 c1.1.1｜M02｜本页定位】
    const moduleMatch = line.match(/【考点\s+[^｜]+\｜(M0[2-6])\｜([^】]+)】/)
    if (moduleMatch) {
      // 保存上一个模块
      if (currentModule && currentModuleLines.length > 0) {
        // 保持原样，只去掉末尾的连续空行
        let content = currentModuleLines.join('\n')
        content = content.replace(/\n+$/, '')
        currentModule.content = content
        if (currentStage) {
          currentStage.modules.push(currentModule)
        }
        currentModuleLines = []
      }
      
      // 创建新模块
      const moduleCode = moduleMatch[1]
      const moduleName = moduleMatch[2].trim()
      currentModule = {
        moduleCode,
        moduleName,
        content: ''
      }
      continue
    }
    
    // 收集模块内容（保留原样，包括空行）
    if (currentModule) {
      currentModuleLines.push(line)
    } else if (currentStage && !currentModule) {
      // 阶段标题后的内容（如果没有模块标记）
      if (line.trim() || currentModuleLines.length > 0) {
        currentModuleLines.push(line)
      }
    }
  }
  
  // 保存最后一个模块（保持原样）
  if (currentModule && currentModuleLines.length > 0) {
    // 保持原样，只去掉末尾的连续空行
    let content = currentModuleLines.join('\n')
    // 去掉末尾的连续换行，但保留内容中的空行
    content = content.replace(/\n+$/, '')
    currentModule.content = content
    if (currentStage) {
      currentStage.modules.push(currentModule)
    }
  }
  
  // 保存最后一个阶段
  if (currentStage) {
    stages.push(currentStage)
  }
  
  return {
    stages,
    rawContent: content
  }
}

/**
 * 计算文件内容的 SHA256 hash
 */
function calculateFileHash(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex')
}

/**
 * 从文件名提取考点 code
 * 支持格式：c5.1.1、C5.1.1、c5.1.1xxx.txt 等
 */
function extractCodeFromFilename(filename: string): string | null {
  // 匹配以 c/C 开头，后跟数字.数字.数字 的模式
  // 例如：c5.1.1、C5.1.1、c5.1.1药物分类.txt
  const match = filename.match(/^([cC]\d+\.\d+\.\d+)/i)
  if (match) {
    // 统一转换为大写，如 C5.1.1
    return match[1].toUpperCase()
  }
  return null
}

/**
 * 将阶段名称转换为 stage 标识
 */
function stageNameToStageId(stageName: string): 'stage1' | 'stage2' | 'stage3' | null {
  if (stageName.includes('第一阶段') || stageName.includes('第1阶段')) {
    return 'stage1'
  }
  if (stageName.includes('第二阶段') || stageName.includes('第2阶段')) {
    return 'stage2'
  }
  if (stageName.includes('第三阶段') || stageName.includes('第3阶段')) {
    return 'stage3'
  }
  return null
}

interface ImportSummary {
  total_files: number
  processed: number
  skipped: number
  upserted_blocks: number
  failed: number
  failed_files: Array<{ filename: string; error: string }>
  generated_at: string
}

async function main() {
  console.log('🚀 开始导入考点内容模块...\n')
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  
  const client = await pool.connect()
  
  const summary: ImportSummary = {
    total_files: 0,
    processed: 0,
    skipped: 0,
    upserted_blocks: 0,
    failed: 0,
    failed_files: [],
    generated_at: new Date().toISOString()
  }
  
  try {
    // 1. 扫描文件目录
    console.log('📁 扫描文件目录...')
    const allFiles = await readdir(KNOWLEDGE_POINT_DIR)
    const txtFiles = allFiles.filter(f => f.endsWith('.txt'))
    summary.total_files = txtFiles.length
    console.log(`   找到 ${txtFiles.length} 个 .txt 文件`)
    
    // 统计各章节文件数量（用于验证）
    const chapterStats = new Map<string, number>()
    txtFiles.forEach(f => {
      const code = extractCodeFromFilename(f)
      if (code) {
        const chapter = code.split('.')[0] // 如 C5
        chapterStats.set(chapter, (chapterStats.get(chapter) || 0) + 1)
      }
    })
    console.log('   章节分布:')
    Array.from(chapterStats.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([chapter, count]) => {
        console.log(`     ${chapter}: ${count} 个文件`)
      })
    console.log('')
    
    // 2. 处理每个文件
    console.log('🔍 开始处理文件...\n')
    
    for (const filename of txtFiles) {
      try {
        // 提取 code（必须严格从文件名提取，如 C5.1.1.txt -> C5.1.1）
        const code = extractCodeFromFilename(filename)
        if (!code) {
          console.log(`   ⚠️  跳过（无法提取code）: ${filename}`)
          summary.skipped++
          continue
        }
        
        // 验证code格式（确保是有效的考点code）
        if (!/^C\d+\.\d+\.\d+$/.test(code)) {
          console.log(`   ⚠️  跳过（code格式无效）: ${filename} -> ${code}`)
          summary.skipped++
          continue
        }
        
        // 读取文件内容
        const filePath = join(KNOWLEDGE_POINT_DIR, filename)
        const content = await readFile(filePath, 'utf-8')
        const fileHash = calculateFileHash(content)
        
        // 检查文件是否已处理且未变化
        const existingFile = await client.query(`
          SELECT file_hash
          FROM knowledge_point_content_files
          WHERE code = $1
        `, [code])
        
        // 检查数据库中是否存在该 code 的内容块
        const existingBlocks = await client.query(`
          SELECT COUNT(*) as count
          FROM knowledge_point_content_blocks
          WHERE code = $1
        `, [code])
        
        const hasBlocks = parseInt(existingBlocks.rows[0].count) > 0
        const fileUnchanged = existingFile.rows.length > 0 && existingFile.rows[0].file_hash === fileHash
        
        // 跳过逻辑：只有当文件未变化 AND 数据库中已有内容块时，才跳过
        // 如果文件未变化但数据库中没有内容块，必须强制重新导入（修复数据不一致问题）
        if (fileUnchanged && hasBlocks) {
          console.log(`   ⏭️  跳过（未变化）: ${filename} (${code})`)
          summary.skipped++
          continue
        }
        
        // 如果文件未变化但数据库中没有内容块，记录日志并继续导入
        if (fileUnchanged && !hasBlocks) {
          console.log(`   🔄 强制导入（文件未变化但数据库无内容块）: ${filename} (${code})`)
        }
        
        // 解析文件内容
        const parsed = parsePointContent(content)
        
        // 检查解析结果
        if (parsed.stages.length === 0) {
          console.warn(`   ⚠️  解析失败（未找到阶段）: ${filename} (${code})`)
          console.warn(`      文件前100字符: ${content.substring(0, 100).replace(/\n/g, '\\n')}`)
          summary.failed++
          summary.failed_files.push({
            filename,
            error: '解析失败：未找到任何阶段'
          })
          continue
        }
        
        // 统计解析到的阶段和模块
        const totalModules = parsed.stages.reduce((sum, s) => sum + s.modules.length, 0)
        const validModules = parsed.stages.reduce((sum, s) => {
          return sum + s.modules.filter(m => ['M02', 'M03', 'M04', 'M05', 'M06'].includes(m.moduleCode)).length
        }, 0)
        
        if (totalModules === 0) {
          console.warn(`   ⚠️  解析失败（未找到模块）: ${filename} (${code})`)
          console.warn(`      找到 ${parsed.stages.length} 个阶段，但模块数为0`)
          summary.failed++
          summary.failed_files.push({
            filename,
            error: '解析失败：未找到任何模块'
          })
          continue
        }
        
        // 更新或插入文件记录
        await client.query(`
          INSERT INTO knowledge_point_content_files (code, file_name, file_hash, raw_content, updated_at)
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (code) DO UPDATE SET
            file_name = EXCLUDED.file_name,
            file_hash = EXCLUDED.file_hash,
            raw_content = EXCLUDED.raw_content,
            updated_at = NOW()
        `, [code, filename, fileHash, content])
        
        // 处理每个阶段和模块
        let blocksUpserted = 0
        let skippedStages = 0
        let skippedModules = 0
        
        for (let stageIdx = 0; stageIdx < parsed.stages.length; stageIdx++) {
          const stage = parsed.stages[stageIdx]
          const stageId = stageNameToStageId(stage.stageName)
          
          if (!stageId) {
            console.warn(`   ⚠️  无法识别阶段: ${stage.stageName} (${filename})`)
            skippedStages++
            continue
          }
          
          // 处理该阶段下的所有模块
          for (const module of stage.modules) {
            // 确保模块代码有效
            if (!['M02', 'M03', 'M04', 'M05', 'M06'].includes(module.moduleCode)) {
              skippedModules++
              continue
            }
            
            // Upsert 模块内容
            await client.query(`
              INSERT INTO knowledge_point_content_blocks (
                code, stage, module, title, content, source, file_name, file_hash, parsed_version, updated_at
              )
              VALUES ($1, $2, $3, $4, $5, 'file', $6, $7, 1, NOW())
              ON CONFLICT (code, stage, module, source) DO UPDATE SET
                title = EXCLUDED.title,
                content = EXCLUDED.content,
                file_name = EXCLUDED.file_name,
                file_hash = EXCLUDED.file_hash,
                parsed_version = EXCLUDED.parsed_version,
                updated_at = NOW()
            `, [
              code,
              stageId,
              module.moduleCode,
              module.moduleName,
              module.content, // 保持原样，含换行
              filename,
              fileHash
            ])
            
            blocksUpserted++
          }
        }
        
        // 详细日志
        if (blocksUpserted === 0) {
          console.warn(`   ⚠️  处理完成但无模块写入: ${filename} (${code})`)
          console.warn(`      阶段数: ${parsed.stages.length}, 跳过阶段: ${skippedStages}, 跳过模块: ${skippedModules}`)
          summary.failed++
          summary.failed_files.push({
            filename,
            error: `解析成功但无有效模块写入（阶段:${parsed.stages.length}, 跳过阶段:${skippedStages}, 跳过模块:${skippedModules}）`
          })
        } else {
          const logMsg = `   ✅ 处理完成: ${filename} (${code}) - ${blocksUpserted} 个模块`
          if (skippedStages > 0 || skippedModules > 0) {
            console.warn(`${logMsg} (跳过阶段:${skippedStages}, 跳过模块:${skippedModules})`)
          } else {
            console.log(logMsg)
          }
          summary.processed++
          summary.upserted_blocks += blocksUpserted
        }
        
      } catch (error) {
        console.error(`   ❌ 处理失败: ${filename}`, error instanceof Error ? error.message : String(error))
        summary.failed++
        summary.failed_files.push({
          filename,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
    
    // 3. 保存报告
    console.log('\n💾 保存报告...')
    await mkdir(REPORT_DIR, { recursive: true })
    await writeFile(REPORT_FILE, JSON.stringify(summary, null, 2), 'utf-8')
    console.log(`   报告已保存到: ${REPORT_FILE}\n`)
    
    // 4. 打印统计
    console.log('📈 导入统计:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`总文件数:     ${summary.total_files}`)
    console.log(`处理成功:     ${summary.processed}`)
    console.log(`跳过（未变化）: ${summary.skipped}`)
    console.log(`失败:         ${summary.failed}`)
    console.log(`Upsert 模块数: ${summary.upserted_blocks}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    if (summary.failed_files.length > 0) {
      console.log('❌ 失败文件清单:')
      summary.failed_files.forEach(item => {
        console.log(`   - ${item.filename}: ${item.error}`)
      })
      console.log('')
    }
    
    console.log('✅ 导入完成！')
    
  } catch (error) {
    console.error('❌ 执行失败:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
