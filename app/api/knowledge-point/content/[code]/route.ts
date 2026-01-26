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
    const files = await readdir(KNOWLEDGE_POINT_DIR)
    // 统一处理：trim() + toLowerCase()
    const codeNorm = code.trim().toLowerCase()
    
    // 构建正则表达式：^code(?!\d) - code 开头且后不跟数字
    const pattern = new RegExp(`^${escapeRegExp(codeNorm)}(?!\\d)`)
    
    // 查找匹配的文件
    const matchedFile = files.find(file => {
      const fileName = file.toLowerCase()
      // 必须同时满足：匹配正则 && 以 .txt 结尾
      return pattern.test(fileName) && fileName.endsWith('.txt')
    })
    
    if (matchedFile) {
      return join(KNOWLEDGE_POINT_DIR, matchedFile)
    }
    
    return null
  } catch (error) {
    console.error('读取考点目录失败:', error)
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
      const result = await client.query(`
        SELECT stage, module, title, content
        FROM knowledge_point_content_blocks
        WHERE code = ANY($1::text[])
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
      `, [uniqueCandidates])
      
      if (result.rows.length === 0) {
        return null
      }
      
      // 转换为前端需要的格式
      const stagesMap = new Map<string, ParsedContent['stages'][0]>()
      
      result.rows.forEach(row => {
        const stageKey = row.stage
        if (!stagesMap.has(stageKey)) {
          const stageNames: Record<string, string> = {
            'stage1': '第一阶段 建立框架 初学',
            'stage2': '第二阶段 复习查漏 默认推荐',
            'stage3': '第三阶段 冲刺秒杀 考前'
          }
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
      
      return {
        stages: Array.from(stagesMap.values()),
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
    
    // 规范化code
    const normalizedCode = code.trim()
    
    // 优先级1：尝试从文件系统读取
    let fileContent: ParsedContent | null = null
    let filePath: string | null = null
    
    try {
      const foundPath = await findPointFile(normalizedCode)
      
      if (foundPath) {
        // 读取文件内容
        const content = await readFile(foundPath, 'utf-8')
        
        // 解析内容
        fileContent = parsePointContent(content)
        filePath = foundPath
      }
    } catch (fileError) {
      // 文件读取失败，继续执行DB fallback（不提前return）
      console.warn(`[考点文件] ${normalizedCode} 文件读取失败，尝试从数据库读取:`, fileError)
    }
    
    // 如果文件读取成功，直接返回
    if (fileContent && filePath) {
      return NextResponse.json({
        success: true,
        data: {
          code: normalizedCode,
          filePath,
          source: 'file',
          ...fileContent
        }
      })
    }
    
    // 优先级2：从数据库读取内容块（无论文件是否失败，都要执行）
    const dbContent = await getContentBlocksFromDB(normalizedCode)
    if (dbContent && dbContent.stages.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          code: normalizedCode,
          filePath: null,
          source: 'db',
          ...dbContent
        }
      })
    }
    
    // 都失败：返回占位结构而不是硬错误
    const placeholderContent = createPlaceholderContent(normalizedCode)
    return NextResponse.json({
      success: true,
      data: {
        code: normalizedCode,
        filePath: null,
        source: 'placeholder',
        ...placeholderContent
      }
    })
    
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
