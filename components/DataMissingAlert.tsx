/**
 * 数据缺失提醒组件
 * 用于提示用户某些题目可能缺少答案或解析
 */

import { AlertTriangle, Info, X } from "lucide-react";
import { useState } from "react";

interface DataMissingAlertProps {
  type: 'answer' | 'explanation' | 'both';
  count: number;
  onDismiss?: () => void;
  showDetails?: boolean;
}

export function DataMissingAlert({
  type,
  count,
  onDismiss,
  showDetails = false
}: DataMissingAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || count === 0) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getMessage = () => {
    switch (type) {
      case 'answer':
        return `当前有 ${count} 道题目缺少答案`;
      case 'explanation':
        return `当前有 ${count} 道题目缺少解析`;
      case 'both':
        return `当前有 ${count} 道题目缺少答案或解析`;
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            数据完善中
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>{getMessage()}，我们正在加紧补充完善。</p>
            {showDetails && (
              <div className="mt-2 space-y-1">
                <p className="flex items-center">
                  <Info className="w-4 h-4 mr-1" />
                  遇到缺失数据的题目时，您可以：
                </p>
                <ul className="list-disc list-inside ml-5 space-y-1">
                  <li>跳过该题，继续练习其他题目</li>
                  <li>查看相关知识点，自行学习</li>
                  <li>在社区提问，与其他学员讨论</li>
                </ul>
              </div>
            )}
          </div>
          <div className="mt-3">
            <a
              href="/feedback"
              className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
            >
              反馈问题 →
            </a>
          </div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={handleDismiss}
              className="inline-flex text-yellow-400 hover:text-yellow-500 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

