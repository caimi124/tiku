/**
 * 行动区组件
 * 
 * 显示主要行动按钮：开始考点自测、进入专项练习
 */

'use client'

import Link from 'next/link'
import { Play, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ActionAreaProps {
  /** 考点ID */
  pointId: string
  /** 是否已完成学习 */
  isCompleted?: boolean
  /** 自定义类名 */
  className?: string
  /** 是否粘底（桌面端） */
  sticky?: boolean
}

export function ActionArea({
  pointId,
  isCompleted = false,
  className,
  sticky = false,
}: ActionAreaProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-lg p-4 sm:p-6',
        sticky && 'lg:sticky lg:bottom-6 lg:z-10',
        className
      )}
    >
      <div className="space-y-3">
        {/* 主按钮：开始考点自测 */}
        <Link
          href={`/practice/by-point?pointId=${pointId}&mode=self-test`}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg',
            'text-white font-semibold text-base transition-all',
            'bg-gradient-to-r from-blue-600 to-blue-700',
            'hover:from-blue-700 hover:to-blue-800',
            'active:scale-[0.98]',
            'shadow-md hover:shadow-lg'
          )}
        >
          <Play className="w-5 h-5" />
          <span>开始考点自测（3-5题）</span>
        </Link>

        {/* 次按钮：进入专项练习 */}
        <Link
          href={`/practice/by-point?pointId=${pointId}`}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg',
            'text-gray-700 font-medium text-sm transition-all',
            'bg-gray-50 border border-gray-200',
            'hover:bg-gray-100 hover:border-gray-300',
            'active:scale-[0.98]'
          )}
        >
          <BookOpen className="w-4 h-4" />
          <span>进入专项练习</span>
        </Link>
      </div>

      {isCompleted && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-green-500">✓</span>
            <span>已完成学习</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActionArea

