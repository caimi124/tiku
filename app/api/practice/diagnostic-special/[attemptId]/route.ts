import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/postgres";

export const dynamic = "force-dynamic";

const TARGET_QUESTIONS = 18;
const MIN_QUESTIONS = 15;
const MAX_QUESTIONS = 20;

type AttemptRow = {
  id: string;
  certificate: string | null;
  subject: string | null;
};

type AnswerRow = {
  question_uuid: string;
  knowledge_point_code: string | null;
  knowledge_point_title: string | null;
  section_title: string | null;
  section_code: string | null;
  is_correct: boolean | null;
};

type QuestionRow = {
  question_uuid: string;
  stem: string;
  options: Record<string, string>;
  answer: string | null;
  knowledge_point_code: string | null;
  knowledge_point_title: string | null;
  section_title: string | null;
};

type PracticeQuestion = {
  question_uuid: string;
  stem: string;
  options: Record<string, string>;
  correct_answer: string | null;
  knowledge_point_title: string | null;
  section_title: string | null;
};

type WeaknessCard = {
  code: string;
  title: string;
  sectionTitle: string | null;
  accuracy: number;
  sectionCode: string | null;
};

const RISK_LEVELS = {
  high: {
    level: "high",
    alert:
      "当前水平与通过线差距较大，若不进行针对性补强，通过概率极低",
  },
  medium: {
    level: "medium",
    alert:
      "当前接近通过线，但薄弱点仍可能导致失分，建议集中补强高频考点",
  },
  low: {
    level: "low",
    alert:
      "当前已达到基本通过水平，建议巩固薄弱点以提升通过稳定性",
  },
} as const;

