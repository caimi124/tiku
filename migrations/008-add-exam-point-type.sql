-- 添加考点类型字段 exam_point_type
-- Migration: 008-add-exam-point-type
-- Date: 2024-12-XX

-- ============================================
-- 1. 添加 exam_point_type 字段
-- ============================================

ALTER TABLE knowledge_points 
ADD COLUMN IF NOT EXISTS exam_point_type TEXT;

-- ============================================
-- 2. 创建索引（推荐）
-- ============================================

CREATE INDEX IF NOT EXISTS idx_knowledge_points_exam_point_type 
ON knowledge_points(exam_point_type);

-- ============================================
-- 3. 添加注释
-- ============================================

COMMENT ON COLUMN knowledge_points.exam_point_type IS 
'考点类型：single_drug(单药)/drug_class(分类)/clinical_selection(临床选择)/adr_interaction(不良反应/相互作用)/mechanism_basic(机制/药理基础)';

