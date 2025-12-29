/**
 * 数据质量自检 API（仅开发环境）
 * 输出西药二知识点 point_type 覆盖率、分布、chapterId 提取失败数量
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { getChapterWeight } from "@/lib/recommendationPriority";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

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

export async function GET(request: NextRequest) {
  // 仅开发环境可访问
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "此接口仅开发环境可用" }, { status: 403 });
  }

  const client = await pool.connect();
  try {
    // 查询西药二知识点
    const result = await client.query<{
      id: string;
      code: string;
      title: string;
      point_type: string | null;
      chapter_code: string | null;
      section_code: string | null;
    }>(
      `
      SELECT
        id,
        code,
        title,
        point_type,
        (
          SELECT code FROM knowledge_tree 
          WHERE node_type = 'chapter' 
          AND id = (
            SELECT parent_id FROM knowledge_tree WHERE id = kt.id
            UNION ALL
            SELECT parent_id FROM knowledge_tree WHERE id IN (
              SELECT parent_id FROM knowledge_tree WHERE id = kt.id
            )
            LIMIT 1
          )
        ) AS chapter_code,
        (
          SELECT code FROM knowledge_tree 
          WHERE node_type = 'section' 
          AND id = kt.parent_id
        ) AS section_code
      FROM knowledge_tree kt
      WHERE node_type = 'point'
      AND subject_code = 'xiyao-yao2'
      ORDER BY code
    `,
    );

    const points = result.rows;
    const total = points.length;

    // 统计 point_type 覆盖率
    const withPointType = points.filter((p) => p.point_type).length;
    const pointTypeCoverage = total > 0 ? (withPointType / total) * 100 : 0;

    // 统计各 point_type 分布
    const pointTypeDistribution: Record<string, number> = {};
    points.forEach((p) => {
      const type = p.point_type || "未标注";
      pointTypeDistribution[type] = (pointTypeDistribution[type] || 0) + 1;
    });

    // 统计 chapterId 提取失败
    let chapterIdExtractFailed = 0;
    let chapterWeightOneCount = 0;

    points.forEach((p) => {
      const chapterId =
        extractChapterId(p.chapter_code) ??
        extractChapterId(p.section_code) ??
        extractChapterId(p.code);
      const chapterWeight = getChapterWeight(chapterId);

      if (!chapterId || chapterWeight === 1) {
        chapterIdExtractFailed++;
      }
      if (chapterWeight === 1) {
        chapterWeightOneCount++;
      }
    });

    const chapterIdExtractFailedRate =
      total > 0 ? (chapterIdExtractFailed / total) * 100 : 0;

    // 抽检清单：从 chapter 9/8/5 各抽 20 个知识点
    const sampleChapters = [9, 8, 5];
    const sampleList: Array<{
      id: string;
      code: string;
      title: string;
      point_type: string | null;
      chapterId: number | null;
      chapter_code: string | null;
    }> = [];

    sampleChapters.forEach((chapterNum) => {
      const chapterPoints = points
        .filter((p) => {
          const chapterId =
            extractChapterId(p.chapter_code) ??
            extractChapterId(p.section_code) ??
            extractChapterId(p.code);
          return chapterId === chapterNum;
        })
        .slice(0, 20);

      chapterPoints.forEach((p) => {
        const chapterId =
          extractChapterId(p.chapter_code) ??
          extractChapterId(p.section_code) ??
          extractChapterId(p.code);
        sampleList.push({
          id: p.id,
          code: p.code,
          title: p.title,
          point_type: p.point_type,
          chapterId,
          chapter_code: p.chapter_code,
        });
      });
    });

    return NextResponse.json({
      summary: {
        总知识点数: total,
        point_type覆盖率: `${Math.round(pointTypeCoverage * 100) / 100}%`,
        point_type已标注数: withPointType,
        point_type未标注数: total - withPointType,
        chapterId提取失败数: chapterIdExtractFailed,
        chapterId提取失败率: `${Math.round(chapterIdExtractFailedRate * 100) / 100}%`,
        chapterWeight为1的数量: chapterWeightOneCount,
      },
      pointType分布: pointTypeDistribution,
      抽检清单: {
        说明: "从章节 9(抗感染)/8(内分泌)/5(心血管) 各抽取 20 个知识点",
        数据: sampleList,
      },
    });
  } catch (error) {
    console.error("数据质量自检失败", error);
    return NextResponse.json(
      { error: "数据质量自检失败", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
