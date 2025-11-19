import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/questions/[id] - 获取单个题目
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const question = await prisma.questions.findUnique({
      where: {
        id: params.id,
      },
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

    // 增加查看次数
    await prisma.questions.update({
      where: { id: params.id },
      data: {
        view_count: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: question,
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

// PUT /api/questions/[id] - 更新题目（管理员）
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const question = await prisma.questions.update({
      where: {
        id: params.id,
      },
      data: body,
    });

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("更新题目失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "更新题目失败",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/questions/[id] - 删除题目（管理员）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.questions.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "题目已删除",
    });
  } catch (error) {
    console.error("删除题目失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "删除题目失败",
      },
      { status: 500 }
    );
  }
}

