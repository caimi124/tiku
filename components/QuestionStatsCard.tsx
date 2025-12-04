/**
 * 题目统计卡片组件
 * 显示年份、科目的详细统计信息
 */

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface QuestionStatsCardProps {
  year: number;
  subject: string;
  totalQuestions: number;
  completedQuestions: number;
  correctQuestions: number;
  averageTime?: number; // 平均答题时间（秒）
  lastPracticeDate?: Date;
  difficultyDistribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export function QuestionStatsCard({
  year,
  subject,
  totalQuestions,
  completedQuestions,
  correctQuestions,
  averageTime,
  lastPracticeDate,
  difficultyDistribution,
}: QuestionStatsCardProps) {
  const completionRate = totalQuestions > 0
    ? ((completedQuestions / totalQuestions) * 100).toFixed(1)
    : 0;

  const accuracy = completedQuestions > 0
    ? ((correctQuestions / completedQuestions) * 100).toFixed(1)
    : 0;

  // 判断正确率趋势
  const getTrend = (accuracy: number) => {
    if (accuracy >= 80) return { icon: TrendingUp, color: 'text-green-500', text: '优秀' };
    if (accuracy >= 60) return { icon: Minus, color: 'text-yellow-500', text: '良好' };
    return { icon: TrendingDown, color: 'text-red-500', text: '需加强' };
  };

  const trend = getTrend(Number(accuracy));
  const TrendIcon = trend.icon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* 标题 */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{subject}</h3>
          <p className="text-sm text-gray-500">{year}年</p>
        </div>
        <div className={`flex items-center ${trend.color} text-sm font-medium`}>
          <TrendIcon className="w-4 h-4 mr-1" />
          {trend.text}
        </div>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{totalQuestions}</div>
          <div className="text-xs text-gray-500">总题数</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-blue-500">{completedQuestions}</div>
          <div className="text-xs text-gray-500">已完成</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-500">{accuracy}%</div>
          <div className="text-xs text-gray-500">正确率</div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>完成进度</span>
          <span>{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-full rounded-full transition-all ${
              Number(completionRate) >= 80
                ? 'bg-green-500'
                : Number(completionRate) >= 50
                ? 'bg-blue-500'
                : 'bg-orange-500'
            }`}
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* 难度分布 */}
      {difficultyDistribution && (
        <div className="mb-3 p-2 bg-gray-50 rounded">
          <div className="text-xs text-gray-600 mb-1">难度分布</div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
              <span>简单 {difficultyDistribution.easy}</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
              <span>中等 {difficultyDistribution.medium}</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
              <span>困难 {difficultyDistribution.hard}</span>
            </div>
          </div>
        </div>
      )}

      {/* 额外信息 */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        {lastPracticeDate && (
          <span>
            最后练习: {new Date(lastPracticeDate).toLocaleDateString('zh-CN')}
          </span>
        )}
        {averageTime && (
          <span>
            平均用时: {Math.floor(averageTime / 60)}分{averageTime % 60}秒
          </span>
        )}
      </div>
    </div>
  );
}

