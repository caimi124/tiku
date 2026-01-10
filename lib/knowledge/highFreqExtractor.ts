/**
 * 高频考法与易错点抽取器
 * High Frequency Patterns & Pitfalls Extractor
 * 
 * 从 point_content 中抽取高频考法和易错点（MVP版本，使用启发式规则）
 */

import type { ExamPointType } from './examPointType'

export interface ExtractionResult {
  hf_patterns: string[]
  pitfalls: string[]
  debug: {
    matched: string[]
  }
}

/**
 * 通用预处理：将内容拆分成候选句
 */
function splitIntoCandidateSentences(content: string): string[] {
  if (!content) return []

  // 按多种分隔符拆分
  const separators = [
    /\n+/,                    // 换行
    /[•·▪▫]\s*/,            // bullet points
    /[-–—]\s+/,              // 破折号
    /[①②③④⑤⑥⑦⑧⑨⑩]/,      // 圆圈数字
    /[(（]\d+[)）]\s*/,      // 括号数字 (1) (2)
    /\d+[\.、]\s+/,          // 数字编号 1. 2、
    /\|/,                     // 表格分隔符
  ]

  let sentences = [content]

  for (const sep of separators) {
    const newSentences: string[] = []
    for (const s of sentences) {
      newSentences.push(...s.split(sep))
    }
    sentences = newSentences
  }

  // 清理和过滤
  return sentences
    .map(s => s.trim())
    .filter(s => {
      // 过滤太短的句子（<5字）
      if (s.length < 5) return false
      // 过滤太长的句子（>140字）
      if (s.length > 140) return false
      // 过滤纯空白
      if (!s || /^\s*$/.test(s)) return false
      return true
    })
    .filter((s, idx, arr) => arr.indexOf(s) === idx) // 去重
}

/**
 * 检查句子是否包含关键词
 */
function containsKeywords(sentence: string, keywords: string[]): boolean {
  const normalized = sentence.toLowerCase().replace(/\s+/g, '')
  return keywords.some(keyword => normalized.includes(keyword.toLowerCase()))
}

/**
 * 检查句子是否包含冒号或编号（表示可能是要点）
 */
function hasStructure(sentence: string): boolean {
  return /[:：]/.test(sentence) || /^[①②③④⑤⑥⑦⑧⑨⑩\d]+[\.、]/.test(sentence.trim())
}

/**
 * 过滤弱句子（不含关键词且无结构）
 */
function isWeakSentence(sentence: string, keywords: string[]): boolean {
  const hasKeyword = containsKeywords(sentence, keywords)
  const hasStruct = hasStructure(sentence)
  return !hasKeyword && !hasStruct
}

/**
 * 过滤空壳句/标题句
 */
function filterEmptyShells(pitfall: string): boolean {
  const trimmed = pitfall.trim()
  
  if (!trimmed || trimmed.length === 0) {
    return false
  }
  
  // 删除纯标题句（包含即剔除）
  const emptyShells = [
    '典型不良反应',
    '药物相互作用',
    '禁忌',
    '注意事项',
  ]
  
  // 检查是否完全匹配空壳句
  for (const shell of emptyShells) {
    // 完全匹配
    if (trimmed === shell || trimmed === `${shell}：` || trimmed === `${shell}:`) {
      return false
    }
    
    // 如果句子以这些标题开头
    if (trimmed.startsWith(shell)) {
      const afterShell = trimmed.substring(shell.length).trim()
      
      // 匹配 "典型不良反应..." 或 "典型不良反应：..."（后面只有省略号）
      if (afterShell.length === 0 || /^[：:]?\s*\.{1,3}$/.test(afterShell) || /^\.{1,3}$/.test(afterShell)) {
        return false
      }
      
      // 匹配 "典型不良反应与禁忌" 这种标题组合（长度短且后面是另一个空壳句）
      if (trimmed.length <= shell.length + 10) {
        // 检查后面是否主要是另一个空壳句
        if (/^[与和及、]\s*/.test(afterShell)) {
          const afterConnector = afterShell.replace(/^[与和及、]\s*/, '').trim()
          if (emptyShells.some(s => afterConnector === s || afterConnector.startsWith(s))) {
            return false
          }
        }
        // 如果后面直接是另一个空壳句
        if (emptyShells.some(s => afterShell === s || afterShell.startsWith(s))) {
          return false
        }
      }
      
      // 如果后面内容很少（<= 5 字符），可能是标题句
      if (afterShell.length <= 5) {
        return false
      }
    }
  }
  
  // 以 "..." 结尾且长度 < 12 的句子
  if (trimmed.length < 12 && /\.{2,}$/.test(trimmed)) {
    return false
  }
  
  // 仅由标题/冒号组成的句子（如 "不良反应："），匹配 1-15 个字符 + 冒号 + 可选空白
  if (/^[^：:]{1,15}[：:]\s*$/.test(trimmed) || /^[^：:]{1,15}[：:]\s*\.{0,3}$/.test(trimmed)) {
    return false
  }
  
  return true
}

