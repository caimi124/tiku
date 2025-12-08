/**
 * 老司机模式 - Schema验证器属性测试
 * Expert Driver Mode - Schema Validator Property Tests
 * 
 * 使用 fast-check 进行属性测试
 */

import * as fc from 'fast-check';
import {
  validateSchema,
  validateTrapAnalysisArray,
  validatePredictionArray,
  validateSummaryLength,
  validateVersionFormat,
  validateStyleVariant,
  validateShortSummaryLength,
  validateExpertDriverContent,
} from './schema-validator';
import {
  TrapAnalysis,
  PredictionQuestion,
  ExpertDriverContent,
  STYLE_VARIANTS,
  CONSTRAINTS,
} from './types';

// ============ 生成器 ============

// 生成有效的坑位解析
const validTrapAnalysisArb = fc.record({
  标题: fc.string({ minLength: 1, maxLength: 50 }),
  出题套路: fc.string({ minLength: 1, maxLength: 200 }),
  坑在哪里: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
  老司机技巧: fc.string({ minLength: 1, maxLength: 150 }),
  口诀: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  场景化记忆: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
}).filter(trap => trap.口诀 !== undefined || trap.场景化记忆 !== undefined);

// 生成有效的押题预测
const validPredictionArb = fc.record({
  题干: fc.string({ minLength: 1 }),
  正确答案: fc.string({ minLength: 1 }),
  理由: fc.string({ minLength: 1, maxLength: 150 }),
});

// 生成有效的版本号
const validVersionArb = fc.tuple(
  fc.integer({ min: 1, max: 99 }),
  fc.integer({ min: 0, max: 99 })
).map(([major, minor]) => `v${major}.${minor}`);

// 生成有效的风格变体
const validStyleVariantArb = fc.constantFrom(...STYLE_VARIANTS);

// 生成有效的一句话极速总结
const validSummaryArb = fc.string({
  minLength: CONSTRAINTS.SUMMARY_MIN_LENGTH,
  maxLength: CONSTRAINTS.SUMMARY_MAX_LENGTH,
});

// 生成有效的短摘要
const validShortSummaryArb = fc.option(
  fc.string({ maxLength: CONSTRAINTS.SHORT_SUMMARY_MAX_LENGTH }),
  { nil: undefined }
);

// 生成完整有效的ExpertDriverContent
const validExpertDriverContentArb = fc.record({
  knowledge_point_id: fc.uuid(),
  考点名称: fc.string({ minLength: 1 }),
  坑位解析: fc.array(validTrapAnalysisArb, {
    minLength: CONSTRAINTS.TRAP_ANALYSIS_MIN,
    maxLength: CONSTRAINTS.TRAP_ANALYSIS_MAX,
  }),
  应试战术: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 2, maxLength: 5 }),
  押题预测: fc.array(validPredictionArb, {
    minLength: CONSTRAINTS.PREDICTION_MIN,
    maxLength: CONSTRAINTS.PREDICTION_MAX,
  }),
  终极思维导图: fc.string({ minLength: 1 }),
  一句话极速总结: validSummaryArb,
  short_summary: validShortSummaryArb,
  version: validVersionArb,
  style_variant: validStyleVariantArb,
  source_knowledge_point_text: fc.string({ minLength: 1 }),
  prompt_template_version: validVersionArb,
  style_check: fc.record({
    is_driver_tone: fc.boolean(),
    has_traps: fc.boolean(),
    has_mnemonic: fc.boolean(),
    no_ai_artifacts: fc.boolean(),
    no_forbidden_patterns: fc.boolean(),
    passed: fc.boolean(),
    failure_reasons: fc.option(fc.array(fc.string()), { nil: undefined }),
  }),
});

// ============ 属性测试 ============

