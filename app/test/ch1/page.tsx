"use server";

import Link from "next/link";
import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

type DiagnosticQuestion = {
  id: string;
  question_type: string;
  stem: string;
  options: Record<string, string>;
  answer: string;
  explanation: string;
  chapter_code: string;
  chapter_title: string;
  section_code: string;
  section_title: string;
  knowledge_point_code: string;
  knowledge_point_title: string;
};

async function getChapterQuestions(): Promise<DiagnosticQuestion[]> {
  const client = await pool.connect();
  try {
    const result = await client.query<DiagnosticQuestion>(
      `
        SELECT
          id,
          question_type,
          stem,
          options,
          answer,
          explanation,
          chapter_code,
          chapter_title,
          section_code,
          section_title,
          knowledge_point_code,
          knowledge_point_title
        FROM public.diagnostic_questions
        WHERE chapter_code = 'C1'
        ORDER BY section_code ASC, knowledge_point_code ASC
      `,
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export default async function ChapterOneTestPage() {
  const questions = await getChapterQuestions();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
            Diagnostic Preview
          </p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            第一章 · 原创诊断题（测试页）
          </h1>
          <p className="mt-3 text-slate-600">
            用于快速核对数据库中的原创诊断题。该页面不会参与正式诊断流程。
          </p>
          <div className="mt-6 inline-flex gap-3 text-sm text-blue-600">
            <Link href="/" className="hover:underline">
              ← 返回首页
            </Link>
            <span>·</span>
            <Link href="/diagnostic" className="hover:underline">
              进入诊断配置
            </Link>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            尚未在数据库中找到第一章的原创诊断题。请先通过脚本或 API
            导入题目后再刷新本页。
          </div>
        ) : (
          <ol className="space-y-8">
            {questions.map((question, idx) => (
              <li
                key={question.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-500">
                  <span>{`Q${idx + 1}`}</span>
                  <span className="text-slate-300">•</span>
                  <span>{question.section_title}</span>
                  <span className="text-slate-300">•</span>
                  <span>{question.knowledge_point_title}</span>
                  <span className="text-slate-300">•</span>
                  <span>{question.question_type}</span>
                </div>

                <p className="text-lg font-medium text-slate-900">{question.stem}</p>

                <dl className="mt-4 space-y-2 text-base text-slate-700">
                  {Object.entries(question.options).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                    >
                      <dt className="font-semibold text-slate-500">{key}.</dt>
                      <dd className="flex-1">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
                  <p className="font-semibold">
                    正确答案：<span>{question.answer}</span>
                  </p>
                  <p className="mt-1 leading-relaxed">{question.explanation}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
        <div className="mt-10 text-center">
          <Link
            href="/test/ch1/practice"
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Enter Practice Mode
          </Link>
        </div>
      </div>
    </div>
  );
}