function classifyRisk(score: number) {
  if (score < 0.4) {
    return RISK_LEVELS.high;
  }
  if (score < 0.6) {
    return RISK_LEVELS.medium;
  }
  return RISK_LEVELS.low;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { attemptId: string } },
) {
  const attemptId = params?.attemptId;
  if (!attemptId) {
    return NextResponse.json(
      { error: { code: "MISSING_ATTEMPT_ID", message: "attempt_id required" } },
      { status: 400 },
    );
  }

  const client = await pool.connect();
  try {
    const attemptResult = await client.query<AttemptRow>(
      `
        SELECT id, certificate, subject
        FROM public.diagnostic_attempts
        WHERE id = $1
      `,
      [attemptId],
    );
    const attempt = attemptResult.rows[0];
    if (!attempt) {
      return NextResponse.json(
        { error: { code: "ATTEMPT_NOT_FOUND", message: "诊断尝试不存在" } },
        { status: 404 },
      );
    }

    const license = attempt.certificate?.trim();
    const subject = attempt.subject?.trim();
    if (!license || !subject) {
      return NextResponse.json(
        {
          error: {
            code: "ATTEMPT_INCOMPLETE",
            message: "诊断尝试缺少 license 或 subject 信息",
          },
        },
        { status: 400 },
      );
    }

    const answersResult = await client.query<AnswerRow>(
      `
        SELECT
          a.question_id::text AS question_uuid,
          q.knowledge_point_code,
          q.knowledge_point_title,
          q.section_title,
          q.section_code,
          a.is_correct
        FROM public.diagnostic_attempt_answers a
        JOIN public.diagnostic_questions q
          ON q.id::text = a.question_id::text
        WHERE a.attempt_id = $1
      `,
      [attemptId],
    );
    const answers = answersResult.rows;
    const totalAnswered = answers.length;
    const correctAnswered = answers.filter((row) => row.is_correct).length;
    const overallScore = totalAnswered > 0 ? correctAnswered / totalAnswered : 0;

    const pointsMap = new Map<
      string,
      {
        code: string;
        title: string;
        sectionTitle: string | null;
        sectionCode: string | null;
        total: number;
        correct: number;
      }
    >();
    answers.forEach((row) => {
      const key = row.knowledge_point_code?.trim() ?? row.question_uuid;
      const point =
        pointsMap.get(key) ?? {
          code: key,
          title: row.knowledge_point_title ?? "其他",
          sectionTitle: row.section_title ?? null,
          sectionCode: row.section_code ?? null,
          total: 0,
          correct: 0,
        };
      point.total += 1;
      if (row.is_correct) {
        point.correct += 1;
      }
      pointsMap.set(key, point);
    });

    const points = Array.from(pointsMap.values())
      .map((point) => ({
        ...point,
        accuracy: point.total > 0 ? point.correct / point.total : 0,
        wrong: point.total - point.correct,
      }))
      .sort((a, b) => (b.wrong - a.wrong) || a.code.localeCompare(b.code, "zh-CN"));

    const weaknesses = points.slice(0, 3).map((point) => ({
      code: point.code,
      title: point.title,
      sectionTitle: point.sectionTitle,
      sectionCode: point.sectionCode,
      accuracy: point.accuracy,
    }));

    const risk = classifyRisk(overallScore);

    const answeredIds = answers.map((row) => row.question_uuid);
    const knowledgePointCodes = weaknesses
      .map((w) => w.code)
      .filter((code): code is string => Boolean(code && code !== "undefined"));

    const fallbackSectionCodes = weaknesses
      .map((w) => w.sectionCode)
      .filter((code): code is string => Boolean(code));

    const uniqueQuestions: QuestionRow[] = [];
    const seenIds = new Set<string>();

    async function fetchBatch(whereClause: string, whereValues: unknown[]) {
      const baseValues: unknown[] = [license, subject, ...whereValues];
      let excludeClause = "";
      const excludeCandidates = Array.from(
        new Set([...seenIds, ...answeredIds]),
      );
      if (excludeCandidates.length) {
        excludeClause = `AND id::text <> ALL($${baseValues.length + 1})`;
        baseValues.push(excludeCandidates);
      }
      const remaining = MAX_QUESTIONS - uniqueQuestions.length;
      const limit = Math.min(remaining, MAX_QUESTIONS);
      if (limit <= 0) {
        return;
      }
      const limitParamIndex = baseValues.length + 1;
      baseValues.push(limit);
      const result = await client.query<QuestionRow>(
        `
          SELECT
            id::text AS question_uuid,
            stem,
            options,
            answer,
            knowledge_point_code,
            knowledge_point_title,
            section_title
          FROM public.diagnostic_questions
          WHERE license = $1
            AND subject = $2
            AND ${whereClause}
            ${excludeClause}
          ORDER BY random()
          LIMIT $${limitParamIndex}
        `,
        baseValues,
      );
      result.rows.forEach((row) => {
        if (!seenIds.has(row.question_uuid)) {
          seenIds.add(row.question_uuid);
          uniqueQuestions.push(row);
        }
      });
    }

    if (knowledgePointCodes.length) {
      await fetchBatch("knowledge_point_code = ANY($3)", [knowledgePointCodes]);
    }

    if (uniqueQuestions.length < MIN_QUESTIONS && fallbackSectionCodes.length) {
      await fetchBatch("section_code = ANY($3)", [fallbackSectionCodes]);
    }

    if (uniqueQuestions.length < MIN_QUESTIONS) {
      await fetchBatch("TRUE", []);
    }

    const selected = uniqueQuestions.slice(0, MAX_QUESTIONS);

    const questions: PracticeQuestion[] = selected.map((row) => ({
      question_uuid: row.question_uuid,
      stem: row.stem,
      options: row.options ?? {},
      correct_answer: row.answer ?? null,
      knowledge_point_title: row.knowledge_point_title,
      section_title: row.section_title,
    }));

    return NextResponse.json({
      attempt_id: attemptId,
      total: questions.length,
      target: TARGET_QUESTIONS,
      risk_level: risk.level,
      risk_alert: risk.alert,
      weaknesses,
      questions,
      score: overallScore,
      completed_correct: correctAnswered,
      completed_total: totalAnswered,
    });
  } catch (error) {
    console.error("diagnostic special practice load failed", {
      attemptId,
      error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: { code: "PRACTICE_LOAD_FAILED", message: "专项练习加载失败" } },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

