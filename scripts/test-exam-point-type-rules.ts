/**
 * 测试考点类型推断规则
 * Test script for exam point type inference rules
 */

import { inferExamPointType } from '../lib/knowledge/examPointTypeRules'

interface TestCase {
  name: string
  input: {
    point_name?: string
    title?: string
    point_content?: string
    content?: string
  }
  expectedType: string
  expectedConfidence?: 'high' | 'medium' | 'low'
}

const testCases: TestCase[] = [
  {
    name: '拉莫三嗪的临床用药评价',
    input: {
      point_name: '拉莫三嗪的临床用药评价',
    },
    expectedType: 'single_drug',
    expectedConfidence: 'high',
  },
  {
    name: '考点6 拉莫三嗪的临床用药评价',
    input: {
      point_name: '考点6 拉莫三嗪的临床用药评价',
    },
    expectedType: 'single_drug',
    expectedConfidence: 'high',
  },
  {
    name: '抗癫痫药的特殊人群用药',
    input: {
      point_name: '抗癫痫药的特殊人群用药',
    },
    expectedType: 'adr_interaction',
  },
  {
    name: '药物分类与作用机制',
    input: {
      point_name: '药物分类与作用机制',
    },
    expectedType: 'drug_class',
  },
  {
    name: '二代钙通道阻滞剂的对比',
    input: {
      point_name: '二代钙通道阻滞剂的对比',
    },
    expectedType: 'drug_class', // 或 clinical_selection，取决于规则优先级
  },
  {
    name: '某疾病的药物选择',
    input: {
      point_name: '某疾病的药物选择',
    },
    expectedType: 'clinical_selection',
  },
  {
    name: '药物的临床用药评价与选择',
    input: {
      point_name: '药物的临床用药评价与选择',
    },
    expectedType: 'clinical_selection', // 包含"选择"排除词，不应匹配 single_drug
  },
]

function runTests() {
  console.log('='.repeat(60))
  console.log('🧪 测试考点类型推断规则')
  console.log('='.repeat(60))
  console.log()

  let passed = 0
  let failed = 0

  for (const testCase of testCases) {
    const result = inferExamPointType(testCase.input)
    const typeMatch = result.type === testCase.expectedType
    const confidenceMatch = testCase.expectedConfidence
      ? result.confidence === testCase.expectedConfidence
      : true

    const success = typeMatch && confidenceMatch

    if (success) {
      passed++
      console.log(`✅ ${testCase.name}`)
      console.log(`   预期: ${testCase.expectedType}${testCase.expectedConfidence ? ` (${testCase.expectedConfidence})` : ''}`)
      console.log(`   实际: ${result.type} (${result.confidence})`)
      console.log(`   规则: ${result.matchedRules.join(', ')}`)
    } else {
      failed++
      console.log(`❌ ${testCase.name}`)
      console.log(`   预期: ${testCase.expectedType}${testCase.expectedConfidence ? ` (${testCase.expectedConfidence})` : ''}`)
      console.log(`   实际: ${result.type} (${result.confidence})`)
      console.log(`   规则: ${result.matchedRules.join(', ')}`)
    }
    console.log()
  }

  console.log('='.repeat(60))
  console.log(`📊 测试结果: ${passed} 通过, ${failed} 失败`)
  console.log('='.repeat(60))

  if (failed > 0) {
    process.exit(1)
  }
}

runTests()