/**
 * 压缩 pitfalls：简化内容，使其像错误点提示而不是教材描述
 */
function compressPitfall(pitfall: string): string {
  let processed = pitfall.trim()
  
  // 先处理标题+冒号的情况：如果以空壳句开头，提取冒号后的内容
  const emptyShells = ['典型不良反应', '药物相互作用', '禁忌', '注意事项']
  for (const shell of emptyShells) {
    if (processed.startsWith(shell)) {
      const afterShell = processed.substring(shell.length).trim()
      // 如果后面是冒号，提取冒号后的内容
      if (afterShell.startsWith('：') || afterShell.startsWith(':')) {
        processed = afterShell.substring(1).trim()
        break
      }
      // 如果后面直接是内容（没有冒号），保留原样
      // 但如果后面只有省略号或很短，说明是空壳句，应该被前面的过滤函数过滤掉
    }
  }
  
  // 1. 去掉括号内容（中英文括号都去），只保留括号前主干
  processed = processed.replace(/[（(][^）)]+[）)]/g, '')
  processed = processed.replace(/\([^)]+\)/g, '')
  
  // 2. 去掉“可致/主要表现为/可能出现/发生”等口水词
  const fillerWords = [
    /可致/g,
    /主要表现为/g,
    /可能出现/g,
    /可能发生/g,
    /可能引起/g,
    /可能导致/g,
    /可能造成/g,
    /表现为/g,
    /出现/g,
    /发生/g,
    /引起/g,
    /导致/g,
    /造成/g,
    /包括/g,
  ]
  
  for (const pattern of fillerWords) {
    processed = processed.replace(pattern, '')
  }
  
  // 清理多余空格和标点
  processed = processed.replace(/\s+/g, ' ').trim()
  processed = processed.replace(/^[：:]\s*/, '') // 去掉开头的冒号
  processed = processed.replace(/^[，、]\s*/, '') // 去掉开头的逗号、顿号
  
  // 3. 截断到 45 个汉字以内（超过就截断并去掉句尾省略号）
  if (processed.length > 45) {
    processed = processed.substring(0, 45)
    // 去掉末尾的省略号、逗号、顿号等
    processed = processed.replace(/[。，、…\.]{1,3}$/, '')
  }
  
  return processed.trim()
}

/**
 * 计算风险强度分数（用于排序）
 */
function getRiskScore(pitfall: string): number {
  const normalized = pitfall.toLowerCase()
  let score = 0
  
  // 风险强度关键词优先级
  const riskKeywords = [
    { word: '致死', score: 100 },
    { word: '严重', score: 90 },
    { word: '禁用', score: 85 },
    { word: '慎用', score: 80 },
    { word: '风险', score: 75 },
    { word: '出血', score: 70 },
    { word: '肝毒性', score: 65 },
    { word: '致畸', score: 60 },
    { word: 'qt', score: 55 },
    { word: '癫痫加重', score: 50 },
    { word: '昏迷', score: 45 },
  ]
  
  for (const { word, score: keywordScore } of riskKeywords) {
    if (normalized.includes(word)) {
      score = Math.max(score, keywordScore)
    }
  }
  
  return score
}

/**
 * 后处理 pitfalls：优化长度和格式
 */
function postProcessPitfalls(pitfalls: string[]): string[] {
  // A) 过滤空壳句/标题句
  let filtered = pitfalls.filter(filterEmptyShells)
  
  // B) 压缩每条 pitfalls
  filtered = filtered.map(compressPitfall)
  
  // 再次过滤：确保压缩后仍然有效
  filtered = filtered.filter(p => {
    if (!p || p.length < 3) return false
    // 再次检查是否是空壳句
    return filterEmptyShells(p)
  })
  
  // C) 数量控制：保持 2~4 条，按风险强度排序
  if (filtered.length > 4) {
    // 按风险强度排序，取前 4 条
    filtered = filtered
      .map(p => ({ text: p, score: getRiskScore(p) }))
      .sort((a, b) => b.score - a.score) // 降序
      .slice(0, 4)
      .map(item => item.text)
  } else if (filtered.length < 2 && filtered.length > 0) {
    // 如果只有 1 条，保留它（会在后续机制中补充）
  }
  
  return filtered
}

