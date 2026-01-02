/**
 * SmartContentRenderer - 智能内容渲染组件
 * 
 * 从产品经理和用户心理角度优化内容展示：
 * 1. 视觉层次分明 - 不同类型内容用不同样式区分
 * 2. 信息密度适中 - 避免大段文字堆砌
 * 3. 重点突出 - 关键信息高亮显示
 * 4. 表格美化 - Markdown表格转换为美观的卡片式表格
 * 5. 口诀突出 - 记忆口诀用醒目样式展示
 * 6. 图片优化 - 图片居中展示，支持点击放大
 */

'use client'

import React, { useState, useMemo } from 'react'
import { 
  Lightbulb, AlertTriangle, CheckCircle, 
  ChevronDown, ChevronUp, ZoomIn, X,
  Pill, BookOpen, List
} from 'lucide-react'

import type { InlineAnnotationRule } from '@/lib/knowledge/pointPage.schema'
import { InlineAnnotation } from './InlineAnnotation'

interface SmartContentRendererProps {
  content: string
  className?: string
  annotations?: InlineAnnotationRule[]
}

// 内容块类型
type ContentBlockType = 
  | 'table' 
  | 'mnemonic' 
  | 'image' 
  | 'numbered_list' 
  | 'key_point'
  | 'warning'
  | 'paragraph'

interface ContentBlock {
  type: ContentBlockType
  content: string
  raw: string
}

/**
 * 检测是否是乱码文本（OCR识别错误）
 */
function isGarbageText(text: string): boolean {
  if (!text || text.length < 5) return false
  
  // 计算非中文、非英文、非数字、非常见标点的字符比例
  const cleanText = text.replace(/[\s\n\r]/g, '')
  if (cleanText.length === 0) return true
  
  // 有效字符：中文、英文、数字、常见标点
  const validChars = cleanText.match(/[\u4e00-\u9fa5a-zA-Z0-9，。、；：""''（）【】《》？！·\-\+\=\%\.\,\;\:\(\)\[\]\/\\]/g) || []
  const validRatio = validChars.length / cleanText.length
  
  // 如果有效字符比例低于60%，认为是乱码
  if (validRatio < 0.6) return true
  
  // 检测连续的无意义字符模式
  if (/[a-zA-Z]{2,}\s+[a-zA-Z]{2,}\s+[a-zA-Z]{2,}/.test(text) && !/[a-zA-Z]{4,}/.test(text)) {
    // 短的随机英文字母组合，可能是OCR乱码
    const chineseCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    if (chineseCount < text.length * 0.3) return true
  }
  
  return false
}

/**
 * 解析内容为结构化块
 */
function parseContent(content: string): ContentBlock[] {
  if (!content) return []
  
  const blocks: ContentBlock[] = []
  const lines = content.split('\n')
  let currentBlock: string[] = []
  let inTable = false
  
  const flushParagraph = () => {
    if (currentBlock.length > 0) {
      const text = currentBlock.join('\n').trim()
      if (text) {
        // 跳过乱码文本
        if (isGarbageText(text)) {
          currentBlock = []
          return
        }
        
        // 检查是否包含口诀
        if (text.includes('【润德巧记】') || text.includes('【巧记】') || text.includes('【口诀】')) {
          blocks.push({ type: 'mnemonic', content: text, raw: text })
        }
        // 检查是否是编号列表 (1)xxx(2)xxx
        else if (/\(\d+\)/.test(text) && text.split(/\(\d+\)/).length > 2) {
          blocks.push({ type: 'numbered_list', content: text, raw: text })
        }
        // 检查是否包含警告/禁忌关键词
        else if (/禁用|禁忌|慎用|注意|警告|不良反应/.test(text)) {
          blocks.push({ type: 'warning', content: text, raw: text })
        }
        // 检查是否是重点内容
        else if (/首选|关键|重要|必须|一定/.test(text)) {
          blocks.push({ type: 'key_point', content: text, raw: text })
        }
        else {
          blocks.push({ type: 'paragraph', content: text, raw: text })
        }
      }
      currentBlock = []
    }
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 检测图片
    if (line.startsWith('[图片:') || line.match(/\[图片:\s*[\w\/\.\-]+\]/)) {
      flushParagraph()
      blocks.push({ type: 'image', content: line, raw: line })
      continue
    }
    
    // 检测表格开始
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        flushParagraph()
        inTable = true
      }
      currentBlock.push(line)
      continue
    }
    
    // 表格结束
    if (inTable && (!line.startsWith('|') || !line.endsWith('|'))) {
      if (currentBlock.length > 0) {
        blocks.push({ type: 'table', content: currentBlock.join('\n'), raw: currentBlock.join('\n') })
        currentBlock = []
      }
      inTable = false
    }
    
    // 普通行
    if (!inTable) {
      if (line === '') {
        flushParagraph()
      } else {
        currentBlock.push(line)
      }
    }
  }
  
  // 处理最后的内容
  if (inTable && currentBlock.length > 0) {
    blocks.push({ type: 'table', content: currentBlock.join('\n'), raw: currentBlock.join('\n') })
  } else {
    flushParagraph()
  }
  
  return blocks
}

