/**
 * 老司机模式 API - 获取内容
 * GET /api/expert-driver/[pointId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { expertDriverRepository } from '@/lib/expert-driver/repository';
import { StyleVariant, STYLE_VARIANTS } from '@/lib/expert-driver/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { pointId: string } }
) {
  try {
    const { pointId } = params;
    
    if (!pointId) {
      return NextResponse.json(
        { error: '缺少知识点ID' },
        { status: 400 }
      );
    }

    // 获取查询参数中的风格变体
    const searchParams = request.nextUrl.searchParams;
    const styleVariant = searchParams.get('variant') as StyleVariant || 'default';

    // 验证风格变体
    if (!STYLE_VARIANTS.includes(styleVariant)) {
      return NextResponse.json(
        { error: `无效的风格变体，应为: ${STYLE_VARIANTS.join(', ')}` },
        { status: 400 }
      );
    }

    // 获取内容
    const content = await expertDriverRepository.getByKnowledgePointId(pointId, styleVariant);

    if (!content) {
      // 返回空响应而不是404，符合需求5.1
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('获取老司机内容失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
