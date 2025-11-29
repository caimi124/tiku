"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, FileText, ArrowLeft, CheckCircle2, Target, Clock, Calendar } from "lucide-react";

/**
 * 简化版历年真题页面 - 无Suspense，无缓存，纯粹测试
 */
export default function HistorySimplePage() {
  const [yearData, setYearData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 [HistorySimple] 组件挂载');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('📡 [HistorySimple] 开始fetch...');
      setLoading(true);
      
      const response = await fetch('/api/history-stats?exam=pharmacist');
      console.log('📊 [HistorySimple] 响应状态:', response.status);
      
      const result = await response.json();
      console.log('📦 [HistorySimple] 收到数据:', result);
      
      if (result.success && result.data) {
        console.log('✅ [HistorySimple] 设置yearData:', result.data.length, '个年份');
        setYearData(result.data);
      } else {
        console.error('❌ [HistorySimple] API返回失败');
        setError('API返回失败');
      }
    } catch (err: any) {
      console.error('❌ [HistorySimple] 请求失败:', err);
      setError(err.message);
    } finally {
      console.log('🏁 [HistorySimple] 设置loading=false');
      setLoading(false);
    }
  };

  console.log('🔄 [HistorySimple] 渲染中...', { loading, yearDataLength: yearData.length });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">医药考试通（简化版）</span>
          </Link>
          <Link href="/practice" className="text-gray-600 hover:text-primary-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            历年真题（简化测试版）
          </h1>
          <p className="text-gray-600">
            这是一个简化版本，用于测试API和数据显示
          </p>
        </div>

        {/* 调试信息 */}
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold text-yellow-900 mb-2">🔍 调试信息</h3>
          <div className="text-sm space-y-1">
            <div>Loading: <strong className={loading ? 'text-yellow-600' : 'text-green-600'}>{String(loading)}</strong></div>
            <div>YearData长度: <strong className={yearData.length === 0 ? 'text-red-600' : 'text-green-600'}>{yearData.length}</strong></div>
            <div>Error: <strong>{error || '无'}</strong></div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-6 h-6 text-blue-500" />
              <span className="text-2xl font-bold text-blue-500">
                {yearData.reduce((sum, year) => sum + (year.totalQuestions || 0), 0)}
              </span>
            </div>
            <h3 className="text-sm text-gray-600">真题总数</h3>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <span className="text-2xl font-bold text-green-500">0</span>
            </div>
            <h3 className="text-sm text-gray-600">已完成</h3>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6 text-orange-500" />
              <span className="text-2xl font-bold text-orange-500">
                {yearData.filter(y => (y.totalQuestions || 0) > 0).length}
              </span>
            </div>
            <h3 className="text-sm text-gray-600">可用年份</h3>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="space-y-4">
          {loading && (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mb-4"></div>
              <p className="text-gray-600">正在加载数据...</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-red-900 font-bold mb-2">❌ 加载失败</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && yearData.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-yellow-900 font-bold mb-2">⚠️ 没有数据</h3>
              <p className="text-yellow-700">API返回成功但数据为空</p>
            </div>
          )}

          {!loading && !error && yearData.length > 0 && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-green-800">
                  ✅ <strong>成功加载 {yearData.length} 个年份的数据！</strong>
                </p>
              </div>

              {yearData.map((year) => (
                <div
                  key={year.year}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-6"
                >
                  {/* 年份标题 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                        {year.year}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {year.year}年真题
                        </h3>
                        <p className="text-sm text-gray-600">
                          共 {year.totalQuestions} 道题
                        </p>
                      </div>
                    </div>
                    <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                      未开始
                    </div>
                  </div>

                  {/* 科目列表 */}
                  {year.subjects && year.subjects.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {year.subjects.map((subject: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <span className="text-gray-700">{subject.name}</span>
                          <span className="text-gray-500 text-sm">{subject.count} 道题</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex gap-3">
                    <Link
                      href={`/practice/history/${year.year}?exam=pharmacist`}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      开始练习
                    </Link>
                    <Link
                      href={`/practice/history/${year.year}/mock?exam=pharmacist`}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-lg font-medium hover:border-orange-500 hover:text-orange-500 transition"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      模拟考试
                    </Link>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Console提示 */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-900 text-sm">
            💡 <strong>提示：</strong>按 F12 打开开发者工具，查看 Console 中的详细日志（所有日志都以 [HistorySimple] 开头）
          </p>
        </div>
      </div>
    </div>
  );
}
