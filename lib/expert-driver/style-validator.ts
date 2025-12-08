/**
 * 老司机模式 - 风格验证器
 * Expert Driver Mode - Style Validator
 */

import {
  ExpertDriverContent,
  TrapAnalysis,
  StyleCheckResult,
  ValidationResult,
  FORBIDDEN_PATTERNS,
  CONSTRAINTS,
} from './types';
import { validateExpertDriverContent } from './schema-validator';

/**
 * 风格验证器类
 */
export class StyleValidator {
  private forbiddenPatterns: string[];

  constructor(customForbiddenPatterns?: string[]) {
    this.forbiddenPatterns = customForbiddenPatterns || FORBIDDEN_PATTERNS;
  }

  /**
   * 完整验证内容（Schema + 风格）
   */
  validate(content: ExpertDriverContent): ValidationResult {
    // 先进行Schema验证
    const schemaResult = validateExpertDriverContent(content);
    if (!schemaResult.valid) {
      return schemaResult;
    }

    // 进行风格验证
    const styleCheck = this.validateStyle(content);
    const styleErrors = styleCheck.failure_reasons || [];

    return {
      valid: styleCheck.passed,
      style_check: styleCheck,
      style_errors: styleErrors.length > 0 ? styleErrors : undefined,
    };
  }

  /**
   * 验证内容风格
   */
  validateStyle(content: ExpertDriverContent): StyleCheckResult {
    const failureReasons: string[] = [];

    // 检查是否使用老司机视角语气
    const isDriverTone = this.checkDriverTone(content);
    if (!isDriverTone) {
      failureReasons.push('内容未使用老司机视角语气');
    }

    // 检查是否包含坑位解析
    const hasTraps = this.checkHasTraps(content);
    if (!hasTraps) {
      failureReasons.push('缺少有效的坑位解析');
    }

    // 检查是否包含口诀
    const hasMnemonic = this.checkHasMnemonic(content);
    if (!hasMnemonic) {
      failureReasons.push('缺少口诀');
    }

    // 检查是否有AI痕迹
    const noAiArtifacts = this.checkNoAiArtifacts(content);
    if (!noAiArtifacts) {
      failureReasons.push('检测到AI痕迹表达');
    }

    // 检查禁止模式
    const noForbiddenPatterns = this.checkNoForbiddenPatterns(content);
    if (!noForbiddenPatterns) {
      failureReasons.push('检测到禁止的表达模式');
    }

    // 检查坑位解析的详细验证
    const trapErrors = this.validateAllTrapAnalysis(content.坑位解析);
    failureReasons.push(...trapErrors);

    // 检查口诀行数
    const mnemonicErrors = this.validateMnemonicLineCount(content.坑位解析);
    failureReasons.push(...mnemonicErrors);

    // 检查坑位解析字符限制
    const lengthErrors = this.validateTrapAnalysisLength(content.坑位解析);
    failureReasons.push(...lengthErrors);

    const passed = failureReasons.length === 0;

    return {
      is_driver_tone: isDriverTone,
      has_traps: hasTraps,
      has_mnemonic: hasMnemonic,
      no_ai_artifacts: noAiArtifacts,
      no_forbidden_patterns: noForbiddenPatterns,
      passed,
      failure_reasons: failureReasons.length > 0 ? failureReasons : undefined,
    };
  }

  /**
   * 检查禁止模式
   */
  checkForbiddenPatterns(text: string): string[] {
    const found: string[] = [];
    for (const pattern of this.forbiddenPatterns) {
      if (text.includes(pattern)) {
        found.push(pattern);
      }
    }
    return found;
  }

