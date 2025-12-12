import Link from "next/link";

export default function DiagnosticQuestionsPlaceholder() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
          Diagnostic Placeholder
        </p>
        <h1 className="mt-4 text-4xl font-bold text-white">
          Diagnostic questions are being prepared.
        </h1>
        <p className="mt-3 text-2xl text-blue-100">诊断题目正在准备中</p>
        <p className="mt-8 max-w-xl text-lg text-blue-100">
          This diagnostic will focus on high-frequency exam points.
        </p>
        <p className="text-lg text-blue-100">本诊断聚焦高频考点</p>
        <Link
          href="/diagnostic"
          className="mt-10 inline-flex items-center justify-center rounded-2xl bg-white px-8 py-3 text-lg font-semibold text-blue-600 transition hover:translate-y-0.5 hover:bg-slate-100"
        >
          返回诊断设置
        </Link>
      </div>
    </div>
  );
}

