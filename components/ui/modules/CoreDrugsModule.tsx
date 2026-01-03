/**
 * 核心药物模块组件
 * 
 * 显示必考核心药物的卡片
 */

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Pill } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CoreDrugsModule } from '@/lib/knowledge/pointPage.types'
import { KeyTakeaways } from '../KeyTakeaways'
import { formatAbbreviations } from '@/lib/abbreviations'

export interface CoreDrugsModuleProps {
  module: CoreDrugsModule
  className?: string
}

export function CoreDrugsModule({ module, className }: CoreDrugsModuleProps) {
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
            <Pill className="w-5 h-5 text-green-500" />
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
            <Pill className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900">{module.title}</h2>
          </div>
        </div>
      )}

      {(!collapsible || isExpanded) && (
        <div className="p-4 space-y-4">
          {module.data.cards.map((card) => (
            <div
              key={card.id}
              className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-blue-50"
            >
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900">{formatAbbreviations(card.name)}</h3>
                {card.alias && (
                  <span className="text-sm text-gray-500">({formatAbbreviations(card.alias)})</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{formatAbbreviations(card.why)}</p>
              <KeyTakeaways
                items={card.bullets}
                defaultExpanded={true}
                className="mb-0"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CoreDrugsModule