  /**
   * 验证单个坑位解析
   */
  validateTrapAnalysis(trap: TrapAnalysis): string[] {
    const errors: string[] = [];

    // 检查必填字段
    if (!trap.标题 || trap.标题.trim() === '') {
      errors.push('坑位缺少标题');
    }
    if (!trap.出题套路 || trap.出题套路.trim() === '') {
      errors.push('坑位缺少出题套路');
    }
    if (!trap.坑在哪里 || trap.坑在哪里.length === 0) {
      errors.push('坑位缺少坑在哪里分析');
    }
    if (!trap.老司机技巧 || trap.老司机技巧.trim() === '') {
      errors.push('坑位缺少老司机技巧');
    }

    // 检查至少有口诀或场景化记忆之一
    if (!trap.口诀 && !trap.场景化记忆) {
      errors.push('坑位需要至少包含口诀或场景化记忆之一');
    }

    // 检查字符长度
    const totalLength = this.calculateTrapLength(trap);
    if (totalLength > CONSTRAINTS.TRAP_ITEM_MAX_LENGTH) {
      errors.push(`坑位内容超过${CONSTRAINTS.TRAP_ITEM_MAX_LENGTH}字符限制，当前${totalLength}字符`);
    }

    // 检查口诀行数
    if (trap.口诀) {
      const lineCount = (trap.口诀.match(/\n/g) || []).length + 1;
      if (lineCount > CONSTRAINTS.MNEMONIC_MAX_LINES) {
        errors.push(`口诀超过${CONSTRAINTS.MNEMONIC_MAX_LINES}行限制，当前${lineCount}行`);
      }
    }

    // 检查禁止模式
    const allText = [
      trap.标题,
      trap.出题套路,
      trap.坑在哪里.join(' '),
      trap.老司机技巧,
      trap.口诀 || '',
      trap.场景化记忆 || '',
    ].join(' ');

    const forbiddenFound = this.checkForbiddenPatterns(allText);
    if (forbiddenFound.length > 0) {
      errors.push(`坑位包含禁止表达：${forbiddenFound.join(', ')}`);
    }

    return errors;
  }

  /**
   * 计算坑位解析的总字符长度
   */
  private calculateTrapLength(trap: TrapAnalysis): number {
    return (
      (trap.标题?.length || 0) +
      (trap.出题套路?.length || 0) +
      (trap.坑在哪里?.join('').length || 0) +
      (trap.老司机技巧?.length || 0)
    );
  }

  /**
   * 检查是否使用老司机视角语气
   */
  private checkDriverTone(content: ExpertDriverContent): boolean {
    // 检查是否包含老司机相关的关键词
    const driverKeywords = ['老司机', '坑', '套路', '技巧', '秒选', '条件反射'];
    const allText = this.getAllContentText(content);
    
    return driverKeywords.some(keyword => allText.includes(keyword));
  }

  /**
   * 检查是否包含有效的坑位解析
   */
  private checkHasTraps(content: ExpertDriverContent): boolean {
    if (!content.坑位解析 || content.坑位解析.length === 0) {
      return false;
    }

    // 检查每个坑位是否包含"坑在哪里"
    return content.坑位解析.every(trap => 
      trap.坑在哪里 && trap.坑在哪里.length > 0
    );
  }

  /**
   * 检查是否包含口诀
   */
  private checkHasMnemonic(content: ExpertDriverContent): boolean {
    if (!content.坑位解析 || content.坑位解析.length === 0) {
      return false;
    }

    // 至少有一个坑位包含口诀
    return content.坑位解析.some(trap => trap.口诀 && trap.口诀.trim() !== '');
  }

  /**
   * 检查是否有AI痕迹
   */
  private checkNoAiArtifacts(content: ExpertDriverContent): boolean {
    const aiPatterns = ['AI觉得', '本模型', '作为AI', '作为一个AI', '我是AI'];
    const allText = this.getAllContentText(content);
    
    return !aiPatterns.some(pattern => allText.includes(pattern));
  }

  /**
   * 检查是否有禁止模式
   */
  private checkNoForbiddenPatterns(content: ExpertDriverContent): boolean {
    const allText = this.getAllContentText(content);
    const found = this.checkForbiddenPatterns(allText);
    return found.length === 0;
  }

