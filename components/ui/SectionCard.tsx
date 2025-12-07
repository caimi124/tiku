/**
 * SectionCard 组件
 * 
 * 显示小节卡片，包括：
 * - 小节标题、考点数、高频考点数、掌握度
 * - 浅色背景和中等阴影
 * - 点击跳转到小节页
 * 
 * Requirements: 1.3, 7.9
 */

import React from 'react'
import { BookOpen, Star, ChevronRight } from 'lucide-react'
import { MasteryProgressBar, getStatusConfig } from './MasteryProgressBar'

export interface SectionSummary {
  id: string
  code: string
  title: string
  point_count: number
  high_frequency_count: number
  mastery_score: number
}

export interface SectionCardProps {
  section: SectionSummary
  onClick: (sectionId: string) => void
  className?: string
}

/**
 * SectionCard 组件
 */
export function SectionCard({ section, onClick, className = '' }: SectionCardProps) {
  const status = getStatusConfig(section.mastery_score)
  
  return (
    <div
      onClick={() => onClick(section.id)}
      className={`
        bg-gray-50 hover:bg-white
        rounded-lg border border-gray-200
        shadow-sm hover:shadow
        cursor-pointer
        transition-all duration-200
        ${className}
      `}
    >
      <div className="p-4">
        {/* 小节编号和标题 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">
              第{section.code}节
            </div>
            <h4 className="text-base font-medium text-gray-900 line-clamp-2" title={section.title}>
              {section.title}
            </h4>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
        </div>
        
        {/* 统计信息 */}
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{section.point_count}考点</span>
          </div>
          {section.high_frequency_count > 0 && (
            <div className="flex items-center gap-1 text-red-600">
              <Star className="w-4 h-4 fill-current" />
              <span>{section.high_frequency_count}高频</span>
            </div>
          )}
        </div>
        
        {/* 掌握度进度条 */}
        <div className="flex items-center gap-2">
          <MasteryProgressBar score={section.mastery_score} size="sm" />
          <span className={`text-xs font-medium ${status.textColor}`}>
            {status.text}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * 小节卡片网格布局
 */
export interface SectionGridProps {
  sections: SectionSummary[]
  onSectionClick: (sectionId: string) => void
  className?: string
}

export function SectionGrid({ sections, onSectionClick, className = '' }: SectionGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {sections.map(section => (
        <SectionCard
          key={section.id}
          section={section}
          onClick={onSectionClick}
        />
      ))}
    </div>
  )
}

export default SectionCard
