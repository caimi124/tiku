/**
 * 考点页面底部操作区组件（固定布局）
 * 
 * 左右按钮布局：
 * - 左：我已学完（状态按钮）
 * - 右：开始考点自测（主 CTA）
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Play, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isPointCompleted, markPointCompleted } from '@/lib/learningProgress'

export interface PointBottomActionsProps {
  /** 考点ID */
  pointId: string
  /** 自定义类名 */
  className?: string
  /** 自测链接 */
  selfTestHref?: string
}

export function PointBottomActions({
  pointId,
  className,
  selfTestHref,
}: PointBottomActionsProps) {
  const [completed, setCompleted] = useState(false)
  const [isMarking, setIsMarking] = useState(false)

  useEffect(() => {
    if (pointId) {
      setCompleted(isPointCompleted(pointId))
    }
  }, [pointId])

  const handleMarkDone = async () => {
    if (completed || isMarking) return
    
    setIsMarking(true)
    try {
      const success = markPointCompleted(pointId)
      if (success) {
        setCompleted(true)
        // 触发更新事件
        window.dispatchEvent(new Event('learning-progress-updated'))
      }
    } catch (error) {
      console.error('标记完成失败', error)
    } finally {
      setIsMarking(false)
    }
  }

  const defaultSelfTestHref = `/practice/by-point?pointId=${pointId}&mode=self-test&count=5`

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white border-t border-gray-200 shadow-lg',
        'px-4 py-3 sm:px-6 sm:py-4',
        className
      )}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* 左：我已学完（状态按钮） */}
          <button
            type="button"
            onClick={handleMarkDone}
            disabled={completed || isMarking}
            className={cn(
              'flex items-center justify-center gap-2',
              'px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg',
              'font-medium text-sm sm:text-base transition-all',
              'border-2',
              completed
                ? 'bg-green-50 border-green-500 text-green-700 cursor-default'
                : 'bg-white border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-700 hover:bg-green-50',
              isMarking && 'opacity-50 cursor-not-allowed'
            )}
          >
            {completed ? (
              <>
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>我已学完</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>我已学完</span>
              </>
            )}
          </button>

          {/* 右：开始考点自测（主 CTA） */}
          <Link
            href={selfTestHref || defaultSelfTestHref}
            className={cn(
              'flex-1 flex items-center justify-center gap-2',
              'px-6 py-2.5 sm:py-3 rounded-lg',
              'text-white font-semibold text-sm sm:text-base transition-all',
              'bg-gradient-to-r from-blue-600 to-blue-700',
              'hover:from-blue-700 hover:to-blue-800',
              'active:scale-[0.98]',
              'shadow-md hover:shadow-lg'
            )}
          >
            <Play className="w-5 h-5" />
            <span>开始考点自测</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PointBottomActions

