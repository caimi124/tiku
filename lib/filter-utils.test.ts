/**
 * Property tests for FilterBar utilities
 * 
 * **Feature: knowledge-page-redesign, Property 13: 筛选功能正确性**
 * **Feature: knowledge-page-redesign, Property 14: 筛选结果统计正确性**
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
 */

import fc from 'fast-check'
import {
  FilterOptions,
  MasteryFilter,
  ImportanceFilter,
  ContentTypeFilter,
  DEFAULT_FILTER,
  MASTERY_OPTIONS,
  IMPORTANCE_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  matchesMasteryFilter,
  matchesImportanceFilter,
  matchesAllFilters,
  filterPoints,
  calculateFilterStats,
  isValidFilter,
  resetFilters,
  hasActiveFilters
} from './filter-utils'
import { KnowledgeChapter, KnowledgePoint, MasteryStatus } from './knowledge-tree-utils'

// Arbitraries
const masteryStatusArbitrary = fc.constantFrom<MasteryStatus>('mastered', 'review', 'weak', 'unlearned')
const masteryFilterArbitrary = fc.constantFrom<MasteryFilter>('all', 'mastered', 'review', 'weak', 'unlearned')
const importanceFilterArbitrary = fc.constantFrom<ImportanceFilter>('all', 'high', 'medium', 'low')
const contentTypeFilterArbitrary = fc.constantFrom<ContentTypeFilter>('all', 'mechanism', 'adverse', 'clinical', 'interaction')

const filterOptionsArbitrary: fc.Arbitrary<FilterOptions> = fc.record({
  masteryStatus: masteryFilterArbitrary,
  importance: importanceFilterArbitrary,
  contentType: contentTypeFilterArbitrary
})

const pointArbitrary: fc.Arbitrary<KnowledgePoint> = fc.record({
  id: fc.uuid(),
  code: fc.string({ minLength: 1, maxLength: 10 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  nodeType: fc.constant('point' as const),
  drugName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  importance: fc.integer({ min: 1, max: 5 }),
  masteryStatus: masteryStatusArbitrary,
  masteryScore: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined })
})


