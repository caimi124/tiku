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
import { ChevronDown, ChevronUp } from 'lucide-react'

import { ExamValueCard } from '@/components/ui/ExamValueCard'
import { SmartContentRenderer } from '@/components/ui/SmartContentRenderer'
import { PointPageActions } from '@/components/ui/PointPageActions'
import { getPointPageConfig } from '@/lib/knowledge/pointPage.config'
import { getPointConfig } from '@/lib/knowledge/pointConfigs'
import { getDefaultExamOverview, type Takeaway } from '@/lib/knowledge/pointPage.schema'
import { formatAbbreviations } from '@/lib/abbreviations'
import type { Action } from '@/lib/knowledge/pointPage.types'

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

type HighYieldCard = {
  id: string
  bucket: string
  level: 'key' | 'warn' | 'danger'
  oneLiner: string
  examMove?: string
}

type CoreDrugBullet = {
  id: string
  text: string
  level?: 'key' | 'warn' | 'danger'
}

type CoreDrugCardUI = {
  id: string
  name: string
  alias?: string
  why?: string
  bullets: CoreDrugBullet[]
}

type ExamDistributionItem = {
  id: string
  text: string
  years: string
}

type ExamMapData = {
  prompt: string
  angles: string[]
  focusTitle?: string
  focus: { id: string; text: string }[]
}

const DEFAULT_ACTIONS: Record<'primary' | 'secondary' | 'tertiary', Action> = {
  primary: { label: '▶ 开始考点自测（3-5题）', type: 'selfTest', payload: { count: 5 } },
  secondary: { label: '→ 进入专项练习', type: 'practice' },
  tertiary: { label: '返回知识图谱', type: 'backToGraph', href: '/knowledge' },
}

/* ========================= */

