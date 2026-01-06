/**
 * 结构骨架固定模板
 * 
 * 核心原则：
 * 1. 结构骨架基于考点类型使用固定模板，不依赖 content 自动生成
 * 2. content 仅作为填充信息，不能决定结构本身
 * 3. 所有考点类型都必须有结构骨架
 */

export interface StructureSection {
  id: string
  title: string
  items: Array<{ id: string; text: string; placeholder?: boolean }>
}

export type StructurePointType = 'specific_drug' | 'drug_class' | 'structure_only' | 'strategy'

/**
 * 根据考点类型获取固定结构模板
 */
export function getStructureTemplate(pointType: StructurePointType): StructureSection[] {
  switch (pointType) {
    case 'specific_drug':
      return [
        {
          id: 'template-section-1',
          title: '药理作用 / 作用特点',
          items: [
            { id: 'template-item-1-1', text: '待补充', placeholder: true }
          ]
        },
        {
          id: 'template-section-2',
          title: '临床应用',
          items: [
            { id: 'template-item-2-1', text: '待补充', placeholder: true }
          ]
        },
        {
          id: 'template-section-3',
          title: '用药注意事项',
          items: [
            { id: 'template-item-3-1', text: '待补充', placeholder: true }
          ]
        },
        {
          id: 'template-section-4',
          title: '监测要点 / 不良反应',
          items: [
            { id: 'template-item-4-1', text: '待补充', placeholder: true }
          ]
        }
      ]

    case 'drug_class':
      return [
        {
          id: 'template-section-1',
          title: '分类依据',
          items: [
            { id: 'template-item-1-1', text: '待补充', placeholder: true }
          ]
        },
        {
          id: 'template-section-2',
          title: '各类代表药物',
          items: [
            { id: 'template-item-2-1', text: '待补充', placeholder: true }
          ]
        },
        {
          id: 'template-section-3',
          title: '临床用药评价（首选 / 不推荐）',
          items: [
            { id: 'template-item-3-1', text: '待补充', placeholder: true }
          ]
        },
        {
          id: 'template-section-4',
          title: '常见对比考法',
          items: [
            { id: 'template-item-4-1', text: '待补充', placeholder: true }
          ]
        }
      ]

    case 'structure_only':
      return [
        {
          id: 'template-section-1',
          title: '基本概念',
          items: [
            { id: 'template-item-1-1', text: '待补充', placeholder: true }
          ]
        },
        {
          id: 'template-section-2',
          title: '内部分类',
          items: [
            { id: 'template-item-2-1', text: '待补充', placeholder: true }
          ]
        },
        {
          id: 'template-section-3',
          title: '核心差异',
          items: [
            { id: 'template-item-3-1', text: '待补充', placeholder: true }
          ]
        }
      ]

    case 'strategy':
      return [
        {
          id: 'template-section-1',
          title: '重点考查内容',
          items: [
            { id: 'template-item-1-1', text: '待补充', placeholder: true }
          ]
        },
        {
          id: 'template-section-2',
          title: '次要内容',
          items: [
            { id: 'template-item-2-1', text: '待补充', placeholder: true }
          ]
        },
        {
          id: 'template-section-3',
          title: '不常考内容',
          items: [
            { id: 'template-item-3-1', text: '待补充', placeholder: true }
          ]
        }
      ]

    default:
      // 默认使用 structure_only 模板
      return getStructureTemplate('structure_only')
  }
}

/**
 * 从 content 中提取信息填充到固定结构模板
 * 注意：此函数只填充内容，不改变结构本身
 */
