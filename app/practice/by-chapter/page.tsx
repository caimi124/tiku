import Link from "next/link";
import { Layers, Target, ArrowRight, Calendar } from "lucide-react";

interface PageProps {
  searchParams: {
    chapterId?: string;
  };
}

const roadmap = [
  {
    id: "chapter-01",
    title: "药学专业知识一 · 化学药物",
    status: "未开始",
  },
  {
    id: "chapter-02",
    title: "药学专业知识一 · 药剂学",
    status: "学习中",
  },
  {
    id: "chapter-03",
    title: "药学专业知识二 · 药理学",
    status: "薄弱",
  },
];

export default function PracticeByChapterPage({ searchParams }: PageProps) {
  // TODO: Implement actual practice handler for specific chapters
  // For now, this page serves as a landing/explanation page
  // Users can select chapters from the diagnostic report or knowledge structure

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <p className="uppercase tracking-[0.4em] text-xs text-gray-400 mb-3">Practice</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">章节刷题</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            根据教材章节顺序刷题，更适合系统性学习。可直接粘贴章节 ID（如 chapter-01）进入练习。
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-500">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-600">
              <Layers className="w-4 h-4 mr-1" />
              教材同步
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-600">
              <Target className="w-4 h-4 mr-1" />
              弱项优先
            </span>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 space-y-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">快速入口</h2>
            <p className="text-gray-600 text-sm">
              在诊断报告中点击“章节练习”，即可自动跳转到此页面，并带上 chapterId 参数。
            </p>
          </div>
          <Link
            href="/exams/result"
            className="inline-flex items-center px-6 py-3 rounded-2xl bg-orange-50 text-orange-600 font-semibold"
          >
            <Calendar className="w-4 h-4 mr-2" />
            查看诊断报告
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">章节路线示例</h2>
          <div className="space-y-4">
            {roadmap.map((chapter) => (
              <div key={chapter.id} className="border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Chapter</p>
                  <h3 className="text-lg font-semibold text-gray-900">{chapter.title}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">{chapter.status}</div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/knowledge/${chapter.id}`}
                      className="inline-flex items-center text-blue-600 text-sm font-medium"
                    >
                      查看知识
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                    <Link
                      href={`/practice/by-chapter?chapterId=${chapter.id}`}
                      className="inline-flex items-center text-gray-600 text-sm font-medium"
                    >
                      开始练习
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

