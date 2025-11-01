import Link from "next/link";
import { BookOpen, ArrowRight, BarChart, FileText } from "lucide-react";

const examTypes = [
  {
    id: "pharmacist",
    title: "执业药师",
    subtitle: "国家执业药师资格考试",
    icon: "💊",
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    description: "包含药学专业知识一、二、综合知识与技能、药事管理与法规",
    subjects: [
      { name: "药学专业知识一", count: 8500 },
      { name: "药学专业知识二", count: 9200 },
      { name: "药学综合知识与技能", count: 7800 },
      { name: "药事管理与法规", count: 6500 },
    ],
    totalQuestions: 32000,
    difficulty: "中等",
  },
  {
    id: "pharmacy-title",
    title: "药学职称",
    subtitle: "初级/中级药学职称考试",
    icon: "🏥",
    color: "bg-green-50 border-green-200 hover:bg-green-100",
    description: "包含基础知识、相关专业知识、专业知识、专业实践能力",
    subjects: [
      { name: "基础知识", count: 6500 },
      { name: "相关专业知识", count: 6800 },
      { name: "专业知识", count: 6200 },
      { name: "专业实践能力", count: 5500 },
    ],
    totalQuestions: 25000,
    difficulty: "中等",
  },
  {
    id: "tcm-doctor",
    title: "中医执业医师",
    subtitle: "中医执业医师资格考试",
    icon: "🌿",
    color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
    description: "包含中医基础理论、中医诊断学、中药学、方剂学等",
    subjects: [
      { name: "中医基础理论", count: 5500 },
      { name: "中医诊断学", count: 6200 },
      { name: "中药学", count: 7800 },
      { name: "方剂学", count: 6500 },
    ],
    totalQuestions: 28000,
    difficulty: "较难",
  },
  {
    id: "chinese-pharmacy",
    title: "中药师",
    subtitle: "执业中药师资格考试",
    icon: "🍵",
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    description: "包含中药学专业知识、中药调剂学、中药炮制学等",
    subjects: [
      { name: "中药学专业知识一", count: 5200 },
      { name: "中药学专业知识二", count: 5800 },
      { name: "中药学综合知识与技能", count: 4800 },
      { name: "药事管理与法规", count: 3200 },
    ],
    totalQuestions: 19000,
    difficulty: "中等",
  },
];

export default function ExamsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">医药考试通</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-primary-500 transition">
              登录
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
            >
              注册
            </Link>
          </div>
        </div>
      </nav>

      {/* 页头 */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">考试分类</h1>
          <p className="text-lg text-gray-600">
            选择你要备考的考试类型，开始你的学习之旅
          </p>
        </div>
      </div>

      {/* 考试列表 */}
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          {examTypes.map((exam) => (
            <div
              key={exam.id}
              className={`${exam.color} border-2 rounded-2xl p-8 transition-all hover:shadow-lg`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start space-x-4">
                  <div className="text-5xl">{exam.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {exam.title}
                    </h2>
                    <p className="text-gray-600 mb-2">{exam.subtitle}</p>
                    <p className="text-sm text-gray-500">{exam.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-500">
                    {exam.totalQuestions.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">道题目</div>
                </div>
              </div>

              {/* 科目列表 */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {exam.subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="w-5 h-5 text-primary-500" />
                      <span className="text-sm text-gray-500">
                        {subject.count} 题
                      </span>
                    </div>
                    <div className="font-medium text-gray-900">
                      {subject.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <BarChart className="w-4 h-4" />
                    <span>难度：{exam.difficulty}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    href={`/exams/${exam.id}`}
                    className="px-6 py-3 bg-white border-2 border-primary-500 text-primary-500 rounded-lg font-semibold hover:bg-primary-50 transition flex items-center space-x-2"
                  >
                    <span>查看详情</span>
                  </Link>
                  <Link
                    href={`/practice?exam=${exam.id}`}
                    className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition flex items-center space-x-2"
                  >
                    <span>开始刷题</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary-500 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            还没有账号？立即注册开始学习
          </h2>
          <Link
            href="/register"
            className="inline-flex items-center px-6 py-3 bg-white text-primary-500 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            <span>免费注册</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}

