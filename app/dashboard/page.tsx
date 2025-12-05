'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BookOpen, Brain, Target, TrendingUp, Clock, CheckCircle, 
  AlertTriangle, XCircle, ChevronRight, Flame, Calendar,
  BarChart3, Zap, Award
} from 'lucide-react'
import { MasteryProgressBar } from '@/components/ui/MasteryProgressBar'
import { MasteryStatusBadge } from '@/components/ui/MasteryStatusBadge'
import { ImportanceStars } from '@/components/ui/ImportanceStars'

// ============================================
// 类型定义
// ============================================

interface ChapterMastery {
  id: string
  code: string
  title: string
  mastery_score: number
  total_points: number
  mastered_points: number
  weak_points: number
}

interface ReviewRecommendation {
  id: string
  title: string
  importance: number
  mastery_score: number
  last_review: string | null
  last_review_days: number
  correct_rate: number
  next_review_date: string
  is_urgent: boolean
  priority_score: number
}

interface HighFrequencyPoint {
  id: string
  title: string
  importance: number
  mastery_score: number
  status: 'mastered' | 'review' | 'weak' | 'unlearned'
  status_text: string
  practice_count: number
}

interface DashboardData {
  overallMastery: number
  weeklyStudyTime: number
  overallAccuracy: number
  weakPointsCount: number
  chapterMastery: ChapterMastery[]
  totalPoints: number
  masteredPoints: number
  weeklyQuestions: number
  learningStreak: number
}

interface RecommendationsData {
  todayReview: ReviewRecommendation[]
  highFrequencyPoints: HighFrequencyPoint[]
  urgentCount: number
  reviewedToday: number
}

