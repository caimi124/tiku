/**
 * 老司机模式 - Schema验证器
 * Expert Driver Mode - Schema Validator
 */

import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import {
  ExpertDriverContent,
  TrapAnalysis,
  PredictionQuestion,
  StyleCheckResult,
  ValidationResult,
  STYLE_VARIANTS,
  VERSION_PATTERN,
  CONSTRAINTS,
} from './types';

// JSON Schema定义
export const expertDriverContentSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: [
    '考点名称',
    '坑位解析',
    '应试战术',
    '押题预测',
    '终极思维导图',
    '一句话极速总结',
    'version',
    'style_variant',
    'source_knowledge_point_text',
  ],
  properties: {
    考点名称: { type: 'string', minLength: 1 },
    坑位解析: {
      type: 'array',
      minItems: CONSTRAINTS.TRAP_ANALYSIS_MIN,
      maxItems: CONSTRAINTS.TRAP_ANALYSIS_MAX,
      items: {
        type: 'object',
        required: ['标题', '出题套路', '坑在哪里', '老司机技巧'],
        properties: {
          标题: { type: 'string', maxLength: 50 },
          出题套路: { type: 'string', maxLength: 200 },
          坑在哪里: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
          },
          老司机技巧: { type: 'string', maxLength: 150 },
          口诀: { type: 'string', maxLength: 100 },
          场景化记忆: { type: 'string', maxLength: 200 },
        },
      },
    },
    应试战术: {
      type: 'array',
      minItems: 2,
      maxItems: 5,
      items: { type: 'string', maxLength: 100 },
    },
    押题预测: {
      type: 'array',
      minItems: CONSTRAINTS.PREDICTION_MIN,
      maxItems: CONSTRAINTS.PREDICTION_MAX,
      items: {
        type: 'object',
        required: ['题干', '正确答案', '理由'],
        properties: {
          题干: { type: 'string' },
          正确答案: { type: 'string' },
          理由: { type: 'string', maxLength: 150 },
        },
      },
    },
    终极思维导图: { type: 'string' },
    一句话极速总结: {
      type: 'string',
      minLength: CONSTRAINTS.SUMMARY_MIN_LENGTH,
      maxLength: CONSTRAINTS.SUMMARY_MAX_LENGTH,
    },
    short_summary: {
      type: 'string',
      maxLength: CONSTRAINTS.SHORT_SUMMARY_MAX_LENGTH,
    },
    version: {
      type: 'string',
      pattern: '^v\\d+\\.\\d+$',
    },
    style_variant: {
      type: 'string',
      enum: STYLE_VARIANTS,
    },
    source_knowledge_point_text: { type: 'string', minLength: 1 },
  },
};

// 创建Ajv实例
const ajv = new Ajv({ allErrors: true, verbose: true });

// 编译验证函数
let validateFn: ValidateFunction | null = null;

function getValidator(): ValidateFunction {
  if (!validateFn) {
    validateFn = ajv.compile(expertDriverContentSchema);
  }
  return validateFn;
}

/**
 * 验证Schema完整性
 */
export function validateSchema(content: unknown): {
  valid: boolean;
  errors: string[];
} {
  const validate = getValidator();
  const valid = validate(content);

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = (validate.errors || []).map((err: ErrorObject) => {
    const path = err.instancePath || 'root';
    return `${path}: ${err.message}`;
  });

  return { valid: false, errors };
}

/**
 * 验证坑位解析数组边界
 */