const sectionArbitrary = fc.record({
  id: fc.uuid(),
  code: fc.string({ minLength: 1, maxLength: 10 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  nodeType: fc.constant('section' as const),
  masteryScore: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
  pointCount: fc.integer({ min: 0, max: 50 }),
  highFrequencyCount: fc.integer({ min: 0, max: 20 }),
  children: fc.array(pointArbitrary, { minLength: 0, maxLength: 5 })
})

const chapterArbitrary: fc.Arbitrary<KnowledgeChapter> = fc.record({
  id: fc.uuid(),
  code: fc.string({ minLength: 1, maxLength: 10 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  nodeType: fc.constant('chapter' as const),
  masteryScore: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
  pointCount: fc.integer({ min: 0, max: 100 }),
  highFrequencyCount: fc.integer({ min: 0, max: 50 }),
  children: fc.array(sectionArbitrary, { minLength: 0, maxLength: 5 })
})

const treeArbitrary = fc.array(chapterArbitrary, { minLength: 0, maxLength: 3 })

describe('Property 13: 筛选功能正确性', () => {

  it('掌握状态筛选：all 匹配所有考点', () => {
    fc.assert(
      fc.property(pointArbitrary, (point) => {
        return matchesMasteryFilter(point, 'all') === true
      }),
      { numRuns: 50 }
    )
  })

  it('掌握状态筛选：具体状态只匹配对应考点', () => {
    fc.assert(
      fc.property(pointArbitrary, masteryStatusArbitrary, (point, filterStatus) => {
        const matches = matchesMasteryFilter(point, filterStatus)
        return matches === (point.masteryStatus === filterStatus)
      }),
      { numRuns: 50 }
    )
  })

  it('重要性筛选：all 匹配所有考点', () => {
    fc.assert(
      fc.property(pointArbitrary, (point) => {
        return matchesImportanceFilter(point, 'all') === true
      }),
      { numRuns: 50 }
    )
  })

  it('重要性筛选：high 只匹配 importance >= 4', () => {
    fc.assert(
      fc.property(pointArbitrary, (point) => {
        const matches = matchesImportanceFilter(point, 'high')
        return matches === (point.importance >= 4)
      }),
      { numRuns: 50 }
    )
  })

  it('重要性筛选：medium 只匹配 importance === 3', () => {
    fc.assert(
      fc.property(pointArbitrary, (point) => {
        const matches = matchesImportanceFilter(point, 'medium')
        return matches === (point.importance === 3)
      }),
      { numRuns: 50 }
    )
  })

  it('重要性筛选：low 只匹配 importance <= 2', () => {
    fc.assert(
      fc.property(pointArbitrary, (point) => {
        const matches = matchesImportanceFilter(point, 'low')
        return matches === (point.importance <= 2)
      }),
      { numRuns: 50 }
    )
  })

  it('组合筛选：结果满足所有条件', () => {
    fc.assert(
      fc.property(pointArbitrary, filterOptionsArbitrary, (point, filters) => {
        const matches = matchesAllFilters(point, filters)
        
        if (matches) {
          // 如果匹配，必须满足所有条件
          const masteryOk = filters.masteryStatus === 'all' || point.masteryStatus === filters.masteryStatus
          const importanceOk = matchesImportanceFilter(point, filters.importance)
          return masteryOk && importanceOk
        }
        return true
      }),
      { numRuns: 50 }
    )
  })

  it('filterPoints 返回的所有考点都满足筛选条件', () => {
    fc.assert(
      fc.property(treeArbitrary, filterOptionsArbitrary, (tree, filters) => {
        const filtered = filterPoints(tree, filters)
        return filtered.every(point => matchesAllFilters(point, filters))
      }),
      { numRuns: 30 }
    )
  })

  it('filterPoints 不遗漏任何满足条件的考点', () => {
    fc.assert(
      fc.property(treeArbitrary, filterOptionsArbitrary, (tree, filters) => {
        const filtered = filterPoints(tree, filters)
        const filteredIds = new Set(filtered.map(p => p.id))
        
        // 检查树中所有满足条件的考点都在结果中
        for (const chapter of tree) {
          for (const section of chapter.children) {
            for (const point of section.children) {
              if (matchesAllFilters(point, filters)) {
                if (!filteredIds.has(point.id)) return false
              }
            }
          }
        }
        return true
      }),
      { numRuns: 30 }
    )
  })
})

describe('Property 14: 筛选结果统计正确性', () => {

  it('matchCount 等于实际筛选结果数量', () => {
    fc.assert(
      fc.property(treeArbitrary, filterOptionsArbitrary, (tree, filters) => {
        const stats = calculateFilterStats(tree, filters)
        const filtered = filterPoints(tree, filters)
        return stats.matchCount === filtered.length
      }),
      { numRuns: 30 }
    )
  })

  it('estimatedTime 基于 matchCount 计算', () => {
    fc.assert(
      fc.property(treeArbitrary, filterOptionsArbitrary, (tree, filters) => {
        const stats = calculateFilterStats(tree, filters)
        return stats.estimatedTime === stats.matchCount * 5
      }),
      { numRuns: 30 }
    )
  })

  it('空树返回 0 统计', () => {
    const stats = calculateFilterStats([], DEFAULT_FILTER)
    expect(stats.matchCount).toBe(0)
    expect(stats.estimatedTime).toBe(0)
  })
})

describe('辅助函数测试', () => {

  it('isValidFilter 对有效筛选条件返回 true', () => {
    fc.assert(
      fc.property(filterOptionsArbitrary, (filters) => {
        return isValidFilter(filters) === true
      }),
      { numRuns: 30 }
    )
  })

  it('resetFilters 返回默认筛选条件', () => {
    const reset = resetFilters()
    expect(reset).toEqual(DEFAULT_FILTER)
  })

  it('hasActiveFilters 对默认筛选返回 false', () => {
    expect(hasActiveFilters(DEFAULT_FILTER)).toBe(false)
  })

  it('hasActiveFilters 对非默认筛选返回 true', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTER, masteryStatus: 'mastered' })).toBe(true)
    expect(hasActiveFilters({ ...DEFAULT_FILTER, importance: 'high' })).toBe(true)
    expect(hasActiveFilters({ ...DEFAULT_FILTER, contentType: 'mechanism' })).toBe(true)
  })

  it('MASTERY_OPTIONS 包含所有选项', () => {
    expect(MASTERY_OPTIONS.length).toBe(5)
    expect(MASTERY_OPTIONS.map(o => o.value)).toContain('all')
    expect(MASTERY_OPTIONS.map(o => o.value)).toContain('mastered')
    expect(MASTERY_OPTIONS.map(o => o.value)).toContain('review')
    expect(MASTERY_OPTIONS.map(o => o.value)).toContain('weak')
    expect(MASTERY_OPTIONS.map(o => o.value)).toContain('unlearned')
  })

  it('IMPORTANCE_OPTIONS 包含所有选项', () => {
    expect(IMPORTANCE_OPTIONS.length).toBe(4)
    expect(IMPORTANCE_OPTIONS.map(o => o.value)).toContain('all')
    expect(IMPORTANCE_OPTIONS.map(o => o.value)).toContain('high')
    expect(IMPORTANCE_OPTIONS.map(o => o.value)).toContain('medium')
    expect(IMPORTANCE_OPTIONS.map(o => o.value)).toContain('low')
  })

  it('CONTENT_TYPE_OPTIONS 包含所有选项', () => {
    expect(CONTENT_TYPE_OPTIONS.length).toBe(5)
    expect(CONTENT_TYPE_OPTIONS.map(o => o.value)).toContain('all')
    expect(CONTENT_TYPE_OPTIONS.map(o => o.value)).toContain('mechanism')
    expect(CONTENT_TYPE_OPTIONS.map(o => o.value)).toContain('adverse')
    expect(CONTENT_TYPE_OPTIONS.map(o => o.value)).toContain('clinical')
    expect(CONTENT_TYPE_OPTIONS.map(o => o.value)).toContain('interaction')
  })
})
