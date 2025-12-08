/**
 * Property tests for PointPreviewCard utilities
 * 
 * **Feature: knowledge-learning-path, Property 6: 预览卡片内容完整性**
 * **Validates: Requirements 2.3**
 */

import fc from 'fast-check'

// Types
export interface PointTag {
  type: string
  label: string
  color: string
}

export interface PointPreviewData {
  id: string
  title: string
  coreMemoryPoints: string[]
  examYears: number[]
  tags: PointTag[]
}

// Utility functions to test
export function validatePreviewData(data: PointPreviewData): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // 必须有 id
  if (!data.id || typeof data.id !== 'string') {
    errors.push('缺少有效的考点ID')
  }
  
  // 必须有标题
  if (!data.title || typeof data.title !== 'string') {
    errors.push('缺少考点标题')
  }
  
  // coreMemoryPoints 必须是数组
  if (!Array.isArray(data.coreMemoryPoints)) {
    errors.push('核心记忆点必须是数组')
  }
  
  // examYears 必须是数组
  if (!Array.isArray(data.examYears)) {
    errors.push('历年考查年份必须是数组')
  }
  
  // tags 必须是数组
  if (!Array.isArray(data.tags)) {
    errors.push('标签必须是数组')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function getDisplayMemoryPoints(points: string[], maxCount: number = 3): string[] {
  return points.slice(0, maxCount)
}

export function getRemainingCount(points: string[], maxCount: number = 3): number {
  return Math.max(0, points.length - maxCount)
}

export function formatExamYearsForPreview(years: number[], maxCount: number = 5): string {
  if (!years || years.length === 0) return ''
  
  const displayYears = years.slice(-maxCount)
  let result = displayYears.join('、') + '年考过'
  
  if (years.length > maxCount) {
    result += ` (共${years.length}次)`
  }
  
  return result
}

export function hasViewDetailButton(data: PointPreviewData): boolean {
  // 预览卡片必须有"查看详情"按钮
  return !!data.id
}

export function generatePreviewUrl(pointId: string): string {
  return `/knowledge/point/${pointId}`
}

// Arbitraries
const tagTypeArbitrary = fc.constantFrom(
  'high_frequency', 'must_test', 'easy_mistake', 'basic', 'reinforce'
)

const tagArbitrary: fc.Arbitrary<PointTag> = fc.record({
  type: tagTypeArbitrary,
  label: fc.string({ minLength: 1, maxLength: 10 }),
  color: fc.constantFrom('#EF4444', '#F97316', '#EAB308', '#3B82F6', '#8B5CF6')
})

const previewDataArbitrary: fc.Arbitrary<PointPreviewData> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  coreMemoryPoints: fc.array(fc.string({ minLength: 1, maxLength: 200 }), { minLength: 0, maxLength: 10 }),
  examYears: fc.array(fc.integer({ min: 2015, max: 2024 }), { minLength: 0, maxLength: 10 }),
  tags: fc.array(tagArbitrary, { minLength: 0, maxLength: 5 })
})

describe('Property 6: 预览卡片内容完整性', () => {
  /**
   * Feature: knowledge-learning-path, Property 6: 预览卡片内容完整性
   * Validates: Requirements 2.3
   */

  it('有效的预览数据必须包含：考点标题、核心记忆点数组、历年考查年份数组', () => {
    fc.assert(
      fc.property(previewDataArbitrary, (data) => {
        const { isValid } = validatePreviewData(data)
        return isValid === true
      }),
      { numRuns: 100 }
    )
  })

  it('核心记忆点最多显示3条', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 0, maxLength: 20 }),
        (points) => {
          const displayPoints = getDisplayMemoryPoints(points, 3)
          return displayPoints.length <= 3
        }
      ),
      { numRuns: 100 }
    )
  })

  it('显示的核心记忆点是原数组的前N条', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 1, max: 5 }),
        (points, maxCount) => {
          const displayPoints = getDisplayMemoryPoints(points, maxCount)
          
          // 验证显示的是前N条
          for (let i = 0; i < displayPoints.length; i++) {
            if (displayPoints[i] !== points[i]) return false
          }
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('剩余数量计算正确', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 0, maxLength: 20 }),
        fc.integer({ min: 1, max: 5 }),
        (points, maxCount) => {
          const remaining = getRemainingCount(points, maxCount)
          const expected = Math.max(0, points.length - maxCount)
          return remaining === expected
        }
      ),
      { numRuns: 100 }
    )
  })

  it('预览卡片必须有"查看详情"按钮', () => {
    fc.assert(
      fc.property(previewDataArbitrary, (data) => {
        return hasViewDetailButton(data) === true
      }),
      { numRuns: 100 }
    )
  })

  it('"查看详情"按钮URL格式正确', () => {
    fc.assert(
      fc.property(fc.uuid(), (pointId) => {
        const url = generatePreviewUrl(pointId)
        return url === `/knowledge/point/${pointId}`
      }),
      { numRuns: 100 }
    )
  })
})

describe('历年考查年份格式化（预览卡片）', () => {

  it('空年份数组返回空字符串', () => {
    expect(formatExamYearsForPreview([])).toBe('')
  })

  it('年份数量不超过限制时不显示总次数', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 2015, max: 2024 }), { minLength: 1, maxLength: 5 }),
        (years) => {
          const formatted = formatExamYearsForPreview(years, 5)
          // 如果年份数量 <= 5，不应该包含"共X次"
          if (years.length <= 5) {
            return !formatted.includes('共')
          }
          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  it('年份数量超过限制时显示总次数', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 2015, max: 2024 }), { minLength: 6, maxLength: 15 }),
        (years) => {
          const formatted = formatExamYearsForPreview(years, 5)
          // 如果年份数量 > 5，应该包含"共X次"
          return formatted.includes(`共${years.length}次`)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('格式化结果包含"年考过"', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 2015, max: 2024 }), { minLength: 1, maxLength: 10 }),
        (years) => {
          const formatted = formatExamYearsForPreview(years)
          return formatted.includes('年考过')
        }
      ),
      { numRuns: 50 }
    )
  })
})
