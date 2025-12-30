"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type ReviewQuestion = {
  index: number;
  question_uuid: string;
  stem: string | null;
  options: Record<string, string>;
  user_answer: string | null;
  correct_answer: string | null;
  explanation: string | null;
  is_correct: boolean;
  chapter_id: number | null;
  chapter_name: string | null;
  chapter_code: string | null;
  section_title: string | null;
  point_code: string | null;
  point_title: string | null;
  point_type: string | null;
};

type ReviewResponse = {
  attempt: {
    id: string;
    status: string | null;
    started_at: string | null;
    completed_at: string | null;
    certificate: string | null;
    subject: string | null;
  };
  summary: {
    total: number;
    correct: number;
    wrong: number;
  };
  questions: ReviewQuestion[];
};

type DiagnosticReviewPageProps = {
  searchParams?: { attempt_id?: string };
};

function buildResultPageLink(attemptId: string) {
  return `/diagnostic/result?attempt_id=${attemptId}`;
}

function formatDateTime(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString("zh-CN") : "未知时间";
}

export default function DiagnosticReviewPage({ searchParams }: DiagnosticReviewPageProps) {
  const attemptId = searchParams?.attempt_id;
  const [data, setData] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyWrong, setShowOnlyWrong] = useState(true);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const fetchReview = useCallback(async () => {
    if (!attemptId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/diagnostic/review/${attemptId}`);
      if (!resp.ok) {
        const body = await resp.json().catch(() => null);
        throw new Error(body?.error?.message ?? `解析加载失败（${resp.status}）`);
      }
      const payload = (await resp.json()) as ReviewResponse;
      setData(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "解析加载失败，请稍后重试";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    if (!attemptId) return;
    fetchReview();
  }, [attemptId, fetchReview]);

  const questions = data?.questions ?? [];
  const visibleQuestions = useMemo(() => {
    if (!showOnlyWrong) {
      return questions;
    }
    const wrongList = questions.filter((item) => !item.is_correct);
    return wrongList.length ? wrongList : questions;
  }, [questions, showOnlyWrong]);

  if (!attemptId) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <p className="text-xl font-semibold text-slate-900">未提供 attempt_id</p>
          <p className="mt-2 text-sm text-slate-500">请从诊断结果页跳转至本页面。</p>
          <Link
            href="/diagnostic"
            className="mt-6 inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-900"
          >
            返回诊断设置
          </Link>
        </div>
      </main>
    );
  }

  const summary = data?.summary;
  const attempt = data?.attempt;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">诊断逐题解析</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">本次测验的 18 题细节</h1>
            <p className="text-sm text-slate-500">
              Attempt：{attemptId} · 科目：{attempt?.subject ?? "未设置"} · 证书：
              {attempt?.certificate ?? "未设置"}
            </p>
            <p className="text-xs text-slate-400">
              时间：{formatDateTime(attempt?.started_at)} ~ {formatDateTime(attempt?.completed_at)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-700">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              共 {summary?.total ?? 0} 题
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
              正确 {summary?.correct ?? 0} 题
            </span>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">
              错误 {summary?.wrong ?? 0} 题
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              状态：{attempt?.status ?? "未完成"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowOnlyWrong((prev) => !prev)}
              className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold ${
                showOnlyWrong
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              只看错题：{showOnlyWrong ? "开" : "关"}
            </button>
            <button
              type="button"
              onClick={fetchReview}
              className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
            >
              重新加载
            </button>
            <Link
              href={buildResultPageLink(attemptId)}
              className="ml-auto inline-flex items-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              返回诊断报告
            </Link>
          </div>
        </header>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <p className="font-semibold">解析加载失败</p>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <section className="space-y-4">
            {[1, 2, 3].map((skeleton) => (
              <div
                key={skeleton}
                className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="h-5 w-1/3 rounded-full bg-slate-100" />
                <div className="mt-3 h-4 w-1/2 rounded-full bg-slate-100" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded-full bg-slate-100" />
                  <div className="h-3 w-5/6 rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
          </section>
        ) : (
          <section className="space-y-4">
            {!visibleQuestions.length ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                暂无题目记录，稍后可刷新页面。
              </div>
            ) : (
              visibleQuestions.map((question) => {
                const chapterLabel =
                  question.chapter_name ??
                  question.section_title ??
                  question.chapter_code ??
                  "章节待匹配";
                const pointLabel =
                  question.point_title ?? question.point_code ?? "考点待匹配";
                const isExpanded = expandedMap[question.question_uuid] ?? false;
                return (
                  <article
                    key={question.question_uuid}
                    className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                      <p className="font-semibold text-slate-900">
                        第 {question.index} 题 ·{" "}
                        {question.is_correct ? "✅ 作答正确" : "⚠️ 答错"}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                          {chapterLabel}
                        </span>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                          {pointLabel}
                        </span>
                        {question.point_type && (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                            {question.point_type}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-base leading-relaxed text-slate-800">
                      {question.stem ?? "题干内容暂缺"}
                    </p>
                    <div className="space-y-2">
                      {Object.entries(question.options ?? {}).map(([key, value]) => {
                        const isUser = question.user_answer === key;
                        const isCorrect = question.correct_answer === key;
                        const baseClass =
                          "rounded-2xl border px-4 py-2 text-sm font-medium";
                        const stateClass = isCorrect
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : isUser
                          ? "border-rose-300 bg-rose-50 text-rose-700"
                          : "border-slate-200 bg-slate-50 text-slate-700";
                        return (
                          <div key={key} className={`${baseClass} ${stateClass}`}>
                            <span className="mr-2 font-semibold">{key}.</span>
                            <span className="whitespace-pre-line">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                      <p>
                        你的选择：
                        <span className="font-semibold text-slate-900">
                          {question.user_answer ?? "未作答"}
                        </span>
                      </p>
                      <p>
                        正确答案：
                        <span className="font-semibold text-emerald-600">
                          {question.correct_answer ?? "待补充"}
                        </span>
                      </p>
                      <p className="sm:text-right">
                        判定结果：{" "}
                        <span
                          className={`font-semibold ${
                            question.is_correct ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {question.is_correct ? "正确" : "错误"}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        className="text-sm font-semibold text-blue-600"
                        onClick={() =>
                          setExpandedMap((prev) => ({
                            ...prev,
                            [question.question_uuid]: !isExpanded,
                          }))
                        }
                      >
                        {isExpanded ? "收起解析" : "展开解析"}
                      </button>
                      <p className="text-xs text-slate-500">
                        题目 ID：{question.question_uuid}
                      </p>
                    </div>
                    {isExpanded && (
                      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                        <p className="font-semibold text-slate-900">解析</p>
                        <p className="mt-2 whitespace-pre-line">
                          {question.explanation?.trim()
                            ? question.explanation
                            : "解析待补充，稍后将自动更新。"}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </section>
        )}
      </div>
    </main>
  );
}

