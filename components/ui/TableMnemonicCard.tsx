/**
 * 表格后口诀卡片组件
 * 
 * 显示在表格底部的小卡片，包含口诀内容
 */

'use client'

import { Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatAbbreviations } from '@/lib/abbreviations'

export interface TableMnemonicCardProps {
  mnemonic: string
  className?: string
}

export function TableMnemonicCard({ mnemonic, className = '' }: TableMnemonicCardProps) {
  if (!mnemonic) return null

  // 格式化缩写
  const formattedMnemonic = formatAbbreviations(mnemonic)

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200',
      className
    )}>
      <Brain className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-amber-800 leading-relaxed flex-1">
        {formattedMnemonic}
      </p>
    </div>
  )
}

export default TableMnemonicCard
