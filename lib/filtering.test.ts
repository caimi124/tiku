/**
 * 筛选功能 - 属性测试
 *
 * **Feature: smart-learning-system, Property 7: 薄弱点标记阈值一致性**
 * **Feature: smart-learning-system, Property 14: 立即复习条件过滤**
 * **Validates: Requirements 2.3, 5.5**
 */

import * as fc from 'fast-check'
import { getMasteryStatus, MASTERY_THRESHOLDS } from './mastery-utils'
import { needsImmediateReview } from './mastery'

// 生成器
const scoreArb = fc.integer({ min: 0, max: 100 })
const importanceArb = fc.integer({ min: 1, max: 5 })

// 知识点节点类型
interface KnowledgePoint {
  id: string
  title: string
  importance: number
  mastery_score: number
}

const knowledgePointArb: fc.Arbitrary<KnowledgePoint> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  importance: importanceArb,
  mastery_score: scoreArb,
})

const knowledgePointListArb = fc.array(knowledgePointArb, { minLength: 0, maxLength: 50 })

// 筛选函数
function filterWeakPoints(points: KnowledgePoint[]): KnowledgePoint[] {
  return points.filter(p => p.mastery_score < MASTERY_THRESHOLDS.REVIEW)
}

function filterHighFrequency(points: KnowledgePoint[]): KnowledgePoint[] {
  return points.filter(p => p.importance >= 4)
}

function filterNeedsImmediateReview(points: KnowledgePoint[]): KnowledgePoint[] {
  return points.filter(p => needsImmediateReview(p.mastery_score, p.importance))
}

function isWeakPoint(score: number): boolean {
  return score < MASTERY_THRESHOLDS.REVIEW
}

// Property 7: 薄弱点标记阈值一致性 - Validates: Requirements 2.3
describe('Property 7: 薄弱点标记阈值一致性', () => {
  test('分数<60时标记为薄弱点', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 59 }), (score) => {
        return isWeakPoint(score) === true
      }),
      { numRuns: 100 }
    )
  })

  test('分数>=60时不标记为薄弱点', () => {
    fc.assert(
      fc.property(fc.integer({ min: 60, max: 100 }), (score) => {
        return isWeakPoint(score) === false
      }),
      { numRuns: 100 }
    )
  })

  test('薄弱点筛选只返回分数<60的考点', () => {
    fc.assert(
      fc.property(knowledgePointListArb, (points) => {
        const weakPoints = filterWeakPoints(points)
        return weakPoints.every(p => p.mastery_score < MASTERY_THRESHOLDS.REVIEW)
      }),
      { numRuns: 100 }
    )
  })

  test('薄弱点筛选不遗漏任何分数<60的考点', () => {
    fc.assert(
      fc.property(knowledgePointListArb, (points) => {
        const weakPoints = filterWeakPoints(points)
        const expectedCount = points.filter(p => p.mastery_score < MASTERY_THRESHOLDS.REVIEW).length
        return weakPoints.length === expectedCount
      }),
      { numRuns: 100 }
    )
  })

  test('薄弱点状态与getMasteryStatus一致', () => {
    fc.assert(
      fc.property(scoreArb, (score) => {
        const status = getMasteryStatus(score)
        const isWeak = isWeakPoint(score)
        
        if (isWeak) {
          return status === 'weak' || status === 'unlearned'
        }
        return status === 'mastered' || status === 'review'
      }),
      { numRuns: 100 }
    )
  })
})

// Property 14: 立即复习条件过滤 - Validates: Requirements 5.5
describe('Property 14: 立即复习条件过滤', () => {
  test('掌握度<70且重要性>=4时需要立即复习', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 69 }),
        fc.integer({ min: 4, max: 5 }),
        (score, importance) => {
          return needsImmediateReview(score, importance) === true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('掌握度>=70时不需要立即复习', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 70, max: 100 }),
        importanceArb,
        (score, importance) => {
          return needsImmediateReview(score, importance) === false
        }
      ),
      { numRuns: 100 }
    )
  })

  test('重要性<4时不需要立即复习', () => {
    fc.assert(
      fc.property(
        scoreArb,
        fc.integer({ min: 1, max: 3 }),
        (score, importance) => {
          return needsImmediateReview(score, importance) === false
        }
      ),
      { numRuns: 100 }
    )
  })

  test('立即复习筛选结果都满足条件', () => {
    fc.assert(
      fc.property(knowledgePointListArb, (points) => {
        const needsReview = filterNeedsImmediateReview(points)
        return needsReview.every(p => 
          p.mastery_score < 70 && p.importance >= 4
        )
      }),
      { numRuns: 100 }
    )
  })

  test('立即复习筛选不遗漏任何满足条件的考点', () => {
    fc.assert(
      fc.property(knowledgePointListArb, (points) => {
        const needsReview = filterNeedsImmediateReview(points)
        const expectedCount = points.filter(p => 
          p.mastery_score < 70 && p.importance >= 4
        ).length
        return needsReview.length === expectedCount
      }),
      { numRuns: 100 }
    )
  })
})

// 高频考点筛选测试
describe('高频考点筛选测试', () => {
  test('高频考点筛选只返回重要性>=4的考点', () => {
    fc.assert(
      fc.property(knowledgePointListArb, (points) => {
        const highFreq = filterHighFrequency(points)
        return highFreq.every(p => p.importance >= 4)
      }),
      { numRuns: 100 }
    )
  })

  test('高频考点筛选不遗漏任何重要性>=4的考点', () => {
    fc.assert(
      fc.property(knowledgePointListArb, (points) => {
        const highFreq = filterHighFrequency(points)
        const expectedCount = points.filter(p => p.importance >= 4).length
        return highFreq.length === expectedCount
      }),
      { numRuns: 100 }
    )
  })
})

// 边界值测试
describe('筛选边界值测试', () => {
  test('边界值60不是薄弱点', () => {
    expect(isWeakPoint(60)).toBe(false)
  })

  test('边界值59是薄弱点', () => {
    expect(isWeakPoint(59)).toBe(true)
  })

  test('边界值70和重要性4不需要立即复习', () => {
    expect(needsImmediateReview(70, 4)).toBe(false)
  })

  test('边界值69和重要性4需要立即复习', () => {
    expect(needsImmediateReview(69, 4)).toBe(true)
  })

  test('边界值69和重要性3不需要立即复习', () => {
    expect(needsImmediateReview(69, 3)).toBe(false)
  })

  test('阈值常量正确', () => {
    expect(MASTERY_THRESHOLDS.REVIEW).toBe(60)
    expect(MASTERY_THRESHOLDS.MASTERED).toBe(80)
  })
})