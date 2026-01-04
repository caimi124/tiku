/**
 * 知识点详情页（重构版 - 应试驱动布局）
 * 
 * 布局顺序：
 * A. 考试价值卡（顶部首屏必见）
 * B. 本页重点速览（6-8条，可折叠）
 * C. 结构骨架（分类表，可折叠）
 * D. 老司机/易错点（先从重点速览复用；后续可自动化）
 * E. 细节查阅区（临床用药评价/药物信息表：默认折叠，表格后显示口诀）
 * F. 历年考点分布（弱化展示，默认折叠）
 * G. 行动区（桌面端可做粘底；否则页面底部）
 * 
 * 注意：口诀不再单独显示，只在表格后以小卡片形式出现
 */

'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { ChevronDown, ChevronUp, AlertTriangle, BookOpen, Calendar } from 'lucide-react'

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

/* =========================
   类型（宽松版，避免 build 卡死）
========================= */

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

/* ========================= */

export default function KnowledgePointPage() {
  const params = useParams()
  const router = useRouter()
  const pointId = params.id as string

  const [point, setPoint] = useState<KnowledgePointDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [pointCompleted, setPointCompleted] = useState(false)
  
  // 从配置读取默认 Focus Mode（必须在 hooks 中）
  const initialPageConfig = useMemo(() => getPointPageConfig(pointId ?? ''), [pointId])
  const defaultFocusMode = initialPageConfig?.ui?.defaultFocusMode ?? false
  const [focusMode, setFocusMode] = useState(defaultFocusMode)
  
  // 折叠状态
  const [structureExpanded, setStructureExpanded] = useState(false)
  const [detailExpanded, setDetailExpanded] = useState(false)

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

  // 所有 hooks 必须在早期返回之前调用
  // 使用安全的默认值，即使 point 为 null
  const safePoint = point ?? null
  const safePointId = pointId ?? ''

  // 读取配置（优先使用新配置系统）
  const newConfig = useMemo(() => getPointConfig(safePointId), [safePointId])
  const oldConfig = useMemo(() => getPointPageConfig(safePointId), [safePointId])
  const uiOptions = useMemo(() => ({
    ...getDefaultUIOptions(),
    ...oldConfig?.ui,
  }), [oldConfig])
  
  // 判断是否使用新配置系统
  const useNewConfig = !!newConfig

  // 提取数据 - 使用安全的默认值（旧配置系统）
  const takeaways = useMemo<Takeaway[]>(() => {
    if (oldConfig?.takeaways && oldConfig.takeaways.length > 0) {
      return oldConfig.takeaways
    }
    return []
  }, [oldConfig])

  // 口诀不再单独使用，只在表格后显示（由 SmartContentRenderer 处理）

  const hasStructure = useMemo(() => {
    return safePoint?.content ? hasClassificationTable(safePoint.content) : false
  }, [safePoint])

  // 计算有效值 - 使用安全的默认值
  const effectiveImportanceLevel = useMemo(() => {
    if (newConfig?.meta.stars) return newConfig.meta.stars
    if (oldConfig?.stars) return oldConfig.stars
    return safePoint?.importance_level ?? safePoint?.importance ?? 3
  }, [safePoint, newConfig, oldConfig])

  const effectiveLearnMode = useMemo(() => {
    return safePoint?.learn_mode ?? 'BOTH'
  }, [safePoint])

  // 考试概览配置（旧系统）
  const examOverview = useMemo(() => {
    if (oldConfig?.examOverview) {
      return oldConfig.examOverview
    }
    if (safePoint?.title) {
      return getDefaultExamOverview(safePoint.title)
    }
    return null
  }, [oldConfig, safePoint])

  // 内联注释（旧系统）
  const inlineAnnotations = useMemo(() => {
    return oldConfig?.inlineAnnotations || []
  }, [oldConfig])

  // 早期返回必须在所有 hooks 之后
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
        {/* A. 考试价值卡 */}
        <ExamValueCard
          title={newConfig?.meta.title || safePoint.title}
          importanceLevel={effectiveImportanceLevel}
          masteryScore={safePoint.mastery_score}
          learnMode={effectiveLearnMode}
          examYears={safePoint.exam_years}
          examFrequency={safePoint.exam_frequency}
          className="mb-6"
        />

        {/* 只看重点开关 */}
        {uiOptions.enableFocusMode && (
          <FocusModeToggle
            enabled={focusMode}
            onToggle={setFocusMode}
            className="mb-6"
          />
        )}

        {/* 新配置系统：模块化渲染 */}
        {useNewConfig && newConfig ? (
          <>
            {/* 学习路线 */}
            {newConfig.meta.studyRoute.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>学习路线：</span>
                  <span>{newConfig.meta.studyRoute.join(' → ')}</span>
                </div>
              </div>
            )}

            {/* 渲染所有模块 */}
            {newConfig.modules
              .filter((module) => {
                // 过滤无意义模块：「@」和「全」
                const moduleTitle = module.title?.trim() || ''
                if (!moduleTitle || moduleTitle === '@' || moduleTitle === '全') {
                  return false
                }
                // 在 Focus Mode 下隐藏 sourceMaterial 和 examDistribution
                if (focusMode && (module.type === "sourceMaterial" || module.type === "examDistribution")) {
                  return false
                }
                return true
              })
              .map((module) => (
                <ModuleRenderer
                  key={module.id}
                  module={module}
                  content={module.type === "sourceMaterial" ? safePoint.content : undefined}
                  className="mb-6"
                />
              ))}

            {/* 行动区 */}
            <PointPageActions
              primary={newConfig.actions.primary}
              secondary={newConfig.actions.secondary}
              tertiary={newConfig.actions.tertiary}
              pointId={safePoint.id}
              sticky={!isMobile}
              className="mb-6"
            />
          </>
        ) : (
          /* 旧配置系统：向后兼容 */
          <>
            {/* 学习路线 */}
            {oldConfig?.studyPath && (
              <StudyPathBlock data={oldConfig.studyPath} className="mb-6" />
            )}

            {/* D. 考试概览（本考点在考什么？） */}
            {examOverview && (
              <ExamOverviewBlock data={examOverview} className="mb-6" />
            )}

            {/* B. 本页重点速览 */}
            {takeaways.length > 0 && (
              <KeyTakeaways
                items={takeaways}
                defaultExpanded={true}
                className="mb-6"
              />
            )}

            {/* D. 结构骨架（分类表） */}
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

            {/* E. 老司机/易错点 */}
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

            {/* F. 细节查阅区（默认折叠） */}
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

            {/* G. 历年考点分布（弱化展示）- 已由examDistribution模块处理，此处不再重复显示 */}

            {/* H. 行动区 */}
            <ActionArea
              pointId={safePoint.id}
              isCompleted={pointCompleted}
              sticky={!isMobile}
              className="mb-6"
            />
          </>
        )}

        {/* 返回链接 */}
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
    </div>
  )
}
