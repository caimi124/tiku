-- 快速检查：2024年真题是否已导入

SELECT COUNT(*) as "2024年真题数量" 
FROM questions 
WHERE source_year = 2024;

-- 如果返回 0，说明数据未导入
-- 如果返回 10，说明数据已导入

-- 查看示例题目
SELECT 
  id,
  content,
  source_year
FROM questions
WHERE source_year = 2024
LIMIT 3;
