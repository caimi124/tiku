/**
 * 考点类型分类规则
 * Exam Point Type Classification Rules
 * 
 * 使用启发式规则对知识点进行分类
 */

import type { ExamPointType } from './examPointType'

export interface KnowledgePoint {
  id?: string
  point_name?: string
  title?: string
  point_content?: string
  content?: string
  chapter?: string
  section?: string
  [key: string]: any
}

export interface ClassificationResult {
  type: ExamPointType
  confidence: 'high' | 'medium' | 'low'
  matchedRules: string[]
  uncertain?: boolean
}

/**
 * 文本归一化：统一全角/半角、去除多余空格、转小写
 */
function normalizeText(text: string): string {
  if (!text) return ''
  return text
    .replace(/[\uFF00-\uFFEF]/g, (char) => {
      // 全角转半角
      const code = char.charCodeAt(0)
      if (code >= 0xFF01 && code <= 0xFF5E) {
        return String.fromCharCode(code - 0xFEE0)
      }
      return char
    })
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim()
}

/**
 * 检查文本是否包含关键词（支持中文和英文）
 */
function containsKeywords(text: string, keywords: string[]): boolean {
  const normalized = normalizeText(text)
  return keywords.some(keyword => normalized.includes(normalizeText(keyword)))
}

/**
 * 检查是否包含多个关键词（AND 逻辑）
 */
function containsAllKeywords(text: string, keywords: string[]): boolean {
  const normalized = normalizeText(text)
  return keywords.every(keyword => normalized.includes(normalizeText(keyword)))
}

/**
 * 统计内容中出现的药物数量（简单启发式）
 */
function countDrugsInContent(content: string): number {
  if (!content) return 0
  
  // 常见药物名称模式（简化版，实际可能需要更复杂的识别）
  const drugPatterns = [
    /[A-Za-z]+(?:[替尼|拉唑|洛尔|地平|沙星|霉素|西林|他汀|普利|沙坦|卡因|巴比妥|西泮|拉定|洛尔|洛芬|美辛|昔布|司琼|必利|拉唑|替丁|前列醇|去氧胆酸|司琼|匹坦|西泮|氮平|拉唑|替丁|前列醇|去氧胆酸|司琼|匹坦|西泮|氮平])/g,
    /[阿|布|萘|吲|双|对|贝|赖|二|舒|氟|酮|非|奥|保|安|氨|塞|依|美|尼|帕|伐|艾|甲|来|别|非|秋|丙|苯|可|右|喷|吗|愈|氨|溴|乙|羧|异|布|氟|倍|色|特|沙|福|茚|噻|多|孟|奥|兰|泮|雷|艾|伏|西|法|米|铝|硫|枸|卡|东|甲|多|莫|伊|昂|帕|阿|劳|奥|牛|熊|鹅|去|丁|奥|氯|利|比|乳|聚|蒙|洛|苯|司|水|地|艾|三|唑|佐|扎|雷|巴|乙][\u4e00-\u9fa5]+/g,
  ]
  
  const matches = new Set<string>()
  drugPatterns.forEach(pattern => {
    const found = content.match(pattern) || []
    found.forEach(m => matches.add(m))
  })
  
  return matches.size
}

/**
 * 检查内容是否包含药物信息表结构
 */
function hasDrugInfoTable(content: string): boolean {
  if (!content) return false
  const normalized = normalizeText(content)
  return (
    normalized.includes('药物信息表') ||
    normalized.includes('药物详情') ||
    normalized.includes('适应证') ||
    (normalized.includes('禁忌') && normalized.includes('相互作用') && normalized.includes('不良反应'))
  )
}

/**
 * 检查内容是否包含分类表结构
 */
function hasClassificationTable(content: string): boolean {
  if (!content) return false
  const normalized = normalizeText(content)
  return (
    normalized.includes('药物分类表') ||
    normalized.includes('分类表') ||
    (normalized.includes('分类') && normalized.includes('代表药品')) ||
    (normalized.includes('分类') && normalized.includes('作用机制'))
  )
}

/**
 * 检查是否围绕单个药物的典型结构
 */
