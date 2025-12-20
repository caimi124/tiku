import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/postgres";

export const dynamic = "force-dynamic";

const CHAPTER_WHITELIST = [
  "C1",
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "C7",
  "C8",
  "C9",
  "C10",
  "C11",
  "C12",
  "C13",
];

const QUESTIONS_PER_ATTEMPT = Number(process.env.DIAGNOSTIC_QUESTIONS_PER_ATTEMPT) || 18;
const QUESTIONS_PER_CHAPTER = Number(process.env.DIAGNOSTIC_PER_CHAPTER_LIMIT) || 2;

type AttemptRow = {
  certificate: string | null;
  subject: string | null;
  chapter_code: string | null;
  chapter_title: string | null;
  metadata: unknown | null;
};

function parseMetadata(raw: unknown): Record<string, unknown> | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error("diagnostic attempt metadata parse failed", { error });
      return null;
    }
  }
  if (typeof raw === "object") {
    return raw as Record<string, unknown>;
  }
  return null;
}

function shuffleArray<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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

    const metadata = parseMetadata(attempt.metadata);
    const candidateChapter =
      typeof metadata?.chapter_code === "string" && metadata.chapter_code.trim()
        ? metadata.chapter_code.trim().toUpperCase()
        : null;
    const requestedChapter = candidateChapter === "ALL" ? null : candidateChapter;
    const storedChapter = attempt.chapter_code?.trim()?.toUpperCase() ?? null;
    const targetChapter =
      requestedChapter || (storedChapter && storedChapter !== "ALL" ? storedChapter : null);

    const subjectReadyResult = await client.query(
      `
        SELECT 1 FROM public.diagnostic_questions
        WHERE license = $1 AND subject = $2
        LIMIT 1
      `,
      [license, subject],
    );
    if (subjectReadyResult.rowCount === 0) {
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

    const candidateIds = metadata?.question_ids;
    const cachedIds =
      Array.isArray(candidateIds) && candidateIds.every((id) => typeof id === "string")
        ? (candidateIds as string[])
        : null;

    if (cachedIds?.length) {
      const cachedResult = await client.query<
        {
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
        }
      >(
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
          WHERE id::text = ANY($1)
            AND license = $2
            AND subject = $3
          ORDER BY array_position($1, id::text)
        `,
        [cachedIds, license, subject],
      );
      if (cachedResult.rowCount === cachedIds.length) {
        return NextResponse.json({
          attempt_id: attemptId,
          chapter_code: targetChapter,
          total: cachedResult.rowCount,
          questions: cachedResult.rows,
        });
      }
    }

    async function updateMetadata(questionIds: string[]) {
      const nextMetadata = {
        ...(metadata ?? {}),
        chapter_code: requestedChapter ?? null,
        question_ids: questionIds,
      };
      await client.query(
        `
          UPDATE public.diagnostic_attempts
          SET metadata = $1
          WHERE id = $2
        `,
        [JSON.stringify(nextMetadata), attemptId],
      );
    }

    let selectedQuestions:
      | {
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
        }[]
      | null = null;

    if (targetChapter) {
      if (!CHAPTER_WHITELIST.includes(targetChapter)) {
        return NextResponse.json(
          {
            error: {
              code: "CHAPTER_NOT_FOUND",
              message: "所选章节不存在或尚未开放。",
            },
          },
          { status: 404 },
        );
      }
      const chapterResult = await client.query<
        {
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
        }
      >(
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
            AND license = $1
            AND subject = $2
            AND chapter_code = $3
          ORDER BY id
        `,
        [license, subject, targetChapter],
      );
      if (chapterResult.rowCount === 0) {
        return NextResponse.json(
          {
            error: {
              code: "CHAPTER_NOT_READY",
              message: "所选章节题库正在准备中，请稍后再试。",
            },
          },
          { status: 409 },
        );
      }
      selectedQuestions = chapterResult.rows;
    } else {
      const randomResult = await client.query<
        {
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
        }
      >(
        `
          SELECT
            question_uuid,
            question_type,
            chapter_code,
            chapter_title,
            section_code,
            section_title,
            knowledge_point_code,
            knowledge_point_title,
            stem,
            options
          FROM (
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
              options,
              ROW_NUMBER() OVER (PARTITION BY chapter_code ORDER BY random()) AS rn
            FROM public.diagnostic_questions
            WHERE source_type = 'ai_original'
              AND license = $1
              AND subject = $2
              AND chapter_code = ANY($3)
          ) sub
          WHERE rn <= $4
        `,
        [license, subject, CHAPTER_WHITELIST, QUESTIONS_PER_CHAPTER],
      );
      if (randomResult.rowCount === 0) {
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
      const shuffled = shuffleArray(randomResult.rows);
      selectedQuestions = shuffled.slice(0, QUESTIONS_PER_ATTEMPT);
    }

    const questionIds = selectedQuestions.map((question) => question.question_uuid);
    await updateMetadata(questionIds);

    return NextResponse.json({
      attempt_id: attemptId,
      chapter_code: targetChapter,
      total: selectedQuestions.length,
      questions: selectedQuestions,
    });
  } catch (error) {
    console.error("diagnostic questions fetch failed", {
      attemptId,
      error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: { code: "QUESTIONS_LOAD_FAILED", message: "题目加载失败，请稍后重试" } },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

