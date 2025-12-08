/**
 * 老司机模式 API - 生成内容
 * POST /api/expert-driver/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { contentGenerator } from '@/lib/expert-driver/content-generator';
import { expertDriverRepository } from '@/lib/expert-driver/repository';
import { GenerationRequest, StyleVariant, STYLE_VARIANTS } from '@/lib/expert-driver/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    if (!body.knowledge_point_id) {
      return NextResponse.json(
        { error: '缺少必填字段: knowledge_point_id' },
        { status: 400 }
      );
    }

    if (!body.knowledge_point_text) {
      return NextResponse.json(
        { error: '缺少必填字段: knowledge_point_text' },
        { status: 400 }
      );
    }

    // 验证风格变体
    const styleVariant: StyleVariant = body.style_variant || 'default';
    if (!STYLE_VARIANTS.includes(styleVariant)) {
      return NextResponse.json(
        { error: `无效的风格变体，应为: ${STYLE_VARIANTS.join(', ')}` },
        { status: 400 }
      );
    }

    // 构建生成请求
    const generationRequest: GenerationRequest = {
      knowledge_point_id: body.knowledge_point_id,
      knowledge_point_text: body.knowledge_point_text,
      style_variant: styleVariant,
    };

    // 生成内容
    const result = await contentGenerator.generate(generationRequest);

    if (!result.success || !result.content) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || '生成失败',
          retry_count: result.retry_count,
          style_check: result.style_check,
        },
        { status: 422 }
      );
    }

    // 保存到数据库
    const saveResult = await expertDriverRepository.save(result.content);

    if (!saveResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `生成成功但保存失败: ${saveResult.error}`,
          content: result.content,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content: result.content,
      retry_count: result.retry_count,
    });
  } catch (error) {
    console.error('生成老司机内容失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    );
  }
}