function hasSingleDrugStructure(content: string): boolean {
  if (!content) return false
  const normalized = normalizeText(content)
  
  // 检查是否包含单药典型结构：禁忌、相互作用、不良反应、用法用量等
  const singleDrugSections = [
    '禁忌',
    '相互作用',
    '不良反应',
    '用法用量',
    '适应证',
    '注意事项',
  ]
  
  const foundSections = singleDrugSections.filter(section => 
    normalized.includes(normalizeText(section))
  )
  
  // 如果包含3个或以上典型单药章节，且没有明显的分类/对比词汇
  if (foundSections.length >= 3) {
    const exclusionKeywords = ['分类', '对比', '各类', '选择', '方案', '流程']
    const hasExclusion = exclusionKeywords.some(kw => normalized.includes(normalizeText(kw)))
    return !hasExclusion
  }
  
  return false
}

/**
 * 规则1: single_drug (单药)
 */
function checkSingleDrug(point: KnowledgePoint): ClassificationResult | null {
  const title = point.point_name || point.title || ''
  const content = point.point_content || point.content || ''
  const combined = `${title} ${content}`
  const normalizedTitle = normalizeText(title)
  const normalizedContent = normalizeText(content)
  
  const matchedRules: string[] = []
  let confidence: 'high' | 'medium' | 'low' = 'low'
  
  // 条件1: 标题看起来是单个药名（且不含分类/对比等词）
  const exclusionKeywords = ['分类', '对比', '各类', '选择', '方案', '流程', '原则', '机制']
  const hasExclusionInTitle = exclusionKeywords.some(kw => normalizedTitle.includes(normalizeText(kw)))
  
  // 简单判断：标题较短且不包含排除词，可能是单药名
  if (title.length < 20 && !hasExclusionInTitle && title.length > 0) {
    // 检查是否包含常见药名后缀
    const drugSuffixes = ['林', '芬', '辛', '醇', '他', '因', '平', '唑', '丁', '坦', '普利', '沙坦', '洛尔', '地平']
    const hasDrugSuffix = drugSuffixes.some(suffix => title.includes(suffix))
    
    if (hasDrugSuffix) {
      matchedRules.push('title_looks_like_drug_name')
      confidence = 'medium'
    }
  }
  
  // 条件2: 内容有药物信息表且只对应1个药
  if (hasDrugInfoTable(content)) {
    const drugCount = countDrugsInContent(content)
    if (drugCount <= 1) {
      matchedRules.push('drug_info_table_single_drug')
      confidence = 'high'
    }
  }
  
  // 条件3: 内容围绕单个药物的典型结构
  if (hasSingleDrugStructure(content)) {
    matchedRules.push('single_drug_structure')
    confidence = confidence === 'low' ? 'medium' : 'high'
  }
  
  if (matchedRules.length > 0) {
    return {
      type: 'single_drug',
      confidence,
      matchedRules,
    }
  }
  
  return null
}

/**
 * 规则2: drug_class (分类)
 */
function checkDrugClass(point: KnowledgePoint): ClassificationResult | null {
  const title = point.point_name || point.title || ''
  const content = point.point_content || point.content || ''
  const combined = `${title} ${content}`
  const normalized = normalizeText(combined)
  
  const matchedRules: string[] = []
  let confidence: 'high' | 'medium' | 'low' = 'low'
  
  // 条件1: 标题包含分类关键词
  const classKeywords = [
    '分类',
    '各类',
    '类药',
    '类(Ⅰ',
    '类(Ⅱ',
    '类(Ⅲ',
    '类(Ⅳ',
    '类(Ⅴ',
    '类i',
    '类ii',
    '类iii',
    '类iv',
    '类v',
    '类1',
    '类2',
    '类3',
    '类4',
    '类5',
    '一代',
    '二代',
    '三代',
    '四代',
    '五代',
    '阻滞剂',
    '抑制剂',
  ]
  
  if (containsKeywords(title, classKeywords)) {
    matchedRules.push('title_contains_class_keywords')
    confidence = 'high'
  }
  
  // 条件2: 内容有分类表且分类项>=2
  if (hasClassificationTable(content)) {
    // 简单启发式：检查是否有多个分类项（通过"代表药品"、"作用机制"等关键词出现次数）
    const representativeDrugPattern = /代表药品|代表药|典型药物/g
    const matches = content.match(representativeDrugPattern)
    if (matches && matches.length >= 2) {
      matchedRules.push('classification_table_multiple_categories')
      confidence = 'high'
    } else {
      matchedRules.push('classification_table_detected')
      confidence = confidence === 'low' ? 'medium' : confidence
    }
  }
  
  // 条件3: 内容明显是多类别+代表药堆叠
  const drugCount = countDrugsInContent(content)
  if (drugCount >= 3 && normalized.includes('分类')) {
    matchedRules.push('multiple_drugs_with_classification')
    confidence = confidence === 'low' ? 'medium' : confidence
  }
  
  if (matchedRules.length > 0) {
    return {
      type: 'drug_class',
      confidence,
      matchedRules,
    }
  }
  
  return null
}

