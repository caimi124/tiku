/**
 * 连续学习徽章组件
 *
 * 显示连续学习天数和相应的徽章
 *
 * Requirements: 7.5
 */

'use client'

import { cn } from '@/lib/utils'

export interface LearningStreakBadgeProps {
  /** 连续学习天数 */
  streak: number
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否显示详细信息 */
  showDetail?: boolean
  /** 自定义类名 */
  className?: string
}

// 徽章等级配置
const streakLevels = [
  { min: 0, icon: '💤', label: '开始学习吧', color: 'bg-gray-100 text-gray-500' },
  { min: 1, icon: '🌱', label: '初露锋芒', color: 'bg-green-100 text-green-600' },
  { min: 3, icon: '🌿', label: '持续进步', color: 'bg-green-200 text-green-700' },
  { min: 7, icon: '🔥', label: '学习达人', color: 'bg-orange-100 text-orange-600' },
  { min: 14, icon: '⭐', label: '学霸之路', color: 'bg-yellow-100 text-yellow-600' },
  { min: 30, icon: '🏆', label: '坚持冠军', color: 'bg-purple-100 text-purple-600' },
  { min: 60, icon: '👑', label: '学习王者', color: 'bg-indigo-100 text-indigo-600' },
  { min: 100, icon: '💎', label: '传奇学者', color: 'bg-pink-100 text-pink-600' },
]

// 尺寸配置
const sizeConfig = {
  sm: {
    padding: 'px-2 py-1',
    fontSize: 'text-xs',
    iconSize: 'text-sm',
    gap: 'gap-1',
  },
  md: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-sm',
    iconSize: 'text-base',
    gap: 'gap-1.5',
  },
  lg: {
    padding: 'px-4 py-2',
    fontSize: 'text-base',
    iconSize: 'text-lg',
    gap: 'gap-2',
  },
}

/**
 * 获取徽章等级
 */
export function getStreakLevel(streak: number) {
  for (let i = streakLevels.length - 1; i >= 0; i--) {
    if (streak >= streakLevels[i].min) {
      return streakLevels[i]
    }
  }
  return streakLevels[0]
}

/**
 * 获取下一个等级
 */
export function getNextLevel(streak: number) {
  for (const level of streakLevels) {
    if (streak < level.min) {
      return { ...level, daysNeeded: level.min - streak }
    }
  }
  return null
}

/**
 * 连续学习徽章组件
 */
export function LearningStreakBadge({
  streak,
  size = 'md',
  showDetail = false,
  className,
}: LearningStreakBadgeProps) {
  const level = getStreakLevel(streak)
  const nextLevel = getNextLevel(streak)
  const sizeStyles = sizeConfig[size]

  return (
    <div className={cn('inline-flex flex-col', className)}>
      {/* 主徽章 */}
      <span
        className={cn(
          'inline-flex items-center rounded-full font-medium',
          sizeStyles.padding,
          sizeStyles.fontSize,
          sizeStyles.gap,
          level.color
        )}
      >
        <span className={sizeStyles.iconSize}>{level.icon}</span>
        <span>连续 {streak} 天</span>
      </span>

      {/* 详细信息 */}
      {showDetail && (
        <div className="mt-2 text-xs text-gray-500">
          <p className="font-medium text-gray-700">{level.label}</p>
          {nextLevel && (
            <p className="mt-1">
              再坚持 {nextLevel.daysNeeded} 天解锁 {nextLevel.icon} {nextLevel.label}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 连续学习徽章卡片
 */
export function LearningStreakCard({
  streak,
  className,
}: {
  streak: number
  className?: string
}) {
  const level = getStreakLevel(streak)
  const nextLevel = getNextLevel(streak)
  const progress = nextLevel ? ((streak - (level.min || 0)) / (nextLevel.min - (level.min || 0))) * 100 : 100

  return (
    <div className={cn('bg-white rounded-xl p-4 border border-gray-200', className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800">连续学习</h4>
        <span className="text-2xl">{level.icon}</span>
      </div>

      <div className="text-center mb-3">
        <div className="text-4xl font-bold text-gray-900">{streak}</div>
        <div className="text-sm text-gray-500">天</div>
      </div>

      <div className={cn('text-center py-2 rounded-lg', level.color)}>
        <span className="font-medium">{level.label}</span>
      </div>

      {nextLevel && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>下一等级</span>
            <span>
              {nextLevel.icon} {nextLevel.label}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1 text-right">
            还需 {nextLevel.daysNeeded} 天
          </div>
        </div>
      )}
    </div>
  )
}

export default LearningStreakBadge
