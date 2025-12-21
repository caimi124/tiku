"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Report = {
  attempt_id: string;
  ready: boolean;
  status: string | null;
  scope: {
    certificate: string | null;
    subject: string | null;
    chapter_code: string | null;
    chapter_title: string | null;
  };
  summary: {
    score: number;
    correct: number;
    total: number;
    started_at: string | null;
    completed_at: string | null;
  };
  sections: {
    section_code: string;
    section_title: string;
    total: number;
    correct: number;
  }[];
  points: {
    code: string;
    title: string;
    sectionCode: string;
    sectionTitle: string;
    total: number;
    correct: number;
    wrong: number;
    accuracy: number;
    level: string;
  }[];
  weaknesses: {
    code: string;
    title: string;
    sectionTitle: string;
    total: number;
    wrong: number;
    accuracy: number;
  }[];
  questions: {
    question_uuid: string;
    stem: string | null;
    options: Record<string, string>;
    user_answer: string | null;
    correct_answer: string | null;
    explanation: string | null;
    section_title: string | null;
    knowledge_point_title: string | null;
    is_correct: boolean;
  }[];
};

type DiagnosticResultPageProps = {
  searchParams?: { attempt_id?: string };
};

const MAX_RETRY = 10;

const COMMON_ERROR_HINTS = [
  "概念混淆 / 首选药记忆不清",
  "适应证判断错误",
  "题干关键信息遗漏",
  "审题信息抓取不全",
  "重要细节未抓住",
];

