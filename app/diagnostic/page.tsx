import Link from "next/link";

export default function DiagnosticPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 text-center text-gray-800">
        <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-blue-600 shadow">
          AI 诊断占位页
        </span>
        <h1 className="mt-6 text-4xl font-bold text-gray-900">AI 诊断正在构建中</h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-600">
          我们正在把完整的智能诊断体验搬到这里。现在点击首页的「开始 AI 诊断」即可先行预约，稍后会第一时间为你开放全部功能。
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700"
          >
            返回首页继续了解
          </Link>
          <Link
            href="mailto:support@yikaobiguo.com"
            className="inline-flex items-center justify-center rounded-2xl border border-blue-200 px-8 py-3 text-lg font-semibold text-blue-700 transition hover:border-blue-400 hover:text-blue-900"
          >
            需要协助？写信给我们
          </Link>
        </div>
        <p className="mt-8 text-sm text-gray-500">无需重复注册 · 我们会在开放时通知你</p>
      </div>
    </div>
  );
}
