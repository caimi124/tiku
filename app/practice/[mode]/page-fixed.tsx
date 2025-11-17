"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Heart,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  BookmarkPlus,
  Loader2,
  AlertCircle,
} from "lucide-react";

// 题目接口定义
interface Question {
  id: string;
  examType: string;
  subject: string;
  chapter: string | null;
  questionType: string;
  content: string;
  options: Array<{ key: string; value: string }>;
  correctAnswer: string;
  explanation: string | null;
  aiExplanation: string | null;
  difficulty: number;
  knowledgePoints: string[];
}

interface ApiResponse {
  success: boolean;
  data: {
    questions: Question[];
    total: number;
    limit: number;
    offset: number;
  };
  error?: string;
}

export default function PracticeModePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const mode = params.mode as string;
  const examType = searchParams.get("exam") || "pharmacist";

  // 状态管理
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMarked, setIsMarked] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 科目选择
  const [selectedSubject, setSelectedSubject] = useState("中药学综合知识与技能");

  // 获取题目数据
  useEffect(() => {
    fetchQuestions();
  }, [examType, selectedSubject, mode]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      // 构建查询参数
      const examTypeMap: { [key: string]: string } = {
        pharmacist: "执业药师",
        "pharmacy-title": "药学职称",
        "tcm-doctor": "中医执业医师",
        "chinese-pharmacy": "中药师",
      };

      const params = new URLSearchParams({
        examType: examTypeMap[examType] || "执业药师",
        subject: selectedSubject,
        mode: mode,
        limit: mode === "daily" ? "10" : "50",
      });

      const response = await fetch(`/api/questions?${params}`);
      const data: ApiResponse = await response.json();

      if (data.success && data.data.questions.length > 0) {
        setQuestions(data.data.questions);
        setCurrentIndex(0);
        console.log(`✅ 成功加载 ${data.data.questions.length} 道题目`);
      } else {
        setError(
          `暂无【${examTypeMap[examType]} - ${selectedSubject}】的题目。\n\n可能原因：\n1. 数据库中没有该科目的题目\n2. 需要先导入题目数据\n3. 题目未发布（isPublished=false）`
        );
        setQuestions([]);
      }
    } catch (err: any) {
      console.error("获取题目失败:", err);
      setError(
        `加载题目失败：${err.message}\n\n请检查：\n1. 数据库连接是否正常\n2. API接口是否正常\n3. 网络连接是否正常`
      );
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // 计时器
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setIsSubmitted(true);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetQuestionState();
    } else {
      // 已经是最后一题，可以显示完成页面或重新开始
      alert("已完成所有题目！");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetQuestionState();
    }
  };

  const resetQuestionState = () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setShowExplanation(false);
    setTimeSpent(0);
    setIsFavorite(false);
    setIsMarked(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentIndex];
  const isCorrect =
    selectedAnswer === currentQuestion?.correctAnswer;

  // 科目列表
  const subjects = [
    "药学专业知识一",
    "药学专业知识二",
    "药学综合知识与技能",
    "中药学专业知识一",
    "中药学专业知识二",
    "中药学综合知识与技能",
  ];

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">正在加载题目...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="border-b bg-white">
          <div className="container mx-auto px-4 h-16 flex items-center">
            <Link href="/practice" className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5" />
              <span>返回练习模式</span>
            </Link>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-red-200">
            <div className="flex items-start space-x-4">
              <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  暂无题目
                </h2>
                <div className="text-gray-600 whitespace-pre-line mb-6">
                  {error || "该科目暂无题目"}
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    💡 快速解决方案：
                  </h3>
                  <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>确认 Supabase 项目已恢复（未暂停）</li>
                    <li>
                      创建 <code className="bg-blue-100 px-1 rounded">.env.local</code> 文件
                    </li>
                    <li>
                      运行{" "}
                      <code className="bg-blue-100 px-1 rounded">
                        npx prisma db push
                      </code>
                    </li>
                    <li>
                      运行{" "}
                      <code className="bg-blue-100 px-1 rounded">
                        .\导入2024年真题.bat
                      </code>
                    </li>
                    <li>刷新此页面</li>
                  </ol>
                </div>

                {/* 科目选择 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    切换科目试试：
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={fetchQuestions}
                    className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                  >
                    重新加载
                  </button>
                  <Link
                    href="/practice"
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    返回首页
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 查看详细文档 */}
          <div className="mt-6 text-center text-sm text-gray-500">
            查看详细修复指南：
            <code className="ml-2 text-primary-600">
              修复数据库连接-2024真题.md
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/practice"
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-500"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>返回</span>
          </Link>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-mono">{formatTime(timeSpent)}</span>
            </div>
            <div className="text-sm text-gray-600">
              {currentIndex + 1} / {questions.length}
            </div>
          </div>
        </div>
      </nav>

      {/* 主体内容 */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 科目选择 */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                科目：
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* 显示2024年真题标签 */}
            {currentQuestion?.knowledgePoints?.includes("2024年真题") && (
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                  🔥 2024年真题
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 题目卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          {/* 题目信息 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded">
                {currentQuestion.questionType === "single"
                  ? "单选题"
                  : currentQuestion.questionType === "multiple"
                  ? "多选题"
                  : "判断题"}
              </span>
              {currentQuestion.chapter && (
                <span className="text-sm text-gray-500">
                  {currentQuestion.chapter}
                </span>
              )}
              <span className="text-sm text-gray-500">
                难度: {currentQuestion.difficulty}/5
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMarked(!isMarked)}
                className={`p-2 rounded-lg transition ${
                  isMarked
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <Flag className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-lg transition ${
                  isFavorite
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <Heart
                  className="w-5 h-5"
                  fill={isFavorite ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>

          {/* 题目内容 */}
          <div className="mb-6">
            <h2 className="text-xl font-medium text-gray-900 leading-relaxed">
              {currentQuestion.content}
            </h2>
          </div>

          {/* 选项 */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.key;
              const isCorrectOption =
                option.key === currentQuestion.correctAnswer;
              const showResult = isSubmitted;

              let optionStyle = "bg-white border-gray-300 hover:border-primary-500";
              if (showResult) {
                if (isCorrectOption) {
                  optionStyle = "bg-green-50 border-green-500";
                } else if (isSelected && !isCorrect) {
                  optionStyle = "bg-red-50 border-red-500";
                }
              } else if (isSelected) {
                optionStyle = "bg-primary-50 border-primary-500";
              }

              return (
                <button
                  key={option.key}
                  onClick={() => !isSubmitted && setSelectedAnswer(option.key)}
                  disabled={isSubmitted}
                  className={`w-full text-left p-4 border-2 rounded-lg transition ${optionStyle} ${
                    isSubmitted ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 mr-3 flex-shrink-0">
                      {option.key}.
                    </span>
                    <span className="text-gray-900 flex-1">{option.value}</span>
                    {showResult && isCorrectOption && (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 提交按钮 */}
          {!isSubmitted && (
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className={`w-full mt-6 py-3 rounded-lg font-semibold transition ${
                selectedAnswer
                  ? "bg-primary-500 text-white hover:bg-primary-600"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              提交答案
            </button>
          )}

          {/* 答案解析 */}
          {showExplanation && (
            <div className="mt-6">
              <div
                className={`p-4 rounded-lg ${
                  isCorrect ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span
                    className={`font-semibold ${
                      isCorrect ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {isCorrect ? "回答正确！" : "回答错误"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  正确答案：{currentQuestion.correctAnswer}
                </p>
              </div>

              {currentQuestion.explanation && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    📝 答案解析
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {currentQuestion.aiExplanation && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    🤖 AI 详解
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {currentQuestion.aiExplanation}
                  </p>
                </div>
              )}

              {/* 知识点标签 */}
              {currentQuestion.knowledgePoints &&
                currentQuestion.knowledgePoints.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      相关知识点：
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentQuestion.knowledgePoints.map((point, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            point === "2024年真题"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* 导航按钮 */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition ${
              currentIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white border-2 border-gray-300 text-gray-700 hover:border-primary-500"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>上一题</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!isSubmitted}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition ${
              isSubmitted
                ? "bg-primary-500 text-white hover:bg-primary-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span>
              {currentIndex === questions.length - 1 ? "完成" : "下一题"}
            </span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
