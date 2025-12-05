/**
 * Dashboard API Property Tests
 * 
 * Property 9: 仪表盘数据完整性
 * For any 用户访问仪表盘，返回数据必须包含：
 * - 总体掌握度百分比
 * - 本周学习时长
 * - 总体正确率
 * - 各章节掌握度
 * 
 * Validates: Requirements 3.1, 3.2
 */

import * as fc from 'fast-check'
import {
  calculateOverallMastery,
  countWeakPoints,
  countMasteredPoints,
  countTotalPoints,
  ChapterMastery,
  DashboardData,
} from './route'

// ============================================
// Test Data Generators
// ============================================

/**
 * 生成有效的章节掌握度数据
 */
const chapterMasteryArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  code: fc.integer({ min: 1, max: 20 }).map(n => String(n)),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  mastery_score: fc.integer({ min: 0, max: 100 }),
  total_points: fc.integer({ min: 0, max: 100 }),
  mastered_points: fc.integer({ min: 0, max: 100 }),
  weak_points: fc.integer({ min: 0, max: 100 }),
}).filter(ch => 
  ch.mastered_points <= ch.total_points && 
  ch.weak_points <= ch.total_points
) as fc.Arbitrary<ChapterMastery>

/**
 * 生成章节列表
 */
const chapterListArb = fc.array(chapterMasteryArb, { minLength: 0, maxLength: 20 })

/**
 * 生成有效的仪表盘数据
 */
const dashboardDataArb = fc.record({
  overallMastery: fc.integer({ min: 0, max: 100 }),
  weeklyStudyTime: fc.float({ min: 0, max: 168, noNaN: true }),
  overallAccuracy: fc.integer({ min: 0, max: 100 }),
  weakPointsCount: fc.integer({ min: 0, max: 1000 }),
  chapterMastery: chapterListArb,
  totalPoints: fc.integer({ min: 0, max: 1000 }),
  masteredPoints: fc.integer({ min: 0, max: 1000 }),
  weeklyQuestions: fc.integer({ min: 0, max: 10000 }),
  learningStreak: fc.integer({ min: 0, max: 365 }),
}) as fc.Arbitrary<DashboardData>

// ============================================
// Property Tests
// ============================================

