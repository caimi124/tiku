/**
 * 考点类型定义
 * Exam Point Type Definitions
 */

export type ExamPointType =
  | 'single_drug'        // 单药
  | 'drug_class'         // 分类
  | 'clinical_selection' // 临床选择/治疗原则
  | 'adr_interaction'    // 不良反应/相互作用专题
  | 'mechanism_basic'     // 机制/药理基础

/**
 * 考点类型标签映射
 */
export const EXAM_POINT_TYPE_LABELS: Record<ExamPointType, string> = {
  single_drug: '单药',
  drug_class: '分类',
  clinical_selection: '临床选择',
  adr_interaction: '不良反应/相互作用',
  mechanism_basic: '机制/药理基础',
}

/**
 * 所有有效的考点类型
 */
export const VALID_EXAM_POINT_TYPES: ExamPointType[] = [
  'single_drug',
  'drug_class',
  'clinical_selection',
  'adr_interaction',
  'mechanism_basic',
]

/**
 * 验证考点类型是否有效
 */
export function isValidExamPointType(value: string | null | undefined): value is ExamPointType {
  return value !== null && value !== undefined && VALID_EXAM_POINT_TYPES.includes(value as ExamPointType)
}