describe('Expert Driver Mode - Schema Validator Property Tests', () => {
  /**
   * **Feature: expert-driver-mode, Property 1: Schema Validation Completeness**
   * **Validates: Requirements 1.1, 1.7**
   */
  describe('Property 1: Schema Validation Completeness', () => {
    test('valid content should pass schema validation', () => {
      fc.assert(
        fc.property(validExpertDriverContentArb, (content) => {
          const result = validateSchema(content);
          return result.valid === true;
        }),
        { numRuns: 100 }
      );
    });

    test('content missing required fields should fail validation', () => {
      const requiredFields = [
        '考点名称', '坑位解析', '应试战术', '押题预测',
        '终极思维导图', '一句话极速总结', 'version',
        'style_variant', 'source_knowledge_point_text'
      ];

      fc.assert(
        fc.property(
          validExpertDriverContentArb,
          fc.constantFrom(...requiredFields),
          (content, fieldToRemove) => {
            const contentCopy = { ...content };
            delete (contentCopy as any)[fieldToRemove];
            const result = validateSchema(contentCopy);
            return result.valid === false;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: expert-driver-mode, Property 2: Trap Analysis Array Bounds**
   * **Validates: Requirements 1.2, 7.1, 7.3**
   */
  describe('Property 2: Trap Analysis Array Bounds', () => {
    test('arrays with 3-6 valid items should pass', () => {
      fc.assert(
        fc.property(
          fc.array(validTrapAnalysisArb, {
            minLength: CONSTRAINTS.TRAP_ANALYSIS_MIN,
            maxLength: CONSTRAINTS.TRAP_ANALYSIS_MAX,
          }),
          (traps) => {
            const result = validateTrapAnalysisArray(traps);
            return result.valid === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('arrays with fewer than 3 items should fail', () => {
      fc.assert(
        fc.property(
          fc.array(validTrapAnalysisArb, { minLength: 0, maxLength: 2 }),
          (traps) => {
            const result = validateTrapAnalysisArray(traps);
            return result.valid === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('arrays with more than 6 items should fail', () => {
      fc.assert(
        fc.property(
          fc.array(validTrapAnalysisArb, { minLength: 7, maxLength: 10 }),
          (traps) => {
            const result = validateTrapAnalysisArray(traps);
            return result.valid === false;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: expert-driver-mode, Property 3: Prediction Questions Array Bounds**
   * **Validates: Requirements 1.3, 7.2**
   */
  describe('Property 3: Prediction Questions Array Bounds', () => {
    test('arrays with 2-4 valid items should pass', () => {
      fc.assert(
        fc.property(
          fc.array(validPredictionArb, {
            minLength: CONSTRAINTS.PREDICTION_MIN,
            maxLength: CONSTRAINTS.PREDICTION_MAX,
          }),
          (predictions) => {
            const result = validatePredictionArray(predictions);
            return result.valid === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('arrays with fewer than 2 items should fail', () => {
      fc.assert(
        fc.property(
          fc.array(validPredictionArb, { minLength: 0, maxLength: 1 }),
          (predictions) => {
            const result = validatePredictionArray(predictions);
            return result.valid === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('arrays with more than 4 items should fail', () => {
      fc.assert(
        fc.property(
          fc.array(validPredictionArb, { minLength: 5, maxLength: 8 }),
          (predictions) => {
            const result = validatePredictionArray(predictions);
            return result.valid === false;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: expert-driver-mode, Property 4: Summary Length Constraint**
   * **Validates: Requirements 1.4**
   */
  describe('Property 4: Summary Length Constraint', () => {
    test('summaries with 10-20 characters should pass', () => {
      fc.assert(
        fc.property(validSummaryArb, (summary) => {
          const result = validateSummaryLength(summary);
          return result.valid === true;
        }),
        { numRuns: 100 }
      );
    });

    test('summaries with fewer than 10 characters should fail', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 9 }),
          (summary) => {
            const result = validateSummaryLength(summary);
            return result.valid === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('summaries with more than 20 characters should fail', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 21, maxLength: 50 }),
          (summary) => {
            const result = validateSummaryLength(summary);
            return result.valid === false;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: expert-driver-mode, Property 5: Version Format Validation**
   * **Validates: Requirements 1.5**
   */
  describe('Property 5: Version Format Validation', () => {
    test('valid version formats should pass', () => {
      fc.assert(
        fc.property(validVersionArb, (version) => {
          const result = validateVersionFormat(version);
          return result.valid === true;
        }),
        { numRuns: 100 }
      );
    });

    test('invalid version formats should fail', () => {
      const invalidVersionArb = fc.oneof(
        fc.string().filter(s => !/^v\d+\.\d+$/.test(s)),
        fc.constant('1.0'),
        fc.constant('v1'),
        fc.constant('version1.0'),
      );

      fc.assert(
        fc.property(invalidVersionArb, (version) => {
          const result = validateVersionFormat(version);
          return result.valid === false;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: expert-driver-mode, Property 6: Style Variant Enum Validation**
   * **Validates: Requirements 1.6**
   */
  describe('Property 6: Style Variant Enum Validation', () => {
    test('valid style variants should pass', () => {
      fc.assert(
        fc.property(validStyleVariantArb, (variant) => {
          const result = validateStyleVariant(variant);
          return result.valid === true;
        }),
        { numRuns: 100 }
      );
    });

    test('invalid style variants should fail', () => {
      const invalidVariantArb = fc.string().filter(
        s => !STYLE_VARIANTS.includes(s as any)
      );

      fc.assert(
        fc.property(invalidVariantArb, (variant) => {
          const result = validateStyleVariant(variant);
          return result.valid === false;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: expert-driver-mode, Property 7: Short Summary Length Constraint**
   * **Validates: Requirements 1.8**
   */
  describe('Property 7: Short Summary Length Constraint', () => {
    test('short summaries within 50 characters should pass', () => {
      fc.assert(
        fc.property(
          fc.string({ maxLength: CONSTRAINTS.SHORT_SUMMARY_MAX_LENGTH }),
          (summary) => {
            const result = validateShortSummaryLength(summary);
            return result.valid === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('undefined short summary should pass', () => {
      const result = validateShortSummaryLength(undefined);
      expect(result.valid).toBe(true);
    });

    test('short summaries exceeding 50 characters should fail', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 51, maxLength: 100 }),
          (summary) => {
            const result = validateShortSummaryLength(summary);
            return result.valid === false;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
