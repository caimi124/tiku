"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Target,
  TrendingUp,
  Users,
  CheckCircle,
  Sparkles,
  Award,
  Star,
  Trophy,
  Zap,
  MessageCircle,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 导航栏 - 移动端优化 */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-gray-900">医药考试通</span>
            </Link>

            {/* 桌面端导航 */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link
                href="/recommend"
                className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 transition font-medium"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI推荐</span>
              </Link>
              <Link
                href="/practice/history?exam=pharmacist"
                className="flex items-center space-x-1 text-orange-500 hover:text-orange-600 transition font-medium"
              >
                <FileText className="w-4 h-4" />
                <span>历年真题</span>
              </Link>
              <Link
                href="/institutions"
                className="text-gray-600 hover:text-blue-500 transition"
              >
                机构对比
              </Link>
              <Link
                href="/materials"
                className="text-gray-600 hover:text-blue-500 transition"
              >
                资料测评
              </Link>
              <Link
                href="/predictions"
                className="text-gray-600 hover:text-blue-500 transition"
              >
                押题专区
              </Link>
              <Link
                href="/community"
                className="text-gray-600 hover:text-blue-500 transition"
              >
                学员社区
              </Link>
              <Link
                href="/practice"
                className="text-gray-600 hover:text-blue-500 transition"
              >
                开始刷题
              </Link>
            </div>

            {/* 右侧按钮 */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-500 transition"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition font-medium"
              >
                免费注册
              </Link>
            </div>

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-500"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* 移动端菜单 */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t">
              <div className="flex flex-col space-y-3">
                <Link
                  href="/recommend"
                  className="flex items-center space-x-2 px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>AI推荐</span>
                </Link>
                <Link
                  href="/practice/history?exam=pharmacist"
                  className="flex items-center space-x-2 px-4 py-2 text-orange-500 hover:bg-orange-50 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="w-5 h-5" />
                  <span>🔥 历年真题</span>
                </Link>
                <Link
                  href="/institutions"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  机构对比
                </Link>
                <Link
                  href="/materials"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  资料测评
                </Link>
                <Link
                  href="/predictions"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  押题专区
                </Link>
                <Link
                  href="/community"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  学员社区
                </Link>
                <Link
                  href="/practice"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  开始刷题
                </Link>
                <div className="flex flex-col space-y-2 px-4 pt-4 border-t">
                  <Link
                    href="/login"
                    className="py-2 text-center text-gray-700 hover:text-blue-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    className="py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    免费注册
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

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

      {/* AI推荐入口 - 醒目展示 */}
      <section className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              <Brain className="w-4 h-4" />
              <span>AI智能推荐系统</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              不知道选哪个培训机构？
            </h2>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              AI根据您的需求和预算，智能推荐最适合的培训方案
            </p>
            <Link
              href="/recommend"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-500 rounded-lg font-bold text-lg hover:shadow-2xl transition transform hover:scale-105 space-x-2"
            >
              <Sparkles className="w-6 h-6" />
              <span>免费获取AI推荐</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 历年真题精选 - 新增核心功能入口 */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-8 md:p-12 text-white mb-12 md:mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              <FileText className="w-4 h-4" />
              <span>核心备考资源</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              📚 执业药师历年真题库
            </h2>
            <p className="text-lg md:text-xl text-orange-100 mb-6">
              2022-2024年真题全收录 · 1440+道精选真题 · 按年份/科目分类练习
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/practice/history?exam=pharmacist"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-orange-500 rounded-lg font-bold text-lg hover:shadow-2xl transition transform hover:scale-105 space-x-2"
              >
                <FileText className="w-6 h-6" />
                <span>开始真题练习</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-6 text-white/90">
                <div className="text-center">
                  <div className="text-2xl font-bold">1440+</div>
                  <div className="text-sm">道真题</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">3年</div>
                  <div className="text-sm">真题覆盖</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">4科</div>
                  <div className="text-sm">专业分类</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 热度排行榜 - 新增 */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">本周热度排行</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* 热门机构 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
              🔥 热门培训机构
            </h3>
            <div className="space-y-4">
              {[
                { name: "医学教育网", rating: 4.8, students: "12万+", rank: 1 },
                { name: "环球网校", rating: 4.6, students: "8万+", rank: 2 },
                { name: "润德教育", rating: 4.7, students: "7.8万+", rank: 3 },
              ].map((inst) => (
                <Link
                  key={inst.rank}
                  href={`/institutions/${inst.rank}`}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-blue-50 transition group"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        inst.rank === 1
                          ? "bg-yellow-400"
                          : inst.rank === 2
                          ? "bg-gray-400"
                          : "bg-orange-400"
                      }`}
                    >
                      {inst.rank}
                    </div>
                    <div>
                      <div className="font-bold group-hover:text-blue-500 transition">
                        {inst.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        <Star className="w-3 h-3 inline text-yellow-500" /> {inst.rating} ·{" "}
                        {inst.students}学员
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition" />
                </Link>
              ))}
            </div>
            <Link
              href="/institutions"
              className="block mt-6 text-center py-3 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              查看全部机构 →
            </Link>
          </div>

          {/* 热门资料 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Award className="w-6 h-6 mr-2 text-blue-500" />
              📚 热门学习资料
            </h3>
            <div className="space-y-4">
              {[
                { name: "执业药师核心考点精编", hitRate: "88.5%", type: "PDF讲义" },
                { name: "历年真题详解（2019-2023）", hitRate: "95.2%", type: "真题集" },
                { name: "护士资格考前押题包", hitRate: "92.0%", type: "押题" },
              ].map((material, idx) => (
                <Link
                  key={idx}
                  href="/materials"
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-blue-50 transition group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold group-hover:text-blue-500 transition line-clamp-1">
                        {material.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        命中率 <span className="text-green-600 font-bold">{material.hitRate}</span> ·{" "}
                        {material.type}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition" />
                </Link>
              ))}
            </div>
            <Link
              href="/materials"
              className="block mt-6 text-center py-3 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              查看全部资料 →
            </Link>
          </div>
        </div>
      </section>

      {/* 考试分类 - 移动端优化 */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">热门考试分类</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                title: "执业药师",
                subtitle: "药学专业知识",
                count: "3.2万题",
                icon: "💊",
                color: "bg-blue-50 border-blue-200",
              },
              {
                title: "药学职称",
                subtitle: "初级/中级",
                count: "2.5万题",
                icon: "🏥",
                color: "bg-green-50 border-green-200",
              },
              {
                title: "中医执业医师",
                subtitle: "中医综合",
                count: "2.8万题",
                icon: "🌿",
                color: "bg-yellow-50 border-yellow-200",
              },
              {
                title: "中药师",
                subtitle: "中药学",
                count: "1.9万题",
                icon: "🍵",
                color: "bg-purple-50 border-purple-200",
              },
            ].map((exam, index) => (
              <Link
                key={index}
                href={`/exams`}
                className={`${exam.color} border-2 rounded-xl p-4 md:p-6 hover:shadow-lg transition cursor-pointer group`}
              >
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">{exam.icon}</div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-500 transition">
                  {exam.title}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3">{exam.subtitle}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-gray-500">{exam.count}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 核心功能 */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">核心功能</h2>
        <p className="text-center text-gray-600 mb-10">智能化的学习工具，助你高效备考</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            {
              icon: Sparkles,
              title: "AI 智能推荐",
              description: "智能匹配最适合的培训方案",
              color: "text-blue-500",
              bg: "bg-blue-100",
            },
            {
              icon: Target,
              title: "押题专区",
              description: "90%+命中率，考前冲刺必备",
              color: "text-green-500",
              bg: "bg-green-100",
            },
            {
              icon: BookOpen,
              title: "资料对比",
              description: "客观评测各类学习资料",
              color: "text-purple-500",
              bg: "bg-purple-100",
            },
            {
              icon: MessageCircle,
              title: "学员社区",
              description: "交流经验，互相鼓励",
              color: "text-orange-500",
              bg: "bg-orange-100",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition text-center"
            >
              <div className={`w-12 h-12 ${feature.bg} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-xs md:text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 用户评价 - 移动端优化 */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">用户好评如潮</h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                name: "张医师",
                role: "执业药师考生",
                content: "AI推荐的机构和资料都非常靠谱，帮我节省了大量选择时间，一次通过考试！",
                rating: 5,
              },
              {
                name: "李同学",
                role: "护士资格考生",
                content: "押题命中率真的很高，而且资料对比功能让我能做出最明智的选择。",
                rating: 5,
              },
              {
                name: "王老师",
                role: "中医执业医师",
                content: "社区里的学习氛围很好，大家互相帮助。平台功能也很全面。",
                rating: 5,
              },
            ].map((review, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed text-sm md:text-base">
                  "{review.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{review.name}</div>
                    <div className="text-sm text-gray-500">{review.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 区域 - 移动端优化 */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-500 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            准备好开始你的学习之旅了吗？
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            现在注册，即可免费使用AI智能推荐
          </p>
          <Link
            href="/recommend"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-500 rounded-lg font-semibold text-lg hover:shadow-2xl transition space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>免费开始使用</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* 页脚 - 移动端优化 */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="w-6 h-6 text-blue-500" />
                <span className="text-white font-bold">医药考试通</span>
              </div>
              <p className="text-sm text-gray-400">
                AI驱动的医药考试学习平台
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">核心功能</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/recommend" className="hover:text-white transition">
                    AI智能推荐
                  </Link>
                </li>
                <li>
                  <Link href="/institutions" className="hover:text-white transition">
                    机构对比
                  </Link>
                </li>
                <li>
                  <Link href="/materials" className="hover:text-white transition">
                    资料测评
                  </Link>
                </li>
                <li>
                  <Link href="/predictions" className="hover:text-white transition">
                    押题专区
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">考试分类</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/exams" className="hover:text-white transition">
                    执业药师
                  </Link>
                </li>
                <li>
                  <Link href="/exams" className="hover:text-white transition">
                    护士/护师
                  </Link>
                </li>
                <li>
                  <Link href="/exams" className="hover:text-white transition">
                    中医医师
                  </Link>
                </li>
                <li>
                  <Link href="/practice" className="hover:text-white transition">
                    在线刷题
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">关于</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/community" className="hover:text-white transition">
                    学员社区
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition">
                    关于我们
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition">
                    联系我们
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition">
                    隐私政策
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 医药考试通 yikaobiguo.com. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
