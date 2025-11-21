"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  BookOpen,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  BarChart3,
  FileText,
  AlertCircle,
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
  description: string;
  questions: Question[];
  startIndex: number;
}

function MockExamContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const year = params.year as string;
  const examType = searchParams.get("exam") || "pharmacist";

  const [sections, setSections] = useState<QuestionSection[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchQuestions();
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [year]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/questions?sourceYear=${year}&subject=中药学综合知识与技能&limit=200`
      );
      const data = await response.json();

      if (data.success && data.data.questions) {
        const questions = data.data.questions;
        
        // 按题型分组
        const grouped: Record<string, Question[]> = {
          最佳选择题: [],
          配伍选择题: [],
          综合分析题: [],
          多项选择题: [],
        };

        questions.forEach((q: Question) => {
          const type = q.questionType;
          if (grouped[type]) {
            grouped[type].push(q);
          }
        });

        // 创建分组结构
        const questionSections: QuestionSection[] = [];
        let currentIndex = 0;

        if (grouped['最佳选择题'].length > 0) {
          questionSections.push({
            type: '最佳选择题',
            title: '一、最佳选择题',
            description: '每题的备选项中，只有1个最佳答案',
            questions: grouped['最佳选择题'],
            startIndex: currentIndex,
          });
          currentIndex += grouped['最佳选择题'].length;
        }

        if (grouped['配伍选择题'].length > 0) {
          questionSections.push({
            type: '配伍选择题',
            title: '二、配伍选择题',
            description: '共用备选答案，每组2-5题，选择最佳答案',
            questions: grouped['配伍选择题'],
            startIndex: currentIndex,
          });
          currentIndex += grouped['配伍选择题'].length;
        }

        if (grouped['综合分析题'].length > 0) {
          questionSections.push({
            type: '综合分析题',
            title: '三、综合分析题',
            description: '包括多个知识点，每组2-5题',
            questions: grouped['综合分析题'],
            startIndex: currentIndex,
          });
          currentIndex += grouped['综合分析题'].length;
        }

        if (grouped['多项选择题'].length > 0) {
          questionSections.push({
            type: '多项选择题',
            title: '四、多项选择题',
            description: '每题有2个或2个以上符合题意的正确答案',
            questions: grouped['多项选择题'],
            startIndex: currentIndex,
          });
        }

        setSections(questionSections);
      }
    } catch (error) {
      console.error("获取题目失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    if (isSubmitted) return;
    setUserAnswers({ ...userAnswers, [questionId]: answer });
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length === 0) {
      alert("请至少作答一题后再提交");
      return;
    }

    const confirmSubmit = window.confirm(
      `您已完成 ${Object.keys(userAnswers).length} / ${getTotalQuestions()} 题\n\n确定要提交试卷吗？`
    );

    if (confirmSubmit) {
      setIsSubmitted(true);
      setShowResults(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getTotalQuestions = () => {
    return sections.reduce((sum, section) => sum + section.questions.length, 0);
  };

  const getScore = () => {
    let correct = 0;
    let total = 0;

    sections.forEach((section) => {
      section.questions.forEach((q) => {
        total++;
        if (userAnswers[q.id] === q.correctAnswer) {
          correct++;
        }
      });
    });

    return { correct, total, percentage: total > 0 ? (correct / total) * 100 : 0 };
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnswerClass = (question: Question, optionKey: string) => {
    const userAnswer = userAnswers[question.id];
    const isUserAnswer = userAnswer === optionKey;
    const isCorrectAnswer = question.correctAnswer === optionKey;

    if (!isSubmitted) {
      return isUserAnswer
        ? "border-blue-500 bg-blue-50 shadow-sm"
        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50";
    }

    if (isCorrectAnswer) {
      return "border-green-500 bg-green-50";
    }

    if (isUserAnswer && !isCorrectAnswer) {
      return "border-red-500 bg-red-50";
    }

    return "border-gray-200 bg-gray-50";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-gray-600">加载试卷中...</p>
        </div>
      </div>
    );
  }

  const score = getScore();
  const totalQuestions = getTotalQuestions();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航 */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
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
              <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
              <h1 className="text-sm md:text-lg font-semibold text-gray-900">
                {year}年模拟考试
              </h1>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4 text-xs md:text-sm">
              <div className="flex items-center text-gray-600">
                <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span className="font-mono">{formatTime(timeSpent)}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-medium text-blue-500">{Object.keys(userAnswers).length}</span>
                <span className="hidden md:inline">/</span>
                <span className="hidden md:inline">{totalQuestions}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8 max-w-5xl">
        {/* 成绩卡片 */}
        {showResults && (
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl md:rounded-2xl shadow-lg p-6 md:p-8 mb-6 md:mb-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">考试完成</h2>
                  <p className="text-sm md:text-base text-white/80">
                    用时 {formatTime(timeSpent)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                <div className="text-2xl md:text-4xl font-bold mb-1">
                  {score.percentage.toFixed(1)}
                </div>
                <div className="text-xs md:text-sm text-white/80">总分</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                <div className="text-2xl md:text-4xl font-bold mb-1 text-green-200">
                  {score.correct}
                </div>
                <div className="text-xs md:text-sm text-white/80">答对</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                <div className="text-2xl md:text-4xl font-bold mb-1 text-red-200">
                  {score.total - score.correct}
                </div>
                <div className="text-xs md:text-sm text-white/80">答错</div>
              </div>
            </div>

            {score.percentage >= 72 && (
              <div className="mt-4 md:mt-6 bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                <p className="text-base md:text-lg font-medium">
                  🎉 恭喜！已达到及格线（72分）
                </p>
              </div>
            )}
          </div>
        )}

        {/* 试卷说明 */}
        {!isSubmitted && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg md:rounded-xl p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex items-start space-x-3 md:space-x-4">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">
                  📋 考试说明
                </h3>
                <ul className="text-xs md:text-sm text-gray-700 space-y-1">
                  <li>• 本试卷共 {totalQuestions} 题，满分 100 分，及格分数 72 分</li>
                  <li>• 请在作答完成后点击"提交试卷"查看成绩</li>
                  <li>• 提交后将显示正确答案和详细解析</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 题目分组显示 */}
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6 md:mb-8">
            {/* 分组标题 */}
            <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                {section.title}
              </h2>
              <p className="text-xs md:text-sm text-gray-600">
                {section.description}（共 {section.questions.length} 题）
              </p>
            </div>

            {/* 题目列表 */}
            <div className="space-y-4 md:space-y-6">
              {section.questions.map((question, qIndex) => {
                const questionNumber = section.startIndex + qIndex + 1;
                const userAnswer = userAnswers[question.id];
                const isCorrect = isSubmitted && userAnswer === question.correctAnswer;
                const isWrong = isSubmitted && userAnswer && userAnswer !== question.correctAnswer;

                return (
                  <div
                    key={question.id}
                    id={`question-${questionNumber}`}
                    className={`bg-white rounded-lg md:rounded-xl shadow-sm border-2 p-4 md:p-6 ${
                      isSubmitted
                        ? isCorrect
                          ? "border-green-200"
                          : isWrong
                          ? "border-red-200"
                          : "border-gray-100"
                        : "border-gray-100"
                    }`}
                  >
                    {/* 题号和状态 */}
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className="flex items-start flex-1">
                        <span className="inline-block px-2 md:px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs md:text-sm font-semibold mr-2 md:mr-3 flex-shrink-0">
                          {questionNumber}
                        </span>
                        <p className="text-sm md:text-base text-gray-900 leading-relaxed flex-1">
                          {question.content}
                        </p>
                      </div>
                      {isSubmitted && (
                        <div className="ml-2 flex-shrink-0">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                          ) : isWrong ? (
                            <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                          ) : (
                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* 选项 */}
                    <div className="space-y-2 md:space-y-3 mb-4">
                      {question.options.map((option) => (
                        <button
                          key={option.key}
                          onClick={() => handleAnswerChange(question.id, option.key)}
                          disabled={isSubmitted}
                          className={`w-full text-left p-3 md:p-4 rounded-lg border-2 transition ${getAnswerClass(
                            question,
                            option.key
                          )} ${isSubmitted ? "cursor-default" : "cursor-pointer active:scale-[0.98]"}`}
                        >
                          <div className="flex items-start">
                            <span className="font-semibold text-gray-700 mr-2 md:mr-3 text-sm md:text-base flex-shrink-0">
                              {option.key}.
                            </span>
                            <span className="flex-1 text-gray-700 text-sm md:text-base leading-relaxed">
                              {option.value}
                            </span>
                            {isSubmitted && option.key === question.correctAnswer && (
                              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500 ml-2 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* 答案解析 */}
                    {isSubmitted && (
                      <div className="border-t pt-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4 mb-3">
                          <div className="flex items-center text-xs md:text-sm text-green-900">
                            <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="font-medium">
                              正确答案：{question.correctAnswer}
                              {userAnswer && (
                                <span className="ml-2 text-gray-600">
                                  | 你的答案：
                                  <span className={userAnswer === question.correctAnswer ? "text-green-600" : "text-red-600"}>
                                    {userAnswer || "未作答"}
                                  </span>
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        {question.explanation && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                            <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                              <span className="font-medium text-blue-900">解析：</span>
                              {question.explanation}
                            </p>
                          </div>
                        )}

                        {question.knowledgePoints && question.knowledgePoints.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {question.knowledgePoints.map((point, idx) => (
                              <span
                                key={idx}
                                className="px-2 md:px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs"
                              >
                                {point}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 底部提交按钮 */}
      {!isSubmitted && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              <div className="text-xs md:text-sm text-gray-600">
                已完成：
                <span className="font-semibold text-blue-600 ml-1">
                  {Object.keys(userAnswers).length} / {totalQuestions}
                </span>
              </div>
              <button
                onClick={handleSubmit}
                className="px-6 md:px-8 py-2.5 md:py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg md:rounded-xl font-medium hover:shadow-lg transition active:scale-95 text-sm md:text-base"
              >
                提交试卷
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 提交后的操作 */}
      {isSubmitted && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between max-w-5xl mx-auto gap-3">
              <Link
                href={`/practice/history?exam=${examType}`}
                className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gray-100 text-gray-700 rounded-lg md:rounded-xl font-medium text-center hover:bg-gray-200 transition text-sm md:text-base"
              >
                返回列表
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg md:rounded-xl font-medium text-center hover:shadow-lg transition text-sm md:text-base"
              >
                重新考试
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MockExamPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-gray-600">加载试卷中...</p>
          </div>
        </div>
      }
    >
      <MockExamContent />
    </Suspense>
  );
}
