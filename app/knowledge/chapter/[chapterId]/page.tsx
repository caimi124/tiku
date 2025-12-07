/**
 * 章节页面
 * 
 * 显示指定章节下的所有小节卡片
 * 
 * 功能：
 * 1. 面包屑导航
 * 2. 章节概览区域
 * 3. 小节卡片网格
 * 
 * Requirements: 1.2, 1.3, 5.1
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, Clock, Star, ArrowLeft, 
  ChevronRight, Zap, TrendingUp
} from 'lucide-react'
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/Breadcrumb'
import { SectionGrid, SectionSummary } from '@/components/ui/SectionCard'
import { MasteryProgressBar } from '@/components/ui/MasteryProgressBar'

interface ChapterInfo {
  id: string
  code: string
  title: string
}

interface ChapterStats {
  total_sections: number
  total_points: number
  high_frequency_count: number
  suggested_time: number
}

export default function ChapterPage() {
  const router = useRouter()
  const params = useParams()
  const chapterId = params.chapterId as string
  
  const [chapter, setChapter] = useState<ChapterInfo | null>(null)
  const [sections, setSections] = useState<SectionSummary[]>([])
  const [stats, setStats] = useState<ChapterStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (chapterId) {
      fetchChapterData()
    }
  }, [chapterId])

  const fetchChapterData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch(`/api/chapter/${chapterId}/sections`)
      const data = await res.json()
      
      if (data.success) {
        setChapter(data.data.chapter)
        setSections(data.data.sections)
        setStats(data.data.stats)
      } else {
        setError(data.error?.message || '加载失败')
      }
    } catch (err) {
      console.error('获取章节数据失败:', err)
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSectionClick = (sectionId: string) => {
    router.push(`/knowledge/chapter/${chapterId}/section/${sectionId}`)
  }

  // 构建面包屑
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: '首页', url: '/', type: 'home' },
    { label: '知识库', url: '/knowledge', type: 'knowledge' },
  ]
  
  if (chapter) {
    breadcrumbItems.push({
      label: `第${chapter.code}章：${chapter.title}`,
      url: `/knowledge/chapter/${chapter.id}`,
      type: 'chapter'
    })
  }

  // 格式化学习时间
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载章节内容...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchChapterData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              重试
            </button>
            <Link
              href="/knowledge"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              返回知识库
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 头部导航 */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* 面包屑 */}
          <Breadcrumb items={breadcrumbItems} />
          
          {/* 返回按钮和标题 */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => router.push('/knowledge')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="text-sm text-gray-500">第{chapter?.code}章</div>
              <h1 className="text-xl font-bold text-gray-800">{chapter?.title}</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 章节概览 */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            章节概览
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.total_sections || 0}</div>
              <div className="text-sm text-gray-600">小节</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats?.total_points || 0}</div>
              <div className="text-sm text-gray-600">考点</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats?.high_frequency_count || 0}</div>
              <div className="text-sm text-gray-600">高频考点</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats?.suggested_time ? formatTime(stats.suggested_time) : '-'}
              </div>
              <div className="text-sm text-gray-600">建议学习时间</div>
            </div>
          </div>
          
          {/* 学习建议 */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800 mb-1">学习建议</div>
                <p className="text-sm text-gray-600">
                  本章共{stats?.total_sections || 0}个小节，{stats?.total_points || 0}个考点，
                  其中{stats?.high_frequency_count || 0}个高频考点需要重点掌握。
                  建议按小节顺序学习，每个小节学习后进行练习巩固。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 小节列表 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            全部小节
          </h2>
          
          {sections.length > 0 ? (
            <SectionGrid
              sections={sections}
              onSectionClick={handleSectionClick}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">暂无小节</h3>
              <p className="text-gray-400">该章节下暂无小节内容</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
