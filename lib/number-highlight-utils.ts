/**
 * NumberHighlight 工具函数
 * 用于高亮文本中的数字（剂量、年龄、时间等）
 * 
 * Requirements: 3.4
 */

export interface NumberHighlightPart {
  text: string
  isNumber: boolean
  unit?: string
}

// 常见的药学单位
const UNITS = [
  'mg', 'g', 'kg', 'ml', 'L', 'μg', 'mcg',
  '岁', '个月', '周', '天', '日', '小时', 'h', 'min', '分钟', '秒',
  '%', '次', '片', '粒', '支', '瓶', '袋',
  'mmol', 'mol', 'IU', 'U'
]

// 数字匹配正则（包括小数、分数、范围）
const NUMBER_PATTERN = /(\d+(?:\.\d+)?(?:[-~～]\d+(?:\.\d+)?)?(?:\/\d+)?)/g

/**
 * 高亮文本中的数字
 */
export function highlightNumbers(text: string): NumberHighlightPart[] {
  if (!text) {
    return [{ text: '', isNumber: false }]
  }

  const parts: NumberHighlightPart[] = []
  let lastIndex = 0
  let match

  // 重置正则状态
  NUMBER_PATTERN.lastIndex = 0

  while ((match = NUMBER_PATTERN.exec(text)) !== null) {
    // 添加匹配前的普通文本
    if (match.index > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, match.index),
        isNumber: false
      })
    }

    // 检查数字后面是否跟着单位
    const numberEnd = match.index + match[0].length
    let unit: string | undefined
    
    for (const u of UNITS) {
      if (text.slice(numberEnd).startsWith(u)) {
        unit = u
        break
      }
    }

    // 添加数字部分
    parts.push({
      text: match[0],
      isNumber: true,
      unit
    })

    lastIndex = numberEnd
  }

  // 添加剩余的普通文本
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      isNumber: false
    })
  }

  return parts.length > 0 ? parts : [{ text, isNumber: false }]
}

/**
 * 检查文本是否包含数字
 */
export function containsNumber(text: string): boolean {
  NUMBER_PATTERN.lastIndex = 0
  return NUMBER_PATTERN.test(text)
}

/**
 * 提取文本中的所有数字
 */
export function extractNumbers(text: string): string[] {
  NUMBER_PATTERN.lastIndex = 0
  const matches = text.match(NUMBER_PATTERN)
  return matches || []
}

/**
 * 提取数字及其单位
 */
export function extractNumbersWithUnits(text: string): { number: string; unit?: string }[] {
  const parts = highlightNumbers(text)
  return parts
    .filter(p => p.isNumber)
    .map(p => ({ number: p.text, unit: p.unit }))
}
