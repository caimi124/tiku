/**
 * 关键词高亮处理
 * 为模块内容中的关键、重点词汇添加加粗标记
 * 规则：适度加粗，避免过度标记
 * 
 * 加粗策略：
 * 1. 药物分类缩写（ACEI、ARB等）- 蓝色
 * 2. 代表药物名称（普利、沙坦等）- 紫色
 * 3. 核心考试关键词（首选、禁忌等）- 橙色
 * 4. 易错/注意词（但、不明显等）- 橙色
 * 
 * 注意：不处理已经包含 HTML 标签的内容
 */

/**
 * 处理文本，为关键词添加加粗标记
 * @param text 原始文本
 * @returns 处理后的 HTML 字符串
 */
export function highlightKeywords(text: string): string {
  if (!text) return text

  let processed = text

  // 避免重复处理已包含 HTML 的内容
  if (/<[^>]+>/.test(processed)) {
    return processed
  }

  // 1. 药物分类缩写（常见且重要，限制数量）
  // ACEI、ARB、CCB、ARNI 等
  processed = processed.replace(
    /\b(ACEI|ARB|CCB|ARNI|PDE5|SGLT2|DPP-4|GLP-1|HMG-CoA)\b/gi,
    '<strong class="font-semibold text-blue-700">$1</strong>'
  )

  // 2. 代表药物名称（常见药名后缀，限制匹配）
  // 匹配：卡托普利、氯沙坦、硝苯地平等（只匹配常见后缀）
  processed = processed.replace(
    /([\u4e00-\u9fa5]{1,4}(?:普利|沙坦|地平|洛尔|噻嗪|他汀))\b/g,
    '<strong class="font-semibold text-purple-700">$1</strong>'
  )

  // 3. 核心考试关键词（高频考点，限制数量）
  // 首选、禁忌、一线、关键、必须
  processed = processed.replace(
    /(首选|禁忌|一线|关键|必须|核心|典型)/g,
    '<strong class="font-semibold text-amber-700">$1</strong>'
  )

  // 4. 易错/注意标记词（限制数量）
  // 但、不明显、远期差、易混、注意、慎用
  processed = processed.replace(
    /(但|不明显|远期差|易混|注意|慎用|警告)/g,
    '<strong class="font-semibold text-orange-700">$1</strong>'
  )

  // 5. 带引号的重点内容（通常已经是强调）
  // 只处理中文引号
  processed = processed.replace(
    /"([^"]{2,20})"/g,
    (match, content) => {
      return `"<strong class="font-semibold text-gray-800">${content}</strong>"`
    }
  )

  return processed
}

/**
 * 检查文本是否应该应用关键词高亮
 * 避免对已经包含 HTML 标签的内容重复处理
 */
export function shouldHighlight(text: string): boolean {
  if (!text) return false
  // 如果已经包含 HTML 标签，可能已经被处理过
  if (/<[^>]+>/.test(text)) return false
  return true
}
