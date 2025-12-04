"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  FileText,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Target,
  Zap,
  Award,
  BarChart3,
  Pill,
  FlaskConical,
  BookMarked,
  Stethoscope,
  ChevronRight,
  Filter,
} from "lucide-react";
import { LearningDashboard } from "@/components/LearningDashboard";
import { DataMissingAlert } from "@/components/DataMissingAlert";

// 科目定义
const SUBJECTS = {
  pharmacy: {
    name: "药学类",
    icon: Pill,
    color: "blue",
    subjects: [
      { id: "yaoxue-1", name: "药学专业知识（一）", shortName: "药学（一）" },
      { id: "yaoxue-2", name: "药学专业知识（二）", shortName: "药学（二）" },
      { id: "fagui", name: "药事管理与法规", shortName: "法规" },
      { id: "yaoxue-zonghe", name: "药学综合知识与技能", shortName: "药学综合" },
    ],
  },
  chinese: {
    name: "中药学类",
    icon: FlaskConical,
    color: "green",
    subjects: [
      { id: "zhongyao-1", name: "中药学专业知识（一）", shortName: "中药（一）" },
      { id: "zhongyao-2", name: "中药学专业知识（二）", shortName: "中药（二）" },
      { id: "fagui", name: "药事管理与法规", shortName: "法规" },
      { id: "zhongyao-zonghe", name: "中药学综合知识与技能", shortName: "中药综合" },
    ],
  },
};

// 年份数据
const YEARS = [2024, 2023, 2022];

interface SubjectData {
  subject: string;
  yearData: {
    year: number;
    total: number;
    completed?: number;
    correct?: number;
    missingAnswers?: number;
  }[];
  totalQuestions: number;
  completedQuestions: number;
  averageAccuracy: number;
}