/**
 * 从 pitfalls 中抽取并改写为考试问法
 */
function convertPitfallsToExamQuestions(
  pitfalls: string[],
  drugName?: string
): string[] {
  const examQuestions: string[] = []
  const drug = drugName || '该药物'

  for (const pitfall of pitfalls) {
    const normalized = pitfall.toLowerCase()
    
    // 检查是否包含关键风险点
    if (/不良反应|副作用|毒性|肝毒性|肾毒性|心脏毒性/.test(normalized)) {
      const question = `关于${drug}的不良反应，易考点包括？`
      if (!examQuestions.includes(question)) {
        examQuestions.push(question)
      }
    }
    
    if (/禁忌|禁用|慎用|不适用/.test(normalized)) {
      const question = `关于${drug}的用药安全性，下列说法正确的是？`
      if (!examQuestions.includes(question)) {
        examQuestions.push(question)
      }
    }
    
    if (/相互作用|联用|合用|配伍/.test(normalized)) {
      const question = `${drug}与哪些药物存在相互作用？`
      if (!examQuestions.includes(question)) {
        examQuestions.push(question)
      }
    }
    
    if (/剂量|用量|用量范围|最大剂量/.test(normalized)) {
      const question = `关于${drug}的用法用量，下列说法错误的是？`
      if (!examQuestions.includes(question)) {
        examQuestions.push(question)
      }
    }
    
    if (/特殊人群|儿童|妊娠|哺乳|老年|肝肾功能/.test(normalized)) {
      const question = `关于${drug}在特殊人群中的用药，下列说法正确的是？`
      if (!examQuestions.includes(question)) {
        examQuestions.push(question)
      }
    }
  }

  return examQuestions.slice(0, 3) // 最多生成 3 条
}

/**
 * 为 mechanism_basic 类型生成默认高频考法
 */
function generateDefaultMechanismHF(): string[] {
  return [
    '该类药物主要通过哪一机制发挥抗癫痫作用？',
    '该机制相关的典型药物包括？',
  ]
}

/**
 * 为 mechanism_basic 类型生成默认易错点
 */
function generateDefaultMechanismPitfalls(): string[] {
  return [
    '易与相似机制混淆，需区分作用靶点差异',
    '不直接影响传统通路，注意机制特异性',
  ]
}

/**
 * 优先保留考试易错判断型表述
 */
function prioritizeExamErrorJudgments(pitfalls: string[]): string[] {
  const prioritized: string[] = []
  const others: string[] = []

  for (const pitfall of pitfalls) {
    // 检查是否是考试易错判断型
    const isJudgmentType = 
      /与.+合用.*增加|与.+合用.*减少|与.+合用.*禁忌/.test(pitfall) ||
      /\d+.*岁以下.*禁用/.test(pitfall) ||
      /\d+.*岁以下.*慎用/.test(pitfall) ||
      /妊娠.*禁用|哺乳.*禁用/.test(pitfall) ||
      /增加.*毒性|减少.*毒性/.test(pitfall)

    if (isJudgmentType) {
      prioritized.push(pitfall)
    } else {
      others.push(pitfall)
    }
  }

  // 优先返回判断型，然后是其他
  return [...prioritized, ...others].slice(0, 6)
}

/**
 * 抽取高频考法和易错点
 */
