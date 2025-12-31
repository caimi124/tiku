/**
 * 考试价值卡组件
 * 
 * 显示考点的考试价值信息：重要性、频率、学习模式等
 */

'use client'

import { ImportanceStars, isHighFrequency } from '@/components/ui/ImportanceStars'
import { MasteryStatusBadge } from '@/components/ui/MasteryStatusBadge'
import { cn } from '@/lib/utils'

export interface ExamValueCardProps {
  /** 考点标题 */
  title: string
  /** 重要性等级 (1-5) */
  importanceLevel: number
  /** 掌握度分数 (0-100) */
  masteryScore?: number
  /** 学习模式 */
  learnMode?: 'MEMORIZE' | 'PRACTICE' | 'BOTH' | string
  /** 历年考查年份 */
  examYears?: number[]
  /** 考查频率 */
  examFrequency?: number
  /** 自定义类名 */
  className?: string
}

const LEARN_MODE_BADGES = {
  MEMORIZE: { label: '必背', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  PRACTICE: { label: '多练', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  BOTH: { label: '背+练', className: 'bg-slate-100 text-slate-700 border-slate-200' },
}

function getLearnModeBadge(mode?: string) {
  return (LEARN_MODE_BADGES as any)[mode ?? 'BOTH'] ?? LEARN_MODE_BADGES.BOTH
}

function getImportanceBadge(level: number) {
  if (level >= 4) {
    return { symbol: '🔥', label: '高频', className: 'bg-red-100 text-red-600 border-red-200' }
  }
  if (level === 3) {
    return { symbol: '🟡', label: '常考', className: 'bg-amber-100 text-amber-600 border-amber-200' }
  }
  return { symbol: '⚪', label: '低频', className: 'bg-slate-100 text-slate-500 border-slate-200' }
}

export function ExamValueCard({
  title,
  importanceLevel,
  masteryScore,
  learnMode,
  examYears = [],
  examFrequency,
  className,
}: ExamValueCardProps) {
  const importanceBadge = getImportanceBadge(importanceLevel)
  const learnModeBadge = getLearnModeBadge(learnMode)
  const isHighFreq = isHighFrequency(importanceLevel)

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6', className)}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
        {masteryScore !== undefined && (
          <MasteryStatusBadge score={masteryScore} size="md" />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* 重要性星级 */}
        <div className="flex items-center gap-2">
          <ImportanceStars level={importanceLevel} size="md" />
        </div>

        {/* 频率标签 */}
        <span className={cn(
          'px-3 py-1 rounded-full text-sm font-medium border',
          importanceBadge.className
        )}>
          {importanceBadge.symbol} {importanceBadge.label}
        </span>

        {/* 学习模式标签 */}
        <span className={cn(
          'px-3 py-1 rounded-full text-sm font-medium border',
          learnModeBadge.className
        )}>
          {learnModeBadge.label}
        </span>

        {/* 高频考点标签 */}
        {isHighFreq && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-600 border border-orange-200">
            高频考点
          </span>
        )}

        {/* 历年考查信息 */}
        {examYears && examYears.length > 0 && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-600 border border-blue-200">
            {examYears.length}年考查
          </span>
        )}

        {/* 考查频率 */}
        {examFrequency !== undefined && examFrequency > 0 && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-600 border border-purple-200">
            近5年{examFrequency}次
          </span>
        )}
      </div>
    </div>
  )
}

export default ExamValueCard

