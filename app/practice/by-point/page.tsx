import Link from "next/link";
import { Target, ArrowRight, BookMarked, Sparkles } from "lucide-react";

interface PageProps {
  searchParams: {
    pointId?: string;
    title?: string;
  };
}

const samplePoints = [
  {
    id: "point-3201",
    title: "青霉素类药物不良反应",
    chapter: "药学专业知识一",
  },
  {
    id: "point-4210",
    title: "药品经营质量管理规范(GSP)",
    chapter: "药事管理与法规",
  },
];

export default function PracticeByPointPage({ searchParams }: PageProps) {
  // TODO: Implement actual practice handler for specific knowledge points
  // For now, this page serves as a landing/explanation page
  // Users can select points from the knowledge graph or diagnostic report

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <p className="uppercase tracking-[0.4em] text-xs text-gray-400 mb-3">Practice</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">知识点专项练习</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            结合诊断结果或知识图谱，选择一个知识点即可自动生成练习。系统会记录掌握度并同步到仪表盘。
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-500">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600">
              <Sparkles className="w-4 h-4 mr-1" />
              AI 推荐题目
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-600">
              <Target className="w-4 h-4 mr-1" />
              记录掌握度
            </span>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 space-y-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">如何开始？</h2>
            <ol className="list-decimal pl-5 text-gray-600 space-y-1 text-sm">
              <li>在诊断报告或知识图谱中选定一个薄弱知识点</li>
              <li>复制知识点 ID，或直接点击「去练习」按钮</li>
              <li>系统自动生成 10-15 道题并记录结果</li>
            </ol>
          </div>
          <Link
            href="/knowledge"
            className="inline-flex items-center px-6 py-3 rounded-2xl bg-blue-50 text-blue-600 font-semibold"
          >
            <BookMarked className="w-4 h-4 mr-2" />
            打开知识图谱
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">示例知识点</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {samplePoints.map((point) => (
              <div key={point.id} className="border border-gray-100 rounded-2xl p-5">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{point.chapter}</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{point.title}</h3>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/knowledge/${point.id}`}
                    className="inline-flex items-center text-blue-600 text-sm font-medium"
                  >
                    查看知识点
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                  <Link
                    href={`/practice/by-point?pointId=${point.id}`}
                    className="inline-flex items-center text-gray-600 text-sm font-medium"
                  >
                    去练习
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

