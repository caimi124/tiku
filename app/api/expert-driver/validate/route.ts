/**
 * 老司机模式 API - 验证内容
 * POST /api/expert-driver/validate
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateExpertDriverContent } from '@/lib/expert-driver/schema-validator';
import { StyleValidator } from '@/lib/expert-driver/style-validator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: '请求体必须是JSON对象' },
        { status: 400 }
      );
    }

    // Schema验证
    const schemaResult = validateExpertDriverContent(body);

    // 风格验证
    const styleValidator = new StyleValidator();
    let styleResult = null;

    if (schemaResult.valid) {
      styleResult = styleValidator.validate(body);
    }

    // 构建响应
    const response = {
      valid: schemaResult.valid && (styleResult?.valid ?? false),
      schema_validation: {
        valid: schemaResult.valid,
        errors: schemaResult.schema_errors || [],
      },
      style_validation: styleResult ? {
        valid: styleResult.valid,
        style_check: styleResult.style_check,
        errors: styleResult.style_errors || [],
      } : null,
    };

    // 如果验证失败，返回详细错误信息
    if (!response.valid) {
      return NextResponse.json(response, { status: 422 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('验证失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    );
  }
}
