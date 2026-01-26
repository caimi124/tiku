/**
 * 模块视觉主题配置
 * 为不同模块（M02-M06）定义统一的视觉样式
 */

import { MapPin, Target, Blocks, Star, Zap, LucideIcon } from 'lucide-react'

export interface ModuleTheme {
  label: string
  accent: string
  card: string
  leftBar: string
  header: string
  softBg: string
  icon: LucideIcon
}

export const moduleTheme: Record<string, ModuleTheme> = {
  M02: {
    label: "定位 / Positioning",
    accent: "blue",
    card: "bg-white border border-gray-200",
    leftBar: "border-l-4 border-blue-500",
    header: "text-gray-900",
    softBg: "bg-blue-50/50",
    icon: MapPin,
  },
  M03: {
    label: "考法 / Exam Focus",
    accent: "green",
    card: "bg-white border border-gray-200",
    leftBar: "border-l-4 border-green-500",
    header: "text-gray-900",
    softBg: "bg-green-50/50",
    icon: Target,
  },
  M04: {
    label: "结构 / Structure",
    accent: "violet",
    card: "bg-white border border-gray-200",
    leftBar: "border-l-4 border-violet-500",
    header: "text-gray-900",
    softBg: "bg-violet-50/50",
    icon: Blocks,
  },
  M05: {
    label: "必背 / Must-Memorize",
    accent: "amber",
    card: "bg-amber-50/60 border border-amber-200",
    leftBar: "border-l-4 border-amber-500",
    header: "font-semibold text-gray-900",
    softBg: "bg-amber-50/70",
    icon: Star,
  },
  M06: {
    label: "秒杀规则 / Kill Rules",
    accent: "rose",
    card: "bg-rose-50/60 border border-rose-200",
    leftBar: "border-l-4 border-rose-500",
    header: "font-semibold text-gray-900",
    softBg: "bg-rose-50/70",
    icon: Zap,
  },
}

/**
 * 获取模块主题配置
 */
export function getModuleTheme(moduleCode: string): ModuleTheme {
  return moduleTheme[moduleCode] || {
    label: `模块 ${moduleCode}`,
    accent: "gray",
    card: "bg-white border border-gray-200",
    leftBar: "border-l-4 border-gray-300",
    header: "text-gray-900",
    softBg: "bg-gray-50/50",
    icon: Blocks,
  }
}
