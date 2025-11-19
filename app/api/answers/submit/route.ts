import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/answers/submit - 提交答案
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, questionId, userAnswer, timeSpent } = body;

    // 验证必填字段
    if (!userId || !questionId || !userAnswer) {
      return NextResponse.json(
        {
          success: false,
          error: "缺少必填字段",
        },
        { status: 400 }
      );
    }

    // 获取题目信息
    const question = await prisma.questions.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: "题目不存在",
        },
        { status: 404 }
      );
    }

    // 判断答案是否正确
    const isCorrect = userAnswer === question.correct_answer;

    // 记录答题
    const answer = await prisma.user_answers.create({
      data: {
        user_id: userId,
        question_id: questionId,
        user_answer: userAnswer,
        is_correct: isCorrect,
        time_spent: timeSpent || 0,
      },
    });

    // 更新题目统计
    await prisma.questions.update({
      where: { id: questionId },
      data: {
        answer_count: {
          increment: 1,
        },
        ...(isCorrect && {
          correct_count: {
            increment: 1,
          },
        }),
      },
    });

    // 如果答错，添加到错题本
    if (!isCorrect) {
      const existingWrongQuestion = await prisma.wrong_questions.findUnique({
        where: {
          user_id_question_id: {
            user_id: userId,
            question_id: questionId,
          },
        },
      });

      if (existingWrongQuestion) {
        // 更新错题记录
        await prisma.wrong_questions.update({
          where: {
            user_id_question_id: {
              user_id: userId,
              question_id: questionId,
            },
          },
          data: {
            wrong_count: {
              increment: 1,
            },
            last_wrong_at: new Date(),
            is_mastered: false,
          },
        });
      } else {
        // 创建新的错题记录
        await prisma.wrong_questions.create({
          data: {
            user_id: userId,
            question_id: questionId,
            wrong_count: 1,
          },
        });
      }
    } else {
      // 如果答对，检查是否应该标记为已掌握
      const wrongQuestion = await prisma.wrong_questions.findUnique({
        where: {
          user_id_question_id: {
            user_id: userId,
            question_id: questionId,
          },
        },
      });

      if (wrongQuestion) {
        // 检查最近3次答题是否都正确
        const recentAnswers = await prisma.user_answers.findMany({
          where: {
            user_id: userId,
            question_id: questionId,
          },
          orderBy: {
            answered_at: "desc",
          },
          take: 3,
        });

        const allCorrect = recentAnswers.every((a) => a.is_correct);

        if (allCorrect && recentAnswers.length >= 3) {
          // 标记为已掌握
          await prisma.wrong_questions.update({
            where: {
              user_id_question_id: {
                user_id: userId,
                question_id: questionId,
              },
            },
            data: {
              is_mastered: true,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        answer,
        isCorrect,
        correctAnswer: question.correct_answer,
        explanation: question.explanation,
        aiExplanation: question.ai_explanation,
      },
    });
  } catch (error) {
    console.error("提交答案失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "提交答案失败",
      },
      { status: 500 }
    );
  }
}

