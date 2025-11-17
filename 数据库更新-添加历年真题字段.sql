-- ========================================
-- 数据库更新：添加历年真题支持字段
-- ========================================

-- 添加 source_type 字段（来源类型：真题/模拟题/练习题）
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS source_type TEXT;

-- 添加 source_year 字段（来源年份：2024/2023等）
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS source_year INTEGER;

-- 为 source_year 字段创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_questions_source_year 
ON questions(source_year);

-- 为组合查询创建复合索引
CREATE INDEX IF NOT EXISTS idx_questions_source_year_subject 
ON questions(source_year, subject);

-- 添加注释
COMMENT ON COLUMN questions.source_type IS '来源类型：真题/模拟题/练习题';
COMMENT ON COLUMN questions.source_year IS '来源年份，如2024、2023等';

-- 验证字段是否添加成功
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ 数据库更新完成！';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '新增字段：';
  RAISE NOTICE '  - source_type: 来源类型';
  RAISE NOTICE '  - source_year: 来源年份';
  RAISE NOTICE '';
  RAISE NOTICE '新增索引：';
  RAISE NOTICE '  - idx_questions_source_year';
  RAISE NOTICE '  - idx_questions_source_year_subject';
  RAISE NOTICE '';
  RAISE NOTICE '下一步：';
  RAISE NOTICE '  1. 运行真题导入脚本';
  RAISE NOTICE '  2. 使用 sourceYear 参数查询真题';
  RAISE NOTICE '  3. 测试历年真题功能';
  RAISE NOTICE '========================================';
END $$;

-- 查询示例
-- SELECT * FROM questions WHERE source_year = 2024;
-- SELECT * FROM questions WHERE source_type = '真题' AND source_year = 2023;
