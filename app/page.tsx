"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Target, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="container mx-auto px-4 pt-12 md:pt-20 pb-12 md:pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            AI 智能学习平台
            <br />
            <span className="text-blue-500">助力医药考试通关</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            AI智能推荐  10万+精选题目  专为执业药师考试打造
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/practice" className="px-8 py-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition">
              开始刷题
            </Link>
            <Link href="/dashboard" className="px-8 py-4 bg-white text-blue-500 border-2 border-blue-500 rounded-lg font-semibold hover:bg-blue-50 transition">
              学习仪表盘
            </Link>
          </div>
        </div>
      </section>
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p> 2024 医药考试通 All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
