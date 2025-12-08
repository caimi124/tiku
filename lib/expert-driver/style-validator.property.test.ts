/**
 * 老司机模式 - 风格验证器属性测试
 * Expert Driver Mode - Style Validator Property Tests
 */

import * as fc from 'fast-check';
import {
  StyleValidator,
  validateMnemonicLineCount,
  validateTrapAnalysisCharacterLimit,
  checkForbiddenPatterns,
  generateStyleCheckResult,
} from './style-validator';
import {
  TrapAnalysis,
  ExpertDriverContent,
  StyleCheckResult,
  FORBIDDEN_PATTERNS,
  CONSTRAINTS,
  STYLE_VARIANTS,
} from './types';

// ============ 生成器 ============

// 生成有效的口诀（最多3行）
const validMnemonicArb = fc.array(
  fc.string({ minLength: 1, maxLength: 20 }),
  { minLength: 1, maxLength: CONSTRAINTS.MNEMONIC_MAX_LINES }
).map(lines => lines.join('\n'));

// 生成无效的口诀（超过3行）
const invalidMnemonicArb = fc.array(
  fc.string({ minLength: 1, maxLength: 20 }),
  { minLength: CONSTRAINTS.MNEMONIC_MAX_LINES + 1, maxLength: 10 }
).map(lines => lines.join('\n'));

// 生成短文本（用于坑位解析，确保不超过300字符）
const shortTextArb = fc.string({ minLength: 1, maxLength: 50 });

// 生成有效的坑位解析（总长度不超过300字符）
const validTrapAnalysisArb = fc.record({
  标题: fc.string({ minLength: 1, maxLength: 30 }),
  出题套路: fc.string({ minLength: 1, maxLength: 80 }),
  坑在哪里: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 3 }),
  老司机技巧: fc.string({ minLength: 1, maxLength: 50 }),
  口诀: fc.option(validMnemonicArb, { nil: undefined }),
  场景化记忆: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
}).filter(trap => {
  // 确保至少有口诀或场景化记忆之一
  if (!trap.口诀 && !trap.场景化记忆) return false;
  // 确保总长度不超过300
  const length = (trap.标题?.length || 0) +
    (trap.出题套路?.length || 0) +
    (trap.坑在哪里?.join('').length || 0) +
    (trap.老司机技巧?.length || 0);
  return length <= CONSTRAINTS.TRAP_ITEM_MAX_LENGTH;
});

// 生成超长的坑位解析
const longTrapAnalysisArb = fc.record({
  标题: fc.string({ minLength: 100, maxLength: 150 }),
  出题套路: fc.string({ minLength: 100, maxLength: 150 }),
  坑在哪里: fc.array(fc.string({ minLength: 50, maxLength: 100 }), { minLength: 2, maxLength: 3 }),
  老司机技巧: fc.string({ minLength: 100, maxLength: 150 }),
  口诀: fc.option(validMnemonicArb, { nil: undefined }),
  场景化记忆: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
}).filter(trap => trap.口诀 !== undefined || trap.场景化记忆 !== undefined);

// 生成包含禁止模式的文本
const textWithForbiddenPatternArb = fc.tuple(
  fc.string({ minLength: 0, maxLength: 20 }),
  fc.constantFrom(...FORBIDDEN_PATTERNS),
  fc.string({ minLength: 0, maxLength: 20 })
).map(([prefix, pattern, suffix]) => `${prefix}${pattern}${suffix}`);

// 生成不包含禁止模式的文本
const textWithoutForbiddenPatternArb = fc.string({ minLength: 1, maxLength: 100 })
  .filter(text => !FORBIDDEN_PATTERNS.some(p => text.includes(p)));

// 生成有效的版本号
const validVersionArb = fc.tuple(
  fc.integer({ min: 1, max: 99 }),
  fc.integer({ min: 0, max: 99 })
).map(([major, minor]) => `v${major}.${minor}`);

// 生成有效的押题预测
const validPredictionArb = fc.record({
  题干: fc.string({ minLength: 1, maxLength: 100 }),
  正确答案: fc.string({ minLength: 1, maxLength: 50 }),
  理由: fc.string({ minLength: 1, maxLength: 100 }),
});

// 生成有效的ExpertDriverContent（用于风格检查）
const validContentForStyleCheckArb = fc.record({
  knowledge_point_id: fc.uuid(),
  考点名称: fc.constant('老司机带你避坑'),
  坑位解析: fc.array(validTrapAnalysisArb, {
    minLength: CONSTRAINTS.TRAP_ANALYSIS_MIN,
    maxLength: CONSTRAINTS.TRAP_ANALYSIS_MAX,
  }),
  应试战术: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 2, maxLength: 5 }),
  押题预测: fc.array(validPredictionArb, {
    minLength: CONSTRAINTS.PREDICTION_MIN,
    maxLength: CONSTRAINTS.PREDICTION_MAX,
  }),
  终极思维导图: fc.string({ minLength: 1, maxLength: 200 }),
  一句话极速总结: fc.string({
    minLength: CONSTRAINTS.SUMMARY_MIN_LENGTH,
    maxLength: CONSTRAINTS.SUMMARY_MAX_LENGTH,
  }),
  short_summary: fc.option(fc.string({ maxLength: CONSTRAINTS.SHORT_SUMMARY_MAX_LENGTH }), { nil: undefined }),
  version: validVersionArb,
  style_variant: fc.constantFrom(...STYLE_VARIANTS),
  source_knowledge_point_text: fc.string({ minLength: 1 }),
  prompt_template_version: validVersionArb,
  style_check: fc.record({
    is_driver_tone: fc.boolean(),
    has_traps: fc.boolean(),
    has_mnemonic: fc.boolean(),
    no_ai_artifacts: fc.boolean(),
    no_forbidden_patterns: fc.boolean(),
    passed: fc.boolean(),
  }),
});

