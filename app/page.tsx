"use client";

import Link from "next/link";
import Image from "next/image";
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
  BarChart3, 
  BookMarked, 
  Zap,
  CheckCircle2,
  Clock,
  Shield,
  Lightbulb,
  GraduationCap,
  ChevronRight,
  Play,
  RefreshCw,
  PieChart,
  Layers,
  HelpCircle,
  ChevronDown,
  Stethoscope,
  Pill,
  Heart,
  Activity
} from "lucide-react";
import { useState, useEffect } from "react";

// FAQ 组件
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left hover:text-blue-500 transition"
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-5 text-gray-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  useEffect(() => {
    const heroCta = {
      primaryCtaHref: "/exams/start",
      primaryCtaLabel: "Start Diagnostic",
    };
    // #region agent log
    fetch("/api/debug-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "pre-fix",
        hypothesisId: "H2",
        location: "app/page.tsx:heroCta",
        message: "Home hero CTA configured",
        data: heroCta,
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      
      {/* ========== 1. Hero 主视觉区 ========== */}
      <section className="relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-transparent" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 pt-12 md:pt-20 pb-16 md:pb-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左侧文案 */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>基于知识图谱的 AI 智能学习系统</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                告别盲目刷题<br />
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  让每一分钟都更高效
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-4 leading-relaxed">
                覆盖 <span className="font-semibold text-blue-600">10万+</span> 精选题目，
                AI 精准定位你的薄弱点，<br className="hidden md:block" />
                自动生成个性化学习路径，真正提升你的通过率。
              </p>
              
              {/* 痛点解决 */}
              <div className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start">
                <span className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />基础差？AI智能补强
                </span>
                <span className="inline-flex items-center px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />学不完？重点优先推荐
                </span>
                <span className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />没方向？智能规划路径
                </span>
              </div>
              
              {/* CTA 按钮 */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link 
                  href="/exams/start" 
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Diagnostic</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/knowledge" 
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-semibold text-lg hover:border-blue-300 hover:text-blue-500 transition-all flex items-center justify-center space-x-2"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>查看知识路径</span>
                </Link>
              </div>
              
              {/* 信任标识 */}
              <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start text-sm text-gray-500">
                <span className="flex items-center"><Shield className="w-4 h-4 mr-1 text-green-500" />数据安全加密</span>
                <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-blue-500" />7×24小时可用</span>
                <span className="flex items-center"><RefreshCw className="w-4 h-4 mr-1 text-purple-500" />题库持续更新</span>
              </div>
            </div>
            
            {/* 右侧产品预览 */}
            <div className="relative hidden lg:block">
              <div className="relative bg-white rounded-2xl shadow-2xl p-4 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                  {/* 模拟仪表盘界面 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">学习仪表盘</div>
                          <div className="text-sm text-gray-500">今日学习进度</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-500">78%</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-500">156</div>
                        <div className="text-xs text-gray-500">今日做题</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-500">89%</div>
                        <div className="text-xs text-gray-500">正确率</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-purple-500">12</div>
                        <div className="text-xs text-gray-500">连续天数</div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">AI 推荐今日重点</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">药物化学 - 抗生素类</span>
                          <span className="text-orange-500 font-medium">薄弱</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">药理学 - 心血管药物</span>
                          <span className="text-yellow-500 font-medium">待巩固</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 浮动卡片 */}
              <div className="absolute -bottom-4 -left-8 bg-white rounded-xl shadow-lg p-4 flex items-center space-x-3 animate-bounce-slow">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">恭喜通过！</div>
                  <div className="text-sm text-gray-500">模拟考试 92 分</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 数据统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white/60 backdrop-blur rounded-xl">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">10万+</div>
              <div className="text-gray-600 mt-1">精选题目</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur rounded-xl">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">5万+</div>
              <div className="text-gray-600 mt-1">注册用户</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur rounded-xl">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">92%</div>
              <div className="text-gray-600 mt-1">用户通过率</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur rounded-xl">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">4.9</div>
              <div className="text-gray-600 mt-1">用户评分</div>
            </div>
          </div>
        </div>
      </section>


      {/* ========== 2. 核心卖点区 ========== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              为什么选择我们？
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              区别于传统题库的"题海战术"，我们用 AI 技术让学习更聪明、更高效
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* 卖点1 */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl group-hover:bg-blue-300/40 transition" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI 智能定制学习路径</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  基于知识图谱和遗忘曲线算法，AI 自动分析你的薄弱点，智能推荐最需要练习的题目，不再盲目刷题。
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-500 mr-2" />智能诊断知识盲区</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-500 mr-2" />个性化复习计划</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-500 mr-2" />艾宾浩斯记忆曲线</li>
                </ul>
              </div>
            </div>
            
            {/* 卖点2 */}
            <div className="group relative bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl group-hover:bg-purple-300/40 transition" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">10万+ 精选医药题库</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  覆盖执业药师、执业医师、护师等多个考试类型，题目来源权威，解析详尽专业，持续更新。
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-purple-500 mr-2" />2022-2024 历年真题</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-purple-500 mr-2" />章节同步练习</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-purple-500 mr-2" />高频考点专项训练</li>
                </ul>
              </div>
            </div>
            
            {/* 卖点3 */}
            <div className="group relative bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full blur-2xl group-hover:bg-green-300/40 transition" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">学习仪表盘 & 数据分析</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  实时追踪学习进度，可视化展示知识点掌握度、正确率趋势、学习热力图，让进步看得见。
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />知识点掌握度分析</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />错题本智能归类</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />学习连续天数激励</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 3. 产品功能展示区 ========== */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              功能全面，助力高效备考
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              从刷题到复习，从诊断到提升，一站式解决你的备考需求
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 功能卡片 */}
            {[
              { icon: FileText, title: "历年真题", desc: "2022-2024年真题，还原真实考试场景", color: "blue", href: "/practice/history" },
              { icon: Layers, title: "章节练习", desc: "按教材章节系统学习，循序渐进", color: "purple", href: "/practice/by-chapter" },
              { icon: Target, title: "薄弱专练", desc: "AI识别薄弱点，针对性强化训练", color: "orange", href: "/practice/weak" },
              { icon: Zap, title: "AI智能组卷", desc: "根据掌握度智能生成个性化试卷", color: "green", href: "/practice/smart" },
              { icon: BookMarked, title: "知识图谱", desc: "可视化知识结构，掌握全局脉络", color: "indigo", href: "/knowledge" },
              { icon: PieChart, title: "错题本", desc: "自动收集错题，智能分类复习", color: "red", href: "/dashboard" },
            ].map((item, index) => (
              <Link 
                key={index}
                href={item.href}
                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className={`w-12 h-12 bg-${item.color}-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-6 h-6 text-${item.color}-500`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-500 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
                <div className="mt-4 flex items-center text-blue-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  立即体验 <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* ========== 4. 三步快速上手 ========== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              3 步开启智能学习
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              无需复杂设置，快速开始你的高效备考之旅
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* 连接线 */}
              <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200" />
              
              {/* 步骤1 */}
              <div className="text-center relative">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-xl relative z-10">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">1</div>
                    <Target className="w-8 h-8 text-white/80 mx-auto mt-1" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">智能诊断</h3>
                <p className="text-gray-600">
                  做 20 道诊断题<br />AI 快速分析你的知识水平
                </p>
              </div>
              
              {/* 步骤2 */}
              <div className="text-center relative">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl relative z-10">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">2</div>
                    <Lightbulb className="w-8 h-8 text-white/80 mx-auto mt-1" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">获取学习路径</h3>
                <p className="text-gray-600">
                  AI 生成个性化学习计划<br />精准定位薄弱知识点
                </p>
              </div>
              
              {/* 步骤3 */}
              <div className="text-center relative">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl relative z-10">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">3</div>
                    <TrendingUp className="w-8 h-8 text-white/80 mx-auto mt-1" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">高效提升</h3>
                <p className="text-gray-600">
                  AI 动态调整题目难度<br />持续追踪学习进步
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link 
                href="/practice/smart" 
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-5 h-5" />
                <span>开始智能诊断</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 5. 适用人群 ========== */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              适用考试类型
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              覆盖医药行业主流考试，满足不同备考需求
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Pill, title: "执业药师", desc: "西药/中药", color: "blue" },
              { icon: Stethoscope, title: "执业医师", desc: "临床/中医/口腔", color: "green" },
              { icon: Heart, title: "护士/护师", desc: "初级/主管护师", color: "pink" },
              { icon: Activity, title: "医学基础", desc: "药理/病理/解剖", color: "purple" },
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-blue-200"
              >
                <div className={`w-16 h-16 mx-auto bg-${item.color}-100 rounded-full flex items-center justify-center mb-4`}>
                  <item.icon className={`w-8 h-8 text-${item.color}-500`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 6. AI 智能学习系统介绍 ========== */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-medium mb-6">
                <Brain className="w-4 h-4" />
                <span>核心技术</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                AI 智能推荐系统<br />
                <span className="text-purple-500">让学习更聪明</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                我们的 AI 系统基于知识图谱构建，结合艾宾浩斯遗忘曲线和自适应学习算法，
                能够精准分析你的学习状态，智能推荐最适合当前阶段的学习内容。
              </p>
              
              <div className="space-y-4">
                {[
                  { title: "知识图谱分析", desc: "构建完整知识体系，识别知识点关联" },
                  { title: "遗忘曲线算法", desc: "在最佳时机提醒复习，强化记忆效果" },
                  { title: "自适应难度调整", desc: "根据正确率动态调整题目难度" },
                  { title: "薄弱点精准定位", desc: "AI 分析错题规律，找出真正的知识盲区" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8">
                {/* AI 系统示意图 */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">知识点掌握度</span>
                      <span className="text-sm text-gray-500">基于 1,234 道题</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">药物化学</span>
                          <span className="text-green-500 font-medium">85%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{width: '85%'}} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">药理学</span>
                          <span className="text-yellow-500 font-medium">62%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 rounded-full" style={{width: '62%'}} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">药剂学</span>
                          <span className="text-orange-500 font-medium">45%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{width: '45%'}} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center space-x-3 mb-3">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      <span className="font-medium text-gray-900">AI 今日推荐</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                        <span className="text-sm text-gray-700">药剂学 - 制剂稳定性</span>
                        <span className="text-xs text-orange-600 font-medium px-2 py-0.5 bg-orange-100 rounded">优先复习</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                        <span className="text-sm text-gray-700">药理学 - 抗菌药物</span>
                        <span className="text-xs text-yellow-600 font-medium px-2 py-0.5 bg-yellow-100 rounded">待巩固</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ========== 7. 学习仪表盘展示 ========== */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                学习仪表盘<br />
                让进步看得见
              </h2>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                可视化的学习数据分析，帮助你全面了解自己的学习状态。
                追踪每日进度、分析正确率趋势、查看学习热力图，
                让备考更有方向感。
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <BarChart3 className="w-8 h-8 text-white mb-2" />
                  <h4 className="font-semibold text-white">进度追踪</h4>
                  <p className="text-blue-100 text-sm">实时查看学习进度</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <TrendingUp className="w-8 h-8 text-white mb-2" />
                  <h4 className="font-semibold text-white">趋势分析</h4>
                  <p className="text-blue-100 text-sm">正确率变化曲线</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <Target className="w-8 h-8 text-white mb-2" />
                  <h4 className="font-semibold text-white">薄弱分析</h4>
                  <p className="text-blue-100 text-sm">精准定位弱点</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <Award className="w-8 h-8 text-white mb-2" />
                  <h4 className="font-semibold text-white">成就激励</h4>
                  <p className="text-blue-100 text-sm">学习连续天数</p>
                </div>
              </div>
              
              <Link 
                href="/dashboard" 
                className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-xl transition-all"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>查看我的仪表盘</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="hidden lg:block">
              {/* 仪表盘预览 */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900">学习概览</h3>
                  <span className="text-sm text-gray-500">本周数据</span>
                </div>
                
                {/* 模拟热力图 */}
                <div className="mb-6">
                  <div className="text-sm text-gray-600 mb-2">学习热力图</div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({length: 28}).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-full aspect-square rounded-sm ${
                          [0,3,5,7,10,12,14,17,19,21,24,26].includes(i) 
                            ? 'bg-green-500' 
                            : [1,6,11,15,20,25].includes(i)
                              ? 'bg-green-300'
                              : [2,8,16,22].includes(i)
                                ? 'bg-green-200'
                                : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* 统计数据 */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">847</div>
                    <div className="text-xs text-gray-500">本周做题</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">86%</div>
                    <div className="text-xs text-gray-500">正确率</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">7</div>
                    <div className="text-xs text-gray-500">连续天数</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 8. 用户评价 ========== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              用户真实评价
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              来自通过考试学员的真实反馈
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                content: "题库质量很高，解析非常详细专业。AI推荐功能帮我精准找到了薄弱点，备考效率提升了很多。最终顺利通过执业药师考试！",
                author: "张同学",
                role: "执业药师考生",
                score: "考试成绩 89 分",
                icon: Award,
                color: "blue"
              },
              {
                content: "学习仪表盘太棒了！每天都能看到自己的进步，学习热力图让我保持了连续30天的学习。知识图谱功能帮我理清了整个知识体系。",
                author: "李同学", 
                role: "护师考生",
                score: "一次通过",
                icon: Trophy,
                color: "purple"
              },
              {
                content: "之前用其他题库总是盲目刷题，这个平台的AI推荐真的很智能，能根据我的错题自动调整复习计划。界面简洁，使用方便！",
                author: "王同学",
                role: "执业医师考生", 
                score: "考试成绩 92 分",
                icon: GraduationCap,
                color: "green"
              }
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center space-x-1 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">"{item.content}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-${item.color}-100 rounded-full flex items-center justify-center`}>
                      <item.icon className={`w-6 h-6 text-${item.color}-500`} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{item.author}</div>
                      <div className="text-sm text-gray-500">{item.role}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium text-${item.color}-500 bg-${item.color}-50 px-3 py-1 rounded-full`}>
                    {item.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 数据证明 */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">92%</div>
                <div className="text-gray-600">用户通过率</div>
                <div className="text-sm text-gray-400 mt-1">高于行业平均</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">50,000+</div>
                <div className="text-gray-600">注册用户</div>
                <div className="text-sm text-gray-400 mt-1">持续增长中</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">1,000万+</div>
                <div className="text-gray-600">累计做题次数</div>
                <div className="text-sm text-gray-400 mt-1">数据持续更新</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600 mb-2">4.9/5</div>
                <div className="text-gray-600">用户满意度</div>
                <div className="text-sm text-gray-400 mt-1">基于真实评价</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ========== 9. FAQ 常见问题 ========== */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              常见问题
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              关于平台使用的常见疑问解答
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <FAQItem 
              question="平台适合哪些考试？"
              answer="目前平台主要覆盖执业药师（西药/中药）、执业医师（临床/中医/口腔）、护士/护师等医药行业主流考试。题库持续更新中，更多考试类型即将上线。"
            />
            <FAQItem 
              question="题库是否免费使用？"
              answer="平台提供大量免费题目供用户练习，包括历年真题、章节练习等基础功能。高级功能如AI智能推荐、个性化学习路径、深度数据分析等需要开通会员。新用户注册即可免费体验全部功能7天。"
            />
            <FAQItem 
              question="AI 推荐系统是如何工作的？"
              answer="我们的AI系统基于知识图谱构建，结合艾宾浩斯遗忘曲线算法。系统会分析你的做题记录、正确率、答题时间等数据，识别知识薄弱点，并在最佳复习时机推荐相关题目，帮助你高效巩固记忆。"
            />
            <FAQItem 
              question="学习数据是否安全？"
              answer="我们非常重视用户数据安全。所有数据采用加密传输和存储，服务器部署在国内合规云平台。我们承诺不会将用户数据用于任何商业目的或分享给第三方。"
            />
            <FAQItem 
              question="可以在手机上使用吗？"
              answer="可以！平台采用响应式设计，完美适配手机、平板、电脑等各种设备。你可以随时随地打开浏览器进行学习，学习进度自动同步。"
            />
            <FAQItem 
              question="题目解析是否详细？"
              answer="每道题目都配有详细的解析，包括正确答案说明、错误选项分析、相关知识点链接等。部分重点题目还提供视频讲解和拓展阅读，帮助你深入理解知识点。"
            />
          </div>
        </div>
      </section>

      {/* ========== 10. 底部 CTA ========== */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur text-white rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>立即开始，免费体验全部功能</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              开启你的高效备考之旅
            </h2>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              加入 50,000+ 医药考生，让 AI 助力你的考试成功<br />
              新用户注册即享 7 天免费会员体验
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/register" 
                className="w-full sm:w-auto px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center space-x-2"
              >
                <GraduationCap className="w-6 h-6" />
                <span>免费注册开始学习</span>
              </Link>
              <Link 
                href="/practice" 
                className="w-full sm:w-auto px-10 py-5 bg-white/10 backdrop-blur text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center space-x-2"
              >
                <FileText className="w-6 h-6" />
                <span>先体验刷题</span>
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-8 mt-10 text-white/80 text-sm">
              <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5" />无需信用卡</span>
              <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5" />随时取消</span>
              <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5" />数据永久保存</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Footer ========== */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="w-8 h-8 text-blue-500" />
                <span className="text-xl font-bold text-white">医考必过</span>
              </div>
              <p className="text-sm leading-relaxed">
                基于 AI 技术的智能医药考试学习平台，<br />
                让每一位考生都能高效备考、顺利通关。
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">产品功能</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/practice/history" className="hover:text-white transition">历年真题</Link></li>
                <li><Link href="/practice/by-chapter" className="hover:text-white transition">章节练习</Link></li>
                <li><Link href="/practice/smart" className="hover:text-white transition">AI智能组卷</Link></li>
                <li><Link href="/knowledge" className="hover:text-white transition">知识图谱</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition">学习仪表盘</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">考试类型</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/practice?exam=pharmacist" className="hover:text-white transition">执业药师</Link></li>
                <li><Link href="/practice?exam=doctor" className="hover:text-white transition">执业医师</Link></li>
                <li><Link href="/practice?exam=nurse" className="hover:text-white transition">护士/护师</Link></li>
                <li><Link href="/practice?exam=tcm" className="hover:text-white transition">中医考试</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">关于我们</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">关于平台</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">联系我们</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">隐私政策</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">服务条款</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm">© 2024 医考必过. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-sm">客服微信：yikaobiguo</span>
              <span className="text-sm">|</span>
              <span className="text-sm">邮箱：support@yikaobiguo.com</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
