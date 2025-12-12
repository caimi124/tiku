import Link from "next/link";
import { BarChart3, Target, BookOpen, ArrowRight, CheckCircle2, Activity } from "lucide-react";

const weakChapters = [
  {
    id: "chapter-01",
    title: "药学专业知识一 · 方剂学基础",
    mastery: 42,
    priority: "高",
  },
  {
    id: "chapter-08",
    title: "药事管理与法规 · 执业管理",
    mastery: 55,
    priority: "中",
  },
];

const weakPoints = [
  {
    id: "point-3201",
    title: "青霉素类药物不良反应",
    accuracy: 40,
    questionCount: 6,
  },
  {
    id: "point-4210",
    title: "药品经营质量管理规范(GSP)",
    accuracy: 35,
    questionCount: 4,
  },
];

export default function DiagnosticResultPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <p className="uppercase tracking-[0.4em] text-xs text-gray-400 mb-3">Result</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">诊断报告</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            以下数据来自最近一次 20 题诊断测试。点击薄弱章节可直接跳转至知识图谱；点击知识点可马上进入专项练习。
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-500">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600">
              <BarChart3 className="w-4 h-4 mr-1" />
              AI 评估掌握度
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-600">
              <Target className="w-4 h-4 mr-1" />
              推荐学习路径
            </span>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 space-y-10">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-2">整体掌握度</p>
            <div className="text-4xl font-bold text-gray-900 mb-2">68%</div>
            <p className="text-sm text-gray-500">再完成 2 个章节可达到 75%</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-2">待加强知识点</p>
            <div className="text-4xl font-bold text-orange-500 mb-2">5</div>
            <p className="text-sm text-gray-500">优先练习系统推荐题目</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-2">建议学习时长</p>
            <div className="text-4xl font-bold text-blue-500 mb-2">45 分钟</div>
            <p className="text-sm text-gray-500">章节学习 30 分 + 专练 15 分</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">薄弱章节</h2>
              <p className="text-gray-500">优先学习优先级为「高」的章节</p>
            </div>
            <Link
              href="/knowledge"
              className="inline-flex items-center text-blue-600 font-medium"
            >
              打开知识图谱
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {weakChapters.map((chapter) => (
              <div
                key={chapter.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-100 rounded-2xl p-5"
              >
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Chapter</p>
                  <h3 className="text-lg font-semibold text-gray-900">{chapter.title}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-400">掌握度</p>
                    <p className="text-xl font-semibold text-gray-900">{chapter.mastery}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">优先级</p>
                    <p className="text-xl font-semibold text-orange-500">{chapter.priority}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/knowledge/${chapter.id}`}
                      className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-medium"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      去学习
                    </Link>
                    <Link
                      href={`/practice/by-chapter?chapterId=${chapter.id}`}
                      className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      章节练习
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">薄弱知识点</h2>
              <p className="text-gray-500">优先完成专项练习，系统会记录掌握度变化</p>
            </div>
            <Link
              href="/practice/by-point"
              className="inline-flex items-center text-blue-600 font-medium"
            >
              知识点练习入口
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {weakPoints.map((point) => (
              <div key={point.id} className="border border-gray-100 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Point</p>
                    <h3 className="text-lg font-semibold text-gray-900">{point.title}</h3>
                  </div>
                  <span className="text-sm text-gray-500">准确率 {point.accuracy}%</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">涉及 {point.questionCount} 道题</p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/knowledge/${point.id}`}
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    查看知识点
                  </Link>
                  <Link
                    href={`/practice/by-point?pointId=${point.id}`}
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    开始练习
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

