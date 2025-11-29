import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 新增API端点：一次性获取所有历年真题统计
 * GET /api/history-stats?exam=pharmacist
 * 
 * 优势：
 * 1. 16次请求 → 1次请求（减少网络往返）
 * 2. 单次数据库查询（GROUP BY优化）
 * 3. 服务器端缓存（Redis/内存缓存）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const examType = searchParams.get("exam") || "pharmacist";
    
    // 🔑 映射前端参数到数据库值（支持中英文）
    const examTypeMap: Record<string, string> = {
      'pharmacist': '执业药师',
      'doctor': '执业医师',
      'nurse': '护士执业',
    };
    
    const dbExamType = examTypeMap[examType] || '执业药师';

    // 单次数据库查询，按年份和科目分组统计
    const stats = await prisma.$queryRaw`
      SELECT 
        source_year as year,
        subject,
        COUNT(*) as count
      FROM questions
      WHERE 
        is_published = true
        AND exam_type = ${dbExamType}
        AND source_year IS NOT NULL
      GROUP BY source_year, subject
      ORDER BY source_year DESC, subject
    ` as Array<{ year: number; subject: string; count: bigint }>;

    // 格式化数据
    const yearMap = new Map<number, any>();
    
    stats.forEach(item => {
      const year = item.year;
      if (!yearMap.has(year)) {
        yearMap.set(year, {
          year,
          totalQuestions: 0,
          subjects: []
        });
      }
      
      const yearData = yearMap.get(year);
      const count = Number(item.count);
      yearData.totalQuestions += count;
      yearData.subjects.push({
        name: item.subject,
        count
      });
    });

    const result = Array.from(yearMap.values());

    return NextResponse.json({
      success: true,
      data: result,
      cached: false // TODO: 添加缓存后设为true
    });

  } catch (error) {
    console.error("获取历年真题统计失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}

// 缓存配置（Next.js 14）
export const revalidate = 3600; // 1小时缓存
