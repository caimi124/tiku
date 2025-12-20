import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/postgres";
import {
  CHAPTER_META,
  SUBJECT_CONFIG,
} from "@/lib/diagnostic/constants";
import { getSubjectQuestionCount } from "@/lib/diagnostic/question-bank";

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

  const licenseKey = license.trim().toLowerCase();
  const subjectKey = subject.trim().toLowerCase();
  const subjectConfig = SUBJECT_CONFIG[subjectKey as keyof typeof SUBJECT_CONFIG];
  if (
    !subjectConfig ||
    subjectConfig.license !== licenseKey ||
    !subjectConfig.available
  ) {
    return NextResponse.json(
      {
        error: {
          code: "SUBJECT_NOT_READY",
          message: "该科目题库正在准备中，敬请期待",
        },
      },
      { status: 409 },
    );
  }

  const requestedChapterCode = chapter_code?.trim()?.toUpperCase() || null;
  const chapterCodeForInsert = requestedChapterCode ?? "ALL";
  const chapterTitle = requestedChapterCode
    ? CHAPTER_META[requestedChapterCode]?.title ?? null
    : "全部章节";
  const attemptId = randomUUID();
  const startedAt = new Date().toISOString();
  const metadataPayload = JSON.stringify({ chapter_code: requestedChapterCode });

  const client = await pool.connect();
  try {
    const subjectQuestionCount = await getSubjectQuestionCount(
      client,
      licenseKey,
      subjectKey,
    );
    if (subjectQuestionCount === 0) {
      return NextResponse.json(
        {
          error: {
            code: "SUBJECT_NOT_READY",
            message: "该科目题库正在准备中，请稍后再试。",
          },
        },
        { status: 409 },
      );
    }

    await client.query(
      `
        INSERT INTO public.diagnostic_attempts (
          id,
          certificate,
          subject,
          chapter_code,
          chapter_title,
          metadata,
          status,
          started_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'in_progress', $7)
      `,
      [
        attemptId,
        licenseKey,
        subjectKey,
        chapterCodeForInsert,
        chapterTitle,
        metadataPayload,
        startedAt,
      ],
    );
    return NextResponse.json({
      attempt_id: attemptId,
      license,
      subject,
      chapter_code: requestedChapterCode,
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

