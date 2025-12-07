/**
 * 知识点详情页（重构版）
 * 
 * 功能：
 * 1. 面包屑导航
 * 2. 顶部信息区（标题、来源、标签）
 * 3. 内容模块区域（按顺序展示非空模块）
 * 4. 右侧目录（同小节考点）
 * 5. 底部导航（上下考点、相关真题、开始练习）
 * 6. 移动端适配
 * 
 * Requirements: 2.4, 2.5, 2.6, 2.7, 2.8, 5.4, 5.7
 */

'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
// BreadcrumbItem type is defined locally as ApiBreadcrumbItem
import { MasteryProgressBar } from '@/components/ui/MasteryProgressBar'
import { MasteryStatusBadge } from '@/components/ui/MasteryStatusBadge'
import { ImportanceStars, isHighFrequency } from '@/components/ui/ImportanceStars'
import { ExpertTipsPanel, ExpertTips } from '@/components/ui/ExpertTipsPanel'
import { SectionTOC, MobileTOCDrawer, TOCPoint } from '@/components/ui/SectionTOC'
import { PointNavigation, MobileBottomNav, NavPoint } from '@/components/ui/PointNavigation'

interface RelatedPoint {
  id: string
  title: string
  importance: number
  mastery_score?: number
}

interface NavigationInfo {
  prev_point?: NavPoint
  next_point?: NavPoint
  section_points: TOCPoint[]
}

interface ContentItemAccuracy {
  item_key: string
  total_count: number
  correct_count: number
  accuracy: number
}

interface ApiBreadcrumbItem {
  id: string
  title: string
  level: number
}

interface KnowledgePointDetail {
  id: string
  code: string
  title: string
  content: string
  node_type: string
  point_type?: string
  drug_name?: string
  importance: number
  memory_tips?: string
  parent_id?: string
  subject_code: string
  level: number
  mastery_score?: number
  mastery_status?: 'mastered' | 'review' | 'weak' | 'unlearned'
  is_weak_point?: boolean
  last_review_at?: string
  practice_count?: number
  correct_rate?: number
  breadcrumb?: ApiBreadcrumbItem[]
  related_points?: RelatedPoint[]
  content_item_accuracy?: ContentItemAccuracy[]
  navigation?: NavigationInfo
  chapter?: { id: string; title: string; code: string }
  section?: { id: string; title: string; code: string }
}

