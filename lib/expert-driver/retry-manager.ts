/**
 * 老司机模式 - 重试管理器
 * Expert Driver Mode - Retry Manager
 */

import {
  ExpertDriverContent,
  RetryConfig,
  RetryAttempt,
  RetryResult,
  GenerationRequest,
  ValidationResult,
  ReviewQueueItem,
  CONSTRAINTS,
} from './types';
import { StyleValidator } from './style-validator';

// 默认重试配置
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  min_retries: CONSTRAINTS.RETRY_MIN,
  max_retries: CONSTRAINTS.RETRY_MAX,
  retry_delay_ms: 1000,
};

// 重试日志存储
const retryLogs: Map<string, RetryAttempt[]> = new Map();

/**
 * 重试管理器类
 */
export class RetryManager {
  private config: RetryConfig;
  private styleValidator: StyleValidator;
  private reviewQueue: ReviewQueueItem[] = [];

  constructor(config?: Partial<RetryConfig>) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
    this.styleValidator = new StyleValidator();
    
    // 确保配置在有效范围内
    this.config.min_retries = Math.max(CONSTRAINTS.RETRY_MIN, this.config.min_retries);
    this.config.max_retries = Math.min(CONSTRAINTS.RETRY_MAX, this.config.max_retries);
  }

  /**
   * 带重试执行生成
   */
  async executeWithRetry(
    generator: () => Promise<ExpertDriverContent>,
    request: GenerationRequest
  ): Promise<RetryResult> {
    const attempts: RetryAttempt[] = [];
    let lastContent: ExpertDriverContent | undefined;
    let success = false;

    for (let attempt = 1; attempt <= this.config.max_retries; attempt++) {
      try {
        const content = await generator();
        lastContent = content;

        // 验证内容
        const validation = this.styleValidator.validate(content);

        if (validation.valid) {
          success = true;
          break;
        }

        // 记录失败尝试
        const errorType = this.determineErrorType(validation);
        const attemptRecord: RetryAttempt = {
          attempt_number: attempt,
          error_type: errorType,
          error_details: this.formatValidationErrors(validation),
          timestamp: new Date(),
        };
        attempts.push(attemptRecord);

        // 记录日志
        this.logRetryAttempt(request.knowledge_point_id, attemptRecord);

        // 如果还有重试机会，等待后继续
        if (attempt < this.config.max_retries) {
          await this.delay(this.config.retry_delay_ms * attempt);
        }
      } catch (error) {
        // 记录异常
        const attemptRecord: RetryAttempt = {
          attempt_number: attempt,
          error_type: 'schema',
          error_details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
        };
        attempts.push(attemptRecord);
        this.logRetryAttempt(request.knowledge_point_id, attemptRecord);

        if (attempt < this.config.max_retries) {
          await this.delay(this.config.retry_delay_ms * attempt);
        }
      }
    }

    // 如果所有重试都失败，添加到审核队列
    let sentToReviewQueue = false;
    if (!success && attempts.length >= this.config.min_retries) {
      await this.addToReviewQueue(request, attempts);
      sentToReviewQueue = true;
    }

    return {
      success,
      content: success ? lastContent : undefined,
      attempts,
      sent_to_review_queue: sentToReviewQueue,
    };
  }

  /**
   * 添加到审核队列
   */
  async addToReviewQueue(
    request: GenerationRequest,
    attempts: RetryAttempt[]
  ): Promise<void> {
    const queueItem: ReviewQueueItem = {
      knowledge_point_id: request.knowledge_point_id,
      knowledge_point_text: request.knowledge_point_text,
      style_variant: request.style_variant || 'default',
      retry_attempts: attempts,
      status: 'pending',
      created_at: new Date(),
    };

    this.reviewQueue.push(queueItem);
  }

  /**
   * 获取审核队列
   */
  getReviewQueue(): ReviewQueueItem[] {
    return [...this.reviewQueue];
  }

  /**
   * 获取指定状态的审核项
   */
  getReviewQueueByStatus(status: ReviewQueueItem['status']): ReviewQueueItem[] {
    return this.reviewQueue.filter(item => item.status === status);
  }

  /**
   * 更新审核项状态
   */
  updateReviewStatus(
    knowledgePointId: string,
    status: ReviewQueueItem['status'],
    notes?: string
  ): boolean {
    const item = this.reviewQueue.find(
      i => i.knowledge_point_id === knowledgePointId && i.status === 'pending'
    );

    if (!item) return false;

    item.status = status;
    item.reviewer_notes = notes;
    item.reviewed_at = new Date();
    return true;
  }

  /**
   * 检查是否应该触发重试
   */
  shouldRetry(validation: ValidationResult): boolean {
    if (validation.valid) return false;

    // 检查是否有可重试的错误类型
    const hasSchemaErrors = !!(validation.schema_errors && validation.schema_errors.length > 0);
    const hasStyleErrors = !!(validation.style_errors && validation.style_errors.length > 0);

    return hasSchemaErrors || hasStyleErrors;
  }

  /**
   * 获取重试日志
   */
  getRetryLogs(knowledgePointId: string): RetryAttempt[] {
    return retryLogs.get(knowledgePointId) || [];
  }

  /**
   * 获取所有重试日志
   */
  getAllRetryLogs(): Map<string, RetryAttempt[]> {
    return new Map(retryLogs);
  }

  /**
   * 清除重试日志
   */
  clearRetryLogs(knowledgePointId?: string): void {
    if (knowledgePointId) {
      retryLogs.delete(knowledgePointId);
    } else {
      retryLogs.clear();
    }
  }

  /**
   * 获取配置
   */
  getConfig(): RetryConfig {
    return { ...this.config };
  }

  // ============ 私有方法 ============

  private determineErrorType(validation: ValidationResult): RetryAttempt['error_type'] {
    if (validation.schema_errors && validation.schema_errors.length > 0) {
      const errors = validation.schema_errors.join(' ');
      if (errors.includes('超过') || errors.includes('太长')) {
        return 'length';
      }
      if (errors.includes('缺少') || errors.includes('缺失')) {
        return 'missing_fields';
      }
      return 'schema';
    }
    return 'style';
  }

  private formatValidationErrors(validation: ValidationResult): string {
    const errors: string[] = [];
    if (validation.schema_errors) {
      errors.push(...validation.schema_errors);
    }
    if (validation.style_errors) {
      errors.push(...validation.style_errors);
    }
    if (validation.style_check.failure_reasons) {
      errors.push(...validation.style_check.failure_reasons);
    }
    return errors.join('; ');
  }

  private logRetryAttempt(knowledgePointId: string, attempt: RetryAttempt): void {
    const existing = retryLogs.get(knowledgePointId) || [];
    existing.push(attempt);
    retryLogs.set(knowledgePointId, existing);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出单例
export const retryManager = new RetryManager();

// 便捷函数
export function getRetryConfig(): RetryConfig {
  return retryManager.getConfig();
}

export function getRetryLogs(knowledgePointId: string): RetryAttempt[] {
  return retryManager.getRetryLogs(knowledgePointId);
}

export function shouldTriggerRetry(validation: ValidationResult): boolean {
  return retryManager.shouldRetry(validation);
}
