/**
 * 老司机模式 - 类型定义
 * Expert Driver Mode - Type Definitions
 */

// 风格变体类型
export type StyleVariant = 'default' | 'compact' | 'mobile' | 'video_script';

// 坑位解析
export interface TrapAnalysis {
  标题: string;
  出题套路: string;
  坑在哪里: string[];
  老司机技巧: string;
  口诀?: string;
  场景化记忆?: string;
}

// 押题预测
export interface PredictionQuestion {
  题干: string;
  正确答案: string;
  理由: string;
}

// 风格检查结果
export interface StyleCheckResult {
  is_driver_tone: boolean;
  has_traps: boolean;
  has_mnemonic: boolean;
  no_ai_artifacts: boolean;
  no_forbidden_patterns: boolean;
  passed: boolean;
  failure_reasons?: string[];
}

// 老司机内容主体
export interface ExpertDriverContent {
  id?: string;
  knowledge_point_id: string;
  考点名称: string;
  坑位解析: TrapAnalysis[];
  应试战术: string[];
  押题预测: PredictionQuestion[];
  终极思维导图: string;
  一句话极速总结: string;
  short_summary?: string;
  version: string;
  style_variant: StyleVariant;
  source_knowledge_point_text: string;
  prompt_template_version: string;
  style_check: StyleCheckResult;
  created_at?: Date;
  updated_at?: Date;
}

// 生成请求
export interface GenerationRequest {
  knowledge_point_id: string;
  knowledge_point_text: string;
  style_variant?: StyleVariant;
}

// 生成结果
export interface GenerationResult {
  success: boolean;
  content?: ExpertDriverContent;
  error?: string;
  retry_count: number;
  style_check: StyleCheckResult;
}

// 批量处理结果
export interface BatchResult {
  total: number;
  success: number;
  failed: number;
  results: Array<{
    knowledge_point_id: string;
    success: boolean;
    error?: string;
  }>;
}

// 验证结果
export interface ValidationResult {
  valid: boolean;
  style_check: StyleCheckResult;
  schema_errors?: string[];
  style_errors?: string[];
}

// 重试配置
export interface RetryConfig {
  min_retries: number;
  max_retries: number;
  retry_delay_ms: number;
}

// 重试尝试记录
export interface RetryAttempt {
  attempt_number: number;
  error_type: 'schema' | 'style' | 'length' | 'missing_fields';
  error_details: string;
  timestamp: Date;
}

// 重试结果
export interface RetryResult {
  success: boolean;
  content?: ExpertDriverContent;
  attempts: RetryAttempt[];
  sent_to_review_queue: boolean;
}

// Prompt模板
export interface PromptTemplate {
  id?: string;
  version: string;
  system_prompt: string;
  user_prompt_template: string;
  json_schema: object;
  forbidden_patterns: string[];
  style_rules: StyleRule[];
  is_active: boolean;
  created_at?: Date;
}

// 风格规则
export interface StyleRule {
  name: string;
  pattern: string; // RegExp pattern as string
  type: 'required' | 'forbidden';
  message: string;
}

// 审核队列项
export interface ReviewQueueItem {
  id?: string;
  knowledge_point_id: string;
  knowledge_point_text: string;
  style_variant: StyleVariant;
  retry_attempts: RetryAttempt[];
  status: 'pending' | 'approved' | 'rejected' | 'regenerated';
  reviewer_notes?: string;
  created_at?: Date;
  reviewed_at?: Date;
}

// 常量
export const STYLE_VARIANTS: StyleVariant[] = ['default', 'compact', 'mobile', 'video_script'];

export const FORBIDDEN_PATTERNS = [
  'AI觉得',
  '可能',
  '本模型',
  '首先',
  '其次',
  '总之',
  '综上所述',
  '作为AI',
  '作为一个AI',
];

export const VERSION_PATTERN = /^v\d+\.\d+$/;

export const CONSTRAINTS = {
  TRAP_ANALYSIS_MIN: 3,
  TRAP_ANALYSIS_MAX: 6,
  PREDICTION_MIN: 2,
  PREDICTION_MAX: 4,
  SUMMARY_MIN_LENGTH: 10,
  SUMMARY_MAX_LENGTH: 20,
  SHORT_SUMMARY_MAX_LENGTH: 50,
  TRAP_ITEM_MAX_LENGTH: 300,
  MNEMONIC_MAX_LINES: 3,
  RETRY_MIN: 2,
  RETRY_MAX: 5,
};