export function extractHighFreqAndPitfalls(
  point_content: string,
  exam_point_type: ExamPointType | null | undefined,
  point_name?: string
): ExtractionResult {
  const result: ExtractionResult = {
    hf_patterns: [],
    pitfalls: [],
    debug: {
      matched: [],
    },
  }

  if (!point_content) {
    // 如果是 mechanism_basic 且无内容，生成默认值
    if (exam_point_type === 'mechanism_basic') {
      result.hf_patterns = generateDefaultMechanismHF()
      result.pitfalls = generateDefaultMechanismPitfalls()
      result.debug.matched.push('[DEFAULT] mechanism_basic default generated')
    }
    return result
  }

  // 通用预处理
  const candidates = splitIntoCandidateSentences(point_content)

  // 根据类型定义关键词
  const hfKeywords: string[] = []
  const pitfallKeywords: string[] = []

  switch (exam_point_type) {
    case 'single_drug':
      hfKeywords.push(
        '作用特点',
        '临床应用',
        '适应证',
        '适应症',
        '一句话骨干',
        '用法用量',
        '机制',
        '药理作用',
        '作用机制',
        '特点',
        '优势'
      )
      pitfallKeywords.push(
        '禁忌',
        '慎用',
        '监测',
        '相互作用',
        'qt',
        '尖端扭转',
        '肝毒性',
        '肾毒性',
        '不良反应',
        '副作用',
        '妊娠',
        '哺乳',
        '儿童',
        '老年',
        '注意事项',
        '剂量',
        '特殊人群'
      )
      break

    case 'drug_class':
      hfKeywords.push(
        '分类',
        '代表药',
        '一代',
        '二代',
        '三代',
        '分型',
        'i类',
        'ii类',
        'iii类',
        'iv类',
        '对比',
        '机制差异',
        '区别',
        '各类',
        '分类依据'
      )
      pitfallKeywords.push(
        '易混',
        '区别',
        '不推荐',
        '首选',
        '禁忌',
        '相互作用',
        '反射性',
        '心动过速',
        '慎用',
        '混淆'
      )
      break

    case 'clinical_selection':
      hfKeywords.push(
        '首选',
        '一线',
        '二线',
        '替代',
        '联合',
        '方案',
        '阶梯',
        '路径',
        '流程',
        '治疗目标',
        '用药选择',
        '临床选择',
        '指南'
      )
      pitfallKeywords.push(
        '禁用',
        '不推荐',
        '合并症',
        '特殊人群',
        '监测',
        '注意事项',
        '禁忌',
        '慎用'
      )
      break

    case 'adr_interaction':
      hfKeywords.push(
        '共性不良反应',
        '典型不良反应',
        '高风险',
        '相互作用',
        '联用',
        '毒性',
        '解救',
        '不良反应',
        '副作用',
        '药物相互作用'
      )
      pitfallKeywords.push(
        '严重',
        '致命',
        '必须监测',
        '禁忌联用',
        '警示',
        '黑框',
        '风险',
        '高危'
      )
      break

    case 'mechanism_basic':
      hfKeywords.push(
        '机制',
        '靶点',
        '受体',
        '通道',
        '选择性',
        '药动学',
        'cyp',
        '半衰期',
        '代谢',
        '作用机制',
        '药理'
      )
      // mechanism_basic 的易错点较少，留空
      pitfallKeywords.push()
      break

    default:
      // 默认：使用通用关键词
      hfKeywords.push(
        '作用',
        '机制',
        '特点',
        '应用',
        '适应证',
        '用法',
        '分类',
        '代表'
      )
      pitfallKeywords.push(
        '禁忌',
        '不良反应',
        '相互作用',
        '注意事项',
        '慎用'
      )
  }

  // 抽取高频考法
  for (const candidate of candidates) {
    if (hfKeywords.length > 0 && containsKeywords(candidate, hfKeywords)) {
      if (result.hf_patterns.length < 6) {
        result.hf_patterns.push(candidate)
        result.debug.matched.push(`[HF] ${candidate.substring(0, 50)}...`)
      }
    }
  }

  // 抽取易错点（在抽取阶段就过滤空壳句）
  for (const candidate of candidates) {
    // 先过滤空壳句
    if (!filterEmptyShells(candidate)) {
      continue
    }
    
    if (pitfallKeywords.length > 0 && containsKeywords(candidate, pitfallKeywords)) {
      if (result.pitfalls.length < 6) {
        result.pitfalls.push(candidate)
        result.debug.matched.push(`[PIT] ${candidate.substring(0, 50)}...`)
      }
    }
  }

  // 如果高频考法不足，尝试用有结构的句子补充
  if (result.hf_patterns.length < 3 && hfKeywords.length > 0) {
    for (const candidate of candidates) {
      if (result.hf_patterns.length >= 6) break
      if (result.hf_patterns.includes(candidate)) continue
      if (hasStructure(candidate) && !isWeakSentence(candidate, hfKeywords)) {
        result.hf_patterns.push(candidate)
      }
    }
  }

  // 如果易错点不足，尝试用有结构的句子补充（也要过滤空壳句）
  if (result.pitfalls.length < 3 && pitfallKeywords.length > 0) {
    for (const candidate of candidates) {
      if (result.pitfalls.length >= 6) break
      if (result.pitfalls.includes(candidate)) continue
      // 过滤空壳句
      if (!filterEmptyShells(candidate)) continue
      if (hasStructure(candidate) && !isWeakSentence(candidate, pitfallKeywords)) {
        result.pitfalls.push(candidate)
      }
    }
  }

  // 去重
  result.hf_patterns = Array.from(new Set(result.hf_patterns))
  result.pitfalls = Array.from(new Set(result.pitfalls))

  // 后处理 pitfalls：先过滤空壳句，再优先级排序，最后压缩和数量控制
  // 第一步：在抽取阶段就过滤明显的空壳句
  result.pitfalls = result.pitfalls.filter(filterEmptyShells)
  
  // 第二步：优先级排序（保留考试易错判断型）
  result.pitfalls = prioritizeExamErrorJudgments(result.pitfalls)
  
  // 第三步：压缩和最终过滤、数量控制
  result.pitfalls = postProcessPitfalls(result.pitfalls)

  // 兜底规则 1：如果 hf_patterns < 2，从 pitfalls 中改写生成
  if (result.hf_patterns.length < 2 && result.pitfalls.length > 0) {
    // 提取药名（从 point_name 中提取，去除"的临床用药评价"等后缀）
    const drugName = point_name
      ? point_name.replace(/的临床用药评价|的用药评价|临床用药评价|用药评价$/, '').trim()
      : undefined

    const convertedQuestions = convertPitfallsToExamQuestions(result.pitfalls, drugName)
    for (const question of convertedQuestions) {
      if (result.hf_patterns.length < 2) {
        // 添加标签并限制长度
        let formattedQuestion = question
        if (question.includes('安全性') || question.includes('禁忌')) {
          formattedQuestion = `【高频考法·安全性】${question}`
        } else if (question.includes('不良反应')) {
          formattedQuestion = `【高频考法·不良反应】${question}`
        } else if (question.includes('相互作用')) {
          formattedQuestion = `【高频考法·相互作用】${question}`
        } else {
          formattedQuestion = `【高频考法】${question}`
        }
        
        // 限制长度 ≤ 40 字
        if (formattedQuestion.length > 40) {
          formattedQuestion = formattedQuestion.substring(0, 37) + '...'
        }
        
        result.hf_patterns.push(formattedQuestion)
        result.debug.matched.push(`[HF-FALLBACK] ${formattedQuestion}`)
      }
    }
  }

  // 兜底规则 2：mechanism_basic 类型强制生成
  if (exam_point_type === 'mechanism_basic') {
    if (result.hf_patterns.length === 0) {
      result.hf_patterns = generateDefaultMechanismHF()
      result.debug.matched.push('[DEFAULT] mechanism_basic HF generated')
    } else if (result.hf_patterns.length < 2) {
      // 补充到至少 2 条
      const defaults = generateDefaultMechanismHF()
      for (const def of defaults) {
        if (result.hf_patterns.length < 2 && !result.hf_patterns.includes(def)) {
          result.hf_patterns.push(def)
        }
      }
    }

    if (result.pitfalls.length === 0) {
      result.pitfalls = generateDefaultMechanismPitfalls()
      result.debug.matched.push('[DEFAULT] mechanism_basic pitfalls generated')
    } else if (result.pitfalls.length < 2) {
      // 补充到至少 2 条
      const defaults = generateDefaultMechanismPitfalls()
      for (const def of defaults) {
        if (result.pitfalls.length < 2 && !result.pitfalls.includes(def)) {
          result.pitfalls.push(def)
        }
      }
    }
  }

  // 最终保证：hf_patterns 至少 2 条（如果可能）
  if (result.hf_patterns.length < 2 && result.pitfalls.length > 0) {
    // 再次尝试从 pitfalls 改写
    const drugName = point_name
      ? point_name.replace(/的临床用药评价|的用药评价|临床用药评价|用药评价$/, '').trim()
      : '该药物'
    
    const additionalQuestions = convertPitfallsToExamQuestions(
      result.pitfalls.slice(0, 2),
      drugName
    )
    
    for (const question of additionalQuestions) {
      if (result.hf_patterns.length < 2) {
        let formattedQuestion = `【高频考法】${question}`
        if (formattedQuestion.length > 40) {
          formattedQuestion = formattedQuestion.substring(0, 37) + '...'
        }
        if (!result.hf_patterns.includes(formattedQuestion)) {
          result.hf_patterns.push(formattedQuestion)
        }
      }
    }
  }

  // 最终去重
  result.hf_patterns = Array.from(new Set(result.hf_patterns))
  result.pitfalls = Array.from(new Set(result.pitfalls))

  return result
}

/**
 * 将数组转换为多行文本格式（用于写库）
 */
export function formatForDatabase(items: string[]): string {
  if (items.length === 0) return ''
  return items.map(item => `- ${item.trim()}`).join('\n')
}

/**
 * 将多行文本格式转换为数组（用于读取）
 */
export function parseFromDatabase(text: string | null | undefined): string[] {
  if (!text) return []
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('- '))
    .map(line => line.substring(2).trim())
    .filter(line => line.length > 0)
}

