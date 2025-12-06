/**
 * ExpertTips 工具函数
 * 用于老司机带路内容的类型定义和工具函数
 * 
 * Requirements: 2.1, 2.2
 */

// 出题套路
export interface ExamPattern {
  title: string
  questionExample: string
  options: string[]
  correctAnswer: string
}

// 坑位分析
export interface TrapAnalysis {
  trapName: string
  description: string
  commonMistake: string
  solution: string
}

// 记忆技巧
export interface MemoryTechnique {
  type: 'mnemonic' | 'association' | 'scenario'
  content: string
}

// 应试战术
export interface ExamTactic {
  trigger: string
  reaction: string
}

// 必考预测
export interface Prediction {
  question: string
  answer: string
  explanation: string
  probability: number
}

// 老司机带路完整数据
export interface ExpertTips {
  examPatterns: ExamPattern[]
  trapAnalysis: TrapAnalysis[]
  memoryTechniques: MemoryTechnique[]
  examTactics: ExamTactic[]
  predictions: Prediction[]
}

// 模块类型
export type ExpertTipsModule = 
  | 'examPatterns'
  | 'trapAnalysis'
  | 'memoryTechniques'
  | 'examTactics'
  | 'predictions'

// 模块配置
export interface ModuleConfig {
  key: ExpertTipsModule
  label: string
  icon: string
  description: string
}

export const MODULE_CONFIG: Record<ExpertTipsModule, ModuleConfig> = {
  examPatterns: {
    key: 'examPatterns',
    label: '出题套路',
    icon: '🎯',
    description: '常见的出题形式和题目示例'
  },
  trapAnalysis: {
    key: 'trapAnalysis',
    label: '坑位分析',
    icon: '🕳️',
    description: '考生容易犯的错误和出题人常用的陷阱'
  },
  memoryTechniques: {
    key: 'memoryTechniques',
    label: '记忆技巧',
    icon: '💡',
    description: '口诀、联想记忆、场景记忆等方法'
  },
  examTactics: {
    key: 'examTactics',
    label: '应试战术',
    icon: '🚗',
    description: '条件反射式解题思路'
  },
  predictions: {
    key: 'predictions',
    label: '必考预测',
    icon: '📝',
    description: '预测题目和正确答案解析'
  }
}

export const ALL_MODULES: ExpertTipsModule[] = [
  'examPatterns',
  'trapAnalysis',
  'memoryTechniques',
  'examTactics',
  'predictions'
]

// 记忆技巧类型配置
export const MEMORY_TYPE_CONFIG: Record<MemoryTechnique['type'], { label: string; icon: string }> = {
  mnemonic: { label: '口诀', icon: '📜' },
  association: { label: '联想', icon: '🔗' },
  scenario: { label: '场景', icon: '🎬' }
}

/**
 * 检查老司机内容是否为空
 */
export function isExpertTipsEmpty(tips: ExpertTips): boolean {
  return (
    tips.examPatterns.length === 0 &&
    tips.trapAnalysis.length === 0 &&
    tips.memoryTechniques.length === 0 &&
    tips.examTactics.length === 0 &&
    tips.predictions.length === 0
  )
}

/**
 * 获取非空模块列表
 */
export function getNonEmptyModules(tips: ExpertTips): ExpertTipsModule[] {
  const modules: ExpertTipsModule[] = []
  
  if (tips.examPatterns.length > 0) modules.push('examPatterns')
  if (tips.trapAnalysis.length > 0) modules.push('trapAnalysis')
  if (tips.memoryTechniques.length > 0) modules.push('memoryTechniques')
  if (tips.examTactics.length > 0) modules.push('examTactics')
  if (tips.predictions.length > 0) modules.push('predictions')
  
  return modules
}

/**
 * 获取模块内容数量
 */
export function getModuleCount(tips: ExpertTips, module: ExpertTipsModule): number {
  return tips[module].length
}

/**
 * 验证必考预测数据完整性
 */
export function validatePrediction(prediction: Prediction): boolean {
  return (
    prediction.question.length > 0 &&
    prediction.answer.length > 0 &&
    prediction.probability >= 0 &&
    prediction.probability <= 100
  )
}

/**
 * 验证老司机内容模块完整性
 */
export function validateExpertTipsModule(tips: ExpertTips): boolean {
  if (isExpertTipsEmpty(tips)) {
    return true // 空内容是有效的
  }
  
  // 非空内容必须至少包含一个模块
  return getNonEmptyModules(tips).length > 0
}

/**
 * 获取概率等级
 */
export function getProbabilityLevel(probability: number): 'high' | 'medium' | 'low' {
  if (probability >= 80) return 'high'
  if (probability >= 50) return 'medium'
  return 'low'
}

/**
 * 获取概率等级配置
 */
export function getProbabilityConfig(probability: number): { label: string; color: string } {
  const level = getProbabilityLevel(probability)
  switch (level) {
    case 'high':
      return { label: '高概率', color: 'text-red-600 bg-red-100' }
    case 'medium':
      return { label: '中概率', color: 'text-yellow-600 bg-yellow-100' }
    case 'low':
      return { label: '低概率', color: 'text-gray-600 bg-gray-100' }
  }
}
