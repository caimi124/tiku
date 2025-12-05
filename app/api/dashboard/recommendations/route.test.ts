/**
 * Dashboard Recommendations API Property Tests
 * 
 * Property 13: 复习推荐算法正确性
 * For any 基于艾宾浩斯遗忘曲线的复习推荐，
 * 到期需要复习的考点（基于上次复习时间）必须出现在今日推荐列表中
 * 
 * Validates: Requirements 5.1
 */

import * as fc from 'fast-check'
import {
  shouldReviewToday,
  daysSinceLastReview,
  getMasteryStatusInfo,
  formatRelativeTime,
} from './route'
import { 
  getNextReviewDate, 
  needsImmediateReview, 
  calculateReviewPriority,
  EBBINGHAUS_INTERVALS 
} from '@/lib/mastery'

// ============================================
// Test Data Generators
// ============================================

/**
 * 生成有效的掌握度分数 (0-100)
 */
const masteryScoreArb = fc.integer({ min: 0, max: 100 })

/**
 * 生成有效的重要性等级 (1-5)
 */
const importanceArb = fc.integer({ min: 1, max: 5 })

/**
 * 生成过去的日期
 */
const pastDateArb = fc.integer({ min: 0, max: 365 }).map(daysAgo => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(0, 0, 0, 0)
  return date
})

/**
 * 生成可能为 null 的过去日期
 */
const nullablePastDateArb = fc.option(pastDateArb, { nil: null })

// ============================================
// Property Tests
// ============================================

