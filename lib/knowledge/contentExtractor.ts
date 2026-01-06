/**
 * 从考点 content 中智能提取应试模块内容
 * 
 * 提取规则：
 * 1. 结构骨架：从 Markdown 表格、标题层级、列表项提取
 * 2. 高频考法：从对比结构、条件判断中提取
 * 3. 易错点：从因果关系、否定表达中提取
 * 4. 代表药物：从分类表或明确列表中提取
 */

import { hasClassificationTable } from '@/lib/contentUtils'

/**
 * 基于标题和类型生成默认结构骨架
 */
export function generateDefaultStructure(
  title: string,
  pointType: 'specific_drug' | 'drug_class' | 'exam_strategy' | 'structure_skeleton'
): ExtractedStructure | null {
  if (!title) return null

  // 对于药物分类类型，生成默认结构
  if (pointType === 'drug_class') {
    // 尝试从标题中提取分类信息
    const titleMatch = title.match(/(.+?)(?:类|分类|药物)/)
    const baseName = titleMatch ? titleMatch[1] : title

    return {
      sections: [
        {
          id: 'default-section-1',
          title: '分类依据',
          items: [
            { id: 'default-item-1-1', text: '按作用机制分类' },
            { id: 'default-item-1-2', text: '按选择性分类' },
            { id: 'default-item-1-3', text: '按临床应用分类' },
          ]
        },
        {
          id: 'default-section-2',
          title: '考试维度',
          items: [
            { id: 'default-item-2-1', text: '首选药物（高频考点）' },
            { id: 'default-item-2-2', text: '不推荐/禁忌情况' },
            { id: 'default-item-2-3', text: '同类药物对比' },
          ]
        }
      ]
    }
  }

  // 对于结构骨架类型
  if (pointType === 'structure_skeleton') {
    return {
      sections: [
        {
          id: 'default-section-1',
          title: '核心结构',
          items: [
            { id: 'default-item-1-1', text: '基本概念与定义' },
            { id: 'default-item-1-2', text: '分类体系' },
            { id: 'default-item-1-3', text: '关键特征' },
          ]
        }
      ]
    }
  }

  return null
}

export interface ExtractedStructure {
  sections: Array<{
    id: string
    title: string
    items: Array<{ id: string; text: string }>
  }>
}

export interface ExtractedExamPattern {
  patterns: string[]
  traps: string[]
}

export interface ExtractedDrug {
  name: string
  why?: string
}

/**
 * 从 content 中提取结构骨架
 */
