"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import DiagnosticShell from "./_components/DiagnosticShell";
import NavButtons from "./_components/NavButtons";
import QuestionCard from "./_components/QuestionCard";

type QuestionPayload = {
  question_uuid: string;
  question_type: string;
  chapter_code: string;
  chapter_title: string;
  section_code: string;
  section_title: string;
  knowledge_point_code: string;
  stem: string;
  options: Record<string, string>;
};

const REQUIRED_OPTION_KEYS = ["A", "B", "C", "D"];
const STORAGE_PREFIX = "diagnostic-answers-";

function isQuestionValid(raw: any): raw is QuestionPayload {
  if (!raw?.question_uuid || typeof raw.question_uuid !== "string") return false;
  if (!raw?.stem || typeof raw.stem !== "string") return false;
  if (!raw?.options || typeof raw.options !== "object") return false;
  const keys = Object.keys(raw.options ?? {});
  if (!REQUIRED_OPTION_KEYS.every((key) => keys.includes(key))) return false;
  if (!raw.chapter_code || !raw.section_code || !raw.knowledge_point_code) return false;
  return true;
}

function DiagnosticQuestionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const license = searchParams.get("license");
  const subject = searchParams.get("subject");
  const chapterParam = searchParams.get("chapter_code") ?? "C1";
  const normalizedChapterCode = chapterParam.toUpperCase();
  const queryAttemptId = searchParams.get("attempt_id");

  const [attemptId, setAttemptId] = useState<string | null>(queryAttemptId);
  const [questions, setQuestions] = useState<QuestionPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [savingError, setSavingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [creationErrorDetails, setCreationErrorDetails] = useState<string | null>(null);
  const [answerDebug, setAnswerDebug] = useState<string | null>(null);
  const [submitDebug, setSubmitDebug] = useState<string | null>(null);

  const currentQuestion = questions[activeIndex];
  const currentOptionSelected = currentQuestion
    ? answers[currentQuestion.question_uuid]
    : undefined;

  useEffect(() => {
    if (!license || !subject) {
      setPageError("缺少考试方向或科目，请重新配置后再进入诊断。");
      setIsLoading(false);
      return;
    }

    if (attemptId) {
      return;
    }

    const createAttempt = async () => {
      setPageError(null);
      setCreationErrorDetails(null);
      setIsLoading(true);
      try {
        const resp = await fetch("/api/diagnostic/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license,
          subject,
          chapter_code: normalizedChapterCode,
        }),
        });
        if (!resp.ok) {
          const errorBody = await resp.text();
          const detail = `HTTP ${resp.status} ${errorBody}`;
          setCreationErrorDetails(detail);
          console.error("diagnostic attempt request failed", detail);
          throw new Error("诊断尝试创建失败，请稍后再试。");
        }
        const data = await resp.json();
        setAttemptId(data.attempt_id);
        const nextParams = new URLSearchParams(Array.from(searchParams.entries()));
        nextParams.set("license", license);
        nextParams.set("subject", subject);
        nextParams.set("attempt_id", data.attempt_id);
        nextParams.set("chapter_code", normalizedChapterCode);
        router.replace(`/diagnostic/questions?${nextParams.toString()}`);
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          setCreationErrorDetails(error.message);
        }
        setPageError("诊断尝试创建失败，请稍后再试。");
        setIsLoading(false);
      }
    };

    createAttempt();
  }, [attemptId, license, subject, router, searchParams]);

  useEffect(() => {
    if (!attemptId) return;
    let cancelled = false;

    const fetchQuestions = async () => {
      setPageError(null);
      setQuestions([]);
      setIsLoading(true);
      try {
        const resp = await fetch(`/api/diagnostic/questions?attempt_id=${attemptId}`);
        if (!resp.ok) {
          throw new Error("题目加载失败");
        }
        const data = await resp.json();
        const validated = Array.isArray(data.questions)
          ? data.questions.filter((item: any) => {
              if (!isQuestionValid(item)) {
                console.warn("跳过无效诊断题目", item?.question_uuid);
                return false;
              }
              return true;
            })
          : [];
        if (cancelled) return;
        if (validated.length === 0) {
          setPageError("诊断题目正在准备中，请稍后再试。");
        }
        setQuestions(validated as QuestionPayload[]);
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setPageError("题目加载失败，请检查网络后重试。");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchQuestions();

    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  useEffect(() => {
    if (!attemptId) return;
    const key = `${STORAGE_PREFIX}${attemptId}`;
    const stored =
      typeof window !== "undefined" && window.localStorage
        ? window.localStorage.getItem(key)
        : null;
    if (stored) {
      try {
        setAnswers(JSON.parse(stored));
      } catch {
        console.warn("诊断本地存储解析失败", stored);
      }
    }
  }, [attemptId]);

  useEffect(() => {
    if (!attemptId) return;
    window.localStorage.setItem(`${STORAGE_PREFIX}${attemptId}`, JSON.stringify(answers));
  }, [attemptId, answers]);

  const handleOptionSelect = useCallback(
    async (question: QuestionPayload, optionKey: string) => {
      setAnswers((prev) => ({
        ...prev,
        [question.question_uuid]: optionKey,
      }));
      setSavingError(null);
      setAnswerDebug(null);
      try {
        const resp = await fetch("/api/diagnostic/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attempt_id: attemptId,
            question_uuid: question.question_uuid,
            selected_option: optionKey,
            chapter_code: question.chapter_code,
            section_code: question.section_code,
            knowledge_point_code: question.knowledge_point_code,
            answered_at: new Date().toISOString(),
            time_spent_sec: 0,
          }),
        });
        if (!resp.ok) {
          const bodyText = await resp.text();
          const debug = `status ${resp.status} body ${bodyText}`;
          if (process.env.NODE_ENV !== "production") {
            setAnswerDebug(debug);
          }
          throw new Error(`HTTP ${resp.status}`);
        }
      } catch (error) {
        console.error(error);
        const message =
          error instanceof Error && error.message.startsWith("HTTP")
            ? error.message
            : "保存失败，已在本地暂存，网络恢复会自动重试。";
        setSavingError(message);
      }
    },
    [attemptId],
  );

  const handleSubmit = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    try {
      const resp = await fetch("/api/diagnostic/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attempt_id: attemptId }),
      });
      if (!resp.ok) {
        const bodyText = await resp.text();
        const debug = `status ${resp.status} body ${bodyText}`;
        if (process.env.NODE_ENV !== "production") {
          setSubmitDebug(debug);
        }
        throw new Error(`HTTP ${resp.status}`);
      }
      const data = await resp.json();
      setSubmitDebug(null);
      router.push(`/diagnostic/result?attempt_id=${data.attempt_id}`);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error && error.message.startsWith("HTTP")
          ? error.message
          : "提交失败，请稍后重试。";
      setPageError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const goToPrev = () => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToNext = () => {
    setActiveIndex((prev) => Math.min(prev + 1, Math.max(0, questions.length - 1)));
  };

  const emptyQuestions = !isLoading && questions.length === 0;

  return (
    <DiagnosticShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold tracking-[0.3em] text-blue-500">AI 诊断题</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">AI 诊断题</h1>
          <p className="text-sm text-gray-500">本诊断聚焦高频考点</p>
        </div>

        {pageError ? (
          <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-base text-gray-700">{pageError}</p>
            <Link
              href="/diagnostic"
              className="inline-flex items-center justify-center rounded-2xl border border-blue-500 px-6 py-3 text-sm font-semibold text-blue-600"
            >
              返回诊断设置
            </Link>
            {creationErrorDetails && (
              <p className="text-xs text-gray-500">调试信息：{creationErrorDetails}</p>
            )}
          </div>
        ) : (
          <>
            {savingError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {savingError}
              </div>
            )}
            {answerDebug && process.env.NODE_ENV !== "production" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">
                <p className="font-semibold">Debug (answer response)</p>
                <p className="whitespace-pre-wrap">{answerDebug}</p>
              </div>
            )}

            {isLoading ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-gray-600">
                正在加载题目，请稍候……
              </div>
            ) : emptyQuestions ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-700">
                <p>诊断题目正在准备中，请稍后再试。</p>
                <Link className="mt-3 inline-flex text-blue-600" href="/diagnostic">
                  返回诊断设置
                </Link>
              </div>
            ) : (
              currentQuestion && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      第 {activeIndex + 1} / {questions.length} 题
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentQuestion.chapter_title} · {currentQuestion.section_title}
                    </p>
                  </div>

                  <QuestionCard
                    question={currentQuestion}
                    selectedOption={currentOptionSelected}
                    onSelect={(optionKey) => handleOptionSelect(currentQuestion, optionKey)}
                  />

                  <NavButtons
                    onPrev={goToPrev}
                    onNext={goToNext}
                    onSubmit={handleSubmit}
                    isFirst={activeIndex === 0}
                    isLast={activeIndex === questions.length - 1}
                    nextDisabled={!currentOptionSelected}
                    submitting={submitting}
                  />
                  {submitDebug && process.env.NODE_ENV !== "production" && (
                    <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">
                      <p className="font-semibold">Debug (submit response)</p>
                      <p className="whitespace-pre-wrap">{submitDebug}</p>
                    </div>
                  )}
                </div>
              )
            )}
          </>
        )}
        <p className="text-xs text-gray-500">提示：本次为诊断题，不计入刷题记录</p>
      </div>
    </DiagnosticShell>
  );
}

export default function DiagnosticQuestionsPage() {
  return (
    <Suspense
      fallback={
        <DiagnosticShell>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-gray-600">
            正在准备诊断题，请稍候……
          </div>
        </DiagnosticShell>
      }
    >
      <DiagnosticQuestionsContent />
    </Suspense>
  );
}

