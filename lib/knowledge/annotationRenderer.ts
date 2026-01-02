/**
 * Inline Annotation Renderer
 * 
 * 在原始内容中注入内联注释/贴纸
 */

import type { InlineAnnotationRule } from "./pointPage.schema"

export type AnnotationMatch = {
  rule: InlineAnnotationRule
  startIndex: number
  endIndex: number
  matchedText: string
}

/**
 * 查找所有匹配的注释规则
 */
export function findAnnotationMatches(
  content: string,
  rules: InlineAnnotationRule[]
): AnnotationMatch[] {
  if (!content || !rules || rules.length === 0) {
    return []
  }

  const matches: AnnotationMatch[] = []

  for (const rule of rules) {
    let regex: RegExp

    if (rule.match.type === "regex") {
      try {
        regex = new RegExp(rule.match.value, "gi")
      } catch (e) {
        console.warn(`Invalid regex in annotation rule ${rule.id}:`, rule.match.value)
        continue
      }
    } else {
      // contains type: escape special regex chars
      const escaped = rule.match.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      regex = new RegExp(escaped, "gi")
    }

    let match
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        rule,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        matchedText: match[0],
      })
    }
  }

  // 按位置排序，处理重叠
  matches.sort((a, b) => a.startIndex - b.startIndex)

  return matches
}

/**
 * 将内容分段，插入注释标记
 */
export type ContentSegment = {
  type: "text" | "annotation"
  content: string
  annotation?: InlineAnnotationRule
  anchorId?: string
}

export function segmentContentWithAnnotations(
  content: string,
  rules: InlineAnnotationRule[]
): ContentSegment[] {
  const matches = findAnnotationMatches(content, rules)
  if (matches.length === 0) {
    return [{ type: "text", content }]
  }

  const segments: ContentSegment[] = []
  let lastIndex = 0

  for (const match of matches) {
    // 添加匹配前的文本
    if (match.startIndex > lastIndex) {
      segments.push({
        type: "text",
        content: content.substring(lastIndex, match.startIndex),
      })
    }

    // 添加注释标记
    segments.push({
      type: "annotation",
      content: match.matchedText,
      annotation: match.rule,
      anchorId: match.rule.anchorId,
    })

    lastIndex = match.endIndex
  }

  // 添加剩余文本
  if (lastIndex < content.length) {
    segments.push({
      type: "text",
      content: content.substring(lastIndex),
    })
  }

  return segments
}

