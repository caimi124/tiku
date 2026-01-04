/**
 * 高频考法模块组件
 * 
 * 显示"一句 = 一题"的考试规则
 */

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HighYieldModule } from '@/lib/knowledge/pointPage.types'
import { formatAbbreviations } from '@/lib/abbreviations'
import { SectionHeader } from '../SectionHeader'
import { ExamHintCard } from '../ExamHintCard'

export interface HighYieldModuleProps {
  module: HighYieldModule
  className?: string
}

function getLevelStyles(level: string) {
  switch (level) {
    case "key":
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        badge: "bg-blue-500",
      }
    case "warn":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-800",
        badge: "bg-amber-500",
      }
    case "danger":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        badge: "bg-red-500",
      }
    default:
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-800",
        badge: "bg-gray-500",
      }
  }
}

export function HighYieldModule({ module, className }: HighYieldModuleProps) {
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
          <SectionHeader title={module.title} kind="highYield" />
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
      ) : (
        <div className="p-4 border-b border-gray-200">
          <SectionHeader title={module.title} kind="highYield" />
        </div>
      )}

      {(!collapsible || isExpanded) && (
        <div className="p-4 space-y-3">
          {module.data.intro && (
            <p className="text-sm text-gray-600 italic">{formatAbbreviations(module.data.intro)}</p>
          )}

          {module.data.rules.map((rule) => {
            const styles = getLevelStyles(rule.level)
            return (
              <ExamHintCard
                key={rule.id}
                className={cn(styles.bg, styles.border)}
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium text-white",
                    styles.badge
                  )}>
                    {formatAbbreviations(rule.bucket)}
                  </span>
                </div>
                <p className={cn("font-medium mb-1", styles.text)}>
                  {formatAbbreviations(rule.oneLiner)}
                </p>
                {rule.examMove && (
                  <p className="text-sm text-gray-600 mt-1">
                    💡 {formatAbbreviations(rule.examMove)}
                  </p>
                )}
              </ExamHintCard>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default HighYieldModule

