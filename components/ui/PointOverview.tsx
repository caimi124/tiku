/**
 * PointOverview 组件（考点梳理）
 * 
 * 显示小节页面的考点梳理区域：
 * - 统计信息（考点总数、高频考点数）
 * - 优先级分布图
 * - 所有考点标题和标签列表
 * - 学习建议
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 * Property 13: 考点梳理统计正确性
 * Property 14: 考点梳理列表完整性
 */

import React from 'react'
import { BookOpen, Star, Clock, TrendingUp, ChevronRight } from 'lucide-react'
import { TagBadge, PointTag } from './TagBadge'

export interface PointOverviewData {
  total_points: number
  high_frequency_count: number
  tag_distribution: { [tag: string]: number }
  suggested_time: number
  trend_summary: string
  recommended_points: string[]
}

export interface PointSummaryItem {
  id: string
  code: string
  title: string
  tags: PointTag[]
  exam_years: number[]
  importance: number
}

export interface PointOverviewProps {
  overview: PointOverviewData
  points: PointSummaryItem[]
  onPointClick: (pointId: string) => void
  className?: string
}

/**
 * 格式化学习时间
 */
function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
}

/**
 * 格式化考查年份
 */
function formatExamYears(years: number[]): string {
  if (!years || years.length === 0) return ''
  const sortedYears = [...years].sort((a, b) => b - a)
  return sortedYears.join('、') + ' 考过'
}

/**
 * PointOverview 组件
 * Property 13 & 14: 统计正确性和列表完整性
 */
export function PointOverview({ overview, points, onPointClick, className = '' }: PointOverviewProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* 标题 */}
      <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          考点梳理
        </h3>
      </div>
      
      <div className="p-5">
        {/* 统计信息 - Property 13 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<BookOpen className="w-5 h-5 text-blue-500" />}
            label="考点总数"
            value={overview.total_points}
            unit="个"
          />
          <StatCard
            icon={<Star className="w-5 h-5 text-red-500" />}
            label="高频考点"
            value={overview.high_frequency_count}
            unit="个"
            highlight
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-green-500" />}
            label="建议学习"
            value={formatTime(overview.suggested_time)}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
            label="命题趋势"
            value={overview.trend_summary}
            small
          />
        </div>
        
        {/* 优先级分布 */}
        {Object.keys(overview.tag_distribution).length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">优先级分布</h4>
            <TagDistributionBar distribution={overview.tag_distribution} total={overview.total_points} />
          </div>
        )}
        
        {/* 考点列表 - Property 14 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            全部考点 ({points.length})
          </h4>
          <div className="space-y-2">
            {points.map((point, index) => (
              <PointOverviewItem
                key={point.id}
                point={point}
                index={index + 1}
                onClick={() => onPointClick(point.id)}
                isHighFrequency={point.tags.some(t => t.type === 'high_frequency')}
              />
            ))}
          </div>
        </div>
        
        {/* 学习建议 */}
        {overview.recommended_points.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 学习建议</h4>
            <p className="text-sm text-yellow-700">
              本节共{overview.total_points}个考点，建议学习时间{formatTime(overview.suggested_time)}。
              {overview.high_frequency_count > 0 && (
                <span>其中{overview.high_frequency_count}个高频考点需重点关注。</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 统计卡片
 */
interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  unit?: string
  highlight?: boolean
  small?: boolean
}

function StatCard({ icon, label, value, unit, highlight, small }: StatCardProps) {
  return (
    <div className={`
      p-3 rounded-lg border
      ${highlight ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}
    `}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className={`font-semibold ${small ? 'text-sm' : 'text-lg'} ${highlight ? 'text-red-600' : 'text-gray-900'}`}>
        {value}{unit && <span className="text-sm font-normal text-gray-500 ml-0.5">{unit}</span>}
      </div>
    </div>
  )
}

/**
 * 标签分布条
 */
interface TagDistributionBarProps {
  distribution: { [tag: string]: number }
  total: number
}

const TAG_COLORS_BAR: Record<string, string> = {
  high_frequency: 'bg-red-500',
  must_test: 'bg-orange-500',
  easy_mistake: 'bg-yellow-500',
  basic: 'bg-blue-500',
  reinforce: 'bg-purple-500',
}

const TAG_LABELS: Record<string, string> = {
  high_frequency: '高频',
  must_test: '必考',
  easy_mistake: '易错',
  basic: '基础',
  reinforce: '强化',
}

function TagDistributionBar({ distribution, total }: TagDistributionBarProps) {
  const entries = Object.entries(distribution).filter(([_, count]) => count > 0)
  
  return (
    <div>
      <div className="h-3 rounded-full overflow-hidden flex bg-gray-200">
        {entries.map(([tag, count]) => (
          <div
            key={tag}
            className={`${TAG_COLORS_BAR[tag] || 'bg-gray-400'} transition-all`}
            style={{ width: `${(count / total) * 100}%` }}
            title={`${TAG_LABELS[tag] || tag}: ${count}个`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {entries.map(([tag, count]) => (
          <div key={tag} className="flex items-center gap-1 text-xs text-gray-600">
            <span className={`w-2 h-2 rounded-full ${TAG_COLORS_BAR[tag] || 'bg-gray-400'}`} />
            <span>{TAG_LABELS[tag] || tag}</span>
            <span className="text-gray-400">({count})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 考点列表项
 */
interface PointOverviewItemProps {
  point: PointSummaryItem
  index: number
  onClick: () => void
  isHighFrequency: boolean
}

function PointOverviewItem({ point, index, onClick, isHighFrequency }: PointOverviewItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg border transition-all
        ${isHighFrequency 
          ? 'bg-red-50 border-red-200 hover:bg-red-100' 
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center text-xs text-gray-500">
          {index}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 truncate">{point.title}</span>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {point.tags.slice(0, 3).map((tag, i) => (
              <TagBadge key={i} tag={tag} size="sm" />
            ))}
            {point.exam_years.length > 0 && (
              <span className="text-xs text-gray-500">
                {formatExamYears(point.exam_years)}
              </span>
            )}
          </div>
          {isHighFrequency && (
            <div className="mt-1 text-xs text-red-600 font-medium">
              ⚡ 高频考点，几乎每年考
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

export default PointOverview
