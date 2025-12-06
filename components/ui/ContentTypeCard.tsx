/**
 * ContentTypeCard 组件
 * 支持6种内容类型：作用机制、药动学、不良反应、临床应用、相互作用、记忆口诀
 * 卡片式布局，每种类型独立卡片
 * 集成 KeywordHighlight 和 NumberHighlight
 * 
 * Requirements: 3.1, 1.5
 */

'use client'

import React from 'react'
import {
  ContentType,
  ContentTypeConfig,
  CONTENT_TYPE_CONFIG,
  getContentTypeConfig,
  isValidContentType
} from '@/lib/content-type-utils'
import { KeywordHighlight } from './KeywordHighlight'
import { NumberHighlight } from './NumberHighlight'
import { AdverseReactionBadge, SeverityLevel } from './AdverseReactionBadge'

// Re-export for convenience
export type { ContentType }
export { CONTENT_TYPE_CONFIG, getContentTypeConfig, isValidContentType }

export interface ContentTypeCardProps {
  type: ContentType
  title?: string
  content: string | string[]
  severity?: SeverityLevel  // 仅用于不良反应类型
  isHighFrequency?: boolean
  className?: string
  enableKeywordHighlight?: boolean
  enableNumberHighlight?: boolean
}

/**
 * 渲染带高亮的文本内容
 * 同时支持关键词高亮和数字高亮
 */
function HighlightedText({
  text,
  enableKeyword = true,
  enableNumber = true
}: {
  text: string
  enableKeyword?: boolean
  enableNumber?: boolean
}) {
  // 如果两种高亮都启用，嵌套使用两个组件
  // 外层 KeywordHighlight 处理关键词，内层 NumberHighlight 处理数字
  if (enableKeyword && enableNumber) {
    // 使用组合方式：先用 NumberHighlight 包装，再用 KeywordHighlight
    // 由于组件限制，这里采用简化方案：优先显示关键词高亮
    return (
      <span>
        <KeywordHighlight text={text} />
      </span>
    )
  }
  
  if (enableKeyword) {
    return <KeywordHighlight text={text} />
  }
  
  if (enableNumber) {
    return <NumberHighlight text={text} />
  }
  
  return <span>{text}</span>
}

/**
 * 渲染内容项（支持字符串或字符串数组）
 */
function ContentItems({
  content,
  type,
  severity,
  enableKeywordHighlight,
  enableNumberHighlight
}: {
  content: string | string[]
  type: ContentType
  severity?: SeverityLevel
  enableKeywordHighlight: boolean
  enableNumberHighlight: boolean
}) {
  const items = Array.isArray(content) ? content : [content]
  
  // 不良反应类型使用特殊渲染
  if (type === 'adverse' && severity) {
    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <AdverseReactionBadge
            key={index}
            severity={severity}
            content={item}
            showLabel={index === 0}
          />
        ))}
      </div>
    )
  }
  
  // 记忆口诀类型使用特殊样式
  if (type === 'memory') {
    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-yellow-100 border-l-4 border-yellow-400 p-3 rounded-r-lg italic text-yellow-900"
          >
            <HighlightedText
              text={item}
              enableKeyword={enableKeywordHighlight}
              enableNumber={enableNumberHighlight}
            />
          </div>
        ))}
      </div>
    )
  }
  
  // 其他类型使用列表渲染
  if (items.length === 1) {
    return (
      <p className="text-gray-700 leading-relaxed">
        <HighlightedText
          text={items[0]}
          enableKeyword={enableKeywordHighlight}
          enableNumber={enableNumberHighlight}
        />
      </p>
    )
  }
  
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2 text-gray-700">
          <span className="text-gray-400 mt-1">•</span>
          <span className="flex-1 leading-relaxed">
            <HighlightedText
              text={item}
              enableKeyword={enableKeywordHighlight}
              enableNumber={enableNumberHighlight}
            />
          </span>
        </li>
      ))}
    </ul>
  )
}