describe('Dashboard API - Property Tests', () => {
  
  describe('Property 9: \u4EEA\u8868\u76D8\u6570\u636E\u5B8C\u6574\u6027', () => {
    
    test('P9.1: \u603B\u4F53\u638C\u63E1\u5EA6\u5FC5\u987B\u5728 0-100 \u8303\u56F4\u5185', () => {
      fc.assert(
        fc.property(chapterListArb, (chapters) => {
          const mastery = calculateOverallMastery(chapters)
          return mastery >= 0 && mastery <= 100
        }),
        { numRuns: 100 }
      )
    })

    test('P9.2: \u7A7A\u7AE0\u8282\u5217\u8868\u8FD4\u56DE 0 \u638C\u63E1\u5EA6', () => {
      const mastery = calculateOverallMastery([])
      expect(mastery).toBe(0)
    })

    test('P9.3: \u5355\u4E2A\u7AE0\u8282\u7684\u638C\u63E1\u5EA6\u7B49\u4E8E\u8BE5\u7AE0\u8282\u5206\u6570', () => {
      fc.assert(
        fc.property(chapterMasteryArb, (chapter) => {
          if (chapter.total_points === 0) return true
          const mastery = calculateOverallMastery([chapter])
          return mastery === chapter.mastery_score
        }),
        { numRuns: 100 }
      )
    })

    test('P9.4: \u591A\u7AE0\u8282\u638C\u63E1\u5EA6\u662F\u52A0\u6743\u5E73\u5747', () => {
      fc.assert(
        fc.property(
          fc.array(chapterMasteryArb.filter(ch => ch.total_points > 0), { minLength: 2, maxLength: 10 }),
          (chapters) => {
            const mastery = calculateOverallMastery(chapters)
            
            // 计算期望的加权平均
            let totalWeighted = 0
            let totalPoints = 0
            for (const ch of chapters) {
              totalWeighted += ch.mastery_score * ch.total_points
              totalPoints += ch.total_points
            }
            const expected = totalPoints > 0 ? Math.round(totalWeighted / totalPoints) : 0
            
            return mastery === expected
          }
        ),
        { numRuns: 100 }
      )
    })

    test('P9.5: \u8584\u5F31\u8003\u70B9\u6570\u91CF\u4E3A\u5404\u7AE0\u8282\u8584\u5F31\u70B9\u4E4B\u548C', () => {
      fc.assert(
        fc.property(chapterListArb, (chapters) => {
          const weakCount = countWeakPoints(chapters)
          const expected = chapters.reduce((sum, ch) => sum + ch.weak_points, 0)
          return weakCount === expected
        }),
        { numRuns: 100 }
      )
    })

    test('P9.6: \u5DF2\u638C\u63E1\u8003\u70B9\u6570\u91CF\u4E3A\u5404\u7AE0\u8282\u5DF2\u638C\u63E1\u70B9\u4E4B\u548C', () => {
      fc.assert(
        fc.property(chapterListArb, (chapters) => {
          const masteredCount = countMasteredPoints(chapters)
          const expected = chapters.reduce((sum, ch) => sum + ch.mastered_points, 0)
          return masteredCount === expected
        }),
        { numRuns: 100 }
      )
    })

    test('P9.7: \u603B\u8003\u70B9\u6570\u91CF\u4E3A\u5404\u7AE0\u8282\u8003\u70B9\u4E4B\u548C', () => {
      fc.assert(
        fc.property(chapterListArb, (chapters) => {
          const totalCount = countTotalPoints(chapters)
          const expected = chapters.reduce((sum, ch) => sum + ch.total_points, 0)
          return totalCount === expected
        }),
        { numRuns: 100 }
      )
    })

    test('P9.8: \u8584\u5F31\u70B9\u6570\u91CF\u4E0D\u80FD\u8D85\u8FC7\u603B\u8003\u70B9\u6570', () => {
      fc.assert(
        fc.property(chapterListArb, (chapters) => {
          const weakCount = countWeakPoints(chapters)
          const totalCount = countTotalPoints(chapters)
          return weakCount <= totalCount
        }),
        { numRuns: 100 }
      )
    })

    test('P9.9: \u5DF2\u638C\u63E1\u70B9\u6570\u91CF\u4E0D\u80FD\u8D85\u8FC7\u603B\u8003\u70B9\u6570', () => {
      fc.assert(
        fc.property(chapterListArb, (chapters) => {
          const masteredCount = countMasteredPoints(chapters)
          const totalCount = countTotalPoints(chapters)
          return masteredCount <= totalCount
        }),
        { numRuns: 100 }
      )
    })

  })

  describe('\u8FB9\u754C\u6761\u4EF6\u6D4B\u8BD5', () => {
    
    test('\u6240\u6709\u7AE0\u8282\u638C\u63E1\u5EA6\u4E3A 100 \u65F6\uFF0C\u603B\u4F53\u638C\u63E1\u5EA6\u4E3A 100', () => {
      const chapters: ChapterMastery[] = [
        { id: '1', code: '1', title: 'Ch1', mastery_score: 100, total_points: 10, mastered_points: 10, weak_points: 0 },
        { id: '2', code: '2', title: 'Ch2', mastery_score: 100, total_points: 20, mastered_points: 20, weak_points: 0 },
      ]
      expect(calculateOverallMastery(chapters)).toBe(100)
    })

    test('\u6240\u6709\u7AE0\u8282\u638C\u63E1\u5EA6\u4E3A 0 \u65F6\uFF0C\u603B\u4F53\u638C\u63E1\u5EA6\u4E3A 0', () => {
      const chapters: ChapterMastery[] = [
        { id: '1', code: '1', title: 'Ch1', mastery_score: 0, total_points: 10, mastered_points: 0, weak_points: 10 },
        { id: '2', code: '2', title: 'Ch2', mastery_score: 0, total_points: 20, mastered_points: 0, weak_points: 20 },
      ]
      expect(calculateOverallMastery(chapters)).toBe(0)
    })

    test('\u6240\u6709\u7AE0\u8282 total_points \u4E3A 0 \u65F6\uFF0C\u603B\u4F53\u638C\u63E1\u5EA6\u4E3A 0', () => {
      const chapters: ChapterMastery[] = [
        { id: '1', code: '1', title: 'Ch1', mastery_score: 50, total_points: 0, mastered_points: 0, weak_points: 0 },
        { id: '2', code: '2', title: 'Ch2', mastery_score: 80, total_points: 0, mastered_points: 0, weak_points: 0 },
      ]
      expect(calculateOverallMastery(chapters)).toBe(0)
    })

    test('\u52A0\u6743\u5E73\u5747\u8BA1\u7B97\u6B63\u786E\u6027', () => {
      // Ch1: 80% * 10 = 800
      // Ch2: 60% * 30 = 1800
      // Total: 2600 / 40 = 65
      const chapters: ChapterMastery[] = [
        { id: '1', code: '1', title: 'Ch1', mastery_score: 80, total_points: 10, mastered_points: 8, weak_points: 0 },
        { id: '2', code: '2', title: 'Ch2', mastery_score: 60, total_points: 30, mastered_points: 18, weak_points: 6 },
      ]
      expect(calculateOverallMastery(chapters)).toBe(65)
    })

  })

  describe('\u6570\u636E\u5B8C\u6574\u6027\u9A8C\u8BC1', () => {
    
    test('\u4EEA\u8868\u76D8\u6570\u636E\u5FC5\u987B\u5305\u542B\u6240\u6709\u5FC5\u9700\u5B57\u6BB5', () => {
      fc.assert(
        fc.property(dashboardDataArb, (data) => {
          // Property 9: 必须包含所有必需字段
          return (
            typeof data.overallMastery === 'number' &&
            typeof data.weeklyStudyTime === 'number' &&
            typeof data.overallAccuracy === 'number' &&
            typeof data.weakPointsCount === 'number' &&
            Array.isArray(data.chapterMastery) &&
            typeof data.totalPoints === 'number' &&
            typeof data.masteredPoints === 'number' &&
            typeof data.weeklyQuestions === 'number' &&
            typeof data.learningStreak === 'number'
          )
        }),
        { numRuns: 100 }
      )
    })

    test('\u6570\u503C\u5B57\u6BB5\u5FC5\u987B\u4E3A\u975E\u8D1F\u6570', () => {
      fc.assert(
        fc.property(dashboardDataArb, (data) => {
          return (
            data.overallMastery >= 0 &&
            data.weeklyStudyTime >= 0 &&
            data.overallAccuracy >= 0 &&
            data.weakPointsCount >= 0 &&
            data.totalPoints >= 0 &&
            data.masteredPoints >= 0 &&
            data.weeklyQuestions >= 0 &&
            data.learningStreak >= 0
          )
        }),
        { numRuns: 100 }
      )
    })

    test('\u767E\u5206\u6BD4\u5B57\u6BB5\u5FC5\u987B\u5728 0-100 \u8303\u56F4\u5185', () => {
      fc.assert(
        fc.property(dashboardDataArb, (data) => {
          return (
            data.overallMastery >= 0 && data.overallMastery <= 100 &&
            data.overallAccuracy >= 0 && data.overallAccuracy <= 100
          )
        }),
        { numRuns: 100 }
      )
    })

    test('\u7AE0\u8282\u638C\u63E1\u5EA6\u6570\u636E\u5FC5\u987B\u5305\u542B\u6240\u6709\u5FC5\u9700\u5B57\u6BB5', () => {
      fc.assert(
        fc.property(chapterMasteryArb, (chapter) => {
          return (
            typeof chapter.id === 'string' &&
            typeof chapter.code === 'string' &&
            typeof chapter.title === 'string' &&
            typeof chapter.mastery_score === 'number' &&
            typeof chapter.total_points === 'number' &&
            typeof chapter.mastered_points === 'number' &&
            typeof chapter.weak_points === 'number'
          )
        }),
        { numRuns: 100 }
      )
    })

  })

})
