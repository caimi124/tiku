/**
 * KeywordHighlight 工具函数
 * 用于高亮文本中的关键词
 * 
 * Requirements: 3.6
 */

export interface KeywordConfig {
  keyword: string
  className: string
}

export interface HighlightPart {
  text: string
  isHighlighted: boolean
  className?: string
}

// 预定义的关键词及其样式
export const DEFAULT_KEYWORDS: KeywordConfig[] = [
  { keyword: '首选', className: 'bg-green-100 text-green-800 font-semibold px-1 rounded' },
  { keyword: '禁忌', className: 'bg-red-100 text-red-800 font-semibold px-1 rounded' },
  { keyword: '禁用', className: 'bg-red-100 text-red-800 font-semibold px-1 rounded' },
  { keyword: '慎用', className: 'bg-yellow-100 text-yellow-800 font-semibold px-1 rounded' },
  { keyword: '相互作用', className: 'bg-purple-100 text-purple-800 font-semibold px-1 rounded' },
  { keyword: '不良反应', className: 'bg-orange-100 text-orange-800 font-semibold px-1 rounded' },
  { keyword: '适应证', className: 'bg-blue-100 text-blue-800 font-semibold px-1 rounded' },
  { keyword: '注意', className: 'bg-yellow-100 text-yellow-800 font-semibold px-1 rounded' },
  { keyword: '警告', className: 'bg-red-100 text-red-800 font-semibold px-1 rounded' },
  { keyword: '特殊人群', className: 'bg-indigo-100 text-indigo-800 font-semibold px-1 rounded' },
]

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 高亮文本中的关键词
 */
export function highlightKeywords(
  text: string,
  keywords: KeywordConfig[]
): HighlightPart[] {
  if (!text || keywords.length === 0) {
    return [{ text, isHighlighted: false }]
  }

  // 创建正则表达式匹配所有关键词
  const keywordMap = new Map(keywords.map(k => [k.keyword, k.className]))
  const pattern = keywords.map(k => escapeRegExp(k.keyword)).join('|')
  const regex = new RegExp(`(${pattern})`, 'g')

  const parts: HighlightPart[] = []
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // 添加匹配前的普通文本
    if (match.index > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, match.index),
        isHighlighted: false
      })
    }

    // 添加高亮的关键词
    parts.push({
      text: match[0],
      isHighlighted: true,
      className: keywordMap.get(match[0])
    })

    lastIndex = regex.lastIndex
  }

  // 添加剩余的普通文本
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      isHighlighted: false
    })
  }

  return parts.length > 0 ? parts : [{ text, isHighlighted: false }]
}

/**
 * 检查文本是否包含任何关键词
 */
export function containsKeyword(text: string, keywords: KeywordConfig[]): boolean {
  return keywords.some(k => text.includes(k.keyword))
}

/**
 * 获取文本中包含的所有关键词
 */
export function getMatchedKeywords(text: string, keywords: KeywordConfig[]): string[] {
  return keywords.filter(k => text.includes(k.keyword)).map(k => k.keyword)
}
