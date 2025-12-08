/**
 * 老司机模式 API - 批量导入
 * POST /api/expert-driver/batch-import
 */

import { NextRequest, NextResponse } from 'next/server';
import { expertDriverRepository } from '@/lib/expert-driver/repository';
import { validateExpertDriverContent } from '@/lib/expert-driver/schema-validator';
import { ExpertDriverContent } from '@/lib/expert-driver/types';

interface BatchImportItem {
  knowledge_point_id: string;
  content: Omit<ExpertDriverContent, 'knowledge_point_id'>;
}

interface BatchImportResult {
  total: number;
  success: number;
  failed: number;
  results: Array<{
    knowledge_point_id: string;
    success: boolean;
    error?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证输入是数组
    if (!Array.isArray(body.items)) {
      return NextResponse.json(
        { error: '请求体必须包含items数组' },
        { status: 400 }
      );
    }

    const items: BatchImportItem[] = body.items;
    const results: BatchImportResult['results'] = [];
    let successCount = 0;
    let failedCount = 0;

    // 逐个处理
    for (const item of items) {
      try {
        // 验证必填字段
        if (!item.knowledge_point_id) {
          failedCount++;
          results.push({
            knowledge_point_id: item.knowledge_point_id || 'unknown',
            success: false,
            error: '缺少knowledge_point_id',
          });
          continue;
        }

        // 构建完整内容对象
        const content: ExpertDriverContent = {
          ...item.content,
          knowledge_point_id: item.knowledge_point_id,
        } as ExpertDriverContent;

        // 验证内容
        const validation = validateExpertDriverContent(content);
        if (!validation.valid) {
          failedCount++;
          results.push({
            knowledge_point_id: item.knowledge_point_id,
            success: false,
            error: `验证失败: ${validation.schema_errors?.join(', ')}`,
          });
          continue;
        }

        // 保存到数据库
        const saveResult = await expertDriverRepository.save(content);

        if (saveResult.success) {
          successCount++;
          results.push({
            knowledge_point_id: item.knowledge_point_id,
            success: true,
          });
        } else {
          failedCount++;
          results.push({
            knowledge_point_id: item.knowledge_point_id,
            success: false,
            error: saveResult.error,
          });
        }
      } catch (error) {
        failedCount++;
        results.push({
          knowledge_point_id: item.knowledge_point_id || 'unknown',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const response: BatchImportResult = {
      total: items.length,
      success: successCount,
      failed: failedCount,
      results,
    };

    // 如果全部失败，返回422
    if (successCount === 0 && failedCount > 0) {
      return NextResponse.json(response, { status: 422 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('批量导入失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    );
  }
}
