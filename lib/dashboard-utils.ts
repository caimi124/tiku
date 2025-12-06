/**
 * Dashboard 相关的辅助函数
 * 
 * 从 route.ts 中提取出来，以便测试和复用
 */

/**
 * 计算总体掌握度
 */
export function calculateOverallMastery(
  masteredCount: number,
  reviewCount: number,
  weakCount: number,
  unlearnedCount: number
): number {
  const total = masteredCount + reviewCount + weakCount + unlearnedCount
  if (total === 0) return 0
  
  // 加权计算：已掌握100%，需复习70%，薄弱30%，未学习0%
  const weightedSum = masteredCount * 100 + reviewCount * 70 + weakCount * 30
  return Math.round(weightedSum / total)
}

/**
 * 统计薄弱点数量
 */
export function countWeakPoints(
  masteryData: Array<{ mastery_score: number }>
): number {
  return masteryData.filter(m => m.mastery_score > 0 && m.mastery_score < 60).length
}

/**
 * 统计已掌握点数量
 */
export function countMasteredPoints(
  masteryData: Array<{ mastery_score: number }>
): number {
  return masteryData.filter(m => m.mastery_score >= 80).length
}

/**
 * 统计总知识点数量
 */
export function countTotalPoints(
  masteryData: Array<{ mastery_score: number }>
): number {
  return masteryData.length
}
