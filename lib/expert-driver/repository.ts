/**
 * 老司机模式 - 数据库操作层
 * Expert Driver Mode - Repository Layer
 */

import { createClient } from '@supabase/supabase-js';
import {
  ExpertDriverContent,
  StyleVariant,
  ReviewQueueItem,
} from './types';
import { validateExpertDriverContent } from './schema-validator';

// Supabase客户端（延迟初始化）
let supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      throw new Error('Supabase环境变量未配置');
    }
    
    supabase = createClient(url, key);
  }
  return supabase;
}

/**
 * 老司机内容仓库
 */
export class ExpertDriverRepository {
  /**
   * 保存内容（upsert行为）
   */
  async save(content: ExpertDriverContent): Promise<{ success: boolean; error?: string }> {
    // 先验证内容
    const validation = validateExpertDriverContent(content);
    if (!validation.valid) {
      return {
        success: false,
        error: `验证失败: ${validation.schema_errors?.join(', ')}`,
      };
    }

    try {
      const db = getSupabase();
      
      // @ts-expect-error - 表可能不存在，忽略类型检查
      const { error } = await (db as any)
        .from('expert_driver_content')
        .upsert({
          knowledge_point_id: content.knowledge_point_id,
          content: {
            考点名称: content.考点名称,
            坑位解析: content.坑位解析,
            应试战术: content.应试战术,
            押题预测: content.押题预测,
            终极思维导图: content.终极思维导图,
            一句话极速总结: content.一句话极速总结,
            short_summary: content.short_summary,
          },
          version: content.version,
          style_variant: content.style_variant,
          source_knowledge_point_text: content.source_knowledge_point_text,
          prompt_template_version: content.prompt_template_version,
          style_check: content.style_check,
        }, {
          onConflict: 'knowledge_point_id,style_variant',
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 根据知识点ID获取内容
   */
  async getByKnowledgePointId(
    knowledgePointId: string,
    styleVariant: StyleVariant = 'default'
  ): Promise<ExpertDriverContent | null> {
    try {
      const db = getSupabase();
      
      const { data, error } = await (db as any)
        .from('expert_driver_content')
        .select('*')
        .eq('knowledge_point_id', knowledgePointId)
        .eq('style_variant', styleVariant)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapToContent(data);
    } catch (error) {
      console.error('获取老司机内容失败:', error);
      return null;
    }
  }

  /**
   * 根据风格变体获取所有内容
   */
  async getByStyleVariant(styleVariant: StyleVariant): Promise<ExpertDriverContent[]> {
    try {
      const db = getSupabase();
      
      const { data, error } = await (db as any)
        .from('expert_driver_content')
        .select('*')
        .eq('style_variant', styleVariant);

      if (error || !data) {
        return [];
      }

      return data.map(item => this.mapToContent(item));
    } catch (error) {
      console.error('获取老司机内容列表失败:', error);
      return [];
    }
  }

  /**
   * 删除内容
   */
  async delete(knowledgePointId: string, styleVariant: StyleVariant = 'default'): Promise<boolean> {
    try {
      const db = getSupabase();
      
      const { error } = await (db as any)
        .from('expert_driver_content')
        .delete()
        .eq('knowledge_point_id', knowledgePointId)
        .eq('style_variant', styleVariant);

      return !error;
    } catch (error) {
      console.error('删除老司机内容失败:', error);
      return false;
    }
  }

  /**
   * 映射数据库记录到内容对象
   */
  private mapToContent(data: any): ExpertDriverContent {
    return {
      id: data.id,
      knowledge_point_id: data.knowledge_point_id,
      考点名称: data.content.考点名称,
      坑位解析: data.content.坑位解析,
      应试战术: data.content.应试战术,
      押题预测: data.content.押题预测,
      终极思维导图: data.content.终极思维导图,
      一句话极速总结: data.content.一句话极速总结,
      short_summary: data.content.short_summary,
      version: data.version,
      style_variant: data.style_variant,
      source_knowledge_point_text: data.source_knowledge_point_text,
      prompt_template_version: data.prompt_template_version,
      style_check: data.style_check,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  }
}

/**
 * 审核队列仓库
 */
export class ReviewQueueRepository {
  /**
   * 添加到队列
   */
  async addToQueue(item: ReviewQueueItem): Promise<{ success: boolean; error?: string }> {
    try {
      const db = getSupabase();
      
      // @ts-expect-error - 表可能不存在，忽略类型检查
      const { error } = await (db as any)
        .from('expert_driver_review_queue')
        .insert({
          knowledge_point_id: item.knowledge_point_id,
          knowledge_point_text: item.knowledge_point_text,
          style_variant: item.style_variant,
          retry_attempts: item.retry_attempts,
          status: item.status,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 根据状态获取队列项
   */
  async getByStatus(status: ReviewQueueItem['status']): Promise<ReviewQueueItem[]> {
    try {
      const db = getSupabase();
      
      const { data, error } = await (db as any)
        .from('expert_driver_review_queue')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: true });

      if (error || !data) {
        return [];
      }

      return data.map(item => this.mapToQueueItem(item));
    } catch (error) {
      console.error('获取审核队列失败:', error);
      return [];
    }
  }

  /**
   * 更新状态
   */
  async updateStatus(
    id: string,
    status: ReviewQueueItem['status'],
    notes?: string
  ): Promise<boolean> {
    try {
      const db = getSupabase();
      
      // @ts-expect-error - 表可能不存在，忽略类型检查
      const { error } = await (db as any)
        .from('expert_driver_review_queue')
        .update({
          status,
          reviewer_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('更新审核状态失败:', error);
      return false;
    }
  }

  /**
   * 映射数据库记录到队列项
   */
  private mapToQueueItem(data: any): ReviewQueueItem {
    return {
      id: data.id,
      knowledge_point_id: data.knowledge_point_id,
      knowledge_point_text: data.knowledge_point_text,
      style_variant: data.style_variant,
      retry_attempts: data.retry_attempts,
      status: data.status,
      reviewer_notes: data.reviewer_notes,
      created_at: new Date(data.created_at),
      reviewed_at: data.reviewed_at ? new Date(data.reviewed_at) : undefined,
    };
  }
}

// 导出单例
export const expertDriverRepository = new ExpertDriverRepository();
export const reviewQueueRepository = new ReviewQueueRepository();
