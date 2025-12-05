/**
 * 掌握状态徽章组件
 * 
 * 根据掌握度显示对应的图标和文字徽章
 * 
 * Requirements: 3.3, 4.1
 */

'use client'

import { cn } from '@/lib/utils'
import { getStatusConfig, getMasteryStatus, MasteryStatus } from '@/lib/mastery-utils'

export interface MasteryStatusBadgeProps {
  /** 掌握度分数 (0-100) */
  score: number
  /** 是否显示图标 */
  showIcon?: boolean
  /** 是否显示文字 */
  showText?: boolean
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 自定义类名 */
  className?: string
}

// 尺寸配置
const sizeConfig = {
  sm: {
    padding: 'px-1.5 py-0.5',
    fontSize: 'text-xs',
    iconSize: 'text-xs',
    gap: 'gap-0.5',
  },
  md: {
    padding: 'px-2 py-1',
    fontSize: 'text-sm',
    iconSize: 'text-sm',
    gap: 'gap-1',
  },
  lg: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-base',
    iconSize: 'text-base',
    gap: 'gap-1.5',
  },
}

/**
 * 掌握状态徽章组件
 */
export function MasteryStatusBadge({
  score,
  showIcon = true,
  showText = true,
  size = 'md',
  className,
}: MasteryStatusBadgeProps) {
  const normalizedScore = Math.max(0, Math.min(100, score))
  const config = getStatusConfig(normalizedScore)
  const sizeStyles = sizeConfig[size]
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeStyles.padding,
        sizeStyles.fontSize,
        sizeStyles.gap,
        config.bgColor,
        config.textColor,
        className
      )}
    >
      {showIcon && (
        <span className={sizeStyles.iconSize}>{config.icon}</span>
      )}
      {showText && (
        <span>{config.text}</span>
      )}
    </span>
  )
}

export default MasteryStatusBadge
