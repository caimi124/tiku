"use client";

import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { useLearningRecord } from "@/lib/hooks/useLearningRecord";

// 模拟题目数据
const mockQuestion = {
  id: "q1",
  examType: "执业药师",
  subject: "药学专业知识一",
  chapter: "药物化学",
  questionType: "single",
  content: "以下关于青霉素类抗生素的描述，正确的是？",
  options: [
    {
      key: "A",
      value: "青霉素属于β-内酰胺类抗生素，通过抑制细菌细胞壁合成发挥抗菌作用",
    },
    {
      key: "B",
      value: "青霉素对革兰阴性菌的抗菌作用优于革兰阳性菌",
    },
    {
      key: "C",
      value: "青霉素不会引起过敏反应",
    },
    {
      key: "D",
      value: "青霉素可以长期大剂量使用而不产生耐药性",
    },
  ],
  correctAnswer: "A",
  explanation:
    "青霉素是β-内酰胺类抗生素的代表药物，主要通过抑制细菌细胞壁的合成来发挥抗菌作用。青霉素对革兰阳性菌的作用更强，可能引起过敏反应（选项C错误），长期使用也会产生耐药性（选项D错误）。",
  aiExplanation:
    "让我详细解析这道题：\n\n1. β-内酰胺类抗生素：青霉素是该类药物的典型代表，其结构中含有β-内酰胺环。\n\n2. 作用机制：通过与细菌细胞壁合成过程中的青霉素结合蛋白(PBPs)结合，抑制细胞壁肽聚糖的交联，导致细菌细胞壁缺损而死亡。\n\n3. 抗菌谱：青霉素主要对革兰阳性菌有效，对革兰阴性菌作用较弱（选项B错误）。\n\n4. 过敏反应：青霉素是最常见的引起药物过敏的药物之一，使用前必须做皮试（选项C错误）。\n\n5. 耐药性：长期或不规范使用会导致细菌产生β-内酰胺酶，分解药物产生耐药（选项D错误）。",
  knowledgePoints: ["β-内酰胺类抗生素", "青霉素", "抗生素作用机制"],
  difficulty: 2,
};

