/**
 * SectionAccordion 组件
 * 
 * 小节手风琴组件，嵌套在章节手风琴内
 * 
 * 功能：
 * - 显示小节标题、考点数量、高频考点数量
 * - 支持展开/收起状态
 * - 展开时触发考点懒加载
 * 
 * Requirements: 1.4, 4.2
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { ChevronDown, ChevronRight, FileText, Zap, Loader2 } from 'lucide-react'

export interface SectionAccordionProps {
  id: string
  code: string
  title: string
  pointCount: number
  highFrequencyCount: number
  masteryScore: number
  isExpanded?: boolean
  onToggle?: (id: string, expanded: boolean) => void
  onExpand?: (sectionId: string) => void
  loading?: boolean
  children?: React.ReactNode
}

export function SectionAccordion({
  id,
  code,
  title,
  pointCount,
  highFrequencyCount,
  masteryScore,
  isExpanded = false,
  onToggle,
  onExpand,
  loading = false,
  children
}: SectionAccordionProps) {
  const [expanded, setExpanded] = useState(isExpanded)
  const [hasLoaded, setHasLoaded] = useState(false)
  
  const handleToggle = useCallback(() => {
    const newExpanded = !expanded
    setExpanded(newExpanded)
    onToggle?.(id, newExpanded)
    
    // 首次展开时触发懒加载
    if (newExpanded && !hasLoaded) {
      setHasLoaded(true)
      onExpand?.(id)
    }
  }, [expanded, id, hasLoaded, onToggle, onExpand])
  
  // 同步外部控制的展开状态
  useEffect(() => {
    setExpanded(isExpanded)
    if (isExpanded && !hasLoaded) {
      setHasLoaded(true)
      onExpand?.(id)
    }
  }, [isExpanded, id, hasLoaded, onExpand])
  
  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* 小节头部 */}
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100/50 transition-colors"
        aria-expanded={expanded}
      >
        {/* 展开/收起图标 */}
        <div className="flex-shrink-0 ml-4">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
        
        {/* 小节信息 */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{code}</span>
            <h4 className="font-medium text-gray-700 text-sm line-clamp-1">{title}</h4>
          </div>
        </div>
        
        {/* 统计信息 */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            {pointCount}考点
          </span>
          {highFrequencyCount > 0 && (
            <span className="flex items-center gap-1 text-red-500">
              <Zap className="w-3.5 h-3.5" />
              {highFrequencyCount}高频
            </span>
          )}
          {masteryScore > 0 && (
            <span className="text-blue-500 font-medium">
              {masteryScore}%
            </span>
          )}
        </div>
      </button>
      
      {/* 展开内容 - 考点列表 */}
      {expanded && (
        <div className="pl-12 pr-4 pb-3">
          {loading ? (
            <div className="flex items-center justify-center py-4 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">加载考点...</span>
            </div>
          ) : children ? (
            <div className="space-y-1">
              {children}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400 text-sm">
              暂无考点
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SectionAccordion