/**
 * 规则3: clinical_selection (临床选择/治疗原则)
 */
function checkClinicalSelection(point: KnowledgePoint): ClassificationResult | null {
  const title = point.point_name || point.title || ''
  const content = point.point_content || point.content || ''
  const combined = `${title} ${content}`
  const normalized = normalizeText(combined)
  
  const matchedRules: string[] = []
  let confidence: 'high' | 'medium' | 'low' = 'low'
  
  // 条件1: 标题包含治疗/选择关键词
  const selectionKeywords = [
    '治疗',
    '用药选择',
    '临床选择',
    '药物选择',
    '选择',
    '方案',
    '流程',
    '阶梯',
    '首选',
    '替代',
    '联合用药',
    '指南',
    '原则',
    '策略',
  ]
  
  if (containsKeywords(title, selectionKeywords)) {
    matchedRules.push('title_contains_selection_keywords')
    confidence = 'high'
  }
  
  // 条件2: 内容有明确的决策结构
  const decisionKeywords = [
    '一线',
    '二线',
    '三线',
    '替代',
    '联合',
    '流程',
    '目标',
    '首选',
    '次选',
    '阶梯治疗',
  ]
  
  if (containsKeywords(content, decisionKeywords)) {
    matchedRules.push('content_has_decision_structure')
    confidence = confidence === 'low' ? 'high' : confidence
  }
  
  if (matchedRules.length > 0) {
    return {
      type: 'clinical_selection',
      confidence,
      matchedRules,
    }
  }
  
  return null
}

/**
 * 规则4: adr_interaction (不良反应/相互作用专题)
 */
function checkAdrInteraction(point: KnowledgePoint): ClassificationResult | null {
  const title = point.point_name || point.title || ''
  const content = point.point_content || point.content || ''
  const combined = `${title} ${content}`
  const normalized = normalizeText(combined)
  
  const matchedRules: string[] = []
  let confidence: 'high' | 'medium' | 'low' = 'low'
  
  // 条件1: 标题包含不良反应/相互作用关键词
  const adrKeywords = [
    '不良反应',
    '副作用',
    '相互作用',
    '禁忌',
    '注意事项',
    '风险',
    '警示',
    '黑框',
    '药物相互作用',
    '配伍禁忌',
    '特殊人群',
    '特殊人群用药',
    '人群用药',
  ]
  
  if (containsKeywords(title, adrKeywords)) {
    matchedRules.push('title_contains_adr_keywords')
    confidence = 'high'
  }
  
  // 条件2: 内容主要是多药/多类的ADR/相互作用总结（且不是单药中心）
  if (containsKeywords(content, adrKeywords)) {
    const drugCount = countDrugsInContent(content)
    // 如果是多个药物的ADR/相互作用，而不是单个药物的详细描述
    if (drugCount >= 2 || !hasSingleDrugStructure(content)) {
      matchedRules.push('content_adr_interaction_summary')
      confidence = confidence === 'low' ? 'medium' : confidence
    }
  }
  
  if (matchedRules.length > 0) {
    return {
      type: 'adr_interaction',
      confidence,
      matchedRules,
    }
  }
  
  return null
}

/**
 * 规则0: 高优先级 - 临床用药评价（单药）
 * 若标题包含"的临床用药评价|用药评价|临床用药评价"，且不包含排除词，判定为 single_drug
 */
