/**
 * NumberHighlight 组件
 * 高亮数字（剂量、年龄、时间等）
 * 支持单位识别（mg、岁、天等）
 * 
 * Requirements: 3.4
 */

'use client'

import React from 'react'
import {
  highlightNumbers,
  containsNumber,
  extractNumbers,
  extractNumbersWithUnits,
  NumberHighlightPart
} from '@/lib/number-highlight-utils'

export interface NumberHighlightProps {
  text: string
  className?: string
  numberClassName?: string
  unitClassName?: string
}

// Re-export utilities for convenience
export { highlightNumbers, containsNumber, extractNumbers, extractNumbersWithUnits }
export type { NumberHighlightPart }

export function NumberHighlight({
  text,
  className = '',
  numberClassName = 'bg-blue-100 text-blue-800 font-semibold px-1 rounded',
  unitClassName = 'text-blue-600 font-medium'
}: NumberHighlightProps) {
  const parts = highlightNumbers(text)

  return (
    <span className={className}>
      {parts.map((part, index) => (
        part.isNumber ? (
          <span key={index}>
            <span className={numberClassName}>{part.text}</span>
            {part.unit && <span className={unitClassName}>{part.unit}</span>}
          </span>
        ) : (
          <span key={index}>{part.text}</span>
        )
      ))}
    </span>
  )
}
