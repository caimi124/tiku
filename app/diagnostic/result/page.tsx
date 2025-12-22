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
    knowledge_point_id?: string;
    knowledge_point_name?: string;
    importance_level?: number;
    learn_mode?: "MEMORIZE" | "PRACTICE" | "BOTH";
  }[];
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
    learn_mode?: "MEMORIZE" | "PRACTICE" | "BOTH";
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

const PASSING_SCORE = 0.6;
const PASS_LINE = 60;
const IMPORTANCE_BADGES = [
  { minLevel: 4, symbol: "🔥", label: "高频", className: "bg-red-100 text-red-600" },
  { minLevel: 3, symbol: "🟡", label: "常考", className: "bg-amber-100 text-amber-600" },
  { minLevel: 1, symbol: "⚪", label: "低频", className: "bg-slate-100 text-slate-500" },
];

const LEARN_MODE_BADGES: Record<LearnMode, { label: string; className: string }> = {
  MEMORIZE: { label: "必背 · 不背必错", className: "bg-amber-100 text-amber-700" },
  PRACTICE: { label: "多练 · 题型固定", className: "bg-emerald-100 text-emerald-700" },
  BOTH: { label: "背+练 · 高频陷阱型", className: "bg-slate-100 text-slate-700" },
};

const ACTION_VARIANTS = {
  memorize: "MEMORIZE",
  practice: "PRACTICE",
} as const;

function getImportanceBadge(level?: number) {
  const badge =
    IMPORTANCE_BADGES.find((item) => (level ?? 0) >= item.minLevel) ??
    IMPORTANCE_BADGES[2];
  return badge;
}

function getLearnModeBadge(mode?: LearnMode) {
  return (mode && LEARN_MODE_BADGES[mode]) || LEARN_MODE_BADGES.BOTH;
}

type WeaknessAction = {
  label: string;
  href: string;
  variant: keyof typeof ACTION_VARIANTS;
};

const FAST_FIX_TAGS = ["概念混淆", "首选药不清", "适应证判断"];

function isFastFixPattern(tags?: string[]) {
  if (!tags || tags.length === 0) return false;
  return tags.some((tag) => FAST_FIX_TAGS.includes(tag));
}

function isUnknownWeakness(point?: Report["weaknesses"][number]) {
  const name = point?.point_name?.trim();
  return !name || name === "其他";
}

function sortWeaknesses(list: Report["weaknesses"]) {
  return [...list].sort((a, b) => {
    const importanceA = a.importance_level ?? 0;
    const importanceB = b.importance_level ?? 0;
    if (importanceA !== importanceB) {
      return importanceB - importanceA;
    }
    const isUnknownA = isUnknownWeakness(a);
    const isUnknownB = isUnknownWeakness(b);
    if (isUnknownA !== isUnknownB) {
      return isUnknownA ? 1 : -1;
    }
    const hasPointA = Boolean(a.point_name);
    const hasPointB = Boolean(b.point_name);
    if (hasPointA !== hasPointB) {
      return hasPointA ? -1 : 1;
    }
    return (b.accuracy ?? 0) - (a.accuracy ?? 0);
  });
}

const WEAKNESS_PLAN_COPY: Record<keyof typeof ACTION_VARIANTS, string> = {
  memorize: "👉 先背 5 分钟（防止再错）",
  practice: "👉 再练 3 题（形成条件反射）",
};

function buildWeaknessActions(
  weakness: Report["weaknesses"][number],
  attemptId: string,
) {
  const pointCode = weakness.knowledge_point_code;
  const baseHref = pointCode
    ? `/practice/by-point?code=${pointCode}&source=diagnostic&attempt_id=${attemptId}`
    : `/practice/diagnostic-special?attempt_id=${attemptId}`;

  if (!pointCode) {
    return [
      {
        label: "👉 立即专项练习（护住分数）",
        href: baseHref,
        variant: "practice",
      },
    ];
  }

  const mode = weakness.learn_mode ?? "BOTH";
  const actions: WeaknessAction[] = [];

  if (mode === "MEMORIZE" || mode === "BOTH") {
    actions.push({
      label: WEAKNESS_PLAN_COPY.memorize,
      href: `${baseHref}&focus=memorize`,
      variant: "memorize",
    });
  }

  if (mode === "PRACTICE" || mode === "BOTH") {
    actions.push({
      label: WEAKNESS_PLAN_COPY.practice,
      href: `${baseHref}&focus=practice`,
      variant: "practice",
    });
  }

  return actions;
}

const HERO_BADGE_TONES: Record<RiskLevel, string> = {
  high: "bg-rose-50 text-rose-600",
  medium: "bg-orange-50 text-orange-600",
  low: "bg-emerald-50 text-emerald-600",
};

