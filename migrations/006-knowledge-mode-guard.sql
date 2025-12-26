-- 006-knowledge-mode-guard.sql
-- 2025-12-26
-- 说明：确保 knowledge_tree / knowledge_points 具备 importance_level、learn_mode、error_pattern_tags
-- 列，并设置默认值/非空约束，防止接口因缺列导致 42703 错误。

BEGIN;

-- 知识树字段（兼容手动多次执行）
ALTER TABLE knowledge_tree
  ADD COLUMN IF NOT EXISTS importance_level SMALLINT,
  ADD COLUMN IF NOT EXISTS learn_mode TEXT,
  ADD COLUMN IF NOT EXISTS error_pattern_tags TEXT[];

-- 回填与默认值
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
  ALTER COLUMN importance_level SET DEFAULT 3,
  ALTER COLUMN importance_level SET NOT NULL,
  ALTER COLUMN learn_mode SET DEFAULT 'BOTH',
  ALTER COLUMN learn_mode SET NOT NULL,
  ALTER COLUMN error_pattern_tags SET DEFAULT '{}'::text[],
  ALTER COLUMN error_pattern_tags SET NOT NULL;

-- knowledge_points 同步字段
ALTER TABLE knowledge_points
  ADD COLUMN IF NOT EXISTS importance_level SMALLINT,
  ADD COLUMN IF NOT EXISTS learn_mode TEXT,
  ADD COLUMN IF NOT EXISTS error_pattern_tags TEXT[];

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
  ALTER COLUMN importance_level SET DEFAULT 3,
  ALTER COLUMN importance_level SET NOT NULL,
  ALTER COLUMN learn_mode SET DEFAULT 'BOTH',
  ALTER COLUMN learn_mode SET NOT NULL,
  ALTER COLUMN error_pattern_tags SET DEFAULT '{}'::text[],
  ALTER COLUMN error_pattern_tags SET NOT NULL;

COMMIT;