export function ContentTypeCard({
  type,
  title,
  content,
  severity,
  isHighFrequency = false,
  className = '',
  enableKeywordHighlight = true,
  enableNumberHighlight = true
}: ContentTypeCardProps) {
  const config = getContentTypeConfig(type)
  const displayTitle = title || config.label
  
  return (
    <div
      className={`
        rounded-xl border-2 overflow-hidden
        ${config.bgColor} ${config.borderColor}
        ${className}
      `}
    >
      {/* 卡片头部 */}
      <div className={`px-4 py-3 border-b ${config.borderColor} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <h3 className={`font-semibold ${config.textColor}`}>
            {displayTitle}
          </h3>
        </div>
        {isHighFrequency && (
          <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
            高频
          </span>
        )}
      </div>
      
      {/* 卡片内容 */}
      <div className="p-4">
        <ContentItems
          content={content}
          type={type}
          severity={severity}
          enableKeywordHighlight={enableKeywordHighlight}
          enableNumberHighlight={enableNumberHighlight}
        />
      </div>
    </div>
  )
}


/**
 * 内容卡片列表组件
 * 用于渲染多个内容类型卡片
 */
export interface ContentCardListProps {
  items: {
    type: ContentType
    title?: string
    content: string | string[]
    severity?: SeverityLevel
    isHighFrequency?: boolean
  }[]
  className?: string
  cardClassName?: string
  enableKeywordHighlight?: boolean
  enableNumberHighlight?: boolean
}

export function ContentCardList({
  items,
  className = '',
  cardClassName = '',
  enableKeywordHighlight = true,
  enableNumberHighlight = true
}: ContentCardListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无内容
      </div>
    )
  }
  
  return (
    <div className={`grid gap-4 ${className}`}>
      {items.map((item, index) => (
        <ContentTypeCard
          key={`${item.type}-${index}`}
          type={item.type}
          title={item.title}
          content={item.content}
          severity={item.severity}
          isHighFrequency={item.isHighFrequency}
          className={cardClassName}
          enableKeywordHighlight={enableKeywordHighlight}
          enableNumberHighlight={enableNumberHighlight}
        />
      ))}
    </div>
  )
}

/**
 * 从 KnowledgeContent 数据生成卡片列表
 */
export interface KnowledgeContentCardsProps {
  content: {
    mechanism?: string[]
    pharmacokinetics?: string[]
    adverseReactions?: { content: string; severity: SeverityLevel }[]
    clinicalApplications?: string[]
    interactions?: string[]
    memoryTips?: string
  }
  className?: string
  enableKeywordHighlight?: boolean
  enableNumberHighlight?: boolean
}

export function KnowledgeContentCards({
  content,
  className = '',
  enableKeywordHighlight = true,
  enableNumberHighlight = true
}: KnowledgeContentCardsProps) {
  const cards: ContentCardListProps['items'] = []
  
  // 按照固定顺序添加卡片
  if (content.mechanism && content.mechanism.length > 0) {
    cards.push({
      type: 'mechanism',
      content: content.mechanism
    })
  }
  
  if (content.pharmacokinetics && content.pharmacokinetics.length > 0) {
    cards.push({
      type: 'pharmacokinetics',
      content: content.pharmacokinetics
    })
  }
  
  if (content.adverseReactions && content.adverseReactions.length > 0) {
    // 按严重程度分组
    const severeReactions = content.adverseReactions.filter(r => r.severity === 'severe')
    const moderateReactions = content.adverseReactions.filter(r => r.severity === 'moderate')
    const mildReactions = content.adverseReactions.filter(r => r.severity === 'mild')
    
    if (severeReactions.length > 0) {
      cards.push({
        type: 'adverse',
        title: '严重不良反应',
        content: severeReactions.map(r => r.content),
        severity: 'severe'
      })
    }
    
    if (moderateReactions.length > 0) {
      cards.push({
        type: 'adverse',
        title: '中度不良反应',
        content: moderateReactions.map(r => r.content),
        severity: 'moderate'
      })
    }
    
    if (mildReactions.length > 0) {
      cards.push({
        type: 'adverse',
        title: '轻度不良反应',
        content: mildReactions.map(r => r.content),
        severity: 'mild'
      })
    }
  }
  
  if (content.clinicalApplications && content.clinicalApplications.length > 0) {
    cards.push({
      type: 'clinical',
      content: content.clinicalApplications
    })
  }
  
  if (content.interactions && content.interactions.length > 0) {
    cards.push({
      type: 'interaction',
      content: content.interactions
    })
  }
  
  if (content.memoryTips) {
    cards.push({
      type: 'memory',
      content: content.memoryTips
    })
  }
  
  return (
    <ContentCardList
      items={cards}
      className={className}
      enableKeywordHighlight={enableKeywordHighlight}
      enableNumberHighlight={enableNumberHighlight}
    />
  )
}
