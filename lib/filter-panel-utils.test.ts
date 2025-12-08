/**
 * Property tests for FilterPanel utilities
 * 
 * **Feature: knowledge-learning-path, Property 7: 高频筛选正确性**
 * **Feature: knowledge-learning-path, Property 8: 筛选统计正确性**
 * **Feature: knowledge-learning-path, Property 19: 多条件筛选正确性**
 * **Validates: Requirements 3.2, 3.3, 3.4, 13.5**
 */

import fc from 'fast-check'

// Types
export type TagType = 'high_frequency' | 'must_test' | 'easy_mistake' | 'basic' | 'reinforce'
export type DifficultyLevel = 'basic' | 'intermediate' | 'advanced'
export type LearningStatus = 'not_started' | 'learning' | 'mastered' | 'review'

export interface FilterPanelOptions {
  tags: TagType[]
  difficulty: DifficultyLevel[]
  status: LearningStatus[]
  showFavorites: boolean
  showReview: boolean
}

export interface PointData {
  id: string
  title: string
  tags: TagType[]
  difficulty: DifficultyLevel
  status: LearningStatus
  importance: number
  isFavorite: boolean
  isReview: boolean
}

export const DEFAULT_FILTER_PANEL_OPTIONS: FilterPanelOptions = {
  tags: [],
  difficulty: [],
  status: [],
  showFavorites: false,
  showReview: false
}

// Utility functions to test
export function hasActiveFilterPanel(filters: FilterPanelOptions): boolean {
  return (
    filters.tags.length > 0 ||
    filters.difficulty.length > 0 ||
    filters.status.length > 0 ||
    filters.showFavorites ||
    filters.showReview
  )
}

export function matchesTagFilter(point: PointData, filterTags: TagType[]): boolean {
  if (filterTags.length === 0) return true
  // 考点必须包含至少一个筛选标签
  return filterTags.some(tag => point.tags.includes(tag))
}

export function matchesDifficultyFilter(point: PointData, filterDifficulty: DifficultyLevel[]): boolean {
  if (filterDifficulty.length === 0) return true
  return filterDifficulty.includes(point.difficulty)
}

export function matchesStatusFilter(point: PointData, filterStatus: LearningStatus[]): boolean {
  if (filterStatus.length === 0) return true
  return filterStatus.includes(point.status)
}

export function matchesFavoriteFilter(point: PointData, showFavorites: boolean): boolean {
  if (!showFavorites) return true
  return point.isFavorite
}

export function matchesReviewFilter(point: PointData, showReview: boolean): boolean {
  if (!showReview) return true
  return point.isReview
}

export function matchesAllPanelFilters(point: PointData, filters: FilterPanelOptions): boolean {
  return (
    matchesTagFilter(point, filters.tags) &&
    matchesDifficultyFilter(point, filters.difficulty) &&
    matchesStatusFilter(point, filters.status) &&
    matchesFavoriteFilter(point, filters.showFavorites) &&
    matchesReviewFilter(point, filters.showReview)
  )
}

export function filterPointsByPanel(points: PointData[], filters: FilterPanelOptions): PointData[] {
  return points.filter(point => matchesAllPanelFilters(point, filters))
}

export function calculatePanelFilterStats(points: PointData[], filters: FilterPanelOptions): {
  matchCount: number
  totalCount: number
} {
  const filtered = filterPointsByPanel(points, filters)
  return {
    matchCount: filtered.length,
    totalCount: points.length
  }
}

export function isHighFrequencyPoint(point: PointData): boolean {
  return point.tags.includes('high_frequency') || point.importance >= 4
}

export function filterHighFrequencyPoints(points: PointData[]): PointData[] {
  return points.filter(isHighFrequencyPoint)
}

// Arbitraries
const tagTypeArbitrary = fc.constantFrom<TagType>(
  'high_frequency', 'must_test', 'easy_mistake', 'basic', 'reinforce'
)

const difficultyArbitrary = fc.constantFrom<DifficultyLevel>('basic', 'intermediate', 'advanced')

const statusArbitrary = fc.constantFrom<LearningStatus>('not_started', 'learning', 'mastered', 'review')

const pointDataArbitrary: fc.Arbitrary<PointData> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  tags: fc.array(tagTypeArbitrary, { minLength: 0, maxLength: 3 }),
  difficulty: difficultyArbitrary,
  status: statusArbitrary,
  importance: fc.integer({ min: 1, max: 5 }),
  isFavorite: fc.boolean(),
  isReview: fc.boolean()
})

