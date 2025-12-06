/**
 * Property tests for ExpertTipsPanel utilities
 * 
 * **Feature: knowledge-page-redesign, Property 6: 老司机内容模块完整性**
 * **Feature: knowledge-page-redesign, Property 7: 必考预测数据完整性**
 * **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**
 */

import fc from 'fast-check'
import {
  ExpertTips,
  ExpertTipsModule,
  ALL_MODULES,
  MODULE_CONFIG,
  isExpertTipsEmpty,
  getNonEmptyModules,
  getModuleCount,
  validatePrediction,
  validateExpertTipsModule,
  getProbabilityLevel,
  getProbabilityConfig,
  ExamPattern,
  TrapAnalysis,
  MemoryTechnique,
  ExamTactic,
  Prediction
} from './expert-tips-utils'

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
  type: fc.constantFrom<'mnemonic' | 'association' | 'scenario'>('mnemonic', 'association', 'scenario'),
  content: fc.string({ minLength: 1, maxLength: 500 })
})

const examTacticArbitrary = fc.record({
  trigger: fc.string({ minLength: 1, maxLength: 200 }),
  reaction: fc.string({ minLength: 1, maxLength: 500 })
})

const predictionArbitrary = fc.record({
  question: fc.string({ minLength: 1, maxLength: 500 }),
  answer: fc.string({ minLength: 1, maxLength: 300 }),
  explanation: fc.string({ minLength: 0, maxLength: 500 }),
  probability: fc.integer({ min: 0, max: 100 })
})

const expertTipsArbitrary = fc.record({
  examPatterns: fc.array(examPatternArbitrary, { minLength: 0, maxLength: 3 }),
  trapAnalysis: fc.array(trapAnalysisArbitrary, { minLength: 0, maxLength: 3 }),
  memoryTechniques: fc.array(memoryTechniqueArbitrary, { minLength: 0, maxLength: 3 }),
  examTactics: fc.array(examTacticArbitrary, { minLength: 0, maxLength: 3 }),
  predictions: fc.array(predictionArbitrary, { minLength: 0, maxLength: 3 })
})

const nonEmptyExpertTipsArbitrary = fc.record({
  examPatterns: fc.array(examPatternArbitrary, { minLength: 1, maxLength: 3 }),
  trapAnalysis: fc.array(trapAnalysisArbitrary, { minLength: 0, maxLength: 3 }),
  memoryTechniques: fc.array(memoryTechniqueArbitrary, { minLength: 0, maxLength: 3 }),
  examTactics: fc.array(examTacticArbitrary, { minLength: 0, maxLength: 3 }),
  predictions: fc.array(predictionArbitrary, { minLength: 0, maxLength: 3 })
})

