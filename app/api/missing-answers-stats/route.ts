import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/missing-answers-stats
 * 获取缺失答案的统计信息
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const examType = searchParams.get("exam") || "pharmacist";

    // 查询每年缺失答案的数量
    const missingByYear = await prisma.$queryRaw<Array<{
      source_year: number;
      missing_count: bigint;
    }>>`
      SELECT 
        source_year,
        COUNT(*) as missing_count
      FROM questions
      WHERE 
        exam_type = ${examType}
        AND source_year IS NOT NULL
        AND (correct_answer IS NULL OR correct_answer = '')
      GROUP BY source_year
      ORDER BY source_year DESC
    `;

    // 转换bigint为number
    const formattedData = missingByYear.map(item => ({
      year: item.source_year,
      missingCount: Number(item.missing_count),
    }));

    // 计算总数
    const totalMissing = formattedData.reduce((sum, item) => sum + item.missingCount, 0);

    return NextResponse.json({
      success: true,
      data: {
        byYear: formattedData,
        total: totalMissing,
      },
    });
  } catch (error) {
    console.error("获取缺失答案统计失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "获取统计失败",
      },
      { status: 500 }
    );
  }
}

