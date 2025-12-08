/**
 * ChapterAccordion 组件
 * 
 * 章节手风琴组件，用于首页三级结构展示
 * 
 * 功能：
 * - 显示章节标题、考点数量、掌握度进度条
 * - 支持展开/收起状态
 * - 显示进度状态图标（完成/进行中/未开始）
 * 
 * Requirements: 1.2, 4.1, 4.3, 4.4, 4.5
 */

'use client'

import React, { useCallback } from 'react'
import { ChevronDown, ChevronRight, BookOpen, CheckCircle, Clock, Circle } from 'lucide-react'
import { MasteryProgressBar } from './MasteryProgressBar'

export interface ChapterAccordionProps {
  id: string
  code: string
  title: string
  pointCount: number
  highFrequencyCount: number
  masteryScore: number
  isExpanded?: boolean
  onToggle?: (id: string, expanded: boolean) => void
  children?: React.ReactNode
}

/**
 * 获取进度状态图标
 */
function getProgressIcon(masteryScore: number) {
  if (masteryScore >= 100) {
    return <CheckCircle className="w-5 h-5 text-green-500" />
  } else if (masteryScore > 0) {
    return <Clock className="w-5 h-5 text-blue-500" />
  } else {
    return <Circle className="w-5 h-5 text-gray-300" />
  }
}

/**
 * 获取进度状态文字
 */
function getProgressText(masteryScore: number): string {
  if (masteryScore >= 100) return '已完成'
  if (masteryScore > 0) return '进行中'
  return '未开始'
}

export function ChapterAccordion({
  id,
  code,
  title,
  pointCount,
  highFrequencyCount,
  masteryScore,
  isExpanded = false,
  onToggle,
  children
}: ChapterAccordionProps) {
  // 使用外部控制的展开状态，不再使用内部状态
  // 这样父组件可以完全控制展开/收起行为
  const expanded = isExpanded
  
  const handleToggle = useCallback(() => {
    const newExpanded = !expanded
    onToggle?.(id, newExpanded)
  }, [expanded, id, onToggle])
  
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* 章节头部 - 可点击展开/收起 */}
      <button
        onClick={handleToggle}
        className="w-full px-4 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
        aria-expanded={expanded}
      >
        {/* 展开/收起图标 */}
        <div className="flex-shrink-0">
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </div>
        
        {/* 进度状态图标 */}
        <div className="flex-shrink-0">
          {getProgressIcon(masteryScore)}
        </div>
        
        {/* 章节信息 */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">第{code}章</span>
            <h3 className="font-semibold text-gray-800 line-clamp-1">{title}</h3>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {pointCount}考点
            </span>
            {highFrequencyCount > 0 && (
              <span className="text-red-500 font-medium">
                {highFrequencyCount}高频
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
              {getProgressText(masteryScore)}
            </span>
          </div>
        </div>
        
        {/* 掌握度进度条 */}
        <div className="flex-shrink-0 w-32 hidden sm:block">
          <MasteryProgressBar 
            score={masteryScore} 
            size="sm" 
            showPercentage={true}
          />
        </div>
      </button>
      
      {/* 展开内容 */}
      {expanded && children && (
        <div className="border-t border-gray-100 bg-gray-50/50">
          {children}
        </div>
      )}
    </div>
  )
}

export default ChapterAccordion