  /**
   * 验证所有坑位解析
   */
  private validateAllTrapAnalysis(traps: TrapAnalysis[]): string[] {
    const errors: string[] = [];
    traps.forEach((trap, index) => {
      const trapErrors = this.validateTrapAnalysis(trap);
      trapErrors.forEach(err => {
        errors.push(`坑位${index + 1}: ${err}`);
      });
    });
    return errors;
  }

  /**
   * 验证口诀行数
   */
  private validateMnemonicLineCount(traps: TrapAnalysis[]): string[] {
    const errors: string[] = [];
    traps.forEach((trap, index) => {
      if (trap.口诀) {
        const lineCount = (trap.口诀.match(/\n/g) || []).length + 1;
        if (lineCount > CONSTRAINTS.MNEMONIC_MAX_LINES) {
          errors.push(`坑位${index + 1}的口诀超过${CONSTRAINTS.MNEMONIC_MAX_LINES}行限制`);
        }
      }
    });
    return errors;
  }

  /**
   * 验证坑位解析字符长度
   */
  private validateTrapAnalysisLength(traps: TrapAnalysis[]): string[] {
    const errors: string[] = [];
    traps.forEach((trap, index) => {
      const length = this.calculateTrapLength(trap);
      if (length > CONSTRAINTS.TRAP_ITEM_MAX_LENGTH) {
        errors.push(`坑位${index + 1}内容超过${CONSTRAINTS.TRAP_ITEM_MAX_LENGTH}字符限制`);
      }
    });
    return errors;
  }

  /**
   * 获取所有内容文本
   */
  private getAllContentText(content: ExpertDriverContent): string {
    const texts: string[] = [
      content.考点名称,
      content.终极思维导图,
      content.一句话极速总结,
      content.short_summary || '',
      ...content.应试战术,
    ];

    content.坑位解析.forEach(trap => {
      texts.push(trap.标题);
      texts.push(trap.出题套路);
      texts.push(...trap.坑在哪里);
      texts.push(trap.老司机技巧);
      if (trap.口诀) texts.push(trap.口诀);
      if (trap.场景化记忆) texts.push(trap.场景化记忆);
    });

    content.押题预测.forEach(pred => {
      texts.push(pred.题干);
      texts.push(pred.正确答案);
      texts.push(pred.理由);
    });

    return texts.join(' ');
  }
}

// 导出单例
export const styleValidator = new StyleValidator();

// 便捷函数
export function validateMnemonicLineCount(mnemonic: string): {
  valid: boolean;
  lineCount: number;
  error?: string;
} {
  const lineCount = (mnemonic.match(/\n/g) || []).length + 1;
  if (lineCount > CONSTRAINTS.MNEMONIC_MAX_LINES) {
    return {
      valid: false,
      lineCount,
      error: `口诀超过${CONSTRAINTS.MNEMONIC_MAX_LINES}行限制，当前${lineCount}行`,
    };
  }
  return { valid: true, lineCount };
}

export function validateTrapAnalysisCharacterLimit(trap: TrapAnalysis): {
  valid: boolean;
  length: number;
  error?: string;
} {
  const length = (trap.标题?.length || 0) +
    (trap.出题套路?.length || 0) +
    (trap.坑在哪里?.join('').length || 0) +
    (trap.老司机技巧?.length || 0);

  if (length > CONSTRAINTS.TRAP_ITEM_MAX_LENGTH) {
    return {
      valid: false,
      length,
      error: `坑位内容超过${CONSTRAINTS.TRAP_ITEM_MAX_LENGTH}字符限制，当前${length}字符`,
    };
  }
  return { valid: true, length };
}

export function checkForbiddenPatterns(text: string): string[] {
  return styleValidator.checkForbiddenPatterns(text);
}

export function generateStyleCheckResult(content: ExpertDriverContent): StyleCheckResult {
  return styleValidator.validateStyle(content);
}
