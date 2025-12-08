/**
 * SequentialLearning 组件
 * 
 * 顺序学习模式组件，提供按顺序学习所有考点的功能
 * 
 * 功能：
 * - 首页提供"开始顺序学习"按钮
 * - 跳转到第一个未完成的考点
 * - 记录学习位置，支持继续学习
 * 
 * Requirements: 11.1, 11.2, 11.6
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Play, RotateCcw, CheckCircle, Loader2 } from 'lucide-react'

// 学习位置记录
interface LearningPosition {
  pointId: string
  pointTitle: string
  sectionId: string
  sectionTitle: string
  chapterId: string
  chapterTitle: string
  progress: number // 0-100
  totalPoints: number
  completedPoints: number
  lastUpdated: string
}

const LEARNING_POSITION_KEY = 'sequential_learning_position'

export interface SequentialLearningProps {
  subject?: string
  className?: string
  variant?: 'button' | 'card'
}

export function SequentialLearning({
  subject = 'xiyao_yaoxue_er',
  className = '',
  variant = 'button'
}: SequentialLearningProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState<LearningPosition | null>(null)
  
  // 加载学习位置
  useEffect(() => {
    loadPosition()
  }, [])
  
  const loadPosition = () => {
    try {
      const saved = localStorage.getItem(LEARNING_POSITION_KEY)
      if (saved) {
        setPosition(JSON.parse(saved))
      }
    } catch (e) {
      // ignore
    }
  }
  
  // 开始/继续学习
  const handleStart = async () => {
    setLoading(true)
    try {
      // 如果有保存的位置，直接跳转
      if (position?.pointId) {
        router.push(`/knowledge/point/${position.pointId}?mode=sequential`)
        return
      }
      
      // 否则获取第一个未完成的考点
      const res = await fetch(`/api/user/progress/next-point?subject=${subject}`)
      const data = await res.json()
      
      if (data.success && data.data.nextPoint) {
        const nextPoint = data.data.nextPoint
        
        // 保存位置
        const newPosition: LearningPosition = {
          pointId: nextPoint.id,
          pointTitle: nextPoint.title,
          sectionId: nextPoint.section_id,
          sectionTitle: nextPoint.section_title,
          chapterId: nextPoint.chapter_id,
          chapterTitle: nextPoint.chapter_title,
          progress: data.data.progress || 0,
          totalPoints: data.data.totalPoints || 0,
          completedPoints: data.data.completedPoints || 0,
          lastUpdated: new Date().toISOString()
        }
        
        localStorage.setItem(LEARNING_POSITION_KEY, JSON.stringify(newPosition))
        setPosition(newPosition)
        
        router.push(`/knowledge/point/${nextPoint.id}?mode=sequential`)
      } else {
        // 所有考点都已完成
        alert('恭喜！你已完成所有考点的学习！')
      }
    } catch (error) {
      console.error('获取下一个考点失败:', error)
      alert('获取学习进度失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }
  
  // 重新开始
  const handleRestart = async () => {
    if (!confirm('确定要重新开始学习吗？这将清除当前的学习位置记录。')) {
      return
    }
    
    localStorage.removeItem(LEARNING_POSITION_KEY)
    setPosition(null)
    
    setLoading(true)
    try {
      const res = await fetch(`/api/user/progress/first-point?subject=${subject}`)
      const data = await res.json()
      
      if (data.success && data.data.firstPoint) {
        router.push(`/knowledge/point/${data.data.firstPoint.id}?mode=sequential`)
      }
    } catch (error) {
      console.error('获取第一个考点失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 按钮样式
  if (variant === 'button') {
    return (
      <button
        onClick={handleStart}
        disabled={loading}
        className={`
          px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 
          text-white rounded-lg hover:from-green-600 hover:to-emerald-600 
          transition-all shadow-sm hover:shadow-md
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-2 font-medium
          ${className}
        `}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : position ? (
          <RotateCcw className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        {position ? '继续学习' : '开始顺序学习'}
      </button>
    )
  }
  
  // 卡片样式
  return (
    <div className={`bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg mb-1">
            {position ? '继续学习' : '开始顺序学习'}
          </h3>
          {position ? (
            <div className="text-white/80 text-sm space-y-1">
              <p>上次学到：{position.pointTitle}</p>
              <p>进度：{position.completedPoints}/{position.totalPoints} ({position.progress}%)</p>
            </div>
          ) : (
            <p className="text-white/80 text-sm">
              按章节顺序学习所有考点，系统会记录你的进度
            </p>
          )}
        </div>
        
        {position && position.progress >= 100 && (
          <CheckCircle className="w-8 h-8 text-white/80" />
        )}
      </div>
      
      {/* 进度条 */}
      {position && (
        <div className="mt-4">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${position.progress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* 按钮 */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleStart}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-white text-green-600 rounded-lg 
                     hover:bg-green-50 transition font-medium
                     disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {position ? '继续' : '开始'}
        </button>
        
        {position && (
          <button
            onClick={handleRestart}
            disabled={loading}
            className="px-4 py-2 bg-white/20 text-white rounded-lg 
                       hover:bg-white/30 transition font-medium
                       disabled:opacity-50 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            重新开始
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * 保存学习位置
 */
export function saveSequentialPosition(position: Partial<LearningPosition>) {
  try {
    const current = localStorage.getItem(LEARNING_POSITION_KEY)
    const existing = current ? JSON.parse(current) : {}
    
    const updated: LearningPosition = {
      ...existing,
      ...position,
      lastUpdated: new Date().toISOString()
    }
    
    localStorage.setItem(LEARNING_POSITION_KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('保存学习位置失败:', e)
  }
}

/**
 * 获取学习位置
 */
export function getSequentialPosition(): LearningPosition | null {
  try {
    const saved = localStorage.getItem(LEARNING_POSITION_KEY)
    return saved ? JSON.parse(saved) : null
  } catch (e) {
    return null
  }
}

/**
 * 清除学习位置
 */
export function clearSequentialPosition() {
  localStorage.removeItem(LEARNING_POSITION_KEY)
}

export default SequentialLearning
