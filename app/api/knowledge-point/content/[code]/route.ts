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
    
    // 查找匹配的文件
    const filePath = await findPointFile(code)
    
    if (!filePath) {
      return NextResponse.json(
        { 
          success: false, 
          error: `未找到考点文件: ${code}`,
          code 
        },
        { status: 404 }
      )
    }
    
    // 读取文件内容
    const content = await readFile(filePath, 'utf-8')
    
    // 解析内容
    const parsed = parsePointContent(content)
    
    return NextResponse.json({
      success: true,
      data: {
        code,
        filePath,
        ...parsed
      }
    })
    
  } catch (error) {
    console.error('读取考点文件失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '读取考点文件失败',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
