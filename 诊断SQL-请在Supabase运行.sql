-- ================================================================
-- 2024年执业药师中药综合真题完整诊断SQL
-- 请在Supabase SQL编辑器中运行
-- https://supabase.com/dashboard/project/tparjdkxxtnentsdazfw/sql
-- ================================================================

-- 1️⃣ 统计总题目数
-- ================================================================
SELECT 
  '总题目数' as "项目",
  COUNT(*) as "数量",
  CASE 
    WHEN COUNT(*) = 120 THEN '✅ 正确'
    WHEN COUNT(*) < 120 THEN '⚠️ 少了 ' || (120 - COUNT(*))::text || ' 道题'
    ELSE '⚠️ 多了 ' || (COUNT(*) - 120)::text || ' 道题'
  END as "状态"
FROM questions 
WHERE exam_type = '执业药师' 
  AND subject = '中药学综合知识与技能' 
  AND source_year = 2024;

-- 2️⃣ 按题型分类统计
-- ================================================================
SELECT 
  CASE question_type
    WHEN 'single' THEN '一、最佳选择题'
    WHEN 'match' THEN '二、配伍选择题'
    WHEN 'comprehensive' THEN '三、综合分析题'
    WHEN 'multiple' THEN '四、多项选择题'
    ELSE question_type
  END as "题型",
  question_type as "英文代码",
  COUNT(*) as "题目数",
  CASE question_type
    WHEN 'single' THEN 
      CASE 
        WHEN COUNT(*) = 40 THEN '✅ 正确'
        ELSE '⚠️ 应该40道'
      END
    WHEN 'match' THEN 
      CASE 
        WHEN COUNT(*) = 50 THEN '✅ 正确'
        ELSE '⚠️ 应该50道'
      END
    WHEN 'comprehensive' THEN 
      CASE 
        WHEN COUNT(*) = 20 THEN '✅ 正确'
        ELSE '⚠️ 应该20道'
      END
    WHEN 'multiple' THEN 
      CASE 
        WHEN COUNT(*) = 10 THEN '✅ 正确'
        ELSE '⚠️ 应该10道'
      END
    ELSE '❓ 未知题型'
  END as "状态"
FROM questions 
WHERE exam_type = '执业药师' 
  AND subject = '中药学综合知识与技能' 
  AND source_year = 2024
GROUP BY question_type
ORDER BY question_type;

-- 3️⃣ 检查重复题目
-- ================================================================
SELECT 
  '重复题目检查' as "检查项",
  COUNT(*) as "重复组数",
  SUM(duplicate_count - 1) as "多余题目数"
FROM (
  SELECT 
    content,
    COUNT(*) as duplicate_count
  FROM questions 
  WHERE exam_type = '执业药师' 
    AND subject = '中药学综合知识与技能' 
    AND source_year = 2024
  GROUP BY content
  HAVING COUNT(*) > 1
) duplicates;

-- 如果有重复，显示详情
SELECT 
  content as "重复的题目内容",
  COUNT(*) as "重复次数",
  string_agg(id::text, ', ') as "题目ID列表"
FROM questions 
WHERE exam_type = '执业药师' 
  AND subject = '中药学综合知识与技能' 
  AND source_year = 2024
GROUP BY content
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 4️⃣ 检查测试占位数据
-- ================================================================
SELECT 
  id,
  question_type,
  LEFT(content, 60) as "题目内容预览"
FROM questions 
WHERE exam_type = '执业药师' 
  AND subject = '中药学综合知识与技能' 
  AND source_year = 2024
  AND (
    content LIKE '%请将您的完整题目%'
    OR content LIKE '%保持原始格式%'
    OR content LIKE '%保存后告诉我%'
    OR content = '题目内容'
    OR content = ''
  );

-- 5️⃣ 查看所有题目列表（按创建时间）
-- ================================================================
SELECT 
  ROW_NUMBER() OVER (ORDER BY created_at ASC) as "序号",
  id as "题目ID",
  CASE question_type
    WHEN 'single' THEN '最佳'
    WHEN 'match' THEN '配伍'
    WHEN 'comprehensive' THEN '综合'
    WHEN 'multiple' THEN '多项'
    ELSE question_type
  END as "题型",
  LEFT(content, 50) as "题目内容（前50字）",
  created_at as "创建时间"
FROM questions 
WHERE exam_type = '执业药师' 
  AND subject = '中药学综合知识与技能' 
  AND source_year = 2024
ORDER BY created_at ASC;

-- 6️⃣ 按题型查看题目分布
-- ================================================================
WITH numbered_questions AS (
  SELECT 
    question_type,
    content,
    ROW_NUMBER() OVER (PARTITION BY question_type ORDER BY created_at ASC) as row_num
  FROM questions 
  WHERE exam_type = '执业药师' 
    AND subject = '中药学综合知识与技能' 
    AND source_year = 2024
)
SELECT 
  CASE question_type
    WHEN 'single' THEN '一、最佳选择题'
    WHEN 'match' THEN '二、配伍选择题'
    WHEN 'comprehensive' THEN '三、综合分析题'
    WHEN 'multiple' THEN '四、多项选择题'
    ELSE question_type
  END as "题型",
  COUNT(*) as "当前题目数",
  CASE question_type
    WHEN 'single' THEN '应该40道'
    WHEN 'match' THEN '应该50道'
    WHEN 'comprehensive' THEN '应该20道'
    WHEN 'multiple' THEN '应该10道'
    ELSE '未知'
  END as "标准数量",
  CASE 
    WHEN question_type = 'single' THEN '第1-40题'
    WHEN question_type = 'match' THEN '第41-90题'
    WHEN question_type = 'comprehensive' THEN '第91-110题'
    WHEN question_type = 'multiple' THEN '第111-120题'
    ELSE '未知范围'
  END as "应在题号范围"
FROM numbered_questions
GROUP BY question_type
ORDER BY 
  CASE question_type
    WHEN 'single' THEN 1
    WHEN 'match' THEN 2
    WHEN 'comprehensive' THEN 3
    WHEN 'multiple' THEN 4
    ELSE 5
  END;

-- 7️⃣ 数据完整性检查总结
-- ================================================================
SELECT 
  '数据完整性总结' as "报告",
  (SELECT COUNT(*) FROM questions 
   WHERE exam_type = '执业药师' 
     AND subject = '中药学综合知识与技能' 
     AND source_year = 2024) as "实际题目数",
  120 as "应有题目数",
  120 - (SELECT COUNT(*) FROM questions 
   WHERE exam_type = '执业药师' 
     AND subject = '中药学综合知识与技能' 
     AND source_year = 2024) as "缺少题目数",
  (SELECT COUNT(*) FROM (
    SELECT content FROM questions 
    WHERE exam_type = '执业药师' 
      AND subject = '中药学综合知识与技能' 
      AND source_year = 2024
    GROUP BY content
    HAVING COUNT(*) > 1
  ) dup) as "重复题目组数",
  (SELECT COUNT(*) FROM questions 
   WHERE exam_type = '执业药师' 
     AND subject = '中药学综合知识与技能' 
     AND source_year = 2024
     AND (content LIKE '%请将您的完整题目%'
          OR content = '题目内容')) as "测试数据数";

-- ================================================================
-- 执行完成后，请将结果截图或复制给我，我将为您生成修复方案
-- ================================================================
