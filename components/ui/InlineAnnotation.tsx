/**
 * 内联标注组件（贴纸）
 * 
 * 在原文内容中注入标注提示
 */

'use client'

import { useState } from 'react'
import { X, AlertCircle, Zap, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InlineAnnotationRule, AnnotationType, TakeawayLevel } from '@/lib/knowledge/pointPage.schema'

export interface InlineAnnotationProps {
  rule: InlineAnnotationRule
  onClose?: () => void
}

function getAnnotationIcon(type: AnnotationType) {
  switch (type) {
    case "怎么考":
      return <BookOpen className="w-4 h-4" />
    case "坑点":
      return <AlertCircle className="w-4 h-4" />
    case "秒选":
      return <Zap className="w-4 h-4" />
    default:
      return <AlertCircle className="w-4 h-4" />
  }
}

function getLevelStyles(level: TakeawayLevel) {
  switch (level) {
    case "key":
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        icon: "text-blue-600",
      }
    case "warn":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-800",
        icon: "text-amber-600",
      }
    case "danger":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        icon: "text-red-600",
      }
    default:
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-800",
        icon: "text-gray-600",
      }
  }
}

export function InlineAnnotation({ rule, onClose }: InlineAnnotationProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const styles = getLevelStyles(rule.annotation.level)
  const icon = getAnnotationIcon(rule.annotation.type)

  return (
    <div
      id={rule.anchorId}
      className={cn(
        "relative my-2 rounded-lg border p-3 transition-all",
        styles.bg,
        styles.border
      )}
    >
      <div className="flex items-start gap-2">
        <div className={cn("flex-shrink-0 mt-0.5", styles.icon)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={cn("text-xs font-semibold", styles.text)}>
              {rule.annotation.type}
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {rule.annotation.title && (
            <div className={cn("text-sm font-medium mb-1", styles.text)}>
              {rule.annotation.title}
            </div>
          )}
          <div className={cn("text-sm leading-relaxed", styles.text)}>
            {rule.annotation.message}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 处理内容并注入标注
 */
export function injectAnnotations(
  content: string,
  rules: InlineAnnotationRule[]
): string {
  if (!content || rules.length === 0) return content

  let processedContent = content
  const annotations: Array<{ position: number; rule: InlineAnnotationRule }> = []

  // 收集所有匹配位置
  for (const rule of rules) {
    let regex: RegExp
    if (rule.match.type === "regex") {
      try {
        regex = new RegExp(rule.match.value, "gi")
      } catch {
        continue // 无效的正则表达式，跳过
      }
    } else {
      regex = new RegExp(rule.match.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
    }

    let match
    while ((match = regex.exec(processedContent)) !== null) {
      annotations.push({
        position: match.index,
        rule,
      })
    }
  }

  // 按位置排序（从后往前插入，避免位置偏移）
  annotations.sort((a, b) => b.position - a.position)

  // 从后往前插入标注（避免位置偏移）
  for (const { position, rule } of annotations) {
    const annotationHtml = `<div class="inline-annotation" data-rule-id="${rule.id}" data-anchor-id="${rule.anchorId || ""}"></div>`
    processedContent =
      processedContent.slice(0, position) +
      annotationHtml +
      processedContent.slice(position)
  }

  return processedContent
}

export default InlineAnnotation

