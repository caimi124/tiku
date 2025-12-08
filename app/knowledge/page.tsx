/**
 * 知识图谱首页（重构版 - 三级手风琴布局）
 * 
 * 功能：
 * 1. 三级手风琴布局：章节 → 小节 → 考点行
 * 2. 学习进度统计区
 * 3. 最近学习区块
 * 4. 增强搜索和筛选
 * 5. 状态保持（从详情页返回时自动展开）
 * 
 * Requirements: 1.1, 7.1, 7.2, 9.1, 9.2, 10.1
 */

'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, Brain, TrendingUp, Zap, Clock,
  ChevronRight, RefreshCw
} from 'lucide-react'
import { ChapterAccordion } from '@/components/ui/ChapterAccordion'
import { SectionAccordion } from '@/components/ui/SectionAccordion'
import { PointRow, PointTag } from '@/components/ui/PointRow'
import { PointPreviewCard } from '@/components/ui/PointPreviewCard'
import { FilterPanel, FilterPanelOptions, DEFAULT_FILTER_PANEL_OPTIONS, hasActiveFilterPanel } from '@/components/ui/FilterPanel'
import { SearchEnhanced, SearchResultItem } from '@/components/ui/SearchEnhanced'
import { MasteryProgressBar } from '@/components/ui/MasteryProgressBar'
import { SequentialLearning } from '@/components/ui/SequentialLearning'

// 章节结构类型
interface ChapterStructure {
  id: string
  code: string
  title: string
  point_count: number
  high_frequency_count: number
  mastery_score: number
  sections: SectionStructure[]
}

interface SectionStructure {
  id: string
  code: string
  title: string
  point_count: number
  high_frequency_count: number
  completed_count: number
  mastery_score?: number
}

// 考点行数据
interface PointRowData {
  id: string
  code: string
  title: string
  importance: number
  is_high_frequency: boolean
  tags: PointTag[]
  key_takeaway: string
  exam_years?: number[]
  is_completed: boolean
  is_favorited: boolean
  is_marked_review: boolean
}

// 用户进度数据
interface UserProgress {
  total_points: number
  learned_count: number
  mastered_count: number
  review_count: number
  overall_percentage: number
}

// 最近学习项
interface RecentPoint {
  id: string
  title: string
  section_title: string
  visited_at: string
}

// 预览卡片数据
interface PreviewData {
  id: string
  title: string
  coreMemoryPoints: string[]
  examYears: number[]
  tags: PointTag[]
  position: { x: number; y: number }
}

// 手风琴状态（localStorage）
interface AccordionState {
  expandedChapters: string[]
  expandedSections: string[]
  lastVisitedPointId?: string
}

const ACCORDION_STATE_KEY = 'knowledge_accordion_state'

