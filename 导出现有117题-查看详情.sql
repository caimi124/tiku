-- ================================================================
-- 导出现有117道题的完整详情
-- 在Supabase SQL编辑器中运行
-- ================================================================

-- 📊 方式1：查看所有题目概览（按题型分组）
-- ================================================================
WITH numbered_questions AS (
  SELECT 
    ROW_NUMBER() OVER (ORDER BY 
      CASE question_type
        WHEN 'single' THEN 1
        WHEN 'match' THEN 2
        WHEN 'comprehensive' THEN 3
        WHEN 'multiple' THEN 4
        ELSE 5
      END,
      created_at ASC
    ) as "全局序号",
    ROW_NUMBER() OVER (PARTITION BY question_type ORDER BY created_at ASC) as "题型内序号",
    id,
    question_type,
    content,
    options::text as options_json,
    correct_answer,
    explanation,
    chapter,
    knowledge_points,
    created_at
  FROM questions 
  WHERE exam_type = '执业药师' 
    AND subject = '中药学综合知识与技能' 
    AND source_year = 2024
)
SELECT 
  "全局序号" as "总序号",
  CASE question_type
    WHEN 'single' THEN '一、最佳选择题 [第' || "题型内序号"::text || '/40题]'
    WHEN 'match' THEN '二、配伍选择题 [第' || "题型内序号"::text || '/50题]'
    WHEN 'comprehensive' THEN '三、综合分析题 [第' || "题型内序号"::text || '/20题]'
    WHEN 'multiple' THEN '四、多项选择题 [第' || "题型内序号"::text || '/10题]'
    ELSE question_type
  END as "题型位置",
  LEFT(content, 60) as "题目内容（前60字）",
  correct_answer as "答案",
  chapter as "章节"
FROM numbered_questions
ORDER BY "全局序号";

-- ================================================================
-- 📊 方式2：按题型分别导出完整题目（适合复制到Excel）
-- ================================================================

-- 一、最佳选择题（63道）
SELECT 
  '最佳选择题' as type,
  ROW_NUMBER() OVER (ORDER BY created_at) as num,
  content,
  options::text,
  correct_answer,
  explanation,
  chapter
FROM questions 
WHERE exam_type = '执业药师' 
  AND subject = '中药学综合知识与技能' 
  AND source_year = 2024
  AND question_type = 'single'
ORDER BY created_at;

-- 二、配伍选择题（32道）
SELECT 
  '配伍选择题' as type,
  ROW_NUMBER() OVER (ORDER BY created_at) as num,
  content,
  options::text,
  correct_answer,
  explanation,
  chapter
FROM questions 
WHERE exam_type = '执业药师' 
  AND subject = '中药学综合知识与技能' 
  AND source_year = 2024
  AND question_type = 'match'
ORDER BY created_at;

-- 三、综合分析题（12道）
SELECT 
  '综合分析题' as type,
  ROW_NUMBER() OVER (ORDER BY created_at) as num,
  content,
  options::text,
  correct_answer,
  explanation,
  chapter
FROM questions 
WHERE exam_type = '执业药师' 
  AND subject = '中药学综合知识与技能' 
  AND source_year = 2024
  AND question_type = 'comprehensive'
ORDER BY created_at;

-- 四、多项选择题（10道）
SELECT 
  '多项选择题' as type,
  ROW_NUMBER() OVER (ORDER BY created_at) as num,
  content,
  options::text,
  correct_answer,
  explanation,
  chapter
FROM questions 
WHERE exam_type = '执业药师' 
  AND subject = '中药学综合知识与技能' 
  AND source_year = 2024
  AND question_type = 'multiple'
ORDER BY created_at;

-- ================================================================
-- 📊 方式3：检查题型分布是否合理
-- ================================================================
WITH type_stats AS (
  SELECT 
    question_type,
    COUNT(*) as actual_count,
    CASE question_type
      WHEN 'single' THEN 40
      WHEN 'match' THEN 50
      WHEN 'comprehensive' THEN 20
      WHEN 'multiple' THEN 10
      ELSE 0
    END as expected_count
  FROM questions 
  WHERE exam_type = '执业药师' 
    AND subject = '中药学综合知识与技能' 
    AND source_year = 2024
  GROUP BY question_type
)
SELECT 
  CASE question_type
    WHEN 'single' THEN '一、最佳选择题'
    WHEN 'match' THEN '二、配伍选择题'
    WHEN 'comprehensive' THEN '三、综合分析题'
    WHEN 'multiple' THEN '四、多项选择题'
    ELSE question_type
  END as "题型",
  actual_count as "实际数量",
  expected_count as "标准数量",
  actual_count - expected_count as "差值",
  CASE 
    WHEN actual_count = expected_count THEN '✅ 正确'
    WHEN actual_count > expected_count THEN '⚠️ 多了 ' || (actual_count - expected_count)::text || ' 道'
    ELSE '⚠️ 少了 ' || (expected_count - actual_count)::text || ' 道'
  END as "状态"
FROM type_stats
ORDER BY 
  CASE question_type
    WHEN 'single' THEN 1
    WHEN 'match' THEN 2
    WHEN 'comprehensive' THEN 3
    WHEN 'multiple' THEN 4
    ELSE 5
  END;

-- ================================================================
-- 📊 方式4：导出为JSON格式（适合程序导入）
-- ================================================================
SELECT json_agg(
  json_build_object(
    'questionType', question_type,
    'content', content,
    'options', options,
    'correctAnswer', correct_answer,
    'explanation', explanation,
    'chapter', chapter,
    'knowledgePoints', knowledge_points,
    'difficulty', difficulty
  ) ORDER BY 
    CASE question_type
      WHEN 'single' THEN 1
      WHEN 'match' THEN 2
      WHEN 'comprehensive' THEN 3
      WHEN 'multiple' THEN 4
      ELSE 5
    END,
    created_at ASC
) as "完整JSON数据"
FROM questions 
WHERE exam_type = '执业药师' 
  AND subject = '中药学综合知识与技能' 
  AND source_year = 2024;

-- ================================================================
-- 📝 使用说明
-- ================================================================
-- 1. 将上述查询结果复制到Excel或文本文件
-- 2. 分析题型分布，看是否需要调整题型分类
-- 3. 找出缺失的3道题（对比120道标准）
-- 4. 如果题型分类错误，需要运行题型修正SQL
-- ================================================================