export function validateTrapAnalysisArray(traps: TrapAnalysis[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 检查数组长度
  if (traps.length < CONSTRAINTS.TRAP_ANALYSIS_MIN) {
    errors.push(`坑位解析数量不足，最少需要${CONSTRAINTS.TRAP_ANALYSIS_MIN}个，当前${traps.length}个`);
  }
  if (traps.length > CONSTRAINTS.TRAP_ANALYSIS_MAX) {
    errors.push(`坑位解析数量过多，最多${CONSTRAINTS.TRAP_ANALYSIS_MAX}个，当前${traps.length}个`);
  }

  // 检查每个坑位的必填字段和可选字段
  traps.forEach((trap, index) => {
    if (!trap.标题) errors.push(`坑位${index + 1}缺少标题`);
    if (!trap.出题套路) errors.push(`坑位${index + 1}缺少出题套路`);
    if (!trap.坑在哪里 || trap.坑在哪里.length === 0) {
      errors.push(`坑位${index + 1}缺少坑在哪里`);
    }
    if (!trap.老司机技巧) errors.push(`坑位${index + 1}缺少老司机技巧`);

    // 至少需要口诀或场景化记忆之一
    if (!trap.口诀 && !trap.场景化记忆) {
      errors.push(`坑位${index + 1}需要至少包含口诀或场景化记忆之一`);
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * 验证押题预测数组边界
 */
export function validatePredictionArray(predictions: PredictionQuestion[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (predictions.length < CONSTRAINTS.PREDICTION_MIN) {
    errors.push(`押题预测数量不足，最少需要${CONSTRAINTS.PREDICTION_MIN}个，当前${predictions.length}个`);
  }
  if (predictions.length > CONSTRAINTS.PREDICTION_MAX) {
    errors.push(`押题预测数量过多，最多${CONSTRAINTS.PREDICTION_MAX}个，当前${predictions.length}个`);
  }

  predictions.forEach((pred, index) => {
    if (!pred.题干) errors.push(`押题${index + 1}缺少题干`);
    if (!pred.正确答案) errors.push(`押题${index + 1}缺少正确答案`);
    if (!pred.理由) errors.push(`押题${index + 1}缺少理由`);
  });

  return { valid: errors.length === 0, errors };
}

/**
 * 验证一句话极速总结长度
 */
export function validateSummaryLength(summary: string): {
  valid: boolean;
  error?: string;
} {
  const length = summary.length;
  if (length < CONSTRAINTS.SUMMARY_MIN_LENGTH) {
    return {
      valid: false,
      error: `一句话极速总结太短，最少${CONSTRAINTS.SUMMARY_MIN_LENGTH}字符，当前${length}字符`,
    };
  }
  if (length > CONSTRAINTS.SUMMARY_MAX_LENGTH) {
    return {
      valid: false,
      error: `一句话极速总结太长，最多${CONSTRAINTS.SUMMARY_MAX_LENGTH}字符，当前${length}字符`,
    };
  }
  return { valid: true };
}

/**
 * 验证版本格式
 */
export function validateVersionFormat(version: string): {
  valid: boolean;
  error?: string;
} {
  if (!VERSION_PATTERN.test(version)) {
    return {
      valid: false,
      error: `版本格式不正确，应为vX.Y格式，当前为${version}`,
    };
  }
  return { valid: true };
}

/**
 * 验证风格变体枚举
 */
export function validateStyleVariant(variant: string): {
  valid: boolean;
  error?: string;
} {
  if (!STYLE_VARIANTS.includes(variant as any)) {
    return {
      valid: false,
      error: `风格变体不正确，应为${STYLE_VARIANTS.join('/')}之一，当前为${variant}`,
    };
  }
  return { valid: true };
}

/**
 * 验证短摘要长度
 */
export function validateShortSummaryLength(summary: string | undefined): {
  valid: boolean;
  error?: string;
} {
  if (summary === undefined) {
    return { valid: true }; // 可选字段
  }
  if (summary.length > CONSTRAINTS.SHORT_SUMMARY_MAX_LENGTH) {
    return {
      valid: false,
      error: `短摘要太长，最多${CONSTRAINTS.SHORT_SUMMARY_MAX_LENGTH}字符，当前${summary.length}字符`,
    };
  }
  return { valid: true };
}

/**
 * 完整验证ExpertDriverContent
 */
export function validateExpertDriverContent(content: unknown): ValidationResult {
  const schemaResult = validateSchema(content);

  if (!schemaResult.valid) {
    return {
      valid: false,
      style_check: createEmptyStyleCheck(),
      schema_errors: schemaResult.errors,
    };
  }

  const typedContent = content as ExpertDriverContent;
  const errors: string[] = [];

  // 验证坑位解析
  const trapResult = validateTrapAnalysisArray(typedContent.坑位解析);
  if (!trapResult.valid) {
    errors.push(...trapResult.errors);
  }

  // 验证押题预测
  const predResult = validatePredictionArray(typedContent.押题预测);
  if (!predResult.valid) {
    errors.push(...predResult.errors);
  }

  // 验证一句话极速总结
  const summaryResult = validateSummaryLength(typedContent.一句话极速总结);
  if (!summaryResult.valid && summaryResult.error) {
    errors.push(summaryResult.error);
  }

  // 验证版本格式
  const versionResult = validateVersionFormat(typedContent.version);
  if (!versionResult.valid && versionResult.error) {
    errors.push(versionResult.error);
  }

  // 验证风格变体
  const variantResult = validateStyleVariant(typedContent.style_variant);
  if (!variantResult.valid && variantResult.error) {
    errors.push(variantResult.error);
  }

  // 验证短摘要
  const shortSummaryResult = validateShortSummaryLength(typedContent.short_summary);
  if (!shortSummaryResult.valid && shortSummaryResult.error) {
    errors.push(shortSummaryResult.error);
  }

  return {
    valid: errors.length === 0,
    style_check: createEmptyStyleCheck(),
    schema_errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * 创建空的风格检查结果
 */
function createEmptyStyleCheck(): StyleCheckResult {
  return {
    is_driver_tone: false,
    has_traps: false,
    has_mnemonic: false,
    no_ai_artifacts: false,
    no_forbidden_patterns: false,
    passed: false,
  };
}
