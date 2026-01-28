/**
 * 读取考点文件内容 API
 * GET /api/knowledge-point/content/[code]
 * 
 * 根据考点 code 从文件系统读取对应的考点文件内容
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

// 考点文件目录：E:\tiku\shuju\执业药师西药二考点
const KNOWLEDGE_POINT_DIR = join(process.cwd(), 'shuju', '执业药师西药二考点')

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
  // 统一处理换行符：先替换 \r\n 为 \n，再分割
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalizedContent.split('\n')
  const stages: ParsedContent['stages'] = []
  let currentStage: ParsedContent['stages'][0] | null = null
  let currentModule: ParsedContent['stages'][0]['modules'][0] | null = null
  let currentModuleLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // 识别阶段（第一阶段、第二阶段、第三阶段，可能包含后续文字）
    // 格式：第一阶段：新手导航——分清四类"催眠师" 或 第一阶段 建立框架 初学
    // 支持有无冒号都可以
    const stageMatch = line.match(/^第[一二三]阶段[：:\s]/)
    if (stageMatch) {
      // 保存上一个模块
      if (currentModule && currentModuleLines.length > 0) {
        currentModule.content = currentModuleLines.join('\n').trim()
        if (currentStage) {
          currentStage.modules.push(currentModule)
        }
        currentModuleLines = []
      }
      
      // 保存上一个阶段
      if (currentStage) {
        stages.push(currentStage)
      }
      
      // 创建新阶段（保留完整阶段名称，包括后续描述）
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
        currentModule.content = currentModuleLines.join('\n').trim()
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
    
    // 收集模块内容（跳过空行，但保留格式）
    if (currentModule) {
      currentModuleLines.push(line)
    } else if (currentStage && !currentModule) {
      // 阶段标题后的内容（如果没有模块标记，可能是阶段描述）
      if (line.trim() || currentModuleLines.length > 0) {
        currentModuleLines.push(line)
      }
    }
  }
  
  // 保存最后一个模块
  if (currentModule && currentModuleLines.length > 0) {
    currentModule.content = currentModuleLines.join('\n').trim()
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
 * 转义正则表达式特殊字符
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 根据 code 查找匹配的文件（使用精确边界匹配）
 */
async function findPointFile(code: string): Promise<string | null> {
  try {
    console.log(`[文件查找] 开始查找 ${code}，目录: ${KNOWLEDGE_POINT_DIR}`)
    
    const files = await readdir(KNOWLEDGE_POINT_DIR)
    console.log(`[文件查找] 目录中共有 ${files.length} 个文件`)
    
    // 统一处理：trim() + toLowerCase()
    const codeNorm = code.trim().toLowerCase()
    
    // 方法1：精确匹配（如 c8.4.10 -> c8.4.10xxx.txt）
    let matchedFile = files.find(file => {
      const fileName = file.toLowerCase()
      // 文件名以小写code开头且以.txt结尾
      return fileName.startsWith(codeNorm) && fileName.endsWith('.txt')
    })
    
    // 方法2：如果精确匹配失败，尝试去掉C前缀匹配（如 8.4.10）
    if (!matchedFile && codeNorm.startsWith('c')) {
      const codeWithoutC = codeNorm.substring(1) // 去掉开头的 'c'
      matchedFile = files.find(file => {
        const fileName = file.toLowerCase()
        return fileName.startsWith(codeWithoutC) && fileName.endsWith('.txt')
      })
    }
    
    // 方法3：如果还是失败，尝试模糊匹配（包含code）
    if (!matchedFile) {
      matchedFile = files.find(file => {
        const fileName = file.toLowerCase()
        // 文件名包含code且以.txt结尾
        return fileName.includes(codeNorm) && fileName.endsWith('.txt')
      })
    }
    
    if (matchedFile) {
      const filePath = join(KNOWLEDGE_POINT_DIR, matchedFile)
      console.log(`[文件查找] ✅ ${code} -> ${matchedFile}`)
      console.log(`[文件查找] 完整路径: ${filePath}`)
      return filePath
    }
    
    // 调试：显示前10个文件名（小写）
    const sampleFiles = files.slice(0, 10).map(f => f.toLowerCase())
    console.warn(`[文件查找] ❌ ${code} 未找到匹配文件`)
    console.warn(`[文件查找] 查找的code: ${codeNorm}`)
    console.warn(`[文件查找] 示例文件:`, sampleFiles)
    
    // 检查是否有相似的文件名
    const similarFiles = files.filter(f => {
      const fileName = f.toLowerCase()
      // 检查是否包含code中的数字部分
      const codeNumbers = codeNorm.match(/\d+/g)?.join('.') || ''
      return fileName.includes(codeNumbers) && fileName.endsWith('.txt')
    })
    
    if (similarFiles.length > 0) {
      console.warn(`[文件查找] 找到相似文件:`, similarFiles.slice(0, 5))
    }
    
    return null
  } catch (error) {
    console.error(`[文件查找] ❌ ${code} 读取考点目录失败:`, error instanceof Error ? error.message : String(error))
    console.error(`[文件查找] 目录路径: ${KNOWLEDGE_POINT_DIR}`)
    return null
  }
}

