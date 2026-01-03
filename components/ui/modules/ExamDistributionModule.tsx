/**
 * 考点分布模块组件
 * 
 * 显示历年考点分布（弱化展示）
 */

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatAbbreviations } from '@/lib/abbreviations'
import type { ExamDistributionModule } from '@/lib/knowledge/pointPage.types'

export interface ExamDistributionModuleProps {
  module: ExamDistributionModule
  className?: string
}

export function ExamDistributionModule({ module, className }: ExamDistributionModuleProps) {
  const [isExpanded, setIsExpanded] = useState(module.defaultExpanded ?? false)
  const collapsible = module.collapsible ?? true

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm', className)}>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-600">{module.title}</h3>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
      ) : (
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-600">{module.title}</h3>
          </div>
        </div>
      )}

      {(!collapsible || isExpanded) && (
        <div className="p-3 space-y-2">
          {module.data.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{formatAbbreviations(item.text)}</span>
              <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                {item.years}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExamDistributionModule

