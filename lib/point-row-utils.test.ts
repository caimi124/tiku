/**
 * Property tests for PointRow utilities
 * 
 * **Feature: knowledge-learning-path, Property 4: 考点行数据完整性**
 * **Feature: knowledge-learning-path, Property 5: 考点详情页URL正确性**
 * **Validates: Requirements 1.6, 1.7**
 */

import fc from 'fast-check'

// Types
export interface PointTag {
  type: string
  label: string
  color: string
}

export interface PointRowData {
  id: string
  code: string
  title: string
  keyTakeaway: string
  importance: number
  tags: PointTag[]
  examYears?: number[]
  isFavorite?: boolean
  isReview?: boolean
}

// Utility functions to test
export function truncateText(text: string, maxLength: number = 30): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function generatePointUrl(pointId: string): string {
  return `/knowledge/point/${pointId}`
}

export function validatePointRowData(data: PointRowData): boolean {
  // 必须有 id
  if (!data.id || typeof data.id !== 'string') return false
  
  // 必须有标题
  if (!data.title || typeof data.title !== 'string') return false
  
  // 重要性必须在 1-5 范围内
  if (typeof data.importance !== 'number' || data.importance < 1 || data.importance > 5) return false
  
  // tags 必须是数组
  if (!Array.isArray(data.tags)) return false
  
  return true
}

export function hasHighFrequencyTag(tags: PointTag[]): boolean {
  return tags.some(t => t.type === 'high_frequency')
}

export function getDisplayTags(tags: PointTag[], maxCount: number = 2): PointTag[] {
  return tags.filter(t => t.type !== 'high_frequency').slice(0, maxCount)
}

export function formatExamYears(years: number[], maxCount: number = 3): string {
  if (!years || years.length === 0) return ''
  return years.slice(-maxCount).join('、') + '年考过'
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

const pointRowDataArbitrary: fc.Arbitrary<PointRowData> = fc.record({
  id: fc.uuid(),
  code: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  keyTakeaway: fc.string({ minLength: 0, maxLength: 100 }),
  importance: fc.integer({ min: 1, max: 5 }),
  tags: fc.array(tagArbitrary, { minLength: 0, maxLength: 5 }),
  examYears: fc.option(
    fc.array(fc.integer({ min: 2015, max: 2024 }), { minLength: 0, maxLength: 5 }),
    { nil: undefined }
  ),
  isFavorite: fc.option(fc.boolean(), { nil: undefined }),
  isReview: fc.option(fc.boolean(), { nil: undefined })
})

describe('Property 4: 考点行数据完整性', () => {
  /**
   * Feature: knowledge-learning-path, Property 4: 考点行数据完整性
   * Validates: Requirements 1.6
   */

  it('有效的考点行数据必须包含所有必需字段', () => {
    fc.assert(
      fc.property(pointRowDataArbitrary, (data) => {
        return validatePointRowData(data) === true
      }),
      { numRuns: 100 }
    )
  })

  it('重要性星级必须在1-5范围内', () => {
    fc.assert(
      fc.property(pointRowDataArbitrary, (data) => {
        return data.importance >= 1 && data.importance <= 5
      }),
      { numRuns: 100 }
    )
  })

  it('简介截断后长度不超过30字', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 200 }),
        (text) => {
          const truncated = truncateText(text, 30)
          // 如果原文超过30字，截断后应该是33字（30 + '...'）
          // 如果原文不超过30字，应该保持原样
          if (text.length <= 30) {
            return truncated === text
          } else {
            return truncated.length === 33 && truncated.endsWith('...')
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('空简介返回空字符串', () => {
    expect(truncateText('')).toBe('')
    expect(truncateText('', 30)).toBe('')
  })

  it('高频标签检测正确', () => {
    fc.assert(
      fc.property(
        fc.array(tagArbitrary, { minLength: 0, maxLength: 5 }),
        (tags) => {
          const hasHighFreq = hasHighFrequencyTag(tags)
          const actualHasHighFreq = tags.some(t => t.type === 'high_frequency')
          return hasHighFreq === actualHasHighFreq
        }
      ),
      { numRuns: 100 }
    )
  })

  it('显示标签排除高频标签且数量不超过限制', () => {
    fc.assert(
      fc.property(
        fc.array(tagArbitrary, { minLength: 0, maxLength: 10 }),
        fc.integer({ min: 1, max: 5 }),
        (tags, maxCount) => {
          const displayTags = getDisplayTags(tags, maxCount)
          
          // 不应包含高频标签
          const hasHighFreq = displayTags.some(t => t.type === 'high_frequency')
          if (hasHighFreq) return false
          
          // 数量不超过限制
          if (displayTags.length > maxCount) return false
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 5: 考点详情页URL正确性', () => {
  /**
   * Feature: knowledge-learning-path, Property 5: 考点详情页URL正确性
   * Validates: Requirements 1.7
   */

  it('URL格式必须为 /knowledge/point/[id]', () => {
    fc.assert(
      fc.property(fc.uuid(), (pointId) => {
        const url = generatePointUrl(pointId)
        return url === `/knowledge/point/${pointId}`
      }),
      { numRuns: 100 }
    )
  })

  it('URL必须以 /knowledge/point/ 开头', () => {
    fc.assert(
      fc.property(fc.uuid(), (pointId) => {
        const url = generatePointUrl(pointId)
        return url.startsWith('/knowledge/point/')
      }),
      { numRuns: 100 }
    )
  })

  it('URL中的ID与输入ID一致', () => {
    fc.assert(
      fc.property(fc.uuid(), (pointId) => {
        const url = generatePointUrl(pointId)
        const extractedId = url.replace('/knowledge/point/', '')
        return extractedId === pointId
      }),
      { numRuns: 100 }
    )
  })
})

describe('历年考查年份格式化', () => {

  it('空年份数组返回空字符串', () => {
    expect(formatExamYears([])).toBe('')
  })

  it('格式化结果以"年考过"结尾', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 2015, max: 2024 }), { minLength: 1, maxLength: 10 }),
        (years) => {
          const formatted = formatExamYears(years)
          return formatted.endsWith('年考过')
        }
      ),
      { numRuns: 50 }
    )
  })

  it('最多显示指定数量的年份', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 2015, max: 2024 }), { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 1, max: 5 }),
        (years, maxCount) => {
          const formatted = formatExamYears(years, maxCount)
          // 计算显示的年份数量
          const yearPart = formatted.replace('年考过', '')
          const displayedYears = yearPart.split('、').filter(y => y.length > 0)
          return displayedYears.length <= maxCount
        }
      ),
      { numRuns: 50 }
    )
  })
})
