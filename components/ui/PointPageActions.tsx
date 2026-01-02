/**
 * 考点页面行动区组件
 * 
 * 显示主要、次要、第三级行动按钮
 */

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Play, BookOpen, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Action } from '@/lib/knowledge/pointPage.types'

export interface PointPageActionsProps {
  primary: Action
  secondary: Action
  tertiary: Action
  pointId: string
  className?: string
  sticky?: boolean
}

function getActionHref(action: Action, pointId: string): string {
  if (action.href) return action.href

  switch (action.type) {
    case "selfTest":
      return `/practice/by-point?pointId=${pointId}&mode=self-test&count=${action.payload?.count || 5}`
    case "practice":
      return `/practice/by-point?pointId=${pointId}`
    case "backToGraph":
      return "/knowledge"
    case "markDone":
      return "#" // TODO: 实现标记完成功能
    default:
      return "#"
  }
}

function getActionIcon(type: Action['type']) {
  switch (type) {
    case "selfTest":
      return <Play className="w-5 h-5" />
    case "practice":
      return <BookOpen className="w-4 h-4" />
    case "backToGraph":
      return <ArrowLeft className="w-4 h-4" />
    default:
      return null
  }
}

export function PointPageActions({
  primary,
  secondary,
  tertiary,
  pointId,
  className,
  sticky = false,
}: PointPageActionsProps) {
  const router = useRouter()

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-lg p-4 sm:p-6',
        sticky && 'lg:sticky lg:bottom-6 lg:z-10',
        className
      )}
    >
      <div className="space-y-3">
        {/* 主按钮 */}
        <Link
          href={getActionHref(primary, pointId)}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg',
            'text-white font-semibold text-base transition-all',
            'bg-gradient-to-r from-blue-600 to-blue-700',
            'hover:from-blue-700 hover:to-blue-800',
            'active:scale-[0.98]',
            'shadow-md hover:shadow-lg'
          )}
        >
          {getActionIcon(primary.type)}
          <span>{primary.label}</span>
        </Link>

        {/* 次按钮 */}
        <Link
          href={getActionHref(secondary, pointId)}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg',
            'text-gray-700 font-medium text-sm transition-all',
            'bg-gray-50 border border-gray-200',
            'hover:bg-gray-100 hover:border-gray-300',
            'active:scale-[0.98]'
          )}
        >
          {getActionIcon(secondary.type)}
          <span>{secondary.label}</span>
        </Link>

        {/* 第三级按钮 */}
        <Link
          href={getActionHref(tertiary, pointId)}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
            'text-gray-600 text-sm transition-colors',
            'hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          {getActionIcon(tertiary.type)}
          <span>{tertiary.label}</span>
        </Link>
      </div>
    </div>
  )
}

export default PointPageActions

