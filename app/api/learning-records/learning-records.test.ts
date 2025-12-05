/**
 * 答题记录完整性 - 属性测试
 *
 * **Feature: smart-learning-system, Property 5: 答题记录完整性**
 * **Validates: Requirements 2.1**
 *
 * Property 5: 答题记录完整性
 * *For any* 用户提交的答题记录，系统存储的数据必须包含：
 * 考点ID、是否正确、答题用时、答题时间戳。
 */

import * as fc from 'fast-check'

// ============================================
// 类型定义
// ============================================

interface LearningRecordInput {
  userId: string
  knowledgePointId: string
  questionId?: string
  contentItem?: string
  isCorrect: boolean
  timeSpent: number
}

interface LearningRecord {
  id: string
  user_id: string
  knowledge_point_id: string
  question_id?: string
  content_item?: string
  is_correct: boolean
  time_spent: number
  created_at: string
}

interface ValidationResult {
  isValid: boolean
  hasKnowledgePointId: boolean
  hasIsCorrect: boolean
  hasTimeSpent: boolean
  hasCreatedAt: boolean
  errors: string[]
}

// ============================================
// 验证函数
// ============================================

/**
 * 验证学习记录输入是否完整
 */
function validateRecordInput(input: LearningRecordInput): ValidationResult {
  const errors: string[] = []

  const hasKnowledgePointId =
    typeof input.knowledgePointId === 'string' && input.knowledgePointId.length > 0
  if (!hasKnowledgePointId) {
    errors.push('缺少考点ID')
  }

  const hasIsCorrect = typeof input.isCorrect === 'boolean'
  if (!hasIsCorrect) {
    errors.push('缺少是否正确字段')
  }

  const hasTimeSpent = typeof input.timeSpent === 'number' && input.timeSpent >= 0
  if (!hasTimeSpent) {
    errors.push('缺少或无效的答题用时')
  }

  // 时间戳在创建时自动生成
  const hasCreatedAt = true

  return {
    isValid: hasKnowledgePointId && hasIsCorrect && hasTimeSpent,
    hasKnowledgePointId,
    hasIsCorrect,
    hasTimeSpent,
    hasCreatedAt,
    errors,
  }
}

/**
 * 验证存储的学习记录是否完整
 */
function validateStoredRecord(record: LearningRecord): ValidationResult {
  const errors: string[] = []

  const hasKnowledgePointId =
    typeof record.knowledge_point_id === 'string' && record.knowledge_point_id.length > 0
  if (!hasKnowledgePointId) {
    errors.push('存储记录缺少考点ID')
  }

  const hasIsCorrect = typeof record.is_correct === 'boolean'
  if (!hasIsCorrect) {
    errors.push('存储记录缺少是否正确字段')
  }

  const hasTimeSpent = typeof record.time_spent === 'number' && record.time_spent >= 0
  if (!hasTimeSpent) {
    errors.push('存储记录缺少或无效的答题用时')
  }

  const hasCreatedAt = typeof record.created_at === 'string' && record.created_at.length > 0
  if (!hasCreatedAt) {
    errors.push('存储记录缺少时间戳')
  }

  return {
    isValid: hasKnowledgePointId && hasIsCorrect && hasTimeSpent && hasCreatedAt,
    hasKnowledgePointId,
    hasIsCorrect,
    hasTimeSpent,
    hasCreatedAt,
    errors,
  }
}

/**
 * 模拟创建学习记录（转换输入为存储格式）
 */
