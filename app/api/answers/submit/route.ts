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
    const question = await prisma.question.findUnique({
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
    const isCorrect = userAnswer === question.correctAnswer;

    // 记录答题
    const answer = await prisma.userAnswer.create({
      data: {
        userId,
        questionId,
        userAnswer,
        isCorrect,
        timeSpent: timeSpent || 0,
      },
    });

    // 更新题目统计
    await prisma.question.update({
      where: { id: questionId },
      data: {
        answerCount: {
          increment: 1,
        },
        ...(isCorrect && {
          correctCount: {
            increment: 1,
          },
        }),
      },
    });

    // 如果答错，添加到错题本
    if (!isCorrect) {
      const existingWrongQuestion = await prisma.wrongQuestion.findUnique({
        where: {
          userId_questionId: {
            userId,
            questionId,
          },
        },
      });

      if (existingWrongQuestion) {
        // 更新错题记录
        await prisma.wrongQuestion.update({
          where: {
            userId_questionId: {
              userId,
              questionId,
            },
          },
          data: {
            wrongCount: {
              increment: 1,
            },
            lastWrongAt: new Date(),
            isMastered: false,
          },
        });
      } else {
        // 创建新的错题记录
        await prisma.wrongQuestion.create({
          data: {
            userId,
            questionId,
            wrongCount: 1,
          },
        });
      }
    } else {
      // 如果答对，检查是否应该标记为已掌握
      const wrongQuestion = await prisma.wrongQuestion.findUnique({
        where: {
          userId_questionId: {
            userId,
            questionId,
          },
        },
      });

      if (wrongQuestion) {
        // 检查最近3次答题是否都正确
        const recentAnswers = await prisma.userAnswer.findMany({
          where: {
            userId,
            questionId,
          },
          orderBy: {
            answeredAt: "desc",
          },
          take: 3,
        });

        const allCorrect = recentAnswers.every((a) => a.isCorrect);

        if (allCorrect && recentAnswers.length >= 3) {
          // 标记为已掌握
          await prisma.wrongQuestion.update({
            where: {
              userId_questionId: {
                userId,
                questionId,
              },
            },
            data: {
              isMastered: true,
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
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        aiExplanation: question.aiExplanation,
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

