import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Target, TrendingUp, Users, CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 导航栏 */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">医药考试通</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/exams" className="text-gray-600 hover:text-primary-500 transition">
              考试分类
            </Link>
            <Link href="/practice" className="text-gray-600 hover:text-primary-500 transition">
              开始刷题
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-primary-500 transition">
              关于我们
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-primary-500 transition"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
            >
              免费注册
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-primary-600 rounded-full text-sm font-medium mb-6">
            <Target className="w-4 h-4" />
            <span>专注医药行业考试</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            AI 智能题库
            <br />
            <span className="text-primary-500">助力医药考试通关</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            10万+精选题目，AI智能解析，错题本系统
            <br />
            专为执业药师、药学职称、中医师考试打造
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-primary-500 text-white rounded-lg font-semibold text-lg hover:bg-primary-600 transition flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span>立即开始刷题</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/exams"
              className="px-8 py-4 bg-white text-primary-500 border-2 border-primary-500 rounded-lg font-semibold text-lg hover:bg-primary-50 transition"
            >
              浏览题库
            </Link>
          </div>
          
          {/* 数据统计 */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-500">10万+</div>
              <div className="text-gray-600 mt-1">精选题目</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-500">5万+</div>
              <div className="text-gray-600 mt-1">活跃用户</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-500">95%</div>
              <div className="text-gray-600 mt-1">通过率</div>
            </div>
          </div>
        </div>
      </section>

      {/* 考试分类 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">热门考试分类</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              href={`/exams/${exam.title.toLowerCase()}`}
              className={`${exam.color} border-2 rounded-xl p-6 hover:shadow-lg transition cursor-pointer group`}
            >
              <div className="text-4xl mb-4">{exam.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-500 transition">
                {exam.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3">{exam.subtitle}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{exam.count}</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 核心功能 */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">核心功能</h2>
          <p className="text-center text-gray-600 mb-12">智能化的学习工具，助你高效备考</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Brain,
                title: "AI 智能出题",
                description: "根据知识点自动生成高质量题目",
              },
              {
                icon: Target,
                title: "智能解析",
                description: "AI 深度解析每道题目的考点",
              },
              {
                icon: BookOpen,
                title: "错题本",
                description: "自动收集错题，针对性复习",
              },
              {
                icon: TrendingUp,
                title: "学习报告",
                description: "可视化学习数据，追踪进步",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-center"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 用户评价 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">用户好评如潮</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "张医师",
              role: "执业药师考生",
              content: "题库质量很高，AI解析特别详细，帮我顺利通过了执业药师考试！",
              rating: 5,
            },
            {
              name: "李同学",
              role: "药学职称考生",
              content: "错题本功能太棒了，能针对性地复习薄弱知识点，效率提升了很多。",
              rating: 5,
            },
            {
              name: "王老师",
              role: "中医执业医师",
              content: "模拟考试模式很贴近真实考试，做完题后的学习报告也很专业。",
              rating: 5,
            },
          ].map((review, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">"{review.content}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{review.name}</div>
                  <div className="text-sm text-gray-500">{review.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="bg-primary-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            准备好开始你的学习之旅了吗？
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            现在注册，即可免费试用所有功能
          </p>
          <Link
            href="/register"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-500 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            <span>免费开始学习</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="w-6 h-6 text-primary-500" />
                <span className="text-white font-bold">医药考试通</span>
              </div>
              <p className="text-sm text-gray-400">
                专注医药行业考试的智能题库平台
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">考试分类</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/exams/pharmacist" className="hover:text-white transition">执业药师</Link></li>
                <li><Link href="/exams/title" className="hover:text-white transition">药学职称</Link></li>
                <li><Link href="/exams/tcm" className="hover:text-white transition">中医医师</Link></li>
                <li><Link href="/exams/chinese-pharmacy" className="hover:text-white transition">中药师</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">功能</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/practice" className="hover:text-white transition">章节练习</Link></li>
                <li><Link href="/mock-exam" className="hover:text-white transition">模拟考试</Link></li>
                <li><Link href="/wrong-questions" className="hover:text-white transition">错题本</Link></li>
                <li><Link href="/study-report" className="hover:text-white transition">学习报告</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">关于</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">关于我们</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">联系我们</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">隐私政策</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">服务条款</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 医药考试通 MedExam Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

