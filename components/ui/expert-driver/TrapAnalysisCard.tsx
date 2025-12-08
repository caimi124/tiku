'use client';

/**
 * 坑位解析卡片组件
 */

import { useState } from 'react';
import { TrapAnalysis } from '@/lib/expert-driver/types';

interface TrapAnalysisCardProps {
  trap: TrapAnalysis;
  index: number;
}

export function TrapAnalysisCard({ trap, index }: TrapAnalysisCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-orange-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* 标题栏 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-orange-50 hover:bg-orange-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center">
            {index + 1}
          </span>
          <span className="font-medium text-gray-800">{trap.标题}</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 展开内容 */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* 出题套路 */}
          <div>
            <h4 className="text-sm font-medium text-orange-600 mb-1">🎯 出题套路</h4>
            <p className="text-gray-700 text-sm">{trap.出题套路}</p>
          </div>

          {/* 坑在哪里 */}
          <div>
            <h4 className="text-sm font-medium text-red-600 mb-1">⚠️ 坑在哪里</h4>
            <ul className="list-disc list-inside space-y-1">
              {trap.坑在哪里.map((item, i) => (
                <li key={i} className="text-gray-700 text-sm">{item}</li>
              ))}
            </ul>
          </div>

          {/* 老司机技巧 */}
          <div>
            <h4 className="text-sm font-medium text-green-600 mb-1">💡 老司机技巧</h4>
            <p className="text-gray-700 text-sm bg-green-50 p-2 rounded">{trap.老司机技巧}</p>
          </div>

          {/* 口诀 */}
          {trap.口诀 && (
            <div>
              <h4 className="text-sm font-medium text-purple-600 mb-1">📝 口诀</h4>
              <pre className="bg-purple-50 p-3 rounded text-sm text-purple-800 whitespace-pre-wrap font-mono">
                {trap.口诀}
              </pre>
            </div>
          )}

          {/* 场景化记忆 */}
          {trap.场景化记忆 && (
            <div>
              <h4 className="text-sm font-medium text-blue-600 mb-1">🎬 场景化记忆</h4>
              <p className="text-gray-700 text-sm bg-blue-50 p-2 rounded italic">
                {trap.场景化记忆}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
