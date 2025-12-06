/**
 * 学习热力图相关的辅助函数
 * 
 * 从 route.ts 中提取出来，以便测试和复用
 */

/**
 * 根据学习时长获取热力图颜色等级
 */
export function getHeatmapColor(minutes: number): number {
  if (minutes === 0) return 0
  if (minutes < 15) return 1
  if (minutes < 30) return 2
  if (minutes < 60) return 3
  return 4
}

/**
 * 计算连续学习天数
 */
export function calculateStreak(
  dailyStats: Array<{ stat_date: string; study_duration: number }>
): number {
  if (!dailyStats || dailyStats.length === 0) return 0
  
  // 按日期降序排序
  const sorted = [...dailyStats].sort((a, b) => 
    new Date(b.stat_date).getTime() - new Date(a.stat_date).getTime()
  )
  
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < sorted.length; i++) {
    const statDate = new Date(sorted[i].stat_date)
    statDate.setHours(0, 0, 0, 0)
    
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)
    
    // 检查日期是否连续
    if (statDate.getTime() === expectedDate.getTime() && sorted[i].study_duration > 0) {
      streak++
    } else if (i === 0 && statDate.getTime() < expectedDate.getTime()) {
      // 今天还没学习，检查昨天
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      if (statDate.getTime() === yesterday.getTime() && sorted[i].study_duration > 0) {
        streak++
      } else {
        break
      }
    } else {
      break
    }
  }
  
  return streak
}
