/**
 * 复习队列优先级更新 - 属性测试
 *
 * **Feature: smart-learning-system, Property 12: 复习队列优先级更新**
 * **Validates: Requirements 4.4**
 * 
 * Property 12: 复习队列优先级更新
 * *For any* 标记为"需复习"的考点，该考点必须出现在复习队列中，
 * 且优先级根据掌握度和重要性正确计算。
 */

import * as fc from 'fast-check'
import { calculateReviewPriority } from '@/lib/mastery'

// ============================================
// 类型定义
// ============================================

interface ReviewQueueItem {
  knowledge_point_id: string
  user_id: string
  priority: number
  added_at: Date
}

interface KnowledgePoint {
  id: string
  title: string
  importance: number
  mastery_score: number
  last_review_at: Date | null
}

// ============================================
// 模拟复习队列操作
// ============================================

class MockReviewQueue {
  private queue: Map<string, ReviewQueueItem> = new Map()

  /**
   * 添加到复习队列
   */
  addToQueue(
    knowledgePointId: string,
    userId: string,
    masteryScore: number,
    importance: number,
    daysSinceReview: number
  ): ReviewQueueItem {
    const priority = calculateReviewPriority(masteryScore, importance, daysSinceReview)
    const key = `${knowledgePointId}-${userId}`
    
    const item: ReviewQueueItem = {
      knowledge_point_id: knowledgePointId,
      user_id: userId,
      priority,
      added_at: new Date(),
    }
    
    this.queue.set(key, item)
    return item
  }

  /**
   * 检查是否在队列中
   */
  isInQueue(knowledgePointId: string, userId: string): boolean {
    const key = `${knowledgePointId}-${userId}`
    return this.queue.has(key)
  }

  /**
   * 获取队列项
   */
  getItem(knowledgePointId: string, userId: string): ReviewQueueItem | undefined {
    const key = `${knowledgePointId}-${userId}`
    return this.queue.get(key)
  }

  /**
   * 获取按优先级排序的队列
   */
  getSortedQueue(userId: string): ReviewQueueItem[] {
    return Array.from(this.queue.values())
      .filter(item => item.user_id === userId)
      .sort((a, b) => b.priority - a.priority)
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue.clear()
  }
}

// ============================================
// 生成器定义
// ============================================

const idArb = fc.uuid()
const userIdArb = fc.uuid()
const masteryScoreArb = fc.integer({ min: 0, max: 100 })
const importanceArb = fc.integer({ min: 1, max: 5 })
const daysArb = fc.integer({ min: 0, max: 365 })

const knowledgePointArb: fc.Arbitrary<KnowledgePoint> = fc.record({
  id: idArb,
  title: fc.string({ minLength: 1, maxLength: 50 }),
  importance: importanceArb,
  mastery_score: masteryScoreArb,
  last_review_at: fc.option(fc.date({ min: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), max: new Date() }), { nil: null }),
})

// ============================================
// Property 12: 复习队列优先级更新
// ============================================

