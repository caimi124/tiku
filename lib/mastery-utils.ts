/**
 * 掌握度工具函数
 * 
 * 提供掌握度相关的纯函数，用于颜色映射、状态判断等
 * 
 * Requirements: 3.2, 7.2
 */

// 掌握度阈值
export const MASTERY_THRESHOLDS = {
  MASTERED: 80,    // ≥80% 已掌握
  REVIEW: 60,      // 60-79% 需复习
} as const

// 掌握状态类型
export type MasteryStatus = 'mastered' | 'review' | 'weak' | 'unlearned'

// 颜色类型
export type MasteryColor = 'green' | 'yellow' | 'red' | 'gray'

// 状态配置
export interface StatusConfig {
  status: MasteryStatus
  text: string
  icon: string
  bgColor: string
  barColor: string
  textColor: string
}

/**
 * 根据分数获取掌握状态
 */
export function getMasteryStatus(score: number): MasteryStatus {
  if (score >= MASTERY_THRESHOLDS.MASTERED) return 'mastered'
  if (score >= MASTERY_THRESHOLDS.REVIEW) return 'review'
  if (score > 0) return 'weak'
  return 'unlearned'
}

/**
 * 根据分数获取颜色 (用于热力图等)
 * 
 * Property 16: 热力图颜色映射一致性
 * - >80% 绿色
 * - 60-80% 黄色
 * - <60% 红色
 */
export function getMasteryColor(score: number): MasteryColor {
  if (score >= MASTERY_THRESHOLDS.MASTERED) return 'green'
  if (score >= MASTERY_THRESHOLDS.REVIEW) return 'yellow'
  if (score > 0) return 'red'
  return 'gray'
}

/**
 * 根据分数获取状态配置
 */
export function getStatusConfig(score: number): StatusConfig {
  const status = getMasteryStatus(score)
  
  switch (status) {
    case 'mastered':
      return {
        status: 'mastered',
        text: '已掌握',
        icon: '\u2713',
        bgColor: 'bg-green-100',
        barColor: 'bg-green-500',
        textColor: 'text-green-600',
      }
    case 'review':
      return {
        status: 'review',
        text: '需复习',
        icon: '\u26A0',
        bgColor: 'bg-yellow-100',
        barColor: 'bg-yellow-500',
        textColor: 'text-yellow-600',
      }
    case 'weak':
      return {
        status: 'weak',
        text: '薄弱',
        icon: '\u2717',
        bgColor: 'bg-red-100',
        barColor: 'bg-red-500',
        textColor: 'text-red-600',
      }
    default:
      return {
        status: 'unlearned',
        text: '未学习',
        icon: '\u25CB',
        bgColor: 'bg-gray-100',
        barColor: 'bg-gray-300',
        textColor: 'text-gray-400',
      }
  }
}

/**
 * 获取 Tailwind CSS 类
 */
export function getMasteryColorClass(score: number): {
  bg: string
  text: string
  bar: string
} {
  const config = getStatusConfig(score)
  return {
    bg: config.bgColor,
    text: config.textColor,
    bar: config.barColor,
  }
}
