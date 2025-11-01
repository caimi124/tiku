import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/questions - 获取题目列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const examType = searchParams.get("examType");
    const subject = searchParams.get("subject");
    const chapter = searchParams.get("chapter");
    const mode = searchParams.get("mode") || "chapter";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // 构建查询条件
    const where: any = {
      isPublished: true,
    };

    if (examType) where.examType = examType;
    if (subject) where.subject = subject;
    if (chapter) where.chapter = chapter;

    // 获取题目
    let questions;

    if (mode === "random") {
      // 随机模式：使用数据库的随机排序
      questions = await prisma.$queryRaw`
        SELECT * FROM questions
        WHERE is_published = true
        ${examType ? `AND exam_type = ${examType}` : ""}
        ORDER BY RANDOM()
        LIMIT ${limit}
      `;
    } else {
      // 其他模式：正常分页查询
      questions = await prisma.question.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // 获取总数
    const total = await prisma.question.count({ where });

    return NextResponse.json({
      success: true,
      data: {
        questions,
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("获取题目失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "获取题目失败",
      },
      { status: 500 }
    );
  }
}

// POST /api/questions - 创建题目（管理员）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      examType,
      subject,
      chapter,
      questionType,
      content,
      options,
      correctAnswer,
      explanation,
      aiExplanation,
      difficulty,
      knowledgePoints,
    } = body;

    // 验证必填字段
    if (!examType || !subject || !questionType || !content || !correctAnswer) {
      return NextResponse.json(
        {
          success: false,
          error: "缺少必填字段",
        },
        { status: 400 }
      );
    }

    // 创建题目
    const question = await prisma.question.create({
      data: {
        examType,
        subject,
        chapter,
        questionType,
        content,
        options,
        correctAnswer,
        explanation,
        aiExplanation,
        difficulty: difficulty || 1,
        knowledgePoints: knowledgePoints || [],
        isPublished: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("创建题目失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "创建题目失败",
      },
      { status: 500 }
    );
  }
}