describe('Property 12: 复习队列优先级更新', () => {
  let queue: MockReviewQueue

  beforeEach(() => {
    queue = new MockReviewQueue()
  })

  /**
   * 测试：标记为需复习的考点必须出现在复习队列中
   */
  test('标记为需复习的考点必须出现在复习队列中', () => {
    fc.assert(
      fc.property(
        idArb,
        userIdArb,
        masteryScoreArb,
        importanceArb,
        daysArb,
        (pointId, userId, mastery, importance, days) => {
          queue.addToQueue(pointId, userId, mastery, importance, days)
          return queue.isInQueue(pointId, userId) === true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：优先级在有效范围内 (0-100)
   */
  test('优先级在有效范围内', () => {
    fc.assert(
      fc.property(
        idArb,
        userIdArb,
        masteryScoreArb,
        importanceArb,
        daysArb,
        (pointId, userId, mastery, importance, days) => {
          const item = queue.addToQueue(pointId, userId, mastery, importance, days)
          return item.priority >= 0 && item.priority <= 100
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：掌握度越低，优先级越高
   */
  test('掌握度越低，优先级越高', () => {
    fc.assert(
      fc.property(
        idArb,
        userIdArb,
        masteryScoreArb,
        masteryScoreArb,
        importanceArb,
        daysArb,
        (pointId, userId, mastery1, mastery2, importance, days) => {
          const lowMastery = Math.min(mastery1, mastery2)
          const highMastery = Math.max(mastery1, mastery2)
          
          const priorityLow = calculateReviewPriority(lowMastery, importance, days)
          const priorityHigh = calculateReviewPriority(highMastery, importance, days)
          
          return priorityLow >= priorityHigh
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：重要性越高，优先级越高
   */
  test('重要性越高，优先级越高', () => {
    fc.assert(
      fc.property(
        idArb,
        userIdArb,
        masteryScoreArb,
        importanceArb,
        importanceArb,
        daysArb,
        (pointId, userId, mastery, imp1, imp2, days) => {
          const lowImp = Math.min(imp1, imp2)
          const highImp = Math.max(imp1, imp2)
          
          const priorityLow = calculateReviewPriority(mastery, lowImp, days)
          const priorityHigh = calculateReviewPriority(mastery, highImp, days)
          
          return priorityHigh >= priorityLow
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：距离上次复习时间越长，优先级越高
   */
  test('距离上次复习时间越长，优先级越高', () => {
    fc.assert(
      fc.property(
        idArb,
        userIdArb,
        masteryScoreArb,
        importanceArb,
        daysArb,
        daysArb,
        (pointId, userId, mastery, importance, days1, days2) => {
          const shortDays = Math.min(days1, days2)
          const longDays = Math.max(days1, days2)
          
          const priorityShort = calculateReviewPriority(mastery, importance, shortDays)
          const priorityLong = calculateReviewPriority(mastery, importance, longDays)
          
          return priorityLong >= priorityShort
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：相同输入产生相同优先级
   */
  test('相同输入产生相同优先级', () => {
    fc.assert(
      fc.property(
        masteryScoreArb,
        importanceArb,
        daysArb,
        (mastery, importance, days) => {
          const priority1 = calculateReviewPriority(mastery, importance, days)
          const priority2 = calculateReviewPriority(mastery, importance, days)
          return priority1 === priority2
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：队列按优先级正确排序
   */
  test('队列按优先级正确排序', () => {
    fc.assert(
      fc.property(
        userIdArb,
        fc.array(fc.tuple(idArb, masteryScoreArb, importanceArb, daysArb), { minLength: 2, maxLength: 10 }),
        (userId, items) => {
          // 添加多个项目到队列
          items.forEach(([pointId, mastery, importance, days]) => {
            queue.addToQueue(pointId, userId, mastery, importance, days)
          })
          
          // 获取排序后的队列
          const sorted = queue.getSortedQueue(userId)
          
          // 验证按优先级降序排列
          for (let i = 1; i < sorted.length; i++) {
            if (sorted[i - 1].priority < sorted[i].priority) {
              return false
            }
          }
          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * 测试：重复添加同一考点会更新优先级
   */
  test('重复添加同一考点会更新优先级', () => {
    fc.assert(
      fc.property(
        idArb,
        userIdArb,
        masteryScoreArb,
        masteryScoreArb,
        importanceArb,
        daysArb,
        (pointId, userId, mastery1, mastery2, importance, days) => {
          // 第一次添加
          queue.addToQueue(pointId, userId, mastery1, importance, days)
          
          // 第二次添加（不同掌握度）
          const item = queue.addToQueue(pointId, userId, mastery2, importance, days)
          
          // 验证优先级是基于最新的掌握度计算的
          const expectedPriority = calculateReviewPriority(mastery2, importance, days)
          return item.priority === expectedPriority
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// 边界情况测试
// ============================================

describe('边界情况测试', () => {
  test('掌握度为0时优先级最高', () => {
    const priority0 = calculateReviewPriority(0, 5, 30)
    const priority100 = calculateReviewPriority(100, 5, 30)
    expect(priority0).toBeGreaterThan(priority100)
  })

  test('重要性为5星时优先级较高', () => {
    const priority5 = calculateReviewPriority(50, 5, 10)
    const priority1 = calculateReviewPriority(50, 1, 10)
    expect(priority5).toBeGreaterThan(priority1)
  })

  test('30天未复习时优先级较高', () => {
    const priority30 = calculateReviewPriority(50, 3, 30)
    const priority0 = calculateReviewPriority(50, 3, 0)
    expect(priority30).toBeGreaterThan(priority0)
  })

  test('极端情况：全部最低值', () => {
    const priority = calculateReviewPriority(100, 1, 0)
    expect(priority).toBeGreaterThanOrEqual(0)
    expect(priority).toBeLessThanOrEqual(100)
  })

  test('极端情况：全部最高值', () => {
    const priority = calculateReviewPriority(0, 5, 365)
    expect(priority).toBeGreaterThanOrEqual(0)
    expect(priority).toBeLessThanOrEqual(100)
  })
})
