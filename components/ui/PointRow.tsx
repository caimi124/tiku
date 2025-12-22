/**
 * PointRow 组件
 * 
 * 考点行组件，用于首页手风琴内的考点列表
 * 
 * 功能：
 * - 显示考点标题、重要性星级、高频标签、一句话简介
 * - 简介限制30字，超出截断
 * - 显示收藏/标记图标
 * - 支持点击跳转到详情页
 * 
 * Requirements: 1.6, 1.7, 12.3
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { Star, Heart, Clock, ChevronRight } from 'lucide-react'

export interface PointTag {
  type: string
  label: string
  color: string
}

export interface PointRowProps {
  id: string
  code: string
  title: string
  keyTakeaway: string
  importance: number
  tags: PointTag[]
  examYears?: number[]
  isFavorite?: boolean
  isReview?: boolean
  isHighlighted?: boolean
  onClick?: (id: string) => void
  learnMode?: 'MEMORIZE' | 'PRACTICE' | 'BOTH'
  importanceLevel?: number
}

/**
 * 渲染重要性星级
 */
function renderStars(importance: number) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= importance 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

/**
 * 截断简介到30字
 */
function truncateText(text: string, maxLength: number = 30): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const LEARN_MODE_META: Record<'MEMORIZE' | 'PRACTICE' | 'BOTH', { label: string; className: string }> = {
  MEMORIZE: { label: '必背', className: 'bg-amber-100 text-amber-700' },
  PRACTICE: { label: '多练', className: 'bg-emerald-100 text-emerald-700' },
  BOTH: { label: '背+练', className: 'bg-slate-100 text-slate-700' },
}

function getLearnModeMeta(mode?: 'MEMORIZE' | 'PRACTICE' | 'BOTH') {
  return (mode && LEARN_MODE_META[mode]) || LEARN_MODE_META.BOTH
}

function getImportanceBadge(level?: number) {
  if ((level ?? 0) >= 4) {
    return { symbol: '🔥', label: '高频', className: 'bg-red-100 text-red-600' }
  }
  if ((level ?? 0) === 3) {
    return { symbol: '🟡', label: '常考', className: 'bg-amber-100 text-amber-600' }
  }
  return { symbol: '⚪', label: '低频', className: 'bg-slate-100 text-slate-500' }
}

export function PointRow({
  id,
  code,
  title,
  keyTakeaway,
  importance,
  importanceLevel,
  tags,
  examYears = [],
  isFavorite = false,
  isReview = false,
  isHighlighted = false,
  onClick,
  learnMode
}: PointRowProps) {
  const hasHighFrequencyTag = tags.some(t => t.type === 'high_frequency')
  const effectiveImportanceLevel = importanceLevel ?? importance
  const importanceBadge = getImportanceBadge(effectiveImportanceLevel)
  const learnModeMeta = getLearnModeMeta(learnMode)
  
  const handleClick = (e: React.MouseEvent) => {
    // 如果有onClick回调，先调用它（用于保存状态等）
    // 但不阻止Link的默认导航行为
    if (onClick) {
      onClick(id)
    }
  }
  
  return (
    <Link
      href={`/knowledge/point/${id}`}
      onClick={handleClick}
      className={`
        block px-3 py-2.5 rounded-lg
        hover:bg-white hover:shadow-sm
        transition-all duration-150
        border border-transparent
        ${isHighlighted ? 'bg-blue-50 border-blue-200' : 'bg-gray-50/50'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* 左侧：标题和简介 */}
        <div className="flex-1 min-w-0">
          {/* 标题行 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">{code}</span>
            <h5 className="font-medium text-gray-800 text-sm line-clamp-1">
              {title}
            </h5>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${importanceBadge.className}`}
            >
              {importanceBadge.symbol} {importanceBadge.label}
            </span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${learnModeMeta.className}`}
            >
              {learnModeMeta.label}
            </span>
            
            {/* 高频标签 */}
            {hasHighFrequencyTag && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-medium">
                高频
              </span>
            )}
            
            {/* 其他标签 */}
            {tags.filter(t => t.type !== 'high_frequency').slice(0, 2).map(tag => (
              <span 
                key={tag.type}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ 
                  backgroundColor: `${tag.color}20`,
                  color: tag.color
                }}
              >
                {tag.label}
              </span>
            ))}
          </div>
          
          {/* 简介 */}
          {keyTakeaway && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {truncateText(keyTakeaway, 30)}
            </p>
          )}
          
          {/* 历年考查 */}
          {examYears.length > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              {examYears.slice(-3).join('、')}年考过
            </div>
          )}
        </div>
        
        {/* 右侧：星级和图标 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* 重要性星级 */}
          {renderStars(importance)}
          
          {/* 收藏/复习图标 */}
          <div className="flex items-center gap-1">
            {isFavorite && (
              <Heart className="w-4 h-4 text-red-400 fill-red-400" />
            )}
            {isReview && (
              <Clock className="w-4 h-4 text-orange-400" />
            )}
          </div>
          
          {/* 箭头 */}
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>
      </div>
    </Link>
  )
}

export default PointRow
