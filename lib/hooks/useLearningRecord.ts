/**
 * 学习记录 Hook
 *
 * 用于在练习页面中记录答题数据并更新掌握度
 *
 * Requirements: 2.1, 2.2
 */

import { useState, useCallback } from 'react'

export interface RecordAnswerParams {
  knowledgePointId: string
  questionId?: string
  contentItem?: string
  isCorrect: boolean
  timeSpent: number
}

export interface LearningRecordHook {
  /** 记录答题 */
  recordAnswer: (params: RecordAnswerParams) => Promise<boolean>
  /** 是否正在提交 */
  isSubmitting: boolean
  /** 错误信息 */
  error: string | null
  /** 清除错误 */
  clearError: () => void
}

/**
 * 学习记录 Hook
 *
 * @param userId 用户ID
 * @returns 学习记录操作方法
 */
export function useLearningRecord(userId: string): LearningRecordHook {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recordAnswer = useCallback(
    async (params: RecordAnswerParams): Promise<boolean> => {
      if (!userId) {
        setError('用户未登录')
        return false
      }

      setIsSubmitting(true)
      setError(null)

      try {
        const response = await fetch('/api/learning-records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            knowledgePointId: params.knowledgePointId,
            questionId: params.questionId,
            contentItem: params.contentItem,
            isCorrect: params.isCorrect,
            timeSpent: params.timeSpent,
          }),
        })

        const data = await response.json()

        if (data.success) {
          return true
        } else {
          setError(data.error || '记录失败')
          return false
        }
      } catch (err) {
        setError('网络错误，请稍后重试')
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [userId]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    recordAnswer,
    isSubmitting,
    error,
    clearError,
  }
}

export default useLearningRecord