export default function KnowledgePointPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [point, setPoint] = useState<KnowledgePointDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingReview, setMarkingReview] = useState(false)
  const [expertTips, setExpertTips] = useState<ExpertTips | null>(null)
  const [tipsLoading, setTipsLoading] = useState(false)
  const [showMobileTOC, setShowMobileTOC] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // 检测移动端
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchPointDetail()
    fetchExpertTips()
  }, [resolvedParams.id])

  const fetchExpertTips = async () => {
    setTipsLoading(true)
    try {
      const response = await fetch(`/api/expert-tips/${resolvedParams.id}`)
      const data = await response.json()
      if (data.success && data.data) {
        setExpertTips(data.data)
      } else {
        setExpertTips(null)
      }
    } catch (err) {
      console.error('获取老司机内容失败:', err)
      setExpertTips(null)
    } finally {
      setTipsLoading(false)
    }
  }

  const fetchPointDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/knowledge-point/${resolvedParams.id}`)
      const data = await response.json()
      
      if (data.success) {
        setPoint(data.data)
      } else {
        setError(data.error || '获取知识点详情失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkForReview = async () => {
    if (!point) return
    setMarkingReview(true)
    
    try {
      // 调用复习队列 API
      const response = await fetch('/api/review-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          knowledgePointId: point.id,
          userId: 'demo-user', // TODO: 从认证系统获取真实用户ID
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('已加入复习队列')
      } else {
        alert(data.error || '操作失败，请重试')
      }
    } catch (err) {
      alert('网络错误，请稍后重试')
    } finally {
      setMarkingReview(false)
    }
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error || !point) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            {error || '知识点不存在'}
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

  // 导航到其他考点
  const handleNavigate = (pointId: string) => {
    router.push(`/knowledge/point/${pointId}`)
  }
  
  // 开始练习
  const handlePractice = () => {
    router.push(`/practice/point/${point.id}`)
  }
  
  // 查看相关真题
  const handleRelatedQuestions = () => {
    router.push(`/practice/history?pointId=${point.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 面包屑导航 */}
        <Breadcrumb 
          items={point.breadcrumb} 
          currentTitle={point.title}
          chapter={point.chapter}
          section={point.section}
        />
        
        {/* 主内容区域 - 双栏布局 */}
        <div className="flex gap-6">
          {/* 左侧主内容 */}
          <div className="flex-1 min-w-0">
            {/* 主卡片 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* 头部 */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {point.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <ImportanceStars level={point.importance} size="md" />
                      {isHighFrequency(point.importance) && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                          高频考点
                        </span>
                      )}
                      {point.drug_name && (
                        <span className="text-gray-500">
                          📍 {point.drug_name}
                        </span>
                      )}
                      {point.point_type && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                          {point.point_type}
                        </span>
                      )}
                      {/* 来源信息 */}
                      {point.section && (
                        <span className="text-gray-400 text-xs">
                          来自：{point.chapter?.title} &gt; {point.section.title}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MasteryStatusBadge score={point.mastery_score || 0} size="lg" />
                    {/* 移动端目录按钮 */}
                    {isMobile && point.navigation?.section_points && point.navigation.section_points.length > 1 && (
                      <button
                        onClick={() => setShowMobileTOC(true)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg lg:hidden"
                        title="本节考点"
                      >
                        <Menu className="w-5 h-5 text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 掌握情况 */}
              <MasterySection point={point} />
              
              {/* 核心内容 */}
              <ContentSection 
                content={point.content} 
                contentItemAccuracy={point.content_item_accuracy}
              />
              
              {/* 记忆口诀 */}
              {point.memory_tips && (
                <MemoryTipsSection tips={point.memory_tips} />
              )}
              
              {/* 老司机带路 */}
              <div className="p-6 border-b border-gray-100">
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
              </div>
              
              {/* 操作按钮 */}
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleMarkForReview}
                    disabled={markingReview}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <span>🔄</span>
                    {markingReview ? '处理中...' : '标记为需复习'}
                  </button>
                  <Link
                    href={`/practice/point/${point.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <span>📝</span>
                    专项练习
                  </Link>
                  <Link
                    href="/knowledge"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    返回知识图谱
                  </Link>
                </div>
              </div>
            </div>
            
            {/* 底部导航 - 上下考点 */}
            {point.navigation && (
              <div className="mt-6 hidden lg:block">
                <PointNavigation
                  prevPoint={point.navigation.prev_point}
                  nextPoint={point.navigation.next_point}
                  showPracticeButton={true}
                  onPractice={handlePractice}
                  showRelatedQuestions={true}
                  onRelatedQuestions={handleRelatedQuestions}
                />
              </div>
            )}
            
            {/* 相关考点 */}
            {point.related_points && point.related_points.length > 0 && (
              <RelatedPointsSection points={point.related_points} />
            )}
          </div>
          
          {/* 右侧目录 - 桌面端 */}
          {!isMobile && point.navigation?.section_points && point.navigation.section_points.length > 1 && (
            <div className="w-64 flex-shrink-0 hidden lg:block">
              <div className="sticky top-24">
                <SectionTOC
                  points={point.navigation.section_points}
                  currentPointId={point.id}
                  sectionTitle={point.section?.title}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 移动端侧边抽屉目录 */}
      {point.navigation?.section_points && (
        <MobileTOCDrawer
          isOpen={showMobileTOC}
          onClose={() => setShowMobileTOC(false)}
          points={point.navigation.section_points}
          currentPointId={point.id}
          onPointClick={handleNavigate}
          sectionTitle={point.section?.title}
        />
      )}
      
      {/* 移动端底部悬浮导航 */}
      {isMobile && point.navigation && (
        <MobileBottomNav
          prevPoint={point.navigation.prev_point}
          nextPoint={point.navigation.next_point}
          onNavigate={handleNavigate}
          onPractice={handlePractice}
        />
      )}
    </div>
  )
}


// ============================================
// 子组件
// ============================================

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
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Breadcrumb({ 
  items, 
  currentTitle,
  chapter,
  section
}: { 
  items?: ApiBreadcrumbItem[]
  currentTitle: string
  chapter?: { id: string; title: string; code: string } | null
  section?: { id: string; title: string; code: string } | null
}) {
  // 构建面包屑导航
  const breadcrumbItems: { label: string; url: string }[] = []
  
  if (chapter) {
    breadcrumbItems.push({
      label: chapter.title,
      url: `/knowledge/chapter/${chapter.id}`
    })
  }
  
  if (section && chapter) {
    breadcrumbItems.push({
      label: section.title,
      url: `/knowledge/chapter/${chapter.id}/section/${section.id}`
    })
  }
  
  return (
    <nav className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <li>
          <Link href="/knowledge" className="hover:text-blue-600">
            知识图谱
          </Link>
        </li>
        {breadcrumbItems.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <span>/</span>
            <Link 
              href={item.url}
              className="hover:text-blue-600 truncate max-w-[150px]"
              title={item.label}
            >
              {item.label}
            </Link>
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]" title={currentTitle}>
            {currentTitle}
          </span>
        </li>
      </ol>
    </nav>
  )
}

function MasterySection({ point }: { point: KnowledgePointDetail }) {
  const masteryScore = point.mastery_score || 0
  const practiceCount = point.practice_count || 0
  const correctRate = point.correct_rate || 0
  const lastReview = point.last_review_at 
    ? new Date(point.last_review_at).toLocaleDateString('zh-CN')
    : '从未练习'

  return (
    <div className="p-6 border-b border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>📊</span> 我的掌握情况
      </h2>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StatItem label="练习次数" value={`${practiceCount}次`} />
          <StatItem label="正确率" value={`${correctRate}%`} />
          <StatItem label="掌握度" value={`${masteryScore}%`} />
          <StatItem label="上次练习" value={lastReview} />
        </div>
        <MasteryProgressBar 
          score={masteryScore} 
          showLabel 
          showPercentage 
          size="lg" 
        />
        {masteryScore > 0 && masteryScore < 60 && (
          <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> 该考点掌握度较低，建议加强练习
          </p>
        )}
      </div>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

function ContentSection({ 
  content, 
  contentItemAccuracy 
}: { 
  content: string
  contentItemAccuracy?: ContentItemAccuracy[]
}) {
  // 创建内容项正确率映射
  const accuracyMap = new Map<string, ContentItemAccuracy>()
  if (contentItemAccuracy) {
    contentItemAccuracy.forEach(item => {
      accuracyMap.set(item.item_key, item)
    })
  }

  // 解析内容，支持简单的格式化
  const formatContent = (text: string) => {
    if (!text) return null
    
    // 按行分割
    const lines = text.split('\n').filter(line => line.trim())
    
    return lines.map((line, index) => {
      const trimmed = line.trim()
      
      // 检测标题行（以【】包裹）
      if (trimmed.startsWith('【') && trimmed.includes('】')) {
        const match = trimmed.match(/【(.+?)】/)
        const itemKey = match ? match[1] : ''
        const itemAccuracy = accuracyMap.get(itemKey)
        
        return (
          <div key={index} className="mt-4 first:mt-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">
                {trimmed}
              </h3>
              {itemAccuracy && itemAccuracy.total_count > 0 && (
                <ContentItemAccuracyBadge accuracy={itemAccuracy} />
              )}
            </div>
          </div>
        )
      }
      
      // 检测列表项（以•、-、数字.开头）
      if (/^[•\-\d\.]\s*/.test(trimmed)) {
        return (
          <li key={index} className="ml-4 text-gray-700">
            {trimmed.replace(/^[•\-\d\.]\s*/, '')}
          </li>
        )
      }
      
      // 普通段落
      return (
        <p key={index} className="text-gray-700 mb-2">
          {trimmed}
        </p>
      )
    })
  }

  return (
    <div className="p-6 border-b border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>📝</span> 核心内容
      </h2>
      <div className="prose prose-sm max-w-none">
        {content ? (
          <div className="space-y-1">
            {formatContent(content)}
          </div>
        ) : (
          <p className="text-gray-400 italic">暂无内容</p>
        )}
      </div>
    </div>
  )
}

/**
 * 内容项正确率徽章
 * Requirements: 4.2
 */
function ContentItemAccuracyBadge({ accuracy }: { accuracy: ContentItemAccuracy }) {
  const { icon, color, bg } = (() => {
    if (accuracy.accuracy >= 80) return { icon: '✓', color: 'text-green-600', bg: 'bg-green-100' }
    if (accuracy.accuracy >= 60) return { icon: '⚠', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { icon: '✗', color: 'text-red-600', bg: 'bg-red-100' }
  })()

  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${color}`}
      title={`答题 ${accuracy.total_count} 次，正确 ${accuracy.correct_count} 次`}
    >
      <span>{icon}</span>
      <span>正确率 {accuracy.accuracy}%</span>
    </span>
  )
}

function MemoryTipsSection({ tips }: { tips: string }) {
  return (
    <div className="p-6 border-b border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>💡</span> 记忆口诀
      </h2>
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
        <p className="text-purple-800 font-medium whitespace-pre-line">
          {tips}
        </p>
      </div>
    </div>
  )
}

function RelatedPointsSection({ points }: { points: RelatedPoint[] }) {
  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>🔗</span> 相关考点
      </h2>
      <div className="space-y-2">
        {points.map(p => (
          <Link
            key={p.id}
            href={`/knowledge/point/${p.id}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <ImportanceStars level={p.importance} size="sm" />
              <span className="text-gray-800">{p.title}</span>
            </div>
            {p.mastery_score !== undefined && (
              <MasteryStatusBadge score={p.mastery_score} size="sm" />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
