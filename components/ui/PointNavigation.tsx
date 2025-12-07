/**
 * PointNavigation 组件（上下导航）
 * 
 * 显示上一个/下一个考点按钮：
 * - 边界情况隐藏按钮
 * - 支持键盘导航
 * 
 * Requirements: 5.7, 5.8, 5.9
 * Property 12: 上下导航边界处理
 */

import React from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, BookOpen, Play } from 'lucide-react'

export interface NavPoint {
  id: string
  title: string
}

export interface PointNavigationProps {
  prevPoint?: NavPoint
  nextPoint?: NavPoint
  onNavigate?: (pointId: string) => void
  showPracticeButton?: boolean
  onPractice?: () => void
  showRelatedQuestions?: boolean
  onRelatedQuestions?: () => void
  className?: string
}

/**
 * PointNavigation 组件
 * Property 12: 上下导航边界处理
 * - 如果是小节第一个考点，"上一个考点"按钮必须隐藏
 * - 如果是小节最后一个考点，"下一个考点"按钮必须隐藏
 */
export function PointNavigation({ 
  prevPoint, 
  nextPoint, 
  onNavigate,
  showPracticeButton = true,
  onPractice,
  showRelatedQuestions = true,
  onRelatedQuestions,
  className = '' 
}: PointNavigationProps) {
  const handlePrevClick = () => {
    if (prevPoint && onNavigate) {
      onNavigate(prevPoint.id)
    }
  }
  
  const handleNextClick = () => {
    if (nextPoint && onNavigate) {
      onNavigate(nextPoint.id)
    }
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* 上下考点导航 */}
      <div className="flex items-stretch gap-3">
        {/* 上一个考点 - Property 12: 边界情况隐藏 */}
        {prevPoint ? (
          onNavigate ? (
            <button
              onClick={handlePrevClick}
              className="flex-1 flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-500">上一个考点</div>
                <div className="text-sm font-medium text-gray-700 truncate">{prevPoint.title}</div>
              </div>
            </button>
          ) : (
            <Link
              href={`/knowledge/point/${prevPoint.id}`}
              className="flex-1 flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-500">上一个考点</div>
                <div className="text-sm font-medium text-gray-700 truncate">{prevPoint.title}</div>
              </div>
            </Link>
          )
        ) : (
          <div className="flex-1" /> // 占位，保持布局
        )}
        
        {/* 下一个考点 - Property 12: 边界情况隐藏 */}
        {nextPoint ? (
          onNavigate ? (
            <button
              onClick={handleNextClick}
              className="flex-1 flex items-center justify-end gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-right"
            >
              <div className="min-w-0">
                <div className="text-xs text-gray-500">下一个考点</div>
                <div className="text-sm font-medium text-gray-700 truncate">{nextPoint.title}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </button>
          ) : (
            <Link
              href={`/knowledge/point/${nextPoint.id}`}
              className="flex-1 flex items-center justify-end gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
            >
              <div className="min-w-0">
                <div className="text-xs text-gray-500">下一个考点</div>
                <div className="text-sm font-medium text-gray-700 truncate">{nextPoint.title}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </Link>
          )
        ) : (
          <div className="flex-1" /> // 占位，保持布局
        )}
      </div>
      
      {/* 操作按钮 */}
      {(showRelatedQuestions || showPracticeButton) && (
        <div className="flex items-center gap-3">
          {showRelatedQuestions && (
            <button
              onClick={onRelatedQuestions}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 text-gray-700 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">相关真题</span>
            </button>
          )}
          
          {showPracticeButton && (
            <button
              onClick={onPractice}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
            >
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">开始练习</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 移动端底部悬浮导航
 */
export interface MobileBottomNavProps extends PointNavigationProps {
  visible?: boolean
}

export function MobileBottomNav({ 
  prevPoint, 
  nextPoint, 
  onNavigate,
  onPractice,
  visible = true 
}: MobileBottomNavProps) {
  if (!visible) return null
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-30 safe-area-inset-bottom">
      <div className="flex items-center gap-2">
        {/* 上一个 */}
        {prevPoint ? (
          onNavigate ? (
            <button
              onClick={() => onNavigate(prevPoint.id)}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title={prevPoint.title}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          ) : (
            <Link
              href={`/knowledge/point/${prevPoint.id}`}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title={prevPoint.title}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Link>
          )
        ) : (
          <div className="w-10 h-10" />
        )}
        
        {/* 开始练习 */}
        <button
          onClick={onPractice}
          className="flex-1 flex items-center justify-center gap-2 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
        >
          <Play className="w-4 h-4" />
          <span className="text-sm font-medium">开始练习</span>
        </button>
        
        {/* 下一个 */}
        {nextPoint ? (
          onNavigate ? (
            <button
              onClick={() => onNavigate(nextPoint.id)}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title={nextPoint.title}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          ) : (
            <Link
              href={`/knowledge/point/${nextPoint.id}`}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title={nextPoint.title}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </Link>
          )
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>
    </div>
  )
}

export default PointNavigation
