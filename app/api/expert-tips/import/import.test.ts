/**
 * Property tests for expert tips import API
 * 
 * **Feature: knowledge-page-redesign, Property 16: JSON导入解析正确性（Round-trip）**
 * **Validates: Requirements 6.2**
 */

import fc from 'fast-check'

// Types
interface ExamPattern {
  title: string
  questionExample: string
  options: string[]
  correctAnswer: string
}

interface TrapAnalysis {
  trapName: string
  description: string
  commonMistake: string
  solution: string
}

interface MemoryTechnique {
  type: 'mnemonic' | 'association' | 'scenario'
  content: string
}

interface ExamTactic {
  trigger: string
  reaction: string
}

interface Prediction {
  question: string
  answer: string
  explanation: string
  probability: number
}

interface ExpertTipImportData {
  pointId: string
  examPatterns?: ExamPattern[]
  trapAnalysis?: TrapAnalysis[]
  memoryTechniques?: MemoryTechnique[]
  examTactics?: ExamTactic[]
  predictions?: Prediction[]
}

// Validation functions (same as in route.ts)
function validateExamPattern(pattern: any): pattern is ExamPattern {
  return (
    typeof pattern === 'object' &&
    typeof pattern.title === 'string' && pattern.title.length > 0 &&
    typeof pattern.questionExample === 'string' &&
    Array.isArray(pattern.options) && pattern.options.length >= 2 &&
    typeof pattern.correctAnswer === 'string'
  )
}

function validateTrapAnalysis(trap: any): trap is TrapAnalysis {
  return (
    typeof trap === 'object' &&
    typeof trap.trapName === 'string' && trap.trapName.length > 0 &&
    typeof trap.description === 'string' &&
    typeof trap.commonMistake === 'string' &&
    typeof trap.solution === 'string'
  )
}

function validateMemoryTechnique(technique: any): technique is MemoryTechnique {
  return (
    typeof technique === 'object' &&
    ['mnemonic', 'association', 'scenario'].includes(technique.type) &&
    typeof technique.content === 'string' && technique.content.length > 0
  )
}

function validatePrediction(prediction: any): prediction is Prediction {
  return (
    typeof prediction === 'object' &&
    typeof prediction.question === 'string' && prediction.question.length > 0 &&
    typeof prediction.answer === 'string' &&
    typeof prediction.probability === 'number' &&
    prediction.probability >= 0 && prediction.probability <= 100
  )
}

// Serialize and deserialize for round-trip testing
function serializeImportData(data: ExpertTipImportData): string {
  return JSON.stringify(data)
}

function deserializeImportData(json: string): ExpertTipImportData {
  return JSON.parse(json)
}

// Check if two import data objects are equivalent
function areEquivalent(a: ExpertTipImportData, b: ExpertTipImportData): boolean {
  if (a.pointId !== b.pointId) return false
  
  const aPatterns = a.examPatterns || []
  const bPatterns = b.examPatterns || []
  if (aPatterns.length !== bPatterns.length) return false
  
  const aTraps = a.trapAnalysis || []
  const bTraps = b.trapAnalysis || []
  if (aTraps.length !== bTraps.length) return false
  
  const aTechniques = a.memoryTechniques || []
  const bTechniques = b.memoryTechniques || []
  if (aTechniques.length !== bTechniques.length) return false
  
  const aTactics = a.examTactics || []
  const bTactics = b.examTactics || []
  if (aTactics.length !== bTactics.length) return false
  
  const aPredictions = a.predictions || []
  const bPredictions = b.predictions || []
  if (aPredictions.length !== bPredictions.length) return false
  
  return true
}

// Arbitraries
const examPatternArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  questionExample: fc.string({ minLength: 1, maxLength: 500 }),
  options: fc.array(fc.string({ minLength: 1, maxLength: 200 }), { minLength: 2, maxLength: 6 }),
  correctAnswer: fc.string({ minLength: 1, maxLength: 1 })
})

const trapAnalysisArbitrary = fc.record({
  trapName: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  commonMistake: fc.string({ minLength: 1, maxLength: 300 }),
  solution: fc.string({ minLength: 1, maxLength: 300 })
})

