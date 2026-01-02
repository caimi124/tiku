/**
 * 本页重点速览组件
 * 
 * 显示考点的关键要点（6-8条），支持折叠和颜色分级
 */

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb, Navigation } from 'lucide-react'
import type { Takeaway, TakeawayLevel } from '@/lib/knowledge/pointPage.schema'
import { cn } from '@/lib/utils'

export interface KeyTakeawaysProps {
  /** 重点列表（新格式：支持 level） */
  items: Takeaway[]
  /** 默认是否展开 */
  defaultExpanded?: boolean
  /** 自定义类名 */
  className?: string
  /** 旧格式兼容：字符串数组 */
  legacyItems?: string[]
}

function getLevelStyles(level: TakeawayLevel) {
  switch (level) {
    case "key":
      return {
        bg: "bg-blue-50",
        border: "border-blue-100",
        badge: "bg-blue-500",
        text: "text-blue-700",
      }
    case "warn":
      return {
        bg: "bg-amber-50",
        border: "border-amber-100",
        badge: "bg-amber-500",
        text: "text-amber-700",
      }
    case "danger":
      return {
        bg: "bg-red-50",
        border: "border-red-100",
        badge: "bg-red-500",
        text: "text-red-700",
      }
    default:
      return {
        bg: "bg-gray-50",
        border: "border-gray-100",
        badge: "bg-gray-500",
        text: "text-gray-700",
      }
  }
}

export function KeyTakeaways({
  items = [],
  legacyItems,
  defaultExpanded = true,
  className,
}: KeyTakeawaysProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  // 兼容旧格式：字符串数组
  const displayItems: Takeaway[] = items.length > 0
    ? items
    : (legacyItems || []).map((text, index) => ({
        id: `legacy-${index}`,
        level: "warn" as TakeawayLevel,
        text,
      }))

  // 锚点跳转函数
  const scrollToAnchor = (anchorId?: string) => {
    if (!anchorId) return
    const element = document.getElementById(anchorId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 高亮效果
      element.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2')
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2')
      }, 2000)
    }
  }

  if (!displayItems || displayItems.length === 0) {
    return null
  }

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm', className)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">本页重点速览</h2>
          <span className="text-sm text-gray-500">({displayItems.length}条)</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 sm:px-4 pb-4 space-y-2">
          {displayItems.map((item, index) => {
            const styles = getLevelStyles(item.level)
            return (
              <div
                key={item.id}
                id={item.anchorId}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border",
                  styles.bg,
                  styles.border
                )}
              >
                <span className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center mt-0.5",
                  styles.badge
                )}>
                  {index + 1}
                </span>
                <p className={cn("leading-relaxed flex-1", styles.text)}>{item.text}</p>
                {item.anchorId && (
                  <button
                    type="button"
                    onClick={() => scrollToAnchor(item.anchorId)}
                    className="flex-shrink-0 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-white/50 rounded transition-colors flex items-center gap-1"
                    title="定位到相关内容"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>定位</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default KeyTakeaways