export function fillStructureFromContent(
  template: StructureSection[],
  content: string
): StructureSection[] {
  if (!content) return template

  // 创建副本，避免修改原模板
  const filled = template.map(section => ({
    ...section,
    items: [...section.items]
  }))

  const lines = content.split('\n')
  const contentLower = content.toLowerCase()

  // 根据 section title 匹配 content 中的相关信息
  for (const section of filled) {
    const sectionTitle = section.title.toLowerCase()

    // 匹配关键词
    let matchedItems: string[] = []

    if (sectionTitle.includes('药理作用') || sectionTitle.includes('作用特点') || sectionTitle.includes('作用机制')) {
      // 查找机制相关描述
      for (const line of lines) {
        if (/机制|作用|特点|通过|抑制|激活/.test(line) && line.length > 10 && line.length < 200) {
          matchedItems.push(line.trim())
        }
      }
    } else if (sectionTitle.includes('临床应用')) {
      // 查找临床应用相关描述
      for (const line of lines) {
        if (/临床|应用|用于|治疗|适用于|适应证/.test(line) && line.length > 10 && line.length < 200) {
          matchedItems.push(line.trim())
        }
      }
    } else if (sectionTitle.includes('用药注意事项') || sectionTitle.includes('注意事项')) {
      // 查找用药注意事项相关描述
      for (const line of lines) {
        if (/注意|注意事|用药|慎用|避免|禁忌/.test(line) && line.length > 10 && line.length < 200) {
          matchedItems.push(line.trim())
        }
      }
    } else if (sectionTitle.includes('监测要点') || sectionTitle.includes('不良反应')) {
      // 查找监测要点或不良反应相关描述
      for (const line of lines) {
        if (/监测|不良反应|副作用|毒性|注意观察/.test(line) && line.length > 10 && line.length < 200) {
          matchedItems.push(line.trim())
        }
      }
    } else if (sectionTitle.includes('适应证') || sectionTitle.includes('适应症')) {
      // 查找适应证相关描述（兼容旧模板）
      for (const line of lines) {
        if (/适应|用于|治疗|适用于/.test(line) && line.length > 10 && line.length < 200) {
          matchedItems.push(line.trim())
        }
      }
    } else if (sectionTitle.includes('禁忌')) {
      // 查找禁忌相关描述（兼容旧模板）
      for (const line of lines) {
        if (/禁忌|禁用|禁止|不适用|避免/.test(line) && line.length > 10 && line.length < 200) {
          matchedItems.push(line.trim())
        }
      }
    } else if (sectionTitle.includes('相互作用')) {
      // 查找相互作用相关描述（兼容旧模板）
      for (const line of lines) {
        if (/相互作用|配伍|联合|合用|禁忌/.test(line) && line.length > 10 && line.length < 200) {
          matchedItems.push(line.trim())
        }
      }
    } else if (sectionTitle.includes('分类依据')) {
      // 查找分类相关描述
      for (const line of lines) {
        if (/分类|分为|依据|按|根据/.test(line) && line.length > 10 && line.length < 200) {
          matchedItems.push(line.trim())
        }
      }
    } else if (sectionTitle.includes('代表药物')) {
      // 查找药物名称
      for (const line of lines) {
        if (/药物|药品|代表|常用/.test(line) && line.length > 10 && line.length < 200) {
          matchedItems.push(line.trim())
        }
      }
    } else if (sectionTitle.includes('临床用药评价') || sectionTitle.includes('首选')) {
      // 查找用药评价相关描述
      for (const line of lines) {
        if (/首选|推荐|不推荐|适用|评价/.test(line) && line.length > 10 && line.length < 200) {
          matchedItems.push(line.trim())
        }
      }
    } else if (sectionTitle.includes('对比')) {
      // 查找对比相关描述
      for (const line of lines) {
        if (/对比|比较|区别|差异|不同/.test(line) && line.length > 10 && line.length < 200) {
          matchedItems.push(line.trim())
        }
      }
    } else if (sectionTitle.includes('基本概念')) {
      // 查找概念相关描述
      for (const line of lines) {
        if (/概念|定义|是指|指的是/.test(line) && line.length > 10 && line.length < 200) {
          matchedItems.push(line.trim())
        }
      }
    } else if (sectionTitle.includes('内部分类')) {
      // 查找分类相关描述
      for (const line of lines) {
        if (/分类|分为|类型|种类/.test(line) && line.length > 10 && line.length < 200) {
          matchedItems.push(line.trim())
        }
      }
    } else if (sectionTitle.includes('核心差异')) {
      // 查找差异相关描述
      for (const line of lines) {
        if (/差异|不同|区别|特点/.test(line) && line.length > 10 && line.length < 200) {
          matchedItems.push(line.trim())
        }
      }
    } else if (sectionTitle.includes('重点考查') || sectionTitle.includes('次要') || sectionTitle.includes('不常考')) {
      // 查找考试相关描述
      for (const line of lines) {
        if (/重点|高频|常考|次要|不常/.test(line) && line.length > 10 && line.length < 200) {
          matchedItems.push(line.trim())
        }
      }
    }

    // 如果有匹配的内容，替换占位符
    if (matchedItems.length > 0) {
      section.items = matchedItems.slice(0, 5).map((text, idx) => ({
        id: `filled-item-${section.id}-${idx}`,
        text: text.substring(0, 100), // 限制长度
        placeholder: false
      }))
    }
    // 如果没有匹配的内容，保持占位符
  }

  return filled
}

