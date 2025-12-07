/**
 * 小节总结页面
 * 
 * 显示小节的考点梳理和重点强化内容
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ImportanceStars, isHighFrequency } from '@/components/ui/ImportanceStars'
import { MasteryStatusBadge } from '@/components/ui/MasteryStatusBadge'

interface PointOverview {
  id: string
  title: string
  importance: number
  mastery_score?: number
  exam_years?: number[]  // 历年考查年份
  is_high_frequency?: boolean
}

interface SectionSummary {
  id: string
  code: string
  title: string
  content: string
  parent_title: string  // 章节标题
  points: PointOverview[]
  reinforcement_image?: string  // 重点强化图
}

export default function SectionSummaryPage() {
  const params = useParams()
  const sectionId = params.id as string
  const [summary, setSummary] = useState<SectionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)

  useEffect(() => {
    if (sectionId) {
      fetchSectionSummary()
    }
  }, [sectionId])

  const fetchSectionSummary = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/section-summary/${sectionId}`)
      const data = await response.json()
      
      if (data.success) {
        setSummary(data.data)
      } else {
        setError(data.error || '获取小节总结失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            {error || '小节总结不存在'}
          </h1>
          <Link 
            href="/knowledge" 
            className="text-blue-600 hover:underline"
          >
            返回知识图谱
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 面包屑导航 */}
        <nav className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/knowledge" className="hover:text-blue-600">
                知识图谱
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span>/</span>
              <span>{summary.parent_title}</span>
            </li>
            <li className="flex items-center gap-2">
              <span>/</span>
              <span className="text-gray-900 font-medium">{summary.title}</span>
            </li>
          </ol>
        </nav>
        
        {/* 主卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* 头部 */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span>📋</span> {summary.title}
            </h1>
            <p className="text-gray-600">
              本节共 {summary.points.length} 个考点，
              其中 {summary.points.filter(p => p.is_high_frequency || p.importance >= 4).length} 个高频考点
            </p>
          </div>
          
          {/* 考点梳理 */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>📝</span> 考点梳理
            </h2>
            <div className="space-y-3">
              {summary.points.map((point, index) => (
                <Link
                  key={point.id}
                  href={`/knowledge/point/${point.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-mono text-sm w-6">
                      {index + 1}.
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800">{point.title}</span>
                        <ImportanceStars level={point.importance} size="sm" />
                        {(point.is_high_frequency || point.importance >= 4) && (
                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">
                            🔥高频
                          </span>
                        )}
                      </div>
                      {point.exam_years && point.exam_years.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {point.exam_years.join('、')} 考过
                        </p>
                      )}
                    </div>
                  </div>
                  {point.mastery_score !== undefined && (
                    <MasteryStatusBadge score={point.mastery_score} size="sm" />
                  )}
                </Link>
              ))}
            </div>
          </div>
          
          {/* 重点强化 */}
          {summary.reinforcement_image && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span>🎯</span> 重点强化
              </h2>
              <p className="text-sm text-gray-500 mb-4">点击图片可放大</p>
              <div 
                className="cursor-pointer"
                onClick={() => setImageModalOpen(true)}
              >
                <img 
                  src={summary.reinforcement_image} 
                  alt="重点强化思维导图"
                  className="w-full rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
                />
              </div>
            </div>
          )}
          
          {/* 学习建议 */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>💡</span> 学习建议
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                重点掌握高频考点的作用机制和不良反应
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                注意药物之间的对比和区别
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                结合临床应用场景记忆
              </li>
            </ul>
          </div>
          
          {/* 操作按钮 */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/knowledge"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                返回知识图谱
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* 图片放大弹窗 */}
      {imageModalOpen && summary.reinforcement_image && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              ✕ 关闭
            </button>
            <img 
              src={summary.reinforcement_image} 
              alt="重点强化思维导图"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
