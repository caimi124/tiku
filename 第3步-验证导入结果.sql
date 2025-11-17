-- ========================================
-- 第3步：验证导入结果
-- 用于检查数据是否正确导入
-- ========================================

-- 1. 检查字段是否存在
SELECT 
  '字段检查' as 检查项,
  column_name as 字段名, 
  data_type as 数据类型,
  is_nullable as 可为空
FROM information_schema.columns 
WHERE table_name = 'questions' 
  AND column_name IN ('source_type', 'source_year', 'exam_type', 'subject')
ORDER BY column_name;

-- 2. 统计各年份真题数量
SELECT 
  '年份统计' as 检查项,
  source_year as 年份,
  COUNT(*) as 题目数,
  COUNT(DISTINCT chapter) as 章节数
FROM questions
WHERE source_year IS NOT NULL
GROUP BY source_year
ORDER BY source_year DESC;

-- 3. 查看2024年真题详情
SELECT 
  '2024年真题' as 检查项,
  chapter as 章节,
  COUNT(*) as 题目数
FROM questions
WHERE source_year = 2024
GROUP BY chapter
ORDER BY COUNT(*) DESC;

-- 4. 查看前5道2024年真题
SELECT 
  '题目示例' as 检查项,
  id as 题目ID,
  LEFT(content, 40) || '...' as 题目内容,
  correct_answer as 答案,
  difficulty as 难度
FROM questions
WHERE source_year = 2024
ORDER BY id
LIMIT 5;

-- 5. 检查是否有重复ID
SELECT 
  '重复检查' as 检查项,
  id as 题目ID,
  COUNT(*) as 出现次数
FROM questions
GROUP BY id
HAVING COUNT(*) > 1;

-- 6. 总体统计
SELECT 
  '总体统计' as 检查项,
  COUNT(*) as 总题目数,
  COUNT(*) FILTER (WHERE source_year = 2024) as "2024年题数",
  COUNT(*) FILTER (WHERE source_year = 2023) as "2023年题数",
  COUNT(*) FILTER (WHERE source_year IS NULL) as "未标注年份题数"
FROM questions;

-- 显示检查结果
DO $$
DECLARE
  题目2024 INTEGER;
  题目2023 INTEGER;
  总题目数 INTEGER;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE source_year = 2024),
    COUNT(*) FILTER (WHERE source_year = 2023),
    COUNT(*)
  INTO 题目2024, 题目2023, 总题目数
  FROM questions;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 数据库验证结果';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ 数据库总题目数：% 道', 总题目数;
  RAISE NOTICE '✅ 2024年真题：% 道', 题目2024;
  RAISE NOTICE '✅ 2023年真题：% 道', 题目2023;
  RAISE NOTICE '';
  
  IF 题目2024 >= 10 THEN
    RAISE NOTICE '🎉 2024年真题导入成功！';
    RAISE NOTICE '';
    RAISE NOTICE '👉 现在可以测试了：';
    RAISE NOTICE '   1. 启动开发服务器：npm run dev';
    RAISE NOTICE '   2. 访问：http://localhost:3000/practice';
    RAISE NOTICE '   3. 点击"历年真题"';
    RAISE NOTICE '   4. 应该看到"2024年真题 - % 道题"', 题目2024;
  ELSE
    RAISE NOTICE '⚠️  2024年真题数量不足（仅%道）', 题目2024;
    RAISE NOTICE '   请重新执行：第2步-导入2024年真题.sql';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
