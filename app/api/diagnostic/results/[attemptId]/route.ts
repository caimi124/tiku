export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

type AttemptRow = {
  id: string;
  certificate: string | null;
  subject: string | null;
  chapter_code: string | null;
  chapter_title: string | null;
  status: string | null;
  started_at: string | null;
  completed_at: string | null;
};

type AnswerRow = {
  question_uuid: string;
  chapter_code: string | null;
  chapter_title: string | null;
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
};

const LEVELS = {
  mastered: "mastered",
  borderline: "borderline",
  weak: "weak",
} as const;

function classifyLevel(score: number) {
  if (score >= 0.75) return LEVELS.mastered;
  if (score >= 0.55) return LEVELS.borderline;
  return LEVELS.weak;
}

type SectionStat = {
  code: string;
  title: string;
  total: number;
  correct: number;
};

type PointStat = {
  code: string;
  title: string;
  sectionCode: string;
  sectionTitle: string;
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
  level: string;
};

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
          certificate,
          subject,
          chapter_code,
          chapter_title,
          status,
          started_at,
          completed_at
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
          a.created_at
        FROM public.diagnostic_attempt_answers a
        JOIN public.diagnostic_questions q
          ON q.id::text = a.question_id
        WHERE a.attempt_id = $1
        ORDER BY a.created_at ASC
      `,
      [attemptId],
    );

    const answers = answersResult.rows.filter((row) => row.question_uuid);
    const totalAnswered = answers.length;
    const correctAnswered = answers.filter((row) => row.is_correct).length;
    const overallScore = totalAnswered > 0 ? correctAnswered / totalAnswered : 0;

    const sectionsMap = new Map<string, SectionStat>();
    const pointsMap = new Map<string, PointStat>();

    answers.forEach((row) => {
      const sectionKey = row.section_code ?? "unknown-section";
      const pointKey = row.knowledge_point_code ?? row.question_uuid;

      const section = sectionsMap.get(sectionKey) ?? {
        code: sectionKey,
        title: row.section_title ?? "其他",
        total: 0,
        correct: 0,
      };
      section.total += 1;
      if (row.is_correct) {
        section.correct += 1;
      }
      sectionsMap.set(sectionKey, section);

      const point = pointsMap.get(pointKey) ?? {
        code: pointKey,
        title: row.knowledge_point_title ?? "其他",
        sectionCode: sectionKey,
        sectionTitle: section.title,
        total: 0,
        correct: 0,
        wrong: 0,
        accuracy: 0,
        level: LEVELS.weak,
      };
      point.total += 1;
      if (row.is_correct) {
        point.correct += 1;
      } else {
        point.wrong += 1;
      }
      pointsMap.set(pointKey, point);
    });

    pointsMap.forEach((point) => {
      point.accuracy = point.total > 0 ? point.correct / point.total : 0;
      point.level = classifyLevel(point.accuracy);
    });

    const sections = Array.from(sectionsMap.values()).sort((a, b) =>
      (a.code ?? "").localeCompare(b.code ?? "", "zh-CN"),
    );
    const points = Array.from(pointsMap.values()).sort((a, b) =>
      (a.wrong - b.wrong) !== 0
        ? b.wrong - a.wrong
        : a.code.localeCompare(b.code, "zh-CN"),
    );

    const weaknesses = points.slice(0, 5);

    const questions = answers.map((row) => ({
      question_uuid: row.question_uuid,
      stem: row.stem,
      options: row.options ?? {},
      user_answer: row.user_answer,
      correct_answer: row.correct_answer,
      explanation: row.explanation,
      section_title: row.section_title,
      knowledge_point_title: row.knowledge_point_title,
      is_correct: Boolean(row.is_correct),
    }));

    const report = {
      attempt_id: attempt.id,
      ready: attempt.status === "completed",
      status: attempt.status,
      scope: {
        certificate: attempt.certificate,
        subject: attempt.subject,
        chapter_code: attempt.chapter_code,
        chapter_title: attempt.chapter_title,
      },
      summary: {
        score: overallScore,
        correct: correctAnswered,
        total: totalAnswered,
        started_at: attempt.started_at,
        completed_at: attempt.completed_at,
      },
      sections,
      points,
      weaknesses,
      questions,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("diagnostic results failed", {
      attemptId,
      message: error instanceof Error ? error.message : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "诊断报告无法生成" } },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

