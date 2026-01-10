-- 添加高频考法与易错点字段
-- Migration: 009-add-highfreq-pitfalls
-- Date: 2024-12-XX

-- ============================================
-- 1. 添加高频考法与易错点字段
-- ============================================

ALTER TABLE knowledge_points
ADD COLUMN IF NOT EXISTS hf_patterns TEXT;

ALTER TABLE knowledge_points
ADD COLUMN IF NOT EXISTS pitfalls TEXT;

ALTER TABLE knowledge_points
ADD COLUMN IF NOT EXISTS hf_generated_at TIMESTAMPTZ;

-- ============================================
-- 2. 创建索引
-- ============================================

CREATE INDEX IF NOT EXISTS idx_knowledge_points_hf_generated_at
ON knowledge_points(hf_generated_at);

-- ============================================
-- 3. 添加注释
-- ============================================

COMMENT ON COLUMN knowledge_points.hf_patterns IS '高频考法，多行文本格式，每行以 "- " 开头';
COMMENT ON COLUMN knowledge_points.pitfalls IS '易错点，多行文本格式，每行以 "- " 开头';
COMMENT ON COLUMN knowledge_points.hf_generated_at IS '高频考法与易错点生成时间';

