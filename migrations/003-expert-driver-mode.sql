-- Migration: Expert Driver Mode Tables
-- Description: Creates tables for 老司机带路 feature
-- Date: 2024-12-08

-- 老司机内容表
CREATE TABLE IF NOT EXISTS expert_driver_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_point_id UUID NOT NULL,
  content JSONB NOT NULL,
  version VARCHAR(10) NOT NULL DEFAULT 'v1.0',
  style_variant VARCHAR(20) NOT NULL DEFAULT 'default',
  source_knowledge_point_text TEXT NOT NULL,
  prompt_template_version VARCHAR(10) NOT NULL,
  style_check JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(knowledge_point_id, style_variant)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_expert_driver_point_id ON expert_driver_content(knowledge_point_id);
CREATE INDEX IF NOT EXISTS idx_expert_driver_variant ON expert_driver_content(style_variant);
CREATE INDEX IF NOT EXISTS idx_expert_driver_version ON expert_driver_content(version);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_expert_driver_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_expert_driver_updated_at ON expert_driver_content;
CREATE TRIGGER trigger_expert_driver_updated_at
  BEFORE UPDATE ON expert_driver_content
  FOR EACH ROW
  EXECUTE FUNCTION update_expert_driver_updated_at();

-- Prompt模板表
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version VARCHAR(10) NOT NULL UNIQUE,
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT NOT NULL,
  json_schema JSONB NOT NULL,
  forbidden_patterns TEXT[] NOT NULL,
  style_rules JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 确保只有一个活跃模板
CREATE UNIQUE INDEX IF NOT EXISTS idx_prompt_templates_active 
  ON prompt_templates(is_active) WHERE is_active = true;

-- 人工审核队列表
CREATE TABLE IF NOT EXISTS expert_driver_review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_point_id UUID NOT NULL,
  knowledge_point_text TEXT NOT NULL,
  style_variant VARCHAR(20) NOT NULL DEFAULT 'default',
  retry_attempts JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) DEFAULT 'pending',
  reviewer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 审核队列索引
CREATE INDEX IF NOT EXISTS idx_review_queue_status ON expert_driver_review_queue(status);
CREATE INDEX IF NOT EXISTS idx_review_queue_created ON expert_driver_review_queue(created_at);

-- 添加注释
COMMENT ON TABLE expert_driver_content IS '老司机模式内容表，存储AI生成的考点解析';
COMMENT ON TABLE prompt_templates IS 'AI生成内容的Prompt模板表';
COMMENT ON TABLE expert_driver_review_queue IS '内容生成失败后的人工审核队列';

COMMENT ON COLUMN expert_driver_content.content IS 'JSON格式的老司机内容，包含坑位解析、押题预测等';
COMMENT ON COLUMN expert_driver_content.style_variant IS '内容风格变体：default, compact, mobile, video_script';
COMMENT ON COLUMN expert_driver_content.style_check IS '风格一致性检查结果';
COMMENT ON COLUMN prompt_templates.is_active IS '是否为当前活跃模板，同时只能有一个';
