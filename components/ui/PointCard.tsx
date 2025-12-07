/**
 * PointCard 组件（入口卡片）
 * 
 * 显示考点入口卡片，仅包含：
 * - 标题、优先级标签、简介（≤40字）、历年考查年份
 * 
 * 禁止显示：口诀、逻辑图、例题、大段文本内容
 * 
 * Requirements: 1.6, 2.1, 2.2, 7.10
 * Property 3: 考点卡片内容限制
 */

import React from 'react'
import { ChevronRight, Calendar } from 'lucide-react'
import { TagBadge, TagList, PointTag } from './TagBadge'
import { ImportanceStars } from './ImportanceStars'

export interface PointSummary {
  id: string
  code: string
  title: string
  key_takeaway: string  // 一句话简介（≤40字）
  tags: PointTag[]
  exam_years: number[]
  importance: number
  mastery_score: number
}

export interface PointCardProps {
  point: PointSummary
  onClick: (pointId: string) => void
  onScrollTo?: () => void  // 从考点梳理点击时的滚动回调
  className?: string
}

/**
 * 截断简介到40字
 * Property 3: 考点卡片内容限制 - 简介≤40字
 */
function truncateKeyTakeaway(text: string, maxLength: number = 40): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * 格式化考查年份显示
 */
function formatExamYears(years: number[]): string {
  if (!years || years.length === 0) return ''
  const sortedYears = [...years].sort((a, b) => b - a)
  if (sortedYears.length <= 3) {
    return sortedYears.join('、') + ' 考过'
  }
  return `${sortedYears.slice(0, 3).join('、')} 等${sortedYears.length}年考过`
}

/**
 * PointCard 组件
 * 
 * 注意：此组件严格遵循 Property 3 要求，
 * 仅展示：标题、优先级标签、一句话简介（≤40字）、历年考查年份
 * 禁止展示：口诀、逻辑图、例题、大段文本
 */
export function PointCard({ point, onClick, onScrollTo, className = '' }: PointCardProps) {
  const handleClick = () => {
    if (onScrollTo) {
      onScrollTo()
    }
    onClick(point.id)
  }
  
  return (
    <div
      id={`point-card-${point.id}`}
      onClick={handleClick}
      className={`
        bg-white hover:bg-gray-50
        rounded-lg border border-gray-200
        shadow-sm hover:shadow
        cursor-pointer
        transition-all duration-200
        ${className}
      `}
    >
      <div className="p-4">
        {/* 顶部：标题和重要性 */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h5 className="text-sm font-medium text-gray-900 line-clamp-2" title={point.title}>
              {point.title}
            </h5>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <ImportanceStars level={point.importance} size="sm" />
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        
        {/* 标签 */}
        {point.tags.length > 0 && (
          <div className="mb-2">
            <TagList tags={point.tags} size="sm" maxDisplay={3} />
          </div>
        )}
        
        {/* 一句话简介（≤40字） */}
        {point.key_takeaway && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {truncateKeyTakeaway(point.key_takeaway)}
          </p>
        )}
        
        {/* 历年考查年份 */}
        {point.exam_years && point.exam_years.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{formatExamYears(point.exam_years)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 考点卡片列表
 */
export interface PointListProps {
  points: PointSummary[]
  onPointClick: (pointId: string) => void
  className?: string
}

export function PointList({ points, onPointClick, className = '' }: PointListProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {points.map(point => (
        <PointCard
          key={point.id}
          point={point}
          onClick={onPointClick}
        />
      ))}
    </div>
  )
}

/**
 * 考点卡片网格布局
 */
export function PointGrid({ points, onPointClick, className = '' }: PointListProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${className}`}>
      {points.map(point => (
        <PointCard
          key={point.id}
          point={point}
          onClick={onPointClick}
        />
      ))}
    </div>
  )
}

export default PointCard
