"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Target,
  Users,
  Sparkles,
  Award,
  Star,
  Trophy,
  MessageCircle,
  FileText,
  LayoutDashboard,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero 区域 - 移动端优化 */}
      <section className="container mx-auto px-4 pt-12 md:pt-20 pb-12 md:pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-6">
            <Target className="w-4 h-4" />
            <span>专注医药行业考试</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight px-4">
            AI 智能学习平台
            <br />
            <span className="text-blue-500">助力医药考试通关</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed px-4">
            AI智能推荐 · 机构资料对比 · 10万+精选题目
            <br className="hidden md:block" />
            专为执业药师、护师、中医师考试打造
          </p>

          {/* CTA按钮 - 移动端优化 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <Link
              href="/recommend"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold text-lg hover:shadow-xl transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>AI智能推荐</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/practice"
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-500 border-2 border-blue-500 rounded-lg font-semibold text-lg hover:bg-blue-50 transition"
            >
              开始刷题
            </Link>
          </div>

          {/* 数据统计 - 移动端优化 */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-12 md:mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-500">10万+</div>
              <div className="text-sm md:text-base text-gray-600 mt-1">精选题目</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-500">5万+</div>
              <div className="text-sm md:text-base text-gray-600 mt-1">活跃用户</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-500">90%+</div>
              <div className="text-sm md:text-base text-gray-600 mt-1">命中率</div>
            </div>
          </div>
        </div>
      </section>
