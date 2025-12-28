-- 新版知识点学习策略迁移
-- Migration: 005-knowledge-mode-tags
-- Date: 2025-12-21

-- 1. knowledge_tree 增加学习策略字段
ALTER TABLE knowledge_tree
  ADD COLUMN IF NOT EXISTS importance_level INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS learn_mode TEXT DEFAULT 'BOTH',
  ADD COLUMN IF NOT EXISTS error_pattern_tags TEXT[] DEFAULT '{}';

ALTER TABLE knowledge_tree
  ALTER COLUMN importance_level SET DEFAULT 3,
  ALTER COLUMN learn_mode SET DEFAULT 'BOTH',
  ALTER COLUMN error_pattern_tags SET DEFAULT '{}'::text[];

COMMENT ON COLUMN knowledge_tree.importance_level IS '知识点重要程度 1-5（与 importance 保持一致）';
COMMENT ON COLUMN knowledge_tree.learn_mode IS '学习模式：MEMORIZE/PRACTICE/BOTH';
COMMENT ON COLUMN knowledge_tree.error_pattern_tags IS '错题/易错模式标签字典';

-- 回填并加上非空约束
UPDATE knowledge_tree
  SET importance_level = importance
  WHERE importance_level IS NULL;

UPDATE knowledge_tree
  SET learn_mode = 'BOTH'
  WHERE learn_mode IS NULL;

UPDATE knowledge_tree
  SET error_pattern_tags = '{}'::text[]
  WHERE error_pattern_tags IS NULL;

ALTER TABLE knowledge_tree
  ALTER COLUMN importance_level SET NOT NULL,
  ALTER COLUMN learn_mode SET NOT NULL,
  ALTER COLUMN error_pattern_tags SET NOT NULL;

-- 2. knowledge_points 同步字段与默认值
ALTER TABLE knowledge_points
  ADD COLUMN IF NOT EXISTS importance_level INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS learn_mode TEXT DEFAULT 'BOTH',
  ADD COLUMN IF NOT EXISTS error_pattern_tags TEXT[] DEFAULT '{}'::text[];

ALTER TABLE knowledge_points
  ALTER COLUMN importance_level SET DEFAULT 3,
  ALTER COLUMN learn_mode SET DEFAULT 'BOTH',
  ALTER COLUMN error_pattern_tags SET DEFAULT '{}'::text[];

COMMENT ON COLUMN knowledge_points.learn_mode IS '学习模式：MEMORIZE/PRACTICE/BOTH';
COMMENT ON COLUMN knowledge_points.error_pattern_tags IS '错题模式标签字典';

UPDATE knowledge_points
  SET importance_level = 3
  WHERE importance_level IS NULL;

UPDATE knowledge_points
  SET learn_mode = 'BOTH'
  WHERE learn_mode IS NULL;

UPDATE knowledge_points
  SET error_pattern_tags = '{}'::text[]
  WHERE error_pattern_tags IS NULL;

ALTER TABLE knowledge_points
  ALTER COLUMN importance_level SET NOT NULL,
  ALTER COLUMN learn_mode SET NOT NULL,
  ALTER COLUMN error_pattern_tags SET NOT NULL;


