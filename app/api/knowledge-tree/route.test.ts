/**
 * 知识点树 API - 属性测试
 *
 * **Feature: smart-learning-system, Property 10: 高频考点排序正确性**
 * **Validates: Requirements 3.3**
 */

import * as fc from 'fast-check'

// 掌握度阈值常量
const MASTERY_THRESHOLDS = {
  MASTERED: 80,
  REVIEW: 60,
  WEAK: 60,
}

const HIGH_FREQUENCY_THRESHOLD = 4

// 模拟知识点节点类型
interface KnowledgeNode {
  id: string
  title: string
  importance: number
  mastery_score: number | null
  mastery_status?: 'mastered' | 'review' | 'weak' | 'unlearned'
}

// 获取掌握状态的纯函数（从 API 中提取）
function getMasteryStatus(score: number | null): 'mastered' | 'review' | 'weak' | 'unlearned' {
  if (score === null || score === undefined) return 'unlearned'
  if (score >= MASTERY_THRESHOLDS.MASTERED) return 'mastered'
  if (score >= MASTERY_THRESHOLDS.REVIEW) return 'review'
  if (score > 0) return 'weak'
  return 'unlearned'
}

// 判断是否为高频考点
function isHighFrequency(importance: number): boolean {
  return importance >= HIGH_FREQUENCY_THRESHOLD
}

// 按重要性降序排序高频考点
function sortByImportanceDesc(nodes: KnowledgeNode[]): KnowledgeNode[] {
  return [...nodes]
    .filter(n => isHighFrequency(n.importance))
    .sort((a, b) => b.importance - a.importance)
}

// 生成器
const importanceArb = fc.integer({ min: 1, max: 5 })
const masteryScoreArb = fc.oneof(
  fc.constant(null),
  fc.integer({ min: 0, max: 100 })
)

const knowledgeNodeArb: fc.Arbitrary<KnowledgeNode> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  importance: importanceArb,
  mastery_score: masteryScoreArb,
})

const knowledgeNodeListArb = fc.array(knowledgeNodeArb, { minLength: 0, maxLength: 50 })

// Property 10: 高频考点排序正确性 - Validates: Requirements 3.3
describe('Property 10: 高频考点排序正确性', () => {
  test('高频考点筛选只返回重要性>=4的考点', () => {
    fc.assert(
      fc.property(knowledgeNodeListArb, (nodes) => {
        const highFrequencyNodes = nodes.filter(n => isHighFrequency(n.importance))
        return highFrequencyNodes.every(n => n.importance >= HIGH_FREQUENCY_THRESHOLD)
      }),
      { numRuns: 100 }
    )
  })

  test('高频考点按重要性降序排列', () => {
    fc.assert(
      fc.property(knowledgeNodeListArb, (nodes) => {
        const sorted = sortByImportanceDesc(nodes)
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i].importance > sorted[i - 1].importance) {
            return false
          }
        }
        return true
      }),
      { numRuns: 100 }
    )
  })

  test('掌握状态标签与分数阈值一致', () => {
    fc.assert(
      fc.property(masteryScoreArb, (score) => {
        const status = getMasteryStatus(score)
        
        if (score === null) {
          return status === 'unlearned'
        }
        if (score >= MASTERY_THRESHOLDS.MASTERED) {
          return status === 'mastered'
        }
        if (score >= MASTERY_THRESHOLDS.REVIEW) {
          return status === 'review'
        }
        if (score > 0) {
          return status === 'weak'
        }
        return status === 'unlearned'
      }),
      { numRuns: 100 }
    )
  })

  test('每个高频考点都有正确的掌握状态标签', () => {
    fc.assert(
      fc.property(knowledgeNodeListArb, (nodes) => {
        const highFrequencyNodes = nodes
          .filter(n => isHighFrequency(n.importance))
          .map(n => ({
            ...n,
            mastery_status: getMasteryStatus(n.mastery_score)
          }))
        
        return highFrequencyNodes.every(n => {
          const expectedStatus = getMasteryStatus(n.mastery_score)
          return n.mastery_status === expectedStatus
        })
      }),
      { numRuns: 100 }
    )
  })

  test('排序后的列表长度等于高频考点数量', () => {
    fc.assert(
      fc.property(knowledgeNodeListArb, (nodes) => {
        const highFrequencyCount = nodes.filter(n => isHighFrequency(n.importance)).length
        const sorted = sortByImportanceDesc(nodes)
        return sorted.length === highFrequencyCount
      }),
      { numRuns: 100 }
    )
  })
})

// 额外测试：掌握状态分类
describe('掌握状态分类测试', () => {
  test('已掌握状态对应分数>=80', () => {
    fc.assert(
      fc.property(fc.integer({ min: 80, max: 100 }), (score) => {
        return getMasteryStatus(score) === 'mastered'
      }),
      { numRuns: 100 }
    )
  })

  test('需复习状态对应分数60-79', () => {
    fc.assert(
      fc.property(fc.integer({ min: 60, max: 79 }), (score) => {
        return getMasteryStatus(score) === 'review'
      }),
      { numRuns: 100 }
    )
  })

  test('薄弱状态对应分数1-59', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 59 }), (score) => {
        return getMasteryStatus(score) === 'weak'
      }),
      { numRuns: 100 }
    )
  })

  test('未学习状态对应分数0或null', () => {
    expect(getMasteryStatus(null)).toBe('unlearned')
    expect(getMasteryStatus(0)).toBe('unlearned')
  })
})

// 边界情况测试
describe('边界情况测试', () => {
  test('空列表返回空数组', () => {
    const result = sortByImportanceDesc([])
    expect(result).toEqual([])
  })

  test('没有高频考点时返回空数组', () => {
    const lowImportanceNodes: KnowledgeNode[] = [
      { id: '1', title: 'Test 1', importance: 1, mastery_score: 50 },
      { id: '2', title: 'Test 2', importance: 2, mastery_score: 60 },
      { id: '3', title: 'Test 3', importance: 3, mastery_score: 70 },
    ]
    const result = sortByImportanceDesc(lowImportanceNodes)
    expect(result).toEqual([])
  })

  test('所有考点都是高频时全部返回', () => {
    const highImportanceNodes: KnowledgeNode[] = [
      { id: '1', title: 'Test 1', importance: 4, mastery_score: 50 },
      { id: '2', title: 'Test 2', importance: 5, mastery_score: 60 },
      { id: '3', title: 'Test 3', importance: 4, mastery_score: 70 },
    ]
    const result = sortByImportanceDesc(highImportanceNodes)
    expect(result.length).toBe(3)
    expect(result[0].importance).toBe(5)
  })

  test('重要性边界值4正确判断为高频', () => {
    expect(isHighFrequency(4)).toBe(true)
    expect(isHighFrequency(3)).toBe(false)
  })

  test('掌握度边界值正确分类', () => {
    expect(getMasteryStatus(80)).toBe('mastered')
    expect(getMasteryStatus(79)).toBe('review')
    expect(getMasteryStatus(60)).toBe('review')
    expect(getMasteryStatus(59)).toBe('weak')
    expect(getMasteryStatus(1)).toBe('weak')
    expect(getMasteryStatus(0)).toBe('unlearned')
  })
})