function checkClinicalEvaluationSingleDrug(point: KnowledgePoint): ClassificationResult | null {
  const title = point.point_name || point.title || ''
  const slug = (point as any).slug || ''
  const displayName = (point as any).display_name || ''
  
  const combinedTitle = `${title} ${slug} ${displayName}`.trim()
  if (!combinedTitle) return null
  
  const normalized = normalizeText(combinedTitle)
  
  // 检查是否包含"临床用药评价"相关关键词
  const evaluationPattern = /的临床用药评价|用药评价|临床用药评价/
  if (!evaluationPattern.test(normalized)) {
    return null
  }
  
  // 排除词：如果包含这些词，不判定为单药
  const exclusionKeywords = ['对比', '选择', '流程', '方案', '阶梯', '路径', '策略', '分类']
  const hasExclusion = exclusionKeywords.some(kw => normalized.includes(normalizeText(kw)))
  
  if (hasExclusion) {
    return null
  }
  
  // 匹配成功，返回 single_drug
  return {
    type: 'single_drug',
    confidence: 'high',
    matchedRules: ['title_clinical_evaluation_is_single_drug'],
  }
}

/**
 * 主分类函数：按优先级顺序检查规则
 */
export function inferExamPointType(point: KnowledgePoint): ClassificationResult {
  // 最高优先级：临床用药评价（单药）
  const clinicalEvalResult = checkClinicalEvaluationSingleDrug(point)
  if (clinicalEvalResult) {
    return clinicalEvalResult
  }
  
  // 按优先级顺序检查
  const checks = [
    checkSingleDrug,
    checkDrugClass,
    checkClinicalSelection,
    checkAdrInteraction,
  ]
  
  const results: ClassificationResult[] = []
  
  for (const check of checks) {
    const result = check(point)
    if (result) {
      results.push(result)
      // 如果高置信度，直接返回
      if (result.confidence === 'high') {
        return result
      }
    }
  }
  
  // 如果有多个规则匹配，标记为不确定
  if (results.length > 1) {
    const highConfidenceResults = results.filter(r => r.confidence === 'high')
    if (highConfidenceResults.length > 1) {
      // 多个高置信度结果，按优先级返回第一个，但标记为不确定
      return {
        ...results[0],
        uncertain: true,
        matchedRules: results.flatMap(r => r.matchedRules),
      }
    }
    
    // 返回置信度最高的
    results.sort((a, b) => {
      const order = { high: 3, medium: 2, low: 1 }
      return order[b.confidence] - order[a.confidence]
    })
    
    return {
      ...results[0],
      uncertain: results.length > 1,
      matchedRules: results.flatMap(r => r.matchedRules),
    }
  }
  
  // 如果只有一个结果，返回它
  if (results.length === 1) {
    return results[0]
  }
  
  // 默认：mechanism_basic
  return {
    type: 'mechanism_basic',
    confidence: 'low',
    matchedRules: ['default_fallback'],
  }
}

/**
 * 测试示例 / Test Examples
 * 
 * 以下是一些测试用例的预期输出：
 * 
 * 1. "拉莫三嗪的临床用药评价"
 *    => { type: 'single_drug', confidence: 'high', matchedRules: ['title_clinical_evaluation_is_single_drug'] }
 * 
 * 2. "抗癫痫药的特殊人群用药"
 *    => { type: 'adr_interaction', confidence: 'high', matchedRules: ['title_contains_adr_keywords'] }
 * 
 * 3. "药物分类与作用机制"
 *    => { type: 'drug_class', confidence: 'high', matchedRules: ['title_contains_class_keywords'] }
 * 
 * 4. "二代钙通道阻滞剂的对比"
 *    => { type: 'drug_class', confidence: 'high', matchedRules: ['title_contains_class_keywords'] }
 *    注意：虽然包含"对比"，但"二代...类"的"类"字会触发 drug_class 规则
 * 
 * 5. "某疾病的药物选择"
 *    => { type: 'clinical_selection', confidence: 'high', matchedRules: ['title_contains_selection_keywords'] }
 * 
 * 6. "考点6 拉莫三嗪的临床用药评价"
 *    => { type: 'single_drug', confidence: 'high', matchedRules: ['title_clinical_evaluation_is_single_drug'] }
 * 
 * 7. "药物的临床用药评价与选择"
 *    => { type: 'clinical_selection', confidence: 'high', matchedRules: ['title_contains_selection_keywords'] }
 *    注意：包含"选择"排除词，所以不会匹配 single_drug 规则
 */

