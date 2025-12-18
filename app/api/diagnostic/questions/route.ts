import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/postgres";

export const dynamic = "force-dynamic";

type AttemptRow = {
  certificate: string | null;
  subject: string | null;
  chapter_code: string | null;
  chapter_title: string | null;
  metadata: unknown | null;
};

export async function GET(request: NextRequest) {
  const attemptId = request.nextUrl.searchParams.get("attempt_id");
  if (!attemptId) {
    return NextResponse.json(
      { error: { code: "MISSING_ATTEMPT_ID", message: "attempt_id 为必填项" } },
      { status: 400 },
    );
  }

  const client = await pool.connect();
  try {
    const attemptResult = await client.query<AttemptRow>(
      `
        SELECT certificate, subject, chapter_code, chapter_title, metadata
        FROM public.diagnostic_attempts
        WHERE id = $1
      `,
      [attemptId],
    );
    const attempt = attemptResult.rows[0];
    if (!attempt) {
      return NextResponse.json(
        { error: { code: "ATTEMPT_NOT_FOUND", message: "未找到诊断尝试" } },
        { status: 404 },
      );
    }

    const license = attempt.certificate?.trim();
    const subject = attempt.subject?.trim();
    if (!license || !subject) {
      return NextResponse.json(
        {
          error: {
            code: "ATTEMPT_INVALID",
            message: "诊断尝试缺少 license 或 subject 信息",
          },
        },
        { status: 400 },
      );
    }

    let metadata: Record<string, unknown> | null = null;
    if (attempt.metadata) {
      if (typeof attempt.metadata === "string") {
        try {
          metadata = JSON.parse(attempt.metadata);
        } catch (parseError) {
          console.error("diagnostic attempt metadata parse failed", {
            attemptId,
            error: parseError,
            metadata: attempt.metadata,
          });
        }
      } else if (typeof attempt.metadata === "object") {
        metadata = attempt.metadata as Record<string, unknown>;
      }
    }

    const configChapter =
      (metadata?.chapter_code as string | undefined) ??
      (metadata?.chapter as string | undefined);
    const chapterCode =
      (attempt.chapter_code?.trim() || configChapter?.trim() || "C1").toUpperCase();

    const questionsResult = await client.query<{
      question_uuid: string;
      question_type: string;
      chapter_code: string;
      chapter_title: string | null;
      section_code: string;
      section_title: string | null;
      knowledge_point_code: string;
      knowledge_point_title: string | null;
      stem: string;
      options: Record<string, string>;
    }>(
      `
        SELECT
          id::text AS question_uuid,
          question_type,
          chapter_code,
          chapter_title,
          section_code,
          section_title,
          knowledge_point_code,
          knowledge_point_title,
          stem,
          options
        FROM public.diagnostic_questions
        WHERE source_type = 'ai_original'
          AND chapter_code = $1
        ORDER BY id
      `,
      [chapterCode],
    );

    return NextResponse.json({
      attempt_id: attemptId,
      chapter_code: chapterCode,
      total: questionsResult.rowCount,
      questions: questionsResult.rows,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV !== "production";
    console.error("diagnostic questions fetch failed", {
      attemptId,
      error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    const message =
      isDev && error instanceof Error
        ? error.message
        : "题目加载失败，请稍后重试";
    return NextResponse.json(
      { error: { code: "QUESTIONS_LOAD_FAILED", message } },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