export default function KnowledgePointPage() {
  const params = useParams()
  const pointId = params.id as string

  const [point, setPoint] = useState<KnowledgePointDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
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

  // 所有 hooks 必须在早期返回之前调用
  // 使用安全的默认值，即使 point 为 null
  const safePoint = point ?? null
  const safePointId = pointId ?? ''

  // 读取配置（优先使用新配置系统）
  const newConfig = useMemo(() => getPointConfig(safePointId), [safePointId])
  const oldConfig = useMemo(() => getPointPageConfig(safePointId), [safePointId])

  // 提取数据 - 使用安全的默认值（旧配置系统）
  const takeaways = useMemo<Takeaway[]>(() => {
    if (oldConfig?.takeaways && oldConfig.takeaways.length > 0) {
      return oldConfig.takeaways
    }
    return []
  }, [oldConfig])

  // 口诀不再单独使用，只在表格后显示（由 SmartContentRenderer 处理）

  // 计算有效值 - 使用安全的默认值
  const effectiveImportanceLevel = useMemo(() => {
    if (newConfig?.meta.stars) return newConfig.meta.stars
    if (oldConfig?.stars) return oldConfig.stars
    return safePoint?.importance_level ?? safePoint?.importance ?? 3
  }, [safePoint, newConfig, oldConfig])

  const effectiveLearnMode = useMemo(() => {
    return safePoint?.learn_mode ?? 'BOTH'
  }, [safePoint])

  // 内联注释（旧系统）
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

  const examMapData = useMemo<ExamMapData | null>(() => {
    if (examMapModule?.data) {
      return {
        prompt: examMapModule.data.prompt,
        angles: examMapModule.data.angles || [],
        focusTitle: examMapModule.data.focusTitle,
        focus: (examMapModule.data.focus || []).map((item, idx) => ({
          id: item.id || `focus-${idx}`,
          text: item.text,
        })),
      }
    }
    if (oldConfig?.examOverview) {
      const overview = oldConfig.examOverview
      return {
        prompt: overview.intro || overview.title,
        angles: overview.angles.map((angle, idx) => angle.title || angle.id || `角度${idx + 1}`),
        focusTitle: overview.focusTitle,
        focus: (overview.focus || []).map((item, idx) => ({
          id: item.id || `legacy-focus-${idx}`,
          text: item.text,
        })),
      }
    }
    if (safePoint?.title) {
      const overview = getDefaultExamOverview(safePoint.title)
      return {
        prompt: overview.intro || overview.title,
        angles: overview.angles.map((angle, idx) => angle.title || angle.id || `角度${idx + 1}`),
        focusTitle: overview.focusTitle,
        focus: overview.focus.map((item, idx) => ({
          id: item.id || `default-focus-${idx}`,
          text: item.text,
        })),
      }
    }
    return null
  }, [examMapModule, oldConfig, safePoint])

  const classificationSections = useMemo(() => {
    return classificationModule?.data.sections || []
  }, [classificationModule])

  const highYieldCards = useMemo<HighYieldCard[]>(() => {
    if (highYieldModule?.data?.rules?.length) {
      return highYieldModule.data.rules.map((rule) => ({
        id: rule.id,
        bucket: rule.bucket,
        level: rule.level,
        oneLiner: rule.oneLiner,
        examMove: rule.examMove,
      }))
    }
    if (takeaways.length > 0) {
      return takeaways.slice(0, 6).map((item, idx) => ({
        id: item.id || `fallback-high-${idx}`,
        bucket: item.level === 'danger' ? '禁忌 / 致命' : item.level === 'warn' ? '易错提醒' : '高频秒选',
        level: item.level,
        oneLiner: item.text,
      }))
    }
    return []
  }, [highYieldModule, takeaways])

  const coreDrugCards = useMemo<CoreDrugCardUI[]>(() => {
    if (coreDrugsModule?.data?.cards?.length) {
      return coreDrugsModule.data.cards.map((card) => ({
        id: card.id,
        name: card.name,
        alias: card.alias,
        why: card.why,
        bullets: (card.bullets || []).map((bullet, idx) => ({
          id: bullet.id || `card-${card.id}-${idx}`,
          text: bullet.text,
          level: bullet.level,
        })),
      }))
    }
    if (safePoint?.drug_name) {
      return [
        {
          id: `${safePoint.id}-core`,
          name: safePoint.drug_name,
          why: '本考点核心药物，需掌握适应证、禁忌与相互作用。',
          bullets: takeaways.slice(0, 4).map((item, idx) => ({
            id: item.id || `fallback-core-${idx}`,
            text: item.text,
            level: item.level,
          })),
        },
      ]
    }
    return []
  }, [coreDrugsModule, safePoint, takeaways])

  const examDistributionItems = useMemo<ExamDistributionItem[]>(() => {
    if (examDistributionModule?.data?.items?.length) {
      return examDistributionModule.data.items
    }
    if (safePoint?.exam_years?.length) {
      return [
        {
          id: `${safePoint.id}-distribution`,
          text: safePoint.title,
          years: safePoint.exam_years.join(' / '),
        },
      ]
    }
    return []
  }, [examDistributionModule, safePoint])

  const actionSet = useMemo(() => {
    return newConfig?.actions ?? DEFAULT_ACTIONS
  }, [newConfig])

  const studyRouteText = useMemo(() => {
    if (newConfig?.meta.studyRoute?.length) {
      return newConfig.meta.studyRoute.join(' → ')
    }
    if (oldConfig?.studyPath?.text) {
      return oldConfig.studyPath.text
    }
    return null
  }, [newConfig, oldConfig])

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
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="space-y-4">
            <ExamValueCard
              title={newConfig?.meta.title || safePoint.title}
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
            {studyRouteText && (
              <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/60 px-4 py-2 text-sm text-blue-900">
                学习路线：{formatAbbreviations(studyRouteText)}
              </div>
            )}
          </div>

          {examMapData && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">📌 本考点在考什么？</h2>
              <div className="space-y-3 text-gray-800 leading-relaxed">
                <p className="whitespace-pre-line">
                  {formatAbbreviations(examMapData.prompt)}
                </p>
                {examMapData.angles.length > 0 && (
                  <div className="space-y-2">
                    {examMapData.angles.map((angle, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-gray-900">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="leading-relaxed">{formatAbbreviations(angle)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {examMapData.focus.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatAbbreviations(examMapData.focusTitle || '👉 其中重点集中在：')}
                    </div>
                    <ul className="list-disc ml-5 space-y-1 text-gray-800">
                      {examMapData.focus.map((item) => (
                        <li key={item.id}>{formatAbbreviations(item.text)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {(classificationSections.length > 0 || safePoint.content) && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">结构骨架（只建立脑内地图）</h2>
              {classificationSections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {classificationSections.map((section) => (
                    <div key={section.id} className="space-y-2">
                      <h3 className="text-base font-semibold text-gray-900">
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
              ) : (
                safePoint.content && (
                  <div className="border border-gray-100 rounded-lg p-4">
                    <SmartContentRenderer
                      content={safePoint.content}
                      annotations={inlineAnnotations.length > 0 ? inlineAnnotations : undefined}
                    />
                  </div>
                )
              )}
            </div>
          )}

          {highYieldCards.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">高频考法 & 易错点（应试核心区）</h2>
              <div className="space-y-4">
                {highYieldCards.map((rule) => (
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
          )}

          {coreDrugCards.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">核心药物详解卡（只保留必考药）</h2>
              <div className="space-y-4">
                {coreDrugCards.map((card) => (
                  <div key={card.id} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🧠</span>
                      <h3 className="text-lg font-bold text-gray-900">
                        {formatAbbreviations(card.name)}
                        {card.alias && (
                          <span className="text-sm font-normal text-gray-600 ml-2">
                            ({formatAbbreviations(card.alias)})
                          </span>
                        )}
                      </h3>
                    </div>
                    {card.why && (
                      <div className="text-gray-800 leading-relaxed mb-3">
                        {formatAbbreviations(card.why)}
                      </div>
                    )}
                    {card.bullets.length > 0 && (
                      <ul className="list-disc ml-5 space-y-1 text-gray-900">
                        {card.bullets.map((bullet) => (
                          <li key={bullet.id} className="leading-relaxed">
                            {formatAbbreviations(bullet.text)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {safePoint.content && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 sm:p-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {sourceModule?.title || '📘 教材原文（精选整理，用于系统复习）'}
                </h2>
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
                {sourceExpanded && (
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

          {examDistributionItems.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">考点分布（只保留一次）</h2>
              <div className="divide-y divide-gray-100">
                {examDistributionItems.map((item) => (
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

          <PointPageActions
            primary={actionSet.primary}
            secondary={actionSet.secondary}
            tertiary={actionSet.tertiary}
            pointId={safePoint.id}
            sticky={!isMobile}
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
      </div>
    </div>
  )
}