function KnowledgePageContent() {
  const router = useRouter()
  
  // 数据状态
  const [chapters, setChapters] = useState<ChapterStructure[]>([])
  const [sectionPoints, setSectionPoints] = useState<Record<string, PointRowData[]>>({})
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [recentLearning, setRecentLearning] = useState<RecentPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSections, setLoadingSections] = useState<Set<string>>(new Set())
  
  // UI状态
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [highlightedPointId, setHighlightedPointId] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterPanelOptions>(DEFAULT_FILTER_PANEL_OPTIONS)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  
  // 统计数据
  const stats = useMemo(() => {
    const totalPoints = chapters.reduce((sum, ch) => sum + ch.point_count, 0)
    const highFrequency = chapters.reduce((sum, ch) => sum + ch.high_frequency_count, 0)
    return {
      chapter_count: chapters.length,
      point_count: totalPoints,
      high_frequency_count: highFrequency
    }
  }, [chapters])

  // 初始化加载
  useEffect(() => {
    loadInitialData()
    restoreAccordionState()
  }, [])
  
  // URL锚点定位
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      handleHashNavigation(hash)
    }
  }, [chapters])
  
  // 保存手风琴状态
  useEffect(() => {
    if (chapters.length > 0) {
      saveAccordionState()
    }
  }, [expandedChapters, expandedSections, highlightedPointId])

  // 加载初始数据
  const loadInitialData = async () => {
    setLoading(true)
    try {
      // 并行加载结构和进度数据
      const [structureRes, progressRes] = await Promise.all([
        fetch('/api/knowledge/structure?subject=xiyao_yaoxue_er'),
        fetch('/api/user/progress?subject=xiyao_yaoxue_er')
      ])
      
      const structureData = await structureRes.json()
      const progressData = await progressRes.json()
      
      if (structureData.success) {
        // API返回的是 data.structure，不是 data.chapters
        setChapters(structureData.data.structure || structureData.data.chapters || [])
      }
      
      if (progressData.success) {
        // API返回的是 data.stats，需要转换为页面期望的格式
        const stats = progressData.data.stats || progressData.data
        setUserProgress({
          total_points: stats.total_points || 0,
          learned_count: stats.learned_count || 0,
          mastered_count: stats.mastered_count || 0,
          review_count: stats.review_count || 0,
          overall_percentage: stats.completion_percentage || stats.overall_percentage || 0
        })
        setRecentLearning(progressData.data.recent_points || progressData.data.recent_learning || [])
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 恢复手风琴状态
  const restoreAccordionState = () => {
    try {
      const saved = localStorage.getItem(ACCORDION_STATE_KEY)
      if (saved) {
        const state: AccordionState = JSON.parse(saved)
        setExpandedChapters(new Set(state.expandedChapters))
        setExpandedSections(new Set(state.expandedSections))
        if (state.lastVisitedPointId) {
          setHighlightedPointId(state.lastVisitedPointId)
          // 3秒后取消高亮
          setTimeout(() => setHighlightedPointId(null), 3000)
        }
      }
    } catch (e) {
      // ignore
    }
  }
  
  // 保存手风琴状态
  const saveAccordionState = () => {
    const state: AccordionState = {
      expandedChapters: Array.from(expandedChapters),
      expandedSections: Array.from(expandedSections),
      lastVisitedPointId: highlightedPointId || undefined
    }
    localStorage.setItem(ACCORDION_STATE_KEY, JSON.stringify(state))
  }
  
  // 处理URL锚点导航
  const handleHashNavigation = (hash: string) => {
    const match = hash.match(/#(chapter|section|point)-(.+)/)
    if (!match) return
    
    const [, type, id] = match
    
    if (type === 'chapter') {
      setExpandedChapters(prev => new Set([...prev, id]))
    } else if (type === 'section') {
      // 找到小节所属的章节并展开
      for (const chapter of chapters) {
        const section = chapter.sections.find(s => s.id === id)
        if (section) {
          setExpandedChapters(prev => new Set([...prev, chapter.id]))
          setExpandedSections(prev => new Set([...prev, id]))
          loadSectionPoints(id)
          break
        }
      }
    } else if (type === 'point') {
      // 找到考点所属的章节和小节并展开
      setHighlightedPointId(id)
      // 需要从API获取考点的位置信息
    }
  }
  
  // 懒加载小节考点
  const loadSectionPoints = async (sectionId: string) => {
    if (sectionPoints[sectionId] || loadingSections.has(sectionId)) return
    
    setLoadingSections(prev => new Set([...prev, sectionId]))
    try {
      const res = await fetch(`/api/section/${sectionId}/points`)
      const data = await res.json()
      
      if (data.success) {
        setSectionPoints(prev => ({
          ...prev,
          [sectionId]: data.data.points || []
        }))
      }
    } catch (error) {
      console.error('加载考点失败:', error)
    } finally {
      setLoadingSections(prev => {
        const next = new Set(prev)
        next.delete(sectionId)
        return next
      })
    }
  }
  
  // 章节展开/收起
  const handleChapterToggle = (chapterId: string, expanded: boolean) => {
    setExpandedChapters(prev => {
      const next = new Set(prev)
      if (expanded) {
        next.add(chapterId)
      } else {
        next.delete(chapterId)
      }
      return next
    })
  }
  
  // 小节展开/收起
  const handleSectionToggle = (sectionId: string, expanded: boolean) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (expanded) {
        next.add(sectionId)
      } else {
        next.delete(sectionId)
      }
      return next
    })
  }
  
  // 小节展开时加载考点
  const handleSectionExpand = (sectionId: string) => {
    loadSectionPoints(sectionId)
  }
  
  // 考点点击
  const handlePointClick = (pointId: string) => {
    // 保存当前状态，以便返回时恢复
    setHighlightedPointId(pointId)
    router.push(`/knowledge/point/${pointId}`)
  }
  
  // 搜索结果点击
  const handleSearchResultClick = (result: SearchResultItem) => {
    if (result.type === 'point') {
      handlePointClick(result.id)
    } else if (result.type === 'section') {
      handleExpandSection(result.id)
    } else if (result.type === 'chapter') {
      handleExpandChapter(result.id)
    }
  }
  
  // 展开指定章节
  const handleExpandChapter = (chapterId: string) => {
    setExpandedChapters(prev => new Set([...prev, chapterId]))
    // 滚动到章节位置
    setTimeout(() => {
      document.getElementById(`chapter-${chapterId}`)?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }
  
  // 展开指定小节
  const handleExpandSection = (sectionId: string) => {
    // 找到小节所属章节
    for (const chapter of chapters) {
      const section = chapter.sections.find(s => s.id === sectionId)
      if (section) {
        setExpandedChapters(prev => new Set([...prev, chapter.id]))
        setExpandedSections(prev => new Set([...prev, sectionId]))
        loadSectionPoints(sectionId)
        // 滚动到小节位置
        setTimeout(() => {
          document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth' })
        }, 200)
        break
      }
    }
  }
  
  // 筛选考点
  const filterPoints = useCallback((points: PointRowData[]): PointRowData[] => {
    if (!hasActiveFilterPanel(filters)) return points
    
    return points.filter(point => {
      // 标签筛选
      if (filters.tags.length > 0) {
        const pointTags = point.tags.map(t => t.type)
        if (!filters.tags.some(tag => pointTags.includes(tag) || (tag === 'high_frequency' && point.is_high_frequency))) {
          return false
        }
      }
      
      // 学习状态筛选
      if (filters.status.length > 0) {
        const status = point.is_completed ? 'mastered' : 
                       point.is_marked_review ? 'review' : 'not_started'
        if (!filters.status.includes(status as any)) {
          return false
        }
      }
      
      // 收藏筛选
      if (filters.showFavorites && !point.is_favorited) {
        return false
      }
      
      // 待复习筛选
      if (filters.showReview && !point.is_marked_review) {
        return false
      }
      
      return true
    })
  }, [filters])
  
  // 计算筛选后的考点数量
  const filteredPointCount = useMemo(() => {
    let count = 0
    Object.values(sectionPoints).forEach(points => {
      count += filterPoints(points).length
    })
    return count
  }, [sectionPoints, filterPoints])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载知识图谱...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-blue-500" />
                知识图谱
              </h1>
              <p className="text-gray-500 text-sm mt-1">西药二 · 药学专业知识（二）</p>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard" 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                学习仪表盘
              </Link>
            </div>
          </div>
          
          {/* 搜索框 */}
          <div className="mt-4">
            <SearchEnhanced
              subject="xiyao_yaoxue_er"
              onResultClick={handleSearchResultClick}
              onExpandSection={handleExpandSection}
              onExpandChapter={handleExpandChapter}
            />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* 学习进度统计区 */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              学习进度
            </h2>
            {userProgress && userProgress.review_count > 0 && (
              <Link
                href="/practice/review"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                去复习 ({userProgress.review_count})
              </Link>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-800">{stats.point_count}</div>
              <div className="text-xs text-gray-500">总考点</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{userProgress?.learned_count || 0}</div>
              <div className="text-xs text-gray-500">已学习</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{userProgress?.mastered_count || 0}</div>
              <div className="text-xs text-gray-500">已掌握</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-600">{userProgress?.review_count || 0}</div>
              <div className="text-xs text-gray-500">待复习</div>
            </div>
          </div>
          
          <MasteryProgressBar 
            score={userProgress?.overall_percentage || 0} 
            size="md" 
            showLabel={true}
            showPercentage={true}
          />
        </div>
        
        {/* 最近学习区块 */}
        {recentLearning.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-500" />
              最近学习
            </h2>
            <div className="flex flex-wrap gap-2">
              {recentLearning.slice(0, 5).map(point => (
                <Link
                  key={point.id}
                  href={`/knowledge/point/${point.id}`}
                  className="px-3 py-2 bg-gray-50 hover:bg-blue-50 rounded-lg text-sm transition flex items-center gap-2"
                >
                  <span className="text-gray-800">{point.title}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* 顺序学习卡片 */}
        <SequentialLearning 
          subject="xiyao_yaoxue_er" 
          variant="card" 
          className="mb-6"
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧筛选面板 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                matchCount={hasActiveFilterPanel(filters) ? filteredPointCount : stats.point_count}
                totalCount={stats.point_count}
              />
              
              {/* 统计卡片 */}
              <div className="mt-4 bg-white rounded-xl border p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">章节</span>
                  <span className="font-medium text-gray-800">{stats.chapter_count}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">考点</span>
                  <span className="font-medium text-gray-800">{stats.point_count}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Zap className="w-4 h-4 text-red-500" />
                    高频考点
                  </span>
                  <span className="font-medium text-red-600">{stats.high_frequency_count}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 右侧手风琴列表 */}
          <div className="lg:col-span-3 space-y-3">
            {chapters.map(chapter => (
              <div key={chapter.id} id={`chapter-${chapter.id}`}>
                <ChapterAccordion
                  id={chapter.id}
                  code={chapter.code}
                  title={chapter.title}
                  pointCount={chapter.point_count}
                  highFrequencyCount={chapter.high_frequency_count}
                  masteryScore={chapter.mastery_score}
                  isExpanded={expandedChapters.has(chapter.id)}
                  onToggle={handleChapterToggle}
                >
                  {/* 小节列表 */}
                  {chapter.sections.map(section => (
                    <div key={section.id} id={`section-${section.id}`}>
                      <SectionAccordion
                        id={section.id}
                        code={section.code}
                        title={section.title}
                        pointCount={section.point_count}
                        highFrequencyCount={section.high_frequency_count}
                        masteryScore={section.mastery_score || 0}
                        isExpanded={expandedSections.has(section.id)}
                        onToggle={handleSectionToggle}
                        onExpand={handleSectionExpand}
                        loading={loadingSections.has(section.id)}
                      >
                        {/* 考点列表 */}
                        {sectionPoints[section.id] && filterPoints(sectionPoints[section.id]).map(point => (
                          <PointRow
                            key={point.id}
                            id={point.id}
                            code={point.code}
                            title={point.title}
                            keyTakeaway={point.key_takeaway}
                            importance={point.importance}
                            tags={point.tags}
                            examYears={point.exam_years}
                            isFavorite={point.is_favorited}
                            isReview={point.is_marked_review}
                            isHighlighted={highlightedPointId === point.id}
                            onClick={handlePointClick}
                          />
                        ))}
                      </SectionAccordion>
                    </div>
                  ))}
                </ChapterAccordion>
              </div>
            ))}
            
            {chapters.length === 0 && !loading && (
              <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">暂无知识点数据</h3>
                <p className="text-gray-400">请先导入知识点数据</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 预览卡片 */}
      {previewData && (
        <PointPreviewCard
          id={previewData.id}
          title={previewData.title}
          coreMemoryPoints={previewData.coreMemoryPoints}
          examYears={previewData.examYears}
          tags={previewData.tags}
          position={previewData.position}
          onClose={() => setPreviewData(null)}
          onViewDetail={(id) => handlePointClick(id)}
        />
      )}
    </div>
  )
}

// Loading fallback component
function KnowledgePageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">加载知识图谱...</p>
      </div>
    </div>
  )
}

// Export with Suspense boundary for useSearchParams compatibility
export default function KnowledgePage() {
  return (
    <Suspense fallback={<KnowledgePageLoading />}>
      <KnowledgePageContent />
    </Suspense>
  )
}
