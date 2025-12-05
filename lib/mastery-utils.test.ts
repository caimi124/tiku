/**
 * 掌握度工具函数 - 属性测试
 *
 * **Feature: smart-learning-system, Property 16: 热力图颜色映射一致性**
 * **Validates: Requirements 7.2**
 */

import * as fc from 'fast-check'
import {
  getMasteryStatus,
  getStatusConfig,
  getMasteryColor,
  MASTERY_THRESHOLDS,
} from './mastery-utils'

// 生成器
const scoreArb = fc.integer({ min: 0, max: 100 })
const masteredScoreArb = fc.integer({ min: 80, max: 100 })
const reviewScoreArb = fc.integer({ min: 60, max: 79 })
const weakScoreArb = fc.integer({ min: 1, max: 59 })

// Property 16: 热力图颜色映射一致性 - Validates: Requirements 7.2
describe('Property 16: 热力图颜色映射一致性', () => {
  test('分数>=80时颜色为绿色', () => {
    fc.assert(
      fc.property(masteredScoreArb, (score) => {
        return getMasteryColor(score) === 'green'
      }),
      { numRuns: 100 }
    )
  })

  test('分数60-79时颜色为黄色', () => {
    fc.assert(
      fc.property(reviewScoreArb, (score) => {
        return getMasteryColor(score) === 'yellow'
      }),
      { numRuns: 100 }
    )
  })

  test('分数1-59时颜色为红色', () => {
    fc.assert(
      fc.property(weakScoreArb, (score) => {
        return getMasteryColor(score) === 'red'
      }),
      { numRuns: 100 }
    )
  })

  test('分数0时颜色为灰色', () => {
    expect(getMasteryColor(0)).toBe('gray')
  })

  test('颜色映射与状态一致', () => {
    fc.assert(
      fc.property(scoreArb, (score) => {
        const color = getMasteryColor(score)
        const status = getMasteryStatus(score)
        
        if (status === 'mastered') return color === 'green'
        if (status === 'review') return color === 'yellow'
        if (status === 'weak') return color === 'red'
        return color === 'gray'
      }),
      { numRuns: 100 }
    )
  })
})

// 掌握状态测试
describe('掌握状态映射测试', () => {
  test('分数>=80时状态为mastered', () => {
    fc.assert(
      fc.property(masteredScoreArb, (score) => {
        return getMasteryStatus(score) === 'mastered'
      }),
      { numRuns: 100 }
    )
  })

  test('分数60-79时状态为review', () => {
    fc.assert(
      fc.property(reviewScoreArb, (score) => {
        return getMasteryStatus(score) === 'review'
      }),
      { numRuns: 100 }
    )
  })

  test('分数1-59时状态为weak', () => {
    fc.assert(
      fc.property(weakScoreArb, (score) => {
        return getMasteryStatus(score) === 'weak'
      }),
      { numRuns: 100 }
    )
  })

  test('分数0时状态为unlearned', () => {
    expect(getMasteryStatus(0)).toBe('unlearned')
  })
})

// 状态配置测试
describe('状态配置测试', () => {
  test('所有分数都有有效的状态配置', () => {
    fc.assert(
      fc.property(scoreArb, (score) => {
        const config = getStatusConfig(score)
        return (
          config.status !== undefined &&
          config.text !== undefined &&
          config.icon !== undefined &&
          config.bgColor !== undefined &&
          config.barColor !== undefined &&
          config.textColor !== undefined
        )
      }),
      { numRuns: 100 }
    )
  })

  test('状态配置与分数一致', () => {
    fc.assert(
      fc.property(scoreArb, (score) => {
        const config = getStatusConfig(score)
        const expectedStatus = getMasteryStatus(score)
        return config.status === expectedStatus
      }),
      { numRuns: 100 }
    )
  })

  test('已掌握状态配置正确', () => {
    const config = getStatusConfig(85)
    expect(config.status).toBe('mastered')
    expect(config.text).toBe('已掌握')
    expect(config.icon).toBe('\u2713')
    expect(config.barColor).toContain('green')
  })

  test('需复习状态配置正确', () => {
    const config = getStatusConfig(70)
    expect(config.status).toBe('review')
    expect(config.text).toBe('需复习')
    expect(config.icon).toBe('\u26A0')
    expect(config.barColor).toContain('yellow')
  })

  test('薄弱状态配置正确', () => {
    const config = getStatusConfig(40)
    expect(config.status).toBe('weak')
    expect(config.text).toBe('薄弱')
    expect(config.icon).toBe('\u2717')
    expect(config.barColor).toContain('red')
  })

  test('未学习状态配置正确', () => {
    const config = getStatusConfig(0)
    expect(config.status).toBe('unlearned')
    expect(config.text).toBe('未学习')
    expect(config.icon).toBe('\u25CB')
    expect(config.barColor).toContain('gray')
  })
})

// 边界值测试
describe('边界值测试', () => {
  test('边界值80正确分类为mastered', () => {
    expect(getMasteryStatus(80)).toBe('mastered')
    expect(getMasteryColor(80)).toBe('green')
  })

  test('边界值79正确分类为review', () => {
    expect(getMasteryStatus(79)).toBe('review')
    expect(getMasteryColor(79)).toBe('yellow')
  })

  test('边界值60正确分类为review', () => {
    expect(getMasteryStatus(60)).toBe('review')
    expect(getMasteryColor(60)).toBe('yellow')
  })

  test('边界值59正确分类为weak', () => {
    expect(getMasteryStatus(59)).toBe('weak')
    expect(getMasteryColor(59)).toBe('red')
  })

  test('边界值1正确分类为weak', () => {
    expect(getMasteryStatus(1)).toBe('weak')
    expect(getMasteryColor(1)).toBe('red')
  })

  test('边界值0正确分类为unlearned', () => {
    expect(getMasteryStatus(0)).toBe('unlearned')
    expect(getMasteryColor(0)).toBe('gray')
  })

  test('阈值常量正确', () => {
    expect(MASTERY_THRESHOLDS.MASTERED).toBe(80)
    expect(MASTERY_THRESHOLDS.REVIEW).toBe(60)
  })
})