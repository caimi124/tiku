"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  FileText,
  Calendar,
  Clock,
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
  Target,
  Zap,
} from "lucide-react";

interface YearData {
  year: number;
  totalQuestions: number;
  completedQuestions: number;
  correctRate: number;
  subjects: {
    name: string;
    count: number;
  }[];
}

function HistoryExamContent() {
  const searchParams = useSearchParams();
  const examType = searchParams.get("exam") || "pharmacist";
  const [yearData, setYearData] = useState<YearData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchYearData();
  }, [examType]);

  const fetchYearData = async () => {
    try {
      setLoading(true);
      
      // ✅ 优化：使用新API，1次请求替代16次请求
      const response = await fetch(`/api/history-stats?exam=${examType}`);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error('API返回错误');
      }
      
      // 添加客户端数据
      const enhancedData = result.data.map((year: any) => ({
        ...year,
        completedQuestions: 0, // TODO: 从用户答题记录获取
        correctRate: 0, // TODO: 从用户答题记录计算
      }));
      
      setYearData(enhancedData);
      
      // 缓存到localStorage
      try {
        localStorage.setItem('history-stats-cache', JSON.stringify({
          data: enhancedData,
          timestamp: Date.now(),
          examType,
        }));
      } catch (e) {
        console.warn('缓存失败:', e);
      }
      
    } catch (error) {
      console.error("获取年份数据失败:", error);
      
      // 尝试使用缓存
      try {
        const cached = localStorage.getItem('history-stats-cache');
        if (cached) {
          const { data, timestamp, examType: cachedExamType } = JSON.parse(cached);
          if (Date.now() - timestamp < 3600000 && cachedExamType === examType) {
            setYearData(data);
            return;
          }
        }
      } catch (e) {
        console.warn('读取缓存失败:', e);
      }
      
      setYearData([]);
    } finally {
      setLoading(false);
    }
  };

  const getYearStatus = (year: YearData) => {
    if (year.totalQuestions === 0) {
      return { text: "敬请期待", color: "text-gray-400", bgColor: "bg-gray-50" };
    }
    if (year.completedQuestions === 0) {
      return { text: "未开始", color: "text-blue-500", bgColor: "bg-blue-50" };
    }
    if (year.completedQuestions === year.totalQuestions) {
      return { text: "已完成", color: "text-green-500", bgColor: "bg-green-50" };
    }
    return { text: "进行中", color: "text-orange-500", bgColor: "bg-orange-50" };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-primary-500" />
            <span className="text-lg md:text-xl font-bold text-gray-900">医药考试通</span>
          </Link>
          <div className="flex items-center space-x-3 md:space-x-6">
            <Link
              href="/practice"
              className="flex items-center text-sm md:text-base text-gray-600 hover:text-primary-500 transition"
            >
              <ArrowLeft className="w-4 h-4 md:mr-1" /><span className="hidden md:inline">
返回练习</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* 面包屑导航 */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-orange-500 transition">首页</Link>
          <span>/</span>
          <Link href="/practice" className="hover:text-orange-500 transition">在线练习</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">历年真题</span>
        </nav>

        {/* 页面标题 */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 flex items-center">
            <FileText className="w-7 h-7 md:w-10 md:h-10 mr-2 md:mr-3 text-orange-500" />
            执业药师历年真题库
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-4">
            🎯 精选 2022-2024 年真题，按年份/科目分类练习，把握考试趨势和命题规律
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              真题收录全
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <Target className="w-4 h-4 mr-1" />
              科目分类清
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              解析详细
            </span>
          </div>
        </div>

        {/* 快速入口 - 移动端优先 */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 md:p-6 mb-6 border-2 border-orange-200">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-orange-500" />
            快速开始
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <Link
              href="/practice/history/2024?exam=pharmacist"
              className="flex flex-col items-center justify-center p-3 md:p-4 bg-white rounded-lg hover:shadow-md transition active:scale-95"
            >
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-orange-500 mb-2" />
              <span className="text-sm md:text-base font-medium text-gray-900">2024年</span>
              <span className="text-xs text-gray-500">最新真题</span>
            </Link>
            <Link
              href="/practice/history/2023?exam=pharmacist"
              className="flex flex-col items-center justify-center p-3 md:p-4 bg-white rounded-lg hover:shadow-md transition active:scale-95"
            >
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mb-2" />
              <span className="text-sm md:text-base font-medium text-gray-900">2023年</span>
              <span className="text-xs text-gray-500">热门真题</span>
            </Link>
            <Link
              href="/practice/history/2022?exam=pharmacist"
              className="flex flex-col items-center justify-center p-3 md:p-4 bg-white rounded-lg hover:shadow-md transition active:scale-95"
            >
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-green-500 mb-2" />
              <span className="text-sm md:text-base font-medium text-gray-900">2022年</span>
              <span className="text-xs text-gray-500">经典真题</span>
            </Link>
            <Link
              href="/practice/history/2024/mock?exam=pharmacist"
              className="flex flex-col items-center justify-center p-3 md:p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition active:scale-95"
            >
              <Clock className="w-6 h-6 md:w-8 md:h-8 mb-2" />
              <span className="text-sm md:text-base font-medium">模拟考试</span>
              <span className="text-xs opacity-90">限时练习</span>
            </Link>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-8">
          <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 md:mb-4 gap-2">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 md:w-6 md:h-6 text-blue-500" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-blue-500">
                {yearData.reduce((sum, year) => sum + year.totalQuestions, 0)}
              </span>
            </div>
            <h3 className="text-xs md:text-sm text-gray-600 mb-1">真题总数</h3>
            <p className="text-xs text-gray-400 hidden md:block">涵盖多年考试真题</p>
          </div>

          <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 md:mb-4 gap-2">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 md:w-6 md:h-6 text-green-500" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-green-500">
                {yearData.reduce((sum, year) => sum + year.completedQuestions, 0)}
              </span>
            </div>
            <h3 className="text-xs md:text-sm text-gray-600 mb-1">已完成</h3>
            <p className="text-xs text-gray-400 hidden md:block">继续保持学习</p>
          </div>

          <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 md:mb-4 gap-2">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 md:w-6 md:h-6 text-orange-500" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-orange-500">
                {yearData.filter(y => y.totalQuestions > 0).length}
              </span>
            </div>
            <h3 className="text-xs md:text-sm text-gray-600 mb-1">可用年份</h3>
            <p className="text-xs text-gray-400 hidden md:block">持续更新中</p>
          </div>
        </div>

        {/* 年份列表 */}
        <div className="space-y-3 md:space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <p className="text-gray-500 mt-4">加载中...</p>
            </div>
          ) : (
            yearData.map((year) => {
              const status = getYearStatus(year);
              const progress =
                year.totalQuestions > 0
                  ? (year.completedQuestions / year.totalQuestions) * 100
                  : 0;

              return (
                <div
                  key={year.year}
                  className="bg-white rounded-lg md:rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex items-start md:items-center justify-between mb-4 gap-3">
                      <div className="flex items-start md:items-center space-x-3 md:space-x-4 flex-1">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-base md:text-xl flex-shrink-0">
                          {year.year}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1">
                            {year.year}年真题
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-gray-500">
                            <span className="flex items-center">
                              <FileText className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />
                              {year.totalQuestions} 道题
                            </span>
                            {year.completedQuestions > 0 && (
                              <>
                                <span className="flex items-center">
                                  <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />
                                  已完成 {year.completedQuestions}
                                </span>
                                <span className="flex items-center hidden md:flex">
                                  <TrendingUp className="w-4 h-4 mr-1 flex-shrink-0" />
                                  正确率 {year.correctRate}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div
                          className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${status.bgColor} ${status.color}`}
                        >
                          {status.text}
                        </div>
                      </div>
                    </div>

                    {/* 进度条 */}
                    {year.totalQuestions > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span>完成进度</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* 科目列表 */}
                    {year.subjects.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {year.subjects.map((subject, index) => (
                          <Link
                            key={index}
                            href={`/practice/history/${year.year}?exam=${examType}&subject=${encodeURIComponent(subject.name)}`}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                          >
                            <span className="text-sm text-gray-700">
                              {subject.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {subject.count} 道题
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                      {year.totalQuestions > 0 ? (
                        <>
                          <Link
                            href={`/practice/history/${year.year}?exam=${examType}`}
                            className="flex-1 flex items-center justify-center px-4 py-2.5 md:py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition active:scale-95 text-sm md:text-base"
                          >
                            <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                            开始练习
                          </Link>
                          <Link
                            href={`/practice/history/${year.year}/mock?exam=${examType}`}
                            className="flex-1 flex items-center justify-center px-4 py-2.5 md:py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-lg font-medium hover:border-orange-500 hover:text-orange-500 transition active:scale-95 text-sm md:text-base"
                          >
                            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                            模拟考试
                          </Link>
                        </>
                      ) : (
                        <button
                          disabled
                          className="flex-1 flex items-center justify-center px-4 py-2.5 md:py-3 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed text-sm md:text-base"
                        >
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                          敬请期待
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 提示信息 */}
        <div className="mt-4 md:mt-8 bg-blue-50 border border-blue-200 rounded-lg md:rounded-xl p-4 md:p-6 mb-6 md:mb-0">
          <div className="flex items-start space-x-3 md:space-x-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
                💡 历年真题练习建议
              </h3>
              <ul className="text-xs md:text-sm text-gray-600 space-y-1">
                <li>• 建议先从最新年份开始练习，了解最新考试趋势</li>
                <li>• 对照答案解析，理解考点和解题思路</li>
                <li>• 错题要及时收录到错题本，反复练习</li>
                <li className="hidden md:list-item">• 完成所有年份真题后，可进行模拟考试检验学习成果</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HistoryExamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <HistoryExamContent />
    </Suspense>
  );
}
