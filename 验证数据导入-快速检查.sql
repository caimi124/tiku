-- 快速验证2024年真题是否导入成功
SELECT 
  '2024年真题数量' as 检查项,
  COUNT(*) as 数量
FROM questions
WHERE source_year = 2024;

-- 查看示例题目
SELECT 
  id,
  LEFT(content, 50) || '...' as 题目,
  correct_answer as 答案
FROM questions
WHERE source_year = 2024
LIMIT 3;
