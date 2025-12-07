/**
 * ChapterCard 组件
 * 
 * 显示章节卡片，包括：
 * - 章节标题、小节数、考点数、掌握度
 * - 渐变背景色和阴影
 * - 点击跳转到章节页
 * 
 * Requirements: 1.1, 7.8
 */

import React from 'react'
import { BookOpen, FileText, Star } from 'lucide-react'
import { MasteryProgressBar } from './MasteryProgressBar'

export interface ChapterSummary {
  id: string
  code: string
  title: string
  section_count: number
  point_count: number
  high_frequency_count: number
  mastery_score: number
}

export interface ChapterCardProps {
  chapter: ChapterSummary
  onClick: (chapterId: string) => void
  className?: string
}

// 章节渐变背景色
const CHAPTER_GRADIENTS = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-green-500 to-green-600',
  'from-orange-500 to-orange-600',
  'from-pink-500 to-pink-600',
  'from-teal-500 to-teal-600',
  'from-indigo-500 to-indigo-600',
  'from-red-500 to-red-600',
]

/**
 * 根据章节编号获取渐变色
 */
function getChapterGradient(code: string): string {
  const num = parseInt(code) || 0
  return CHAPTER_GRADIENTS[num % CHAPTER_GRADIENTS.length]
}

/**
 * ChapterCard 组件
 * Property 1: 章节卡片数据完整性
 */
export function ChapterCard({ chapter, onClick, className = '' }: ChapterCardProps) {
  const gradient = getChapterGradient(chapter.code)
  
  return (
    <div
      onClick={() => onClick(chapter.id)}
      className={`
        relative overflow-hidden rounded-xl cursor-pointer
        bg-gradient-to-br ${gradient}
        shadow-md hover:shadow-lg
        transform hover:-translate-y-1
        transition-all duration-200
        ${className}
      `}
    >
      {/* 装饰性背景图案 */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <BookOpen className="w-full h-full text-white" />
      </div>
      
      <div className="relative p-5 text-white">
        {/* 章节编号 */}
        <div className="text-sm font-medium opacity-80 mb-1">
          第{chapter.code}章
        </div>
        
        {/* 章节标题 */}
        <h3 className="text-lg font-semibold mb-3 line-clamp-2" title={chapter.title}>
          {chapter.title}
        </h3>
        
        {/* 统计信息 */}
        <div className="flex items-center gap-4 text-sm opacity-90 mb-3">
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>{chapter.section_count}小节</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{chapter.point_count}考点</span>
          </div>
          {chapter.high_frequency_count > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current" />
              <span>{chapter.high_frequency_count}高频</span>
            </div>
          )}
        </div>
        
        {/* 掌握度进度条 */}
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1 opacity-80">
            <span>掌握度</span>
            <span>{chapter.mastery_score}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${chapter.mastery_score}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 章节卡片网格布局
 */
export interface ChapterGridProps {
  chapters: ChapterSummary[]
  onChapterClick: (chapterId: string) => void
  className?: string
}

export function ChapterGrid({ chapters, onChapterClick, className = '' }: ChapterGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {chapters.map(chapter => (
        <ChapterCard
          key={chapter.id}
          chapter={chapter}
          onClick={onChapterClick}
        />
      ))}
    </div>
  )
}

export default ChapterCard
