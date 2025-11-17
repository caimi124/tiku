-- ========================================
-- 检查数据库真题状态
-- ========================================

-- 1. 查看所有年份的题目统计
SELECT 
  '年份统计' as 说明,
  source_year as 年份,
  COUNT(*) as 题目数,
  COUNT(DISTINCT chapter) as 章节数
FROM questions
WHERE subject = '中药学综合知识与技能'
GROUP BY source_year
ORDER BY source_year DESC NULLS LAST;

-- 2. 查看2024年真题详情
SELECT 
  '2024年真题详情' as 说明,
  COUNT(*) as 总数,
  COUNT(*) FILTER (WHERE question_type = 'single') as 单选题,
  COUNT(*) FILTER (WHERE question_type = 'multiple') as 多选题,
  MIN(id) as 最小ID,
  MAX(id) as 最大ID
FROM questions
WHERE source_year = 2024;

-- 3. 查看2023年真题详情
SELECT 
  '2023年真题详情' as 说明,
  COUNT(*) as 总数,
  COUNT(*) FILTER (WHERE question_type = 'single') as 单选题,
  COUNT(*) FILTER (WHERE question_type = 'multiple') as 多选题
FROM questions
WHERE source_year = 2023;

-- 4. 查看前5道2024年真题（检查是否正确导入）
SELECT 
  id as 题目ID,
  LEFT(content, 30) || '...' as 题目,
  correct_answer as 答案,
  source_year as 年份
FROM questions
WHERE source_year = 2024
ORDER BY id
LIMIT 5;

-- 5. 检查是否有重复的题目
SELECT 
  '重复检查' as 说明,
  id,
  COUNT(*) as 出现次数
FROM questions
GROUP BY id
HAVING COUNT(*) > 1;

-- 6. 查看题库总体情况
SELECT 
  '题库总览' as 说明,
  COUNT(*) as 总题数,
  COUNT(DISTINCT exam_type) as 考试类型数,
  COUNT(DISTINCT subject) as 科目数,
  COUNT(DISTINCT chapter) as 章节数
FROM questions;

-- 诊断结果说明
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 数据库诊断完成';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '请查看上方查询结果：';
  RAISE NOTICE '  1. 年份统计 - 各年份题目数量';
  RAISE NOTICE '  2. 2024年详情 - 题型分布';
  RAISE NOTICE '  3. 2023年详情 - 题型分布';
  RAISE NOTICE '  4. 题目示例 - 验证内容正确性';
  RAISE NOTICE '  5. 重复检查 - 是否有重复ID';
  RAISE NOTICE '  6. 题库总览 - 整体情况';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
