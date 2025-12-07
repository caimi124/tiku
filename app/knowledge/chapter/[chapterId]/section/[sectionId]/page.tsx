/**
 * 小节页面
 * 
 * 显示指定小节下的所有考点
 * 
 * 功能：
 * 1. 面包屑导航
 * 2. 考点梳理区域
 * 3. 考点卡片列表
 * 4. 标签筛选功能
 * 
 * Requirements: 1.4, 1.5, 4.7, 5.1
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, ArrowLeft, Filter, X
} from 'lucide-react'
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/Breadcrumb'
import { PointOverview, PointOverviewData, PointSummaryItem } from '@/components/ui/PointOverview'
import { PointGrid, PointSummary } from '@/components/ui/PointCard'
import { TagBadge, PointTag } from '@/components/ui/TagBadge'

interface ChapterInfo {
  id: string
  code: string
  title: string
}

interface SectionInfo {
  id: string
  code: string
  title: string
}

// 标签筛选选项
const TAG_FILTER_OPTIONS = [
  { type: 'high_frequency', label: '高频', color: '#EF4444' },
  { type: 'must_test', label: '必考', color: '#F97316' },
  { type: 'easy_mistake', label: '易错', color: '#EAB308' },
  { type: 'basic', label: '基础', color: '#3B82F6' },
  { type: 'reinforce', label: '强化', color: '#8B5CF6' },
]

export default function SectionPage() {
  const router = useRouter()
  const params = useParams()
  const chapterId = params.chapterId as string
  const sectionId = params.sectionId as string
  
  const [chapter, setChapter] = useState<ChapterInfo | null>(null)
  const [section, setSection] = useState<SectionInfo | null>(null)
  const [overview, setOverview] = useState<PointOverviewData | null>(null)
  const [points, setPoints] = useState<PointSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 标签筛选状态
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  
  // 考点卡片区域引用（用于滚动）
  const pointCardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sectionId) {
      fetchSectionData()
    }
  }, [sectionId])

  const fetchSectionData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch(`/api/section/${sectionId}/points`)
      const data = await res.json()
      
      if (data.success) {
        setChapter(data.data.chapter)
        setSection(data.data.section)
        setOverview(data.data.overview)
        setPoints(data.data.points)
      } else {
        setError(data.error?.message || '加载失败')
      }
    } catch (err) {
      console.error('获取小节数据失败:', err)
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 点击考点卡片
  const handlePointClick = (pointId: string) => {
    router.push(`/knowledge/point/${pointId}`)
  }

  // 从考点梳理点击，滚动到对应卡片
  const handleOverviewPointClick = (pointId: string) => {
    const cardElement = document.getElementById(`point-card-${pointId}`)
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 高亮效果
      cardElement.classList.add('ring-2', 'ring-blue-500')
      setTimeout(() => {
        cardElement.classList.remove('ring-2', 'ring-blue-500')
      }, 2000)
    }
  }

  // 标签筛选
  const toggleTagFilter = (tagType: string) => {
    setSelectedTags(prev => 
      prev.includes(tagType)
        ? prev.filter(t => t !== tagType)
        : [...prev, tagType]
    )
  }

  // 清除所有筛选
  const clearFilters = () => {
    setSelectedTags([])
  }

  // 筛选后的考点列表
  const filteredPoints = selectedTags.length === 0
    ? points
    : points.filter(point => 
        point.tags.some(tag => selectedTags.includes(tag.type))
      )

  // 构建面包屑
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: '首页', url: '/', type: 'home' },
    { label: '知识库', url: '/knowledge', type: 'knowledge' },
  ]
  
  if (chapter) {
    breadcrumbItems.push({
      label: `第${chapter.code}章`,
      url: `/knowledge/chapter/${chapter.id}`,
      type: 'chapter'
    })
  }
  
  if (section) {
    breadcrumbItems.push({
      label: section.title,
      url: `/knowledge/chapter/${chapterId}/section/${section.id}`,
      type: 'section'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载考点内容...</p>
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
              onClick={fetchSectionData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              重试
            </button>
            <Link
              href={`/knowledge/chapter/${chapterId}`}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              返回章节
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
              onClick={() => router.push(`/knowledge/chapter/${chapterId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="text-sm text-gray-500">第{section?.code}节</div>
              <h1 className="text-xl font-bold text-gray-800">{section?.title}</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 考点梳理区域 */}
        {overview && (
          <PointOverview
            overview={overview}
            points={points.map(p => ({
              id: p.id,
              code: p.code,
              title: p.title,
              tags: p.tags,
              exam_years: p.exam_years,
              importance: p.importance
            }))}
            onPointClick={handleOverviewPointClick}
            className="mb-6"
          />
        )}

        {/* 考点列表区域 */}
        <div ref={pointCardsRef}>
          {/* 标题和筛选 */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              考点列表
              {selectedTags.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  （筛选后 {filteredPoints.length}/{points.length}）
                </span>
              )}
            </h2>
            
            {/* 筛选按钮 */}
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg border transition
                ${selectedTags.length > 0 
                  ? 'bg-blue-50 border-blue-200 text-blue-600' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">筛选</span>
              {selectedTags.length > 0 && (
                <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {selectedTags.length}
                </span>
              )}
            </button>
          </div>

          {/* 筛选面板 */}
          {showFilterPanel && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">按标签筛选</span>
                {selectedTags.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    清除筛选
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {TAG_FILTER_OPTIONS.map(option => (
                  <button
                    key={option.type}
                    onClick={() => toggleTagFilter(option.type)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition
                      ${selectedTags.includes(option.type)
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                    style={selectedTags.includes(option.type) ? { backgroundColor: option.color } : {}}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 已选筛选标签 */}
          {selectedTags.length > 0 && !showFilterPanel && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-sm text-gray-500">已筛选：</span>
              {selectedTags.map(tagType => {
                const option = TAG_FILTER_OPTIONS.find(o => o.type === tagType)
                return option ? (
                  <button
                    key={tagType}
                    onClick={() => toggleTagFilter(tagType)}
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white"
                    style={{ backgroundColor: option.color }}
                  >
                    {option.label}
                    <X className="w-3 h-3" />
                  </button>
                ) : null
              })}
            </div>
          )}

          {/* 考点卡片网格 */}
          {filteredPoints.length > 0 ? (
            <PointGrid
              points={filteredPoints}
              onPointClick={handlePointClick}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {selectedTags.length > 0 ? '没有符合筛选条件的考点' : '暂无考点'}
              </h3>
              <p className="text-gray-400">
                {selectedTags.length > 0 
                  ? '请尝试调整筛选条件' 
                  : '该小节下暂无考点内容'
                }
              </p>
              {selectedTags.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  清除筛选
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
