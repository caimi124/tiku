/**
 * 掌握度计算服务
 * 实现掌握度计算和艾宾浩斯遗忘曲线算法
 * 
 * Requirements: 2.2, 2.5, 5.1
 */

// ============================================
// 类型定义
// ============================================

export interface MasteryCalculationInput {
  /** 基础正确率 (0-100) */
  baseAccuracy: number
  /** 最近5次答题的正确率 (0-100) */
  recentPerformance: number
  /** 距离上次复习的天数 */
  daysSinceLastReview: number
  /** 题目平均难度 (1-5) */
  averageDifficulty?: number
}

export interface MasteryResult {
  /** 掌握度分数 (0-100) */
  score: number
  /** 掌握状态 */
  status: 'mastered' | 'review' | 'weak' | 'unlearned'
  /** 状态文本 */
  statusText: string
  /** 是否为薄弱点 */
  isWeakPoint: boolean
  /** 是否已掌握 */
  isMastered: boolean
}

export interface ReviewRecommendation {
  /** 下次复习日期 */
  nextReviewDate: Date
  /** 复习间隔天数 */
  intervalDays: number
  /** 复习等级 (0-5) */
  level: number
  /** 是否紧急 */
  isUrgent: boolean
}

// ============================================
// 常量配置
// ============================================

/** 掌握度阈值 */
export const MASTERY_THRESHOLDS = {
  MASTERED: 80,    // ≥80% 已掌握
  REVIEW: 60,      // 60-79% 需复习
  WEAK: 0,         // <60% 薄弱
} as const

/** 权重配置 */
export const MASTERY_WEIGHTS = {
  BASE_ACCURACY: 0.4,      // 基础正确率权重 40%
  RECENT_PERFORMANCE: 0.3, // 最近表现权重 30%
  TIME_DECAY: 0.2,         // 时间衰减权重 20%
  DIFFICULTY: 0.1,         // 难度加权 10%
} as const

/** 艾宾浩斯遗忘曲线复习间隔（天） */
export const EBBINGHAUS_INTERVALS = [1, 2, 4, 7, 15, 30] as const

/** 时间衰减系数 */
const TIME_DECAY_FACTOR = 0.1 // 每天衰减10%

// ============================================
// 核心计算函数
// ============================================

/**
 * 计算掌握度分数
 * 
 * 公式: score = baseAccuracy * 0.4 + recentPerformance * 0.3 + (100 - timeDecay) * 0.2 + difficultyBonus * 0.1
 * 
 * @param input 计算输入参数
 * @returns 掌握度结果
 */
export function calculateMastery(input: MasteryCalculationInput): MasteryResult {
  const {
    baseAccuracy,
    recentPerformance,
    daysSinceLastReview,
    averageDifficulty = 3,
  } = input

  // 1. 基础正确率分数 (40%)
  const baseScore = Math.max(0, Math.min(100, baseAccuracy)) * MASTERY_WEIGHTS.BASE_ACCURACY

  // 2. 最近表现分数 (30%)
  const recentScore = Math.max(0, Math.min(100, recentPerformance)) * MASTERY_WEIGHTS.RECENT_PERFORMANCE

  // 3. 时间衰减分数 (20%)
  // 使用指数衰减: decay = 100 * e^(-k * days)
  const timeDecay = calculateTimeDecay(daysSinceLastReview)
  const timeScore = (100 - timeDecay) * MASTERY_WEIGHTS.TIME_DECAY

  // 4. 难度加权分数 (10%)
  // 难度越高，答对加分越多
  const difficultyBonus = calculateDifficultyBonus(baseAccuracy, averageDifficulty)
  const difficultyScore = difficultyBonus * MASTERY_WEIGHTS.DIFFICULTY

  // 计算总分
  const totalScore = Math.round(
    Math.max(0, Math.min(100, baseScore + recentScore + timeScore + difficultyScore))
  )

  // 确定状态
  const status = getMasteryStatus(totalScore)

  return {
    score: totalScore,
    status: status.status,
    statusText: status.text,
    isWeakPoint: totalScore < MASTERY_THRESHOLDS.REVIEW,
    isMastered: totalScore >= MASTERY_THRESHOLDS.MASTERED,
  }
}

/**
 * 计算时间衰减
 * 使用艾宾浩斯遗忘曲线的简化模型
 * 
 * @param daysSinceLastReview 距离上次复习的天数
 * @returns 衰减值 (0-100)
 */
export function calculateTimeDecay(daysSinceLastReview: number): number {
  if (daysSinceLastReview <= 0) return 0
  
  // 使用指数衰减模型: decay = 100 * (1 - e^(-k * days))
  // k = 0.1 表示每天衰减约10%
  const decay = 100 * (1 - Math.exp(-TIME_DECAY_FACTOR * daysSinceLastReview))
  
  // 最大衰减80%，保留20%的基础记忆
  return Math.min(80, decay)
}

