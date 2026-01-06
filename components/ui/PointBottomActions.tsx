/**
 * 考点页面底部操作区组件（纵向布局）
 * 
 * 学习完成后的行动区，自上而下：
 * 1. 主按钮：▶ 开始考点自测（3–5题）
 * 2. 次按钮：→ 进入本章专项练习
 * 3. 状态操作：✓ 标记为已学完
 * 4. 路径操作：← 返回知识图谱
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Play, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isPointCompleted, markPointCompleted } from '@/lib/learningProgress'

export interface PointBottomActionsProps {
  /** 考点ID */
  pointId: string
  /** 自定义类名 */
  className?: string
  /** 自测链接 */
  selfTestHref?: string
  /** 专项练习链接 */
  practiceHref?: string
  /** 章节ID（用于专项练习） */
  sectionId?: string
}

export function PointBottomActions({
  pointId,
  className,
  selfTestHref,
  practiceHref,
  sectionId,
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
  const defaultPracticeHref = sectionId 
    ? `/practice/by-section?sectionId=${sectionId}`
    : `/practice/by-point?pointId=${pointId}`

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        'p-4 sm:p-6',
        'space-y-3',
        className
      )}
    >
      {/* 1. 主按钮：开始考点自测（唯一 Primary） */}
      <Link
        href={selfTestHref || defaultSelfTestHref}
        className={cn(
          'w-full flex items-center justify-center gap-2',
          'px-6 py-3.5 rounded-lg',
          'text-white font-semibold text-base transition-all',
          'bg-gradient-to-r from-blue-600 to-blue-700',
          'hover:from-blue-700 hover:to-blue-800',
          'active:scale-[0.98]',
          'shadow-md hover:shadow-lg'
        )}
      >
        <Play className="w-5 h-5" />
        <span>开始考点自测（3–5题）</span>
      </Link>

      {/* 2. 次按钮：进入本章专项练习（Secondary / 灰色） */}
      <Link
        href={practiceHref || defaultPracticeHref}
        className={cn(
          'w-full flex items-center justify-center gap-2',
          'px-6 py-3 rounded-lg',
          'text-gray-700 font-medium text-sm transition-all',
          'bg-gray-50 border border-gray-200',
          'hover:bg-gray-100 hover:border-gray-300',
          'active:scale-[0.98]'
        )}
      >
        <ArrowRight className="w-4 h-4" />
        <span>进入本章专项练习</span>
      </Link>

      {/* 3. 状态操作：标记为已学完（小号按钮或文字） */}
      <button
        type="button"
        onClick={handleMarkDone}
        disabled={completed || isMarking}
        className={cn(
          'w-full flex items-center justify-center gap-2',
          'px-4 py-2 rounded-lg',
          'text-sm font-medium transition-all',
          'border',
          completed
            ? 'bg-green-50 border-green-300 text-green-700 cursor-default'
            : 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 hover:bg-green-50',
          isMarking && 'opacity-50 cursor-not-allowed'
        )}
      >
        {completed ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>标记为已学完</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>标记为已学完</span>
          </>
        )}
      </button>

      {/* 4. 路径操作：返回知识图谱（纯文字按钮） */}
      <Link
        href="/knowledge"
        className={cn(
          'w-full flex items-center justify-center gap-2',
          'px-4 py-2 text-sm text-gray-600',
          'hover:text-gray-900 transition-colors'
        )}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回知识图谱</span>
      </Link>
    </div>
  )
}

export default PointBottomActions

