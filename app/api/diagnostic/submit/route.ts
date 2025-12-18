import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/postgres";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let payload: { attempt_id?: string } | undefined;
  let requestBody: unknown = null;

  try {
    payload = await request.json();
    requestBody = payload;
  } catch (error) {
    console.error("diagnostic submit payload parsing failed", error);
    return NextResponse.json(
      { error: { code: "INVALID_PAYLOAD", message: "请求体解析失败" } },
      { status: 400 },
    );
  }

  const attemptId = payload?.attempt_id;
  if (!attemptId) {
    return NextResponse.json(
      { error: { code: "MISSING_ATTEMPT_ID", message: "attempt_id 为必填项" } },
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
      [attemptId],
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
        { error: { code: "ALREADY_COMPLETED", message: "诊断已提交" } },
        { status: 409 },
      );
    }

    const answersResult = await client.query<{
      user_answer: string | null;
      answer: string | null;
    }>(
      `
        SELECT
          a.user_answer,
          q.answer
        FROM public.diagnostic_attempt_answers a
        LEFT JOIN public.diagnostic_questions q
          ON q.id::text = a.question_id
        WHERE a.attempt_id = $1
      `,
      [attemptId],
    );

    const answeredCount = answersResult.rowCount;
    const correctCount = answersResult.rows.filter(
      (row) => row.user_answer && row.answer && row.user_answer === row.answer,
    ).length;

    await client.query(
      `
        UPDATE public.diagnostic_attempts
        SET
          status = 'completed',
          completed_at = now(),
          total_questions = $1,
          correct_questions = $2
        WHERE id = $3
      `,
      [answeredCount, correctCount, attemptId],
    );

    return NextResponse.json({
      ok: true,
      attempt_id: attemptId,
      status: "completed",
      redirect_url: `/diagnostic/result?attempt_id=${attemptId}`,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV !== "production";
    console.error("diagnostic submit failed", {
      attemptId,
      requestBody,
      message: error instanceof Error ? error.message : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    });
    const message =
      isDev && error instanceof Error ? error.message : "提交失败，请稍后重试";
    return NextResponse.json(
      { error: { code: "SUBMIT_FAILED", message } },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

