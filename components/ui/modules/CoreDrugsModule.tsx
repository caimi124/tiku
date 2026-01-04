/**
 * 核心药物模块组件
 * 
 * 显示必考核心药物的卡片
 */

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CoreDrugsModule } from '@/lib/knowledge/pointPage.types'
import { KeyTakeaways } from '../KeyTakeaways'
import { formatAbbreviations } from '@/lib/abbreviations'
import { SectionHeader } from '../SectionHeader'
import { CoreDrugCard } from '../CoreDrugCard'

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
          <SectionHeader title={module.title} kind="coreDrug" />
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
      ) : (
        <div className="p-4 border-b border-gray-200">
          <SectionHeader title={module.title} kind="coreDrug" />
        </div>
      )}

      {(!collapsible || isExpanded) && (
        <div className="p-4 space-y-4">
          {module.data.cards.map((card) => (
            <CoreDrugCard
              key={card.id}
              title={formatAbbreviations(card.name)}
              alias={card.alias ? formatAbbreviations(card.alias) : undefined}
              why={formatAbbreviations(card.why)}
              examTag="反复考 · 常作为多选 / 禁忌题出现"
            >
              <KeyTakeaways
                items={card.bullets}
                defaultExpanded={true}
                className="mb-0"
              />
            </CoreDrugCard>
          ))}
        </div>
      )}
    </div>
  )
}

export default CoreDrugsModule

