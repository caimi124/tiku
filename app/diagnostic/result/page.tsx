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

const MAX_RETRY = 10;
const PASS_LINE = 60;
const COMMON_ERROR_HINTS = [
  "概念混淆 / 首选药记忆不清",
  "适应证判断错误",
  "题干关键信息遗漏",
  "审题信息抓取不全",
  "重要细节未抓住",
];

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

const RISK_INFO = {
  high: {
    label: "🔴 高风险",
    alert: "当前水平与通过线差距较大，需立即补强高频考点。",
  },
  medium: {
    label: "🟠 中风险",
    alert: "接近通过线但还有薄弱点，建议优先复盘重点题型。",
  },
  low: {
    label: "🟢 相对安全",
    alert: "基础稳定，巩固薄弱点可提升通过稳定性。",
  },
} as const;

function clamp01(value: number) {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

const RISK_BADGE_STYLES: Record<keyof typeof RISK_INFO, string> = {
  high: "border border-[#EBAFA9] bg-[#FFF1EF] text-[#8B2E2E]",
  medium: "border border-[#E6D7C4] bg-[#FAF7F1] text-[#7A6A5F]",
  low: "border border-[#D1E7D7] bg-[#F4FFF5] text-[#4C6F5E]",
};

const PRIORITY_TIERS = [
  { threshold: 0.4, label: "紧急补救", className: "text-[#8B2E2E] border border-[#8B2E2E] bg-[#8B2E2E]/10" },
  { threshold: 0.75, label: "重点巩固", className: "text-[#7A6A5F] border border-[#DCCFC6] bg-[#FAF9F6]" },
  { threshold: 1, label: "已掌握", className: "text-[#7A6A5F] border border-[#E6DED6] bg-[#F6F1EC]" },
];

const FAST_FIX_TAGS = ["概念混淆", "首选药不清", "适应证判断"];

const LOADING_STEPS = [
  "分析答题",
  "定位高频薄弱点",
  "生成补救手术单",
];

const ACTION_VARIANTS = {
  memorize: "MEMORIZE",
  practice: "PRACTICE",
} as const;

const WEAKNESS_PLAN_COPY: Record<keyof typeof ACTION_VARIANTS, string> = {
  memorize: "先背 5 分钟",
  practice: "再练 3 题",
};

function getImportanceBadge(level?: number) {
  return (
    IMPORTANCE_BADGES.find((item) => (level ?? 0) >= item.minLevel) ?? IMPORTANCE_BADGES[2]
  );
}

function getLearnModeBadge(mode?: LearnMode) {
  return (mode && LEARN_MODE_BADGES[mode]) || LEARN_MODE_BADGES.BOTH;
}

function buildWeaknessActions(weakness: Report["weaknesses"][number], attemptId: string) {
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
  const actions: { label: string; href: string; variant: keyof typeof ACTION_VARIANTS }[] = [];

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

function getPriorityTier(accuracy: number) {
  return PRIORITY_TIERS.find((tier) => accuracy < tier.threshold) ?? PRIORITY_TIERS[2];
}

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
    return (b.accuracy ?? 0) - (a.accuracy ?? 0);
  });
}

