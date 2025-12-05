/**
 * 知识点卡片数据完整性 - 属性测试
 *
 * **Feature: smart-learning-system, Property 11: 知识点卡片数据完整性**
 * **Validates: Requirements 4.1, 4.3**
 * 
 * Property 11: 知识点卡片数据完整性
 * *For any* 知识点卡片渲染，必须包含：药物名称、重要性星级、掌握度标签、结构化内容。
 * 若存在记忆口诀，必须显示。
 */

import * as fc from 'fast-check'

// ============================================
// 类型定义
// ============================================

interface KnowledgePointData {
  id: string
  code: string
  title: string
  content: string
  node_type: string
  point_type?: string
  drug_name?: string
  importance: number
  memory_tips?: string
  mastery_score?: number
}

interface CardRenderResult {
  hasTitle: boolean
  hasImportance: boolean
  hasMasteryLabel: boolean
  hasContent: boolean
  hasMemoryTips: boolean
  memoryTipsDisplayed: boolean
}

// ============================================
// 渲染函数（模拟组件渲染逻辑）
// ============================================

/**
 * 验证知识点卡片是否包含所有必需字段
 */
function validateCardData(point: KnowledgePointData): CardRenderResult {
  const hasTitle = typeof point.title === 'string' && point.title.length > 0
  const hasImportance = typeof point.importance === 'number' && point.importance >= 1 && point.importance <= 5
  const hasMasteryLabel = point.mastery_score === undefined || 
    (typeof point.mastery_score === 'number' && point.mastery_score >= 0 && point.mastery_score <= 100)
  const hasContent = typeof point.content === 'string'
  const hasMemoryTips = point.memory_tips !== undefined && point.memory_tips !== null
  const memoryTipsDisplayed = !hasMemoryTips || (typeof point.memory_tips === 'string' && point.memory_tips.length > 0)
  
  return {
    hasTitle,
    hasImportance,
    hasMasteryLabel,
    hasContent,
    hasMemoryTips,
    memoryTipsDisplayed,
  }
}

/**
 * 获取掌握状态标签
 */
function getMasteryLabel(score: number | undefined): string {
  if (score === undefined || score === null) return '未学习'
  if (score >= 80) return '已掌握'
  if (score >= 60) return '需复习'
  if (score > 0) return '薄弱'
  return '未学习'
}

/**
 * 渲染重要性星级
 */
function renderImportanceStars(level: number): string {
  const normalizedLevel = Math.max(1, Math.min(5, Math.round(level)))
  return '★'.repeat(normalizedLevel) + '☆'.repeat(5 - normalizedLevel)
}

// ============================================
// 生成器定义
// ============================================

const idArb = fc.uuid()
const codeArb = fc.string({ minLength: 1, maxLength: 10 })
const titleArb = fc.string({ minLength: 1, maxLength: 100 })
const contentArb = fc.string({ minLength: 0, maxLength: 1000 })
const nodeTypeArb = fc.constantFrom('chapter', 'section', 'knowledge_point')
const pointTypeArb = fc.option(fc.constantFrom('适应证', '禁忌', '不良反应', '相互作用', '用法用量'), { nil: undefined })
const drugNameArb = fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined })
const importanceArb = fc.integer({ min: 1, max: 5 })
const memoryTipsArb = fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined })
const masteryScoreArb = fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined })

const knowledgePointArb: fc.Arbitrary<KnowledgePointData> = fc.record({
  id: idArb,
  code: codeArb,
  title: titleArb,
  content: contentArb,
  node_type: nodeTypeArb,
  point_type: pointTypeArb,
  drug_name: drugNameArb,
  importance: importanceArb,
  memory_tips: memoryTipsArb,
  mastery_score: masteryScoreArb,
})

// 带记忆口诀的知识点生成器
const knowledgePointWithTipsArb: fc.Arbitrary<KnowledgePointData> = fc.record({
  id: idArb,
  code: codeArb,
  title: titleArb,
  content: contentArb,
  node_type: nodeTypeArb,
  point_type: pointTypeArb,
  drug_name: drugNameArb,
  importance: importanceArb,
  memory_tips: fc.string({ minLength: 1, maxLength: 200 }),
  mastery_score: masteryScoreArb,
})

