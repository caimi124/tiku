/**
 * 教材原文模块组件
 * 
 * 渲染原始内容（表格/临床评价等），只渲染一次
 */

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SourceMaterialModule, StickerRule } from '@/lib/knowledge/pointPage.types'
import { SmartContentRenderer } from '../SmartContentRenderer'
import type { InlineAnnotationRule } from '@/lib/knowledge/pointPage.schema'

export interface SourceMaterialModuleProps {
  module: SourceMaterialModule
  content?: string // 原始内容（从 API 获取）
  className?: string
}

export function SourceMaterialModule({ module, content, className }: SourceMaterialModuleProps) {
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {}
    module.data.blocks.forEach((block) => {
      state[block.id] = block.defaultExpanded ?? false
    })
    return state
  })

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }))
  }

  // 将 sticker rules 转换为 inline annotations
  const annotations: InlineAnnotationRule[] = module.data.blocks
    .flatMap((block) =>
      (block.highlighting?.stickers || []).map((sticker) => ({
        id: sticker.id,
        match: { type: "regex" as const, value: sticker.match },
        annotation: {
          type: "秒选" as const,
          level: sticker.level,
          message: sticker.label,
        },
      }))
    )

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm', className)}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">{module.title}</h2>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {module.data.blocks.map((block) => (
          <div key={block.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleBlock(block.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">{block.title}</span>
              {expandedBlocks[block.id] ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedBlocks[block.id] && content && (
              <div className="p-4 border-t border-gray-200">
                {block.renderFrom === "existingSmartRenderer" && (
                  <SmartContentRenderer
                    content={content}
                    annotations={annotations.length > 0 ? annotations : undefined}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SourceMaterialModule