function HistoryBySubjectContent() {
  const searchParams = useSearchParams();
  const examType = searchParams.get("exam") || "pharmacist";
  const [selectedCategory, setSelectedCategory] = useState<"pharmacy" | "chinese">("pharmacy");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjectsData, setSubjectsData] = useState<Record<string, SubjectData>>({});
  const [loading, setLoading] = useState(true);
  const [showDataAlert, setShowDataAlert] = useState(true);
  const [missingAnswersData, setMissingAnswersData] = useState<Record<number, number>>({});

  const currentCategory = SUBJECTS[selectedCategory];
  const CategoryIcon = currentCategory.icon;

  // 用户学习统计
  const userStats = {
    totalQuestions: 1680,
    completedQuestions: 245,
    correctQuestions: 198,
    studyDays: 15,
    studyStreak: 7,
    averageAccuracy: 80.8,
  };

  // 计算总缺失答案数
  const totalMissingAnswers = Object.values(missingAnswersData).reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    fetchSubjectsData();
    fetchMissingAnswersStats();
  }, [selectedCategory, examType]);

  const fetchMissingAnswersStats = async () => {
    try {
      const response = await fetch(`/api/missing-answers-stats?exam=${examType}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const dataMap: Record<number, number> = {};
          result.data.byYear.forEach((item: any) => {
            dataMap[item.year] = item.missingCount;
          });
          setMissingAnswersData(dataMap);
        }
      }
    } catch (error) {
      console.error("获取缺失答案统计失败:", error);
      setMissingAnswersData({
        2024: 62,
        2023: 30,
        2022: 31,
      });
    }
  };

  const fetchSubjectsData = async () => {
    try {
      setLoading(true);
      const data: Record<string, SubjectData> = {};

      // 为每个科目获取数据
      for (const subject of currentCategory.subjects) {
        const subjectData: SubjectData = {
          subject: subject.name,
          yearData: [],
          totalQuestions: 0,
          completedQuestions: 0,
          averageAccuracy: 0,
        };

        // 获取每年的数据
        for (const year of YEARS) {
          try {
            const response = await fetch(
              `/api/history-stats?exam=${examType}&year=${year}&subject=${encodeURIComponent(subject.name)}`
            );
            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data) {
                const yearInfo = {
                  year,
                  total: result.data.totalQuestions || 0,
                  completed: 0, // TODO: 从用户数据获取
                  correct: 0, // TODO: 从用户数据获取
                  missingAnswers: 0,
                };
                subjectData.yearData.push(yearInfo);
                subjectData.totalQuestions += yearInfo.total;
              }
            }
          } catch (error) {
            console.error(`获取${year}年${subject.name}数据失败:`, error);
          }
        }

        data[subject.id] = subjectData;
      }

      setSubjectsData(data);
    } catch (error) {
      console.error("获取科目数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectColor = (index: number) => {
    const colors = ["blue", "green", "purple", "orange"];
    return colors[index % colors.length];
  };

  const handleSubjectClick = (subjectId: string, subjectName: string, year?: number) => {
    if (year) {
      // 跳转到具体年份的题目页面
      window.location.href = `/practice/history/${year}?exam=${examType}&subject=${encodeURIComponent(subjectName)}`;
    } else {
      // 显示该科目的所有年份
      setSelectedSubject(subjectId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 导航栏 */}
      <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
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
              <ArrowLeft className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">返回练习</span>
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
          <span className="text-gray-900 font-medium">历年真题 · 按科目</span>
        </nav>

        {/* 页面标题 */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 flex items-center">
            <FileText className="w-7 h-7 md:w-10 md:h-10 mr-2 md:mr-3 text-orange-500" />
            执业药师历年真题 · 按科目分类
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-4">
            🎯 按科目系统学习，掌握各科考点。涵盖 2022-2024 年全部真题
          </p>
        </div>

        {/* 数据缺失提醒 */}
        {totalMissingAnswers > 0 && showDataAlert && (
          <DataMissingAlert
            type="answer"
            count={totalMissingAnswers}
            onDismiss={() => setShowDataAlert(false)}
            showDetails={true}
          />
        )}

        {/* 学习进度仪表盘 */}
        <LearningDashboard
          totalQuestions={userStats.totalQuestions}
          completedQuestions={userStats.completedQuestions}
          correctQuestions={userStats.correctQuestions}
          studyDays={userStats.studyDays}
          studyStreak={userStats.studyStreak}
          averageAccuracy={userStats.averageAccuracy}
        />

        {/* 专业类别选择 */}
        <div className="bg-white rounded-xl p-4 md:p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-orange-500" />
              选择专业类别
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 药学类 */}
            <button
              onClick={() => {
                setSelectedCategory("pharmacy");
                setSelectedSubject(null);
              }}
              className={`group relative p-6 rounded-xl border-2 transition-all ${
                selectedCategory === "pharmacy"
                  ? "border-blue-500 bg-blue-50 shadow-lg"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedCategory === "pharmacy" ? "bg-blue-500" : "bg-blue-100"
                    }`}
                  >
                    <Pill
                      className={`w-6 h-6 ${
                        selectedCategory === "pharmacy" ? "text-white" : "text-blue-500"
                      }`}
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900">药学类</h3>
                    <p className="text-sm text-gray-500">Pharmacy</p>
                  </div>
                </div>
                {selectedCategory === "pharmacy" && (
                  <CheckCircle2 className="w-6 h-6 text-blue-500" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-600 mb-2">包含科目：</p>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.pharmacy.subjects.map((subject) => (
                    <span
                      key={subject.id}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {subject.shortName}
                    </span>
                  ))}
                </div>
              </div>
            </button>

            {/* 中药学类 */}
            <button
              onClick={() => {
                setSelectedCategory("chinese");
                setSelectedSubject(null);
              }}
              className={`group relative p-6 rounded-xl border-2 transition-all ${
                selectedCategory === "chinese"
                  ? "border-green-500 bg-green-50 shadow-lg"
                  : "border-gray-200 bg-white hover:border-green-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedCategory === "chinese" ? "bg-green-500" : "bg-green-100"
                    }`}
                  >
                    <FlaskConical
                      className={`w-6 h-6 ${
                        selectedCategory === "chinese" ? "text-white" : "text-green-500"
                      }`}
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900">中药学类</h3>
                    <p className="text-sm text-gray-500">Chinese Medicine</p>
                  </div>
                </div>
                {selectedCategory === "chinese" && (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-600 mb-2">包含科目：</p>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.chinese.subjects.map((subject) => (
                    <span
                      key={subject.id}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                    >
                      {subject.shortName}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 科目列表 */}
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
              <CategoryIcon className={`w-6 h-6 mr-2 text-${currentCategory.color}-500`} />
              {currentCategory.name} · 科目列表
            </h2>
            <div className="text-sm text-gray-500">
              共 {currentCategory.subjects.length} 个科目
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {currentCategory.subjects.map((subject, index) => {
                const subjectData = subjectsData[subject.id];
                const color = getSubjectColor(index);
                const colorClasses = {
                  blue: {
                    bg: "bg-blue-50",
                    border: "border-blue-200",
                    text: "text-blue-700",
                    icon: "text-blue-500",
                    button: "bg-blue-500 hover:bg-blue-600",
                  },
                  green: {
                    bg: "bg-green-50",
                    border: "border-green-200",
                    text: "text-green-700",
                    icon: "text-green-500",
                    button: "bg-green-500 hover:bg-green-600",
                  },
                  purple: {
                    bg: "bg-purple-50",
                    border: "border-purple-200",
                    text: "text-purple-700",
                    icon: "text-purple-500",
                    button: "bg-purple-500 hover:bg-purple-600",
                  },
                  orange: {
                    bg: "bg-orange-50",
                    border: "border-orange-200",
                    text: "text-orange-700",
                    icon: "text-orange-500",
                    button: "bg-orange-500 hover:bg-orange-600",
                  },
                };
                const classes = colorClasses[color as keyof typeof colorClasses];

                return (
                  <div
                    key={subject.id}
                    className={`bg-white rounded-xl border-2 ${classes.border} shadow-sm hover:shadow-lg transition-all overflow-hidden`}
                  >
                    <div className="p-4 md:p-6">
                      {/* 科目标题 */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3 md:space-x-4 flex-1">
                          <div className={`w-12 h-12 md:w-16 md:h-16 ${classes.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <BookMarked className={`w-6 h-6 md:w-8 md:h-8 ${classes.icon}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                              {subject.name}
                            </h3>
                            {subjectData && (
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-gray-600">
                                <span className="flex items-center">
                                  <FileText className="w-4 h-4 mr-1" />
                                  {subjectData.totalQuestions} 道题
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {subjectData.yearData.length} 年真题
                                </span>
                                {subjectData.completedQuestions > 0 && (
                                  <span className="flex items-center text-green-600">
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    已完成 {subjectData.completedQuestions}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 年份列表 */}
                      {subjectData && subjectData.yearData.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">按年份练习：</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {subjectData.yearData.map((yearInfo) => (
                              <button
                                key={yearInfo.year}
                                onClick={() => handleSubjectClick(subject.id, subject.name, yearInfo.year)}
                                className={`group flex items-center justify-between p-3 ${classes.bg} rounded-lg hover:shadow-md transition-all active:scale-95`}
                              >
                                <div className="flex items-center space-x-2">
                                  <Calendar className={`w-4 h-4 ${classes.icon}`} />
                                  <span className={`text-sm font-medium ${classes.text}`}>
                                    {yearInfo.year}年
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-600">
                                    {yearInfo.total}题
                                  </span>
                                  <ChevronRight className={`w-4 h-4 ${classes.icon} group-hover:translate-x-1 transition-transform`} />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 统计信息 */}
                      {subjectData && (
                        <div className={`p-3 ${classes.bg} rounded-lg mb-4`}>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className={`text-xl md:text-2xl font-bold ${classes.text}`}>
                                {subjectData.totalQuestions}
                              </div>
                              <div className="text-xs text-gray-600">总题数</div>
                            </div>
                            <div>
                              <div className={`text-xl md:text-2xl font-bold ${classes.text}`}>
                                {subjectData.yearData.length}
                              </div>
                              <div className="text-xs text-gray-600">年份数</div>
                            </div>
                            <div>
                              <div className={`text-xl md:text-2xl font-bold ${classes.text}`}>
                                {subjectData.completedQuestions}
                              </div>
                              <div className="text-xs text-gray-600">已完成</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 操作按钮 */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            // 跳转到最新年份
                            if (subjectData && subjectData.yearData.length > 0) {
                              const latestYear = subjectData.yearData[0].year;
                              handleSubjectClick(subject.id, subject.name, latestYear);
                            }
                          }}
                          className={`flex-1 flex items-center justify-center px-4 py-3 ${classes.button} text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all active:scale-95`}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          开始练习
                        </button>
                        <button
                          onClick={() => {
                            // TODO: 查看科目详情/统计
                            setSelectedSubject(subject.id);
                          }}
                          className="px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:border-gray-300 hover:shadow-md transition-all active:scale-95"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 学习建议 */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                💡 按科目学习的建议
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">1.</span>
                  <span>先选择一个科目，系统学习该科目的所有年份真题，建立完整的知识体系</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">2.</span>
                  <span>每个科目从最新年份（2024年）开始，了解最新的考试趋势和题型变化</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">3.</span>
                  <span>做完一个年份后，对比前一年的真题，总结高频考点和重点知识</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">4.</span>
                  <span>《药事管理与法规》是药学和中药学共同科目，特别需要重点掌握</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">5.</span>
                  <span>建议按顺序完成：专业知识（一）→ 专业知识（二）→ 综合知识 → 法规</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HistoryBySubjectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      }
    >
      <HistoryBySubjectContent />
    </Suspense>
  );
}

