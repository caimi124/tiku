/**
 * 内容处理工具函数
 */

/**
 * 从内容中提取口诀
 */
export function extractMnemonic(content: string): string | null {
  if (!content) return null

  const patterns = [
    /【润德巧记】[：:]?\s*([^【】\n]+)/,
    /【巧记】[：:]?\s*([^【】\n]+)/,
    /【口诀】[：:]?\s*([^【】\n]+)/,
    /【记忆口诀】[：:]?\s*([^【】\n]+)/,
    /【速记】[：:]?\s*([^【】\n]+)/,
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return null
}

/**
 * 检查内容是否包含表格
 */
export function hasTable(content: string): boolean {
  if (!content) return false
  // 简单的表格检测：包含多个 | 符号的行
  const lines = content.split('\n')
  let tableLineCount = 0
  for (const line of lines) {
    if (line.includes('|') && line.split('|').length >= 3) {
      tableLineCount++
      if (tableLineCount >= 2) return true
    }
  }
  return false
}

/**
 * 检查内容是否包含分类表格（结构骨架）
 */
export function hasClassificationTable(content: string): boolean {
  if (!content) return false
  // 检测包含"分类"、"类型"、"种类"等关键词的表格
  const keywords = ['分类', '类型', '种类', '类别', '分类表']
  const hasKeyword = keywords.some(keyword => content.includes(keyword))
  return hasKeyword && hasTable(content)
}

