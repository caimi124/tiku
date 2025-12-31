/**
 * 知识点详情页（重构版 - 应试驱动布局）
 * 
 * 布局顺序：
 * A. 考试价值卡（顶部首屏必见）
 * B. 本页重点速览（6-8条，可折叠）
 * C. 口诀（有则展示；没有先放占位"后续补充"）
 * D. 结构骨架（分类表，可折叠）
 * E. 老司机/易错点（先从重点速览复用；后续可自动化）
 * F. 细节查阅区（临床用药评价/药物信息表：默认折叠）
 * G. 历年考点分布（弱化展示）
 * H. 行动区（桌面端可做粘底；否则页面底部）
 */

'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { ChevronDown, ChevronUp, Lightbulb, AlertTriangle, BookOpen, Calendar } from 'lucide-react'

import { ExamValueCard } from '@/components/ui/ExamValueCard'
import { KeyTakeaways } from '@/components/ui/KeyTakeaways'
import { FocusModeToggle } from '@/components/ui/FocusModeToggle'
import { ActionArea } from '@/components/ui/ActionArea'
import { SmartContentRenderer } from '@/components/ui/SmartContentRenderer'
import { isPointCompleted } from '@/lib/learningProgress'
import { getKeyTakeaways } from '@/lib/keyTakeawaysConfig'
import { extractMnemonic, hasClassificationTable } from '@/lib/contentUtils'

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
  const [focusMode, setFocusMode] = useState(false)
  
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

  // 提取数据 - 使用安全的默认值
  const keyTakeaways = useMemo(() => getKeyTakeaways(safePointId), [safePointId])
  const mnemonic = useMemo(() => {
    if (safePoint?.memory_tips) return safePoint.memory_tips
    if (safePoint?.content) return extractMnemonic(safePoint.content)
    return null
  }, [safePoint])
  const hasStructure = useMemo(() => {
    return safePoint?.content ? hasClassificationTable(safePoint.content) : false
  }, [safePoint])

  // 计算有效值 - 使用安全的默认值
  const effectiveImportanceLevel = useMemo(() => {
    return safePoint?.importance_level ?? safePoint?.importance ?? 3
  }, [safePoint])

  const effectiveLearnMode = useMemo(() => {
    return safePoint?.learn_mode ?? 'BOTH'
  }, [safePoint])

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
          title={safePoint.title}
          importanceLevel={effectiveImportanceLevel}
          masteryScore={safePoint.mastery_score}
          learnMode={effectiveLearnMode}
          examYears={safePoint.exam_years}
          examFrequency={safePoint.exam_frequency}
          className="mb-6"
        />

        {/* 只看重点开关 */}
        <FocusModeToggle
          enabled={focusMode}
          onToggle={setFocusMode}
          className="mb-6"
        />

        {/* B. 本页重点速览 */}
        {keyTakeaways.length > 0 && (
          <KeyTakeaways
            items={keyTakeaways}
            defaultExpanded={true}
            className="mb-6"
          />
        )}

        {/* C. 口诀 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">记忆口诀</h2>
          </div>
          {mnemonic ? (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
              <p className="text-amber-800 font-medium text-lg leading-relaxed">{mnemonic}</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <Lightbulb className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">暂无口诀，后续补充</p>
            </div>
          )}
        </div>

        {/* D. 结构骨架（分类表） */}
        {hasStructure && (
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
        {keyTakeaways.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">老司机提醒 / 易错点</h2>
            </div>
            <div className="space-y-3">
              {keyTakeaways.slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100"
                >
                  <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 leading-relaxed flex-1">{item}</p>
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
                  <SmartContentRenderer content={safePoint.content} />
                ) : (
                  <div className="text-gray-400 py-8 text-center">暂无内容</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* G. 历年考点分布（弱化展示） */}
        {!focusMode && safePoint.exam_years && safePoint.exam_years.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-600">历年考点分布</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {safePoint.exam_years.map((year) => (
                <span
                  key={year}
                  className="px-2 py-1 text-xs text-gray-500 bg-gray-50 rounded border border-gray-200"
                >
                  {year}年
                </span>
              ))}
            </div>
          </div>
        )}

        {/* H. 行动区 */}
        <ActionArea
          pointId={safePoint.id}
          isCompleted={pointCompleted}
          sticky={!isMobile}
          className="mb-6"
        />

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
