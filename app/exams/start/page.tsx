import Link from "next/link";
import { Target, Sparkles, BookOpen, BarChart3, ArrowRight, Layers } from "lucide-react";

const steps = [
  {
    title: "选择考试 & 科目",
    description: "目前聚焦执业药师，未来将支持更多考试类型。",
    icon: <Target className="w-6 h-6 text-blue-500" />,
  },
  {
    title: "完成 20 道诊断题",
    description: "AI 从题库挑选代表性题目，快速识别知识薄弱点。",
    icon: <Sparkles className="w-6 h-6 text-purple-500" />,
  },
  {
    title: "生成诊断报告",
    description: "自动标记弱势章节/知识点，并推荐对应学习路径。",
    icon: <BarChart3 className="w-6 h-6 text-indigo-500" />,
  },
  {
    title: "跳转学习 & 练习",
    description: "一键进入知识图谱或相关练习，形成闭环。",
    icon: <BookOpen className="w-6 h-6 text-emerald-500" />,
  },
];

const sampleRecommendations = [
  {
    chapterId: "chapter-01",
    title: "药理学 · 中枢神经系统药物",
    weakness: "正确率 45%，重点掌握苯二氮卓类特点",
  },
  {
    chapterId: "chapter-05",
    title: "药事管理与法规 · 执业管理",
    weakness: "法规细节记忆薄弱，建议回看教材 3.2 节",
  },
];

export default function DiagnosticStartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <p className="uppercase tracking-[0.3em] text-white/70 text-sm mb-4">
              Diagnostic
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              先诊断，再学习
            </h1>
            <p className="text-lg text-white/80 mb-8">
              AI 诊断测试会根据你的作答表现，生成专属学习路径。完成 20 道题，即可收到
              「薄弱章节 → 推荐知识点 → 对应练习」的完整闭环。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/practice/random?mode=diagnostic&exam=pharmacist"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                开始诊断
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/exams/result"
                className="inline-flex items-center px-6 py-3 border border-white/40 text-white rounded-xl hover:bg-white/10 transition"
              >
                查看上一次报告
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <p className="text-sm text-gray-400 mb-1">Step {index + 1}</p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">诊断结果将如何使用？</h2>
              <p className="text-gray-600">
                我们会把错误题目映射到知识图谱，生成弱项清单。点击即可跳转到
                <Link href="/knowledge" className="text-blue-600 font-medium ml-1">
                  Learning
                </Link>
                模块继续学习。
              </p>
            </div>
            <Link
              href="/knowledge"
              className="inline-flex items-center px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-200 transition"
            >
              <Layers className="w-4 h-4 mr-2" />
              查看知识图谱
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {sampleRecommendations.map((item) => (
              <div key={item.chapterId} className="p-5 border border-gray-100 rounded-2xl bg-gray-50">
                <div className="text-sm text-gray-400 mb-2">推荐章节</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{item.weakness}</p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/knowledge/${item.chapterId}`}
                    className="inline-flex items-center text-blue-600 text-sm font-medium"
                  >
                    跳到学习
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                  <Link
                    href={`/practice/by-chapter?chapterId=${item.chapterId}`}
                    className="inline-flex items-center text-gray-600 text-sm font-medium"
                  >
                    章节练习
                    <ArrowRight className="w-4 h-4 ml-1" />
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

