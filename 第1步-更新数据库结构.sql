-- ========================================
-- 第1步：更新数据库结构
-- 执行时间：约10秒
-- ========================================

-- 添加历年真题必需字段
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS source_type TEXT,
ADD COLUMN IF NOT EXISTS source_year INTEGER;

-- 创建索引提高查询速度
CREATE INDEX IF NOT EXISTS idx_questions_source_year 
ON questions(source_year);

-- 验证字段已添加
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'questions' 
  AND column_name IN ('source_type', 'source_year');

-- 显示成功消息
DO $$
BEGIN
  RAISE NOTICE '✅ 数据库结构更新成功！';
  RAISE NOTICE '✅ source_type 字段已添加';
  RAISE NOTICE '✅ source_year 字段已添加';
  RAISE NOTICE '✅ 索引已创建';
  RAISE NOTICE '';
  RAISE NOTICE '👉 下一步：执行 第2步-导入2024年真题.sql';
END $$;