describe('Recommendations API - Property Tests', () => {

  describe('Property 13: \u590D\u4E60\u63A8\u8350\u7B97\u6CD5\u6B63\u786E\u6027', () => {

    test('P13.1: \u4ECE\u672A\u590D\u4E60\u7684\u8003\u70B9\u5FC5\u987B\u51FA\u73B0\u5728\u4ECA\u65E5\u63A8\u8350\u4E2D', () => {
      fc.assert(
        fc.property(masteryScoreArb, (mastery) => {
          // 从未复习过（lastReviewDate = null）
          const shouldReview = shouldReviewToday(mastery, null)
          return shouldReview === true
        }),
        { numRuns: 100 }
      )
    })

    test('P13.2: \u4ECA\u5929\u590D\u4E60\u8FC7\u7684\u8003\u70B9\u4E0D\u5E94\u7ACB\u5373\u63A8\u8350', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 80, max: 100 }), // 高掌握度
          (mastery) => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            
            // 高掌握度 + 今天复习 = 不需要立即复习
            const shouldReview = shouldReviewToday(mastery, today)
            // 根据艾宾浩斯曲线，高掌握度的间隔较长
            return !shouldReview
          }
        ),
        { numRuns: 100 }
      )
    })

    test('P13.3: \u8D85\u8FC7\u590D\u4E60\u95F4\u9694\u7684\u8003\u70B9\u5FC5\u987B\u63A8\u8350', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 19 }), // 低掌握度 (level 0)
          (mastery) => {
            // 低掌握度的复习间隔是1天
            // 2天前复习的应该需要今日复习
            const twoDaysAgo = new Date()
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
            
            const shouldReview = shouldReviewToday(mastery, twoDaysAgo)
            return shouldReview === true
          }
        ),
        { numRuns: 100 }
      )
    })

    test('P13.4: \u590D\u4E60\u95F4\u9694\u968F\u638C\u63E1\u5EA6\u589E\u52A0\u800C\u589E\u52A0', () => {
      // 艾宾浩斯间隔: [1, 2, 4, 7, 15, 30]
      // level = floor(mastery / 20)
      const testCases = [
        { mastery: 0, expectedLevel: 0, expectedInterval: 1 },
        { mastery: 20, expectedLevel: 1, expectedInterval: 2 },
        { mastery: 40, expectedLevel: 2, expectedInterval: 4 },
        { mastery: 60, expectedLevel: 3, expectedInterval: 7 },
        { mastery: 80, expectedLevel: 4, expectedInterval: 15 },
        { mastery: 100, expectedLevel: 5, expectedInterval: 30 },
      ]

      for (const tc of testCases) {
        const review = getNextReviewDate(tc.mastery, new Date())
        expect(review.level).toBe(tc.expectedLevel)
        expect(review.intervalDays).toBe(tc.expectedInterval)
      }
    })

    test('P13.5: \u590D\u4E60\u95F4\u9694\u5FC5\u987B\u5728\u6709\u6548\u8303\u56F4\u5185', () => {
      fc.assert(
        fc.property(masteryScoreArb, nullablePastDateArb, (mastery, lastReview) => {
          const review = getNextReviewDate(mastery, lastReview)
          
          // 间隔必须是艾宾浩斯间隔之一
          return EBBINGHAUS_INTERVALS.includes(review.intervalDays as typeof EBBINGHAUS_INTERVALS[number])
        }),
        { numRuns: 100 }
      )
    })

  })

  describe('\u7ACB\u5373\u590D\u4E60\u6761\u4EF6\u6D4B\u8BD5', () => {

    test('\u638C\u63E1\u5EA6 < 70% \u4E14 \u91CD\u8981\u6027 >= 4 \u65F6\u9700\u8981\u7ACB\u5373\u590D\u4E60', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 69 }),
          fc.integer({ min: 4, max: 5 }),
          (mastery, importance) => {
            return needsImmediateReview(mastery, importance) === true
          }
        ),
        { numRuns: 100 }
      )
    })

    test('\u638C\u63E1\u5EA6 >= 70% \u65F6\u4E0D\u9700\u8981\u7ACB\u5373\u590D\u4E60', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 70, max: 100 }),
          importanceArb,
          (mastery, importance) => {
            return needsImmediateReview(mastery, importance) === false
          }
        ),
        { numRuns: 100 }
      )
    })

    test('\u91CD\u8981\u6027 < 4 \u65F6\u4E0D\u9700\u8981\u7ACB\u5373\u590D\u4E60', () => {
      fc.assert(
        fc.property(
          masteryScoreArb,
          fc.integer({ min: 1, max: 3 }),
          (mastery, importance) => {
            return needsImmediateReview(mastery, importance) === false
          }
        ),
        { numRuns: 100 }
      )
    })

  })

  describe('\u590D\u4E60\u4F18\u5148\u7EA7\u8BA1\u7B97\u6D4B\u8BD5', () => {

    test('\u4F18\u5148\u7EA7\u5206\u6570\u5FC5\u987B\u5728 0-100 \u8303\u56F4\u5185', () => {
      fc.assert(
        fc.property(
          masteryScoreArb,
          importanceArb,
          fc.integer({ min: 0, max: 365 }),
          (mastery, importance, daysSince) => {
            const priority = calculateReviewPriority(mastery, importance, daysSince)
            return priority >= 0 && priority <= 100
          }
        ),
        { numRuns: 100 }
      )
    })

    test('\u638C\u63E1\u5EA6\u8D8A\u4F4E\uFF0C\u4F18\u5148\u7EA7\u8D8A\u9AD8', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 49 }),
          fc.integer({ min: 50, max: 100 }),
          importanceArb,
          fc.integer({ min: 0, max: 30 }),
          (lowMastery, highMastery, importance, daysSince) => {
            const lowPriority = calculateReviewPriority(lowMastery, importance, daysSince)
            const highPriority = calculateReviewPriority(highMastery, importance, daysSince)
            return lowPriority >= highPriority
          }
        ),
        { numRuns: 100 }
      )
    })

    test('\u91CD\u8981\u6027\u8D8A\u9AD8\uFF0C\u4F18\u5148\u7EA7\u8D8A\u9AD8', () => {
      fc.assert(
        fc.property(
          masteryScoreArb,
          fc.integer({ min: 1, max: 2 }),
          fc.integer({ min: 4, max: 5 }),
          fc.integer({ min: 0, max: 30 }),
          (mastery, lowImportance, highImportance, daysSince) => {
            const lowPriority = calculateReviewPriority(mastery, lowImportance, daysSince)
            const highPriority = calculateReviewPriority(mastery, highImportance, daysSince)
            return highPriority >= lowPriority
          }
        ),
        { numRuns: 100 }
      )
    })

    test('\u8DDD\u79BB\u4E0A\u6B21\u590D\u4E60\u8D8A\u4E45\uFF0C\u4F18\u5148\u7EA7\u8D8A\u9AD8', () => {
      fc.assert(
        fc.property(
          masteryScoreArb,
          importanceArb,
          fc.integer({ min: 0, max: 14 }),
          fc.integer({ min: 15, max: 30 }),
          (mastery, importance, shortDays, longDays) => {
            const shortPriority = calculateReviewPriority(mastery, importance, shortDays)
            const longPriority = calculateReviewPriority(mastery, importance, longDays)
            return longPriority >= shortPriority
          }
        ),
        { numRuns: 100 }
      )
    })

  })

  describe('\u8DDD\u79BB\u4E0A\u6B21\u590D\u4E60\u5929\u6570\u8BA1\u7B97', () => {

    test('\u4ECE\u672A\u590D\u4E60\u8FD4\u56DE 999', () => {
      expect(daysSinceLastReview(null)).toBe(999)
    })

    test('\u4ECA\u5929\u590D\u4E60\u8FD4\u56DE 0', () => {
      const today = new Date()
      expect(daysSinceLastReview(today)).toBe(0)
    })

    test('\u6628\u5929\u590D\u4E60\u8FD4\u56DE 1', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(daysSinceLastReview(yesterday)).toBe(1)
    })

    test('\u5929\u6570\u8BA1\u7B97\u5FC5\u987B\u4E3A\u975E\u8D1F\u6574\u6570', () => {
      fc.assert(
        fc.property(pastDateArb, (date) => {
          const days = daysSinceLastReview(date)
          return days >= 0 && Number.isInteger(days)
        }),
        { numRuns: 100 }
      )
    })

  })

  describe('\u638C\u63E1\u72B6\u6001\u5224\u65AD\u6D4B\u8BD5', () => {

    test('\u638C\u63E1\u5EA6 >= 80 \u8FD4\u56DE mastered', () => {
      fc.assert(
        fc.property(fc.integer({ min: 80, max: 100 }), (score) => {
          const info = getMasteryStatusInfo(score)
          return info.status === 'mastered' && info.text === '\u5DF2\u638C\u63E1'
        }),
        { numRuns: 50 }
      )
    })

    test('\u638C\u63E1\u5EA6 60-79 \u8FD4\u56DE review', () => {
      fc.assert(
        fc.property(fc.integer({ min: 60, max: 79 }), (score) => {
          const info = getMasteryStatusInfo(score)
          return info.status === 'review' && info.text === '\u9700\u590D\u4E60'
        }),
        { numRuns: 50 }
      )
    })

    test('\u638C\u63E1\u5EA6 1-59 \u8FD4\u56DE weak', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 59 }), (score) => {
          const info = getMasteryStatusInfo(score)
          return info.status === 'weak' && info.text === '\u8584\u5F31'
        }),
        { numRuns: 50 }
      )
    })

    test('\u638C\u63E1\u5EA6 0 \u8FD4\u56DE unlearned', () => {
      const info = getMasteryStatusInfo(0)
      expect(info.status).toBe('unlearned')
      expect(info.text).toBe('\u672A\u5B66\u4E60')
    })

  })

  describe('\u76F8\u5BF9\u65F6\u95F4\u683C\u5F0F\u5316\u6D4B\u8BD5', () => {

    test('null \u8FD4\u56DE "\u4ECE\u672A"', () => {
      expect(formatRelativeTime(null)).toBe('\u4ECE\u672A')
    })

    test('\u4ECA\u5929\u8FD4\u56DE "\u4ECA\u5929"', () => {
      const today = new Date()
      expect(formatRelativeTime(today)).toBe('\u4ECA\u5929')
    })

    test('\u6628\u5929\u8FD4\u56DE "\u6628\u5929"', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(formatRelativeTime(yesterday)).toBe('\u6628\u5929')
    })

    test('2-6\u5929\u524D\u8FD4\u56DE "X\u5929\u524D"', () => {
      for (let i = 2; i <= 6; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        expect(formatRelativeTime(date)).toBe(`${i}\u5929\u524D`)
      }
    })

    test('7-27\u5929\u524D\u8FD4\u56DE "X\u5468\u524D"', () => {
      const date = new Date()
      date.setDate(date.getDate() - 14)
      expect(formatRelativeTime(date)).toBe('2\u5468\u524D')
    })

    test('30\u5929\u4EE5\u4E0A\u8FD4\u56DE "X\u6708\u524D"', () => {
      const date = new Date()
      date.setDate(date.getDate() - 60)
      expect(formatRelativeTime(date)).toBe('2\u6708\u524D')
    })

  })

})
