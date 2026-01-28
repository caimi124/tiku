/**
 * 考点文件匹配覆盖率盘点脚本
 * 
 * 功能：
 * 1. 读取数据库中所有考点的 code 和 title
 * 2. 扫描文件目录，匹配文件
 * 3. 简单解析：检测三阶段标题和 M02-M06 模块
 * 4. 输出覆盖率报告
 * 
 * 运行命令：npx tsx scripts/check-point-file-coverage.ts
 */

import { config } from 'dotenv'
import { Pool } from 'pg'
import { readdir, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { writeFile } from 'fs/promises'

config({ path: '.env.local' })

const KNOWLEDGE_POINT_DIR = join(process.cwd(), 'shuju', '执业药师西药二考点')
const REPORT_DIR = join(process.cwd(), 'reports')
const REPORT_FILE = join(REPORT_DIR, 'point-file-coverage.json')

interface PointInfo {
  code: string
  title: string
  id: string
}

interface MatchedItem {
  code: string
  title: string
  filename: string
  hasStages: boolean
  modulesFound: string[]
  warnings: string[]
}

interface MissingItem {
  code: string
  title: string
}

interface AmbiguousItem {
  code: string
  title: string
  candidates: string[]
}

interface ReadFailedItem {
  code: string
  title: string
  filename: string
  error: string
}

interface CoverageReport {
  summary: {
    total: number
    matched: number
    missing: number
    ambiguous: number
    read_failed: number
    generated_at: string
  }
  matched: MatchedItem[]
  missing: MissingItem[]
  ambiguous: AmbiguousItem[]
  read_failed: ReadFailedItem[]
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 根据 code 查找匹配的文件（返回所有匹配的文件名）
 * 使用精确边界匹配：文件名必须以 code 开头，且 code 后不能紧跟数字
 */
async function findPointFiles(code: string, allFiles: string[]): Promise<string[]> {
  // 统一处理：trim() + toLowerCase()
  const codeNorm = code.trim().toLowerCase()
  
  // 构建正则表达式：^code(?!\d) - code 开头且后不跟数字
  // 注意：code 后可以跟空格、中文字符等，但不能跟数字
  const pattern = new RegExp(`^${escapeRegExp(codeNorm)}(?!\\d)`)
  
  return allFiles.filter(file => {
    const fileName = file.toLowerCase()
    // 必须同时满足：匹配正则 && 以 .txt 结尾
    const matches = pattern.test(fileName) && fileName.endsWith('.txt')
    return matches
  })
}

/**
 * 简单解析文件内容：检测三阶段标题和 M02-M06 模块
 */
function parseFileContent(content: string, code: string): {
  hasStages: boolean
  modulesFound: string[]
  warnings: string[]
} {
  const warnings: string[] = []
  const modulesFound: string[] = []
  
  // 检测三阶段标题
  const stagePattern = /第[一二三]阶段[：:]/
  const hasStages = stagePattern.test(content)
  
  // 检测 M02-M06 模块标记
  // 格式：【考点 c1.1.1｜M02｜本页定位】
  const modulePattern = /【考点\s+[^｜]+\｜(M0[2-6])\｜[^】]+】/g
  const moduleMatches = content.matchAll(modulePattern)
  
  const foundModules = new Set<string>()
  for (const match of moduleMatches) {
    const moduleCode = match[1]
    foundModules.add(moduleCode)
  }
  
  modulesFound.push(...Array.from(foundModules).sort())
  
  // 生成警告
  if (hasStages && modulesFound.length === 0) {
    warnings.push('检测到阶段标题，但未找到 M02-M06 模块标记')
  }
  
  if (!hasStages && modulesFound.length > 0) {
    warnings.push('找到模块标记，但未检测到阶段标题')
  }
  
  // 检查是否缺少某些模块
  const expectedModules = ['M02', 'M03', 'M04', 'M05', 'M06']
  const missingModules = expectedModules.filter(m => !foundModules.has(m))
  if (missingModules.length > 0 && foundModules.size > 0) {
    warnings.push(`缺少模块: ${missingModules.join(', ')}`)
  }
  
  return {
    hasStages,
    modulesFound,
    warnings
  }
}

async function main() {
  console.log('🚀 开始考点文件匹配覆盖率盘点...\n')
  
  // 连接数据库
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  
  try {
    // 1. 读取数据库中所有考点
    console.log('📊 读取数据库中的考点...')
    const pointsResult = await pool.query<PointInfo>(`
      SELECT id, code, title
      FROM knowledge_tree
      WHERE node_type = 'point' AND code IS NOT NULL AND code != ''
      ORDER BY code
    `)
    
    const points = pointsResult.rows
    console.log(`   找到 ${points.length} 个考点\n`)
    
    // 2. 扫描文件目录
    console.log('📁 扫描文件目录...')
    const allFiles = await readdir(KNOWLEDGE_POINT_DIR)
    const txtFiles = allFiles.filter(f => f.endsWith('.txt'))
    console.log(`   找到 ${txtFiles.length} 个 .txt 文件\n`)
    
    // 3. 匹配和解析
    console.log('🔍 开始匹配和解析...\n')
    
    const report: CoverageReport = {
      summary: {
        total: points.length,
        matched: 0,
        missing: 0,
        ambiguous: 0,
        read_failed: 0,
        generated_at: new Date().toISOString()
      },
      matched: [],
      missing: [],
      ambiguous: [],
      read_failed: []
    }
    
    for (const point of points) {
      const matchedFiles = await findPointFiles(point.code, txtFiles)
      
      if (matchedFiles.length === 0) {
        // 缺失文件
        report.missing.push({
          code: point.code,
          title: point.title
        })
        report.summary.missing++
      } else if (matchedFiles.length > 1) {
        // 多匹配
        report.ambiguous.push({
          code: point.code,
          title: point.title,
          candidates: matchedFiles
        })
        report.summary.ambiguous++
      } else {
        // 单匹配，尝试读取和解析
        const filename = matchedFiles[0]
        try {
          const filePath = join(KNOWLEDGE_POINT_DIR, filename)
          const content = await readFile(filePath, 'utf-8')
          
          const parseResult = parseFileContent(content, point.code)
          
          report.matched.push({
            code: point.code,
            title: point.title,
            filename,
            hasStages: parseResult.hasStages,
            modulesFound: parseResult.modulesFound,
            warnings: parseResult.warnings
          })
          report.summary.matched++
        } catch (error) {
          // 读取失败
          report.read_failed.push({
            code: point.code,
            title: point.title,
            filename,
            error: error instanceof Error ? error.message : String(error)
          })
          report.summary.read_failed++
        }
      }
    }
    
    // 4. 保存报告
    console.log('💾 保存报告...')
    await mkdir(REPORT_DIR, { recursive: true })
    await writeFile(REPORT_FILE, JSON.stringify(report, null, 2), 'utf-8')
    console.log(`   报告已保存到: ${REPORT_FILE}\n`)
    
    // 5. 打印统计
    console.log('📈 统计结果:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`总考点数:     ${report.summary.total}`)
    console.log(`匹配成功:     ${report.summary.matched} (${((report.summary.matched / report.summary.total) * 100).toFixed(1)}%)`)
    console.log(`缺失文件:     ${report.summary.missing} (${((report.summary.missing / report.summary.total) * 100).toFixed(1)}%)`)
    console.log(`多匹配:       ${report.summary.ambiguous}`)
    console.log(`读取失败:     ${report.summary.read_failed}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // 6. 打印缺失清单（前10个）
    if (report.missing.length > 0) {
      console.log('⚠️  缺失文件清单（前10个）:')
      report.missing.slice(0, 10).forEach(item => {
        console.log(`   - ${item.code}: ${item.title}`)
      })
      if (report.missing.length > 10) {
        console.log(`   ... 还有 ${report.missing.length - 10} 个`)
      }
      console.log('')
    }
    
    // 7. 打印多匹配清单
    if (report.ambiguous.length > 0) {
      console.log('⚠️  多匹配清单:')
      report.ambiguous.forEach(item => {
        console.log(`   - ${item.code}: ${item.title}`)
        console.log(`     候选文件: ${item.candidates.join(', ')}`)
      })
      console.log('')
    }
    
    // 8. 打印读取失败清单
    if (report.read_failed.length > 0) {
      console.log('❌ 读取失败清单:')
      report.read_failed.forEach(item => {
        console.log(`   - ${item.code}: ${item.title}`)
        console.log(`     文件: ${item.filename}`)
        console.log(`     错误: ${item.error}`)
      })
      console.log('')
    }
    
    console.log('✅ 完成！')
    
  } catch (error) {
    console.error('❌ 执行失败:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