/**
 * 从数据库读取内容块并转换为前端格式
 * 支持多种code格式的查询（原始、大写、小写）
 */
async function getContentBlocksFromDB(code: string): Promise<ParsedContent | null> {
  try {
    const { Pool } = await import('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
    
    const client = await pool.connect()
    try {
      // 规范化code：trim并生成多个候选格式
      const raw = code.trim()
      const candidates = [
        raw,
        raw.toUpperCase(),
        raw.toLowerCase()
      ]
      // 去重
      const uniqueCandidates = Array.from(new Set(candidates))
      
      // 查询所有内容块（尝试多种code格式）
      // 使用 UPPER() 进行大小写不敏感匹配
      // 同时尝试直接匹配和去掉C前缀的匹配（如 C8.4.10 和 8.4.10）
      const extendedCandidates = [
        ...uniqueCandidates,
        ...uniqueCandidates.map(c => c.replace(/^c/i, '')), // 去掉C前缀
        ...uniqueCandidates.map(c => c.replace(/^c/i, 'C'))  // 确保有C前缀
      ].filter((v, i, arr) => arr.indexOf(v) === i) // 去重
      
      console.log(`[DB查询] ${raw} 尝试查询格式: ${extendedCandidates.join(', ')}`)
      
      const result = await client.query(`
        SELECT stage, module, title, content, code as db_code
        FROM knowledge_point_content_blocks
        WHERE UPPER(code) = ANY(SELECT UPPER(unnest($1::text[])))
        ORDER BY 
          CASE stage 
            WHEN 'stage1' THEN 1 
            WHEN 'stage2' THEN 2 
            WHEN 'stage3' THEN 3 
            ELSE 4 
          END,
          CASE module 
            WHEN 'M02' THEN 1 
            WHEN 'M03' THEN 2 
            WHEN 'M04' THEN 3 
            WHEN 'M05' THEN 4 
            WHEN 'M06' THEN 5 
            ELSE 6 
          END
      `, [extendedCandidates])
      
      if (result.rows.length === 0) {
        console.warn(`[DB查询] ${raw} 未找到内容块，尝试的格式: ${extendedCandidates.join(', ')}`)
        // 尝试查询所有C8.4.10相关的记录（用于调试）
        const debugResult = await client.query(`
          SELECT DISTINCT code, COUNT(*) as count
          FROM knowledge_point_content_blocks
          WHERE code LIKE '%8.4.10%' OR code LIKE '%8_4_10%'
          GROUP BY code
        `)
        if (debugResult.rows.length > 0) {
          console.warn(`[DB查询] 调试：找到相似code:`, debugResult.rows.map(r => `${r.code} (${r.count}条)`))
        }
        return null
      }
      
      console.log(`[DB查询] ${raw} 找到 ${result.rows.length} 个内容块，数据库中的code: ${result.rows[0].db_code}`)
      
      // 转换为前端需要的格式
      // 按 stage 分组，如果 stage 为空则按模块顺序分配到三个阶段
      const stagesMap = new Map<string, ParsedContent['stages'][0]>()
      
      // 初始化三个阶段
      const stageNames: Record<string, string> = {
        'stage1': '第一阶段 建立框架 初学',
        'stage2': '第二阶段 复习查漏 默认推荐',
        'stage3': '第三阶段 冲刺秒杀 考前'
      }
      
      // 定义模块到阶段的映射（当 stage 字段为空时使用）
      const moduleToStageMap: Record<string, string> = {
        'M02': 'stage1',
        'M03': 'stage1', // M03 可能在多个阶段出现，优先分配到 stage1
        'M04': 'stage1', // M04 可能在多个阶段出现，优先分配到 stage1
        'M05': 'stage2', // M05 可能在多个阶段出现，优先分配到 stage2
        'M06': 'stage2'  // M06 可能在多个阶段出现，优先分配到 stage2
      }
      
      result.rows.forEach((row, index) => {
        // 如果 stage 字段为空或无效，根据模块代码推断阶段
        let stageKey = row.stage
        if (!stageKey || !['stage1', 'stage2', 'stage3'].includes(stageKey)) {
          // 根据模块代码推断阶段
          stageKey = moduleToStageMap[row.module] || 'stage1'
          console.warn(`[DB查询] ${raw} 记录 ${index + 1} 的 stage 字段为空，根据模块 ${row.module} 推断为 ${stageKey}`)
        }
        
        if (!stagesMap.has(stageKey)) {
          stagesMap.set(stageKey, {
            stageName: stageNames[stageKey] || stageKey,
            modules: []
          })
        }
        
        const stage = stagesMap.get(stageKey)!
        stage.modules.push({
          moduleCode: row.module,
          moduleName: row.title || '',
          content: row.content
        })
      })
      
      // 确保三个阶段都存在（即使没有数据也创建空阶段）
      const orderedStages = ['stage1', 'stage2', 'stage3']
      orderedStages.forEach(stageKey => {
        if (!stagesMap.has(stageKey)) {
          stagesMap.set(stageKey, {
            stageName: stageNames[stageKey],
            modules: []
          })
        }
      })
      
      // 按顺序返回三个阶段（只返回有模块的阶段）
      const stages = orderedStages
        .map(key => stagesMap.get(key)!)
        .filter(stage => stage.modules.length > 0)
      
      // 如果所有阶段都没有模块，返回 null（触发占位内容）
      if (stages.length === 0) {
        console.warn(`[DB查询] ${raw} 转换后没有有效的阶段和模块`)
        return null
      }
      
      console.log(`[DB查询] ${raw} 转换后的阶段数: ${stages.length}, 总模块数: ${stages.reduce((sum, s) => sum + s.modules.length, 0)}`)
      
      return {
        stages,
        rawContent: '' // 数据库版本不提供原始内容
      }
    } finally {
      client.release()
      await pool.end()
    }
  } catch (error) {
    console.error('从数据库读取内容块失败:', error)
    return null
  }
}

/**
 * 获取数据库指纹与当前 code 的 blocks 数量（仅用于 debug，不影响主逻辑）
 * 在查询 knowledge_point_content_blocks 之前可调用，用于确认实际连接的库
 */
async function getDbFingerprint(normalizedCode: string): Promise<{
  db: string
  server_ip: string
  server_port: number | string
  version: string
  normalizedCode: string
  dbBlockCount: number
} | null> {
  try {
    const { Pool } = await import('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
    const client = await pool.connect()
    try {
      const fp = await client.query(`
        SELECT
          current_database() AS db,
          inet_server_addr() AS server_ip,
          inet_server_port() AS server_port,
          version() AS version
      `)
      const row = fp.rows[0]
      const codeParam = normalizedCode.trim()
      const countResult = await client.query(
        `SELECT COUNT(*) AS c FROM knowledge_point_content_blocks WHERE UPPER(code) = UPPER($1)`,
        [codeParam]
      )
      const dbBlockCount = parseInt(String(countResult.rows[0]?.c ?? 0), 10)
      return {
        db: row?.db != null ? String(row.db) : '',
        server_ip: row?.server_ip != null ? String(row.server_ip) : '',
        server_port: row?.server_port != null ? row.server_port : '',
        version: row?.version != null ? String(row.version) : '',
        normalizedCode: codeParam,
        dbBlockCount
      }
    } finally {
      client.release()
      await pool.end()
    }
  } catch {
    return null
  }
}

/**
 * 生成占位内容结构（当内容不存在时返回）
 */
function createPlaceholderContent(code: string): ParsedContent {
  return {
    stages: [
      {
        stageName: '第一阶段 建立框架 初学',
        modules: [
          {
            moduleCode: 'M02',
            moduleName: '本页定位',
            content: '本考点内容正在整理中，可先完成下方自测'
          }
        ]
      },
      {
        stageName: '第二阶段 复习查漏 默认推荐',
        modules: [
          {
            moduleCode: 'M03',
            moduleName: '必背要点',
            content: '本考点内容正在整理中，可先完成下方自测'
          }
        ]
      },
      {
        stageName: '第三阶段 冲刺秒杀 考前',
        modules: [
          {
            moduleCode: 'M04',
            moduleName: '秒杀技巧',
            content: '本考点内容正在整理中，可先完成下方自测'
          }
        ]
      }
    ],
    rawContent: ''
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    
    if (!code) {
      return NextResponse.json(
        { success: false, error: '考点 code 不能为空' },
        { status: 400 }
      )
    }
    
    // 规范化 code
    const normalizedCode = code.trim()
    const debugMode =
      process.env.NODE_ENV !== 'production' ||
      (request.url && new URL(request.url).searchParams.get('debug') === '1')
    
    console.log(`[API] 开始处理请求: code=${normalizedCode}`)
    console.log(`[API] 文件目录: ${KNOWLEDGE_POINT_DIR}`)
    
    // 优先级1：尝试从文件系统读取
    let fileContent: ParsedContent | null = null
    let filePath: string | null = null
    
    try {
      const foundPath = await findPointFile(normalizedCode)
      
      if (foundPath) {
        console.log(`[API] ${normalizedCode} 找到文件，开始读取: ${foundPath}`)
        
        // 读取文件内容
        const content = await readFile(foundPath, 'utf-8')
        console.log(`[API] ${normalizedCode} 文件读取成功，内容长度: ${content.length} 字符`)
        
        // 解析内容
        fileContent = parsePointContent(content)
        filePath = foundPath
        
        console.log(`[API] ${normalizedCode} 解析完成:`)
        console.log(`  - 阶段数: ${fileContent.stages.length}`)
        fileContent.stages.forEach((stage, idx) => {
          console.log(`  - 阶段 ${idx + 1}: ${stage.stageName}, 模块数: ${stage.modules.length}`)
          stage.modules.forEach(module => {
            console.log(`    - ${module.moduleCode}: ${module.moduleName} (${module.content.length} 字符)`)
          })
        })
        
        // 如果文件读取成功，直接返回
        if (fileContent && fileContent.stages.length > 0) {
          const totalModules = fileContent.stages.reduce((sum, s) => sum + s.modules.length, 0)
          console.log(`[API] ✅ ${normalizedCode} 从文件读取成功，共 ${fileContent.stages.length} 个阶段，${totalModules} 个模块`)
          
          const body: Record<string, unknown> = {
            success: true,
            data: {
              code: normalizedCode,
              filePath,
              source: 'file',
              ...fileContent
            }
          }
          if (debugMode) {
            const debug = await getDbFingerprint(normalizedCode)
            if (debug) body.debug = debug
          }
          return NextResponse.json(body)
        } else {
          console.warn(`[API] ⚠️ ${normalizedCode} 文件读取成功但解析失败，阶段数为0`)
        }
      } else {
        console.warn(`[API] ⚠️ ${normalizedCode} 文件未找到`)
      }
    } catch (fileError) {
      // 文件读取失败，继续执行DB fallback（不提前return）
      console.error(`[API] ❌ ${normalizedCode} 文件读取失败:`, fileError instanceof Error ? fileError.message : String(fileError))
      if (fileError instanceof Error && fileError.stack) {
        console.error(`[API] 错误堆栈:`, fileError.stack)
      }
    }
    
    // 优先级2：从数据库读取内容块（无论文件是否失败，都要执行）
    const dbContent = await getContentBlocksFromDB(normalizedCode)
    if (dbContent && dbContent.stages.length > 0) {
      const body: Record<string, unknown> = {
        success: true,
        data: {
          code: normalizedCode,
          filePath: null,
          source: 'db',
          ...dbContent
        }
      }
      if (debugMode) {
        const debug = await getDbFingerprint(normalizedCode)
        if (debug) body.debug = debug
      }
      return NextResponse.json(body)
    }
    
    // 都失败：返回占位结构而不是硬错误
    const placeholderContent = createPlaceholderContent(normalizedCode)
    const body: Record<string, unknown> = {
      success: true,
      data: {
        code: normalizedCode,
        filePath: null,
        source: 'placeholder',
        ...placeholderContent
      }
    }
    if (debugMode) {
      const debug = await getDbFingerprint(normalizedCode)
      if (debug) body.debug = debug
    }
    return NextResponse.json(body)
    
  } catch (error) {
    console.error('读取考点内容失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '读取考点内容失败',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
