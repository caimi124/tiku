// app/page.tsx - 医考必过优化版首页

import Link from "next/link";
import Image from "next/image";
import { 
  BookOpen, 
  Award, 
  Users, 
  TrendingUp, 
  Zap,
  CheckCircle,
  ArrowRight,
  Crown,
  Brain,
  Target,
  Calendar,
  MessageCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 导航栏 */}
      <nav className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-2xl font-bold">
              <span className="text-primary">医考</span>
              <span className="text-action">必过</span>
            </div>
            <span className="px-2 py-0.5 bg-action text-white text-xs rounded">
              题库
            </span>
          </div>
          
          {/* 导航菜单 */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/exams" className="text-gray-700 hover:text-primary transition font-medium">
              科目分类
            </Link>
            <Link href="/practice" className="text-gray-700 hover:text-primary transition font-medium">
              在线刷题
            </Link>
            <Link href="/押题卷" className="text-gray-700 hover:text-primary transition font-medium">
              押题卷
            </Link>
            <Link href="/vip" className="flex items-center text-vip hover:text-vip-dark transition font-medium">
              <Crown className="w-4 h-4 mr-1" />
              VIP会员
            </Link>
          </div>
          
          {/* 登录注册 */}
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-primary transition font-medium"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 bg-action text-white rounded-lg hover:bg-action-hover transition font-medium shadow-md"
            >
              免费注册
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Banner 区域 */}
      <section className="relative bg-gradient-to-r from-primary-500 to-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* 标签 */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>AI智能题库，助你一次通关</span>
            </div>
            
            {/* 主标题 */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              医考必过题库
              <br />
              <span className="text-action-light">全科历年真题+押题卷</span>
            </h1>
            
            {/* 副标题 */}
            <p className="text-xl text-blue-100 mb-8">
              累计帮助 <span className="text-2xl font-bold text-white">50,000+</span> 考生顺利通过考试
              <br />
              覆盖药师、临床、口腔、检验等全医学科目
            </p>
            
            {/* CTA按钮组 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/practice"
                className="w-full sm:w-auto px-8 py-4 bg-action text-white rounded-xl font-bold text-lg hover:bg-action-hover transition shadow-2xl flex items-center justify-center space-x-2 group"
              >
                <span>立即开始刷题</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/押题卷"
                className="w-full sm:w-auto px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-xl"
              >
                查看押题卷
              </Link>
            </div>
            
            {/* 数据展示 */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">15万+</div>
                <div className="text-blue-200 text-sm">精选题目</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">98%</div>
                <div className="text-blue-200 text-sm">通过率</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">5万+</div>
                <div className="text-blue-200 text-sm">学员好评</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 热门科目快速入口 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          <span className="text-gray-900">热门科目</span>
          <span className="text-primary ml-2">快速入口</span>
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { name: '执业药师', icon: '💊', count: '3.2万题', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
            { name: '临床医师', icon: '👨‍⚕️', count: '4.5万题', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
            { name: '口腔医师', icon: '🦷', count: '2.8万题', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
            { name: '检验技师', icon: '🔬', count: '2.1万题', color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
            { name: '护理资格', icon: '🏥', count: '3.5万题', color: 'bg-pink-50 border-pink-200 hover:bg-pink-100' },
            { name: '中医医师', icon: '🩺', count: '2.9万题', color: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
          ].map((subject, index) => (
            <Link
              key={index}
              href={`/exams/${subject.name}`}
              className={`${subject.color} border-2 rounded-2xl p-6 transition cursor-pointer group text-center`}
            >
              <div className="text-5xl mb-3">{subject.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {subject.name}
              </h3>
              <p className="text-sm text-gray-600">{subject.count}</p>
              <div className="mt-3 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition">
                进入刷题 →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* VIP 专区 */}
      <section className="relative bg-gradient-to-br from-vip-light via-orange-50 to-vip-light py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96">
            <Crown className="w-full h-full text-vip" />
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-vip/20 rounded-full text-sm font-bold text-vip-dark mb-4">
                <Crown className="w-4 h-4" />
                <span>限时优惠 首月仅需 ¥19</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                开通 VIP 会员，解锁全部功能
              </h2>
              <p className="text-lg text-gray-600">
                全科题库 + AI智能解析 + 押题卷 + 学习工具
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {/* 月度会员 */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-primary transition">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">月度会员</div>
                  <div className="flex items-end justify-center mb-4">
                    <span className="text-2xl text-gray-400 line-through mr-2">¥39</span>
                    <span className="text-5xl font-bold text-primary">¥19</span>
                    <span className="text-gray-600 mb-2">/月</span>
                  </div>
                  <Link
                    href="/vip/monthly"
                    className="block w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    立即开通
                  </Link>
                </div>
                <div className="mt-6 space-y-3">
                  {['无限刷题', 'AI智能解析', '错题本功能', '学习报告'].map((feature, i) => (
                    <div key={i} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 年度会员（推荐） */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-8 border-4 border-action relative transform scale-105 shadow-2xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-action text-white text-sm font-bold rounded-full">
                  最划算
                </div>
                <div className="text-center text-white">
                  <div className="text-sm mb-2 text-blue-100">年度会员</div>
                  <div className="flex items-end justify-center mb-4">
                    <span className="text-2xl text-blue-300 line-through mr-2">¥468</span>
                    <span className="text-5xl font-bold">¥199</span>
                    <span className="text-blue-100 mb-2">/年</span>
                  </div>
                  <Link
                    href="/vip/yearly"
                    className="block w-full py-3 bg-action text-white rounded-lg font-bold hover:bg-action-hover transition shadow-lg"
                  >
                    立即开通
                  </Link>
                  <div className="text-xs text-blue-200 mt-2">
                    相当于每月 ¥16.6
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    '月度会员全部权益',
                    '✨ 考前押题卷',
                    '✨ 视频讲解课程',
                    '✨ 专属学习群',
                    '✨ 1对1答疑',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center text-sm text-white">
                      <CheckCircle className="w-4 h-4 text-yellow-300 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 终身会员 */}
              <div className="bg-white rounded-2xl p-8 border-2 border-vip hover:border-vip-dark transition">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">终身会员</div>
                  <div className="flex items-end justify-center mb-4">
                    <span className="text-2xl text-gray-400 line-through mr-2">¥999</span>
                    <span className="text-5xl font-bold text-vip-dark">¥399</span>
                  </div>
                  <Link
                    href="/vip/lifetime"
                    className="block w-full py-3 bg-vip text-white rounded-lg font-medium hover:bg-vip-dark transition"
                  >
                    立即开通
                  </Link>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    '年度会员全部权益',
                    '🔥 永久使用',
                    '🔥 所有科目',
                    '🔥 终身更新',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-vip mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                💳 支持微信支付、支付宝 | 7天无理由退款
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 学习工具 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">
          智能学习工具，助你高效备考
        </h2>
        <p className="text-center text-gray-600 mb-12">
          AI赋能，科学备考，让学习更轻松
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: Brain,
              title: 'AI 智能解析',
              description: '自动生成答案解析、知识点总结、记忆技巧，帮你快速理解掌握',
              color: 'bg-purple-50 text-purple-600',
            },
            {
              icon: Target,
              title: '错题本系统',
              description: '自动收集错题，分析薄弱知识点，针对性复习，提升效率',
              color: 'bg-red-50 text-red-600',
            },
            {
              icon: Calendar,
              title: '打卡系统',
              description: '每日打卡记录，学习进度可视化，坚持就是胜利',
              color: 'bg-green-50 text-green-600',
            },
          ].map((tool, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition"
            >
              <div className={`w-14 h-14 ${tool.color} rounded-xl flex items-center justify-center mb-4`}>
                <tool.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {tool.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 用户评价 */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            10万+ 学员的共同选择
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: '张同学',
                exam: '执业药师',
                avatar: '👨‍🎓',
                content: '用了医考必过题库，特别是AI解析功能太强了！每道题都有详细讲解，帮我顺利一次通过执业药师考试！',
                score: 5,
              },
              {
                name: '李医生',
                exam: '临床医师',
                avatar: '👩‍⚕️',
                content: '押题卷真的准！考试前刷了一遍，居然考到了好几道原题。强烈推荐给正在备考的同学们！',
                score: 5,
              },
              {
                name: '王护士',
                exam: '护理资格',
                avatar: '👩‍⚕️',
                content: '错题本功能超级好用，自动帮我整理薄弱知识点，复习效率提高了很多。客服态度也特别好！',
                score: 5,
              },
            ].map((review, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(review.score)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  "{review.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-2xl mr-3">
                    {review.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{review.name}</div>
                    <div className="text-sm text-gray-500">{review.exam}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 社群引流 */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-6 text-white" />
          <h2 className="text-3xl font-bold mb-4">
            加入学习社群，一起备考不孤单
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            10,000+ 考生在这里分享经验、互相鼓励、共同进步
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="bg-white p-6 rounded-2xl">
              <div className="w-48 h-48 bg-gray-200 rounded-xl mb-3 flex items-center justify-center">
                <QRCodePlaceholder text="微信群二维码" />
              </div>
              <div className="text-gray-900 font-medium">微信学习群</div>
              <div className="text-sm text-gray-600">扫码加入</div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl">
              <div className="w-48 h-48 bg-gray-200 rounded-xl mb-3 flex items-center justify-center">
                <QRCodePlaceholder text="QQ群二维码" />
              </div>
              <div className="text-gray-900 font-medium">QQ交流群</div>
              <div className="text-sm text-gray-600">群号：123456789</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            准备好开始你的备考之旅了吗？
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            现在注册，立即免费刷题 100 道
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-10 py-4 bg-action text-white rounded-xl font-bold text-lg hover:bg-action-hover transition shadow-xl flex items-center space-x-2"
            >
              <span>免费注册开始学习</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/exams"
              className="px-10 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-200 transition"
            >
              浏览题库
            </Link>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center text-2xl font-bold mb-4">
                <span className="text-primary">医考</span>
                <span className="text-action">必过</span>
              </div>
              <p className="text-sm text-gray-400">
                专注医学考试的智能题库平台
                <br />
                助你一次通过考试
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">热门科目</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">执业药师</Link></li>
                <li><Link href="#" className="hover:text-white transition">临床医师</Link></li>
                <li><Link href="#" className="hover:text-white transition">口腔医师</Link></li>
                <li><Link href="#" className="hover:text-white transition">检验技师</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">功能</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">在线刷题</Link></li>
                <li><Link href="#" className="hover:text-white transition">AI智能解析</Link></li>
                <li><Link href="#" className="hover:text-white transition">错题本</Link></li>
                <li><Link href="#" className="hover:text-white transition">押题卷</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">关于</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">关于我们</Link></li>
                <li><Link href="#" className="hover:text-white transition">联系客服</Link></li>
                <li><Link href="#" className="hover:text-white transition">用户协议</Link></li>
                <li><Link href="#" className="hover:text-white transition">隐私政策</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 医考必过 yikaobiguo.com. All rights reserved. | ICP备案号：京ICP备XXXXXXXX号</p>
            <p className="mt-2">客服微信：yikaobiguo | 客服邮箱：service@yikaobiguo.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// 二维码占位符组件
function QRCodePlaceholder({ text }: { text: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
      {text}
    </div>
  );
}

