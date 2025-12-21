"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type PracticeQuestion = {
  question_uuid: string;
  stem: string;
  options: Record<string, string>;
  correct_answer: string | null;
  knowledge_point_title: string | null;
  section_title: string | null;
};

type WeaknessCard = {
  code: string;
  title: string;
  sectionTitle: string | null;
  accuracy: number;
};

type PracticeResponse = {
  attempt_id: string;
  total: number;
  target: number;
  risk_level: "low" | "medium" | "high";
  risk_alert: string;
  weaknesses: WeaknessCard[];
  questions: PracticeQuestion[];
  score: number;
};

type AnswerSnapshot = {
  question_uuid: string;
  selected_option: string;
  is_correct: boolean;
};

type StoredState = {
  response: PracticeResponse;
  answers: AnswerSnapshot[];
  currentIndex: number;
};

const STORAGE_PREFIX = "diagnostic-special-practice";

const RISK_LABELS: Record<PracticeResponse["risk_level"], string> = {
  high: "🔴 高风险",
  medium: "🟠 中风险",
  low: "🟢 相对安全",
};

const storageKey = (attemptId: string) => `${STORAGE_PREFIX}:${attemptId}`;

async function fetchPractice(attemptId: string) {
  const resp = await fetch(`/api/practice/diagnostic-special/${attemptId}`, {
    cache: "no-store",
  });
  if (!resp.ok) {
    const body = await resp.json().catch(() => null);
    throw new Error(body?.error?.message ?? "专项练习加载失败");
  }
  const payload = (await resp.json()) as PracticeResponse;
  return payload;
}

export default function DiagnosticSpecialPracticePage({
  searchParams,
}: {
  searchParams?: { attempt_id?: string };
}) {
  const attemptId = searchParams?.attempt_id;
  const [practice, setPractice] = useState<PracticeResponse | null>(null);
  const [answers, setAnswers] = useState<AnswerSnapshot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; status: "correct" | "wrong" } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchSeed, setFetchSeed] = useState(0);

  const questionCount = practice?.questions.length ?? 0;
  const completed = questionCount > 0 ? answers.length >= questionCount : false;

  const currentQuestion =
    practice && currentIndex < questionCount ? practice.questions[currentIndex] : null;

  const progressPercent =
    questionCount > 0
      ? Math.min(100, Math.round((answers.length / questionCount) * 100))
      : 0;

  const loadedState = useMemo(() => {
    if (!attemptId) return null;
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(storageKey(attemptId));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredState;
    } catch {
      return null;
    }
  }, [attemptId, fetchSeed]);

  useEffect(() => {
    if (!attemptId) return;
    if (loadedState) {
      setPractice(loadedState.response);
      setAnswers(loadedState.answers);
      setCurrentIndex(Math.min(loadedState.currentIndex, loadedState.response.questions.length));
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchPractice(attemptId)
      .then((response) => {
        if (cancelled) return;
        setPractice(response);
        setAnswers([]);
        setCurrentIndex(0);
        setFeedback(null);
        setIsLoading(false);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            storageKey(attemptId),
            JSON.stringify({
              response,
              answers: [],
              currentIndex: 0,
            }),
          );
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attemptId, fetchSeed, loadedState]);

  const persistState = useCallback(() => {
    if (!attemptId || !practice) return;
    if (typeof window === "undefined") return;
    const payload: StoredState = {
      response: practice,
      answers,
      currentIndex,
    };
    window.localStorage.setItem(storageKey(attemptId), JSON.stringify(payload));
  }, [attemptId, practice, answers, currentIndex]);

  useEffect(() => {
    persistState();
  }, [persistState]);

  const handleSubmit = () => {
    if (!practice || !currentQuestion || !selectedOption || completed) return;
    const isCorrect = selectedOption === (currentQuestion.correct_answer ?? "");
    const nextAnswers = [
      ...answers,
      {
        question_uuid: currentQuestion.question_uuid,
        selected_option: selectedOption,
        is_correct: isCorrect,
      },
    ];
    setAnswers(nextAnswers);
    setCurrentIndex((prev) => Math.min(prev + 1, practice.questions.length));
    setFeedback({
      message: isCorrect
        ? "回答正确，继续保持！"
        : `正确答案：${currentQuestion.correct_answer ?? "待补充"}`,
      status: isCorrect ? "correct" : "wrong",
    });
    setSelectedOption(null);
  };

  const handleRestart = () => {
    if (!attemptId) return;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey(attemptId));
    }
    setPractice(null);
    setAnswers([]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setFeedback(null);
    setFetchSeed((prev) => prev + 1);
  };

  const correctCount = answers.filter((answer) => answer.is_correct).length;
  const displayRisk = practice?.risk_level ?? "medium";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">专项练习</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">薄弱点专项练习</h1>
          <p className="mt-3 text-sm text-slate-600">
            本套练习只选用本次诊断中识别出的薄弱知识点，预计 15–20 分钟完成，不重复诊断题。
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">
              {RISK_LABELS[displayRisk]}
            </span>
            <span className="text-slate-500">{practice?.risk_alert}</span>
          </div>
        </section>

        {practice && (
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <p>答题进度</p>
              <p>
                {answers.length} / {practice.questions.length} 题
              </p>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </section>
        )}

        {isLoading && (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
            加载中，请稍候…
          </section>
        )}

        {error && (
          <section className="rounded-3xl border border-red-200 bg-red-50 px-6 py-6 text-sm text-red-700">
            {error}
          </section>
        )}

        {practice && questionCount === 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 text-sm text-slate-500 shadow">
            当前暂无符合薄弱点的专项题目，稍后可刷新或返回诊断结果查看最新分析。
            <div className="mt-3">
              <Link
                href={`/diagnostic/result?attempt_id=${attemptId}`}
                className="text-xs font-semibold text-blue-600"
              >
                返回诊断结果页面
              </Link>
            </div>
          </section>
        )}

        {practice && !completed && currentQuestion && (
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              题目 {currentIndex + 1} / {practice.questions.length}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">{currentQuestion.stem}</h2>
            <div className="mt-4 space-y-3">
              {Object.entries(currentQuestion.options ?? {}).map(([key, value]) => {
                const isSelected = selectedOption === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedOption(key)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="mr-3 font-semibold">{key}.</span>
                    <span>{value}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleSubmit}
                disabled={!selectedOption}
                className="rounded-2xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                提交答案
              </button>
              {feedback && (
                <p
                  className={`text-sm font-semibold ${
                    feedback.status === "correct" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {feedback.message}
                </p>
              )}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              答错题自动加入复习队列，不在当前页面反复讲解。
            </p>
          </section>
        )}

        {practice && completed && (
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow">
            <h2 className="text-xl font-semibold text-slate-900">专项完成</h2>
            <p className="mt-2 text-sm text-slate-600">
              本次专项练习共 {practice.questions.length} 题，正确率{" "}
              {practice.questions.length
                ? `${Math.round((correctCount / practice.questions.length) * 100)}%`
                : "0%"}
              。
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleRestart}
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white"
              >
                继续补强
              </button>
              <Link
                href="/wrong-questions"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600"
              >
                查看错题
              </Link>
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-500">
          系统会自动安排复习，确保薄弱题目长期进入你的复习队列。
        </section>
      </div>
    </div>
  );
}