export function extractStructureFromContent(content: string): ExtractedStructure | null {
  if (!content) return null

  const sections: ExtractedStructure['sections'] = []
  const lines = content.split('\n')

  // 方法1：从分类表格中提取
  if (hasClassificationTable(content)) {
    const tableLines = lines.filter(line => line.includes('|') && line.split('|').length >= 3)
    if (tableLines.length >= 2) {
      // 解析表头
      const headers = tableLines[0].split('|').map(h => h.trim()).filter(Boolean)
      const classificationCol = headers.findIndex(h => /分类|类型|种类|类别/.test(h))
      const drugCol = headers.findIndex(h => /药品|药物|代表药|药物名称/.test(h))

      if (classificationCol >= 0) {
        const classificationMap = new Map<string, string[]>()
        
        // 解析数据行
        for (let i = 1; i < tableLines.length; i++) {
          const cells = tableLines[i].split('|').map(c => c.trim()).filter(Boolean)
          if (cells[classificationCol] && cells[drugCol]) {
            const category = cells[classificationCol]
            const drug = cells[drugCol]
            if (!classificationMap.has(category)) {
              classificationMap.set(category, [])
            }
            classificationMap.get(category)!.push(drug)
          }
        }

        // 转换为 sections
        let sectionIdx = 0
        for (const [category, drugs] of classificationMap.entries()) {
          sections.push({
            id: `extracted-section-${sectionIdx++}`,
            title: category,
            items: drugs.map((drug, idx) => ({
              id: `extracted-item-${sectionIdx}-${idx}`,
              text: drug
            }))
          })
        }
      }
    }
  }

  // 方法2：从标题层级提取（## 或 ###）
  if (sections.length === 0) {
    let currentSection: ExtractedStructure['sections'][0] | null = null
    let sectionIdx = 0
    let itemIdx = 0

    for (const line of lines) {
      const trimmed = line.trim()
      
      // 检测二级标题（##）
      if (trimmed.startsWith('## ') && !trimmed.startsWith('###')) {
        if (currentSection) {
          sections.push(currentSection)
        }
        currentSection = {
          id: `extracted-section-${sectionIdx++}`,
          title: trimmed.replace(/^##\s+/, ''),
          items: []
        }
        itemIdx = 0
      }
      // 检测三级标题（###）或列表项（- 或 *）
      else if (currentSection && (
        trimmed.startsWith('### ') ||
        trimmed.startsWith('- ') ||
        trimmed.startsWith('* ') ||
        trimmed.startsWith('• ')
      )) {
        const itemText = trimmed.replace(/^(###\s+|-|\*|•)\s+/, '')
        if (itemText && itemText.length > 0) {
          currentSection.items.push({
            id: `extracted-item-${sectionIdx}-${itemIdx++}`,
            text: itemText
          })
        }
      }
    }

    if (currentSection && currentSection.items.length > 0) {
      sections.push(currentSection)
    }
  }

  // 方法3：从编号列表提取（1. 2. 3.）
  if (sections.length === 0) {
    const numberedItems: string[] = []
    for (const line of lines) {
      const match = line.match(/^\s*\d+[\.、]\s*(.+)/)
      if (match) {
        numberedItems.push(match[1].trim())
      }
    }

    if (numberedItems.length > 0) {
      sections.push({
        id: 'extracted-section-0',
        title: '分类结构',
        items: numberedItems.map((text, idx) => ({
          id: `extracted-item-0-${idx}`,
          text
        }))
      })
    }
  }

  // 方法4：从分类关键词提取（如"分为"、"包括"、"主要有"等）
  if (sections.length === 0) {
    const classificationKeywords = /(?:分为|包括|主要有|可分为|包括|主要分为|分为以下几类|分为以下|主要类型|主要类别)[：:]\s*([^。\n]+)/
    const classificationKeywords2 = /(?:分为|包括|主要有|可分为|包括|主要分为|分为以下几类|分为以下|主要类型|主要类别)\s*([^。\n]+)/
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.length < 10 || trimmed.length > 200) continue
      
      // 匹配"分为：A、B、C"或"包括A、B、C"
      let match = trimmed.match(classificationKeywords) || trimmed.match(classificationKeywords2)
      if (match) {
        const itemsText = match[1] || match[0]
        // 分割项目（支持中文顿号、逗号、分号）
        const items = itemsText
          .split(/[、，,；;]/)
          .map(item => item.trim())
          .filter(item => item.length > 0 && item.length < 50)
        
        if (items.length >= 2) {
          sections.push({
            id: 'extracted-section-0',
            title: '分类结构',
            items: items.map((text, idx) => ({
              id: `extracted-item-0-${idx}`,
              text
            }))
          })
          break
        }
      }
    }
  }

  // 方法5：从段落中提取关键分类信息（识别"第一类"、"第二类"等）
  if (sections.length === 0) {
    const categoryPattern = /(?:第[一二三四五六七八九十\d]+[类种]|[\d一二三四五六七八九十]+[\.、]\s*)([^。\n]{5,50})/g
    const categories: string[] = []
    
    for (const line of lines) {
      const matches = Array.from(line.matchAll(categoryPattern))
      for (const match of matches) {
        const text = match[1]?.trim()
        if (text && text.length >= 5 && text.length <= 50) {
          categories.push(text)
        }
      }
    }

    if (categories.length >= 2) {
      sections.push({
        id: 'extracted-section-0',
        title: '分类结构',
        items: categories.map((text, idx) => ({
          id: `extracted-item-0-${idx}`,
          text
        }))
      })
    }
  }

  // 方法6：从冒号后的列表提取（如"主要药物：A、B、C"）
  if (sections.length === 0) {
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.length < 10 || trimmed.length > 200) continue
      
      // 匹配"标题：项目1、项目2、项目3"
      const match = trimmed.match(/^([^：:]{2,20})[：:]\s*([^。\n]+)/)
      if (match) {
        const title = match[1].trim()
        const itemsText = match[2].trim()
        
        // 检查标题是否包含分类相关关键词
        if (/分类|类型|种类|类别|药物|药品/.test(title)) {
          const items = itemsText
            .split(/[、，,；;]/)
            .map(item => item.trim())
            .filter(item => item.length > 0 && item.length < 50)
          
          if (items.length >= 2) {
            sections.push({
              id: 'extracted-section-0',
              title: title,
              items: items.map((text, idx) => ({
                id: `extracted-item-0-${idx}`,
                text
              }))
            })
            break
          }
        }
      }
    }
  }

  return sections.length > 0 ? { sections } : null
}

