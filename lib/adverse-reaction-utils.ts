/**
 * AdverseReactionBadge 工具函数
 * 用于不良反应严重程度的颜色映射
 * 
 * Requirements: 3.2
 */

export type SeverityLevel = 'severe' | 'moderate' | 'mild'

export interface SeverityConfig {
  bgColor: string
  textColor: string
  borderColor: string
  label: string
  icon: string
}

// 颜色映射配置
export const SEVERITY_CONFIG: Record<SeverityLevel, SeverityConfig> = {
  severe: {
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    label: '严重',
    icon: '⚠️'
  },
  moderate: {
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    label: '中度',
    icon: '⚡'
  },
  mild: {
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
    label: '轻度',
    icon: '✓'
  }
}

/**
 * 根据严重程度获取颜色配置
 */
export function getSeverityConfig(severity: SeverityLevel): SeverityConfig {
  return SEVERITY_CONFIG[severity]
}

/**
 * 验证严重程度是否有效
 */
export function isValidSeverity(severity: string): severity is SeverityLevel {
  return ['severe', 'moderate', 'mild'].includes(severity)
}

/**
 * 根据严重程度获取背景颜色类名
 */
export function getSeverityBgColor(severity: SeverityLevel): string {
  return SEVERITY_CONFIG[severity].bgColor
}

/**
 * 根据严重程度获取文字颜色类名
 */
export function getSeverityTextColor(severity: SeverityLevel): string {
  return SEVERITY_CONFIG[severity].textColor
}

/**
 * 不良反应数据结构
 */
export interface AdverseReaction {
  content: string
  severity: SeverityLevel
}

/**
 * 按严重程度排序不良反应
 */
export function sortBySeverity(reactions: AdverseReaction[]): AdverseReaction[] {
  const order: Record<SeverityLevel, number> = { severe: 0, moderate: 1, mild: 2 }
  return [...reactions].sort((a, b) => order[a.severity] - order[b.severity])
}
