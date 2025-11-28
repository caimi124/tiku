import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 转换选项格式：字符串数组/对象 -> 对象数组
function formatOptions(options: any) {
  if (!options) return [];
  
  // 🔑 如果是字符串数组格式（如 ['A.xxx', 'B.xxx']），需要拆分为对象数组
  if (Array.isArray(options)) {
    // 检查第一个元素是否是字符串格式
    if (options.length > 0 && typeof options[0] === 'string') {
      // 拆分 "A.内容" 为 {key: 'A', value: '内容'}
      return options.map((opt: string) => {
        const dotIndex = opt.indexOf('.');
        if (dotIndex > 0) {
          return {
            key: opt.substring(0, dotIndex).trim(),
            value: opt.substring(dotIndex + 1).trim()
          };
        }
        // 如果没有点号，返回空值
        return { key: '', value: opt };
      });
    }
    // 如果已经是对象数组格式，直接返回
    return options;
  }
  
  // 如果是对象格式（旧格式），转换为数组
  if (typeof options === 'object') {
    return Object.entries(options).map(([key, value]) => ({
      key,
      value: value as string
    }));
  }
  
  return [];
}

// 格式化单个题目
function formatQuestion(question: any) {
  return {
    ...question,
    options: formatOptions(question.options),
    correctAnswer: question.correct_answer,
    questionType: question.question_type,
    examType: question.exam_type,
    sourceYear: question.source_year,
    sourceType: question.source_type,
    knowledgePoints: question.knowledge_points || [],
    isPublished: question.is_published,
    aiExplanation: question.ai_explanation,  // 添加图片数据字段映射
    explanation: question.ai_explanation,  // 🔑 添加解析字段映射（前端使用explanation）
    chapter: question.chapter,  // 添加章节字段映射
  };
}

// GET /api/questions - 获取题目列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const examType = searchParams.get("examType");
    const subject = searchParams.get("subject");
    const chapter = searchParams.get("chapter");
    const sourceYear = searchParams.get("sourceYear");
    const mode = searchParams.get("mode") || "chapter";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // 构建查询条件
    const where: any = {
      is_published: true,
    };

    if (examType) where.exam_type = examType;
    if (subject) where.subject = subject;
    if (chapter) where.chapter = chapter;
    if (sourceYear) where.source_year = parseInt(sourceYear);

    // 获取题目
    let questions: any[];

    if (mode === "random") {
      // 随机模式：使用数据库的随机排序
      questions = await prisma.$queryRaw`
        SELECT * FROM questions
        WHERE is_published = true
        ${examType ? `AND exam_type = ${examType}` : ""}
        ORDER BY RANDOM()
        LIMIT ${limit}
      ` as any[];
    } else {
      // 其他模式：正常分页查询
      // 历年真题按创建时间升序排序（导入时是按顺序的），其他按创建时间降序
      const orderBy = (sourceYear && subject) 
        ? [{ created_at: 'asc' as const }]
        : [{ created_at: 'desc' as const }];
      
      questions = await prisma.questions.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy,
      });
    }

    // 获取总数
    const total = await prisma.questions.count({ where });

    // 格式化题目数据
    const formattedQuestions = questions.map(formatQuestion);

    return NextResponse.json({
      success: true,
      data: {
        questions: formattedQuestions,
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
    const question = await prisma.questions.create({
      data: {
        exam_type: examType,
        subject,
        chapter,
        question_type: questionType,
        content,
        options,
        correct_answer: correctAnswer,
        explanation,
        ai_explanation: aiExplanation,
        difficulty: difficulty || 1,
        knowledge_points: knowledgePoints || [],
        is_published: true,
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

