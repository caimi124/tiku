'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, AlertTriangle, BookOpen } from 'lucide-react'

import { ExamValueCard } from '@/components/ui/ExamValueCard'
import { KeyTakeaways } from '@/components/ui/KeyTakeaways'
import { FocusModeToggle } from '@/components/ui/FocusModeToggle'
import { ActionArea } from '@/components/ui/ActionArea'
import { ExamOverviewBlock } from '@/components/ui/ExamOverviewBlock'
import { StudyPathBlock } from '@/components/ui/StudyPathBlock'
import { SmartContentRenderer } from '@/components/ui/SmartContentRenderer'
import { ModuleRenderer } from '@/components/ui/modules/ModuleRenderer'
import { PointPageActions } from '@/components/ui/PointPageActions'
import { isPointCompleted } from '@/lib/learningProgress'
import { getPointPageConfig } from '@/lib/knowledge/pointPage.config'
import { getPointConfig } from '@/lib/knowledge/pointConfigs'
import { getDefaultUIOptions, getDefaultExamOverview, type Takeaway } from '@/lib/knowledge/pointPage.schema'
import { hasClassificationTable } from '@/lib/contentUtils'
import { formatAbbreviations } from '@/lib/abbreviations'
import type { Action } from '@/lib/knowledge/pointPage.types'
import { InfoPanel } from '@/components/ui/InfoPanel'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { LearnedToggle } from '@/components/ui/LearnedToggle'

interface KnowledgePointDetail {
  id: string
  code?: string
  title: string
  content?: string
  importance?: number
  importance_level?: number
  learn_mode?: 'MEMORIZE' | 'PRACTICE' | 'BOTH' | string
  mastery_score?: number
  mastery_status?: string
  memory_tips?: string
  drug_name?: string
  point_type?: string
  last_review_at?: string
  practice_count?: number
  correct_rate?: number
  exam_years?: number[]
  exam_frequency?: number
  related_points?: any[]
  content_item_accuracy?: any[]
  navigation?: {
    prev_point?: any
    next_point?: any
    section_points?: any[]
  }
  chapter?: { id: string; title: string; code: string }
  section?: { id: string; title: string; code: string }
}

export interface PointDetailPageProps {
  pointId: string
}

