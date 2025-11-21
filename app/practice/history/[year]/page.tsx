"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Flag,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

interface Question {
  id: string;
  content: string;
  options: { key: string; value: string }[];
  correctAnswer: string;
  explanation: string;
  questionType: string;
  chapter: string;
  knowledgePoints: string[];
}

interface QuestionSection {
  type: string;
  title: string;
  startIndex: number;
  endIndex: number;
  count: number;
}

function YearPracticeContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const year = params.year as string;
  const examType = searchParams.get("exam") || "pharmacist";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [sections, setSections] = useState<QuestionSection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchQuestions();
  }, [year]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/questions?sourceYear=${year}&subject=中药学综合知识与技能&limit=200`
      );
      const data = await response.json();

      if (data.success && data.data.questions) {
        const allQuestions = data.data.questions;
        setQuestions(allQuestions);
        
        // 按题型分组统计
        const grouped: Record<string, Question[]> = {
          最佳选择题: [],
          配伍选择题: [],
          综合分析题: [],
          多项选择题: [],
        };

        allQuestions.forEach((q: Question) => {
          const type = q.questionType;
          if (grouped[type]) {
            grouped[type].push(q);
          }
        });

        // 创建题型分组
        const questionSections: QuestionSection[] = [];
        let currentIdx = 0;

        const typeOrder = [
          { type: '最佳选择题', title: '一、最佳选择题' },
          { type: '配伍选择题', title: '二、配伍选择题' },
          { type: '综合分析题', title: '三、综合分析题' },
          { type: '多项选择题', title: '四、多项选择题' },
        ];

        typeOrder.forEach(({ type, title }) => {
          if (grouped[type].length > 0) {
            questionSections.push({
              type,
              title,
              startIndex: currentIdx,
              endIndex: currentIdx + grouped[type].length - 1,
              count: grouped[type].length,
            });
            currentIdx += grouped[type].length;
          }
        });

        setSections(questionSections);
      } else {
        console.error("获取题目失败:", data.error);
      }
    } catch (error) {
      console.error("获取题目失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];

  const handleAnswerSelect = (answer: string) => {
    if (isSubmitted) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setIsSubmitted(true);
    setShowExplanation(true);
    setAnswers({ ...answers, [currentIndex]: selectedAnswer });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(answers[currentIndex + 1] || "");
      setIsSubmitted(!!answers[currentIndex + 1]);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(answers[currentIndex - 1] || "");
      setIsSubmitted(!!answers[currentIndex - 1]);
      setShowExplanation(false);
    }
  };

  const toggleBookmark = () => {
    const newBookmarked = new Set(bookmarked);
    if (newBookmarked.has(currentIndex)) {
      newBookmarked.delete(currentIndex);
    } else {
      newBookmarked.add(currentIndex);
    }
    setBookmarked(newBookmarked);
  };

  const getAnswerClass = (optionKey: string) => {
    if (!isSubmitted) {
      return selectedAnswer === optionKey
        ? "border-primary-500 bg-primary-50"
        : "border-gray-200 hover:border-primary-300";
    }

    if (optionKey === currentQuestion.correctAnswer) {
      return "border-green-500 bg-green-50";
    }

    if (selectedAnswer === optionKey && optionKey !== currentQuestion.correctAnswer) {
      return "border-red-500 bg-red-50";
    }

    return "border-gray-200";
  };

  const getAnswerStats = () => {
    const answered = Object.keys(answers).length;
    const correct = Object.entries(answers).filter(
      ([index, answer]) => questions[parseInt(index)]?.correctAnswer === answer
    ).length;
    return { answered, correct };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-gray-600">加载题目中...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">暂无{year}年真题数据</p>
          <Link
            href="/practice/history"
            className="text-primary-500 hover:text-primary-600"
          >
            返回历年真题
          </Link>
        </div>
      </div>
    );
  }

  const stats = getAnswerStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link
                href={`/practice/history?exam=${examType}`}
                className="flex items-center text-gray-600 hover:text-primary-500 transition"
              >
                <ArrowLeft className="w-4 h-4 md:mr-1" />
                <span className="hidden md:inline">返回</span>
              </Link>
              <div className="h-6 w-px bg-gray-200"></div>
              <h1 className="text-sm md:text-lg font-semibold text-gray-900">
                {year}年真题练习
              </h1>
            </div>

            <div className="flex items-center space-x-2 md:space-x-6 text-xs md:text-sm">
              <div className="text-gray-600">
                <span className="font-medium text-primary-500">{currentIndex + 1}</span>
                <span className="mx-1">/</span>
                <span>{questions.length}</span>
              </div>
              <div className="text-gray-600">
                已答: <span className="font-medium text-blue-500">{stats.answered}</span>
              </div>
              <div className="text-gray-600">
                正确: <span className="font-medium text-green-500">{stats.correct}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="max-w-4xl mx-auto">
          {/* 题目卡片 */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 p-4 md:p-8 mb-4 md:mb-6">
            {/* 题目标签 */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center space-x-2 md:space-x-3 flex-wrap gap-y-2">
                <span className="px-2 md:px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs md:text-sm font-medium">
                  {year}年真题
                </span>
                <span className="px-2 md:px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs md:text-sm">
                  {(() => {
                    const typeMap: Record<string, string> = {
                      single: '最佳选择题',
                      match: '配伍选择题',
                      comprehensive: '综合分析题',
                      multiple: '多项选择题',
                    };
                    return typeMap[currentQuestion.questionType] || currentQuestion.questionType;
                  })()}
                </span>
                {currentQuestion.chapter && (
                  <span className="px-2 md:px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs md:text-sm">
                    {currentQuestion.chapter}
                  </span>
                )}
              </div>
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-lg transition ${
                  bookmarked.has(currentIndex)
                    ? "text-yellow-500 bg-yellow-50"
                    : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
                }`}
              >
                <Flag className={`w-5 h-5 ${bookmarked.has(currentIndex) ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* 题目内容 */}
            <div className="mb-4 md:mb-6">
              <div className="flex items-start">
                <span className="text-base md:text-lg font-semibold text-gray-900 mr-2 md:mr-3 flex-shrink-0">
                  {currentIndex + 1}.
                </span>
                <p className="text-base md:text-lg text-gray-900 leading-relaxed flex-1">
                  {currentQuestion.content}
                </p>
              </div>
            </div>

            {/* 选项 */}
            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleAnswerSelect(option.key)}
                  disabled={isSubmitted}
                  className={`w-full text-left p-3 md:p-4 rounded-lg border-2 transition active:scale-[0.98] ${getAnswerClass(
                    option.key
                  )} ${isSubmitted ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 mr-2 md:mr-3 mt-0.5 flex-shrink-0 text-sm md:text-base">
                      {option.key}.
                    </span>
                    <span className="flex-1 text-gray-700 text-sm md:text-base leading-relaxed">{option.value}</span>
                    {isSubmitted && option.key === currentQuestion.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 ml-2 flex-shrink-0" />
                    )}
                    {isSubmitted &&
                      selectedAnswer === option.key &&
                      option.key !== currentQuestion.correctAnswer && (
                        <XCircle className="w-5 h-5 text-red-500 ml-2 flex-shrink-0" />
                      )}
                  </div>
                </button>
              ))}
            </div>

            {/* 答案解析 */}
            {isSubmitted && (
              <div className="border-t pt-4 md:pt-6">
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="flex items-center justify-between w-full mb-3 md:mb-4 text-left"
                >
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">答案解析</h3>
                  {showExplanation ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {showExplanation && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
                      <div className="flex items-center mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-900">
                          正确答案：{currentQuestion.correctAnswer}
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                      <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>

                    {currentQuestion.knowledgePoints && currentQuestion.knowledgePoints.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {currentQuestion.knowledgePoints.map((point, index) => (
                          <span
                            key={index}
                            className="px-2 md:px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs md:text-sm"
                          >
                            {point}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex items-center justify-between mt-4 md:mt-6 pt-4 md:pt-6 border-t">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center px-3 md:px-4 py-2 text-sm md:text-base text-gray-600 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
                上一题
              </button>

              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                  className="px-4 md:px-6 py-2 text-sm md:text-base bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
                >
                  提交答案
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={currentIndex === questions.length - 1}
                  className="flex items-center px-4 md:px-6 py-2 text-sm md:text-base bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
                >
                  下一题
                  <ArrowRight className="w-4 h-4 ml-1 md:ml-2" />
                </button>
              )}
            </div>
          </div>

          {/* 题型分组导航 */}
          {sections.length > 0 && (
            <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4 md:mb-6">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">题型分组</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sections.map((section, idx) => {
                  const isCurrentSection = currentIndex >= section.startIndex && currentIndex <= section.endIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentIndex(section.startIndex);
                        setSelectedAnswer(answers[section.startIndex] || "");
                        setIsSubmitted(!!answers[section.startIndex]);
                        setShowExplanation(false);
                      }}
                      className={`p-3 md:p-4 rounded-lg border-2 text-left transition active:scale-[0.98] ${
                        isCurrentSection
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm md:text-base font-semibold text-gray-900 mb-1">{section.title}</div>
                          <div className="text-xs md:text-sm text-gray-600">
                            第 {section.startIndex + 1}-{section.endIndex + 1} 题 · 共 {section.count} 题
                          </div>
                        </div>
                        {isCurrentSection && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 题目导航 */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-20">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">题目导航</h3>
            <div className="grid grid-cols-8 md:grid-cols-10 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setSelectedAnswer(answers[index] || "");
                    setIsSubmitted(!!answers[index]);
                    setShowExplanation(false);
                  }}
                  className={`aspect-square rounded-lg text-xs md:text-sm font-medium transition active:scale-90 ${
                    index === currentIndex
                      ? "bg-primary-500 text-white"
                      : answers[index]
                      ? questions[index]?.correctAnswer === answers[index]
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function YearPracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-gray-600">加载题目中...</p>
        </div>
      </div>
    }>
      <YearPracticeContent />
    </Suspense>
  );
}
