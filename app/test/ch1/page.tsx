import Link from "next/link";

const CTA_CN_TEXT = "开始练习第1章原版题";

export default function Chapter1TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-blue-900 text-white">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-sm uppercase tracking-[0.5em] text-purple-200">开发测试入口</p>
        <h1 className="mt-6 text-4xl font-bold md:text-5xl">第 1 章原版题（测试）</h1>
        <p className="mt-4 max-w-2xl text-lg text-purple-100">
          本入口仅用于开发验证 C1 原始题库。将按章节原始排序加载题目，完全复用现有诊断
          尝试与答题流程。
        </p>
        <div className="mt-10 flex flex-col gap-3 md:flex-row">
          <Link
            href="/diagnostic/questions?license=western&subject=western-2"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-blue-900/60 transition hover:scale-[1.02]"
          >
            {CTA_CN_TEXT}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/60 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10"
          >
            返回首页
          </Link>
        </div>
        <p className="mt-6 text-sm text-purple-200/80">仅在 `NEXT_PUBLIC_ENABLE_TEST_ENTRY=true` 下可访问。</p>
      </div>
    </div>
  );
}