function getRiskLevel(score: number): keyof typeof RISK_INFO {
  if (score < 0.4) {
    return "high";
  }
  if (score < PASS_LINE / 100) {
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
  const simulatedWeaknesses = sortedWeaknesses.slice(0, 5);

  const wrongCount = summary ? Math.max(summary.total - summary.correct, 0) : 0;
  const hasFastFixTags = useMemo(
    () => isFastFixPattern(report?.summary.error_pattern_tags),
    [report],
  );
  const showLoadingState =
    !report || loading || (report && !report.ready);

  const formatDateTime = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleString("zh-CN") : "未知";

  if (!attemptId) {
    return (
      <div className="min-h-screen bg-[#F6F1EC] py-24">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#E6DED6] bg-[#FAF9F6] p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#3A2F28]">未提供 attempt_id</p>
          <p className="mt-2 text-sm text-[#7A6A5F]">
            请先完成一次诊断再查看报告。
          </p>
          <Link
            href="/diagnostic"
            className="mt-4 inline-flex items-center justify-center rounded-full border border-[#8B2E2E] px-6 py-2 text-sm font-semibold text-[#8B2E2E]"
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
  const ctaHref = `/practice/diagnostic-special?attempt_id=${attemptId}&risk_level=${riskLevel}`;
  const totalAnswered = summary?.total ?? 0;
  const correctCount = summary?.correct ?? 0;
  const derivedRate =
    summary?.score != null
      ? summary.score
      : totalAnswered > 0
      ? correctCount / totalAnswered
      : 0;
  const currentRate = derivedRate ?? 0;
  const clampedRate = clamp01(currentRate);
  const predictedScore = Math.round(clampedRate * 100);
  const simulationStatus =
    clampedRate < 0.3
      ? "几乎必挂"
      : clampedRate < PASS_LINE / 100
      ? "高风险边缘"
      : "处在边线，仍需稳住";
  const normalizedScore = Math.min(Math.max(predictedScore, 0), 100);
  const summaryMeta = [
    `Attempt：${attemptId}`,
    `证书：${report?.scope.certificate ?? "未知"}`,
    `科目：${report?.scope.subject ?? "未知"}`,
    `章节：${report?.scope.chapter_title ?? report?.scope.chapter_code ?? "未知"}`,
    `时间：${formatDateTime(report?.summary.started_at)} ~ ${formatDateTime(report?.summary.completed_at)}`,
  ];

  return (
    <main className="min-h-screen bg-[#F6F1EC]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10 space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.5em] text-[#7A6A5F]">AI 诊断判决书</p>
          <h1 className="text-3xl font-semibold text-[#3A2F28]">你的考试状态一目了然</h1>
          <p className="text-sm text-[#7A6A5F] flex flex-wrap gap-2">
            {summaryMeta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </p>
        </header>

        {error && (
          <div className="rounded-2xl border border-[#E6DED6] bg-[#FAF9F6] p-5 text-[#8B2E2E]">
            <p className="font-semibold">错误：{error}</p>
            <p className="text-sm text-[#7A6A5F]">请重试或联系管理员。</p>
          </div>
        )}

        {showLoadingState ? (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="rounded-2xl border border-[#E6DED6] bg-[#FAF9F6] p-6 shadow-sm"
                >
                  <div className="h-5 w-24 rounded-full bg-[#E6DED6]" />
                  <div className="mt-4 h-12 w-3/4 rounded-full bg-[#E6DED6]" />
                  <div className="mt-3 flex gap-2">
                    <div className="h-3 w-14 rounded-full bg-[#E6DED6]" />
                    <div className="h-3 w-10 rounded-full bg-[#E6DED6]" />
                  </div>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-[#E6DED6] bg-[#FAF9F6] p-6 shadow-sm space-y-4">
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="space-y-2">
                  <div className="h-4 w-1/2 rounded-full bg-[#E6DED6]" />
                  <div className="h-3 w-full rounded-full bg-[#E6DED6]" />
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-[#E6DED6] bg-[#FAF9F6] p-6 shadow-sm space-y-3">
              {[1, 2, 3].map((step) => (
                <div key={step} className="h-10 w-full rounded-2xl bg-[#E6DED6]" />
              ))}
            </section>
          </>
        ) : (
          report && (
            <>
              <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#E6DED6] bg-[#FAF9F6] p-6 shadow-sm space-y-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-[#7A6A5F]">当前得分</p>
                  <p className="text-4xl font-semibold text-[#3A2F28]">{predictedScore} / 100</p>
                  <p className="text-sm text-[#7A6A5F]">仍在通过线下 · {simulationStatus}</p>
                  <div className="relative h-2 rounded-full bg-[#E6DED6]">
                    <div
                      className="absolute inset-0 rounded-full bg-[#8B2E2E]"
                      style={{ width: `${normalizedScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#7A6A5F]">通过线 {PASS_LINE} 分</p>
                <p className="text-sm text-[#7A6A5F]">
                  结论：从高频弱点入手，逐步追回分数，保持节奏即可拉近线。
                </p>
                </div>

                <div className="rounded-2xl border border-[#E6DED6] bg-[#FAF9F6] p-6 shadow-sm space-y-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-[#7A6A5F]">破点数量</p>
                  <p className="text-4xl font-semibold text-[#3A2F28]">
                    {report.weaknesses.length} 个
                  </p>
                  <p className="text-sm text-[#7A6A5F]">高频 / 常考页顺序呈现</p>
                  <p className="text-xs text-[#7A6A5F]">从弱点入手，逐步追回分数。</p>
                </div>

                <div className="rounded-2xl border border-[#E6DED6] bg-[#FAF9F6] p-6 shadow-sm flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-[#7A6A5F]">建议行动</p>
                    <p className="text-lg font-semibold text-[#3A2F28]">以高频弱点为主线</p>
                    <p className="text-sm text-[#7A6A5F]">
                      先背 5 分钟，再练 3 题，按顺序缓解风险。
                    </p>
                  </div>
                  <Link
                    href={ctaHref}
                    className="rounded-2xl bg-[#8B2E2E] px-4 py-3 text-center text-base font-semibold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B2E2E]"
                  >
                    立即补强高频考点
                  </Link>
                </div>
              </section>

              <section className="space-y-4 mt-6 border-t border-[#E6DED6] pt-6">
                <div className="flex items-center justify-between rounded-2xl border border-[#E6DED6] bg-[#FAF9F6] p-5 shadow-sm">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#7A6A5F]">Top 薄弱点</p>
                    <h3 className="text-xl font-semibold text-[#3A2F28] tracking-tight">优先修复顺序</h3>
                  </div>
                  <span className="text-xs text-[#7A6A5F]">优先级 · 节奏排列</span>
                </div>

                {simulatedWeaknesses.map((weak, index) => {
                  const accuracy = Math.round((weak.accuracy ?? 0) * 100);
                  const importanceMeta = getImportanceBadge(weak.importance_level);
                  const learnModeMeta = getLearnModeBadge(weak.learn_mode);
                  const unknownPoint = isUnknownWeakness(weak);
                  const priorityVariant = getPriorityTier(accuracy / 100);
                    const cardBase =
                      index === 0
                        ? "border border-[#8B2E2E]/40 bg-[#FFF7F6]"
                        : unknownPoint
                        ? "border border-[#EDE6DF] bg-[#FBFAF8]"
                        : "border border-[#E6DED6] bg-white";
                  const title = unknownPoint
                    ? "⚠️ 尚未精确归类的综合考点"
                    : weak.point_name ?? weak.title ?? "待分析";
                  const actions = buildWeaknessActions(weak, attemptId!);
                    const heroPadding = index === 0 ? "pl-6" : "";
                  return (
                    <article
                      key={weak.code ?? `${weak.sectionTitle}-${title}-${index}`}
                        className={`relative flex flex-col gap-3 rounded-2xl border px-4 py-4 shadow-sm transition ${cardBase} ${heroPadding}`}
                    >
                        {index === 0 && (
                          <span className="absolute left-2 top-3 bottom-3 w-1 rounded-full bg-[#8B2E2E]" />
                        )}
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="flex-1 text-lg font-semibold text-[#3A2F28]">{title}</h4>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${priorityVariant.className}`}
                        >
                          {priorityVariant.label}
                        </span>
                      </div>
                      {index === 0 && (
                        <p className="text-xs text-[#7A6A5F]">优先修复 · 先从这里开始</p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className={`rounded-full px-3 py-1 font-semibold ${importanceMeta.className}`}>
                          {importanceMeta.symbol} {importanceMeta.label}
                        </span>
                        <span className={`rounded-full px-3 py-1 font-semibold ${learnModeMeta.className}`}>
                          {learnModeMeta.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-[#7A6A5F]">
                        <span>常见错误：{COMMON_ERROR_HINTS[index % COMMON_ERROR_HINTS.length]}</span>
                        <span>正确率 {accuracy}%</span>
                      </div>
                      <div className="relative h-1.5 rounded-full bg-[#E6DED6]">
                        <div
                          className={`absolute inset-0 rounded-full ${index === 0 ? "bg-[#8B2E2E]" : "bg-[#7A6A5F]/60"}`}
                          style={{ width: `${accuracy}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {actions[0] && (
                          <Link
                            href={actions[0].href}
                            className={`flex-1 rounded-2xl px-4 py-2 text-center text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                              index === 0
                                ? "bg-[#8B2E2E] text-white focus-visible:ring-[#8B2E2E]"
                                : "border border-[#E6DED6] text-[#3A2F28] focus-visible:ring-[#7A6A5F]"
                            }`}
                          >
                            {actions[0].label}
                          </Link>
                        )}
                        {actions[1] && index === 0 && (
                          <Link
                            href={actions[1].href}
                            className="flex-1 rounded-2xl border border-[#E6DED6] px-4 py-2 text-center text-sm font-semibold text-[#3A2F28] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7A6A5F]"
                          >
                            {actions[1].label}
                          </Link>
                        )}
                      </div>
                      {unknownPoint && (
                        <p className="text-xs text-[#7A6A5F]">
                          该题涉及多个知识点，系统暂按“综合判断题”处理
                        </p>
                      )}
                    </article>
                  );
                })}
              </section>

              <section className="rounded-2xl border border-[#E6DED6] bg-[#FAF9F6] p-6 shadow-sm space-y-3 mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.4em] text-[#7A6A5F]">下一步怎么做</p>
                  <span className="text-xs text-[#7A6A5F]">行动计划</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/practice/by-point?source=diagnostic"
                    className="flex-1 rounded-2xl bg-[#8B2E2E] px-4 py-3 text-center text-sm font-semibold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B2E2E]"
                  >
                    启动学习计划
                  </Link>
                  <Link
                    href="/test/ch1/practice"
                    className="flex-1 rounded-2xl border border-[#E6DED6] px-4 py-3 text-center text-sm font-semibold text-[#3A2F28] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7A6A5F]"
                  >
                    继续练习题
                  </Link>
                  <Link
                    href="/diagnostic/questions"
                    className="flex-1 rounded-2xl border border-[#E6DED6] px-4 py-3 text-center text-sm font-semibold text-[#3A2F28] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7A6A5F]"
                  >
                    返回诊断首页
                  </Link>
                </div>
              </section>
            </>
          )
        )}
      </div>
    </main>
  );
}

