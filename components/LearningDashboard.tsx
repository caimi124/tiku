/**
 * 学习进度仪表盘组件
 * 显示用户的学习统计和进度可视化
 */

import { TrendingUp, Target, Clock, Award, Flame } from "lucide-react";

interface LearningDashboardProps {
  totalQuestions: number;
  completedQuestions: number;
  correctQuestions: number;
  studyDays: number;
  studyStreak: number;
  averageAccuracy: number;
}

export function LearningDashboard({
  totalQuestions,
  completedQuestions,
  correctQuestions,
  studyDays,
  studyStreak,
  averageAccuracy,
}: LearningDashboardProps) {
  const completionRate = totalQuestions > 0 
    ? ((completedQuestions / totalQuestions) * 100).toFixed(1)
    : 0;
  
  const accuracy = completedQuestions > 0
    ? ((correctQuestions / completedQuestions) * 100).toFixed(1)
    : 0;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 md:p-6 mb-6 border-2 border-orange-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="w-5 h-5 md:w-6 md:h-6 mr-2 text-orange-500" />
          我的学习概况
        </h2>
        {studyStreak > 0 && (
          <div className="flex items-center px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium">
            <Flame className="w-4 h-4 mr-1" />
            连续学习 {studyStreak} 天
          </div>
        )}
      </div>

      {/* 主要统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
        {/* 完成进度 */}
        <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span className="text-2xl md:text-3xl font-bold text-blue-500">
              {completionRate}%
            </span>
          </div>
          <div className="text-xs md:text-sm text-gray-600">完成进度</div>
          <div className="text-xs text-gray-400 mt-1">
            {completedQuestions}/{totalQuestions} 题
          </div>
        </div>

        {/* 正确率 */}
        <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-5 h-5 text-green-500" />
            <span className="text-2xl md:text-3xl font-bold text-green-500">
              {accuracy}%
            </span>
          </div>
          <div className="text-xs md:text-sm text-gray-600">正确率</div>
          <div className="text-xs text-gray-400 mt-1">
            {correctQuestions}/{completedQuestions} 题
          </div>
        </div>

        {/* 学习天数 */}
        <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="text-2xl md:text-3xl font-bold text-purple-500">
              {studyDays}
            </span>
          </div>
          <div className="text-xs md:text-sm text-gray-600">学习天数</div>
          <div className="text-xs text-gray-400 mt-1">
            累计学习
          </div>
        </div>

        {/* 今日目标 */}
        <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-2xl md:text-3xl font-bold text-orange-500">
              50
            </span>
          </div>
          <div className="text-xs md:text-sm text-gray-600">今日目标</div>
          <div className="text-xs text-gray-400 mt-1">
            还需完成
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">总体进度</span>
          <span className="text-sm text-gray-500">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-500 relative overflow-hidden"
            style={{ width: `${completionRate}%` }}
          >
            {/* 动画光效 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
          </div>
        </div>
        
        {/* 里程碑提示 */}
        <div className="flex justify-between mt-3 text-xs text-gray-500">
          <span className={Number(completionRate) >= 25 ? 'text-orange-500 font-medium' : ''}>
            25%
          </span>
          <span className={Number(completionRate) >= 50 ? 'text-orange-500 font-medium' : ''}>
            50%
          </span>
          <span className={Number(completionRate) >= 75 ? 'text-orange-500 font-medium' : ''}>
            75%
          </span>
          <span className={Number(completionRate) >= 100 ? 'text-orange-500 font-medium' : ''}>
            100%
          </span>
        </div>
      </div>

      {/* 鼓励信息 */}
      <div className="mt-4 p-3 bg-white rounded-lg border-l-4 border-orange-500">
        <p className="text-sm text-gray-700">
          {Number(completionRate) < 25 && "💪 刚刚开始，继续加油！每天进步一点点。"}
          {Number(completionRate) >= 25 && Number(completionRate) < 50 && "🎯 已完成四分之一，保持节奏！"}
          {Number(completionRate) >= 50 && Number(completionRate) < 75 && "🔥 已过半，胜利在望！"}
          {Number(completionRate) >= 75 && Number(completionRate) < 100 && "⭐ 冲刺阶段，坚持就是胜利！"}
          {Number(completionRate) >= 100 && "🎉 恭喜完成所有题目！可以开始模拟考试了。"}
        </p>
      </div>
    </div>
  );
}

// 添加shimmer动画
const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
`;

// 注入样式
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
}

