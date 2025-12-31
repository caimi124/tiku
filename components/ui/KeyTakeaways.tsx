/**
 * 本页重点速览组件
 * 
 * 显示考点的关键要点（6-8条），支持折叠
 */

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface KeyTakeawaysProps {
  /** 重点列表 */
  items: string[]
  /** 默认是否展开 */
  defaultExpanded?: boolean
  /** 自定义类名 */
  className?: string
}

export function KeyTakeaways({
  items,
  defaultExpanded = true,
  className,
}: KeyTakeawaysProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm', className)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">本页重点速览</h2>
          <span className="text-sm text-gray-500">({items.length}条)</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {index + 1}
              </span>
              <p className="text-gray-700 leading-relaxed flex-1">{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default KeyTakeaways