/**
 * 计算难度加权分数
 * 
 * @param accuracy 正确率
 * @param difficulty 难度 (1-5)
 * @returns 加权分数 (0-100)
 */
export function calculateDifficultyBonus(accuracy: number, difficulty: number): number {
  // 难度系数: 1星=0.6, 2星=0.8, 3星=1.0, 4星=1.2, 5星=1.4
  const difficultyMultiplier = 0.4 + (difficulty * 0.2)
  
  // 正确率越高 + 难度越大 = 加分越多
  return Math.min(100, accuracy * difficultyMultiplier)
}

/**
 * 获取掌握状态
 */
export function getMasteryStatus(score: number): { status: MasteryResult['status']; text: string } {
  if (score >= MASTERY_THRESHOLDS.MASTERED) {
    return { status: 'mastered', text: '已掌握' }
  }
  if (score >= MASTERY_THRESHOLDS.REVIEW) {
    return { status: 'review', text: '需复习' }
  }
  if (score > 0) {
    return { status: 'weak', text: '薄弱' }
  }
  return { status: 'unlearned', text: '未学习' }
}

// ============================================
// 艾宾浩斯遗忘曲线
// ============================================

/**
 * 计算下次复习日期（基于艾宾浩斯遗忘曲线）
 * 
 * 复习间隔: 1天 -> 2天 -> 4天 -> 7天 -> 15天 -> 30天
 * 
 * @param masteryScore 当前掌握度分数
 * @param lastReviewDate 上次复习日期
 * @returns 复习推荐
 */
export function getNextReviewDate(
  masteryScore: number,
  lastReviewDate: Date | null
): ReviewRecommendation {
  // 根据掌握度确定复习等级 (0-5)
  // 掌握度越高，复习间隔越长
  const level = Math.min(5, Math.floor(masteryScore / 20))
  
  // 获取对应的复习间隔
  const intervalDays = EBBINGHAUS_INTERVALS[level]
  
  // 计算下次复习日期
  const baseDate = lastReviewDate || new Date()
  const nextReviewDate = new Date(baseDate)
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays)
  
  // 判断是否紧急（已过期或即将到期）
  const now = new Date()
  const daysUntilReview = Math.ceil(
    (nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )
  const isUrgent = daysUntilReview <= 0

  return {
    nextReviewDate,
    intervalDays,
    level,
    isUrgent,
  }
}

/**
 * 判断是否需要立即复习
 * 条件: 掌握度 < 70% 且 重要性 >= 4星
 * 
 * @param masteryScore 掌握度分数
 * @param importance 重要性等级 (1-5)
 * @returns 是否需要立即复习
 */
export function needsImmediateReview(masteryScore: number, importance: number): boolean {
  return masteryScore < 70 && importance >= 4
}

/**
 * 计算复习优先级分数
 * 
 * 公式: priority = (100 - mastery) * 0.4 + importance * 10 * 0.3 + daysSinceReview * 3.33 * 0.3
 * 
 * @param masteryScore 掌握度分数
 * @param importance 重要性等级 (1-5)
 * @param daysSinceReview 距离上次复习的天数
 * @returns 优先级分数 (0-100)
 */
export function calculateReviewPriority(
  masteryScore: number,
  importance: number,
  daysSinceReview: number
): number {
  const masteryFactor = (100 - masteryScore) * 0.4
  const importanceFactor = importance * 10 * 0.3
  const timeFactor = Math.min(30, daysSinceReview) * 3.33 * 0.3
  
  return Math.round(Math.max(0, Math.min(100, masteryFactor + importanceFactor + timeFactor)))
}

// ============================================
// 工具函数
// ============================================

/**
 * 获取掌握度对应的颜色
 */
export function getMasteryColor(score: number): string {
  if (score >= MASTERY_THRESHOLDS.MASTERED) return 'green'
  if (score >= MASTERY_THRESHOLDS.REVIEW) return 'yellow'
  if (score > 0) return 'red'
  return 'gray'
}

/**
 * 获取掌握度对应的 Tailwind CSS 类
 */
export function getMasteryColorClass(score: number): {
  bg: string
  text: string
  bar: string
} {
  if (score >= MASTERY_THRESHOLDS.MASTERED) {
    return { bg: 'bg-green-100', text: 'text-green-600', bar: 'bg-green-500' }
  }
  if (score >= MASTERY_THRESHOLDS.REVIEW) {
    return { bg: 'bg-yellow-100', text: 'text-yellow-600', bar: 'bg-yellow-500' }
  }
  if (score > 0) {
    return { bg: 'bg-red-100', text: 'text-red-600', bar: 'bg-red-500' }
  }
  return { bg: 'bg-gray-100', text: 'text-gray-400', bar: 'bg-gray-300' }
}

/**
 * 格式化复习时间
 */
export function formatReviewTime(date: Date): string {
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return `已过期 ${Math.abs(diffDays)} 天`
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays <= 7) return `${diffDays} 天后`
  return date.toLocaleDateString('zh-CN')
}