/**
 * 从 content 中提取高频考法与易错点
 * 仅在存在对比结构 / 条件判断 / 否定表达时生成
 */
export function extractExamPatternsFromContent(
  content: string,
  pointType: 'specific_drug' | 'drug_class' | 'exam_strategy' | 'structure_skeleton'
): ExtractedExamPattern | null {
  if (!content || (pointType !== 'specific_drug' && pointType !== 'drug_class')) {
    return null
  }

  const patterns: string[] = []
  const traps: string[] = []
  const lines = content.split('\n')

  // 提取高频考法：从对比结构、条件判断中提取
  for (const line of lines) {
    const trimmed = line.trim()
    
    // 对比结构：A vs B、A 与 B 的区别、A 不同于 B
    if (/vs|与.*区别|不同于|对比|比较/.test(trimmed)) {
      const match = trimmed.match(/([^，。；]+)(?:vs|与|不同于|对比|比较)([^，。；]+)/)
      if (match) {
        const item1 = match[1].trim()
        const item2 = match[2].trim()
        if (item1 && item2 && item1.length < 50 && item2.length < 50) {
          patterns.push(`常考对比：${item1} vs ${item2}`)
        }
      }
    }

    // 条件判断：如果...则...、当...时...、...首选...
    if (/如果|当.*时|首选|优先选择/.test(trimmed)) {
      const match = trimmed.match(/(如果|当.*时|首选|优先选择)([^，。；]+)/)
      if (match && match[2] && match[2].length < 60) {
        patterns.push(`常考问法：${match[1]}${match[2]}`)
      }
    }

    // 机制差异：通过...机制、作用机制是...
    if (/机制|作用方式|通过.*实现/.test(trimmed) && /不同|区别|差异/.test(trimmed)) {
      const match = trimmed.match(/([^，。；]{10,50})(机制|作用方式)([^，。；]+)/)
      if (match && match[0].length < 80) {
        patterns.push(`常考问法：${match[0]}`)
      }
    }
  }

  // 提取易错点：从因果关系、否定表达中提取
  for (const line of lines) {
    const trimmed = line.trim()
    
    // 否定表达：不推荐、禁用、禁忌、避免
    if (/不推荐|禁用|禁忌|避免|禁止|不应/.test(trimmed)) {
      const match = trimmed.match(/([^，。；]+)(不推荐|禁用|禁忌|避免|禁止|不应)([^，。；]+)/)
      if (match) {
        const context = match[0].trim()
        if (context.length < 100) {
          traps.push(`常见误区是${context}，正确理解需参考教材原文`)
        }
      }
    }

    // 因果关系：导致、引起、造成
    if (/导致|引起|造成|产生/.test(trimmed) && /不良反应|副作用|毒性/.test(trimmed)) {
      const match = trimmed.match(/([^，。；]+)(导致|引起|造成|产生)([^，。；]+)/)
      if (match) {
        const context = match[0].trim()
        if (context.length < 100) {
          traps.push(`常见误区是${context}，正确理解是需注意因果关系`)
        }
      }
    }
  }

  // 限制：至少需要2条才返回
  if (patterns.length < 2 && traps.length < 2) {
    return null
  }

  return {
    patterns: patterns.slice(0, 6), // 最多6条
    traps: traps.slice(0, 6) // 最多6条
  }
}

/**
 * 从 content 中提取代表药物
 * 仅从分类表或明确列表中提取
 */