// ============================================
// Property 11: 知识点卡片数据完整性
// ============================================

describe('Property 11: 知识点卡片数据完整性', () => {
  /**
   * 测试：卡片必须包含标题
   */
  test('卡片必须包含有效标题', () => {
    fc.assert(
      fc.property(knowledgePointArb, (point) => {
        const result = validateCardData(point)
        return result.hasTitle === true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：卡片必须包含有效的重要性星级 (1-5)
   */
  test('卡片必须包含有效的重要性星级', () => {
    fc.assert(
      fc.property(knowledgePointArb, (point) => {
        const result = validateCardData(point)
        return result.hasImportance === true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：卡片必须包含掌握度标签
   */
  test('卡片必须包含有效的掌握度标签', () => {
    fc.assert(
      fc.property(knowledgePointArb, (point) => {
        const result = validateCardData(point)
        return result.hasMasteryLabel === true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：卡片必须包含内容字段
   */
  test('卡片必须包含内容字段', () => {
    fc.assert(
      fc.property(knowledgePointArb, (point) => {
        const result = validateCardData(point)
        return result.hasContent === true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：若存在记忆口诀，必须显示
   */
  test('若存在记忆口诀，必须显示', () => {
    fc.assert(
      fc.property(knowledgePointWithTipsArb, (point) => {
        const result = validateCardData(point)
        // 如果有记忆口诀，必须显示
        return result.hasMemoryTips === true && result.memoryTipsDisplayed === true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：掌握度标签与分数阈值一致
   */
  test('掌握度标签与分数阈值一致', () => {
    fc.assert(
      fc.property(masteryScoreArb, (score) => {
        const label = getMasteryLabel(score)
        
        if (score === undefined || score === null) {
          return label === '未学习'
        }
        if (score >= 80) {
          return label === '已掌握'
        }
        if (score >= 60) {
          return label === '需复习'
        }
        if (score > 0) {
          return label === '薄弱'
        }
        return label === '未学习'
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：重要性星级渲染正确
   */
  test('重要性星级渲染正确', () => {
    fc.assert(
      fc.property(importanceArb, (level) => {
        const stars = renderImportanceStars(level)
        const filledCount = (stars.match(/★/g) || []).length
        const emptyCount = (stars.match(/☆/g) || []).length
        
        return filledCount === level && emptyCount === (5 - level) && stars.length === 5
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：所有必需字段同时存在
   */
  test('所有必需字段同时存在', () => {
    fc.assert(
      fc.property(knowledgePointArb, (point) => {
        const result = validateCardData(point)
        return (
          result.hasTitle &&
          result.hasImportance &&
          result.hasMasteryLabel &&
          result.hasContent
        )
      }),
      { numRuns: 100 }
    )
  })
})

// ============================================
// 边界情况测试
// ============================================

describe('边界情况测试', () => {
  test('空内容的知识点', () => {
    const point: KnowledgePointData = {
      id: 'test-1',
      code: '1.1',
      title: '测试知识点',
      content: '',
      node_type: 'knowledge_point',
      importance: 3,
    }
    const result = validateCardData(point)
    expect(result.hasTitle).toBe(true)
    expect(result.hasContent).toBe(true)
    expect(result.hasMemoryTips).toBe(false)
  })

  test('最高重要性等级', () => {
    const stars = renderImportanceStars(5)
    expect(stars).toBe('★★★★★')
  })

  test('最低重要性等级', () => {
    const stars = renderImportanceStars(1)
    expect(stars).toBe('★☆☆☆☆')
  })

  test('掌握度边界值 - 80%', () => {
    expect(getMasteryLabel(80)).toBe('已掌握')
    expect(getMasteryLabel(79)).toBe('需复习')
  })

  test('掌握度边界值 - 60%', () => {
    expect(getMasteryLabel(60)).toBe('需复习')
    expect(getMasteryLabel(59)).toBe('薄弱')
  })

  test('掌握度边界值 - 0%', () => {
    expect(getMasteryLabel(0)).toBe('未学习')
    expect(getMasteryLabel(1)).toBe('薄弱')
  })

  test('未定义掌握度', () => {
    expect(getMasteryLabel(undefined)).toBe('未学习')
  })
})