const filterOptionsArbitrary: fc.Arbitrary<FilterPanelOptions> = fc.record({
  tags: fc.array(tagTypeArbitrary, { minLength: 0, maxLength: 3 }),
  difficulty: fc.array(difficultyArbitrary, { minLength: 0, maxLength: 2 }),
  status: fc.array(statusArbitrary, { minLength: 0, maxLength: 2 }),
  showFavorites: fc.boolean(),
  showReview: fc.boolean()
})

const pointsListArbitrary = fc.array(pointDataArbitrary, { minLength: 0, maxLength: 20 })

describe('Property 7: 高频筛选正确性', () => {
  /**
   * Feature: knowledge-learning-path, Property 7: 高频筛选正确性
   * Validates: Requirements 3.2, 3.3
   */

  it('高频筛选结果只包含高频考点', () => {
    fc.assert(
      fc.property(pointsListArbitrary, (points) => {
        const filters: FilterPanelOptions = {
          ...DEFAULT_FILTER_PANEL_OPTIONS,
          tags: ['high_frequency']
        }
        const filtered = filterPointsByPanel(points, filters)
        
        // 所有结果必须包含高频标签
        return filtered.every(p => p.tags.includes('high_frequency'))
      }),
      { numRuns: 100 }
    )
  })

  it('高频筛选不遗漏任何高频考点', () => {
    fc.assert(
      fc.property(pointsListArbitrary, (points) => {
        const filters: FilterPanelOptions = {
          ...DEFAULT_FILTER_PANEL_OPTIONS,
          tags: ['high_frequency']
        }
        const filtered = filterPointsByPanel(points, filters)
        const filteredIds = new Set(filtered.map(p => p.id))
        
        // 检查所有高频考点都在结果中
        for (const point of points) {
          if (point.tags.includes('high_frequency')) {
            if (!filteredIds.has(point.id)) return false
          }
        }
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('isHighFrequencyPoint 正确识别高频考点', () => {
    fc.assert(
      fc.property(pointDataArbitrary, (point) => {
        const isHighFreq = isHighFrequencyPoint(point)
        const expected = point.tags.includes('high_frequency') || point.importance >= 4
        return isHighFreq === expected
      }),
      { numRuns: 100 }
    )
  })
})

describe('Property 8: 筛选统计正确性', () => {
  /**
   * Feature: knowledge-learning-path, Property 8: 筛选统计正确性
   * Validates: Requirements 3.4
   */

  it('matchCount 等于实际筛选结果数量', () => {
    fc.assert(
      fc.property(pointsListArbitrary, filterOptionsArbitrary, (points, filters) => {
        const stats = calculatePanelFilterStats(points, filters)
        const filtered = filterPointsByPanel(points, filters)
        return stats.matchCount === filtered.length
      }),
      { numRuns: 100 }
    )
  })

  it('totalCount 等于原始考点数量', () => {
    fc.assert(
      fc.property(pointsListArbitrary, filterOptionsArbitrary, (points, filters) => {
        const stats = calculatePanelFilterStats(points, filters)
        return stats.totalCount === points.length
      }),
      { numRuns: 100 }
    )
  })

  it('空筛选条件返回所有考点', () => {
    fc.assert(
      fc.property(pointsListArbitrary, (points) => {
        const stats = calculatePanelFilterStats(points, DEFAULT_FILTER_PANEL_OPTIONS)
        return stats.matchCount === stats.totalCount
      }),
      { numRuns: 100 }
    )
  })
})

describe('Property 19: 多条件筛选正确性', () => {
  /**
   * Feature: knowledge-learning-path, Property 19: 多条件筛选正确性
   * Validates: Requirements 13.5
   */

  it('多条件筛选结果同时满足所有条件（AND逻辑）', () => {
    fc.assert(
      fc.property(pointsListArbitrary, filterOptionsArbitrary, (points, filters) => {
        const filtered = filterPointsByPanel(points, filters)
        
        // 验证每个结果都满足所有条件
        return filtered.every(point => {
          // 标签条件
          if (filters.tags.length > 0 && !filters.tags.some(t => point.tags.includes(t))) {
            return false
          }
          // 难度条件
          if (filters.difficulty.length > 0 && !filters.difficulty.includes(point.difficulty)) {
            return false
          }
          // 状态条件
          if (filters.status.length > 0 && !filters.status.includes(point.status)) {
            return false
          }
          // 收藏条件
          if (filters.showFavorites && !point.isFavorite) {
            return false
          }
          // 复习条件
          if (filters.showReview && !point.isReview) {
            return false
          }
          return true
        })
      }),
      { numRuns: 100 }
    )
  })

  it('多条件筛选不遗漏任何满足条件的考点', () => {
    fc.assert(
      fc.property(pointsListArbitrary, filterOptionsArbitrary, (points, filters) => {
        const filtered = filterPointsByPanel(points, filters)
        const filteredIds = new Set(filtered.map(p => p.id))
        
        // 检查所有满足条件的考点都在结果中
        for (const point of points) {
          if (matchesAllPanelFilters(point, filters)) {
            if (!filteredIds.has(point.id)) return false
          }
        }
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('添加收藏或复习筛选条件不会增加结果数量', () => {
    fc.assert(
      fc.property(
        pointsListArbitrary,
        filterOptionsArbitrary,
        (points, baseFilters) => {
          // 测试添加 showFavorites 条件
          if (!baseFilters.showFavorites) {
            const baseFiltered = filterPointsByPanel(points, baseFilters)
            const extendedFilters: FilterPanelOptions = {
              ...baseFilters,
              showFavorites: true
            }
            const extendedFiltered = filterPointsByPanel(points, extendedFilters)
            
            // 添加收藏条件后结果数量不应增加
            if (extendedFiltered.length > baseFiltered.length) return false
          }
          
          // 测试添加 showReview 条件
          if (!baseFilters.showReview) {
            const baseFiltered = filterPointsByPanel(points, baseFilters)
            const extendedFilters: FilterPanelOptions = {
              ...baseFilters,
              showReview: true
            }
            const extendedFiltered = filterPointsByPanel(points, extendedFilters)
            
            // 添加复习条件后结果数量不应增加
            if (extendedFiltered.length > baseFiltered.length) return false
          }
          
          return true
        }
      ),
      { numRuns: 50 }
    )
  })
  
  it('标签筛选使用OR逻辑（满足任一标签即可）', () => {
    fc.assert(
      fc.property(
        pointsListArbitrary,
        fc.array(tagTypeArbitrary, { minLength: 1, maxLength: 3 }),
        (points, filterTags) => {
          const filters: FilterPanelOptions = {
            ...DEFAULT_FILTER_PANEL_OPTIONS,
            tags: filterTags
          }
          const filtered = filterPointsByPanel(points, filters)
          
          // 验证每个结果至少包含一个筛选标签
          return filtered.every(point => 
            filterTags.some(tag => point.tags.includes(tag))
          )
        }
      ),
      { numRuns: 50 }
    )
  })
})

describe('辅助函数测试', () => {

  it('hasActiveFilterPanel 对默认筛选返回 false', () => {
    expect(hasActiveFilterPanel(DEFAULT_FILTER_PANEL_OPTIONS)).toBe(false)
  })

  it('hasActiveFilterPanel 对有标签筛选返回 true', () => {
    expect(hasActiveFilterPanel({ ...DEFAULT_FILTER_PANEL_OPTIONS, tags: ['high_frequency'] })).toBe(true)
  })

  it('hasActiveFilterPanel 对有难度筛选返回 true', () => {
    expect(hasActiveFilterPanel({ ...DEFAULT_FILTER_PANEL_OPTIONS, difficulty: ['basic'] })).toBe(true)
  })

  it('hasActiveFilterPanel 对有状态筛选返回 true', () => {
    expect(hasActiveFilterPanel({ ...DEFAULT_FILTER_PANEL_OPTIONS, status: ['mastered'] })).toBe(true)
  })

  it('hasActiveFilterPanel 对只看收藏返回 true', () => {
    expect(hasActiveFilterPanel({ ...DEFAULT_FILTER_PANEL_OPTIONS, showFavorites: true })).toBe(true)
  })

  it('hasActiveFilterPanel 对只看待复习返回 true', () => {
    expect(hasActiveFilterPanel({ ...DEFAULT_FILTER_PANEL_OPTIONS, showReview: true })).toBe(true)
  })
})
