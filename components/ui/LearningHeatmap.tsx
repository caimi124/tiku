/**
 * 学习热力图组件
 *
 * 类似 GitHub 贡献图，显示每日学习情况
 *
 * Requirements: 7.1, 7.2
 */

'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface DailyLearningData {
  date: string
  study_minutes: number
  questions_done: number
  correct_count: number
  accuracy: number
  color: 'green' | 'yellow' | 'red' | 'gray'
}

export interface LearningHeatmapProps {
  /** 用户ID */
  userId: string
  /** 天数 (默认30) */
  days?: number
  /** 点击日期回调 */
  onDateClick?: (date: string, data: DailyLearningData) => void
  /** 自定义类名 */
  className?: string
}

// 颜色映射
const colorMap = {
  green: 'bg-green-500 hover:bg-green-600',
  yellow: 'bg-yellow-500 hover:bg-yellow-600',
  red: 'bg-red-500 hover:bg-red-600',
  gray: 'bg-gray-200 hover:bg-gray-300',
}

// 颜色深度映射（根据学习量）
const getColorIntensity = (questionsCount: number, baseColor: string): string => {
  if (questionsCount === 0) return 'bg-gray-200'
  if (questionsCount >= 20) return baseColor.replace('500', '600')
  if (questionsCount >= 10) return baseColor
  return baseColor.replace('500', '400')
}

/**
 * 学习热力图组件
 */
export function LearningHeatmap({
  userId,
  days = 30,
  onDateClick,
  className,
}: LearningHeatmapProps) {
  const [data, setData] = useState<DailyLearningData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [stats, setStats] = useState({
    total_days: 0,
    total_questions: 0,
    average_accuracy: 0,
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    fetchHeatmapData()
  }, [userId, days])

  const fetchHeatmapData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/learning-stats/heatmap?userId=${userId}&days=${days}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setStreak(result.streak)
        setStats({
          total_days: result.total_days,
          total_questions: result.total_questions,
          average_accuracy: result.average_accuracy,
        })
      } else {
        setError(result.error || '获取数据失败')
      }
    } catch (err) {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  const handleDateClick = (day: DailyLearningData) => {
    setSelectedDate(day.date)
    onDateClick?.(day.date, day)
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  const getWeekday = (dateStr: string): string => {
    const date = new Date(dateStr)
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    return weekdays[date.getDay()]
  }

  if (loading) {
    return <HeatmapSkeleton days={days} />
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{error}</p>
        <button onClick={fetchHeatmapData} className="mt-2 text-blue-500 hover:underline">
          重试
        </button>
      </div>
    )
  }

  // 将数据按周分组
  const weeks = groupByWeek(data)

  return (
    <div className={cn('bg-white rounded-xl p-6', className)}>
      {/* 统计信息 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span>📅</span> 学习热力图
        </h3>
        <div className="flex items-center gap-4 text-sm">
          {streak > 0 && (
            <span className="flex items-center gap-1 text-orange-500 font-medium">
              🔥 连续 {streak} 天
            </span>
          )}
          <span className="text-gray-500">{stats.total_days} 天有学习</span>
        </div>
      </div>

      {/* 热力图 */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {/* 星期标签 */}
          <div className="flex flex-col gap-1 mr-2 text-xs text-gray-400">
            <span className="h-4"></span>
            <span className="h-4 leading-4">一</span>
            <span className="h-4 leading-4">三</span>
            <span className="h-4 leading-4">五</span>
            <span className="h-4 leading-4">日</span>
          </div>

          {/* 周列 */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {/* 月份标签（每周第一天） */}
              <span className="h-4 text-xs text-gray-400">
                {weekIndex === 0 || isFirstDayOfMonth(week[0]?.date)
                  ? formatMonth(week[0]?.date)
                  : ''}
              </span>

              {/* 日期格子 */}
              {week.map((day, dayIndex) => (
                <button
                  key={day?.date || dayIndex}
                  onClick={() => day && handleDateClick(day)}
                  disabled={!day}
                  className={cn(
                    'w-4 h-4 rounded-sm transition-all',
                    day ? colorMap[day.color] : 'bg-transparent',
                    day && selectedDate === day.date && 'ring-2 ring-blue-500',
                    !day && 'cursor-default'
                  )}
                  title={day ? `${formatDate(day.date)}: ${day.questions_done}题, 正确率${day.accuracy}%` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <span>少</span>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-gray-200"></span>
          <span className="w-3 h-3 rounded-sm bg-red-400"></span>
          <span className="w-3 h-3 rounded-sm bg-yellow-400"></span>
          <span className="w-3 h-3 rounded-sm bg-green-400"></span>
          <span className="w-3 h-3 rounded-sm bg-green-600"></span>
        </div>
        <span>多</span>
      </div>

      {/* 选中日期详情 */}
      {selectedDate && (
        <SelectedDateDetail
          data={data.find((d) => d.date === selectedDate)}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}

/**
 * 选中日期详情
 */
function SelectedDateDetail({
  data,
  onClose,
}: {
  data?: DailyLearningData
  onClose: () => void
}) {
  if (!data) return null

  const date = new Date(data.date)
  const formattedDate = date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-gray-800">{formattedDate}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-900">{data.questions_done}</div>
          <div className="text-xs text-gray-500">答题数</div>
        </div>
        <div>
          <div className={cn(
            'text-2xl font-bold',
            data.accuracy >= 80 ? 'text-green-600' :
            data.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
          )}>
            {data.accuracy}%
          </div>
          <div className="text-xs text-gray-500">正确率</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{data.study_minutes}</div>
          <div className="text-xs text-gray-500">学习分钟</div>
        </div>
      </div>
    </div>
  )
}

/**
 * 加载骨架屏
 */
function HeatmapSkeleton({ days }: { days: number }) {
  const weeks = Math.ceil(days / 7)
  return (
    <div className="bg-white rounded-xl p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="flex gap-1">
        {Array.from({ length: weeks }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="w-4 h-4 bg-gray-200 rounded-sm"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 将数据按周分组
 */
function groupByWeek(data: DailyLearningData[]): (DailyLearningData | null)[][] {
  if (data.length === 0) return []

  const weeks: (DailyLearningData | null)[][] = []
  let currentWeek: (DailyLearningData | null)[] = []

  // 填充第一周开始前的空白
  const firstDate = new Date(data[0].date)
  const firstDayOfWeek = firstDate.getDay() // 0 = Sunday
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null)
  }

  data.forEach((day) => {
    const date = new Date(day.date)
    const dayOfWeek = date.getDay()

    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }

    currentWeek.push(day)
  })

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  return weeks
}

/**
 * 判断是否是月份第一天
 */
function isFirstDayOfMonth(dateStr?: string): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr)
  return date.getDate() === 1
}

/**
 * 格式化月份
 */
function formatMonth(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月`
}

export default LearningHeatmap
