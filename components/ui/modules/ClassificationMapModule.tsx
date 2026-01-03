/**
 * 分类地图模块组件
 * 
 * 显示药物分类结构（简洁列表）
 */

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ClassificationMapModule } from '@/lib/knowledge/pointPage.types'
import { formatAbbreviations } from '@/lib/abbreviations'

export interface ClassificationMapModuleProps {
  module: ClassificationMapModule
  className?: string
}

export function ClassificationMapModule({ module, className }: ClassificationMapModuleProps) {
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
          <div className="flex items-center gap-2">
            <List className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">{module.title}</h2>
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
            <List className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">{module.title}</h2>
          </div>
        </div>
      )}

      {(!collapsible || isExpanded) && (
        <div className="p-4 space-y-4">
          {module.data.sections.map((section) => (
            <div key={section.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{formatAbbreviations(section.title)}</h3>
                {section.hint && (
                  <span className="text-xs text-gray-500">({formatAbbreviations(section.hint)})</span>
                )}
              </div>
              <ul className="space-y-1 ml-4">
                {section.items.map((item) => (
                  <li key={item.id} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{formatAbbreviations(item.text)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ClassificationMapModule

