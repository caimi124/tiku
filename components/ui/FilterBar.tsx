/**
 * FilterBar 组件
 * 知识点筛选栏
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

'use client'

import React from 'react'
import {
  FilterOptions,
  MasteryFilter,
  ImportanceFilter,
  ContentTypeFilter,
  MASTERY_OPTIONS,
  IMPORTANCE_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  DEFAULT_FILTER,
  hasActiveFilters,
  FilterStats
} from '@/lib/filter-utils'

export interface FilterBarProps {
  filters: FilterOptions
  stats?: FilterStats
  onFilterChange: (filters: FilterOptions) => void
  onReset?: () => void
  className?: string
}

export function FilterBar({
  filters,
  stats,
  onFilterChange,
  onReset,
  className = ''
}: FilterBarProps) {
  const handleMasteryChange = (value: MasteryFilter) => {
    onFilterChange({ ...filters, masteryStatus: value })
  }

  const handleImportanceChange = (value: ImportanceFilter) => {
    onFilterChange({ ...filters, importance: value })
  }

  const handleContentTypeChange = (value: ContentTypeFilter) => {
    onFilterChange({ ...filters, contentType: value })
  }

  const handleReset = () => {
    onFilterChange(DEFAULT_FILTER)
    onReset?.()
  }

  const isActive = hasActiveFilters(filters)

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">筛选条件</h3>
        {isActive && (
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            重置
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* 掌握状态筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            掌握状态
          </label>
          <div className="flex flex-wrap gap-2">
            {MASTERY_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleMasteryChange(option.value)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  filters.masteryStatus === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 重要性筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            重要性
          </label>
          <div className="flex flex-wrap gap-2">
            {IMPORTANCE_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleImportanceChange(option.value)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  filters.importance === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 内容类型筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            内容类型
          </label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPE_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleContentTypeChange(option.value)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  filters.contentType === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 筛选结果统计 */}
      {stats && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              匹配 <span className="font-semibold text-gray-800">{stats.matchCount}</span> 个考点
            </span>
            <span className="text-gray-500">
              预计 {stats.estimatedTime} 分钟
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// 导出类型和工具函数
export type { FilterOptions, FilterStats, MasteryFilter, ImportanceFilter, ContentTypeFilter }
export { DEFAULT_FILTER, hasActiveFilters }