export default function DiagnosticResultPage({ searchParams }: DiagnosticResultPageProps) {
  const attemptId = searchParams?.attempt_id;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [showWrongDetails, setShowWrongDetails] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!attemptId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/diagnostic/results/${attemptId}`);
      if (!resp.ok) {
        const body = await resp.json().catch(() => null);
        throw new Error(
          body?.error?.message ?? `报告加载失败 (${resp.status})`,
        );
      }
      const payload = (await resp.json()) as Report;
      setReport(payload);
      if (!payload.ready) {
        setPendingMessage("报告尚在生成，正在等待...");
      } else {
        setPendingMessage(null);
      }
      setLoading(false);
      return payload;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "报告加载失败，请稍后重试";
      setError(message);
      setLoading(false);
      return null;
    }
  }, [attemptId]);

  useEffect(() => {
    if (!attemptId) return;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;

    const poll = async () => {
      const payload = await fetchReport();
      attempts += 1;
      setTries(attempts);
      if (payload && payload.ready) {
        clearTimeout(timer);
        return;
      }
      if (attempts >= MAX_RETRY) {
        setPendingMessage("报告生成超时，请稍后刷新。");
        return;
      }
      timer = setTimeout(poll, 1500);
    };

    poll();
    return () => {
      clearTimeout(timer);
    };
  }, [attemptId, fetchReport]);

  const summary = useMemo(() => {
    if (!report) return null;
    const duration =
      report.summary.started_at && report.summary.completed_at
        ? (new Date(report.summary.completed_at).getTime() -
            new Date(report.summary.started_at).getTime()) / 1000
        : null;
    return {
      ...report.summary,
      duration,
    };
  }, [report]);

  const wrongQuestions = useMemo(
    () => report?.questions.filter((q) => !q.is_correct) ?? [],
    [report],
  );

  const topWeaknesses = useMemo(() => report?.weaknesses.slice(0, 3) ?? [], [
    report,
  ]);

  const wrongCount = summary ? Math.max(summary.total - summary.correct, 0) : 0;

  const formatPercent = (value: number | null | undefined) =>
    value == null ? "0%" : `${Math.round(value * 100)}%`;

  const formatDateTime = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleString("zh-CN") : "未知";

  if (!attemptId) {
    return (
      <div className="min-h-screen bg-slate-50 py-24">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow">
          <p className="text-lg font-semibold text-gray-800">未提供 attempt_id</p>
          <p className="mt-2 text-sm text-gray-500">
            请先完成一次诊断再查看报告。
          </p>
          <Link
            href="/diagnostic"
            className="mt-4 inline-flex items-center justify-center rounded-full border border-blue-500 px-6 py-2 text-sm font-semibold text-blue-600"
          >
            返回诊断设置
          </Link>
        </div>
      </div>
    );
  }

  const ctaHref = `/practice/by-point?source=diagnostic&attempt_id=${attemptId}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <div className="flex flex-wrap justify-end gap-4 text-[11px] text-slate-500">
          <span>Attempt ID：{attemptId}</span>
          <span>
            证书：{report?.scope.certificate ?? "未知"} · 科目：{report?.scope.subject ?? "未知"} · 章节：
            {report?.scope.chapter_title ?? report?.scope.chapter_code ?? "未知"}
          </span>
          <span>
            开始时间：{formatDateTime(report?.summary.started_at)} / 完成时间：{formatDateTime(report?.summary.completed_at)}
          </span>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">错误：{error}</p>
            <p className="text-sm">请重试或联系管理员。</p>
          </div>
        )}

        {(!report || loading) && (
          <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-5 text-center text-blue-600">
            {pendingMessage || "报告生成中，请稍候..."}
            <p className="text-xs text-slate-400 mt-2">
              已尝试 {tries} / {MAX_RETRY} 次
            </p>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-100 bg-white px-6 py-8 shadow-sm space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                AI 诊断报告
              </p>
              <h1 className="text-3xl font-semibold text-slate-900">
                本次诊断已完成
              </h1>
              <h2 className="text-2xl font-bold text-slate-800">
                当前基础不稳，但属于非常典型情况，可快速补救
              </h2>
              <p className="text-sm text-slate-500">
                首次诊断出现低分很常见，系统已根据你的答题情况为你生成学习路径
              </p>
            </section>

            <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8 shadow-lg text-white">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-100">
                  行动重点
                </p>
                <Link
                  href={ctaHref}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white/90 px-6 py-4 text-center text-lg font-semibold text-blue-600 transition hover:bg-white/100"
                >
                  <span>🔵</span>
                  <span>
                    开始今日学习（{summary?.total ?? 0} 题 · 仅针对薄弱点）
                  </span>
                </Link>
                <p className="text-xs text-white/80">
                  预计用时：15–20 分钟 · 不重复诊断题，全部来自薄弱考点
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4 text-center text-slate-500 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs">本次题量</p>
                  <p className="text-2xl font-semibold text-slate-900">{summary?.total ?? 0}</p>
                  <p className="text-xs text-slate-400">题</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs">正确率</p>
                  <p className="text-2xl font-semibold text-slate-900">{formatPercent(summary?.score)}</p>
                  <p className="text-xs text-slate-400">平均得分</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs">错题数</p>
                  <p className="text-2xl font-semibold text-slate-900">{wrongCount}</p>
                  <p className="text-xs text-slate-400">待复盘</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs">覆盖章节</p>
                  <p className="text-2xl font-semibold text-slate-900">全部章节</p>
                  <p className="text-xs text-slate-400">核心考点</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-500">薄弱点优先级（Top 3）</p>
                  <h3 className="text-xl font-semibold text-slate-900">
                    你当前最需要优先补强的考点
                  </h3>
                </div>
                <span className="text-xs text-slate-400">先做哪个 →</span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {topWeaknesses.map((weak, index) => {
                  const correct = Math.max(weak.total - weak.wrong, 0);
                  const accuracy = Math.round((weak.accuracy ?? 0) * 100);
                  const planHref = weak.code
                    ? `/practice/by-point?pointId=${weak.code}&source=diagnostic`
                    : `/practice/by-point?source=diagnostic`;
                  const hint = COMMON_ERROR_HINTS[index % COMMON_ERROR_HINTS.length];
                  return (
                    <div
                      key={weak.code ?? `${index}-${weak.title}`}
                      className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-rose-600">
                          薄弱点 {index + 1}
                        </span>
                        <span>{weak.sectionTitle ?? "其他"}</span>
                      </div>
                      <p className="text-lg font-semibold text-slate-900">
                        {weak.title ?? "待分析"}
                      </p>
                      <p className="text-xs text-slate-500">
                        正确率：{accuracy}%（{correct}/{weak.total}）
                      </p>
                      <p className="text-xs text-slate-500">
                        常见错误类型：{hint}
                      </p>
                      <Link
                        href={planHref}
                        className="text-xs font-semibold text-blue-600"
                      >
                        去专项练习 →
                      </Link>
                    </div>
                  );
                })}
                {topWeaknesses.length === 0 && (
                  <p className="text-sm text-slate-500">
                    系统暂未识别出明显的薄弱点，先完成专项练习即可自动生成优先项。
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white px-6 py-5">
              <h3 className="text-lg font-semibold text-slate-900">学习建议</h3>
              <p className="text-sm text-slate-600">
                建议先完成薄弱点专项练习，再回顾错题解析，有助于快速建立基础判断能力。
              </p>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white px-6 py-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  本次诊断错题（{wrongQuestions.length} 题）
                </h3>
                <button
                  className="text-xs font-semibold text-blue-600"
                  onClick={() => setShowWrongDetails((prev) => !prev)}
                >
                  {showWrongDetails ? "收起错题" : "展开错题"}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                错题已加入你的复习队列，将在后续学习中自动再次出现
              </p>
              {showWrongDetails && (
                <div className="space-y-4">
                  {wrongQuestions.length === 0 && (
                    <p className="text-sm text-slate-500">暂无错题需要复盘。</p>
                  )}
                  {wrongQuestions.map((question) => (
                    <article
                      key={question.question_uuid}
                      className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-xs text-slate-500">
                        {question.section_title ?? "未分组"} · {question.knowledge_point_title ?? "未知"}
                      </p>
                      <p className="text-base font-semibold text-slate-900">
                        {question.stem ?? "暂无题干"}
                      </p>
                      <div className="text-sm text-slate-700 space-y-1">
                        <p>你的答案：{question.user_answer ?? "未作答"}</p>
                        <p>正确答案：{question.correct_answer ?? "待补充"}</p>
                        <p className="text-xs text-slate-500">
                          解析：{question.explanation ?? "暂无解析"}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white px-6 py-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                次级操作
              </h3>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/test/ch1/practice"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  练习模式重做错题
                </Link>
                <Link
                  href="/diagnostic/questions"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  返回诊断做题
                </Link>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

