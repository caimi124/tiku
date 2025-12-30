import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { extractChapterId, resolveChapterName } from "@/lib/chapterUtils";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

type AttemptRow = {
  id: string;
  status: string | null;
  started_at: string | null;
  completed_at: string | null;
  certificate: string | null;
  subject: string | null;
};

type AnswerRow = {
  question_uuid: string;
  chapter_code: string | null;
  section_code: string | null;
  section_title: string | null;
  knowledge_point_code: string | null;
  knowledge_point_title: string | null;
  is_correct: boolean | null;
  user_answer: string | null;
  correct_answer: string | null;
  explanation: string | null;
  stem: string | null;
  options: Record<string, string> | null;
  created_at: string | null;
  knowledge_point_id: string | null;
  knowledge_point_name: string | null;
  point_name: string | null;
  point_type: string | null;
};

function resolvePointTitle(row: AnswerRow, isDev: boolean) {
  const candidates = [
    row.point_name,
    row.knowledge_point_name,
    row.knowledge_point_title,
    row.knowledge_point_code,
    row.section_title,
  ];
  for (const candidate of candidates) {
    if (candidate && candidate.trim()) {
      return candidate.trim();
    }
  }
  const fallbackCode = row.knowledge_point_code ?? row.section_code ?? row.question_uuid;
  if (!fallbackCode) {
    return isDev ? "未命名考点(unknown)" : "考点待匹配";
  }
  return isDev ? `未命名考点(${fallbackCode})` : fallbackCode;
}

function deriveChapterMeta(row: AnswerRow) {
  const chapterId =
    extractChapterId(row.chapter_code) ??
    extractChapterId(row.section_code) ??
    extractChapterId(row.knowledge_point_code) ??
    null;
  const chapterName = resolveChapterName(chapterId, row.section_title ?? null);
  return { chapterId, chapterName };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { attemptId: string } },
) {
  const attemptId = params?.attemptId;
  if (!attemptId) {
    return NextResponse.json(
      { error: { code: "INVALID_ATTEMPT_ID", message: "attempt_id required" } },
      { status: 400 },
    );
  }

  const client = await pool.connect();
  try {
    const attemptResult = await client.query<AttemptRow>(
      `
        SELECT
          id,
          status,
          started_at,
          completed_at,
          certificate,
          subject
        FROM public.diagnostic_attempts
        WHERE id = $1
      `,
      [attemptId],
    );

    const attempt = attemptResult.rows[0];
    if (!attempt) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "诊断尝试不存在" } },
        { status: 404 },
      );
    }

    const answersResult = await client.query<AnswerRow>(
      `
        SELECT
          a.question_id AS question_uuid,
          a.chapter_code,
          a.section_code,
          a.section_title,
          a.knowledge_point_code,
          a.knowledge_point_title,
          a.is_correct,
          a.user_answer,
          q.answer AS correct_answer,
          q.explanation,
          q.stem,
          q.options,
          a.created_at,
          kt.id AS knowledge_point_id,
          kt.title AS point_name,
          kt.title AS knowledge_point_name,
          kt.point_type
        FROM public.diagnostic_attempt_answers a
        JOIN public.diagnostic_questions q
          ON q.id::text = a.question_id
        LEFT JOIN public.knowledge_tree kt
          ON kt.code = a.knowledge_point_code
        WHERE a.attempt_id = $1
        ORDER BY a.created_at ASC
      `,
      [attemptId],
    );

    const isDevelopment = process.env.NODE_ENV !== "production";
    const answers = answersResult.rows.filter((row) => row.question_uuid);

    const questions = answers.map((row, index) => {
      const { chapterId, chapterName } = deriveChapterMeta(row);
      const pointTitle = resolvePointTitle(row, isDevelopment);
      return {
        index: index + 1,
        question_uuid: row.question_uuid,
        stem: row.stem,
        options: row.options ?? {},
        user_answer: row.user_answer,
        correct_answer: row.correct_answer,
        explanation: row.explanation,
        is_correct: Boolean(row.is_correct),
        chapter_id: chapterId,
        chapter_name: chapterName,
        chapter_code: row.chapter_code,
        section_code: row.section_code,
        section_title: row.section_title ?? chapterName ?? "章节待匹配",
        point_code: row.knowledge_point_code,
        point_title: pointTitle,
        point_type: row.point_type,
      };
    });

    const summary = {
      total: questions.length,
      correct: questions.filter((question) => question.is_correct).length,
      wrong: questions.filter((question) => !question.is_correct).length,
    };

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        status: attempt.status,
        started_at: attempt.started_at,
        completed_at: attempt.completed_at,
        certificate: attempt.certificate,
        subject: attempt.subject,
      },
      summary,
      questions,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "题目解析获取失败",
        },
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

