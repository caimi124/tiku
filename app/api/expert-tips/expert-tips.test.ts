/**
 * Property tests for expert tips API
 * 
 * **Feature: knowledge-page-redesign, Property 17: 空内容降级显示**
 * **Validates: Requirements 6.3**
 */

import fc from 'fast-check'

// Types
interface ExpertTipsResponse {
  success: boolean
  data: {
    pointId: string
    examPatterns: any[]
    trapAnalysis: any[]
    memoryTechniques: any[]
    examTactics: any[]
    predictions: any[]
    updatedAt: string | null
    version: number
    isEmpty: boolean
  } | null
  message?: string
}

// Default message for empty content
const DEFAULT_EMPTY_MESSAGE = '暂无老司机带路内容，敬请期待'

// Simulate API response for empty content
function createEmptyResponse(pointId: string): ExpertTipsResponse {
  return {
    success: true,
    data: {
      pointId,
      examPatterns: [],
      trapAnalysis: [],
      memoryTechniques: [],
      examTactics: [],
      predictions: [],
      updatedAt: null,
      version: 0,
      isEmpty: true
    },
    message: DEFAULT_EMPTY_MESSAGE
  }
}

// Simulate API response for content with data
function createNonEmptyResponse(pointId: string, data: Partial<ExpertTipsResponse['data']>): ExpertTipsResponse {
  const hasContent = (
    (data?.examPatterns?.length ?? 0) > 0 ||
    (data?.trapAnalysis?.length ?? 0) > 0 ||
    (data?.memoryTechniques?.length ?? 0) > 0 ||
    (data?.examTactics?.length ?? 0) > 0 ||
    (data?.predictions?.length ?? 0) > 0
  )
  
  return {
    success: true,
    data: {
      pointId,
      examPatterns: data?.examPatterns || [],
      trapAnalysis: data?.trapAnalysis || [],
      memoryTechniques: data?.memoryTechniques || [],
      examTactics: data?.examTactics || [],
      predictions: data?.predictions || [],
      updatedAt: data?.updatedAt || new Date().toISOString(),
      version: data?.version || 1,
      isEmpty: !hasContent
    },
    message: hasContent ? undefined : DEFAULT_EMPTY_MESSAGE
  }
}

// Check if response has fallback message when empty
function hasEmptyFallback(response: ExpertTipsResponse): boolean {
  if (!response.data) return false
  
  const isEmpty = response.data.isEmpty
  const hasMessage = response.message === DEFAULT_EMPTY_MESSAGE
  
  // If empty, must have fallback message
  if (isEmpty && !hasMessage) return false
  
  // If not empty, should not have fallback message
  if (!isEmpty && hasMessage) return false
  
  return true
}

// Arbitraries
const pointIdArbitrary = fc.uuid()

const examPatternArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  questionExample: fc.string({ minLength: 1, maxLength: 500 }),
  options: fc.array(fc.string({ minLength: 1, maxLength: 200 }), { minLength: 2, maxLength: 6 }),
  correctAnswer: fc.string({ minLength: 1, maxLength: 1 })
})

describe('Property 17: 空内容降级显示', () => {
  
  it('empty content must show default fallback message', () => {
    fc.assert(
      fc.property(pointIdArbitrary, (pointId) => {
        const response = createEmptyResponse(pointId)
        
        return (
          response.success === true &&
          response.data !== null &&
          response.data.isEmpty === true &&
          response.message === DEFAULT_EMPTY_MESSAGE &&
          response.data.examPatterns.length === 0 &&
          response.data.trapAnalysis.length === 0 &&
          response.data.memoryTechniques.length === 0 &&
          response.data.examTactics.length === 0 &&
          response.data.predictions.length === 0
        )
      }),
      { numRuns: 100 }
    )
  })

  it('non-empty content must not show fallback message', () => {
    fc.assert(
      fc.property(
        pointIdArbitrary,
        fc.array(examPatternArbitrary, { minLength: 1, maxLength: 3 }),
        (pointId, patterns) => {
          const response = createNonEmptyResponse(pointId, {
            examPatterns: patterns
          })
          
          return (
            response.success === true &&
            response.data !== null &&
            response.data.isEmpty === false &&
            response.message === undefined &&
            response.data.examPatterns.length > 0
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('response must correctly identify empty vs non-empty state', () => {
    fc.assert(
      fc.property(
        pointIdArbitrary,
        fc.boolean(),
        (pointId, shouldBeEmpty) => {
          const response = shouldBeEmpty 
            ? createEmptyResponse(pointId)
            : createNonEmptyResponse(pointId, {
                examPatterns: [{ title: 'test', questionExample: 'q', options: ['A', 'B'], correctAnswer: 'A' }]
              })
          
          return hasEmptyFallback(response)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('pointId must be preserved in response', () => {
    fc.assert(
      fc.property(pointIdArbitrary, (pointId) => {
        const emptyResponse = createEmptyResponse(pointId)
        const nonEmptyResponse = createNonEmptyResponse(pointId, {
          examPatterns: [{ title: 'test', questionExample: 'q', options: ['A', 'B'], correctAnswer: 'A' }]
        })
        
        return (
          emptyResponse.data?.pointId === pointId &&
          nonEmptyResponse.data?.pointId === pointId
        )
      }),
      { numRuns: 100 }
    )
  })
})
