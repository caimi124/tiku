/**
 * 重要性星级组件
 * 
 * 显示1-5星的重要性等级
 * 
 * Requirements: 4.1
 */

'use client'

import { cn } from '@/lib/utils'

export interface ImportanceStarsProps {
  /** 重要性等级 (1-5) */
  level: number
  /** 最大星数 */
  maxStars?: number
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否显示数字 */
  showNumber?: boolean
  /** 自定义类名 */
  className?: string
}

// 尺寸配置
const sizeConfig = {
  sm: {
    fontSize: 'text-xs',
    gap: 'gap-0',
  },
  md: {
    fontSize: 'text-sm',
    gap: 'gap-0.5',
  },
  lg: {
    fontSize: 'text-base',
    gap: 'gap-1',
  },
}

/**
 * 重要性星级组件
 */
export function ImportanceStars({
  level,
  maxStars = 5,
  size = 'md',
  showNumber = false,
  className,
}: ImportanceStarsProps) {
  // 确保等级在有效范围内
  const normalizedLevel = Math.max(1, Math.min(maxStars, Math.round(level)))
  const sizeStyles = sizeConfig[size]
  
  // 生成星星数组
  const stars = Array.from({ length: maxStars }, (_, i) => i < normalizedLevel)
  
  return (
    <span
      className={cn(
        'inline-flex items-center',
        sizeStyles.fontSize,
        sizeStyles.gap,
        className
      )}
      title={`重要性: ${normalizedLevel}/${maxStars}星`}
      aria-label={`重要性 ${normalizedLevel} 星，满分 ${maxStars} 星`}
    >
      {stars.map((filled, index) => (
        <span
          key={index}
          className={cn(
            filled ? 'text-yellow-400' : 'text-gray-300'
          )}
        >
          {filled ? '\u2605' : '\u2606'}
        </span>
      ))}
      {showNumber && (
        <span className="ml-1 text-gray-500">
          ({normalizedLevel})
        </span>
      )}
    </span>
  )
}

/**
 * 获取重要性等级描述
 */
export function getImportanceLabel(level: number): string {
  if (level >= 5) return '极高'
  if (level >= 4) return '高频'
  if (level >= 3) return '中等'
  if (level >= 2) return '较低'
  return '低'
}

/**
 * 判断是否为高频考点
 */
export function isHighFrequency(level: number): boolean {
  return level >= 4
}

export default ImportanceStars