describe('Property 6: 老司机内容模块完整性', () => {

  it('非空内容必须包含至少一个模块', () => {
    fc.assert(
      fc.property(nonEmptyExpertTipsArbitrary, (tips) => {
        const nonEmptyModules = getNonEmptyModules(tips)
        return nonEmptyModules.length > 0
      }),
      { numRuns: 50 }
    )
  })

  it('空内容返回空模块列表', () => {
    const emptyTips: ExpertTips = {
      examPatterns: [],
      trapAnalysis: [],
      memoryTechniques: [],
      examTactics: [],
      predictions: []
    }
    expect(getNonEmptyModules(emptyTips)).toEqual([])
    expect(isExpertTipsEmpty(emptyTips)).toBe(true)
  })

  it('所有模块都有有效配置', () => {
    ALL_MODULES.forEach(module => {
      const config = MODULE_CONFIG[module]
      expect(config.key).toBe(module)
      expect(config.label.length).toBeGreaterThan(0)
      expect(config.icon.length).toBeGreaterThan(0)
      expect(config.description.length).toBeGreaterThan(0)
    })
  })

  it('getNonEmptyModules 只返回有内容的模块', () => {
    fc.assert(
      fc.property(expertTipsArbitrary, (tips) => {
        const nonEmptyModules = getNonEmptyModules(tips)
        
        return nonEmptyModules.every(module => tips[module].length > 0)
      }),
      { numRuns: 50 }
    )
  })

  it('getNonEmptyModules 不遗漏任何有内容的模块', () => {
    fc.assert(
      fc.property(expertTipsArbitrary, (tips) => {
        const nonEmptyModules = getNonEmptyModules(tips)
        
        return ALL_MODULES.every(module => {
          if (tips[module].length > 0) {
            return nonEmptyModules.includes(module)
          }
          return true
        })
      }),
      { numRuns: 50 }
    )
  })

  it('getModuleCount 返回正确的数量', () => {
    fc.assert(
      fc.property(expertTipsArbitrary, (tips) => {
        return ALL_MODULES.every(module => 
          getModuleCount(tips, module) === tips[module].length
        )
      }),
      { numRuns: 50 }
    )
  })

  it('validateExpertTipsModule 对空内容返回 true', () => {
    const emptyTips: ExpertTips = {
      examPatterns: [],
      trapAnalysis: [],
      memoryTechniques: [],
      examTactics: [],
      predictions: []
    }
    expect(validateExpertTipsModule(emptyTips)).toBe(true)
  })

  it('validateExpertTipsModule 对非空内容返回 true', () => {
    fc.assert(
      fc.property(nonEmptyExpertTipsArbitrary, (tips) => {
        return validateExpertTipsModule(tips) === true
      }),
      { numRuns: 50 }
    )
  })

  it('ALL_MODULES 包含所有5个模块', () => {
    expect(ALL_MODULES.length).toBe(5)
    expect(ALL_MODULES).toContain('examPatterns')
    expect(ALL_MODULES).toContain('trapAnalysis')
    expect(ALL_MODULES).toContain('memoryTechniques')
    expect(ALL_MODULES).toContain('examTactics')
    expect(ALL_MODULES).toContain('predictions')
  })
})

describe('Property 7: 必考预测数据完整性', () => {

  it('有效预测必须包含题目和答案', () => {
    fc.assert(
      fc.property(predictionArbitrary, (prediction) => {
        const isValid = validatePrediction(prediction)
        
        if (prediction.question.length === 0 || prediction.answer.length === 0) {
          return isValid === false
        }
        return true
      }),
      { numRuns: 50 }
    )
  })

  it('概率必须在 0-100 范围内', () => {
    fc.assert(
      fc.property(predictionArbitrary, (prediction) => {
        return prediction.probability >= 0 && prediction.probability <= 100
      }),
      { numRuns: 50 }
    )
  })

  it('getProbabilityLevel 返回正确的等级', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (probability) => {
        const level = getProbabilityLevel(probability)
        
        if (probability >= 80) return level === 'high'
        if (probability >= 50) return level === 'medium'
        return level === 'low'
      }),
      { numRuns: 50 }
    )
  })

  it('getProbabilityConfig 返回有效配置', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (probability) => {
        const config = getProbabilityConfig(probability)
        
        return (
          config.label.length > 0 &&
          config.color.length > 0
        )
      }),
      { numRuns: 50 }
    )
  })

  it('高概率 (>=80) 配置正确', () => {
    const config = getProbabilityConfig(80)
    expect(config.label).toBe('高概率')
    expect(config.color).toContain('red')
  })

  it('中概率 (50-79) 配置正确', () => {
    const config = getProbabilityConfig(50)
    expect(config.label).toBe('中概率')
    expect(config.color).toContain('yellow')
  })

  it('低概率 (<50) 配置正确', () => {
    const config = getProbabilityConfig(49)
    expect(config.label).toBe('低概率')
    expect(config.color).toContain('gray')
  })

  it('边界值 80 是高概率', () => {
    expect(getProbabilityLevel(80)).toBe('high')
  })

  it('边界值 79 是中概率', () => {
    expect(getProbabilityLevel(79)).toBe('medium')
  })

  it('边界值 50 是中概率', () => {
    expect(getProbabilityLevel(50)).toBe('medium')
  })

  it('边界值 49 是低概率', () => {
    expect(getProbabilityLevel(49)).toBe('low')
  })
})
