"use client";

import { useState, useEffect } from "react";
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

export default function HistoryExamPage() {
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
      // 模拟数据，实际应该从API获取
      const mockData: YearData[] = [
        {
          year: 2024,
          totalQuestions: 120,
          completedQuestions: 45,
          correctRate: 82,
          subjects: [
            { name: "中药学综合知识与技能", count: 120 },
          ],
        },
        {
          year: 2023,
          totalQuestions: 120,
          completedQuestions: 0,
          correctRate: 0,
          subjects: [
            { name: "中药学综合知识与技能", count: 120 },
          ],
        },
        {
          year: 2022,
          totalQuestions: 0,
          completedQuestions: 0,
          correctRate: 0,
          subjects: [],
        },
        {
          year: 2021,
          totalQuestions: 0,
          completedQuestions: 0,
          correctRate: 0,
          subjects: [],
        },
      ];
      setYearData(mockData);
    } catch (error) {
      console.error("获取年份数据失败:", error);
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
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">医药考试通</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link
              href="/practice"
              className="flex items-center text-gray-600 hover:text-primary-500 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回练习
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-orange-500" />
            历年真题
          </h1>
          <p className="text-gray-600">
            通过历年真题练习，把握考试方向和命题规律
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-2xl font-bold text-blue-500">
                {yearData.reduce((sum, year) => sum + year.totalQuestions, 0)}
              </span>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">真题总数</h3>
            <p className="text-xs text-gray-400">涵盖多年考试真题</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-2xl font-bold text-green-500">
                {yearData.reduce((sum, year) => sum + year.completedQuestions, 0)}
              </span>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">已完成</h3>
            <p className="text-xs text-gray-400">继续保持学习</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-2xl font-bold text-orange-500">
                {yearData.filter(y => y.totalQuestions > 0).length}
              </span>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">可用年份</h3>
            <p className="text-xs text-gray-400">持续更新中</p>
          </div>
        </div>

        {/* 年份列表 */}
        <div className="space-y-4">
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
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                          {year.year}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {year.year}年真题
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              {year.totalQuestions} 道题
                            </span>
                            {year.completedQuestions > 0 && (
                              <>
                                <span className="flex items-center">
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  已完成 {year.completedQuestions} 题
                                </span>
                                <span className="flex items-center">
                                  <TrendingUp className="w-4 h-4 mr-1" />
                                  正确率 {year.correctRate}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color} mb-2`}
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
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="text-sm text-gray-700">
                              {subject.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {subject.count} 道题
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex space-x-3">
                      {year.totalQuestions > 0 ? (
                        <>
                          <Link
                            href={`/practice/history/${year.year}?exam=${examType}`}
                            className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            开始练习
                          </Link>
                          <Link
                            href={`/practice/history/${year.year}/mock?exam=${examType}`}
                            className="flex-1 flex items-center justify-center px-4 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-lg font-medium hover:border-orange-500 hover:text-orange-500 transition"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            模拟考试
                          </Link>
                        </>
                      ) : (
                        <button
                          disabled
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
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
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                💡 历年真题练习建议
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 建议先从最新年份开始练习，了解最新考试趋势</li>
                <li>• 对照答案解析，理解考点和解题思路</li>
                <li>• 错题要及时收录到错题本，反复练习</li>
                <li>• 完成所有年份真题后，可进行模拟考试检验学习成果</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
