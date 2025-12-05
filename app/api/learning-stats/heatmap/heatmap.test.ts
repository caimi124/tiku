/**
 * 连续学习天数计算 - 属性测试
 *
 * **Feature: smart-learning-system, Property 17: 连续学习天数计算**
 * **Validates: Requirements 7.5**
 *
 * Property 17: 连续学习天数计算
 * *For any* 用户学习记录，连续学习天数必须等于从今天往前连续有学习记录的天数。
 */

import * as fc from 'fast-check'
import { calculateStreak, getHeatmapColor } from './route'

// ============================================
// 类型定义
// ============================================

interface DailyLearningData {
  date: string
  study_minutes: number
  questions_done: number
  correct_count: number
  accuracy: number
  color: 'green' | 'yellow' | 'red' | 'gray'
}

// ============================================
// 辅助函数
// ============================================

/**
 * 生成日期字符串
 */
function generateDateString(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split('T')[0]
}

/**
 * 生成学习数据
 */
function generateDailyData(
  daysAgo: number,
  questionsCount: number,
  accuracy: number
): DailyLearningData {
  return {
    date: generateDateString(daysAgo),
    study_minutes: Math.floor(questionsCount * 2),
    questions_done: questionsCount,
    correct_count: Math.floor((questionsCount * accuracy) / 100),
    accuracy,
    color: getHeatmapColor(questionsCount, accuracy),
  }
}

/**
 * 生成连续学习数据（从今天开始往前）
 */
function generateConsecutiveData(consecutiveDays: number, totalDays: number): DailyLearningData[] {
  const data: DailyLearningData[] = []

  for (let i = totalDays - 1; i >= 0; i--) {
    const hasActivity = i < consecutiveDays
    data.push(generateDailyData(i, hasActivity ? 10 : 0, hasActivity ? 80 : 0))
  }

  return data
}

/**
 * 生成随机学习数据
 */
function generateRandomData(pattern: boolean[]): DailyLearningData[] {
  return pattern.map((hasActivity, index) =>
    generateDailyData(pattern.length - 1 - index, hasActivity ? 10 : 0, hasActivity ? 80 : 0)
  )
}

// ============================================
// 生成器定义
// ============================================

const consecutiveDaysArb = fc.integer({ min: 0, max: 30 })
const totalDaysArb = fc.integer({ min: 1, max: 60 })
const questionsCountArb = fc.integer({ min: 0, max: 100 })
const accuracyArb = fc.integer({ min: 0, max: 100 })

// 生成随机的学习模式（true = 有学习，false = 无学习）
const learningPatternArb = fc.array(fc.boolean(), { minLength: 1, maxLength: 30 })

// ============================================
// Property 17: 连续学习天数计算
// ============================================

describe('Property 17: 连续学习天数计算', () => {
  /**
   * 测试：连续学习天数必须为非负整数
   */
  test('连续学习天数必须为非负整数', () => {
    fc.assert(
      fc.property(learningPatternArb, (pattern) => {
        const data = generateRandomData(pattern)
        const streak = calculateStreak(data)
        return Number.isInteger(streak) && streak >= 0
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：连续学习天数不能超过总天数
   */
  test('连续学习天数不能超过总天数', () => {
    fc.assert(
      fc.property(learningPatternArb, (pattern) => {
        const data = generateRandomData(pattern)
        const streak = calculateStreak(data)
        return streak <= data.length
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：全部有学习记录时，连续天数等于总天数
   */
  test('全部有学习记录时，连续天数等于总天数', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 30 }), (days) => {
        const pattern = Array(days).fill(true)
        const data = generateRandomData(pattern)
        const streak = calculateStreak(data)
        return streak === days
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：全部无学习记录时，连续天数为0
   */
  test('全部无学习记录时，连续天数为0', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 30 }), (days) => {
        const pattern = Array(days).fill(false)
        const data = generateRandomData(pattern)
        const streak = calculateStreak(data)
        return streak === 0
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：今天无学习记录时，连续天数为0
   */
  test('今天无学习记录时，连续天数为0', () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), { minLength: 1, maxLength: 29 }),
        (previousDays) => {
          // 今天无学习 + 之前的随机模式
          const pattern = [...previousDays, false]
          const data = generateRandomData(pattern)
          const streak = calculateStreak(data)
          return streak === 0
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：连续学习后中断，正确计算连续天数
   */
  test('连续学习后中断，正确计算连续天数', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 10 }),
        (consecutiveDays, gapDays) => {
          // 构建模式：[...gap天无学习, ...consecutive天有学习]
          const pattern = [
            ...Array(gapDays).fill(false),
            ...Array(consecutiveDays).fill(true),
          ]
          const data = generateRandomData(pattern)
          const streak = calculateStreak(data)
          return streak === consecutiveDays
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：空数据返回0
   */
  test('空数据返回0', () => {
    const streak = calculateStreak([])
    expect(streak).toBe(0)
  })
})

// ============================================
// 热力图颜色映射测试
// ============================================

describe('热力图颜色映射', () => {
  /**
   * 测试：无学习记录时颜色为灰色
   */
  test('无学习记录时颜色为灰色', () => {
    fc.assert(
      fc.property(accuracyArb, (accuracy) => {
        const color = getHeatmapColor(0, accuracy)
        return color === 'gray'
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：正确率>=80%时颜色为绿色
   */
  test('正确率>=80%时颜色为绿色', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 80, max: 100 }),
        (questions, accuracy) => {
          const color = getHeatmapColor(questions, accuracy)
          return color === 'green'
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：正确率60-79%时颜色为黄色
   */
  test('正确率60-79%时颜色为黄色', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 60, max: 79 }),
        (questions, accuracy) => {
          const color = getHeatmapColor(questions, accuracy)
          return color === 'yellow'
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：正确率<60%时颜色为红色
   */
  test('正确率<60%时颜色为红色', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 0, max: 59 }),
        (questions, accuracy) => {
          const color = getHeatmapColor(questions, accuracy)
          return color === 'red'
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// 边界情况测试
// ============================================

describe('边界情况测试', () => {
  test('单天有学习记录', () => {
    const data = generateRandomData([true])
    expect(calculateStreak(data)).toBe(1)
  })

  test('单天无学习记录', () => {
    const data = generateRandomData([false])
    expect(calculateStreak(data)).toBe(0)
  })

  test('正确率边界值80%', () => {
    expect(getHeatmapColor(10, 80)).toBe('green')
    expect(getHeatmapColor(10, 79)).toBe('yellow')
  })

  test('正确率边界值60%', () => {
    expect(getHeatmapColor(10, 60)).toBe('yellow')
    expect(getHeatmapColor(10, 59)).toBe('red')
  })

  test('正确率边界值0%', () => {
    expect(getHeatmapColor(10, 0)).toBe('red')
  })

  test('正确率边界值100%', () => {
    expect(getHeatmapColor(10, 100)).toBe('green')
  })
})
