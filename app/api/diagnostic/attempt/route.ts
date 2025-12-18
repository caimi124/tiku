import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/postgres";

const CHAPTER_META: Record<string, { title: string }> = {
  C1: { title: "第一章 精神与中枢神经系统用药" },
  C2: { title: "第二章 消化系统用药" },
};

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let payload: { license?: string; subject?: string; chapter_code?: string };
  try {
    payload = await request.json();
  } catch (error) {
    console.error("diagnostic attempt payload parsing failed", error);
    return NextResponse.json(
      { error: { code: "INVALID_PAYLOAD", message: "请求体解析失败" } },
      { status: 400 },
    );
  }

  const { license, subject, chapter_code } = payload ?? {};
  if (!license || !subject) {
    return NextResponse.json(
      { error: { code: "MISSING_FIELDS", message: "license 与 subject 为必填项" } },
      { status: 400 },
    );
  }

  const chapterCode = chapter_code?.trim() || "C1";
  const chapterTitle = CHAPTER_META[chapterCode]?.title ?? null;
  const attemptId = randomUUID();
  const startedAt = new Date().toISOString();

  const client = await pool.connect();
  try {
    await client.query(
      `
        INSERT INTO public.diagnostic_attempts (
          id,
          certificate,
          subject,
          chapter_code,
          chapter_title,
          status,
          started_at
        )
        VALUES ($1, $2, $3, $4, $5, 'in_progress', $6)
      `,
      [attemptId, license, subject, chapterCode, chapterTitle, startedAt],
    );
    return NextResponse.json({
      attempt_id: attemptId,
      license,
      subject,
      chapter_code: chapterCode,
      chapter_title: chapterTitle,
      status: "in_progress",
      started_at: startedAt,
    });
  } catch (error) {
    console.error("diagnostic attempt create failed", error);
    return NextResponse.json(
      { error: { code: "CREATE_ATTEMPT_FAILED", message: "无法创建诊断尝试" } },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