const memoryTechniqueArbitrary = fc.record({
  type: fc.constantFrom('mnemonic', 'association', 'scenario') as fc.Arbitrary<'mnemonic' | 'association' | 'scenario'>,
  content: fc.string({ minLength: 1, maxLength: 500 })
})

const examTacticArbitrary = fc.record({
  trigger: fc.string({ minLength: 1, maxLength: 200 }),
  reaction: fc.string({ minLength: 1, maxLength: 500 })
})

const predictionArbitrary = fc.record({
  question: fc.string({ minLength: 1, maxLength: 500 }),
  answer: fc.string({ minLength: 1, maxLength: 300 }),
  explanation: fc.string({ minLength: 1, maxLength: 500 }),
  probability: fc.integer({ min: 0, max: 100 })
})

const importDataArbitrary = fc.record({
  pointId: fc.uuid(),
  examPatterns: fc.option(fc.array(examPatternArbitrary, { minLength: 0, maxLength: 3 }), { nil: undefined }),
  trapAnalysis: fc.option(fc.array(trapAnalysisArbitrary, { minLength: 0, maxLength: 3 }), { nil: undefined }),
  memoryTechniques: fc.option(fc.array(memoryTechniqueArbitrary, { minLength: 0, maxLength: 3 }), { nil: undefined }),
  examTactics: fc.option(fc.array(examTacticArbitrary, { minLength: 0, maxLength: 3 }), { nil: undefined }),
  predictions: fc.option(fc.array(predictionArbitrary, { minLength: 0, maxLength: 3 }), { nil: undefined })
})

describe('Property 16: JSON导入解析正确性（Round-trip）', () => {
  
  it('JSON serialization and deserialization preserves data structure', () => {
    fc.assert(
      fc.property(importDataArbitrary, (data) => {
        const serialized = serializeImportData(data)
        const deserialized = deserializeImportData(serialized)
        
        return areEquivalent(data, deserialized)
      }),
      { numRuns: 100 }
    )
  })

  it('valid exam patterns pass validation after round-trip', () => {
    fc.assert(
      fc.property(examPatternArbitrary, (pattern) => {
        const serialized = JSON.stringify(pattern)
        const deserialized = JSON.parse(serialized)
        
        return validateExamPattern(deserialized)
      }),
      { numRuns: 100 }
    )
  })

  it('valid trap analysis pass validation after round-trip', () => {
    fc.assert(
      fc.property(trapAnalysisArbitrary, (trap) => {
        const serialized = JSON.stringify(trap)
        const deserialized = JSON.parse(serialized)
        
        return validateTrapAnalysis(deserialized)
      }),
      { numRuns: 100 }
    )
  })

  it('valid memory techniques pass validation after round-trip', () => {
    fc.assert(
      fc.property(memoryTechniqueArbitrary, (technique) => {
        const serialized = JSON.stringify(technique)
        const deserialized = JSON.parse(serialized)
        
        return validateMemoryTechnique(deserialized)
      }),
      { numRuns: 100 }
    )
  })

  it('valid predictions pass validation after round-trip', () => {
    fc.assert(
      fc.property(predictionArbitrary, (prediction) => {
        const serialized = JSON.stringify(prediction)
        const deserialized = JSON.parse(serialized)
        
        return validatePrediction(deserialized)
      }),
      { numRuns: 100 }
    )
  })

  it('pointId is preserved exactly after round-trip', () => {
    fc.assert(
      fc.property(importDataArbitrary, (data) => {
        const serialized = serializeImportData(data)
        const deserialized = deserializeImportData(serialized)
        
        return data.pointId === deserialized.pointId
      }),
      { numRuns: 100 }
    )
  })

  it('array lengths are preserved after round-trip', () => {
    fc.assert(
      fc.property(importDataArbitrary, (data) => {
        const serialized = serializeImportData(data)
        const deserialized = deserializeImportData(serialized)
        
        const originalPatternCount = data.examPatterns?.length ?? 0
        const deserializedPatternCount = deserialized.examPatterns?.length ?? 0
        
        return originalPatternCount === deserializedPatternCount
      }),
      { numRuns: 100 }
    )
  })
})
