-- 007-knowledge-points-unique.sql
-- 2025-12-26
-- 确保 knowledge_points 表按 subject+chapter+section+point_name 唯一，以支持 upsert

CREATE UNIQUE INDEX IF NOT EXISTS knowledge_points_unique
  ON knowledge_points(subject, chapter, section, point_name);
-- 007-knowledge-points-unique.sql
-- 为 knowledge_points 增加唯一索引，避免重复插入同一科目/章节/小节/考点

CREATE UNIQUE INDEX IF NOT EXISTS knowledge_points_unique
ON knowledge_points (subject, chapter, section, point_name);

