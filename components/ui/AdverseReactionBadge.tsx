/**
 * AdverseReactionBadge 组件
 * 根据严重程度显示不同颜色的不良反应标签
 * 
 * Requirements: 3.2
 */

'use client'

import React from 'react'
import {
  SeverityLevel,
  SEVERITY_CONFIG,
  getSeverityConfig,
  isValidSeverity,
  getSeverityBgColor,
  getSeverityTextColor,
  AdverseReaction,
  sortBySeverity
} from '@/lib/adverse-reaction-utils'

// Re-export utilities for convenience
export {
  SeverityLevel,
  SEVERITY_CONFIG,
  getSeverityConfig,
  isValidSeverity,
  getSeverityBgColor,
  getSeverityTextColor,
  AdverseReaction,
  sortBySeverity
}

export interface AdverseReactionBadgeProps {
  severity: SeverityLevel
  content: string
  showLabel?: boolean
  className?: string
}

export function AdverseReactionBadge({
  severity,
  content,
  showLabel = true,
  className = ''
}: AdverseReactionBadgeProps) {
  const config = SEVERITY_CONFIG[severity]

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${className}
      `}
    >
      <span className="text-sm">{config.icon}</span>
      {showLabel && (
        <span className="text-xs font-semibold">{config.label}</span>
      )}
      <span className="text-sm">{content}</span>
    </div>
  )
}

/**
 * 不良反应列表组件
 */
export interface AdverseReactionListProps {
  reactions: AdverseReaction[]
  className?: string
}

export function AdverseReactionList({
  reactions,
  className = ''
}: AdverseReactionListProps) {
  const sortedReactions = sortBySeverity(reactions)

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {sortedReactions.map((reaction, index) => (
        <AdverseReactionBadge
          key={index}
          severity={reaction.severity}
          content={reaction.content}
        />
      ))}
    </div>
  )
}
