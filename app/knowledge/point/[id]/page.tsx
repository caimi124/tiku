import { useParams } from 'next/navigation'
import { PointDetailPage } from '@/components/knowledge/PointDetailPage'

export default function KnowledgePointPage() {
  const params = useParams()
  const pointId = params.id as string
  return <PointDetailPage pointId={pointId} />
}
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
import { useParams } from 'next/navigation'
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

const TARGET_POINT_ID = 'e75562a4-d0d9-491d-b7a0-837c3224e8d7'

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

  // 所有 hooks 必须在早期返回之前调用
  // 使用安全的默认值，即使 point 为 null
  const safePoint = point ?? null
  const safePointId = pointId ?? ''
  const isTargetPoint = safePointId === TARGET_POINT_ID

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

  const examMapModule = useMemo(() => newConfig?.modules.find((m) => m.type === 'examMap'), [newConfig])
  const classificationModule = useMemo(() => newConfig?.modules.find((m) => m.type === 'classificationMap'), [newConfig])
  const highYieldModule = useMemo(() => newConfig?.modules.find((m) => m.type === 'highYield'), [newConfig])
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

  const udcaCard = useMemo(() => ({
    name: '熊去氧胆酸（UDCA）',
    why: '胆疾病用药中的核心药物，适应证、禁忌和相互作用反复考查。',
    indications: [
      'X 线可穿透的胆固醇结石 + 胆囊收缩功能正常',
      '胆汁淤积性肝病（如原发性胆汁性肝硬化）',
      '胆汁反流性胃炎',
    ],
    contraindications: [
      '急性胆囊炎、急性胆管炎',
      '胆道阻塞',
      '严重肝功能减退',
    ],
    interactions: [
      '不与考来烯胺、含铝抗酸剂同服',
      '必须合用时，间隔 ≥2 小时',
    ],
  }), [])

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
        {useNewConfig && newConfig && isTargetPoint ? (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="space-y-4">
              <ExamValueCard
                title={newConfig.meta.title || safePoint.title}
                importanceLevel={effectiveImportanceLevel}
                masteryScore={safePoint.mastery_score}
                learnMode={effectiveLearnMode}
                examYears={safePoint.exam_years}
                examFrequency={safePoint.exam_frequency}
                className="mb-0"
              />
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-gray-800 leading-relaxed">
                【本页定位】
                <br />
                本页用于「考点复习与自测」，帮助你判断：
                <br />
                ✓ 这一考点考试怎么考
                <br />
                ✓ 哪些内容需要重点复习
                <br />
                ✓ 你目前是否掌握
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">📌 本考点在考什么？</h2>
              <div className="space-y-3 text-gray-800 leading-relaxed">
                <p className="whitespace-pre-line">
                  {formatAbbreviations(examMapModule?.data.prompt || '本考点围绕【肝胆疾病用药】，考试通常从 3 个角度出题：')}
                </p>
                <div className="space-y-2">
                  {(examMapModule?.data.angles || []).map((angle, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-gray-900">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="leading-relaxed">{formatAbbreviations(angle)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 space-y-2">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatAbbreviations(examMapModule?.data.focusTitle || '👉 其中重点集中在：')}
                  </div>
                  <ul className="list-disc ml-5 space-y-1 text-gray-800">
                    {(examMapModule?.data.focus || []).map((item) => (
                      <li key={item.id}>{formatAbbreviations(item.text)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">结构骨架（只建立脑内地图）</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(classificationModule?.data.sections || []).map((section) => (
                  <div key={section.id} className="space-y-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      {section.title.startsWith('肝') ? '🫀 ' : '💎 '}
                      {formatAbbreviations(section.title)}
                    </h3>
                    <ul className="space-y-1 text-gray-800 ml-1">
                      {section.items.map((item) => (
                        <li key={item.id} className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>{formatAbbreviations(item.text)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">高频考法 & 易错点（应试核心区）</h2>
              <div className="space-y-4">
                {(highYieldModule?.data.rules || []).map((rule) => (
                  <div key={rule.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                    <div className="text-sm font-semibold text-gray-900 mb-2">【{formatAbbreviations(rule.bucket)}】</div>
                    <p className="text-gray-900 leading-relaxed">{formatAbbreviations(rule.oneLiner)}</p>
                    {rule.examMove && (
                      <p className="text-gray-800 leading-relaxed mt-2">
                        解题提示：{formatAbbreviations(rule.examMove)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">核心药物详解卡（只保留必考药）</h2>
              <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🧠</span>
                  <h3 className="text-lg font-bold text-gray-900">{udcaCard.name}</h3>
                </div>
                <div className="space-y-3 text-gray-800 leading-relaxed">
                  <div>
                    <div className="font-semibold">【为什么考它】</div>
                    <p>{udcaCard.why}</p>
                  </div>
                  <div>
                    <div className="font-semibold">【适应证】</div>
                    <ul className="list-disc ml-5 space-y-1">
                      {udcaCard.indications.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold text-red-700">【禁忌】</div>
                    <ul className="list-disc ml-5 space-y-1 text-red-700">
                      {udcaCard.contraindications.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold text-orange-700">【相互作用】</div>
                    <ul className="list-disc ml-5 space-y-1 text-orange-700">
                      {udcaCard.interactions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {sourceModule && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-4 sm:p-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">📘 教材原文（精选整理，用于系统复习）</h2>
                </div>
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="font-semibold text-gray-900">
                    【一句话骨干】{formatAbbreviations(sourceSummary)}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSourceExpanded(!sourceExpanded)}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    {sourceExpanded ? '收起完整原文' : '展开完整原文'}
                    {sourceExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {sourceExpanded && safePoint.content && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <SmartContentRenderer
                        content={safePoint.content}
                        annotations={inlineAnnotations.length > 0 ? inlineAnnotations : undefined}
                        variant="minimal"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {examDistributionModule && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">考点分布（只保留一次）</h2>
                <div className="divide-y divide-gray-100">
                  {examDistributionModule.data.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-gray-800">{formatAbbreviations(item.text)}</span>
                      <span className="text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                        {item.years}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={buildActionHref(newConfig.actions.primary, safePoint.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 transition-colors"
                >
                  ▶ 开始考点自测（3–5 题）
                </Link>
                <Link
                  href={buildActionHref(newConfig.actions.secondary, safePoint.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gray-100 text-gray-800 font-semibold border border-gray-200 hover:bg-gray-200 transition-colors"
                >
                  → 进入专项练习
                </Link>
              </div>
            </div>

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
          <>
        <ExamValueCard
          title={newConfig?.meta.title || safePoint.title}
          importanceLevel={effectiveImportanceLevel}
          masteryScore={safePoint.mastery_score}
          learnMode={effectiveLearnMode}
          examYears={safePoint.exam_years}
          examFrequency={safePoint.exam_frequency}
          className="mb-6"
        />

        {uiOptions.enableFocusMode && (
          <FocusModeToggle
            enabled={focusMode}
            onToggle={setFocusMode}
            className="mb-6"
          />
        )}

        {useNewConfig && newConfig ? (
          <>
            {newConfig.meta.studyRoute.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>学习路线：</span>
                  <span>{newConfig.meta.studyRoute.join(' → ')}</span>
                </div>
              </div>
            )}

            {newConfig.modules
              .filter((module) => {
                const moduleTitle = module.title?.trim() || ''
                if (!moduleTitle || moduleTitle === '@' || moduleTitle === '全') {
                  return false
                }
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
          <>
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
          </>
        )}

        <div className="text-center">
          <Link
            href="/knowledge"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
            返回知识图谱
          </Link>
        </div>
          </>
        )}
      </div>
    </div>
  )
}
