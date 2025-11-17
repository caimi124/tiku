-- ========================================
-- 🔍 诊断：为什么前端没有显示历年真题
-- ========================================

-- 第1步：检查字段是否存在
SELECT 
  '1. 检查字段' as 诊断步骤,
  column_name as 字段名,
  data_type as 类型
FROM information_schema.columns 
WHERE table_name = 'questions' 
  AND column_name IN ('source_type', 'source_year');

-- 第2步：检查2024年真题数量
SELECT 
  '2. 检查2024年真题' as 诊断步骤,
  COUNT(*) as 题目数量
FROM questions
WHERE source_year = 2024;

-- 第3步：检查所有年份的题目
SELECT 
  '3. 所有年份题目' as 诊断步骤,
  source_year as 年份,
  COUNT(*) as 数量
FROM questions
GROUP BY source_year
ORDER BY source_year DESC NULLS LAST;

-- 第4步：查看2024年真题详情
SELECT 
  '4. 2024年真题示例' as 诊断步骤,
  id,
  LEFT(content, 40) || '...' as 题目,
  correct_answer as 答案,
  source_year as 年份
FROM questions
WHERE source_year = 2024
LIMIT 5;

-- 第5步：检查题目总数
SELECT 
  '5. 题目总数' as 诊断步骤,
  COUNT(*) as 总数,
  COUNT(*) FILTER (WHERE source_year IS NOT NULL) as 有年份的,
  COUNT(*) FILTER (WHERE source_year IS NULL) as 没年份的
FROM questions;

-- ========================================
-- 诊断结果说明
-- ========================================

DO $$
DECLARE
  字段数 INTEGER;
  题目2024 INTEGER;
  题目总数 INTEGER;
BEGIN
  -- 检查字段
  SELECT COUNT(*) INTO 字段数
  FROM information_schema.columns 
  WHERE table_name = 'questions' 
    AND column_name IN ('source_type', 'source_year');
  
  -- 检查2024年题目
  SELECT COUNT(*) INTO 题目2024
  FROM questions
  WHERE source_year = 2024;
  
  -- 检查总题目
  SELECT COUNT(*) INTO 题目总数
  FROM questions;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 诊断结果';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- 检查1：字段
  IF 字段数 = 2 THEN
    RAISE NOTICE '✅ 字段检查通过：source_year 和 source_type 字段存在';
  ELSE
    RAISE NOTICE '❌ 字段缺失：只找到 % 个字段', 字段数;
    RAISE NOTICE '   解决方案：执行 第1步-更新数据库结构.sql';
  END IF;
  
  RAISE NOTICE '';
  
  -- 检查2：数据
  IF 题目2024 > 0 THEN
    RAISE NOTICE '✅ 数据检查通过：2024年真题有 % 道', 题目2024;
  ELSE
    RAISE NOTICE '❌ 数据缺失：2024年真题数量为 0';
    RAISE NOTICE '   解决方案：执行 第2步-导入2024年真题.sql';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '题库总题目数：%', 题目总数;
  RAISE NOTICE '';
  
  -- 给出具体建议
  IF 字段数 < 2 THEN
    RAISE NOTICE '🔧 立即执行：';
    RAISE NOTICE '   1. 打开 第1步-更新数据库结构.sql';
    RAISE NOTICE '   2. 复制所有内容到 Supabase SQL Editor';
    RAISE NOTICE '   3. 点击 Run 执行';
  ELSIF 题目2024 = 0 THEN
    RAISE NOTICE '🔧 立即执行：';
    RAISE NOTICE '   1. 打开 第2步-导入2024年真题.sql';
    RAISE NOTICE '   2. 复制所有内容到 Supabase SQL Editor';
    RAISE NOTICE '   3. 点击 Run 执行';
  ELSE
    RAISE NOTICE '🎉 数据库检查完全通过！';
    RAISE NOTICE '';
    RAISE NOTICE '如果前端仍显示"暂无相关资料"，可能原因：';
    RAISE NOTICE '   1. 浏览器缓存：按 Ctrl + Shift + R 强制刷新';
    RAISE NOTICE '   2. API缓存：等待1-2分钟后重试';
    RAISE NOTICE '   3. Vercel部署：检查部署是否完成';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
