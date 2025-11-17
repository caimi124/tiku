-- ========================================
-- 清除2024年真题并重新导入
-- ========================================

-- 第1步：查看当前2024年真题数量
SELECT 
  '导入前统计' as 说明,
  COUNT(*) as 题目数
FROM questions
WHERE source_year = 2024;

-- 第2步：删除2024年真题（安全删除）
DELETE FROM questions
WHERE source_year = 2024 
  AND subject = '中药学综合知识与技能';

-- 确认删除结果
SELECT 
  '删除后统计' as 说明,
  COUNT(*) as 题目数
FROM questions
WHERE source_year = 2024;

-- 第3步：现在可以运行导入脚本了
-- 打开 "⚡导入2024真题-快速脚本.sql" 并执行

-- ========================================
-- 提示信息
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ 2024年真题已清除！';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '下一步：';
  RAISE NOTICE '  1. 执行完成后，关闭当前查询';
  RAISE NOTICE '  2. 打开"⚡导入2024真题-快速脚本.sql"';
  RAISE NOTICE '  3. 复制全部内容';
  RAISE NOTICE '  4. 粘贴到SQL Editor';
  RAISE NOTICE '  5. 点击Run执行';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