// ============ 属性测试 ============

describe('Expert Driver Mode - Style Validator Property Tests', () => {
  const validator = new StyleValidator();

  /**
   * **Feature: expert-driver-mode, Property 9: Mnemonic Line Count Constraint**
   * **Validates: Requirements 2.4, 9.4**
   */
  describe('Property 9: Mnemonic Line Count Constraint', () => {
    test('mnemonics with 3 or fewer lines should pass', () => {
      fc.assert(
        fc.property(validMnemonicArb, (mnemonic) => {
          const result = validateMnemonicLineCount(mnemonic);
          return result.valid === true && result.lineCount <= CONSTRAINTS.MNEMONIC_MAX_LINES;
        }),
        { numRuns: 100 }
      );
    });

    test('mnemonics with more than 3 lines should fail', () => {
      fc.assert(
        fc.property(invalidMnemonicArb, (mnemonic) => {
          const result = validateMnemonicLineCount(mnemonic);
          return result.valid === false && result.lineCount > CONSTRAINTS.MNEMONIC_MAX_LINES;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: expert-driver-mode, Property 10: Trap Analysis Character Limit**
   * **Validates: Requirements 2.6, 11.2**
   */
  describe('Property 10: Trap Analysis Character Limit', () => {
    test('trap analysis within 300 characters should pass', () => {
      fc.assert(
        fc.property(validTrapAnalysisArb, (trap) => {
          const result = validateTrapAnalysisCharacterLimit(trap);
          return result.valid === true && result.length <= CONSTRAINTS.TRAP_ITEM_MAX_LENGTH;
        }),
        { numRuns: 100 }
      );
    });

    test('trap analysis exceeding 300 characters should fail', () => {
      fc.assert(
        fc.property(longTrapAnalysisArb, (trap) => {
          const result = validateTrapAnalysisCharacterLimit(trap);
          // 长文本应该超过限制
          return result.length > CONSTRAINTS.TRAP_ITEM_MAX_LENGTH ? result.valid === false : true;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: expert-driver-mode, Property 11: Forbidden Pattern Detection**
   * **Validates: Requirements 2.7, 9.5, 11.3**
   */
  describe('Property 11: Forbidden Pattern Detection', () => {
    test('text with forbidden patterns should be detected', () => {
      fc.assert(
        fc.property(textWithForbiddenPatternArb, (text) => {
          const found = checkForbiddenPatterns(text);
          return found.length > 0;
        }),
        { numRuns: 100 }
      );
    });

    test('text without forbidden patterns should pass', () => {
      fc.assert(
        fc.property(textWithoutForbiddenPatternArb, (text) => {
          const found = checkForbiddenPatterns(text);
          return found.length === 0;
        }),
        { numRuns: 100 }
      );
    });

    test('all forbidden patterns should be detected', () => {
      FORBIDDEN_PATTERNS.forEach(pattern => {
        const found = checkForbiddenPatterns(`测试${pattern}文本`);
        expect(found).toContain(pattern);
      });
    });
  });

  /**
   * **Feature: expert-driver-mode, Property 19: Style Check Object Generation**
   * **Validates: Requirements 9.2, 9.3, 9.6**
   */
  describe('Property 19: Style Check Object Generation', () => {
    test('style check should always produce all required fields', () => {
      fc.assert(
        fc.property(validContentForStyleCheckArb, (content) => {
          const styleCheck = generateStyleCheckResult(content as ExpertDriverContent);
          
          // 检查所有必需字段都存在
          return (
            typeof styleCheck.is_driver_tone === 'boolean' &&
            typeof styleCheck.has_traps === 'boolean' &&
            typeof styleCheck.has_mnemonic === 'boolean' &&
            typeof styleCheck.no_ai_artifacts === 'boolean' &&
            typeof styleCheck.no_forbidden_patterns === 'boolean' &&
            typeof styleCheck.passed === 'boolean'
          );
        }),
        { numRuns: 100 }
      );
    });

    test('style check passed should be consistent with individual checks', () => {
      fc.assert(
        fc.property(validContentForStyleCheckArb, (content) => {
          const styleCheck = generateStyleCheckResult(content as ExpertDriverContent);
          
          // 如果所有检查都通过，passed应该为true（除非有其他验证失败）
          // 如果有任何检查失败，passed应该为false
          if (!styleCheck.is_driver_tone || !styleCheck.has_traps || 
              !styleCheck.has_mnemonic || !styleCheck.no_ai_artifacts || 
              !styleCheck.no_forbidden_patterns) {
            return styleCheck.passed === false || styleCheck.failure_reasons !== undefined;
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    test('failure_reasons should be present when passed is false', () => {
      fc.assert(
        fc.property(validContentForStyleCheckArb, (content) => {
          const styleCheck = generateStyleCheckResult(content as ExpertDriverContent);
          
          if (styleCheck.passed === false) {
            return styleCheck.failure_reasons !== undefined && 
                   styleCheck.failure_reasons.length > 0;
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});