function createRecord(input: LearningRecordInput): LearningRecord {
  return {
    id: `record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    user_id: input.userId,
    knowledge_point_id: input.knowledgePointId,
    question_id: input.questionId,
    content_item: input.contentItem,
    is_correct: input.isCorrect,
    time_spent: input.timeSpent,
    created_at: new Date().toISOString(),
  }
}

// ============================================
// 生成器定义
// ============================================

const userIdArb = fc.uuid()
const knowledgePointIdArb = fc.uuid()
const questionIdArb = fc.option(fc.uuid(), { nil: undefined })
const contentItemArb = fc.option(
  fc.constantFrom('适应证', '禁忌', '不良反应', '相互作用', '用法用量'),
  { nil: undefined }
)
const isCorrectArb = fc.boolean()
const timeSpentArb = fc.integer({ min: 0, max: 3600 }) // 0-3600秒

const learningRecordInputArb: fc.Arbitrary<LearningRecordInput> = fc.record({
  userId: userIdArb,
  knowledgePointId: knowledgePointIdArb,
  questionId: questionIdArb,
  contentItem: contentItemArb,
  isCorrect: isCorrectArb,
  timeSpent: timeSpentArb,
})

// ============================================
// Property 5: 答题记录完整性
// ============================================

describe('Property 5: 答题记录完整性', () => {
  /**
   * 测试：有效输入必须包含考点ID
   */
  test('有效输入必须包含考点ID', () => {
    fc.assert(
      fc.property(learningRecordInputArb, (input) => {
        const validation = validateRecordInput(input)
        return validation.hasKnowledgePointId === true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：有效输入必须包含是否正确字段
   */
  test('有效输入必须包含是否正确字段', () => {
    fc.assert(
      fc.property(learningRecordInputArb, (input) => {
        const validation = validateRecordInput(input)
        return validation.hasIsCorrect === true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：有效输入必须包含答题用时
   */
  test('有效输入必须包含答题用时', () => {
    fc.assert(
      fc.property(learningRecordInputArb, (input) => {
        const validation = validateRecordInput(input)
        return validation.hasTimeSpent === true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：存储的记录必须包含所有必需字段
   */
  test('存储的记录必须包含所有必需字段', () => {
    fc.assert(
      fc.property(learningRecordInputArb, (input) => {
        const record = createRecord(input)
        const validation = validateStoredRecord(record)
        return (
          validation.hasKnowledgePointId &&
          validation.hasIsCorrect &&
          validation.hasTimeSpent &&
          validation.hasCreatedAt
        )
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：存储的记录必须包含时间戳
   */
  test('存储的记录必须包含时间戳', () => {
    fc.assert(
      fc.property(learningRecordInputArb, (input) => {
        const record = createRecord(input)
        return (
          typeof record.created_at === 'string' &&
          record.created_at.length > 0 &&
          !isNaN(Date.parse(record.created_at))
        )
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：存储的记录保留原始数据
   */
  test('存储的记录保留原始数据', () => {
    fc.assert(
      fc.property(learningRecordInputArb, (input) => {
        const record = createRecord(input)
        return (
          record.knowledge_point_id === input.knowledgePointId &&
          record.is_correct === input.isCorrect &&
          record.time_spent === input.timeSpent &&
          record.user_id === input.userId
        )
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：答题用时必须为非负数
   */
  test('答题用时必须为非负数', () => {
    fc.assert(
      fc.property(learningRecordInputArb, (input) => {
        const record = createRecord(input)
        return record.time_spent >= 0
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 测试：每条记录有唯一ID
   */
  test('每条记录有唯一ID', () => {
    fc.assert(
      fc.property(learningRecordInputArb, learningRecordInputArb, (input1, input2) => {
        const record1 = createRecord(input1)
        const record2 = createRecord(input2)
        return record1.id !== record2.id
      }),
      { numRuns: 100 }
    )
  })
})

// ============================================
// 边界情况测试
// ============================================

describe('边界情况测试', () => {
  test('答题用时为0秒', () => {
    const input: LearningRecordInput = {
      userId: 'user-1',
      knowledgePointId: 'point-1',
      isCorrect: true,
      timeSpent: 0,
    }
    const validation = validateRecordInput(input)
    expect(validation.isValid).toBe(true)
    expect(validation.hasTimeSpent).toBe(true)
  })

  test('答题用时为最大值', () => {
    const input: LearningRecordInput = {
      userId: 'user-1',
      knowledgePointId: 'point-1',
      isCorrect: false,
      timeSpent: 3600,
    }
    const record = createRecord(input)
    expect(record.time_spent).toBe(3600)
  })

  test('可选字段为空', () => {
    const input: LearningRecordInput = {
      userId: 'user-1',
      knowledgePointId: 'point-1',
      isCorrect: true,
      timeSpent: 30,
    }
    const record = createRecord(input)
    expect(record.question_id).toBeUndefined()
    expect(record.content_item).toBeUndefined()
    const validation = validateStoredRecord(record)
    expect(validation.isValid).toBe(true)
  })

  test('包含所有可选字段', () => {
    const input: LearningRecordInput = {
      userId: 'user-1',
      knowledgePointId: 'point-1',
      questionId: 'question-1',
      contentItem: '适应证',
      isCorrect: true,
      timeSpent: 45,
    }
    const record = createRecord(input)
    expect(record.question_id).toBe('question-1')
    expect(record.content_item).toBe('适应证')
  })

  test('缺少考点ID时验证失败', () => {
    const input = {
      userId: 'user-1',
      knowledgePointId: '',
      isCorrect: true,
      timeSpent: 30,
    } as LearningRecordInput
    const validation = validateRecordInput(input)
    expect(validation.isValid).toBe(false)
    expect(validation.hasKnowledgePointId).toBe(false)
  })

  test('负数答题用时验证失败', () => {
    const input = {
      userId: 'user-1',
      knowledgePointId: 'point-1',
      isCorrect: true,
      timeSpent: -1,
    } as LearningRecordInput
    const validation = validateRecordInput(input)
    expect(validation.isValid).toBe(false)
    expect(validation.hasTimeSpent).toBe(false)
  })
})
