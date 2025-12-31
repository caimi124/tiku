/**
 * 只看重点开关组件
 * 
 * 切换 Focus Mode，控制页面显示哪些板块
 */

'use client'

import { Switch } from '@/components/ui/switch'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FocusModeToggleProps {
  /** 是否开启 Focus Mode */
  enabled: boolean
  /** 切换回调 */
  onToggle: (enabled: boolean) => void
  /** 自定义类名 */
  className?: string
}

export function FocusModeToggle({
  enabled,
  onToggle,
  className,
}: FocusModeToggleProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 shadow-sm',
      className
    )}>
      <div className="flex items-center gap-2 flex-1">
        {enabled ? (
          <EyeOff className="w-5 h-5 text-gray-600" />
        ) : (
          <Eye className="w-5 h-5 text-gray-400" />
        )}
        <div>
          <div className="text-sm font-medium text-gray-900">只看重点</div>
          <div className="text-xs text-gray-500">Focus Mode</div>
        </div>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        aria-label="切换只看重点模式"
      />
    </div>
  )
}

export default FocusModeToggle

