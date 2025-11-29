/**
 * 历年真题页面骨架屏
 * 优势：
 * 1. 减少用户焦虑（有内容感）
 * 2. 提升感知速度（立即渲染）
 * 3. 更好的视觉反馈
 */
export function HistoryPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* 导航栏骨架 */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="w-24 h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 标题骨架 */}
        <div className="mb-8">
          <div className="w-32 h-8 bg-gray-200 rounded mb-2"></div>
          <div className="w-64 h-4 bg-gray-200 rounded"></div>
        </div>

        {/* 统计卡片骨架 */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="w-16 h-8 bg-gray-200 rounded"></div>
              </div>
              <div className="w-20 h-4 bg-gray-200 rounded mb-1"></div>
              <div className="w-32 h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* 年份卡片骨架 */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="w-32 h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="w-48 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mb-4"></div>
              <div className="space-y-2 mb-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="w-full h-12 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
              <div className="flex gap-3">
                <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
