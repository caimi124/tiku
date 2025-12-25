"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type LearnMode = "MEMORIZE" | "PRACTICE" | "BOTH";

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
    error_pattern_tags?: string[];
  };
  weaknesses: {
    code: string;
    title: string;
    sectionTitle: string;
    total: number;
    wrong: number;
    accuracy: number;
    knowledge_point_code?: string;
    point_name?: string;
    importance_level?: number;
    learn_mode?: LearnMode;
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

type StageRule = {
  max: number;
  label: string;
  description: string;
};

type Recommendation = {
  id: string;
  title: string;
  weightLabel: string;
  reason: string;
  duration: string;
  goal: string;
  href: string;
  mode: "study" | "practice";
  emphasis?: boolean;
  accuracy?: number;
};

const MAX_RETRY = 10;
const PASS_LINE = 60;

const STAGE_RULES: StageRule[] = [
  {
    max: 0.4,
    label: "基础建立期",
    description: "当前任务是先把权重最高的章节过一遍，搭建记忆框架。",
  },
  {
    max: 0.75,
    label: "查漏补缺期",
    description: "基础已成型，集中补救低正确率 × 高权重章节即可稳住分数。",
  },
  {
    max: 1,
    label: "冲刺刷题期",
    description: "距离通过线很近，保持做题节奏与稳定性就能守住成绩。",
  },
];

const AI_SUMMARY_RULES = [
  {
    max: 0.25,
    text: "本次成绩主要反映对题型和考点还不熟悉。先按考试权重逐个过一遍，分数会很快拉回来。",
  },
  {
    max: 0.5,
    text: "你已掌握基础概念，但在多个核心章节存在缺口。补齐记忆盲点后，正确率会明显提升。",
  },
  {
    max: 0.75,
    text: "整体理解良好。针对错题涉及的章节做专项训练，可迅速提升稳定性。",
  },
  {
    max: 1,
    text: "处于高分段。继续用真题与随机练习保持手感，同时盯紧错题，避免重复失分。",
  },
];

const IMPORTANCE_WEIGHT_MAP: Record<number, string> = {
  5: "18%",
  4: "15%",
  3: "10%",
  2: "7%",
  1: "4%",
  0: "2%",
};

function clamp01(value: number) {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function formatDurationLabel(duration: number | null) {
  if (!duration || Number.isNaN(duration) || duration <= 0) return "—";
  const minutes = Math.floor(duration / 60);
  const seconds = Math.max(Math.round(duration % 60), 0);
  if (minutes === 0) return `${seconds} 秒`;
  if (seconds === 0) return `${minutes} 分钟`;
  return `${minutes} 分 ${seconds} 秒`;
}

function getLearningStageMeta(rate: number) {
  const normalized = clamp01(rate);
  return (
    STAGE_RULES.find((rule) => normalized <= rule.max) ?? STAGE_RULES[STAGE_RULES.length - 1]
  );
}

function getAiConclusionText(rate: number) {
  const normalized = clamp01(rate);
  return (
    AI_SUMMARY_RULES.find((rule) => normalized <= rule.max)?.text ??
    AI_SUMMARY_RULES[AI_SUMMARY_RULES.length - 1].text
  );
}

function getExamWeightLabel(level?: number) {
  if (level == null) return "5%";
  return IMPORTANCE_WEIGHT_MAP[level] ?? "5%";
}

function getRecommendationGoal(mode?: LearnMode) {
  if (mode === "MEMORIZE") return "建立记忆框架";
  if (mode === "PRACTICE") return "提升做题正确率";
  return "记忆 + 练习结合";
}

function getRecommendationDuration(mode?: LearnMode) {
  if (mode === "MEMORIZE") return "≈20 分钟";
  if (mode === "PRACTICE") return "≈25 分钟";
  return "≈22 分钟";
}

function extractWeaknessTitle(weakness: Report["weaknesses"][number]) {
  return weakness.point_name ?? weakness.title ?? weakness.sectionTitle ?? "未命名章节";
}

function buildWeaknessRecommendation(
  weakness: Report["weaknesses"][number],
  attemptId: string,
  logic: "weight-first" | "balanced",
  emphasis = false,
): Recommendation {
  const weightLabel = getExamWeightLabel(weakness.importance_level);
  const accuracy = Math.round((weakness.accuracy ?? 0) * 100);
  const href = weakness.knowledge_point_code
    ? `/practice/by-point?code=${weakness.knowledge_point_code}&source=diagnostic&attempt_id=${attemptId}`
    : `/practice/diagnostic-special?attempt_id=${attemptId}`;
  const mode =
    weakness.learn_mode === "PRACTICE"
      ? "practice"
      : weakness.learn_mode === "MEMORIZE"
      ? "study"
      : "study";
  const duration = getRecommendationDuration(weakness.learn_mode);
  const goal = getRecommendationGoal(weakness.learn_mode);
  const reason =
    logic === "weight-first"
      ? `该章节占比约 ${weightLabel}，先抢回高权重分数最划算。`
      : `正确率仅 ${accuracy}% 且章节占比约 ${weightLabel}，提分效率最高。`;

  return {
    id: weakness.code ?? `${extractWeaknessTitle(weakness)}-${accuracy}`,
    title: extractWeaknessTitle(weakness),
    weightLabel,
    reason,
    duration,
    goal,
    href,
    mode,
    emphasis,
    accuracy,
  };
}

function buildHighScoreActions(attemptId: string): Recommendation[] {
  return [
    {
      id: "random-20",
      title: "随机 20 题混合练习",
      weightLabel: "保持考试手感",
      reason: "高分阶段以维持速度与准确率为主。",
      duration: "≈20 分钟",
      goal: "维持正确率",
      href: `/practice/random?source=diagnostic&attempt_id=${attemptId}`,
      mode: "practice",
      emphasis: true,
    },
    {
      id: "past-paper",
      title: "历年真题 1 套",
      weightLabel: "贴近真实考场",
      reason: "复刻正式体验，检视易错点。",
      duration: "≈45 分钟",
      goal: "模拟实战",
      href: `/practice/past-paper?attempt_id=${attemptId}`,
      mode: "practice",
    },
    {
      id: "error-focus",
      title: "错题专项巩固",
      weightLabel: "定位易混考点",
      reason: "避免旧错反复出现，稳定发挥。",
      duration: "≈18 分钟",
      goal: "消除隐患",
      href: `/practice/wrong-book?attempt_id=${attemptId}`,
      mode: "study",
    },
  ];
}

function buildFoundationFallback(attemptId: string): Recommendation[] {
  return [
    {
      id: "outline",
      title: "高频章节串讲",
      weightLabel: "≈40% 总分",
      reason: "缺少题目数据时，先把大纲前 3 章梳理完。",
      duration: "≈30 分钟",
      goal: "搭建知识骨架",
      href: `/knowledge/tree?source=diagnostic&attempt_id=${attemptId}`,
      mode: "study",
      emphasis: true,
    },
    {
      id: "memory",
      title: "核心概念快背",
      weightLabel: "≈20% 总分",
      reason: "首选药、适应证记牢即可快速抬分。",
      duration: "≈15 分钟",
      goal: "建立记忆框架",
      href: `/practice/memorize?source=diagnostic&attempt_id=${attemptId}`,
      mode: "study",
    },
  ];
}

function buildPriorityRecommendations(
  rate: number,
  weaknesses: Report["weaknesses"],
  attemptId: string,
) {
  const normalized = clamp01(rate);
  if (!weaknesses.length) {
    if (normalized >= 0.85) {
      return buildHighScoreActions(attemptId);
    }
    return buildFoundationFallback(attemptId);
  }

  if (normalized < 0.4) {
    return weaknesses.slice(0, 5).map((weakness, index) =>
      buildWeaknessRecommendation(weakness, attemptId, "weight-first", index === 0),
    );
  }

  if (normalized < 0.85) {
    const scored = [...weaknesses].sort((a, b) => {
      const scoreA = (1 - (a.accuracy ?? 0)) * ((a.importance_level ?? 1) + 1);
      const scoreB = (1 - (b.accuracy ?? 0)) * ((b.importance_level ?? 1) + 1);
      return scoreB - scoreA;
    });
    return scored.slice(0, 5).map((weakness, index) =>
      buildWeaknessRecommendation(weakness, attemptId, "balanced", index === 0),
    );
  }

  return buildHighScoreActions(attemptId);
}

function truncateStem(content: string | null, limit = 72) {
  if (!content) return "题干内容加载中...";
  const trimmed = content.replace(/\s+/g, " ").trim();
  if (trimmed.length <= limit) return trimmed;
  return `${trimmed.slice(0, limit)}…`;
}

function formatDateTime(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString("zh-CN") : "未知";
}

function buildAttemptReviewLink(attemptId: string) {
  return `/practice/diagnostic-special?attempt_id=${attemptId}`;
}

function sortWeaknesses(list: Report["weaknesses"]) {
  return [...list].sort((a, b) => {
    const importanceA = a.importance_level ?? 0;
    const importanceB = b.importance_level ?? 0;
    if (importanceA !== importanceB) {
      return importanceB - importanceA;
    }
    return (a.accuracy ?? 0) - (b.accuracy ?? 0);
  });
}

const PRACTICE_MODES: { label: string; href: string }[] = [
  { label: "按章节练题", href: "/practice/by-chapter" },
  { label: "历年真题", href: "/practice/history" },
  { label: "考前押题 / 模拟", href: "/predictions" },
  { label: "错题巩固", href: "/wrong-questions" },
  { label: "随机练题", href: "/practice/random" },
];

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
        throw new Error(body?.error?.message ?? `报告加载失败 (${resp.status})`);
      }
      const payload = (await resp.json()) as Report;
      setReport(payload);
      if (!payload.ready) {
        setPendingMessage("报告生成中，请稍后...");
      } else {
        setPendingMessage(null);
      }
      setLoading(false);
      return payload;
    } catch (err) {
      const message = err instanceof Error ? err.message : "报告加载失败，请稍后重试";
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
            new Date(report.summary.started_at).getTime()) /
          1000
        : null;
    return {
      ...report.summary,
      duration,
    };
  }, [report]);

  const sortedWeaknesses = useMemo(
    () => (report ? sortWeaknesses(report.weaknesses) : []),
    [report],
  );

  const showLoadingState = !report || loading || (report && !report.ready);

  if (!attemptId) {
    return (
      <div className="min-h-screen bg-slate-50 py-24">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">未提供 attempt_id</p>
          <p className="mt-2 text-sm text-slate-600">请先完成一次诊断再查看报告。</p>
          <Link
            href="/diagnostic"
            className="mt-4 inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-700"
          >
            返回诊断设置
          </Link>
        </div>
      </div>
    );
  }

  const totalAnswered = summary?.total ?? 0;
  const correctCount = summary?.correct ?? 0;
  const derivedRate =
    summary?.score != null
      ? summary.score
      : totalAnswered > 0
      ? correctCount / totalAnswered
      : 0;
  const wrongCount = Math.max(totalAnswered - correctCount, 0);
  const clampedRate = clamp01(derivedRate ?? 0);
  const predictedScore = Math.round(clampedRate * 100);
  const normalizedScore = Math.min(Math.max(predictedScore, 0), 100);
  const summaryMeta = [
    `Attempt：${attemptId}`,
    `证书：${report?.scope.certificate ?? "未设置"}`,
    `科目：${report?.scope.subject ?? "未设置"}`,
    `章节：${report?.scope.chapter_title ?? report?.scope.chapter_code ?? "全卷"}`,
    `时间：${formatDateTime(report?.summary.started_at)} ~ ${formatDateTime(
      report?.summary.completed_at,
    )}`,
  ];

  const recommendations = buildPriorityRecommendations(clampedRate, sortedWeaknesses, attemptId);
  const primaryRecommendation = recommendations[0];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:py-10">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">AI 诊断判决书</p>
          <h1 className="text-3xl font-semibold text-slate-900">你的考试状态一目了然</h1>
          <p className="flex flex-wrap gap-2 text-sm text-slate-500">
            {summaryMeta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </p>
          {pendingMessage && (
            <p className="text-xs text-amber-600">{pendingMessage}（已尝试 {tries} 次）</p>
          )}
        </header>

        {error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <p className="font-semibold">报告加载失败</p>
            <p className="text-sm">原因：{error}</p>
          </div>
        )}

        {showLoadingState ? (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="h-5 w-24 rounded-full bg-slate-100" />
                  <div className="mt-4 h-12 w-3/4 rounded-full bg-slate-100" />
                  <div className="mt-3 flex gap-2">
                    <div className="h-3 w-14 rounded-full bg-slate-100" />
                    <div className="h-3 w-10 rounded-full bg-slate-100" />
                  </div>
                </div>
              ))}
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="space-y-2">
                  <div className="h-4 w-1/2 rounded-full bg-slate-100" />
                  <div className="h-3 w-full rounded-full bg-slate-100" />
                </div>
              ))}
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              {[1, 2, 3].map((step) => (
                <div key={step} className="h-10 w-full rounded-2xl bg-slate-100" />
              ))}
            </section>
          </>
        ) : (
          report && (
            <>
              <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    成绩单
                  </p>
                  <div className="flex items-end gap-3">
                    <p className="text-5xl font-semibold text-slate-900">
                      {predictedScore}
                      <span className="text-2xl text-slate-500"> / 100</span>
                    </p>
                    <div className="text-sm text-slate-600">
                      <p>
                        正确 {correctCount} / {totalAnswered} 题
                      </p>
                      <p>诊断类型 · 诊断测验</p>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-sky-500 transition-all"
                      style={{ width: `${normalizedScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    通过线 {PASS_LINE} 分 · 当前差距 {Math.max(PASS_LINE - predictedScore, 0)} 分
                  </p>
                  <p className="text-sm text-slate-500">
                    当前成绩主要受高权重章节影响，优先补强关键模块即可显著改善结果。
                  </p>
                </div>
                <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">科目</p>
                    <p className="font-semibold">{report.scope.subject ?? "未设置"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">证书</p>
                    <p className="font-semibold">{report.scope.certificate ?? "未设置"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">用时</p>
                    <p className="font-semibold">{formatDurationLabel(summary?.duration ?? null)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">测验时间</p>
                    <p className="font-semibold">{formatDateTime(report.summary.completed_at)}</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border border-blue-100 bg-blue-50/70 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                      AI 总结判断
                    </p>
                    <p className="text-base leading-relaxed text-slate-800">
                      {getAiConclusionText(clampedRate)}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-4 py-1 text-xs font-semibold text-blue-700 shadow-sm">
                    AI 说明
                  </span>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                  当前学习阶段
                </p>
                {(() => {
                  const stageMeta = getLearningStageMeta(clampedRate);
                  return (
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <span className="rounded-full bg-slate-100 px-4 py-1 text-sm font-semibold text-amber-700">
                        {stageMeta.label}
                      </span>
                      <p className="text-sm text-slate-600">{stageMeta.description}</p>
                    </div>
                  );
                })()}
              </section>

              {primaryRecommendation && (
                <section className="relative space-y-3 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-white p-6 shadow-sm">
                  <span className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-blue-600" aria-hidden />
                  <div className="flex flex-col gap-1 pl-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                      当前最高优先任务
                    </p>
                    <h2 className="text-2xl font-semibold text-slate-900">直接照做即可提分</h2>
                    <p className="text-sm text-slate-600">
                      本次评估最佳提分方向，直接进入对应章节模块。
                    </p>
                  </div>
                  <div className="rounded-2xl border border-blue-200 bg-white/80 p-4 shadow-sm">
                    <div className="flex flex-col gap-2">
                      <p className="text-lg font-semibold text-slate-900">{primaryRecommendation.title}</p>
                      <div className="flex flex-wrap gap-3 text-xs font-semibold">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                          权重约 {primaryRecommendation.weightLabel}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                          目标：{primaryRecommendation.goal}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{primaryRecommendation.reason}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">⏱ {primaryRecommendation.duration}</span>
                        <Link
                          href={primaryRecommendation.href}
                          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                        >
                          开始补强这一模块
                        </Link>
                      </div>
                      <p className="text-xs text-slate-500">完成后系统将重新计算你的薄弱点。</p>
                    </div>
                  </div>
                  <div className="pl-3">
                    <Link href="/dashboard" className="text-sm font-semibold text-blue-600 underline decoration-dotted underline-offset-4">
                      查看章节掌握情况
                    </Link>
                  </div>
                </section>
              )}

              <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    练题入口
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    通过练题巩固与提分
                  </h3>
                  <p className="text-sm text-slate-500">直达练题模块，保持答题节奏。</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {PRACTICE_MODES.map((mode) => (
                    <Link
                      key={mode.label}
                      href={mode.href}
                      className="flex items-center justify-center rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
                    >
                      {mode.label}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    即时复盘
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">回看本次作答解析</h3>
                  <p className="text-sm text-slate-500">
                    本次共完成 {totalAnswered} 题，错题 {wrongCount} 题
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    href={attemptId ? buildAttemptReviewLink(attemptId) : "/practice/diagnostic-special"}
                    className="inline-flex items-center justify-center rounded-full border border-blue-200 px-5 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2"
                  >
                    查看本次解析
                  </Link>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-900">
                    了解诊断依据
                    <span className="text-xs text-slate-500">展开</span>
                  </summary>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <p>本报告综合以下维度生成：</p>
                    <ul className="list-disc space-y-1 pl-5">
                      <li>答题数量、正确率与漏题情况</li>
                      <li>覆盖章节与考试大纲权重</li>
                      <li>题目难度、错误类型与时间消耗</li>
                      <li>历年真题分布与高频考点</li>
                    </ul>
                  </div>
                </details>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-900">
                    查看学习档案
                    <span className="text-xs text-slate-500">展开</span>
                  </summary>
                  <div className="mt-3 text-sm text-slate-600">
                    <p>系统会记住你的阶段特征，在后续练习里自动调节题量与难度。</p>
                    <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                        <p className="font-semibold">基础：记忆框架</p>
                        <p className="text-xs text-slate-500">优先推送核心定义、首选药、关键数字。</p>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                        <p className="font-semibold">实践：速度与准确性</p>
                        <p className="text-xs text-slate-500">根据错题类型动态调整题量，保持手感。</p>
                      </div>
                    </div>
                  </div>
                </details>
              </section>
            </>
          )
        )}
      </div>
    </main>
  );
}

