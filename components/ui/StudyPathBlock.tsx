/**
 * 学习路线区块组件
 */

'use client'

import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StudyPathBlock } from '@/lib/knowledge/pointPage.schema'

export interface StudyPathBlockProps {
  data: StudyPathBlock
  className?: string
}

export function StudyPathBlock({ data, className }: StudyPathBlockProps) {
  return (
    <div className={cn(
      'bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-4',
      className
    )}>
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <ArrowRight className="w-4 h-4 text-blue-500" />
        <span>{data.text}</span>
      </div>
    </div>
  )
}

export default StudyPathBlock

