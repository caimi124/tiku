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
    const year = searchParams.get("year");
    const subject = searchParams.get("subject");
    
    // 🔑 映射前端参数到数据库值（支持中英文）
    const examTypeMap: Record<string, string> = {
      'pharmacist': '执业药师',
      'doctor': '执业医师',
      'nurse': '护士执业',
    };
    
    const dbExamType = examTypeMap[examType] || '执业药师';

    // 如果指定了年份和科目，返回该科目该年的统计
    if (year && subject) {
      const count = await prisma.questions.count({
        where: {
          is_published: true,
          exam_type: dbExamType,
          source_year: parseInt(year),
          subject: subject,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          year: parseInt(year),
          subject,
          totalQuestions: count,
        },
      });
    }

    // 构建WHERE条件
    const where: any = {
      is_published: true,
      exam_type: dbExamType,
      source_year: { not: null },
    };
    
    if (year) {
      where.source_year = parseInt(year);
    }
    
    if (subject) {
      where.subject = subject;
    }

    // 使用Prisma的groupBy进行安全查询
    const stats = await prisma.questions.groupBy({
      by: ['source_year', 'subject'],
      where,
      _count: {
        id: true,
      },
      orderBy: [
        { source_year: 'desc' },
        { subject: 'asc' },
      ],
    });

    // 转换数据格式
    const formattedStats = stats.map(item => ({
      year: item.source_year!,
      subject: item.subject,
      count: item._count.id,
    }));

    // 格式化数据
    const yearMap = new Map<number, any>();
    
    formattedStats.forEach(item => {
      const year = item.year;
      if (!yearMap.has(year)) {
        yearMap.set(year, {
          year,
          totalQuestions: 0,
          subjects: []
        });
      }
      
      const yearData = yearMap.get(year);
      const count = item.count;
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