// ============================================
// 主组件
// ============================================

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [recommendationsData, setRecommendationsData] = useState<RecommendationsData | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 并行获取仪表盘数据和推荐数据
      const [dashboardRes, recommendationsRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/dashboard/recommendations?limit=5')
      ])

      if (!dashboardRes.ok) {
        throw new Error('获取仪表盘数据失败')
      }

      const dashboard = await dashboardRes.json()
      setDashboardData(dashboard)

      if (recommendationsRes.ok) {
        const recommendations = await recommendationsRes.json()
        setRecommendationsData(recommendations)
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError(err instanceof Error ? err.message : '加载失败')
      // 使用模拟数据作为后备
      setDashboardData(getMockDashboardData())
      setRecommendationsData(getMockRecommendationsData())
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载学习数据...</p>
        </div>
      </div>
    )
  }

  const data = dashboardData || getMockDashboardData()
  const recommendations = recommendationsData || getMockRecommendationsData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-blue-500" />
              学习仪表盘
            </h1>
            <p className="text-gray-500 text-sm mt-1">药学专业知识（二）- 西药</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                timeRange === 'week' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              本周
            </button>
            <button 
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                timeRange === 'month' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              本月
            </button>
            <button 
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                timeRange === 'all' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              全部
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
            ⚠️ {error}，显示模拟数据
          </div>
        )}

        {/* 核心指标卡片 - Task 7.1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="总掌握度"
            value={`${data.overallMastery}%`}
            icon={Brain}
            color="blue"
            progress={data.overallMastery}
          />
          <StatCard
            title="本周学习"
            value={`${data.weeklyStudyTime}h`}
            icon={Clock}
            color="green"
            subtitle="较上周 +2.5h ↑"
          />
          <StatCard
            title="正确率"
            value={`${data.overallAccuracy}%`}
            icon={Target}
            color="purple"
            subtitle="较上周 +5% ↑"
          />
          <StatCard
            title="薄弱考点"
            value={data.weakPointsCount}
            icon={AlertTriangle}
            color="red"
            link="/practice/weak"
            linkText="去专项练习 →"
          />
        </div>

        {/* 连续学习徽章 */}
        {data.learningStreak > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800">连续学习 {data.learningStreak} 天 🔥</p>
              <p className="text-sm text-amber-600">坚持就是胜利，继续保持！</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 章节掌握情况 - Task 7.1 */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                各章节掌握情况
              </h2>
              <Link href="/knowledge" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                查看知识图谱 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {data.chapterMastery.map((chapter) => (
                <ChapterProgressItem key={chapter.id} chapter={chapter} />
              ))}
            </div>
          </div>

          {/* 今日推荐复习 - Task 7.2 */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-sm p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                今日推荐复习
              </h2>
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                基于遗忘曲线
              </span>
            </div>
            
            {recommendations.urgentCount > 0 && (
              <div className="mb-4 bg-red-100 text-red-700 text-sm px-3 py-2 rounded-lg">
                ⚠️ {recommendations.urgentCount} 个考点需要紧急复习
              </div>
            )}
            
            <div className="space-y-3">
              {recommendations.todayReview.map((point, index) => (
                <ReviewItem key={point.id} point={point} index={index} />
              ))}
            </div>
            
            <button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              开始今日复习
            </button>
          </div>
        </div>

        {/* 高频考点掌握情况 - Task 7.3 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              高频考点掌握情况
            </h2>
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
              Top 10 高频考点
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.highFrequencyPoints.map((point) => (
              <HighFrequencyItem key={point.id} point={point} />
            ))}
          </div>
        </div>

        {/* 薄弱环节分析 - Task 7.4 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              薄弱环节分析
            </h2>
            <Link href="/practice/weak" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.chapterMastery
              .filter(ch => ch.weak_points > 0)
              .sort((a, b) => b.weak_points - a.weak_points)
              .slice(0, 3)
              .map((chapter) => (
                <WeakChapterCard key={chapter.id} chapter={chapter} />
              ))}
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard
            href="/knowledge"
            icon={BookOpen}
            title="知识图谱"
            subtitle="查看全部考点"
            color="blue"
          />
          <QuickActionCard
            href="/practice/weak"
            icon={Target}
            title="薄弱专练"
            subtitle={`${data.weakPointsCount}个待攻克`}
            color="red"
          />
          <QuickActionCard
            href="/practice/history"
            icon={Calendar}
            title="历年真题"
            subtitle="2022-2024"
            color="purple"
          />
          <QuickActionCard
            href="/exams"
            icon={TrendingUp}
            title="模拟考试"
            subtitle="检验学习成果"
            color="green"
          />
        </div>
      </main>
    </div>
  )
}

// ============================================
// 子组件
// ============================================

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  color: 'blue' | 'green' | 'purple' | 'red'
  progress?: number
  subtitle?: string
  link?: string
  linkText?: string
}

function StatCard({ title, value, icon: Icon, color, progress, subtitle, link, linkText }: StatCardProps) {
  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'text-blue-500', bar: 'bg-blue-500' },
    green: { bg: 'bg-green-100', text: 'text-green-600', icon: 'text-green-500', bar: 'bg-green-500' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', icon: 'text-purple-500', bar: 'bg-purple-500' },
    red: { bg: 'bg-red-100', text: 'text-red-600', icon: 'text-red-500', bar: 'bg-red-500' },
  }
  const c = colorClasses[color]

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className={`text-3xl font-bold ${c.text} mt-1`}>{value}</p>
        </div>
        <div className={`w-14 h-14 ${c.bg} rounded-full flex items-center justify-center`}>
          <Icon className={`w-7 h-7 ${c.icon}`} />
        </div>
      </div>
      {progress !== undefined && (
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${c.bar} rounded-full transition-all`} style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {subtitle && <p className="text-xs text-gray-400 mt-3">{subtitle}</p>}
      {link && linkText && (
        <Link href={link} className={`text-xs ${c.text} mt-3 block hover:underline`}>
          {linkText}
        </Link>
      )}
    </div>
  )
}

function ChapterProgressItem({ chapter }: { chapter: ChapterMastery }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            第{chapter.code}章 {chapter.title}
          </span>
          <MasteryStatusBadge score={chapter.mastery_score} size="sm" />
        </div>
        <span className="text-sm font-semibold text-gray-600">{chapter.mastery_score}%</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <MasteryProgressBar score={chapter.mastery_score} size="md" showLabel={false} />
        </div>
        <span className="text-xs text-gray-400 w-20 text-right">
          {chapter.mastered_points}/{chapter.total_points} 考点
        </span>
      </div>
    </div>
  )
}

function ReviewItem({ point, index }: { point: ReviewRecommendation; index: number }) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-xl p-4 hover:shadow-md transition cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              point.is_urgent ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
            }`}>
              {index + 1}
            </span>
            <span className="text-sm font-medium text-gray-800 line-clamp-1">
              {point.title}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <ImportanceStars level={point.importance} size="sm" />
            <span>上次: {point.last_review || '从未'}</span>
            <span className="text-red-500">正确率: {point.correct_rate}%</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300" />
      </div>
    </div>
  )
}

function HighFrequencyItem({ point }: { point: HighFrequencyPoint }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-800 line-clamp-1 flex-1">{point.title}</span>
        <ImportanceStars level={point.importance} size="sm" />
      </div>
      <div className="flex items-center gap-2">
        <MasteryProgressBar score={point.mastery_score} size="sm" showLabel={false} />
        <MasteryStatusBadge score={point.mastery_score} size="sm" />
      </div>
      <div className="mt-2 text-xs text-gray-400">
        练习次数: {point.practice_count}
      </div>
    </div>
  )
}

function WeakChapterCard({ chapter }: { chapter: ChapterMastery }) {
  return (
    <div className="border border-red-100 rounded-xl p-4 bg-red-50/50 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-800">第{chapter.code}章</span>
        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
          {chapter.weak_points} 个薄弱点
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-1">{chapter.title}</p>
      <MasteryProgressBar score={chapter.mastery_score} size="sm" />
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <span>掌握: {chapter.mastered_points}/{chapter.total_points}</span>
        <button className="text-blue-500 hover:underline">去练习 →</button>
      </div>
    </div>
  )
}

interface QuickActionCardProps {
  href: string
  icon: React.ElementType
  title: string
  subtitle: string
  color: 'blue' | 'red' | 'purple' | 'green'
}

function QuickActionCard({ href, icon: Icon, title, subtitle, color }: QuickActionCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600 text-blue-100',
    red: 'bg-red-500 hover:bg-red-600 text-red-100',
    purple: 'bg-purple-500 hover:bg-purple-600 text-purple-100',
    green: 'bg-green-500 hover:bg-green-600 text-green-100',
  }

  return (
    <Link href={href} className={`${colorClasses[color]} text-white rounded-2xl p-5 transition flex items-center gap-3`}>
      <Icon className="w-8 h-8" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-xs opacity-80">{subtitle}</p>
      </div>
    </Link>
  )
}

// ============================================
// 模拟数据（API 失败时的后备）
// ============================================

function getMockDashboardData(): DashboardData {
  return {
    overallMastery: 68,
    weeklyStudyTime: 12.5,
    overallAccuracy: 76,
    weakPointsCount: 23,
    totalPoints: 150,
    masteredPoints: 102,
    weeklyQuestions: 85,
    learningStreak: 7,
    chapterMastery: [
      { id: '2', code: '2', title: '解热、镇痛、抗炎药', mastery_score: 78, total_points: 15, mastered_points: 12, weak_points: 1 },
      { id: '3', code: '3', title: '呼吸系统用药', mastery_score: 65, total_points: 12, mastered_points: 8, weak_points: 2 },
      { id: '4', code: '4', title: '消化系统用药', mastery_score: 32, total_points: 18, mastered_points: 6, weak_points: 8 },
      { id: '5', code: '5', title: '心血管系统用药', mastery_score: 85, total_points: 20, mastered_points: 17, weak_points: 1 },
      { id: '1', code: '1', title: '精神与中枢神经系统用药', mastery_score: 72, total_points: 10, mastered_points: 7, weak_points: 2 },
    ],
  }
}

function getMockRecommendationsData(): RecommendationsData {
  return {
    urgentCount: 2,
    reviewedToday: 3,
    todayReview: [
      { id: '1', title: '质子泵抑制剂的临床应用', importance: 5, mastery_score: 45, last_review: '3天前', last_review_days: 3, correct_rate: 60, next_review_date: '2024-01-01', is_urgent: true, priority_score: 85 },
      { id: '2', title: '头孢菌素类分代特点', importance: 5, mastery_score: 38, last_review: '5天前', last_review_days: 5, correct_rate: 45, next_review_date: '2024-01-01', is_urgent: true, priority_score: 82 },
      { id: '3', title: '利尿药不良反应对比', importance: 4, mastery_score: 52, last_review: '7天前', last_review_days: 7, correct_rate: 55, next_review_date: '2024-01-01', is_urgent: false, priority_score: 75 },
    ],
    highFrequencyPoints: [
      { id: '1', title: '质子泵抑制剂的临床应用', importance: 5, mastery_score: 45, status: 'weak', status_text: '薄弱', practice_count: 15 },
      { id: '2', title: '头孢菌素类分代特点', importance: 5, mastery_score: 38, status: 'weak', status_text: '薄弱', practice_count: 12 },
      { id: '3', title: '利尿药不良反应对比', importance: 5, mastery_score: 82, status: 'mastered', status_text: '已掌握', practice_count: 20 },
      { id: '4', title: 'β受体阻滞剂分类', importance: 4, mastery_score: 65, status: 'review', status_text: '需复习', practice_count: 8 },
      { id: '5', title: '抗凝药物监测指标', importance: 5, mastery_score: 70, status: 'review', status_text: '需复习', practice_count: 10 },
      { id: '6', title: '糖皮质激素不良反应', importance: 4, mastery_score: 88, status: 'mastered', status_text: '已掌握', practice_count: 18 },
    ],
  }
}
