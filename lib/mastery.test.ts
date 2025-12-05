/**
 * 掌握度计算服务 - 属性测试
 *
 * **Feature: smart-learning-system, Property 6: 掌握度更新一致性**
 * **Feature: smart-learning-system, Property 8: 艾宾浩斯遗忘曲线衰减**
 * **Validates: Requirements 2.2, 2.5**
 */

import * as fc from 'fast-check'
import {
  calculateMastery,
  calculateTimeDecay,
  getNextReviewDate,
  getMasteryStatus,
  needsImmediateReview,
  calculateReviewPriority,
  MASTERY_THRESHOLDS,
  EBBINGHAUS_INTERVALS,
  MasteryCalculationInput,
} from './mastery'

const accuracyArb = fc.integer({ min: 0, max: 100 })
const daysArb = fc.integer({ min: 0, max: 365 })
const difficultyArb = fc.integer({ min: 1, max: 5 })
const importanceArb = fc.integer({ min: 1, max: 5 })

const masteryInputArb: fc.Arbitrary<MasteryCalculationInput> = fc.record({
  baseAccuracy: accuracyArb,
  recentPerformance: accuracyArb,
  daysSinceLastReview: daysArb,
  averageDifficulty: fc.option(difficultyArb, { nil: undefined }),
})

const pastDateArb = fc.date({
  min: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
  max: new Date(),
})

// Property 6: 掌握度更新一致性 - Validates: Requirements 2.2
describe('Property 6: 掌握度更新一致性', () => {
  test('掌握度分数始终在 0-100 范围内', () => {
    fc.assert(
      fc.property(masteryInputArb, (input) => {
        const result = calculateMastery(input)
        return result.score >= 0 && result.score <= 100
      }),
      { numRuns: 100 }
    )
  })

  test('相同输入产生相同输出', () => {
    fc.assert(
      fc.property(masteryInputArb, (input) => {
        const result1 = calculateMastery(input)
        const result2 = calculateMastery(input)
        return (
          result1.score === result2.score &&
          result1.status === result2.status &&
          result1.isWeakPoint === result2.isWeakPoint &&
          result1.isMastered === result2.isMastered
        )
      }),
      { numRuns: 100 }
    )
  })

  test('更高的正确率导致更高或相等的掌握度', () => {
    fc.assert(
      fc.property(
        accuracyArb,
        accuracyArb,
        accuracyArb,
        daysArb,
        fc.option(difficultyArb, { nil: undefined }),
        (acc1, acc2, recentPerf, days, diff) => {
          const lowAcc = Math.min(acc1, acc2)
          const highAcc = Math.max(acc1, acc2)

          const resultLow = calculateMastery({
            baseAccuracy: lowAcc,
            recentPerformance: recentPerf,
            daysSinceLastReview: days,
            averageDifficulty: diff,
          })

          const resultHigh = calculateMastery({
            baseAccuracy: highAcc,
            recentPerformance: recentPerf,
            daysSinceLastReview: days,
            averageDifficulty: diff,
          })

          return resultHigh.score >= resultLow.score
        }
      ),
      { numRuns: 100 }
    )
  })

  test('掌握状态与分数阈值一致', () => {
    fc.assert(
      fc.property(masteryInputArb, (input) => {
        const result = calculateMastery(input)

        if (result.score >= MASTERY_THRESHOLDS.MASTERED) {
          return result.status === 'mastered' && result.isMastered === true
        }
        if (result.score >= MASTERY_THRESHOLDS.REVIEW) {
          return result.status === 'review' && result.isMastered === false
        }
        if (result.score > 0) {
          return result.status === 'weak' && result.isWeakPoint === true
        }
        return result.status === 'unlearned'
      }),
      { numRuns: 100 }
    )
  })

  test('薄弱点标记与阈值一致', () => {
    fc.assert(
      fc.property(masteryInputArb, (input) => {
        const result = calculateMastery(input)
        const expectedWeakPoint = result.score < MASTERY_THRESHOLDS.REVIEW
        return result.isWeakPoint === expectedWeakPoint
      }),
      { numRuns: 100 }
    )
  })
})
// Property 8: 艾宾浩斯遗忘曲线衰减 - Validates: Requirements 2.5
describe('Property 8: 艾宾浩斯遗忘曲线衰减', () => {
  test('时间衰减始终在 0-80 范围内', () => {
    fc.assert(
      fc.property(daysArb, (days) => {
        const decay = calculateTimeDecay(days)
        return decay >= 0 && decay <= 80
      }),
      { numRuns: 100 }
    )
  })

  test('0天未复习时衰减为0', () => {
    const decay = calculateTimeDecay(0)
    expect(decay).toBe(0)
  })

  test('时间衰减随天数单调递增', () => {
    fc.assert(
      fc.property(daysArb, daysArb, (days1, days2) => {
        const minDays = Math.min(days1, days2)
        const maxDays = Math.max(days1, days2)

        const decayMin = calculateTimeDecay(minDays)
        const decayMax = calculateTimeDecay(maxDays)

        return decayMax >= decayMin
      }),
      { numRuns: 100 }
    )
  })

  test('超过7天未复习时掌握度有明显衰减', () => {
    fc.assert(
      fc.property(
        accuracyArb,
        accuracyArb,
        fc.option(difficultyArb, { nil: undefined }),
        (baseAcc, recentPerf, diff) => {
          const resultRecent = calculateMastery({
            baseAccuracy: baseAcc,
            recentPerformance: recentPerf,
            daysSinceLastReview: 0,
            averageDifficulty: diff,
          })

          const resultOld = calculateMastery({
            baseAccuracy: baseAcc,
            recentPerformance: recentPerf,
            daysSinceLastReview: 8,
            averageDifficulty: diff,
          })

          return resultOld.score <= resultRecent.score
        }
      ),
      { numRuns: 100 }
    )
  })

  test('复习间隔随掌握度等级递增', () => {
    fc.assert(
      fc.property(accuracyArb, accuracyArb, (score1, score2) => {
        const minScore = Math.min(score1, score2)
        const maxScore = Math.max(score1, score2)

        const recLow = getNextReviewDate(minScore, new Date())
        const recHigh = getNextReviewDate(maxScore, new Date())

        return recHigh.intervalDays >= recLow.intervalDays
      }),
      { numRuns: 100 }
    )
  })

  test('复习等级在 0-5 范围内', () => {
    fc.assert(
      fc.property(accuracyArb, pastDateArb, (score, date) => {
        const rec = getNextReviewDate(score, date)
        return rec.level >= 0 && rec.level <= 5
      }),
      { numRuns: 100 }
    )
  })

  test('复习间隔与艾宾浩斯间隔表一致', () => {
    fc.assert(
      fc.property(accuracyArb, (score) => {
        const rec = getNextReviewDate(score, new Date())
        const expectedInterval = EBBINGHAUS_INTERVALS[rec.level]
        return rec.intervalDays === expectedInterval
      }),
      { numRuns: 100 }
    )
  })
})

