/**
 * 知识图谱主页面（重设计版）
 * 支持两种视图：
 * 1. 章节卡片网格布局（默认）
 * 2. 树状导航 + 内容展示双栏布局
 * 
 * Requirements: 1.1, 4.4, 9.1
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, Brain, TrendingUp, Zap, ChevronRight, 
  Grid3X3, List, Search, X
} from 'lucide-react'
import { KnowledgeTreeNav } from '@/components/ui/KnowledgeTreeNav'
import { FilterBar } from '@/components/ui/FilterBar'
import { ContentTypeCard, KnowledgeContentCards } from '@/components/ui/ContentTypeCard'
import { ExpertTipsPanel } from '@/components/ui/ExpertTipsPanel'
import { MasteryProgressBar } from '@/components/ui/MasteryProgressBar'
import { MasteryStatusBadge } from '@/components/ui/MasteryStatusBadge'
import { ImportanceStars } from '@/components/ui/ImportanceStars'
import { ChapterCard, ChapterGrid, ChapterSummary } from '@/components/ui/ChapterCard'
import { 
  KnowledgeChapter, 
  KnowledgeNode,
  isPointNode 
} from '@/lib/knowledge-tree-utils'
import { 
  FilterOptions, 
  DEFAULT_FILTER, 
  calculateFilterStats,
  FilterStats 
} from '@/lib/filter-utils'
import { ExpertTips } from '@/lib/expert-tips-utils'

type ViewMode = 'grid' | 'tree'

interface Stats {
  chapter_count: number
  section_count: number
  point_count: number
  high_importance_count: number
}

export default function KnowledgePage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [tree, setTree] = useState<KnowledgeChapter[]>([])
  const [chapters, setChapters] = useState<ChapterSummary[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTER)
  const [filterStats, setFilterStats] = useState<FilterStats>({ matchCount: 0, estimatedTime: 0 })
  const [expertTips, setExpertTips] = useState<ExpertTips | null>(null)
  const [tipsLoading, setTipsLoading] = useState(false)
  const [breadcrumb, setBreadcrumb] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    fetchKnowledgeTree()
    fetchChapters()
  }, [])

  useEffect(() => {
    // 更新筛选统计
    setFilterStats(calculateFilterStats(tree, filters))
  }, [tree, filters])

  // 获取章节列表（用于网格视图）
  const fetchChapters = async () => {
    try {
      const res = await fetch('/api/chapters?subject=xiyao_yaoxue_er')
      const data = await res.json()
      if (data.success) {
        setChapters(data.data.chapters)
      }
    } catch (error) {
      console.error('获取章节列表失败:', error)
    }
  }

  // 搜索功能
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    try {
      const res = await fetch(`/api/knowledge/search?q=${encodeURIComponent(query)}&subject=xiyao_yaoxue_er`)
      const data = await res.json()
      if (data.success) {
        setSearchResults([
          ...data.data.results.chapters,
          ...data.data.results.sections,
          ...data.data.results.points
        ])
      }
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // 点击章节卡片
  const handleChapterClick = (chapterId: string) => {
    router.push(`/knowledge/chapter/${chapterId}`)
  }

  const fetchKnowledgeTree = async () => {
    try {
      const params = new URLSearchParams({
        subject: 'xiyao_yaoxue_er',
        content: 'true',
      })
      
      const res = await fetch(`/api/knowledge-tree?${params}`)
      const data = await res.json()
      if (data.success) {
        // 转换 API 数据为组件需要的格式
        const convertedTree = convertApiTree(data.data.tree)
        setTree(convertedTree)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('获取知识点树失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 转换 API 返回的树结构
  const convertApiTree = (apiTree: any[]): KnowledgeChapter[] => {
    return apiTree.map(chapter => ({
      id: chapter.id,
      code: chapter.code,
      title: chapter.title,
      nodeType: 'chapter' as const,
      masteryScore: chapter.mastery_score,
      pointCount: countPointsInNode(chapter),
      highFrequencyCount: countHighFrequencyInNode(chapter),
      children: (chapter.children || []).map((section: any) => ({
        id: section.id,
        code: section.code,
        title: section.title,
        nodeType: 'section' as const,
        masteryScore: section.mastery_score,
        pointCount: section.children?.filter((p: any) => p.node_type !== 'section_summary').length || 0,
        highFrequencyCount: section.children?.filter((p: any) => p.importance >= 4 && p.node_type !== 'section_summary').length || 0,
        children: (section.children || []).map((point: any) => ({
          id: point.id,
          code: point.code,
          title: point.title,
          nodeType: point.node_type === 'section_summary' ? 'section_summary' as const : 'point' as const,
          drugName: point.drug_name,
          importance: point.importance || 3,
          masteryStatus: getMasteryStatus(point.mastery_score),
          masteryScore: point.mastery_score,
          isHighFrequency: point.importance >= 4
        }))
      }))
    }))
  }

  const countPointsInNode = (node: any): number => {
    if (!node.children) return 0
    return node.children.reduce((sum: number, child: any) => {
      if (child.node_type === 'point' || child.node_type === 'knowledge_point') return sum + 1
      return sum + countPointsInNode(child)
    }, 0)
  }

  const countHighFrequencyInNode = (node: any): number => {
    if (!node.children) return 0
    return node.children.reduce((sum: number, child: any) => {
      if ((child.node_type === 'point' || child.node_type === 'knowledge_point') && child.importance >= 4) return sum + 1
      return sum + countHighFrequencyInNode(child)
    }, 0)
  }

  const getMasteryStatus = (score: number | undefined): 'mastered' | 'review' | 'weak' | 'unlearned' => {
    if (score === undefined || score === 0) return 'unlearned'
    if (score >= 80) return 'mastered'
    if (score >= 60) return 'review'
    return 'weak'
  }

  const handleNodeSelect = useCallback(async (node: KnowledgeNode) => {
    setSelectedNode(node)
    
    // 更新面包屑
    updateBreadcrumb(node)
    
    // 如果是考点，加载老司机内容
    if (isPointNode(node)) {
      setTipsLoading(true)
      try {
        const res = await fetch(`/api/expert-tips/${node.id}`)
        const data = await res.json()
        if (data.success && data.data) {
          setExpertTips(data.data)
        } else {
          setExpertTips(null)
        }
      } catch (error) {
        console.error('获取老司机内容失败:', error)
        setExpertTips(null)
      } finally {
        setTipsLoading(false)
      }
    } else {
      setExpertTips(null)
    }
  }, [])

  const updateBreadcrumb = (node: KnowledgeNode) => {
    // 简化的面包屑更新
    const crumbs: string[] = []
    for (const chapter of tree) {
      if (chapter.id === node.id) {
        crumbs.push(chapter.title)
        break
      }
      for (const section of chapter.children) {
        if (section.id === node.id) {
          crumbs.push(chapter.title, section.title)
          break
        }
        for (const point of section.children) {
          if (point.id === node.id) {
            crumbs.push(chapter.title, section.title, point.title)
            break
          }
        }
      }
    }
    setBreadcrumb(crumbs)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载知识点树...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-blue-500" />
                知识图谱
              </h1>
              <p className="text-gray-500 text-sm mt-1">西药二 · 药学专业知识（二）</p>
            </div>
            <div className="flex items-center gap-3">
              {/* 视图切换按钮 */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('tree')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    viewMode === 'tree' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Link href="/dashboard" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                学习仪表盘
              </Link>
            </div>
          </div>
          
          {/* 全局搜索框 */}
          <div className="mt-4 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索知识点、药物名称..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleSearch(e.target.value)
                }}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* 搜索结果下拉 */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                {searchResults.map((result, index) => (
                  <Link
                    key={index}
                    href={result.url}
                    className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults([])
                    }}
                  >
                    <div className="font-medium text-gray-900">{result.title}</div>
                    <div className="text-sm text-gray-500">{result.path}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 统计卡片 */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-4">
          <div className="bg-white rounded-xl shadow-sm px-4 py-3 border flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800">{stats?.chapter_count || 0}</div>
              <div className="text-xs text-gray-500">章节</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm px-4 py-3 border flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800">{stats?.point_count || 0}</div>
              <div className="text-xs text-gray-500">知识点</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm px-4 py-3 border flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800">{stats?.high_importance_count || 0}</div>
              <div className="text-xs text-gray-500">高频考点</div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        {viewMode === 'grid' ? (
          /* 网格视图 - 章节卡片 */
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">全部章节</h2>
            <ChapterGrid
              chapters={chapters}
              onChapterClick={handleChapterClick}
            />
          </div>
        ) : (
          /* 树状视图 - 双栏布局 */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左侧：树状导航 + 筛选 */}
            <div className="lg:col-span-4 space-y-4">
              <FilterBar
                filters={filters}
                stats={filterStats}
                onFilterChange={setFilters}
              />
              <KnowledgeTreeNav
                tree={tree}
                selectedNodeId={selectedNode?.id}
                onNodeSelect={handleNodeSelect}
                className="max-h-[600px]"
              />
            </div>

            {/* 右侧：内容展示 */}
            <div className="lg:col-span-8">
              {/* 面包屑导航 */}
              {breadcrumb.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 px-4 py-2 mb-4 flex items-center gap-2 text-sm">
                  <span className="text-gray-500">当前位置：</span>
                  {breadcrumb.map((crumb, index) => (
                    <span key={index} className="flex items-center gap-2">
                      {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                      <span className={index === breadcrumb.length - 1 ? 'text-blue-600 font-medium' : 'text-gray-600'}>
                        {crumb}
                      </span>
                    </span>
                  ))}
                </div>
              )}

                {selectedNode ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* 专业内容区域 */}
                  <div className="bg-white rounded-2xl shadow-sm p-6 border">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-500" />
                      {selectedNode.title}
                    </h2>
                    
                    {isPointNode(selectedNode) && (
                      <div className="space-y-4">
                        {/* 基本信息 */}
                        <div className="flex flex-wrap items-center gap-3">
                          <ImportanceStars level={selectedNode.importance} size="md" />
                          <MasteryStatusBadge score={selectedNode.masteryScore || 0} size="sm" />
                          {selectedNode.drugName && (
                            <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">
                              {selectedNode.drugName}
                            </span>
                          )}
                        </div>
                        
                        {/* 掌握度 */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">我的掌握度</span>
                          </div>
                          <MasteryProgressBar 
                            score={selectedNode.masteryScore || 0} 
                            size="md" 
                            showLabel={true}
                            showPercentage={true}
                          />
                        </div>
                        
                        {/* 操作按钮 */}
                        <div className="pt-4 border-t space-y-2">
                          <Link 
                            href={`/knowledge/point/${selectedNode.id}`}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition flex items-center justify-center gap-2"
                          >
                            查看详情并练习
                          </Link>
                        </div>
                      </div>
                    )}
                    
                    {!isPointNode(selectedNode) && (
                      <div className="text-center text-gray-500 py-8">
                        <p>选择一个考点查看详细内容</p>
                      </div>
                    )}
                  </div>

                  {/* 老司机带路区域 */}
                  <div className="bg-white rounded-2xl shadow-sm p-6 border">
                    {isPointNode(selectedNode) ? (
                      <ExpertTipsPanel
                        tips={expertTips || {
                          examPatterns: [],
                          trapAnalysis: [],
                          memoryTechniques: [],
                          examTactics: [],
                          predictions: []
                        }}
                        loading={tipsLoading}
                      />
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <span className="text-4xl mb-4 block">🚗</span>
                        <p>选择一个考点查看老司机带路内容</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm p-12 border text-center">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">选择一个知识点</h3>
                  <p className="text-gray-400">从左侧树状导航中选择一个知识点，查看详情和老司机带路内容</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
