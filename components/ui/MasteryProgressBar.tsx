/**
 * 掌握度进度条组件
 * 
 * 根据掌握度分数显示不同颜色的进度条和状态标签
 * - ≥80% 绿色 (已掌握)
 * - 60-79% 黄色 (需复习)
 * - 1-59% 红色 (薄弱)
 * - 0 灰色 (未学习)
 * 
 * Requirements: 3.2, 7.2
 */

'use client'

import { cn } from '@/lib/utils'
import { getStatusConfig, MasteryStatus } from '@/lib/mastery-utils'

// 重新导出类型和函数供外部使用
export { getMasteryStatus, getMasteryColor, getStatusConfig, MASTERY_THRESHOLDS } from '@/lib/mastery-utils'
export type { MasteryStatus } from '@/lib/mastery-utils'

// 组件属性
export interface MasteryProgressBarProps {
  /** 掌握度分数 (0-100) */
  score: number
  /** 是否显示标签 */
  showLabel?: boolean
  /** 是否显示百分比 */
  showPercentage?: boolean
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 自定义类名 */
  className?: string
  /** 是否显示动画 */
  animated?: boolean
}

// 尺寸配置
const sizeConfig = {
  sm: {
    height: 'h-1.5',
    fontSize: 'text-xs',
    padding: 'py-0.5',
  },
  md: {
    height: 'h-2.5',
    fontSize: 'text-sm',
    padding: 'py-1',
  },
  lg: {
    height: 'h-4',
    fontSize: 'text-base',
    padding: 'py-1.5',
  },
}

/**
 * 掌握度进度条组件
 */
export function MasteryProgressBar({
  score,
  showLabel = false,
  showPercentage = true,
  size = 'md',
  className,
  animated = true,
}: MasteryProgressBarProps) {
  // 确保分数在有效范围内
  const normalizedScore = Math.max(0, Math.min(100, score))
  const config = getStatusConfig(normalizedScore)
  const sizeStyles = sizeConfig[size]
  
  return (
    <div className={cn('w-full', className)}>
      {/* 标签和百分比 */}
      {(showLabel || showPercentage) && (
        <div className={cn('flex items-center justify-between mb-1', sizeStyles.fontSize)}>
          {showLabel && (
            <span className={cn('flex items-center gap-1', config.textColor)}>
              <span>{config.icon}</span>
              <span>{config.text}</span>
            </span>
          )}
          {showPercentage && (
            <span className={cn('font-medium', config.textColor)}>
              {normalizedScore}%
            </span>
          )}
        </div>
      )}
      
      {/* 进度条 */}
      <div className={cn('w-full rounded-full overflow-hidden', config.bgColor, sizeStyles.height)}>
        <div
          className={cn(
            'h-full rounded-full',
            config.barColor,
            animated && 'transition-all duration-500 ease-out'
          )}
          style={{ width: `${normalizedScore}%` }}
          role="progressbar"
          aria-valuenow={normalizedScore}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`掌握度 ${normalizedScore}%`}
        />
      </div>
    </div>
  )
}

export default MasteryProgressBar
