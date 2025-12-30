export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { calculateRecommendationPriority } from "@/lib/recommendationPriority";
import { getChapterDisplayName } from "@/lib/chapterNames";
import { recoLogger } from "@/lib/logger";

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
  knowledge_point_id: string | null;
  knowledge_point_name: string | null;
  point_name: string | null;
  importance_level: number | null;
  learn_mode: "MEMORIZE" | "PRACTICE" | "BOTH" | null;
  point_type: string | null;
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

function resolvePointTitle(point: PointStat, isDev: boolean) {
  const candidates = [
    point.point_name,
    point.knowledge_point_name,
    point.title,
    point.knowledge_point_code,
    point.code,
  ];
  for (const candidate of candidates) {
    if (candidate && candidate.trim()) {
      return candidate.trim();
    }
  }
  const fallbackCode = point.code ?? point.knowledge_point_code ?? "未命名";
  return isDev ? `未命名考点(${fallbackCode})` : fallbackCode;
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
  knowledge_point_id?: string;
  knowledge_point_name?: string;
  point_name?: string;
  importance_level?: number;
  learn_mode?: "MEMORIZE" | "PRACTICE" | "BOTH";
  chapterName?: string;
  chapterId?: number | null;
  chapterWeight?: number;
  pointType?: string | null;
  pointTypeWeight?: number;
  pointTitle?: string;
  displayTitle?: string;
  baseWeaknessScore?: number;
  priority?: number;
  knowledge_point_code?: string;
};

function extractChapterId(code?: string | null) {
  if (!code) return null;
  const normalized = code.trim();
  const match = normalized.match(/C?(\d+)/i);
  if (match && match[1]) {
    const parsed = Number.parseInt(match[1], 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  const firstSegment = normalized.split(".")[0];
  const parsedSegment = Number.parseInt(firstSegment, 10);
  return Number.isNaN(parsedSegment) ? null : parsedSegment;
}

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
          a.created_at,
          kt.id AS knowledge_point_id,
          kt.title AS point_name,
          kt.title AS knowledge_point_name,
          kt.importance AS importance_level,
          'BOTH' AS learn_mode,
          kt.point_type
        FROM public.diagnostic_attempt_answers a
        JOIN public.diagnostic_questions q
          ON q.id::text = a.question_id
        LEFT JOIN public.knowledge_tree kt
          ON kt.code = a.knowledge_point_code
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
  const isDevelopment = process.env.NODE_ENV !== "production";

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

      const pointTitle =
        row.point_name ??
        row.knowledge_point_name ??
        row.knowledge_point_title ??
        "其他";
      const point = pointsMap.get(pointKey) ?? {
        code: pointKey,
        title: pointTitle,
        sectionCode: sectionKey,
        sectionTitle: section.title,
        total: 0,
        correct: 0,
        wrong: 0,
        accuracy: 0,
        level: LEVELS.weak,
        knowledge_point_id: row.knowledge_point_id ?? undefined,
        knowledge_point_name: pointTitle,
        point_name: pointTitle,
        knowledge_point_code: row.knowledge_point_code ?? pointKey,
        importance_level: row.importance_level ?? undefined,
        learn_mode: row.learn_mode ?? "BOTH",
        chapterId:
          extractChapterId(row.chapter_code) ??
          extractChapterId(row.knowledge_point_code) ??
          extractChapterId(sectionKey),
        pointType: row.point_type ?? null,
      };
      point.total += 1;
      if (row.is_correct) {
        point.correct += 1;
      } else {
        point.wrong += 1;
      }
      if (!point.pointType && row.point_type) {
        point.pointType = row.point_type;
      }
      if (!point.chapterId) {
        point.chapterId =
          extractChapterId(row.chapter_code) ??
          extractChapterId(row.knowledge_point_code) ??
          extractChapterId(sectionKey) ??
          extractChapterId(point.code);
      }
      pointsMap.set(pointKey, point);
    });

    // Feature flag: 是否启用权重推荐
    const WEIGHTED_ENABLED = process.env.RECO_WEIGHTED_ENABLED !== "false";

    pointsMap.forEach((point) => {
      point.accuracy = point.total > 0 ? point.correct / point.total : 0;
      point.level = classifyLevel(point.accuracy);
      point.chapterId =
        point.chapterId ??
        extractChapterId(point.sectionCode) ??
        extractChapterId(point.code);
      const baseWeaknessScore = 1 - (point.accuracy ?? 0);
      point.baseWeaknessScore = Number.isNaN(baseWeaknessScore) ? 0 : baseWeaknessScore;

      if (WEIGHTED_ENABLED) {
        const { priority, chapterWeight, pointTypeWeight } = calculateRecommendationPriority(
          point.baseWeaknessScore ?? 0,
          point.chapterId,
          point.pointType,
        );
        point.priority = priority;
        point.chapterWeight = chapterWeight;
        point.pointTypeWeight = pointTypeWeight;
      } else {
        // 回退旧排序：仅使用 baseWeaknessScore
        point.priority = point.baseWeaknessScore ?? 0;
        point.chapterWeight = 1;
        point.pointTypeWeight = 1;
      }
    });

    const sections = Array.from(sectionsMap.values()).sort((a, b) =>
      (a.code ?? "").localeCompare(b.code ?? "", "zh-CN"),
    );
    const points = Array.from(pointsMap.values()).sort((a, b) => {
      const priorityDiff = (b.priority ?? 0) - (a.priority ?? 0);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      if ((b.wrong ?? 0) - (a.wrong ?? 0) !== 0) {
        return (b.wrong ?? 0) - (a.wrong ?? 0);
      }
      return a.code.localeCompare(b.code, "zh-CN");
    });

    const weaknesses = points.slice(0, 3);

    // 监控统计：Top3 数据质量（仅服务端日志，不返回前端）
    const stats = {
      total: weaknesses.length,
      pointTypeWeightOne: weaknesses.filter((w) => (w.pointTypeWeight ?? 1) === 1).length,
      chapterWeightOne: weaknesses.filter((w) => (w.chapterWeight ?? 1) === 1).length,
    };
    recoLogger.stats("Top3 推荐项数据质量", {
      pointType缺失比例: stats.total > 0 ? `${Math.round((stats.pointTypeWeightOne / stats.total) * 100)}%` : "0%",
      chapterId提取失败比例: stats.total > 0 ? `${Math.round((stats.chapterWeightOne / stats.total) * 100)}%` : "0%",
      pointTypeWeightOne数量: stats.pointTypeWeightOne,
      chapterWeightOne数量: stats.chapterWeightOne,
    });

    // 移除敏感字段：不返回 chapterWeight 和 pointTypeWeight 给前端
    const weaknessesForFrontend = weaknesses.map((w) => ({
      code: w.code,
      title: w.title,
      sectionTitle: w.sectionTitle,
      total: w.total,
      wrong: w.wrong,
      accuracy: w.accuracy,
      knowledge_point_code: w.knowledge_point_code,
      point_name: w.point_name,
      importance_level: w.importance_level,
      learn_mode: w.learn_mode,
      chapter_code: w.chapterId ? `C${w.chapterId}` : undefined,
      chapterId: w.chapterId,
      pointType: w.pointType,
      baseWeaknessScore: w.baseWeaknessScore,
      priority: w.priority,
      // 注意：chapterWeight 和 pointTypeWeight 不返回
    }));

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
      weaknesses: weaknessesForFrontend,
      questions,
    };

    return NextResponse.json(report);
  } catch (error) {
    recoLogger.error("diagnostic results failed", {
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

