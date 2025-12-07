/**
 * SectionTOC 组件（右侧目录）
 * 
 * 显示同小节所有考点的目录列表：
 * - 高亮当前考点
 * - 点击跳转到对应考点
 * 
 * Requirements: 5.4, 5.5, 5.6
 * Property 11: 右侧目录高亮正确性
 */

import React from 'react'
import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'

export interface TOCPoint {
  id: string
  title: string
}

export interface SectionTOCProps {
  points: TOCPoint[]
  currentPointId: string
  onPointClick?: (pointId: string) => void
  sectionTitle?: string
  className?: string
}

/**
 * SectionTOC 组件
 * Property 11: 右侧目录高亮正确性 - 当前考点必须被高亮显示
 */
export function SectionTOC({ 
  points, 
  currentPointId, 
  onPointClick,
  sectionTitle,
  className = '' 
}: SectionTOCProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* 标题 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <BookOpen className="w-4 h-4" />
          <span>{sectionTitle || '本节考点'}</span>
        </div>
      </div>
      
      {/* 考点列表 */}
      <nav className="py-2">
        <ul className="space-y-0.5">
          {points.map((point, index) => {
            const isActive = point.id === currentPointId
            
            return (
              <li key={point.id}>
                {onPointClick ? (
                  <button
                    onClick={() => onPointClick(point.id)}
                    className={`
                      w-full text-left px-4 py-2 text-sm
                      flex items-center gap-2
                      transition-colors duration-150
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-500' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent'
                      }
                    `}
                  >
                    <span className="flex-shrink-0 w-5 text-xs text-gray-400">
                      {index + 1}.
                    </span>
                    <span className="line-clamp-2">{point.title}</span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 flex-shrink-0 ml-auto" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={`/knowledge/point/${point.id}`}
                    className={`
                      block px-4 py-2 text-sm
                      flex items-center gap-2
                      transition-colors duration-150
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-500' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent'
                      }
                    `}
                  >
                    <span className="flex-shrink-0 w-5 text-xs text-gray-400">
                      {index + 1}.
                    </span>
                    <span className="line-clamp-2">{point.title}</span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 flex-shrink-0 ml-auto" />
                    )}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
      
      {/* 底部统计 */}
      <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-500">
        共 {points.length} 个考点
      </div>
    </div>
  )
}

/**
 * 移动端侧边抽屉目录
 */
export interface MobileTOCDrawerProps extends SectionTOCProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileTOCDrawer({ 
  isOpen, 
  onClose, 
  points, 
  currentPointId, 
  onPointClick,
  sectionTitle 
}: MobileTOCDrawerProps) {
  if (!isOpen) return null
  
  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* 抽屉 */}
      <div className="fixed right-0 top-0 bottom-0 w-72 bg-white z-50 shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <span className="font-medium text-gray-900">本节考点</span>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <SectionTOC
          points={points}
          currentPointId={currentPointId}
          onPointClick={(id) => {
            onPointClick?.(id)
            onClose()
          }}
          sectionTitle={sectionTitle}
          className="border-0 rounded-none"
        />
      </div>
    </>
  )
}

export default SectionTOC