const RISK_INFO = {
  high: {
    level: "high",
    label: "🔴 高风险",
    alert:
      "当前水平与通过线差距较大，若不进行针对性补强，通过概率极低",
    cta: "🔵 立即补强高频考点（防止考试失分）",
  },
  medium: {
    level: "medium",
    label: "🟠 中风险",
    alert:
      "当前接近通过线，但薄弱点仍可能导致失分，建议集中补强高频考点",
    cta: "🔵 开始冲刺补弱（避免差几分不过）",
  },
  low: {
    level: "low",
    label: "🟢 相对安全",
    alert:
      "当前已达到基本通过水平，建议巩固薄弱点以提升通过稳定性",
    cta: "🔵 巩固练习，提升通过稳定性",
  },
} as const;

const LOADING_STEPS = [
  "分析答题",
  "定位高频薄弱点",
  "生成补救手术单",
];

type RiskLevel = keyof typeof RISK_INFO;

const RISK_BADGE_STYLES: Record<RiskLevel, string> = {
  high: "bg-rose-50 text-rose-700 border border-rose-100",
  medium: "bg-amber-50 text-amber-700 border border-amber-100",
  low: "bg-emerald-50 text-emerald-700 border border-emerald-100",
};

function getRiskLevel(score: number) {
  if (score < 0.4) {
    return "high";
  }
  if (score < PASSING_SCORE) {
    return "medium";
  }
  return "low";
}

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

  const sortedWeaknesses = useMemo(
    () => (report ? sortWeaknesses(report.weaknesses) : []),
    [report],
  );
  const topWeaknesses = sortedWeaknesses.slice(0, 3);

  const wrongCount = summary ? Math.max(summary.total - summary.correct, 0) : 0;
  const hasFastFixTags = useMemo(
    () => isFastFixPattern(report?.summary.error_pattern_tags),
    [report],
  );
  const showLoadingState =
    !report || loading || (report && !report.ready);
  const loadingSteps = [
    "① 分析答题",
    "② 定位高频薄弱点",
    "③ 生成补救手术单",
  ];

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

  const riskScore = summary?.score ?? 0;
  const riskLevel = getRiskLevel(riskScore);
  const riskMeta = RISK_INFO[riskLevel];
  const gapValue = Math.round((riskScore - PASSING_SCORE) * 100);
  const gapLabel = `${gapValue >= 0 ? "+" : ""}${gapValue}%`;
  const ctaHref = `/practice/diagnostic-special?attempt_id=${attemptId}&risk_level=${riskLevel}`;
  const currentRate = summary?.score ?? 0;
  const predictedScore = Math.round(currentRate * 100);
  const simulationStatus =
    currentRate < 0.3
      ? "几乎必挂"
      : currentRate < PASSING_SCORE
      ? "高风险边缘"
      : "处在边线，仍需稳住";
  const heroBadgeTone = HERO_BADGE_TONES[riskLevel];

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

        {showLoadingState ? (
            <section className="mx-auto max-w-2xl space-y-4 rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center shadow-xl">
            <p className="text-xl font-semibold text-slate-900">
              正在生成你的个人判决书…
            </p>
            <p className="text-sm text-slate-500">
              预计 30–60 秒完成（若超过 2 分钟可刷新）
            </p>
            <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div className="absolute inset-0 w-[40%] animate-pulse rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500" />
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              {loadingSteps.map((step) => (
                <p key={step} className="flex items-center justify-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  {step}
                </p>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {pendingMessage || `已尝试 ${tries} / ${MAX_RETRY} 次`}
            </p>
          </section>
        ) : (
          report && (
            <div className="space-y-6">
              <section className="rounded-3xl bg-gradient-to-br from-rose-50 via-white to-slate-50 p-6 shadow-lg">
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="flex-1 space-y-4">
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                      考试结果模拟（按当前水平）
                    </p>
                    <div className="flex items-end gap-3">
                      <p className="text-5xl font-bold text-slate-900">{predictedScore} 分</p>
                      <div className="text-sm text-slate-500">
                        <p>通过线：{PASS_LINE} 分</p>
                        <p className="text-xs text-slate-400">按当前正确率模拟</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex-1 rounded-2xl bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm">
                        <p className="text-xs text-slate-500">通过线</p>
                        <p className="text-xl font-semibold text-slate-900">{PASS_LINE} 分</p>
                      </div>
                      <div className="flex-1 rounded-2xl bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm">
                        <p className="text-xs text-slate-500">差距</p>
                        <p className="text-xl font-semibold text-slate-900">
                          {gapLabel}
                        </p>
                      </div>
                      <div className="flex-1 rounded-2xl bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm">
                        <p className="text-xs text-slate-500">当前正确率</p>
                        <p className="text-xl font-semibold text-slate-900">
                          {formatPercent(summary?.score)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 px-5 py-4">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${heroBadgeTone}`}>
                      {riskMeta.label}
                    </span>
                    <p className="text-base font-semibold text-slate-900">当前状态：{simulationStatus}</p>
                    <p className="text-sm text-slate-600">
                      原因：高频 / 常考考点未建立稳定判断
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold text-rose-600">⚠️ 考试判决书 + 可抢救手术单</p>
              </section>

              <section className="rounded-3xl border border-slate-100 bg-white px-6 py-6 shadow-sm md:flex md:items-center md:justify-between md:gap-6">
                <div className="space-y-2 text-sm text-slate-600">
                  <p className="text-base font-semibold text-slate-900">
                    {riskMeta.alert}
                  </p>
                  <p>预计用时：15–20 分钟 · 不重复诊断题，全部来自薄弱考点</p>
                </div>
                <div className="space-y-3 md:space-y-0 md:flex md:items-center md:gap-6 md:w-full md:justify-between">
                  <Link
                    href={ctaHref}
                    className="flex-1 rounded-2xl bg-slate-900 px-5 py-3 text-center text-base font-semibold text-white shadow-lg transition hover:bg-slate-800"
                  >
                    立即补强高频考点
                  </Link>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>当前正确率</span>
                      <span>通过线 {PASS_LINE}%</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-slate-200">
                      <div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                        style={{ width: `${Math.min(Math.max(currentRate * 100, 0), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-100 bg-white px-6 py-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">薄弱点优先级（Top 3）</p>
                    <h3 className="text-2xl font-semibold text-slate-900">
                      当前手术单：先补哪几项
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">先做哪个 →</span>
                </div>
                <details className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <summary className="flex items-center justify-between font-semibold text-slate-700">
                    为什么系统只让你先补这 3 个？
                    <span className="text-xs text-blue-500">展开</span>
                  </summary>
                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <p>• 它们属于 高频 / 常考考点</p>
                    <p>• 错 1 题 ≈ 丢 2–4 分</p>
                    <p>• 修复成本低，但回报最高</p>
                    <p>👉 先补这 3 个，比你刷 100 道随机题更有效</p>
                  </div>
                </details>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                {topWeaknesses.map((weak, index) => {
                  const correct = Math.max(weak.total - weak.wrong, 0);
                  const accuracy = Math.round((weak.accuracy ?? 0) * 100);
                  const hint = COMMON_ERROR_HINTS[index % COMMON_ERROR_HINTS.length];
                    const importanceMeta = getImportanceBadge(weak.importance_level);
                    const learnModeMeta = getLearnModeBadge(weak.learn_mode);
                    const unknownPoint = isUnknownWeakness(weak);
                    const displayTitle = unknownPoint
                      ? "⚠️ 尚未精确归类的综合考点"
                      : weak.point_name ?? weak.title ?? "待分析";
                    const actions = buildWeaknessActions(weak, attemptId!);
                    const errorTypes = hint.split(" / ").slice(0, 2);
                    return (
                      <div
                        key={weak.code ?? `${weak.sectionTitle}-${displayTitle}`}
                        className={`flex flex-col gap-4 rounded-2xl border px-4 py-5 shadow-sm transition ${
                          unknownPoint
                            ? "border-slate-300 bg-slate-100 text-slate-500"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="flex-1 text-lg font-semibold text-slate-900">
                            {displayTitle}
                          </h4>
                          <span
                            className={`text-xs font-semibold ${importanceMeta.className}`}
                          >
                            {importanceMeta.symbol} {importanceMeta.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span
                            className={`rounded-full px-3 py-1 font-semibold ${learnModeMeta.className}`}
                          >
                            {learnModeMeta.label}
                          </span>
                          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                            {weak.sectionTitle ?? "未分组"}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-slate-500">
                            <span>正确率</span>
                            <span>{accuracy}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500"
                              style={{ width: `${accuracy}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-500">{correct}/{weak.total} 题</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {errorTypes.map((type) => (
                            <span
                              key={type}
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                        {unknownPoint && (
                          <p className="text-[11px] text-slate-500">
                            该题涉及多个知识点，系统暂按“综合判断题”处理
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3">
                          {actions[0] && (
                            <Link
                              href={actions[0].href}
                              className="flex-1 rounded-2xl bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-amber-600"
                            >
                              {actions[0].label}
                            </Link>
                          )}
                          {actions[1] && (
                            <Link
                              href={actions[1].href}
                              className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              {actions[1].label}
                            </Link>
                          )}
                        </div>
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

              {hasFastFixTags && (
                <section className="rounded-3xl border border-emerald-100 bg-emerald-50/60 px-6 py-5 space-y-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">
                    可恢复性提示
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    好消息：这是“可快速修复型错误”
                  </h3>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>你的错误不是：</p>
                    <div className="space-y-1 text-xs text-rose-600">
                      <p>✘ 不会做题</p>
                      <p>✘ 理解能力差</p>
                    </div>
                    <p className="pt-1">而是：</p>
                    <div className="space-y-1 text-xs text-emerald-700">
                      <p>✔ 记忆未固化</p>
                      <p>✔ 判断条件未形成反射</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      👉 这类问题，2–3 天可以明显改善
                    </p>
                  </div>
                </section>
              )}

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
          )
        )}
      </div>
    </div>
  );
}

