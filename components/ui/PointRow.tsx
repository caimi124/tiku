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

export function PointRow({
  id,
  code,
  title,
  keyTakeaway,
  importance,
  tags,
  examYears = [],
  isFavorite = false,
  isReview = false,
  isHighlighted = false,
  onClick
}: PointRowProps) {
  const hasHighFrequencyTag = tags.some(t => t.type === 'high_frequency')
  
  return (
    <Link
      href={`/knowledge/point/${id}`}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault()
          onClick(id)
        }
      }}
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
