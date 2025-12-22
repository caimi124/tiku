-- 新版知识点学习策略迁移
-- Migration: 005-knowledge-mode-tags
-- Date: 2025-12-21

-- 1. knowledge_tree 增加学习策略字段
ALTER TABLE knowledge_tree
  ADD COLUMN IF NOT EXISTS importance_level INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS learn_mode TEXT DEFAULT 'BOTH',
  ADD COLUMN IF NOT EXISTS error_pattern_tags TEXT[] DEFAULT '{}';

COMMENT ON COLUMN knowledge_tree.importance_level IS '知识点重要程度 1-5（与 importance 保持一致）';
COMMENT ON COLUMN knowledge_tree.learn_mode IS '学习模式：MEMORIZE/PRACTICE/BOTH';
COMMENT ON COLUMN knowledge_tree.error_pattern_tags IS '错题/易错模式标签字典';

-- 2. knowledge_points 同步字段与默认值
ALTER TABLE knowledge_points
  ALTER COLUMN importance_level SET DEFAULT 3,
  ADD COLUMN IF NOT EXISTS learn_mode TEXT DEFAULT 'BOTH',
  ADD COLUMN IF NOT EXISTS error_pattern_tags TEXT[] DEFAULT '{}';

COMMENT ON COLUMN knowledge_points.learn_mode IS '学习模式：MEMORIZE/PRACTICE/BOTH';
COMMENT ON COLUMN knowledge_points.error_pattern_tags IS '错题模式标签字典';