// 立即复习条件过滤 - Validates: Requirements 5.5
describe('立即复习条件过滤', () => {
  test('立即复习条件正确判断', () => {
    fc.assert(
      fc.property(accuracyArb, importanceArb, (mastery, importance) => {
        const needsReview = needsImmediateReview(mastery, importance)
        const expected = mastery < 70 && importance >= 4
        return needsReview === expected
      }),
      { numRuns: 100 }
    )
  })
})

// 复习优先级计算
describe('复习优先级计算', () => {
  test('优先级分数在 0-100 范围内', () => {
    fc.assert(
      fc.property(accuracyArb, importanceArb, daysArb, (mastery, importance, days) => {
        const priority = calculateReviewPriority(mastery, importance, days)
        return priority >= 0 && priority <= 100
      }),
      { numRuns: 100 }
    )
  })

  test('掌握度越低优先级越高', () => {
    fc.assert(
      fc.property(accuracyArb, accuracyArb, importanceArb, daysArb, (m1, m2, imp, days) => {
        const lowMastery = Math.min(m1, m2)
        const highMastery = Math.max(m1, m2)

        const priorityLow = calculateReviewPriority(lowMastery, imp, days)
        const priorityHigh = calculateReviewPriority(highMastery, imp, days)

        return priorityLow >= priorityHigh
      }),
      { numRuns: 100 }
    )
  })
})

// 边界情况测试
describe('边界情况测试', () => {
  test('掌握度计算 - 全部满分输入', () => {
    const result = calculateMastery({
      baseAccuracy: 100,
      recentPerformance: 100,
      daysSinceLastReview: 0,
      averageDifficulty: 5,
    })
    expect(result.score).toBe(100)
    expect(result.status).toBe('mastered')
    expect(result.isMastered).toBe(true)
  })

  test('掌握度计算 - 全部零分输入', () => {
    const result = calculateMastery({
      baseAccuracy: 0,
      recentPerformance: 0,
      daysSinceLastReview: 365,
      averageDifficulty: 1,
    })
    expect(result.score).toBeLessThan(10)
    expect(result.status).toBe('weak')
    expect(result.isWeakPoint).toBe(true)
  })

  test('掌握度计算 - 边界值60%', () => {
    const result = calculateMastery({
      baseAccuracy: 60,
      recentPerformance: 60,
      daysSinceLastReview: 0,
      averageDifficulty: 3,
    })
    expect(result.score).toBeGreaterThanOrEqual(60)
    expect(result.status).toBe('review')
  })

  test('getMasteryStatus - 各阈值边界', () => {
    expect(getMasteryStatus(80).status).toBe('mastered')
    expect(getMasteryStatus(79).status).toBe('review')
    expect(getMasteryStatus(60).status).toBe('review')
    expect(getMasteryStatus(59).status).toBe('weak')
    expect(getMasteryStatus(1).status).toBe('weak')
    expect(getMasteryStatus(0).status).toBe('unlearned')
  })

  test('getNextReviewDate - null日期处理', () => {
    const rec = getNextReviewDate(50, null)
    expect(rec.nextReviewDate).toBeInstanceOf(Date)
    expect(rec.intervalDays).toBeGreaterThan(0)
  })
})
