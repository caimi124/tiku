/**
 * Property tests for SequentialLearning utilities
 * 
 * **Feature: knowledge-learning-path, Property 17: 顺序学习跳转正确性**
 * **Validates: Requirements 11.2**
 */

import fc from 'fast-check'

// Types
export interface LearningPosition {
  pointId: string
  pointTitle: string
  sectionId: string
  sectionTitle: string
  chapterId: string
  chapterTitle: string
  progress: number
  totalPoints: number
  completedPoints: number
  lastUpdated: string
}

export interface PointInfo {
  id: string
  title: string
  code: string
  sectionId: string
  chapterId: string
  isCompleted: boolean
  order: number
}

// Utility functions to test
export function findFirstIncompletePoint(points: PointInfo[]): PointInfo | null {
  // 按 order 排序
  const sorted = [...points].sort((a, b) => a.order - b.order)
  
  // 找到第一个未完成的考点
  return sorted.find(p => !p.isCompleted) || null
}

export function findNextPoint(points: PointInfo[], currentPointId: string): PointInfo | null {
  const sorted = [...points].sort((a, b) => a.order - b.order)
  const currentIndex = sorted.findIndex(p => p.id === currentPointId)
  
  if (currentIndex === -1 || currentIndex === sorted.length - 1) {
    return null
  }
  
  return sorted[currentIndex + 1]
}

export function calculateProgress(points: PointInfo[]): {
  totalPoints: number
  completedPoints: number
  progress: number
} {
  const totalPoints = points.length
  const completedPoints = points.filter(p => p.isCompleted).length
  const progress = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0
  
  return { totalPoints, completedPoints, progress }
}

export function generateSequentialUrl(pointId: string): string {
  return `/knowledge/point/${pointId}?mode=sequential`
}

export function isAllCompleted(points: PointInfo[]): boolean {
  return points.length > 0 && points.every(p => p.isCompleted)
}

export function validateLearningPosition(position: LearningPosition): boolean {
  if (!position.pointId || typeof position.pointId !== 'string') return false
  if (!position.pointTitle || typeof position.pointTitle !== 'string') return false
  if (typeof position.progress !== 'number' || position.progress < 0 || position.progress > 100) return false
  if (typeof position.totalPoints !== 'number' || position.totalPoints < 0) return false
  if (typeof position.completedPoints !== 'number' || position.completedPoints < 0) return false
  if (position.completedPoints > position.totalPoints) return false
  return true
}

// Arbitraries
const pointInfoArbitrary: fc.Arbitrary<PointInfo> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  code: fc.string({ minLength: 1, maxLength: 20 }),
  sectionId: fc.uuid(),
  chapterId: fc.uuid(),
  isCompleted: fc.boolean(),
  order: fc.integer({ min: 1, max: 1000 })
})

const pointsListArbitrary = fc.array(pointInfoArbitrary, { minLength: 0, maxLength: 20 })

const learningPositionArbitrary: fc.Arbitrary<LearningPosition> = fc.record({
  pointId: fc.uuid(),
  pointTitle: fc.string({ minLength: 1, maxLength: 100 }),
  sectionId: fc.uuid(),
  sectionTitle: fc.string({ minLength: 1, maxLength: 100 }),
  chapterId: fc.uuid(),
  chapterTitle: fc.string({ minLength: 1, maxLength: 100 }),
  progress: fc.integer({ min: 0, max: 100 }),
  totalPoints: fc.integer({ min: 0, max: 1000 }),
  completedPoints: fc.integer({ min: 0, max: 1000 }),
  lastUpdated: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }).map(d => d.toISOString())
}).filter(pos => pos.completedPoints <= pos.totalPoints)

