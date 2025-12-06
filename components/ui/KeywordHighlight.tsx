/**
 * KeywordHighlight 组件
 * 高亮预定义关键词（首选、禁忌、相互作用、禁用、慎用等）
 * 
 * Requirements: 3.6
 */

'use client'

import React from 'react'
import { 
  highlightKeywords, 
  containsKeyword, 
  getMatchedKeywords,
  DEFAULT_KEYWORDS,
  KeywordConfig 
} from '@/lib/keyword-highlight-utils'

export interface KeywordHighlightProps {
  text: string
  keywords?: KeywordConfig[]
  className?: string
}

// Re-export utilities for convenience
export { highlightKeywords, containsKeyword, getMatchedKeywords, DEFAULT_KEYWORDS }
export type { KeywordConfig }

export function KeywordHighlight({
  text,
  keywords = DEFAULT_KEYWORDS,
  className = ''
}: KeywordHighlightProps) {
  const parts = highlightKeywords(text, keywords)

  return (
    <span className={className}>
      {parts.map((part, index) => (
        part.isHighlighted ? (
          <span key={index} className={part.className}>
            {part.text}
          </span>
        ) : (
          <span key={index}>{part.text}</span>
        )
      ))}
    </span>
  )
}