/**
 * 主组件
 */
export function SmartContentRenderer({ content, className = '', annotations }: SmartContentRendererProps) {
  const blocks = useMemo(() => parseContent(content), [content])
  
  // 处理标注：在内容块中查找匹配并注入标注
  const blocksWithAnnotations = useMemo(() => {
    if (!annotations || annotations.length === 0) {
      return blocks.map((block, index) => ({ block, index, annotations: [] }))
    }

    return blocks.map((block, index) => {
      const matchedAnnotations: InlineAnnotationRule[] = []
      
      for (const rule of annotations) {
        let regex: RegExp
        try {
          if (rule.match.type === "regex") {
            regex = new RegExp(rule.match.value, "gi")
          } else {
            regex = new RegExp(rule.match.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
          }
          
          if (regex.test(block.content)) {
            matchedAnnotations.push(rule)
          }
        } catch {
          // 无效的正则表达式，跳过
        }
      }
      
      return { block, index, annotations: matchedAnnotations }
    })
  }, [blocks, annotations])
  
  if (blocks.length === 0) {
    return (
      <div className="text-gray-400 italic py-4 text-center">
        暂无内容
      </div>
    )
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {blocksWithAnnotations.map(({ block, index, annotations: blockAnnotations }) => (
        <div key={index}>
          <ContentBlockRenderer block={block} index={index} />
          {blockAnnotations.length > 0 && (
            <div className="mt-2 space-y-2">
              {blockAnnotations.map((rule) => (
                <InlineAnnotation key={rule.id} rule={rule} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * 内容块渲染器
 */
function ContentBlockRenderer({ block, index }: { block: ContentBlock; index: number }) {
  switch (block.type) {
    case 'table':
      return <TableBlock content={block.content} />
    case 'mnemonic':
      return <MnemonicBlock content={block.content} />
    case 'image':
      return <ImageBlock content={block.content} />
    case 'numbered_list':
      return <NumberedListBlock content={block.content} />
    case 'warning':
      return <WarningBlock content={block.content} />
    case 'key_point':
      return <KeyPointBlock content={block.content} />
    case 'paragraph':
    default:
      return <ParagraphBlock content={block.content} />
  }
}

/**
 * 表格块 - 美化的卡片式表格
 */
function TableBlock({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const { headers, rows, tableTitle } = useMemo(() => {
    const lines = content.split('\n').filter(l => l.trim())
    if (lines.length < 2) return { headers: [], rows: [], tableTitle: '数据表' }
    
    const parseRow = (line: string) => 
      line.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
    
    const headers = parseRow(lines[0])
    // 跳过分隔行 |---|---|
    const dataLines = lines.slice(1).filter(l => !l.match(/^\|[\s\-|]+\|$/))
    const rows = dataLines.map(parseRow)
    
    // 根据表头推断表格标题
    let tableTitle = '数据表'
    const headerStr = headers.join('')
    if (headerStr.includes('分类') && headerStr.includes('代表药品')) {
      tableTitle = '药物分类表'
    } else if (headerStr.includes('药品') || headerStr.includes('药物')) {
      tableTitle = '药物信息表'
    } else if (headerStr.includes('项目') && headerStr.includes('内容')) {
      tableTitle = '详细说明'
    } else if (headerStr.includes('考点') && headerStr.includes('年份')) {
      tableTitle = '考点分布'
    }
    
    return { headers, rows, tableTitle }
  }, [content])
  
  if (headers.length === 0) return null
  
  // 判断是否是简单的两列表格，可以用卡片样式
  const isSimpleTable = headers.length === 2 && rows.length <= 10
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* 表格标题栏 */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <List className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-gray-700">{tableTitle}</span>
          <span className="text-xs text-gray-400 bg-white/60 px-2 py-0.5 rounded-full">{rows.length}项</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{isExpanded ? '收起' : '展开'}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                {headers.map((header, i) => (
                  <th 
                    key={i} 
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-blue-50/50 transition-colors group`}
                >
                  {row.map((cell, cellIndex) => (
                    <td 
                      key={cellIndex} 
                      className={`px-4 py-3 text-sm border-b border-gray-100 ${
                        cellIndex === 0 ? 'text-gray-800 font-medium' : 'text-gray-600'
                      }`}
                    >
                      <CellContent content={cell} isFirstColumn={cellIndex === 0} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/**
 * 单元格内容渲染 - 处理口诀等特殊内容
 */
function CellContent({ content, isFirstColumn = false }: { content: string; isFirstColumn?: boolean }) {
  // 检测口诀
  const mnemonicMatch = content.match(/【(润德巧记|巧记|口诀)】([^【]+)/)
  
  if (mnemonicMatch) {
    const beforeMnemonic = content.substring(0, content.indexOf('【'))
    const mnemonic = mnemonicMatch[2].trim()
    
    return (
      <div className="space-y-2">
        {beforeMnemonic && (
          <div className="leading-relaxed">
            <HighlightedText text={beforeMnemonic} />
          </div>
        )}
        <div className="inline-flex items-start gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 rounded-lg text-xs border border-amber-200/50">
          <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{mnemonic}</span>
        </div>
      </div>
    )
  }
  
  // 第一列通常是分类名，用药物图标装饰
  if (isFirstColumn && content.length < 30) {
    return (
      <div className="flex items-center gap-2">
        <Pill className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <span>{content}</span>
      </div>
    )
  }
  
  // 长内容需要换行显示
  if (content.length > 50) {
    return (
      <div className="leading-relaxed">
        <HighlightedText text={content} />
      </div>
    )
  }
  
  return <span>{content}</span>
}

/**
 * 口诀块 - 醒目的记忆提示
 */
function MnemonicBlock({ content }: { content: string }) {
  // 提取口诀内容
  const match = content.match(/【(润德巧记|巧记|口诀|记忆口诀)】([^【\n]+)/)
  const mnemonic = match ? match[2].trim() : content
  const context = match ? content.replace(match[0], '').trim() : ''
  
  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium text-amber-600 mb-1">💡 记忆口诀</div>
          <div className="text-amber-800 font-medium text-lg leading-relaxed">
            {mnemonic}
          </div>
          {context && (
            <div className="mt-2 text-sm text-amber-700/80">
              {context}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 图片块
 */
function ImageBlock({ content }: { content: string }) {
  const [showModal, setShowModal] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  // 提取图片路径 - 支持多种格式
  const match = content.match(/\[图片:\s*([\w\/\.\-]+)\]/)
  if (!match) return null
  
  // 构建图片路径 - 尝试多个可能的路径
  const rawPath = match[1]
  const imagePath = rawPath.startsWith('images/') 
    ? `/${rawPath}` 
    : rawPath.startsWith('/') 
      ? rawPath 
      : `/images/${rawPath}`
  
  // 如果图片加载失败，不显示这个块
  if (imageError) {
    return null
  }
  
  return (
    <>
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-center">
          <div 
            className="relative cursor-pointer group"
            onClick={() => setShowModal(true)}
          >
            <img 
              src={imagePath} 
              alt="知识点图片"
              className="max-w-full h-auto rounded-lg shadow-md max-h-72 object-contain bg-white"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
              <div className="bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <ZoomIn className="w-5 h-5 text-gray-700" />
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
          <ZoomIn className="w-3 h-3" />
          <span>点击图片放大查看</span>
        </div>
      </div>
      
      {/* 图片放大模态框 */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <button 
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-10"
            onClick={() => setShowModal(false)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img 
            src={imagePath} 
            alt="知识点图片"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </>
  )
}

/**
 * 编号列表块 - 将(1)(2)(3)格式转换为美观列表
 */
function NumberedListBlock({ content }: { content: string }) {
  const items = useMemo(() => {
    // 分割 (1)xxx(2)xxx 格式
    const parts = content.split(/\((\d+)\)/).filter(p => p.trim())
    const result: { num: string; text: string }[] = []
    
    for (let i = 0; i < parts.length; i += 2) {
      if (parts[i + 1]) {
        result.push({ num: parts[i], text: parts[i + 1].trim() })
      }
    }
    
    return result
  }, [content])
  
  if (items.length === 0) {
    return <ParagraphBlock content={content} />
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {items.map((item, index) => (
          <div key={index} className="flex gap-3 p-4 hover:bg-gray-50/50 transition-colors">
            <div className="flex-shrink-0 w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
              {item.num}
            </div>
            <div className="flex-1 text-gray-700 leading-relaxed pt-0.5">
              <HighlightedText text={item.text} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 警告/禁忌块
 */
function WarningBlock({ content }: { content: string }) {
  return (
    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-red-600" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium text-red-600 mb-1">⚠️ 注意事项</div>
          <div className="text-red-800 leading-relaxed">
            <HighlightedText text={content} />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 重点内容块
 */
function KeyPointBlock({ content }: { content: string }) {
  return (
    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-green-600" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium text-green-600 mb-1">✓ 重点内容</div>
          <div className="text-green-800 leading-relaxed">
            <HighlightedText text={content} />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 普通段落块 - 优化长文本阅读体验
 */
function ParagraphBlock({ content }: { content: string }) {
  // 长段落分段显示
  const isLongParagraph = content.length > 200
  
  // 尝试按句号分段
  const sentences = isLongParagraph 
    ? content.split(/(?<=[。；])\s*/).filter(s => s.trim())
    : [content]
  
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="space-y-3">
        {sentences.map((sentence, index) => (
          <p 
            key={index} 
            className="text-gray-700 leading-[1.8] text-[15px]"
          >
            <HighlightedText text={sentence.trim()} />
          </p>
        ))}
      </div>
    </div>
  )
}

/**
 * 高亮文本 - 自动高亮关键词
 */
function HighlightedText({ text }: { text: string }) {
  // 关键词高亮规则
  const highlights = [
    { pattern: /禁用|禁忌/g, className: 'text-red-600 font-semibold' },
    { pattern: /慎用/g, className: 'text-orange-600 font-medium' },
    { pattern: /首选|一线/g, className: 'text-green-600 font-semibold' },
    { pattern: /不良反应/g, className: 'text-red-500 font-medium' },
    { pattern: /适应证|适用于/g, className: 'text-blue-600 font-medium' },
  ]
  
  let result = text
  let elements: (string | JSX.Element)[] = [text]
  
  // 简单实现：直接返回带样式的文本
  // 实际项目中可以用更复杂的解析逻辑
  return (
    <span 
      dangerouslySetInnerHTML={{
        __html: text
          .replace(/禁用|禁忌/g, '<span class="text-red-600 font-semibold">$&</span>')
          .replace(/慎用/g, '<span class="text-orange-600 font-medium">$&</span>')
          .replace(/首选|一线/g, '<span class="text-green-600 font-semibold">$&</span>')
          .replace(/不良反应/g, '<span class="text-red-500 font-medium">$&</span>')
          .replace(/适应证|适用于/g, '<span class="text-blue-600 font-medium">$&</span>')
      }}
    />
  )
}

export default SmartContentRenderer
