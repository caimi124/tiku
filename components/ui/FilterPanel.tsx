/**
 * FilterPanel 组件
 * 
 * 多维度筛选面板，用于首页知识点筛选
 * 
 * 功能：
 * - 支持按标签筛选：高频、必考、易错、基础、强化（多选）
 * - 支持按难度筛选：基础、进阶、冲刺
 * - 支持按学习状态筛选：未学习、学习中、已掌握、待复习
 * - 支持只看收藏、只看待复习
 * - 显示筛选后的考点数量
 * 
 * Requirements: 3.1, 13.1, 13.2, 13.3, 13.4, 13.6
 */

'use client'

import React, { useState } from 'react'
import { 
  Filter, X, ChevronDown, ChevronUp, 
  Zap, Star, AlertTriangle, BookOpen, Target,
  Heart, Clock
} from 'lucide-react'

// 标签类型
export type TagType = 'high_frequency' | 'must_test' | 'easy_mistake' | 'basic' | 'reinforce'

// 难度等级
export type DifficultyLevel = 'basic' | 'intermediate' | 'advanced'

// 学习状态
export type LearningStatus = 'not_started' | 'learning' | 'mastered' | 'review'

// 筛选选项
export interface FilterPanelOptions {
  tags: TagType[]
  difficulty: DifficultyLevel[]
  status: LearningStatus[]
  showFavorites: boolean
  showReview: boolean
}

// 默认筛选选项
export const DEFAULT_FILTER_PANEL_OPTIONS: FilterPanelOptions = {
  tags: [],
  difficulty: [],
  status: [],
  showFavorites: false,
  showReview: false
}

export interface FilterPanelProps {
  filters: FilterPanelOptions
  onChange: (filters: FilterPanelOptions) => void
  matchCount: number
  totalCount?: number
  className?: string
  collapsed?: boolean
}

// 标签选项配置
const TAG_OPTIONS: { value: TagType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'high_frequency', label: '高频', icon: <Zap className="w-3.5 h-3.5" />, color: 'red' },
  { value: 'must_test', label: '必考', icon: <Star className="w-3.5 h-3.5" />, color: 'orange' },
  { value: 'easy_mistake', label: '易错', icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'yellow' },
  { value: 'basic', label: '基础', icon: <BookOpen className="w-3.5 h-3.5" />, color: 'green' },
  { value: 'reinforce', label: '强化', icon: <Target className="w-3.5 h-3.5" />, color: 'purple' }
]

// 难度选项配置
const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: 'basic', label: '基础' },
  { value: 'intermediate', label: '进阶' },
  { value: 'advanced', label: '冲刺' }
]

// 学习状态选项配置
const STATUS_OPTIONS: { value: LearningStatus; label: string; color: string }[] = [
  { value: 'not_started', label: '未学习', color: 'gray' },
  { value: 'learning', label: '学习中', color: 'blue' },
  { value: 'mastered', label: '已掌握', color: 'green' },
  { value: 'review', label: '待复习', color: 'orange' }
]

/**
 * 获取标签颜色类名
 */
function getTagColorClass(color: string, isActive: boolean): string {
  const colorMap: Record<string, { active: string; inactive: string }> = {
    red: { active: 'bg-red-500 text-white', inactive: 'bg-red-50 text-red-600 hover:bg-red-100' },
    orange: { active: 'bg-orange-500 text-white', inactive: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
    yellow: { active: 'bg-yellow-500 text-white', inactive: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
    green: { active: 'bg-green-500 text-white', inactive: 'bg-green-50 text-green-600 hover:bg-green-100' },
    purple: { active: 'bg-purple-500 text-white', inactive: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
    blue: { active: 'bg-blue-500 text-white', inactive: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    gray: { active: 'bg-gray-500 text-white', inactive: 'bg-gray-100 text-gray-600 hover:bg-gray-200' }
  }
  return colorMap[color]?.[isActive ? 'active' : 'inactive'] || colorMap.gray[isActive ? 'active' : 'inactive']
}

/**
 * 检查是否有活动筛选
 */
export function hasActiveFilterPanel(filters: FilterPanelOptions): boolean {
  return (
    filters.tags.length > 0 ||
    filters.difficulty.length > 0 ||
    filters.status.length > 0 ||
    filters.showFavorites ||
    filters.showReview
  )
}

export function FilterPanel({
  filters,
  onChange,
  matchCount,
  totalCount,
  className = '',
  collapsed: initialCollapsed = false
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(!initialCollapsed)
  const hasActive = hasActiveFilterPanel(filters)
  
  // 切换标签
  const toggleTag = (tag: TagType) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    onChange({ ...filters, tags: newTags })
  }
  
  // 切换难度
  const toggleDifficulty = (difficulty: DifficultyLevel) => {
    const newDifficulty = filters.difficulty.includes(difficulty)
      ? filters.difficulty.filter(d => d !== difficulty)
      : [...filters.difficulty, difficulty]
    onChange({ ...filters, difficulty: newDifficulty })
  }
  
  // 切换状态
  const toggleStatus = (status: LearningStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status]
    onChange({ ...filters, status: newStatus })
  }
  
  // 重置筛选
  const resetFilters = () => {
    onChange(DEFAULT_FILTER_PANEL_OPTIONS)
  }
  
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {/* 头部 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-700">筛选</span>
          {hasActive && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
              已筛选
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {matchCount}{totalCount ? `/${totalCount}` : ''} 考点
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>
      
      {/* 展开内容 */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
          {/* 标签筛选 */}
          <div className="pt-3">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              按标签
            </label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map(option => {
                const isActive = filters.tags.includes(option.value)
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleTag(option.value)}
                    className={`
                      flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                      transition-colors
                      ${getTagColorClass(option.color, isActive)}
                    `}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* 难度筛选 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              按难度
            </label>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_OPTIONS.map(option => {
                const isActive = filters.difficulty.includes(option.value)
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleDifficulty(option.value)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                      ${isActive 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* 学习状态筛选 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              按学习状态
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(option => {
                const isActive = filters.status.includes(option.value)
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleStatus(option.value)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                      ${getTagColorClass(option.color, isActive)}
                    `}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* 快捷筛选 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              快捷筛选
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onChange({ ...filters, showFavorites: !filters.showFavorites })}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${filters.showFavorites 
                    ? 'bg-red-500 text-white' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }
                `}
              >
                <Heart className="w-3.5 h-3.5" />
                只看收藏
              </button>
              <button
                onClick={() => onChange({ ...filters, showReview: !filters.showReview })}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${filters.showReview 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                  }
                `}
              >
                <Clock className="w-3.5 h-3.5" />
                只看待复习
              </button>
            </div>
          </div>
          
          {/* 重置按钮 */}
          {hasActive && (
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                清除所有筛选
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FilterPanel