export function PointDetailPage({ pointId }: PointDetailPageProps) {
  const [point, setPoint] = useState<KnowledgePointDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [pointCompleted, setPointCompleted] = useState(false)

  const initialPageConfig = useMemo(() => getPointPageConfig(pointId ?? ''), [pointId])
  const defaultFocusMode = initialPageConfig?.ui?.defaultFocusMode ?? false
  const [focusMode, setFocusMode] = useState(defaultFocusMode)

  const [structureExpanded, setStructureExpanded] = useState(false)
  const [detailExpanded, setDetailExpanded] = useState(false)
  const [sourceExpanded, setSourceExpanded] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!pointId) return
    fetch(`/api/knowledge-point/${pointId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.success) {
          setPoint(data.data)
        } else {
          setError(data?.error || '获取知识点失败')
        }
      })
      .catch(() => setError('网络错误'))
      .finally(() => setLoading(false))
  }, [pointId])

  useEffect(() => {
    if (!point) return
    setPointCompleted(isPointCompleted(point.id))
  }, [point])

  const safePoint = point ?? null
  const safePointId = pointId ?? ''

  const newConfig = useMemo(() => getPointConfig(safePointId), [safePointId])
  const oldConfig = useMemo(() => getPointPageConfig(safePointId), [safePointId])
  const uiOptions = useMemo(() => ({
    ...getDefaultUIOptions(),
    ...oldConfig?.ui,
  }), [oldConfig])

  const useNewConfig = !!newConfig

  const takeaways = useMemo<Takeaway[]>(() => {
    if (oldConfig?.takeaways && oldConfig.takeaways.length > 0) {
      return oldConfig.takeaways
    }
    return []
  }, [oldConfig])

  const hasStructure = useMemo(() => {
    return safePoint?.content ? hasClassificationTable(safePoint.content) : false
  }, [safePoint])

  const effectiveImportanceLevel = useMemo(() => {
    if (newConfig?.meta.stars) return newConfig.meta.stars
    if (oldConfig?.stars) return oldConfig.stars
    return safePoint?.importance_level ?? safePoint?.importance ?? 3
  }, [safePoint, newConfig, oldConfig])

  const effectiveLearnMode = useMemo(() => {
    return safePoint?.learn_mode ?? 'BOTH'
  }, [safePoint])

  const examOverview = useMemo(() => {
    if (oldConfig?.examOverview) {
      return oldConfig.examOverview
    }
    if (safePoint?.title) {
      return getDefaultExamOverview(safePoint.title)
    }
    return null
  }, [oldConfig, safePoint])

  const inlineAnnotations = useMemo(() => {
    return oldConfig?.inlineAnnotations || []
  }, [oldConfig])

  const examMapModule = useMemo(() => newConfig?.modules.find((m) => m.type === 'examMap'), [newConfig])
  const classificationModule = useMemo(() => newConfig?.modules.find((m) => m.type === 'classificationMap'), [newConfig])
  const highYieldModule = useMemo(() => newConfig?.modules.find((m) => m.type === 'highYield'), [newConfig])
  const coreDrugsModule = useMemo(() => newConfig?.modules.find((m) => m.type === 'coreDrugs'), [newConfig])
  const sourceModule = useMemo(() => newConfig?.modules.find((m) => m.type === 'sourceMaterial'), [newConfig])
  const examDistributionModule = useMemo(() => newConfig?.modules.find((m) => m.type === 'examDistribution'), [newConfig])

  const sourceSummary = useMemo(() => {
    if (!safePoint?.content) return '暂无原文'
    const firstLine = safePoint.content
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith('|---') && !line.startsWith('|')) || safePoint.content.trim()
    if (!firstLine) return '暂无原文'
    return firstLine.length > 80 ? `${firstLine.slice(0, 80)}…` : firstLine
  }, [safePoint])

  const buildActionHref = (action: Action | undefined, id: string) => {
    if (!action) return '#'
    if (action.href) return action.href
    switch (action.type) {
      case 'selfTest':
        return `/practice/by-point?pointId=${id}&mode=self-test&count=${action.payload?.count || 5}`
      case 'practice':
        return `/practice/by-point?pointId=${id}`
      case 'backToGraph':
        return '/knowledge'
      case 'markDone':
      default:
        return '#'
    }
  }

  if (loading) return <div className="p-8">加载中…</div>
  if (error || !safePoint) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">{error || '知识点不存在'}</p>
        <Link href="/knowledge" className="text-blue-600">返回知识图谱</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <ExamValueCard
              title={newConfig?.meta.title || safePoint.title}
              importanceLevel={effectiveImportanceLevel}
              masteryScore={safePoint.mastery_score}
              learnMode={effectiveLearnMode}
              examYears={safePoint.exam_years}
              examFrequency={safePoint.exam_frequency}
              className="mb-0"
            />
            <LearnedToggle pointId={safePoint.id} />
          </div>
          <InfoPanel accentColor="blue" className="bg-blue-50/70 border-blue-100">
            <div className="text-sm text-slate-800 leading-relaxed">
              <div className="font-semibold mb-1">【本页定位】</div>
              <div>本页用于「考点复习与自测」，帮助你判断：</div>
              <div>✓ 这一考点考试怎么考</div>
              <div>✓ 哪些内容需要重点复习</div>
              <div>✓ 你目前是否掌握</div>
            </div>
          </InfoPanel>
        </div>

        {uiOptions.enableFocusMode && (
          <FocusModeToggle
            enabled={focusMode}
            onToggle={setFocusMode}
            className="mb-2"
          />
        )}

        {useNewConfig && newConfig ? (
          <div className="space-y-6">
            {examMapModule && (
              <ModuleRenderer
                module={examMapModule}
                className="shadow-sm hover:shadow-md transition"
              />
            )}

            {classificationModule && (
              <ModuleRenderer
                module={classificationModule}
                className="shadow-sm hover:shadow-md transition"
              />
            )}

            {highYieldModule && (
              <ModuleRenderer
                module={highYieldModule}
                className="shadow-sm hover:shadow-md transition"
              />
            )}

            {coreDrugsModule && (
              <ModuleRenderer
                module={coreDrugsModule}
                className="shadow-sm hover:shadow-md transition"
              />
            )}

            {sourceModule && (
              <ModuleRenderer
                module={sourceModule}
                content={safePoint.content}
                className="shadow-sm hover:shadow-md transition"
              />
            )}

            {examDistributionModule && (
              <ModuleRenderer
                module={examDistributionModule}
                className="shadow-sm hover:shadow-md transition"
              />
            )}

            <PointPageActions
              primary={newConfig.actions.primary}
              secondary={newConfig.actions.secondary}
              tertiary={newConfig.actions.tertiary}
              pointId={safePoint.id}
              sticky={!isMobile}
              className="mb-6"
            />

            <div className="text-center">
              <Link
                href="/knowledge"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                返回知识图谱
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {oldConfig?.studyPath && (
              <StudyPathBlock data={oldConfig.studyPath} className="mb-6" />
            )}

            {examOverview && (
              <ExamOverviewBlock data={examOverview} className="mb-6" />
            )}

            {takeaways.length > 0 && (
              <KeyTakeaways
                items={takeaways}
                defaultExpanded={true}
                className="mb-6"
              />
            )}

            {hasStructure && !focusMode && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
                <button
                  type="button"
                  onClick={() => setStructureExpanded(!structureExpanded)}
                  className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">结构骨架</h2>
                  </div>
                  {structureExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {structureExpanded && safePoint.content && (
                  <div className="px-4 pb-4">
                    <SmartContentRenderer content={safePoint.content} />
                  </div>
                )}
              </div>
            )}

            {takeaways.filter(t => t.level === "warn" || t.level === "danger").length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">老司机提醒 / 易错点</h2>
                </div>
                <div className="space-y-3">
                  {takeaways
                    .filter(t => t.level === "warn" || t.level === "danger")
                    .slice(0, 4)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100"
                      >
                        <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700 leading-relaxed flex-1">{formatAbbreviations(item.text)}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {!focusMode && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
                <button
                  type="button"
                  onClick={() => setDetailExpanded(!detailExpanded)}
                  className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-gray-500" />
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900">细节查阅区</h2>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500">（临床用药评价/药物信息表）</span>
                  </div>
                  {detailExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {detailExpanded && (
                  <div className="px-4 pb-4">
                    {safePoint.content ? (
                      <SmartContentRenderer 
                        content={safePoint.content}
                        annotations={inlineAnnotations.length > 0 ? inlineAnnotations : undefined}
                      />
                    ) : (
                      <div className="text-gray-400 py-8 text-center">暂无内容</div>
                    )}
                  </div>
                )}
              </div>
            )}

            <ActionArea
              pointId={safePoint.id}
              isCompleted={pointCompleted}
              sticky={!isMobile}
              className="mb-6"
            />

            <div className="text-center">
              <Link
                href="/knowledge"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                返回知识图谱
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PointDetailPage

