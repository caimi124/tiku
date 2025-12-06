/**
 * 复习推荐相关的辅助函数
 * 
 * 从 route.ts 中提取出来，以便测试和复用
 */

import { getNextReviewDate } from '@/lib/mastery'

/**
 * 判断是否需要今日复习（基于艾宾浩斯遗忘曲线）
 * 
 * Property 13: 到期需要复习的考点必须出现在今日推荐列表中
 */
export function shouldReviewToday(
  masteryScore: number,
  lastReviewDate: Date | null
): boolean {
  if (!lastReviewDate) return true // 从未复习过，需要复习
  
  const review = getNextReviewDate(masteryScore, lastReviewDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const nextReview = new Date(review.nextReviewDate)
  nextReview.setHours(0, 0, 0, 0)
  
  return nextReview <= today
}

/**
 * 计算距离上次复习的天数
 */
export function daysSinceLastReview(lastReviewDate: Date | null): number {
  if (!lastReviewDate) return 999 // 从未复习
  
  const now = new Date()
  const diffTime = now.getTime() - lastReviewDate.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * 获取掌握状态
 */
export function getMasteryStatusInfo(score: number): { status: 'mastered' | 'review' | 'weak' | 'unlearned'; text: string } {
  if (score >= 80) return { status: 'mastered', text: '已掌握' }
  if (score >= 60) return { status: 'review', text: '需复习' }
  if (score > 0) return { status: 'weak', text: '薄弱' }
  return { status: 'unlearned', text: '未学习' }
}

/**
 * 格式化日期为相对时间
 */
export function formatRelativeTime(date: Date | null): string {
  if (!date) return '从未'
  
  const days = daysSinceLastReview(date)
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return `${Math.floor(days / 30)}月前`
}
