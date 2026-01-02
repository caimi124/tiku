/**
 * 全站考点配置入口
 * 
 * 集中管理所有考点的页面配置，按 pointId 查询
 * 使用 TypeScript 导入确保类型安全和 tree-shaking
 */

import type { PointPageConfig } from '../pointPage.types'
import { e75562a4_config } from './e75562a4'

export const POINT_CONFIGS: Record<string, PointPageConfig> = {
  'e75562a4-d0d9-491d-b7a0-837c3224e8d7': e75562a4_config,
}

/**
 * 获取考点配置
 */
export function getPointConfig(pointId: string): PointPageConfig | null {
  return POINT_CONFIGS[pointId] || null
}

/**
 * 检查是否有配置
 */
export function hasPointConfig(pointId: string): boolean {
  return pointId in POINT_CONFIGS
}

