/**
 * ExpertTipsPanel 组件
 * 老司机带路面板，包含5个子模块
 * 
 * Requirements: 2.1, 2.2
 */

'use client'

import React, { useState } from 'react'
import {
  ExpertTips,
  ExpertTipsModule,
  MODULE_CONFIG,
  ALL_MODULES,
  isExpertTipsEmpty,
  getNonEmptyModules,
  MEMORY_TYPE_CONFIG,
  getProbabilityConfig,
  ExamPattern,
  TrapAnalysis,
  MemoryTechnique,
  ExamTactic,
  Prediction
} from '@/lib/expert-tips-utils'

// Re-export types
export type {
  ExpertTips,
  ExamPattern,
  TrapAnalysis,
  MemoryTechnique,
  ExamTactic,
  Prediction
}

export interface ExpertTipsPanelProps {
  tips: ExpertTips
  loading?: boolean
  className?: string
}

export function ExpertTipsPanel({
  tips,
  loading = false,
  className = ''
}: ExpertTipsPanelProps) {
  const [expandedModules, setExpandedModules] = useState<Set<ExpertTipsModule>>(
    new Set(ALL_MODULES)
  )

  const toggleModule = (module: ExpertTipsModule) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(module)) {
      newExpanded.delete(module)
    } else {
      newExpanded.add(module)
    }
    setExpandedModules(newExpanded)
  }

  if (loading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
    )
  }

  if (isExpertTipsEmpty(tips)) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <span className="text-4xl mb-4 block">🚗</span>
        <p>暂无老司机带路内容，敬请期待</p>
      </div>
    )
  }

  const nonEmptyModules = getNonEmptyModules(tips)

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🚗</span>
        <h2 className="text-lg font-bold text-gray-800">老司机带路</h2>
      </div>

      {nonEmptyModules.map(module => {
        const config = MODULE_CONFIG[module]
        const isExpanded = expandedModules.has(module)

        return (
          <div key={module} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleModule(module)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{config.icon}</span>
                <span className="font-semibold text-gray-800">{config.label}</span>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                  {tips[module].length}
                </span>
              </div>
              <span className="text-gray-400">
                {isExpanded ? '▼' : '▶'}
              </span>
            </button>

            {isExpanded && (
              <div className="p-4 space-y-3">
                {module === 'examPatterns' && (
                  <ExamPatternList patterns={tips.examPatterns} />
                )}
                {module === 'trapAnalysis' && (
                  <TrapAnalysisList traps={tips.trapAnalysis} />
                )}
                {module === 'memoryTechniques' && (
                  <MemoryTechniqueList techniques={tips.memoryTechniques} />
                )}
                {module === 'examTactics' && (
                  <ExamTacticList tactics={tips.examTactics} />
                )}
                {module === 'predictions' && (
                  <PredictionList predictions={tips.predictions} />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// 出题套路列表
function ExamPatternList({ patterns }: { patterns: ExamPattern[] }) {
  return (
    <div className="space-y-4">
      {patterns.map((pattern, index) => (
        <ExamPatternCard key={index} pattern={pattern} />
      ))}
    </div>
  )
}

// 出题套路卡片
export function ExamPatternCard({ pattern }: { pattern: ExamPattern }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold text-blue-800 mb-2">{pattern.title}</h4>
      <p className="text-sm text-gray-700 mb-3">{pattern.questionExample}</p>
      <div className="space-y-1">
        {pattern.options.map((option, i) => (
          <div
            key={i}
            className={`text-sm px-2 py-1 rounded ${
              option.startsWith(pattern.correctAnswer)
                ? 'bg-green-100 text-green-800 font-medium'
                : 'text-gray-600'
            }`}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  )
}

// 坑位分析列表
function TrapAnalysisList({ traps }: { traps: TrapAnalysis[] }) {
  return (
    <div className="space-y-4">
      {traps.map((trap, index) => (
        <TrapAnalysisCard key={index} trap={trap} />
      ))}
    </div>
  )
}

// 坑位分析卡片
export function TrapAnalysisCard({ trap }: { trap: TrapAnalysis }) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-orange-500">⚠️</span>
        <h4 className="font-semibold text-orange-800">{trap.trapName}</h4>
      </div>
      <p className="text-sm text-gray-700 mb-3">{trap.description}</p>
      <div className="space-y-2">
        <div className="bg-red-50 border-l-4 border-red-400 p-2">
          <span className="text-xs font-semibold text-red-600">常见错误：</span>
          <p className="text-sm text-red-700">{trap.commonMistake}</p>
        </div>
        <div className="bg-green-50 border-l-4 border-green-400 p-2">
          <span className="text-xs font-semibold text-green-600">解决方案：</span>
          <p className="text-sm text-green-700">{trap.solution}</p>
        </div>
      </div>
    </div>
  )
}

// 记忆技巧列表
function MemoryTechniqueList({ techniques }: { techniques: MemoryTechnique[] }) {
  return (
    <div className="space-y-3">
      {techniques.map((technique, index) => (
        <MemoryTechniqueCard key={index} technique={technique} />
      ))}
    </div>
  )
}

// 记忆技巧卡片
export function MemoryTechniqueCard({ technique }: { technique: MemoryTechnique }) {
  const typeConfig = MEMORY_TYPE_CONFIG[technique.type]

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span>{typeConfig.icon}</span>
        <span className="text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-0.5 rounded">
          {typeConfig.label}
        </span>
      </div>
      <p className="text-sm text-gray-800">{technique.content}</p>
    </div>
  )
}

// 应试战术列表
function ExamTacticList({ tactics }: { tactics: ExamTactic[] }) {
  return (
    <div className="space-y-3">
      {tactics.map((tactic, index) => (
        <ExamTacticCard key={index} tactic={tactic} />
      ))}
    </div>
  )
}

// 应试战术卡片
export function ExamTacticCard({ tactic }: { tactic: ExamTactic }) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="mb-2">
        <span className="text-xs font-semibold text-purple-600">看到：</span>
        <p className="text-sm font-medium text-purple-800">{tactic.trigger}</p>
      </div>
      <div className="border-t border-purple-200 pt-2">
        <span className="text-xs font-semibold text-purple-600">立刻想：</span>
        <p className="text-sm text-gray-700">{tactic.reaction}</p>
      </div>
    </div>
  )
}

// 必考预测列表
function PredictionList({ predictions }: { predictions: Prediction[] }) {
  return (
    <div className="space-y-4">
      {predictions.map((prediction, index) => (
        <PredictionCard key={index} prediction={prediction} />
      ))}
    </div>
  )
}

// 必考预测卡片
export function PredictionCard({ prediction }: { prediction: Prediction }) {
  const probabilityConfig = getProbabilityConfig(prediction.probability)

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-red-600">预测题目</span>
        <span className={`text-xs px-2 py-0.5 rounded ${probabilityConfig.color}`}>
          {prediction.probability}% {probabilityConfig.label}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-800 mb-3">{prediction.question}</p>
      <div className="space-y-2">
        <div className="bg-green-50 border-l-4 border-green-400 p-2">
          <span className="text-xs font-semibold text-green-600">答案：</span>
          <p className="text-sm text-green-700">{prediction.answer}</p>
        </div>
        {prediction.explanation && (
          <div className="bg-gray-50 border-l-4 border-gray-300 p-2">
            <span className="text-xs font-semibold text-gray-600">解析：</span>
            <p className="text-sm text-gray-700">{prediction.explanation}</p>
          </div>
        )}
      </div>
    </div>
  )
}