export function extractDrugsFromContent(content: string): ExtractedDrug[] {
  if (!content) return []

  const drugs: ExtractedDrug[] = []
  const lines = content.split('\n')

  // 已知常见药物名称（可根据实际情况扩展）
  const knownDrugs = [
    '阿司匹林', '对乙酰氨基酚', '布洛芬', '双氯芬酸', '吲哚美辛',
    '熊去氧胆酸', '乙酰半胱氨酸', '多烯磷脂酰胆碱', '联苯双酯',
    '考来烯胺', '考来替泊', '依折麦布', '非诺贝特', '阿托伐他汀',
    '美托洛尔', '卡托普利', '硝苯地平', '氢氯噻嗪', '螺内酯'
  ]

  // 方法1：从分类表格中提取
  if (hasClassificationTable(content)) {
    const tableLines = lines.filter(line => line.includes('|') && line.split('|').length >= 3)
    if (tableLines.length >= 2) {
      const headers = tableLines[0].split('|').map(h => h.trim()).filter(Boolean)
      const drugCol = headers.findIndex(h => /药品|药物|代表药|药物名称/.test(h))

      if (drugCol >= 0) {
        const extractedDrugs = new Set<string>()
        for (let i = 1; i < tableLines.length; i++) {
          const cells = tableLines[i].split('|').map(c => c.trim()).filter(Boolean)
          if (cells[drugCol]) {
            const drugName = cells[drugCol]
            // 检查是否是已知药物或包含常见药物关键词
            if (knownDrugs.some(d => drugName.includes(d)) || 
                /[药酸酯胺素]/g.test(drugName)) {
              extractedDrugs.add(drugName)
            }
          }
        }

        for (const drugName of extractedDrugs) {
          drugs.push({
            name: drugName,
            why: '本类药物中的代表药物，考试中常用来区分不同类别或对比作用特点。'
          })
        }
      }
    }
  }

  // 方法2：从明确列表提取（如"代表药物：A、B、C"）
  if (drugs.length === 0) {
    for (const line of lines) {
      const match = line.match(/(代表药|代表药物|常用药|主要药物)[：:]\s*([^，。；\n]+)/)
      if (match) {
        const drugList = match[2].split(/[、，,]/).map(d => d.trim()).filter(Boolean)
        for (const drugName of drugList) {
          if (drugName.length < 20 && knownDrugs.some(d => drugName.includes(d) || drugName.includes('药'))) {
            drugs.push({
              name: drugName,
              why: '本类药物中的代表药物，考试中常用来区分不同类别或对比作用特点。'
            })
          }
        }
      }
    }
  }

  return drugs.slice(0, 5) // 最多5个
}

/**
 * 基于标题和类型生成默认高频考法与易错点
 */
export function generateDefaultExamPatterns(
  title: string,
  pointType: 'specific_drug' | 'drug_class' | 'exam_strategy' | 'structure_skeleton'
): ExtractedExamPattern | null {
  if (pointType !== 'specific_drug' && pointType !== 'drug_class') {
    return null
  }

  // 对于药物分类类型，生成默认的高频考法和易错点
  if (pointType === 'drug_class') {
    return {
      patterns: [
        '常考问法：题干问"首选药物"时，需根据疾病类型和患者情况选择',
        '常考对比：不同类别药物的作用机制差异（如选择性、作用部位）',
      ],
      traps: [
        '常见误区是将所有同类药物视为完全等同，正确理解是需区分各药物的特异性适应症和禁忌',
        '常见误区是忽略药物相互作用，正确理解是需掌握同类药物之间的配伍禁忌',
      ],
    }
  }

  // 对于具体必考药物类型
  if (pointType === 'specific_drug') {
    return {
      patterns: [
        '如果题干问适应证，选该药物的主要临床应用',
        '题干出现特定疾病时，首选该药物（需结合禁忌判断）',
      ],
      traps: [
        '常见误区是混淆适应证与禁忌证，正确理解是需明确区分适用人群和禁用人群',
        '常见误区是忽略药物相互作用，正确理解是需掌握与其他药物的配伍禁忌',
      ],
    }
  }

  return null
}

/**
 * 从 content 中生成学习建议
 */
export function generateStudyAdviceFromContent(
  content: string,
  pointType: 'specific_drug' | 'drug_class' | 'exam_strategy' | 'structure_skeleton'
): string | null {
  if (!content) return null

  // 根据考点类型和内容特征生成建议
  if (pointType === 'drug_class') {
    // 检查是否有对比内容
    if (/对比|比较|区别|差异/.test(content)) {
      return '本考点侧重对比不同类别的药物特点，建议通过对比表格记忆各类药物的核心差异。'
    }
    // 检查是否有分类内容
    if (/分类|类型|种类/.test(content)) {
      return '本考点侧重分类记忆，建议先建立分类框架，再记忆各类代表药物。'
    }
    return '本考点建议侧重对比和情境判断，通过做题巩固各类药物的应用场景。'
  }

  if (pointType === 'exam_strategy') {
    return '本考点建议结合真题练习，掌握考试出题规律和答题技巧。'
  }

  if (pointType === 'structure_skeleton') {
    return '本考点建议先建立整体框架，再填充具体细节，通过思维导图辅助记忆。'
  }

  return null
}

