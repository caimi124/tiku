'use client';

/**
 * 押题预测卡片组件
 */

import { useState } from 'react';
import { PredictionQuestion } from '@/lib/expert-driver/types';

interface PredictionQuestionCardProps {
  question: PredictionQuestion;
  index: number;
}

export function PredictionQuestionCard({ question, index }: PredictionQuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="border border-blue-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* 题干 */}
      <div className="p-4">
        <div className="flex items-start gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          <p className="text-gray-800">{question.题干}</p>
        </div>
      </div>

      {/* 答案区域 */}
      <div className="border-t border-blue-100">
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full py-3 text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            👆 点击查看答案
          </button>
        ) : (
          <div className="p-4 bg-blue-50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-green-600">✅ 正确答案：</span>
              <span className="font-bold text-green-700">{question.正确答案}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">💬 理由：</span>
              <span className="text-sm text-gray-700">{question.理由}</span>
            </div>
            <button
              onClick={() => setShowAnswer(false)}
              className="text-xs text-blue-500 hover:underline"
            >
              隐藏答案
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
