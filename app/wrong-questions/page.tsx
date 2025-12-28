"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  TrendingDown,
  RefreshCw,
  Trash2,
  Filter,
  BarChart3,
  Target,
  AlertCircle,
} from "lucide-react";

// 模拟错题数据
const mockWrongQuestions = [
  {
    id: "q1",
    content: "以下关于青霉素类抗生素的描述，正确的是？",
    examType: "执业药师",
    subject: "药学专业知识一",
    chapter: "抗生素",
    wrongCount: 3,
    lastWrongAt: "2025-10-25",
    knowledgePoints: ["β-内酰胺类", "抗生素机制"],
  },
  {
    id: "q2",
    content: "以下哪项不属于药物的首过效应？",
    examType: "执业药师",
    subject: "药学专业知识二",
    chapter: "药物代谢动力学",
    wrongCount: 2,
    lastWrongAt: "2025-10-24",
    knowledgePoints: ["首过效应", "药物代谢"],
  },
  {
    id: "q3",
    content: "阿司匹林的主要药理作用不包括？",
    examType: "执业药师",
    subject: "药学综合知识",
    chapter: "解热镇痛药",
    wrongCount: 1,
    lastWrongAt: "2025-10-23",
    knowledgePoints: ["阿司匹林", "解热镇痛"],
  },
];

// 薄弱知识点统计
const weakKnowledgePoints = [
  { point: "β-内酰胺类抗生素", wrongCount: 5, totalCount: 15, errorRate: 33 },
  { point: "药物代谢动力学", wrongCount: 4, totalCount: 12, errorRate: 33 },
  { point: "首过效应", wrongCount: 3, totalCount: 8, errorRate: 38 },
  { point: "解热镇痛药", wrongCount: 3, totalCount: 10, errorRate: 30 },
  { point: "抗生素作用机制", wrongCount: 2, totalCount: 6, errorRate: 33 },
];

export default function WrongQuestionsPage() {
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const subjects = [
    { id: "all", name: "全部" },
    { id: "subject1", name: "药学专业知识一" },
    { id: "subject2", name: "药学专业知识二" },
    { id: "subject3", name: "药学综合知识与技能" },
  ];

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
            <Link href="/practice" className="text-gray-600 hover:text-primary-500 transition">
              开始刷题
            </Link>
            <Link href="/study-center" className="text-gray-600 hover:text-primary-500 transition">
              学习中心
            </Link>
            <Link href="/membership" className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
              升级会员
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* 页头 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <AlertCircle className="w-8 h-8 text-error mr-3" />
            我的错题本
          </h1>
          <p className="text-gray-600">针对性复习错题，快速提升薄弱环节</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">错题总数</span>
              <AlertCircle className="w-5 h-5 text-error" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {mockWrongQuestions.length}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              占总题数 3%
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">平均错误次数</span>
              <TrendingDown className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">2.0</div>
            <div className="text-sm text-gray-500 mt-1">
              次/题
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">已掌握</span>
              <Target className="w-5 h-5 text-success" />
            </div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-500 mt-1">
              连续答对3次以上
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">薄弱知识点</span>
              <BarChart3 className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {weakKnowledgePoints.length}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              需重点关注
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 错题列表 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 筛选和排序 */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="recent">最近错误</option>
                    <option value="frequent">错误最多</option>
                    <option value="chapter">按章节</option>
                  </select>
                  <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>重练全部</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 错题卡片 */}
            {mockWrongQuestions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="px-3 py-1 bg-error-light text-error text-xs rounded-full font-medium">
                        错误 {question.wrongCount} 次
                      </span>
                      <span className="text-sm text-gray-500">
                        {question.examType} · {question.subject}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {question.content}
                    </h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm text-gray-500">
                        章节：{question.chapter}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-sm text-gray-500">
                        最近错误：{question.lastWrongAt}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {question.knowledgePoints.map((point, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                  <Link
                    href={`/practice/wrong/${question.id}`}
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-center font-medium"
                  >
                    重新做题
                  </Link>
                  <Link
                    href={`/question/${question.id}`}
                    className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition text-center font-medium"
                  >
                    查看解析
                  </Link>
                  <button className="px-4 py-2 bg-white border border-gray-200 text-gray-400 rounded-lg hover:text-error hover:border-error transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 右侧薄弱知识点 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 text-purple-500 mr-2" />
                薄弱知识点分析
              </h2>
              <div className="space-y-4">
                {weakKnowledgePoints.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {item.point}
                      </span>
                      <span className="text-sm font-semibold text-error">
                        {item.errorRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-error h-full rounded-full transition-all"
                        style={{ width: `${item.errorRate}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        错 {item.wrongCount} / 共 {item.totalCount} 题
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition font-medium">
                针对性练习
              </button>
            </div>

            {/* 学习建议 */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Target className="w-5 h-5 text-primary-500 mr-2" />
                AI 学习建议
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>建议重点复习 &quot;β-内酰胺类抗生素&quot; 相关知识</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>药物代谢动力学部分需要加强理解</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>建议每天完成20道相关题目巩固</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

