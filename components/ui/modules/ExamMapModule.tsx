/**
 * 考试地图模块组件
 * 
 * 显示"本考点在考什么"的认知导入
 */

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExamMapModule, Takeaway } from '@/lib/knowledge/pointPage.types'
import { formatAbbreviations } from '@/lib/abbreviations'
import { SectionHeader } from '../SectionHeader'

export interface ExamMapModuleProps {
  module: ExamMapModule
  className?: string
}

function getLevelColor(level: string) {
  switch (level) {
    case "key":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "warn":
      return "bg-amber-100 text-amber-700 border-amber-200"
    case "danger":
      return "bg-red-100 text-red-700 border-red-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

export function ExamMapModule({ module, className }: ExamMapModuleProps) {
  const [isExpanded, setIsExpanded] = useState(module.defaultExpanded ?? true)
  const collapsible = module.collapsible ?? true

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm', className)}>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <SectionHeader title={module.title} kind="examMap" />
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
      ) : (
        <div className="p-4 border-b border-gray-200">
          <SectionHeader title={module.title} kind="examMap" />
        </div>
      )}

      {(!collapsible || isExpanded) && (
        <div className="p-4 space-y-4">
          <p className="text-gray-700 leading-relaxed">{formatAbbreviations(module.data.prompt)}</p>

          {/* 三个角度 */}
          <div className="space-y-2">
            {module.data.angles.map((angle, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="text-gray-800 leading-relaxed">{formatAbbreviations(angle)}</div>
              </div>
            ))}
          </div>

          {/* 重点集中 */}
          {module.data.focusTitle && module.data.focus.length > 0 && (
            <div className="pt-2">
              <div className="text-sm font-medium text-gray-700 mb-2">{formatAbbreviations(module.data.focusTitle)}</div>
              <div className="space-y-2">
                {module.data.focus.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm",
                      getLevelColor(item.level)
                    )}
                  >
                    <span>{formatAbbreviations(item.text)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ExamMapModule

