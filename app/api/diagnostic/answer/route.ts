import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/postgres";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let payload:
    | {
        attempt_id?: string;
        question_uuid?: string;
        selected_option?: string;
        chapter_code?: string;
        section_code?: string;
        knowledge_point_code?: string;
        answered_at?: string;
        time_spent_sec?: number;
      }
    | undefined;
  let requestBody: unknown = null;

  try {
    payload = await request.json();
    requestBody = payload;
  } catch (error) {
    console.error("diagnostic answer payload parsing failed", error);
    return NextResponse.json(
      { error: { code: "INVALID_PAYLOAD", message: "请求体解析失败" } },
      { status: 400 },
    );
  }

  const {
    attempt_id,
    question_uuid,
    selected_option,
    chapter_code,
    section_code,
    knowledge_point_code,
  } = payload ?? {};

  if (!attempt_id || !question_uuid || !selected_option) {
    return NextResponse.json(
      { error: { code: "MISSING_FIELDS", message: "缺少必要字段" } },
      { status: 400 },
    );
  }

  const client = await pool.connect();
  try {
    const attemptResult = await client.query<{ status: string }>(
      `
        SELECT status
        FROM public.diagnostic_attempts
        WHERE id = $1
      `,
      [attempt_id],
    );
    const attempt = attemptResult.rows[0];
    if (!attempt) {
      return NextResponse.json(
        { error: { code: "ATTEMPT_NOT_FOUND", message: "未找到诊断尝试" } },
        { status: 404 },
      );
    }
    if (attempt.status === "completed") {
      return NextResponse.json(
        { error: { code: "ATTEMPT_COMPLETED", message: "诊断尝试已完成" } },
        { status: 409 },
      );
    }

    await client.query(
      `
        INSERT INTO public.diagnostic_attempt_answers (
          attempt_id,
          question_id,
          chapter_code,
          section_code,
          knowledge_point_code,
          user_answer
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (attempt_id, question_id)
        DO UPDATE SET
          chapter_code = COALESCE(EXCLUDED.chapter_code, public.diagnostic_attempt_answers.chapter_code),
          section_code = COALESCE(EXCLUDED.section_code, public.diagnostic_attempt_answers.section_code),
          knowledge_point_code = COALESCE(EXCLUDED.knowledge_point_code, public.diagnostic_attempt_answers.knowledge_point_code),
          user_answer = EXCLUDED.user_answer
      `,
      [
        attempt_id,
        question_uuid,
        chapter_code ?? null,
        section_code ?? null,
        knowledge_point_code ?? null,
        selected_option,
      ],
    );

    return NextResponse.json({ ok: true, attempt_id, question_uuid, saved: true });
  } catch (error) {
    const isDev = process.env.NODE_ENV !== "production";
    console.error("diagnostic answer save failed", {
      attemptId: attempt_id,
      requestBody,
      message: error instanceof Error ? error.message : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    });
    const message =
      isDev && error instanceof Error ? error.message : "保存失败，请稍后再试";
    return NextResponse.json(
      { error: { code: "ANSWER_FAILED", message } },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

