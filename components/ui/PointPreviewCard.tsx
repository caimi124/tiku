/**
 * PointPreviewCard 组件
 * 
 * 考点快速预览卡片，悬停或长按时显示
 * 
 * 功能：
 * - 显示考点标题、核心记忆点（前3条）、历年考查年份
 * - 提供"查看详情"按钮
 * - 支持点击外部关闭
 * 
 * Requirements: 2.1, 2.3, 2.4, 2.5
 */

'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { X, BookOpen, Calendar, ArrowRight } from 'lucide-react'

export interface PointPreviewCardProps {
  id: string
  title: string
  coreMemoryPoints?: string[]
  examYears?: number[]
  tags?: { type: string; label: string; color: string }[]
  position?: { x: number; y: number }
  onClose: () => void
  onViewDetail?: (id: string) => void
}

export function PointPreviewCard({
  id,
  title,
  coreMemoryPoints = [],
  examYears = [],
  tags = [],
  position,
  onClose,
  onViewDetail
}: PointPreviewCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    
    // 延迟添加事件监听，避免立即触发
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)
    
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])
  
  // ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  
  // 取前3条核心记忆点
  const displayPoints = coreMemoryPoints.slice(0, 3)
  
  // 计算位置样式
  const positionStyle = position ? {
    position: 'fixed' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: 'translate(-50%, -100%) translateY(-10px)'
  } : {}
  
  return (
    <div
      ref={cardRef}
      className="bg-white rounded-xl shadow-xl border border-gray-200 w-80 max-w-[90vw] z-50"
      style={positionStyle}
    >
      {/* 头部 */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
            {title}
          </h3>
          {/* 标签 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {tags.slice(0, 3).map(tag => (
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
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition ml-2 flex-shrink-0"
          aria-label="关闭预览"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      {/* 内容 */}
      <div className="px-4 py-3 space-y-3">
        {/* 核心记忆点 */}
        {displayPoints.length > 0 && (
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>核心记忆点</span>
            </div>
            <ul className="space-y-1">
              {displayPoints.map((point, index) => (
                <li 
                  key={index}
                  className="text-sm text-gray-700 flex items-start gap-2"
                >
                  <span className="text-blue-500 flex-shrink-0">•</span>
                  <span className="line-clamp-2">{point}</span>
                </li>
              ))}
            </ul>
            {coreMemoryPoints.length > 3 && (
              <p className="text-xs text-gray-400 mt-1">
                还有 {coreMemoryPoints.length - 3} 条...
              </p>
            )}
          </div>
        )}
        
        {/* 历年考查 */}
        {examYears.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {examYears.slice(-5).join('、')}年考过
              {examYears.length > 5 && ` (共${examYears.length}次)`}
            </span>
          </div>
        )}
        
        {/* 无内容提示 */}
        {displayPoints.length === 0 && examYears.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-2">
            点击查看详情了解更多
          </p>
        )}
      </div>
      
      {/* 底部按钮 */}
      <div className="px-4 py-3 border-t border-gray-100">
        <Link
          href={`/knowledge/point/${id}`}
          onClick={(e) => {
            if (onViewDetail) {
              e.preventDefault()
              onViewDetail(id)
            }
            onClose()
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
        >
          查看详情
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

export default PointPreviewCard
