"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Shuffle,
  Target,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";

const practiceM odes = [
  {
    id: "chapter",
    title: "章节练习",
    description: "按章节系统学习，逐个击破知识点",
    icon: BookOpen,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-500",
    features: ["系统学习", "循序渐进", "知识点全面"],
  },
  {
    id: "random",
    title: "随机练习",
    description: "随机抽取题目，全面检验掌握程度",
    icon: Shuffle,
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-500",
    features: ["随机出题", "查漏补缺", "灵活高效"],
  },
  {
    id: "special",
    title: "专项突破",
    description: "针对薄弱知识点，集中强化训练",
    icon: Target,
    color: "bg-yellow-50 border-yellow-200",
    iconColor: "text-yellow-500",
    features: ["针对性强", "快速提升", "精准练习"],
  },
  {
    id: "daily",
    title: "每日一练",
    description: "每天10题，坚持就是胜利",
    icon: Calendar,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-500",
    features: ["每日推送", "养成习惯", "积少成多"],
  },
  {
    id: "mock",
    title: "模拟考试",
    description: "真实模拟考试场景，检验学习成果",
    icon: FileText,
    color: "bg-red-50 border-red-200",
    iconColor: "text-red-500",
    features: ["真实模拟", "限时答题", "成绩评估"],
  },
];

const recentStudy = {
  totalQuestions: 1250,
  correctRate: 78,
  studyDays: 25,
  studyTime: 3600, // 秒
};

export default function PracticePage() {
  const [selectedExam, setSelectedExam] = useState("pharmacist");

  const exams = [
    { id: "pharmacist", name: "执业药师" },
    { id: "pharmacy-title", name: "药学职称" },
    { id: "tcm-doctor", name: "中医执业医师" },
    { id: "chinese-pharmacy", name: "中药师" },
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
            <Link href="/exams" className="text-gray-600 hover:text-primary-500 transition">
              考试分类
            </Link>
            <Link href="/wrong-questions" className="text-gray-600 hover:text-primary-500 transition">
              错题本
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
        {/* 学习统计 */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary-500" />
            我的学习数据
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-primary-500 mb-1">
                {recentStudy.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">已刷题数</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-500 mb-1">
                {recentStudy.correctRate}%
              </div>
              <div className="text-sm text-gray-600">正确率</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-500 mb-1">
                {recentStudy.studyDays}
              </div>
              <div className="text-sm text-gray-600">连续学习天数</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-500 mb-1">
                {Math.floor(recentStudy.studyTime / 3600)}h
              </div>
              <div className="text-sm text-gray-600">累计学习时长</div>
            </div>
          </div>
        </div>

        {/* 选择考试类型 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">选择考试类型</h2>
          <div className="flex gap-3 flex-wrap">
            {exams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => setSelectedExam(exam.id)}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  selectedExam === exam.id
                    ? "bg-primary-500 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-primary-500"
                }`}
              >
                {exam.name}
              </button>
            ))}
          </div>
        </div>

        {/* 练习模式 */}
        <div>
          <h2 className="text-xl font-bold mb-4">选择练习模式</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practiceModes.map((mode) => (
              <Link
                key={mode.id}
                href={`/practice/${mode.id}?exam=${selectedExam}`}
                className={`${mode.color} border-2 rounded-xl p-6 hover:shadow-lg transition group`}
              >
                <div className={`w-12 h-12 ${mode.color} rounded-lg flex items-center justify-center mb-4`}>
                  <mode.icon className={`w-6 h-6 ${mode.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-500 transition">
                  {mode.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{mode.description}</p>
                <div className="flex flex-wrap gap-2">
                  {mode.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 今日推荐 */}
        <div className="mt-8 bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                今日学习计划
              </h2>
              <p className="text-blue-100 mb-4">
                建议完成 50 道题，预计用时 30 分钟
              </p>
              <Link
                href={`/practice/daily?exam=${selectedExam}`}
                className="inline-flex items-center px-6 py-3 bg-white text-primary-500 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                <Clock className="w-4 h-4 mr-2" />
                开始今日练习
              </Link>
            </div>
            <div className="hidden md:block text-6xl opacity-50">
              📚
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

