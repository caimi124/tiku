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

type QuestionRow = {
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

    let selectedQuestions: QuestionRow[] | null = null;

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
      const chapterCountsResult = await client.query<{ chapter_code: string; total: string }>(
        `
          SELECT chapter_code, COUNT(*)::text AS total
          FROM public.diagnostic_questions
          WHERE source_type = 'ai_original'
            AND license = $1
            AND subject = $2
            AND chapter_code = ANY($3)
          GROUP BY chapter_code
        `,
        [license, subject, CHAPTER_WHITELIST],
      );
      const chapterCounts = chapterCountsResult.rows.map((row) => ({
        chapter: row.chapter_code,
        count: Number(row.total),
      }));
      const totalAvailable = chapterCounts.reduce((sum, { count }) => sum + count, 0);
      if (totalAvailable === 0) {
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

      const allocations = chapterCounts.map(({ chapter, count }) => ({
        chapter,
        desired: Math.max(1, Math.round((count / totalAvailable) * QUESTIONS_PER_ATTEMPT)),
      }));

      let allocatedTotal = allocations.reduce((sum, item) => sum + item.desired, 0);
      while (allocatedTotal > QUESTIONS_PER_ATTEMPT) {
        const largest = allocations.reduce((prev, current) =>
          current.desired > prev.desired ? current : prev,
        );
        if (largest.desired > 1) {
          largest.desired -= 1;
          allocatedTotal -= 1;
        } else {
          break;
        }
      }
      while (allocatedTotal < QUESTIONS_PER_ATTEMPT) {
        const largest = allocations.reduce((prev, current) =>
          current.desired > prev.desired ? current : prev,
        );
        largest.desired += 1;
        allocatedTotal += 1;
      }

      const questionBuckets: QuestionRow[] = [];
      for (const allocation of allocations) {
        const chapterResult = await client.query<QuestionRow>(
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
            ORDER BY random()
            LIMIT $4
          `,
          [license, subject, allocation.chapter, allocation.desired],
        );
        questionBuckets.push(...chapterResult.rows);
      }

      if (questionBuckets.length < QUESTIONS_PER_ATTEMPT) {
        const fallback = await client.query<QuestionRow>(
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
            ORDER BY random()
            LIMIT $3
          `,
          [license, subject, QUESTIONS_PER_ATTEMPT],
        );
        if (fallback.rows?.length) {
          questionBuckets.push(...fallback.rows);
        }
      }

      const uniqueQuestions = [...new Map(questionBuckets.map((q) => [q.question_uuid, q])).values()];
      selectedQuestions = uniqueQuestions.slice(0, QUESTIONS_PER_ATTEMPT);
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

