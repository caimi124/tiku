/**
 * 知识点详情页（稳定构建版）
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Menu } from 'lucide-react'

import { MasteryProgressBar } from '@/components/ui/MasteryProgressBar'
import { MasteryStatusBadge } from '@/components/ui/MasteryStatusBadge'
import { ImportanceStars, isHighFrequency } from '@/components/ui/ImportanceStars'
import { ExpertTipsPanel, ExpertTips } from '@/components/ui/ExpertTipsPanel'
import { SectionTOC, MobileTOCDrawer, TOCPoint } from '@/components/ui/SectionTOC'
import { PointNavigation, MobileBottomNav, NavPoint } from '@/components/ui/PointNavigation'
import { SmartContentRenderer } from '@/components/ui/SmartContentRenderer'

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
  related_points?: any[]
  content_item_accuracy?: any[]
  navigation?: {
    prev_point?: NavPoint
    next_point?: NavPoint
    section_points?: TOCPoint[]
  }
  chapter?: { id: string; title: string; code: string }
  section?: { id: string; title: string; code: string }
}

/* ========================= */

const LEARN_MODE_BADGES = {
  MEMORIZE: { label: '必背', className: 'bg-amber-100 text-amber-700' },
  PRACTICE: { label: '多练', className: 'bg-emerald-100 text-emerald-700' },
  BOTH: { label: '背+练', className: 'bg-slate-100 text-slate-700' },
}

function getImportanceBadge(level?: number) {
  if ((level ?? 0) >= 4) {
    return { symbol: '🔥', label: '高频', className: 'bg-red-100 text-red-600' }
  }
  if ((level ?? 0) === 3) {
    return { symbol: '🟡', label: '常考', className: 'bg-amber-100 text-amber-600' }
  }
  return { symbol: '⚪', label: '低频', className: 'bg-slate-100 text-slate-500' }
}

function getLearnModeBadge(mode?: string) {
  return (LEARN_MODE_BADGES as any)[mode ?? 'BOTH'] ?? LEARN_MODE_BADGES.BOTH
}

/* ========================= */

export default function KnowledgePointPage() {
  const params = useParams()
  const router = useRouter()
  const pointId = params.id as string

  const [point, setPoint] = useState<KnowledgePointDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMobileTOC, setShowMobileTOC] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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

  if (loading) return <div className="p-8">加载中…</div>
  if (error || !point) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">{error || '知识点不存在'}</p>
        <Link href="/knowledge" className="text-blue-600">返回知识图谱</Link>
      </div>
    )
  }

  /* ======== 关键修复点（止血） ======== */
  const effectiveImportanceLevel =
    point.importance_level ??
    point.importance ??
    3

  const effectiveLearnMode =
    point.learn_mode ?? 'BOTH'
  /* ==================================== */

  const importanceBadge = getImportanceBadge(effectiveImportanceLevel)
  const learnModeBadge = getLearnModeBadge(effectiveLearnMode)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-3">{point.title}</h1>

        <div className="flex items-center gap-3 mb-4 text-sm">
          <ImportanceStars level={effectiveImportanceLevel} size="md" />
          <span className={`px-2 py-0.5 rounded ${importanceBadge.className}`}>
            {importanceBadge.symbol} {importanceBadge.label}
          </span>
          <span className={`px-2 py-0.5 rounded ${learnModeBadge.className}`}>
            {learnModeBadge.label}
          </span>
          {isHighFrequency(effectiveImportanceLevel) && (
            <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-600">
              高频考点
            </span>
          )}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          {point.content
            ? <SmartContentRenderer content={point.content} />
            : <div className="text-gray-400">暂无内容</div>
          }
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href={`/practice/by-point?pointId=${point.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            专项练习
          </Link>
          <Link
            href="/knowledge"
            className="px-4 py-2 bg-gray-200 rounded"
          >
            返回知识图谱
          </Link>
        </div>
      </div>
    </div>
  )
}
