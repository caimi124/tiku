"use server";

import pool from "@/lib/postgres";

const LEVELS = {
  mastered: "mastered",
  borderline: "borderline",
  weak: "weak",
} as const;

function laplaceScore(correct: number, total: number) {
  return (correct + 1) / (total + 2);
}

function classifyLevel(score: number) {
  if (score >= 0.75) return LEVELS.mastered;
  if (score >= 0.55) return LEVELS.borderline;
  return LEVELS.weak;
}

type AttemptRow = {
  id: string;
  certificate: string | null;
  subject: string | null;
  chapter_code: string | null;
  chapter_title: string | null;
  total_questions: number | null;
  correct_questions: number | null;
};

type AnswerRow = {
  section_code: string | null;
  section_title: string | null;
  knowledge_point_code: string | null;
  knowledge_point_title: string | null;
  is_correct: boolean | null;
  is_high_frequency: boolean | null;
};

type SectionStat = {
  code: string;
  title: string;
  total: number;
  correct: number;
  weightSum: number;
  weightedScoreSum: number;
  score: number;
};

type PointStat = {
  code: string;
  title: string;
  sectionCode: string;
  sectionTitle: string;
  total: number;
  correct: number;
  score: number;
  level: string;
  highFrequency: boolean;
};

type ReportResult = {
  attempt: AttemptRow;
  report: any;
};

export async function generateAttemptReport(attemptId: string): Promise<ReportResult | null> {
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
          total_questions,
          correct_questions
        FROM public.diagnostic_attempts
        WHERE id = $1
      `,
      [attemptId],
    );
    const attempt = attemptResult.rows[0];
    if (!attempt) {
      return null;
    }

    const answersResult = await client.query<AnswerRow>(
      `
        SELECT
          section_code,
          section_title,
          knowledge_point_code,
          knowledge_point_title,
          is_correct,
          is_high_frequency
        FROM public.diagnostic_attempt_answers
        WHERE attempt_id = $1
      `,
      [attemptId],
    );

    const answers = answersResult.rows;
    const totalAnswered = answers.length;
    const correctAnswered = answers.filter((a) => a.is_correct).length;
    const overallScore =
      totalAnswered > 0 ? correctAnswered / totalAnswered : 0;

    const pointMap = new Map<string, PointStat>();
    answers.forEach((row) => {
      if (!row.knowledge_point_code) {
        return;
      }
      const existing = pointMap.get(row.knowledge_point_code);
      if (!existing) {
        pointMap.set(row.knowledge_point_code, {
          code: row.knowledge_point_code,
          title: row.knowledge_point_title || "",
          sectionCode: row.section_code || "",
          sectionTitle: row.section_title || "",
          total: 1,
          correct: row.is_correct ? 1 : 0,
          score: 0,
          level: LEVELS.weak,
          highFrequency: Boolean(row.is_high_frequency),
        });
        return;
      }
      existing.total += 1;
      if (row.is_correct) {
        existing.correct += 1;
      }
      existing.highFrequency = existing.highFrequency || Boolean(row.is_high_frequency);
    });

    pointMap.forEach((stat) => {
      stat.score = laplaceScore(stat.correct, stat.total);
      stat.level = classifyLevel(stat.score);
    });

    const sectionMap = new Map<string, SectionStat>();
    pointMap.forEach((point) => {
      const weightMultiplier = point.highFrequency ? 1.2 : 1;
      const weight = point.total * weightMultiplier;
      const existing = sectionMap.get(point.sectionCode);
      if (!existing) {
        sectionMap.set(point.sectionCode, {
          code: point.sectionCode,
          title: point.sectionTitle,
          total: point.total,
          correct: point.correct,
          weightSum: weight,
          weightedScoreSum: point.score * weight,
          score: 0,
        });
        return;
      }
      existing.total += point.total;
      existing.correct += point.correct;
      existing.weightSum += weight;
      existing.weightedScoreSum += point.score * weight;
    });

    sectionMap.forEach((section) => {
      section.score =
        section.weightSum > 0 ? section.weightedScoreSum / section.weightSum : 0;
    });

    const sections = Array.from(sectionMap.values()).sort((a, b) =>
      a.code.localeCompare(b.code, "zh-CN"),
    );

    const sectionWeightTotal = sections.reduce(
      (sum, section) => sum + section.total,
      0,
    );
    const chapterScore =
      sectionWeightTotal > 0
        ? sections.reduce(
            (sum, section) => sum + section.score * section.total,
            0,
          ) / sectionWeightTotal
        : 0;

    const points = Array.from(pointMap.values()).sort((a, b) =>
      a.code.localeCompare(b.code, "zh-CN"),
    );

    const testedPoints = points.length;
    const masteredPoints = points.filter(
      (point) => point.level === LEVELS.mastered,
    ).length;

    let totalPointsInScope = 0;
    if (attempt.chapter_code) {
      const scopeResult = await client.query<{ count: string }>(
        `
          SELECT COUNT(*)::text AS count
          FROM public.knowledge_tree
          WHERE node_type = 'point'
            AND code LIKE $1
        `,
        [`${attempt.chapter_code}.%`],
      );
      totalPointsInScope = Number(scopeResult.rows[0]?.count ?? 0);
    }

    const coverageHitRate =
      totalPointsInScope > 0 ? testedPoints / totalPointsInScope : 0;
    const masteryHitRate =
      testedPoints > 0 ? masteredPoints / testedPoints : 0;

    const recommendations = points
      .filter((point) => point.total >= 1)
      .sort((a, b) => {
        if (a.score === b.score) {
          return a.code.localeCompare(b.code, "zh-CN");
        }
        return a.score - b.score;
      })
      .slice(0, 3)
      .map((point) => ({
        target: point.code,
        reason: point.level,
        next_action: "学习该考点内容，并完成2道巩固题",
      }));

    const report = {
      attempt_id: attempt.id,
      scope: {
        certificate: attempt.certificate,
        subject: attempt.subject,
        chapter_code: attempt.chapter_code,
        chapter_title: attempt.chapter_title,
      },
      overall: {
        score: overallScore,
        correct: correctAnswered,
        total: totalAnswered,
      },
      chapters: [
        {
          chapter_code: attempt.chapter_code,
          chapter_title: attempt.chapter_title,
          score: chapterScore,
          correct: sections.reduce((sum, section) => sum + section.correct, 0),
          total: sectionWeightTotal,
        },
      ],
      sections: sections.map((section) => ({
        section_code: section.code,
        section_title: section.title,
        score: section.score,
        correct: section.correct,
        total: section.total,
      })),
      points: points.map((point) => ({
        point_code: point.code,
        point_title: point.title,
        score: point.score,
        level: point.level,
        correct: point.correct,
        total: point.total,
      })),
      coverage: {
        tested_points: testedPoints,
        total_points_in_scope: totalPointsInScope,
        coverage_hit_rate: coverageHitRate,
        mastered_points: masteredPoints,
        mastery_hit_rate: masteryHitRate,
      },
      recommendations,
    };

    return { attempt, report };
  } finally {
    client.release();
  }
}

