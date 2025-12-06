/**
 * FilterBar 工具函数
 * 用于知识点筛选功能
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import { KnowledgeChapter, KnowledgePoint, MasteryStatus } from './knowledge-tree-utils'
import { ContentType } from './content-type-utils'

// 筛选条件类型
export type MasteryFilter = 'all' | MasteryStatus
export type ImportanceFilter = 'all' | 'high' | 'medium' | 'low'
export type ContentTypeFilter = 'all' | ContentType

// 筛选条件
export interface FilterOptions {
  masteryStatus: MasteryFilter
  importance: ImportanceFilter
  contentType: ContentTypeFilter
}

// 默认筛选条件
export const DEFAULT_FILTER: FilterOptions = {
  masteryStatus: 'all',
  importance: 'all',
  contentType: 'all'
}

// 掌握状态选项
export const MASTERY_OPTIONS: { value: MasteryFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'unlearned', label: '未学习' },
  { value: 'weak', label: '薄弱' },
  { value: 'review', label: '需复习' },
  { value: 'mastered', label: '已掌握' }
]

// 重要性选项
export const IMPORTANCE_OPTIONS: { value: ImportanceFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'high', label: '高频' },
  { value: 'medium', label: '中频' },
  { value: 'low', label: '低频' }
]

// 内容类型选项
export const CONTENT_TYPE_OPTIONS: { value: ContentTypeFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'mechanism', label: '作用机制' },
  { value: 'adverse', label: '不良反应' },
  { value: 'clinical', label: '临床应用' },
  { value: 'interaction', label: '相互作用' }
]


/**
 * 检查考点是否匹配掌握状态筛选
 */
export function matchesMasteryFilter(point: KnowledgePoint, filter: MasteryFilter): boolean {
  if (filter === 'all') return true
  return point.masteryStatus === filter
}

/**
 * 检查考点是否匹配重要性筛选
 */
export function matchesImportanceFilter(point: KnowledgePoint, filter: ImportanceFilter): boolean {
  if (filter === 'all') return true
  
  switch (filter) {
    case 'high':
      return point.importance >= 4
    case 'medium':
      return point.importance === 3
    case 'low':
      return point.importance <= 2
    default:
      return true
  }
}

/**
 * 检查考点是否匹配所有筛选条件
 * 注意：contentType 筛选需要考点内容数据，这里简化处理
 */
export function matchesAllFilters(
  point: KnowledgePoint,
  filters: FilterOptions
): boolean {
  return (
    matchesMasteryFilter(point, filters.masteryStatus) &&
    matchesImportanceFilter(point, filters.importance)
    // contentType 筛选需要额外的内容数据，在实际使用时处理
  )
}

/**
 * 筛选树中的考点
 */
export function filterPoints(
  tree: KnowledgeChapter[],
  filters: FilterOptions
): KnowledgePoint[] {
  const result: KnowledgePoint[] = []
  
  for (const chapter of tree) {
    for (const section of chapter.children) {
      for (const point of section.children) {
        if (matchesAllFilters(point, filters)) {
          result.push(point)
        }
      }
    }
  }
  
  return result
}

/**
 * 统计筛选结果
 */
export interface FilterStats {
  matchCount: number
  estimatedTime: number  // 预计学习时间（分钟）
}

/**
 * 计算筛选结果统计
 * 假设每个考点平均学习时间为 5 分钟
 */
export function calculateFilterStats(
  tree: KnowledgeChapter[],
  filters: FilterOptions
): FilterStats {
  const matchedPoints = filterPoints(tree, filters)
  const matchCount = matchedPoints.length
  const estimatedTime = matchCount * 5  // 每个考点 5 分钟
  
  return {
    matchCount,
    estimatedTime
  }
}

/**
 * 验证筛选条件是否有效
 */
export function isValidFilter(filters: FilterOptions): boolean {
  const validMastery = MASTERY_OPTIONS.some(opt => opt.value === filters.masteryStatus)
  const validImportance = IMPORTANCE_OPTIONS.some(opt => opt.value === filters.importance)
  const validContentType = CONTENT_TYPE_OPTIONS.some(opt => opt.value === filters.contentType)
  
  return validMastery && validImportance && validContentType
}

/**
 * 重置筛选条件
 */
export function resetFilters(): FilterOptions {
  return { ...DEFAULT_FILTER }
}

/**
 * 检查是否有活动的筛选条件
 */
export function hasActiveFilters(filters: FilterOptions): boolean {
  return (
    filters.masteryStatus !== 'all' ||
    filters.importance !== 'all' ||
    filters.contentType !== 'all'
  )
}
