/**
 * 老司机模式 - 内容生成器
 * Expert Driver Mode - Content Generator
 */

import {
  ExpertDriverContent,
  GenerationRequest,
  GenerationResult,
  BatchResult,
  StyleVariant,
} from './types';
import { PromptTemplateManager, promptTemplateManager } from './prompt-template-manager';
import { StyleValidator, styleValidator } from './style-validator';
import { RetryManager, retryManager } from './retry-manager';

/**
 * 内容生成器类
 */
export class ContentGenerator {
  private promptManager: PromptTemplateManager;
  private validator: StyleValidator;
  private retryMgr: RetryManager;

  constructor(
    promptManager?: PromptTemplateManager,
    validator?: StyleValidator,
    retryMgr?: RetryManager
  ) {
    this.promptManager = promptManager || promptTemplateManager;
    this.validator = validator || styleValidator;
    this.retryMgr = retryMgr || retryManager;
  }

  /**
   * 生成单个知识点的老司机内容
   */
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const result = await this.retryMgr.executeWithRetry(
      () => this.callAI(request),
      request
    );

    return {
      success: result.success,
      content: result.content,
      error: result.success ? undefined : '生成失败，已加入审核队列',
      retry_count: result.attempts.length,
      style_check: result.content?.style_check || {
        is_driver_tone: false,
        has_traps: false,
        has_mnemonic: false,
        no_ai_artifacts: false,
        no_forbidden_patterns: false,
        passed: false,
      },
    };
  }

  /**
   * 批量生成
   */
  async generateBatch(requests: GenerationRequest[]): Promise<BatchResult> {
    const results: BatchResult['results'] = [];
    let successCount = 0;
    let failedCount = 0;

    for (const request of requests) {
      try {
        const result = await this.generate(request);
        results.push({
          knowledge_point_id: request.knowledge_point_id,
          success: result.success,
          error: result.error,
        });

        if (result.success) {
          successCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        failedCount++;
        results.push({
          knowledge_point_id: request.knowledge_point_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      total: requests.length,
      success: successCount,
      failed: failedCount,
      results,
    };
  }

  /**
   * 调用AI生成内容
   * 注意：这是一个模拟实现，实际使用时需要替换为真实的AI API调用
   */
  private async callAI(request: GenerationRequest): Promise<ExpertDriverContent> {
    const systemPrompt = this.promptManager.generateSystemPrompt();
    const userPrompt = this.promptManager.generateUserPrompt(request.knowledge_point_text);
    const templateVersion = this.promptManager.getCurrentTemplate().version;

    // 这里应该调用实际的AI API
    // 目前返回一个模拟的响应结构
    // 实际实现时，需要：
    // 1. 调用OpenAI/Claude等API
    // 2. 解析JSON响应
    // 3. 验证响应格式

    // 模拟AI响应（实际使用时替换）
    const mockContent: ExpertDriverContent = {
      knowledge_point_id: request.knowledge_point_id,
      考点名称: `${request.knowledge_point_text.substring(0, 20)}...`,
      坑位解析: [
        {
          标题: '数字陷阱题',
          出题套路: '出题人喜欢在数字上挖坑',
          坑在哪里: ['容易记混数字', '单位换算出错'],
          老司机技巧: '看到数字立刻画圈标记',
          口诀: '数字题\n先画圈\n再计算',
        },
        {
          标题: '概念混淆题',
          出题套路: '相似概念放一起迷惑你',
          坑在哪里: ['名称相似容易混', '作用机制搞不清'],
          老司机技巧: '对比记忆找差异',
          场景化记忆: '想象两个药物在打架',
        },
        {
          标题: '例外情况题',
          出题套路: '考你知不知道特殊情况',
          坑在哪里: ['只记住了一般规则', '忘了特殊例外'],
          老司机技巧: '例外单独背，考试必考',
          口诀: '一般规则要记牢\n特殊例外更重要',
        },
      ],
      应试战术: [
        '看到数字先画圈',
        '相似选项找差异',
        '例外情况单独记',
      ],
      押题预测: [
        {
          题干: '关于该知识点，下列说法正确的是？',
          正确答案: 'A',
          理由: '这是最常考的考点',
        },
        {
          题干: '该知识点的特殊情况是？',
          正确答案: 'B',
          理由: '例外情况必考',
        },
      ],
      终极思维导图: '```\n知识点\n├── 基本概念\n├── 常见考点\n└── 特殊例外\n```',
      一句话极速总结: '数字画圈例外单独记',
      version: 'v1.0',
      style_variant: request.style_variant || 'default',
      source_knowledge_point_text: request.knowledge_point_text,
      prompt_template_version: templateVersion,
      style_check: {
        is_driver_tone: true,
        has_traps: true,
        has_mnemonic: true,
        no_ai_artifacts: true,
        no_forbidden_patterns: true,
        passed: true,
      },
    };

    return mockContent;
  }

  /**
   * 获取系统提示词
   */
  getSystemPrompt(): string {
    return this.promptManager.generateSystemPrompt();
  }

  /**
   * 获取用户提示词
   */
  getUserPrompt(knowledgePointText: string): string {
    return this.promptManager.generateUserPrompt(knowledgePointText);
  }
}

// 导出单例
export const contentGenerator = new ContentGenerator();
