'use client';

/**
 * 老司机模式面板组件
 */

import { useState, useEffect } from 'react';
import { ExpertDriverContent } from '@/lib/expert-driver/types';
import { TrapAnalysisCard } from './TrapAnalysisCard';
import { PredictionQuestionCard } from './PredictionQuestionCard';

interface ExpertDriverPanelProps {
  knowledgePointId: string;
  className?: string;
}

export function ExpertDriverPanel({ knowledgePointId, className = '' }: ExpertDriverPanelProps) {
  const [content, setContent] = useState<ExpertDriverContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/expert-driver/${knowledgePointId}`);
        
        if (!response.ok) {
          throw new Error('获取内容失败');
        }
        
        const data = await response.json();
        setContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    }

    if (knowledgePointId) {
      fetchContent();
    }
  }, [knowledgePointId]);

  // 加载状态
  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-orange-200 rounded w-1/3"></div>
          <div className="h-4 bg-orange-100 rounded w-full"></div>
          <div className="h-4 bg-orange-100 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className={`bg-red-50 rounded-xl p-6 ${className}`}>
        <p className="text-red-600">❌ {error}</p>
      </div>
    );
  }

  // 空状态
  if (!content) {
    return (
      <div className={`bg-gray-50 rounded-xl p-6 text-center ${className}`}>
        <p className="text-gray-500">暂无老司机解析内容</p>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl overflow-hidden ${className}`}>
      {/* 头部 */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚗</span>
            <h2 className="text-xl font-bold text-white">老司机带路</h2>
          </div>
          <span className="text-white/80 text-sm">{content.version}</span>
        </div>
        <p className="text-white/90 mt-1">{content.考点名称}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* 一句话极速总结 */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-r">
          <p className="font-bold text-yellow-800">⚡ {content.一句话极速总结}</p>
        </div>

        {/* 坑位解析 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>🕳️</span> 坑位解析
            </h3>
            <button
              onClick={() => setExpandAll(!expandAll)}
              className="text-sm text-orange-600 hover:underline"
            >
              {expandAll ? '收起全部' : '展开全部'}
            </button>
          </div>
          <div className="space-y-3">
            {content.坑位解析.map((trap, index) => (
              <TrapAnalysisCard key={index} trap={trap} index={index} />
            ))}
          </div>
        </section>

        {/* 应试战术 */}
        <section>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
            <span>🎯</span> 应试战术
          </h3>
          <ul className="space-y-2">
            {content.应试战术.map((tactic, index) => (
              <li key={index} className="flex items-start gap-2 bg-white p-3 rounded-lg shadow-sm">
                <span className="text-orange-500">→</span>
                <span className="text-gray-700">{tactic}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 押题预测 */}
        <section>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
            <span>🔮</span> 押题预测
          </h3>
          <div className="space-y-3">
            {content.押题预测.map((question, index) => (
              <PredictionQuestionCard key={index} question={question} index={index} />
            ))}
          </div>
        </section>

        {/* 终极思维导图 */}
        <section>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
            <span>🗺️</span> 终极思维导图
          </h3>
          <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
            {content.终极思维导图}
          </pre>
        </section>

        {/* 短摘要（如果有） */}
        {content.short_summary && (
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            📱 {content.short_summary}
          </div>
        )}
      </div>
    </div>
  );
}