describe('Property 17: 顺序学习跳转正确性', () => {
  /**
   * Feature: knowledge-learning-path, Property 17: 顺序学习跳转正确性
   * Validates: Requirements 11.2
   */

  it('"开始顺序学习"必须跳转到第一个未完成的考点', () => {
    fc.assert(
      fc.property(pointsListArbitrary, (points) => {
        const firstIncomplete = findFirstIncompletePoint(points)
        
        if (points.length === 0) {
          // 空列表返回 null
          return firstIncomplete === null
        }
        
        const hasIncomplete = points.some(p => !p.isCompleted)
        
        if (!hasIncomplete) {
          // 所有都完成了，返回 null
          return firstIncomplete === null
        }
        
        // 必须返回一个未完成的考点
        if (!firstIncomplete || firstIncomplete.isCompleted) return false
        
        // 必须是按顺序第一个未完成的
        const sorted = [...points].sort((a, b) => a.order - b.order)
        const firstInSorted = sorted.find(p => !p.isCompleted)
        
        return firstIncomplete.id === firstInSorted?.id
      }),
      { numRuns: 100 }
    )
  })

  it('顺序学习URL格式正确', () => {
    fc.assert(
      fc.property(fc.uuid(), (pointId) => {
        const url = generateSequentialUrl(pointId)
        return url === `/knowledge/point/${pointId}?mode=sequential`
      }),
      { numRuns: 100 }
    )
  })

  it('URL必须包含 mode=sequential 参数', () => {
    fc.assert(
      fc.property(fc.uuid(), (pointId) => {
        const url = generateSequentialUrl(pointId)
        return url.includes('mode=sequential')
      }),
      { numRuns: 100 }
    )
  })

  it('findNextPoint 返回当前考点的下一个考点', () => {
    fc.assert(
      fc.property(
        fc.array(pointInfoArbitrary, { minLength: 2, maxLength: 20 }),
        (points) => {
          // 确保有唯一的 order
          const uniqueOrders = new Set(points.map(p => p.order))
          if (uniqueOrders.size !== points.length) return true // 跳过重复 order 的情况
          
          const sorted = [...points].sort((a, b) => a.order - b.order)
          const currentPoint = sorted[0]
          const nextPoint = findNextPoint(points, currentPoint.id)
          
          if (sorted.length < 2) {
            return nextPoint === null
          }
          
          return nextPoint?.id === sorted[1].id
        }
      ),
      { numRuns: 100 }
    )
  })

  it('最后一个考点的 findNextPoint 返回 null', () => {
    fc.assert(
      fc.property(
        fc.array(pointInfoArbitrary, { minLength: 1, maxLength: 20 }),
        (points) => {
          const sorted = [...points].sort((a, b) => a.order - b.order)
          const lastPoint = sorted[sorted.length - 1]
          const nextPoint = findNextPoint(points, lastPoint.id)
          
          return nextPoint === null
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('进度计算正确性', () => {

  it('进度百分比在0-100范围内', () => {
    fc.assert(
      fc.property(pointsListArbitrary, (points) => {
        const { progress } = calculateProgress(points)
        return progress >= 0 && progress <= 100
      }),
      { numRuns: 100 }
    )
  })

  it('completedPoints 不超过 totalPoints', () => {
    fc.assert(
      fc.property(pointsListArbitrary, (points) => {
        const { totalPoints, completedPoints } = calculateProgress(points)
        return completedPoints <= totalPoints
      }),
      { numRuns: 100 }
    )
  })

  it('空列表进度为0', () => {
    const { progress, totalPoints, completedPoints } = calculateProgress([])
    expect(progress).toBe(0)
    expect(totalPoints).toBe(0)
    expect(completedPoints).toBe(0)
  })

  it('全部完成时进度为100', () => {
    fc.assert(
      fc.property(
        fc.array(pointInfoArbitrary.map(p => ({ ...p, isCompleted: true })), { minLength: 1, maxLength: 20 }),
        (points) => {
          const { progress } = calculateProgress(points)
          return progress === 100
        }
      ),
      { numRuns: 50 }
    )
  })

  it('全部未完成时进度为0', () => {
    fc.assert(
      fc.property(
        fc.array(pointInfoArbitrary.map(p => ({ ...p, isCompleted: false })), { minLength: 1, maxLength: 20 }),
        (points) => {
          const { progress } = calculateProgress(points)
          return progress === 0
        }
      ),
      { numRuns: 50 }
    )
  })
})

describe('学习位置验证', () => {

  it('有效的学习位置通过验证', () => {
    fc.assert(
      fc.property(learningPositionArbitrary, (position) => {
        return validateLearningPosition(position) === true
      }),
      { numRuns: 100 }
    )
  })

  it('completedPoints 超过 totalPoints 时验证失败', () => {
    const invalidPosition: LearningPosition = {
      pointId: 'test-id',
      pointTitle: 'Test',
      sectionId: 'section-id',
      sectionTitle: 'Section',
      chapterId: 'chapter-id',
      chapterTitle: 'Chapter',
      progress: 50,
      totalPoints: 10,
      completedPoints: 15, // 超过 totalPoints
      lastUpdated: new Date().toISOString()
    }
    expect(validateLearningPosition(invalidPosition)).toBe(false)
  })

  it('缺少 pointId 时验证失败', () => {
    const invalidPosition = {
      pointId: '',
      pointTitle: 'Test',
      sectionId: 'section-id',
      sectionTitle: 'Section',
      chapterId: 'chapter-id',
      chapterTitle: 'Chapter',
      progress: 50,
      totalPoints: 10,
      completedPoints: 5,
      lastUpdated: new Date().toISOString()
    } as LearningPosition
    expect(validateLearningPosition(invalidPosition)).toBe(false)
  })
})

describe('完成状态检测', () => {

  it('空列表返回 false', () => {
    expect(isAllCompleted([])).toBe(false)
  })

  it('全部完成返回 true', () => {
    fc.assert(
      fc.property(
        fc.array(pointInfoArbitrary.map(p => ({ ...p, isCompleted: true })), { minLength: 1, maxLength: 20 }),
        (points) => {
          return isAllCompleted(points) === true
        }
      ),
      { numRuns: 50 }
    )
  })

  it('有未完成的返回 false', () => {
    fc.assert(
      fc.property(
        fc.array(pointInfoArbitrary, { minLength: 1, maxLength: 20 }),
        (points) => {
          const hasIncomplete = points.some(p => !p.isCompleted)
          if (hasIncomplete) {
            return isAllCompleted(points) === false
          }
          return true
        }
      ),
      { numRuns: 50 }
    )
  })
})
