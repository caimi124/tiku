/**
 * 老司机模式 - Prompt模板管理器
 * Expert Driver Mode - Prompt Template Manager
 */

import {
  PromptTemplate,
  StyleRule,
  ExpertDriverContent,
  ValidationResult,
  FORBIDDEN_PATTERNS,
  CONSTRAINTS,
} from './types';
import { expertDriverContentSchema } from './schema-validator';
import { StyleValidator } from './style-validator';

// 默认v1.0模板
const DEFAULT_TEMPLATE: PromptTemplate = {
  version: 'v1.0',
  system_prompt: `你是一个负责为执业药师考试题库生成"老司机模式解析"的 AI 引擎。
目标是：输出风格高度统一、有趣但专业、结构清晰、可直接用于题库网站展示。

【整体写作风格要求】
1. 语气像一个考过药考十年的老司机，诙谐但专业、清晰、直击易错点。
2. 强调"出题人喜欢挖坑，考生容易掉坑"的角度。
3. 使用口诀、比喻、场景化记忆，使内容易背易联想。
4. 强调应试策略、题目套路、数字记忆法。
5. 不跑偏，不做无根据扩写，严格基于给定知识点生成内容。
6. 所有内容要短句、多分段，避免大段密集文字。

【字段说明】
- 坑位解析：3～6 个坑位，每个必须包含标题、套路、坑点、技巧，若适用加 口诀/场景。
- 技巧必须"短、好记、有画面感"，例如"看到XXX → 条件反射想到YYY"。
- 押题预测必须提供 2–4 道题，形式必须是"题干 + 正确答案 + 为什么选这个"。
- 终极思维导图：用代码块输出，结构必须清晰分层。
- 一句话总结：10～20 字以内，必须非常抓重点。

【核心写作规则】
- 强调"为什么容易错""出题人爱怎么坑""如何秒选答案"。
- 口诀使用代码块格式。
- 若知识点涉及数字，必须生成"数字口诀"或"数字陷阱"。
- 所有内容必须围绕考试，不输出临床医学扩展内容。
- 模板固定但表达不重复，保持自然口语风格。

【禁止输出】
- 不允许输出超过 300 字的坑位
- 不允许使用"首先、其次、总之、综上所述"这种教科书风格
- 不允许出现"AI觉得"、"可能"、"本模型"等AI痕迹
- 不允许加入药理学临床机制扩写
- 不允许引用未给出的知识`,

  user_prompt_template: `请根据以下知识点生成老司机模式解析：

【知识点内容】
{{knowledge_point_text}}

请严格按照JSON格式输出，包含以下字段：
- 考点名称
- 坑位解析（3-6个）
- 应试战术（2-5条）
- 押题预测（2-4道）
- 终极思维导图
- 一句话极速总结（10-20字）`,

  json_schema: expertDriverContentSchema,
  forbidden_patterns: FORBIDDEN_PATTERNS,
  style_rules: [
    {
      name: 'driver_tone',
      pattern: '老司机|坑|套路|技巧|秒选',
      type: 'required',
      message: '内容必须包含老司机风格关键词',
    },
    {
      name: 'no_academic_style',
      pattern: '首先|其次|总之|综上所述',
      type: 'forbidden',
      message: '不允许使用学术风格连接词',
    },
    {
      name: 'no_ai_artifacts',
      pattern: 'AI觉得|本模型|作为AI',
      type: 'forbidden',
      message: '不允许出现AI痕迹',
    },
  ],
  is_active: true,
};

// 模板存储（内存缓存）
const templateCache: Map<string, PromptTemplate> = new Map();
templateCache.set(DEFAULT_TEMPLATE.version, DEFAULT_TEMPLATE);

/**
 * Prompt模板管理器类
 */
export class PromptTemplateManager {
  private styleValidator: StyleValidator;

  constructor() {
    this.styleValidator = new StyleValidator();
  }

  /**
   * 获取当前活跃模板
   */
  getCurrentTemplate(): PromptTemplate {
    // 查找活跃模板
    for (const template of templateCache.values()) {
      if (template.is_active) {
        return template;
      }
    }
    // 默认返回v1.0
    return DEFAULT_TEMPLATE;
  }

  /**
   * 根据版本获取模板
   */
  getTemplateByVersion(version: string): PromptTemplate | null {
    return templateCache.get(version) || null;
  }

  /**
   * 验证AI输出
   */
  validateOutput(content: ExpertDriverContent): ValidationResult {
    return this.styleValidator.validate(content);
  }

  /**
   * 注册新模板
   */
  registerTemplate(template: PromptTemplate): void {
    // 如果新模板是活跃的，将其他模板设为非活跃
    if (template.is_active) {
      for (const [version, t] of templateCache.entries()) {
        if (t.is_active && version !== template.version) {
          templateCache.set(version, { ...t, is_active: false });
        }
      }
    }
    templateCache.set(template.version, template);
  }

  /**
   * 设置活跃模板
   */
  setActiveTemplate(version: string): boolean {
    const template = templateCache.get(version);
    if (!template) {
      return false;
    }

    // 将所有模板设为非活跃
    for (const [v, t] of templateCache.entries()) {
      if (t.is_active) {
        templateCache.set(v, { ...t, is_active: false });
      }
    }

    // 设置指定模板为活跃
    templateCache.set(version, { ...template, is_active: true });
    return true;
  }

  /**
   * 获取所有模板版本
   */
  getAllVersions(): string[] {
    return Array.from(templateCache.keys()).sort((a, b) => 
      PromptTemplateManager.compareVersions(a, b)
    );
  }

  /**
   * 生成完整的System Prompt
   */
  generateSystemPrompt(): string {
    const template = this.getCurrentTemplate();
    return template.system_prompt;
  }

  /**
   * 生成User Prompt
   */
  generateUserPrompt(knowledgePointText: string): string {
    const template = this.getCurrentTemplate();
    return template.user_prompt_template.replace(
      '{{knowledge_point_text}}',
      knowledgePointText
    );
  }

  /**
   * 比较版本号
   */
  static compareVersions(v1: string, v2: string): number {
    const parse = (v: string) => {
      const match = v.match(/^v(\d+)\.(\d+)$/);
      if (!match) return [0, 0];
      return [parseInt(match[1]), parseInt(match[2])];
    };

    const [major1, minor1] = parse(v1);
    const [major2, minor2] = parse(v2);

    if (major1 !== major2) return major1 - major2;
    return minor1 - minor2;
  }

  /**
   * 递增版本号
   */
  static incrementVersion(version: string, type: 'major' | 'minor' = 'minor'): string {
    const match = version.match(/^v(\d+)\.(\d+)$/);
    if (!match) return 'v1.0';

    let major = parseInt(match[1]);
    let minor = parseInt(match[2]);

    if (type === 'major') {
      major += 1;
      minor = 0;
    } else {
      minor += 1;
    }

    return `v${major}.${minor}`;
  }
}

// 导出单例
export const promptTemplateManager = new PromptTemplateManager();

// 便捷函数
export function getCurrentTemplateVersion(): string {
  return promptTemplateManager.getCurrentTemplate().version;
}

export function validateTemplateOutput(content: ExpertDriverContent): ValidationResult {
  return promptTemplateManager.validateOutput(content);
}

export function compareVersions(v1: string, v2: string): number {
  return PromptTemplateManager.compareVersions(v1, v2);
}

export function incrementVersion(version: string, type: 'major' | 'minor' = 'minor'): string {
  return PromptTemplateManager.incrementVersion(version, type);
}