export default function PracticeModePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const mode = params.mode as string;
  const examType = searchParams.get("exam") || "pharmacist";

  const [currentQuestion, setCurrentQuestion] = useState(mockQuestion);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMarked, setIsMarked] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  
  // 学习记录 Hook - 用于记录答题数据并更新掌握度
  // TODO: 从认证系统获取真实用户ID
  const { recordAnswer, isSubmitting: isRecording } = useLearningRecord('demo-user');
  const answerStartTime = useRef<number>(Date.now());

  // 计时器
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 重置答题开始时间
  useEffect(() => {
    answerStartTime.current = Date.now();
  }, [currentQuestion]);

  const handleSubmit = async () => {
    if (!selectedAnswer) return;
    setIsSubmitted(true);
    setShowExplanation(true);
    
    // 记录答题数据 - Requirements: 2.1, 2.2
    const isCorrectAnswer = selectedAnswer === currentQuestion.correctAnswer;
    const actualTimeSpent = Math.floor((Date.now() - answerStartTime.current) / 1000);
    
    // 如果题目有关联的知识点ID，记录学习数据
    if (currentQuestion.id) {
      await recordAnswer({
        knowledgePointId: currentQuestion.id, // 使用题目ID作为知识点ID
        questionId: currentQuestion.id,
        isCorrect: isCorrectAnswer,
        timeSpent: actualTimeSpent,
      });
    }
  };

  const handleNext = () => {
    // 重置状态
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setShowExplanation(false);
    setTimeSpent(0);
    // 这里应该加载下一题
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/practice" className="flex items-center space-x-2 text-gray-600 hover:text-primary-500">
            <ChevronLeft className="w-5 h-5" />
            <span>返回练习列表</span>
          </Link>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeSpent)}</span>
            </div>
            <div className="text-gray-600">
              第 <span className="text-primary-500 font-bold">15</span> / 100 题
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 题目卡片 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* 题目头部 */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-primary-500 text-white text-xs rounded-full font-medium">
                    {currentQuestion.questionType === "single" ? "单选题" : "多选题"}
                  </span>
                  <span className="text-sm text-gray-600">
                    {currentQuestion.examType} · {currentQuestion.subject}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-2 rounded-lg transition ${
                      isFavorite
                        ? "bg-red-100 text-red-500"
                        : "bg-white text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={() => setIsMarked(!isMarked)}
                    className={`p-2 rounded-lg transition ${
                      isMarked
                        ? "bg-yellow-100 text-yellow-500"
                        : "bg-white text-gray-400 hover:text-yellow-500"
                    }`}
                  >
                    <Flag className={`w-5 h-5 ${isMarked ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                章节：{currentQuestion.chapter} | 难度：
                {"★".repeat(currentQuestion.difficulty)}
                {"☆".repeat(5 - currentQuestion.difficulty)}
              </div>
            </div>

            {/* 题目内容 */}
            <div className="p-8">
              <h2 className="text-xl font-medium text-gray-900 mb-6 leading-relaxed">
                {currentQuestion.content}
              </h2>

              {/* 选项 */}
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedAnswer === option.key;
                  const isCorrectOption = option.key === currentQuestion.correctAnswer;
                  
                  let optionClass = "border-2 border-gray-200 hover:border-primary-300 bg-white";
                  
                  if (isSubmitted) {
                    if (isCorrectOption) {
                      optionClass = "border-2 border-success bg-success-light";
                    } else if (isSelected && !isCorrect) {
                      optionClass = "border-2 border-error bg-error-light";
                    }
                  } else if (isSelected) {
                    optionClass = "border-2 border-primary-500 bg-primary-50";
                  }

                  return (
                    <button
                      key={option.key}
                      onClick={() => !isSubmitted && setSelectedAnswer(option.key)}
                      disabled={isSubmitted}
                      className={`w-full text-left p-4 rounded-lg transition ${optionClass} ${
                        !isSubmitted ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <div className="flex items-start">
                        <span className="font-bold text-primary-500 mr-3 mt-0.5">
                          {option.key}.
                        </span>
                        <span className="flex-1 text-gray-700">{option.value}</span>
                        {isSubmitted && isCorrectOption && (
                          <CheckCircle className="w-5 h-5 text-success ml-2 flex-shrink-0" />
                        )}
                        {isSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-error ml-2 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 答案解析 */}
              {showExplanation && (
                <div className="mt-6 animate-slide-in">
                  {/* 答题结果 */}
                  <div
                    className={`p-4 rounded-lg mb-4 ${
                      isCorrect ? "bg-success-light" : "bg-error-light"
                    }`}
                  >
                    <div className="flex items-center">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-success mr-2" />
                      ) : (
                        <XCircle className="w-6 h-6 text-error mr-2" />
                      )}
                      <span className={`font-semibold ${isCorrect ? "text-success" : "text-error"}`}>
                        {isCorrect ? "回答正确！" : "回答错误"}
                      </span>
                      <span className="ml-auto text-sm text-gray-600">
                        用时：{formatTime(timeSpent)}
                      </span>
                    </div>
                  </div>

                  {/* 正确答案 */}
                  <div className="bg-blue-50 border-l-4 border-primary-500 p-4 mb-4">
                    <div className="text-sm font-semibold text-primary-700 mb-1">
                      ✓ 正确答案
                    </div>
                    <div className="text-gray-700">{currentQuestion.correctAnswer}</div>
                  </div>

                  {/* 知识点 */}
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">📚 涉及知识点</div>
                    <div className="flex flex-wrap gap-2">
                      {currentQuestion.knowledgePoints.map((point, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 基础解析 */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">📝 题目解析</div>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {currentQuestion.explanation}
                    </div>
                  </div>

                  {/* AI 详细解析 */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center mb-2">
                      <BookOpen className="w-4 h-4 text-purple-500 mr-2" />
                      <div className="text-sm font-semibold text-purple-700">
                        💡 AI 智能解析（会员专享）
                      </div>
                    </div>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                      {currentQuestion.aiExplanation}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 底部操作按钮 */}
            <div className="border-t border-gray-100 px-8 py-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <button className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>上一题</span>
                </button>

                {!isSubmitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedAnswer}
                    className="px-8 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    提交答案
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-8 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center space-x-2 font-semibold"
                  >
                    <span>下一题</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <button className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2">
                  <span>下一题</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 进度提示 */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-4 px-6 py-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="text-sm text-gray-600">
                已完成 <span className="font-semibold text-primary-500">15</span> 题
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="text-sm text-gray-600">
                正确率 <span className="font-semibold text-success">80%</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="text-sm text-gray-600">
                总用时 <span className="font-semibold text-gray-900">25分钟</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

