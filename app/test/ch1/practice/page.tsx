"use client";

import { useEffect } from "react";

export default function ChapterOnePracticePage() {
  useEffect(() => {
    document.title = "Chapter 1 · Original Diagnostic Questions (Practice)";
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-10">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-blue-300">
            Chapter 1 Practice
          </p>
          <h1 className="text-3xl font-bold">Chapter 1 · Original Diagnostic Questions (Practice)</h1>
          <p className="text-slate-300">
            该页面复用正式诊断交互流程（创建尝试、加载题目、保存答案、提交计算），不直接查询数据库。
          </p>
          <p className="text-sm text-slate-400">
            进度将同步至现有诊断体系，你可以直接完成题目并查看诊断报告。
          </p>
        </div>

        <div className="flex-1 overflow-hidden rounded-2xl border border-slate-800">
          <iframe
            title="Chapter 1 Practice Diagnostic Flow"
            src="/diagnostic/questions?license=western&subject=western-2"
            className="h-full w-full min-h-[600px]"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>

        <p className="text-xs text-center text-slate-500">
          该 iframe 页面完整复用了 `/diagnostic/questions` 的答题/提交逻辑，因此请确保另一个标签页中也能正常登录并访问该接口。
        </p>
      </div>
    </div>
  );
}

