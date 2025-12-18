"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DebugState = {
  attemptId: string | null;
  attemptStatus: number | null;
  attemptBody: string | null;
  questionsUrl: string;
  questionsStatus: number | null;
  questionsCount: number | null;
  questionsBody: string | null;
  error: string | null;
};

const LICENSE = "western";
const SUBJECT = "western-2";
const CHAPTER_CODE = "C1";

export default function Chapter1TestStartPage() {
  const [debug, setDebug] = useState<DebugState>({
    attemptId: null,
    attemptStatus: null,
    attemptBody: null,
    questionsUrl: "",
    questionsStatus: null,
    questionsCount: null,
    questionsBody: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setDebug((prev) => ({
        ...prev,
        attemptStatus: null,
        questionsStatus: null,
        questionsCount: null,
        error: null,
      }));

      try {
        const attemptResp = await fetch("/api/diagnostic/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            license: LICENSE,
            subject: SUBJECT,
            chapter_code: CHAPTER_CODE,
          }),
        });
        const attemptBody = await attemptResp.text();
        console.log("Chapter1 test attempt response", attemptResp.status, attemptBody);
        if (cancelled) return;

        if (!attemptResp.ok) {
          setDebug((prev) => ({
            ...prev,
            attemptStatus: attemptResp.status,
            attemptBody,
            error: "创建诊断尝试失败，请检查后端日志。",
          }));
          return;
        }

        const attemptJson = JSON.parse(attemptBody);
        const attemptId = attemptJson.attempt_id;
        const questionsUrl = `/api/diagnostic/questions?attempt_id=${attemptId}`;

        setDebug((prev) => ({
          ...prev,
          attemptId,
          attemptStatus: attemptResp.status,
          attemptBody,
          questionsUrl,
        }));

        const questionsResp = await fetch(questionsUrl);
        const questionsBody = await questionsResp.text();
        console.log("Chapter1 test questions response", questionsResp.status, questionsBody);
        if (cancelled) return;

        const questionsJson = questionsResp.ok ? JSON.parse(questionsBody) : null;
        const count = questionsJson?.questions?.length ?? 0;

        setDebug((prev) => ({
          ...prev,
          questionsStatus: questionsResp.status,
          questionsBody,
          questionsCount: count,
          error:
            questionsResp.ok && count > 0
              ? null
              : "No questions returned. Check RLS/policy or data source mapping.",
        }));
      } catch (error) {
        console.error("Chapter1 test flow failed", error);
        if (cancelled) return;
        setDebug((prev) => ({
          ...prev,
          error: (error as Error).message,
        }));
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto flex min-h-screen flex-col justify-center gap-6 px-4 py-12 text-center">
        <p className="text-sm uppercase tracking-[0.5em] text-blue-200">开发测试入口</p>
        <h1 className="text-4xl font-bold">Chapter 1 原版题测试</h1>
        <p className="text-lg text-blue-100">
          本页面仅用于开发验证 C1 原始诊断题。会创建 attempt 并直接拉取题目，所有 fetch
          请求都在页面展示。
        </p>

        {debug.questionsUrl ? (
          <div className="rounded-2xl border border-blue-200/60 bg-blue-900/50 p-5 text-left text-sm">
            <p className="text-xs text-blue-200">Resolved params</p>
            <p>license: {LICENSE}</p>
            <p>subject: {SUBJECT}</p>
            <p>chapter_code: {CHAPTER_CODE}</p>
            <p className="mt-3 text-xs text-blue-200">Attempt request</p>
            <p>status: {debug.attemptStatus ?? "—"}</p>
            <p>body: {debug.attemptBody ?? "—"}</p>
            <p className="mt-3 text-xs text-blue-200">Questions request</p>
            <p>URL: {debug.questionsUrl}</p>
            <p>status: {debug.questionsStatus ?? "—"}</p>
            <p>questions returned: {debug.questionsCount ?? "—"}</p>
            <p>response: {debug.questionsBody ?? "—"}</p>
          </div>
        ) : (
          <p className="text-sm text-blue-200">正在创建诊断尝试，请稍候…</p>
        )}

        {debug.error && (
          <div className="rounded-2xl border border-rose-500 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {debug.error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <Link
            href="/diagnostic/questions?license=western&subject=western-2"
            className="rounded-full border border-white/40 px-6 py-3 font-semibold text-white hover:border-white"
          >
            跳到诊断题页
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/40 px-6 py-3 font-semibold text-white/80 hover:border-white"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

