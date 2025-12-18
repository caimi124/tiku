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

export default function DiagnosticResultPage({ searchParams }: DiagnosticResultPageProps) {
  const attemptId = searchParams?.attempt_id;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

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

  const sectionOptions = useMemo(() => {
    if (!report) return [];
    const codes = new Set(report.sections.map((s) => s.section_code));
    return Array.from(codes);
  }, [report]);

  const [filterMode, setFilterMode] = useState<"all" | "correct" | "wrong">(
    "all",
  );
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const filteredQuestions = useMemo(() => {
    if (!report) return [];
    return report.questions.filter((q) => {
      if (filterMode === "correct" && !q.is_correct) return false;
      if (filterMode === "wrong" && q.is_correct) return false;
      if (sectionFilter !== "all" && q.section_title !== sectionFilter) return false;
      if (
        searchTerm &&
        !(q.stem ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [report, filterMode, sectionFilter, searchTerm]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10">
      <div className="mx-auto max-w-6xl space-y-8 px-4">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-blue-500">AI 诊断报告</p>
          <h1 className="text-3xl font-bold text-slate-900">诊断完成 · Chapter 1</h1>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
            <span>Attempt ID：{attemptId}</span>
            <span>证书：{report?.scope.certificate ?? "未知"}</span>
            <span>科目：{report?.scope.subject ?? "未知"}</span>
            <span>
              章节：{report?.scope.chapter_title ?? report?.scope.chapter_code ?? "未知"}
            </span>
          </div>
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
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-sm text-slate-500">正确</p>
                <p className="text-3xl font-semibold text-slate-900">{report.summary.correct}</p>
                <p className="text-xs text-slate-400">
                  / {report.summary.total} 题
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-sm text-slate-500">得分</p>
                <p className="text-3xl font-semibold text-blue-600">
                  {(report.summary.score * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-slate-400">平均正确率</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-sm text-slate-500">开始时间</p>
                <p className="text-xs text-slate-600">
                  {report.summary.started_at
                    ? new Date(report.summary.started_at).toLocaleString()
                    : "未知"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-sm text-slate-500">完成时间</p>
                <p className="text-xs text-slate-600">
                  {report.summary.completed_at
                    ? new Date(report.summary.completed_at).toLocaleString()
                    : "仍在生成"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white p-5 text-slate-900 shadow-sm">
              <p className="text-lg font-semibold text-slate-900">复盘建议</p>
              <p className="mt-2 text-sm text-slate-600">
                {report.summary.score === 0
                  ? "得分为 0，建议先复习错题、针对薄弱考点优先做练习。"
                  : "查看错题与薄弱考点，优先巩固准确率低的知识点。"}
              </p>
            </div>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">薄弱点</h2>
                <Link
                  href="/knowledge"
                  className="text-sm font-semibold text-blue-600 underline"
                >
                  查看完整知识图谱 →
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {report.weaknesses.map((weak) => (
                  <div
                    key={weak.code}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm font-semibold text-slate-600">{weak.sectionTitle}</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {weak.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {weak.wrong} 道错题 · {weak.total} 道题 · 准确率 {(weak.accuracy * 100).toFixed(0)}%
                    </p>
                    <Link
                      href={`/knowledge?kp=${weak.code}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600"
                    >
                      去复习该考点 →
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">按小节/考点统计</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">小节表现</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {report.sections.map((section) => (
                      <li key={section.section_code} className="flex justify-between">
                        <span>{section.section_title}</span>
                        <span>
                          {section.correct}/{section.total}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Top 准确率最低考点</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {report.points
                      .slice(0, 5)
                      .map((point) => (
                        <li key={point.code} className="flex justify-between">
                          <div>
                            <p className="font-medium text-slate-800">{point.title}</p>
                            <p className="text-xs text-slate-500">{point.sectionTitle}</p>
                          </div>
                          <span className="text-sm text-red-600">
                            {point.wrong}/{point.total}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-900">题目复盘</h3>
                <div className="flex gap-2 text-xs">
                  <button
                    className={`rounded-full px-3 py-1 ${
                      filterMode === "all" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                    onClick={() => setFilterMode("all")}
                  >
                    全部
                  </button>
                  <button
                    className={`rounded-full px-3 py-1 ${
                      filterMode === "correct"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                    onClick={() => setFilterMode("correct")}
                  >
                    仅对题
                  </button>
                  <button
                    className={`rounded-full px-3 py-1 ${
                      filterMode === "wrong" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                    onClick={() => setFilterMode("wrong")}
                  >
                    仅错题
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3 md:flex-row">
                <select
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                >
                  <option value="all">全部小节</option>
                  {sectionOptions.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="搜索题干关键词"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
                {filteredQuestions.map((question) => (
                  <article key={question.question_uuid} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">
                          {question.section_title ?? "未分组"} · {question.knowledge_point_title ?? "未知"}
                        </p>
                        <h4 className="text-base font-semibold text-slate-900">{question.stem ?? "无题干"}</h4>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          question.is_correct ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                        }`}
                      >
                        {question.is_correct ? "正确" : "错误"}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      {Object.entries(question.options).map(([key, value]) => {
                        const isSelected = question.user_answer === key;
                        const isCorrect = question.correct_answer === key;
                        return (
                          <div
                            key={key}
                            className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : isCorrect
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-slate-100 bg-slate-50 text-slate-700"
                            }`}
                          >
                            <span className="font-medium">{key}.</span>
                            <span className="flex-1">{value}</span>
                          </div>
                        );
                      })}
                      <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500">
                        <p>你的答案：{question.user_answer ?? "未作答"}</p>
                        <p>正确答案：{question.correct_answer ?? "待补充"}</p>
                      </div>
                      <button
                        onClick={() =>
                          setExpandedQuestion((prev) =>
                            prev === question.question_uuid ? null : question.question_uuid,
                          )
                        }
                        className="text-xs font-semibold text-blue-600"
                      >
                        {expandedQuestion === question.question_uuid ? "收起解析" : "展开解析"}
                      </button>
                      {expandedQuestion === question.question_uuid && (
                        <p className="text-xs text-slate-600">{question.explanation ?? "暂无解析"}</p>
                      )}
                    </div>
                  </article>
                ))}
                {filteredQuestions.length === 0 && (
                  <p className="p-4 text-center text-sm text-slate-500">暂无符合筛选条件的题目。</p>
                )}
              </div>
            </section>

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
              <Link
                href={`/diagnostic/questions?license=western&subject=western-2`}
                className="inline-flex items-center justify-center rounded-full border border-blue-400 px-5 py-2 font-medium text-blue-600"
              >
                回到诊断做题
              </Link>
              <Link
                href={`/test/ch1/practice`}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2 font-medium text-slate-600"
              >
                练习模式重做错题
              </Link>
              <Link
                href="/diagnostic"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 font-medium text-slate-500"
              >
                重新开始诊断
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

