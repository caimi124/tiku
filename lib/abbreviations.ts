/**
 * 医学缩写映射表
 * 
 * 用于将缩写替换为"中文全称（缩写）"格式
 */

export const ABBREVIATION_MAP: Record<string, string> = {
  // 肝胆疾病用药
  'NAC': '乙酰半胱氨酸',
  'UDCA': '熊去氧胆酸',
  'ALT': '丙氨酸氨基转移酶',
  'AST': '天冬氨酸氨基转移酶',
  'IBAT': '回肠胆汁酸转运蛋白',
  'PBC': '原发性胆汁性肝硬化',
  
  // 其他常见缩写（可根据需要扩展）
  'ACEI': '血管紧张素转换酶抑制剂',
  'ARB': '血管紧张素Ⅱ受体拮抗剂',
  'CCB': '钙通道阻滞剂',
  'NSAIDs': '非甾体抗炎药',
  'COX': '环氧化酶',
  'HMG-CoA': '3-羟基-3-甲基戊二酰辅酶A',
  'PPI': '质子泵抑制剂',
  'H2RA': 'H2受体拮抗剂',
  'ACE': '血管紧张素转换酶',
}

/**
 * 格式化文本中的缩写
 * 
 * 将缩写替换为"中文全称（缩写）"格式
 * 如果缩写已存在于上下文中，则只替换未格式化的缩写
 */
export function formatAbbreviations(text: string): string {
  if (!text) return text

  let formatted = text

  // 按长度从长到短排序，避免短缩写替换长缩写的一部分
  const sortedAbbrevs = Object.keys(ABBREVIATION_MAP).sort((a, b) => b.length - a.length)

  for (const abbrev of sortedAbbrevs) {
    const fullName = ABBREVIATION_MAP[abbrev]
    
    // 检查是否已经是完整格式（中文（缩写））
    const fullPattern = new RegExp(`${fullName}\\s*（${abbrev}）`, 'gi')
    if (fullPattern.test(formatted)) {
      continue // 已经是完整格式，跳过
    }

    // 替换独立的缩写（前后是标点、空格或边界）
    const abbrevPattern = new RegExp(`\\b${abbrev}\\b`, 'gi')
    formatted = formatted.replace(abbrevPattern, (match) => {
      // 检查是否在括号内（可能是已格式化的）
      const beforeMatch = formatted.substring(0, formatted.indexOf(match))
      const afterMatch = formatted.substring(formatted.indexOf(match) + match.length)
      
      // 如果前面有中文和左括号，可能是已格式化，跳过
      if (beforeMatch.match(/[\u4e00-\u9fa5]（$/)) {
        return match
      }
      
      return `${fullName}（${match}）`
    })
  }

  return formatted
}

/**
 * 批量格式化文本数组
 */
export function formatAbbreviationsArray(texts: string[]): string[] {
  return texts.map(formatAbbreviations)
}

/**
 * 格式化对象中的文本字段
 */
export function formatAbbreviationsInObject<T extends Record<string, any>>(
  obj: T,
  textFields: (keyof T)[]
): T {
  const formatted = { ...obj }
  for (const field of textFields) {
    if (typeof formatted[field] === 'string') {
      formatted[field] = formatAbbreviations(formatted[field] as string) as T[keyof T]
    }
  }
  return formatted
}
