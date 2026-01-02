/**
 * 考试角度概览区块组件
 * 
 * 显示"本考点在考什么"的认知导入模块
 */

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Navigation } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExamOverviewBlock } from '@/lib/knowledge/pointPage.schema'

export interface ExamOverviewBlockProps {
  data: ExamOverviewBlock
  className?: string
}

export function ExamOverviewBlock({ data, className }: ExamOverviewBlockProps) {
  const [isExpanded, setIsExpanded] = useState(data.defaultOpen ?? true)
  const collapsible = data.collapsible ?? true

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm', className)}>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">{data.title}</h2>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
      ) : (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">{data.title}</h2>
          </div>
        </div>
      )}

      {(!collapsible || isExpanded) && (
        <div className="p-4 space-y-4">
          {data.intro && (
            <p className="text-gray-700 leading-relaxed">{data.intro}</p>
          )}

          {/* 三个角度 */}
          <div className="space-y-3">
            {data.angles.map((angle, index) => (
              <div
                key={angle.id}
                className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{angle.title}</div>
                  {angle.hint && (
                    <div className="text-sm text-gray-600 mt-1">{angle.hint}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 重点集中 */}
          {data.focusTitle && data.focus.length > 0 && (
            <div className="pt-2">
              <div className="text-sm font-medium text-gray-700 mb-2">{data.focusTitle}</div>
              <ul className="space-y-2">
                {data.focus.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ExamOverviewBlock

