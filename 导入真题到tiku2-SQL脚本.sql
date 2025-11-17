-- ========================================
-- 2024年执业药师中药学综合知识与技能真题
-- 在 Supabase Dashboard 的 SQL Editor 中运行此脚本
-- ========================================

-- 清空现有的2024年真题（如果重复导入）
-- DELETE FROM questions WHERE '2024年真题' = ANY(knowledge_points);

-- 导入2024年真题
INSERT INTO questions (
  exam_type,
  subject,
  chapter,
  question_type,
  content,
  options,
  correct_answer,
  explanation,
  difficulty,
  knowledge_points,
  is_published,
  created_at,
  updated_at
) VALUES
-- 第1题：最佳选择题
(
  '执业药师',
  '中药学综合知识与技能',
  '中医基础理论',
  'single',
  '属于"阳脉之海"的是',
  '[
    {"key": "A", "value": "阳维之脉"},
    {"key": "B", "value": "阳跷之脉"},
    {"key": "C", "value": "督脉"},
    {"key": "D", "value": "带脉"},
    {"key": "E", "value": "任脉"}
  ]'::jsonb,
  'C',
  '督脉为"阳脉之海"。任脉为"阴脉之海"。',
  2,
  ARRAY['经络学说', '高频考点', '2024年真题'],
  true,
  NOW(),
  NOW()
),

-- 第2题：中药贮藏
(
  '执业药师',
  '中药学综合知识与技能',
  '中药贮藏与养护',
  'single',
  '《中国药典》"凡例"中贮藏项下各名词术语进行了解释，关于中药贮藏名词说法，正确的是',
  '[
    {"key": "A", "value": "密封系指将容器密闭，以防止尘及异物进入"},
    {"key": "B", "value": "遮光系指避免日光直射"},
    {"key": "C", "value": "阴凉处系指不超过20°C的环境"},
    {"key": "D", "value": "冷处系指0~8°C的环境"},
    {"key": "E", "value": "常温系指10~25°C的环境"}
  ]'::jsonb,
  'C',
  '阴凉处系指不超过20°C的环境。',
  2,
  ARRAY['中药贮藏', '药典', '2024年真题'],
  true,
  NOW(),
  NOW()
),

-- 第3题：中药调剂
(
  '执业药师',
  '中药学综合知识与技能',
  '中药调剂',
  'single',
  '根据《医疗机构中药煎药室管理规范》，关于中药煎药室管理的说法，错误的是',
  '[
    {"key": "A", "value": "煎药人员应当熟悉中药饮片性能和煎药操作规程"},
    {"key": "B", "value": "煎药室应当配备必要的煎药设备和质量检测设备"},
    {"key": "C", "value": "煎药用水应当符合饮用水标准"},
    {"key": "D", "value": "代煎药品不得使用含朱砂、雄黄等矿物类药材"},
    {"key": "E", "value": "煎好的药液应当在4小时内包装"}
  ]'::jsonb,
  'E',
  '煎好的药液应当及时滤过，并在2小时内包装。',
  3,
  ARRAY['中药煎药', '管理规范', '2024年真题'],
  true,
  NOW(),
  NOW()
);

-- 查询导入结果
SELECT 
  COUNT(*) as total_questions,
  COUNT(*) FILTER (WHERE '2024年真题' = ANY(knowledge_points)) as questions_2024,
  COUNT(*) FILTER (WHERE subject = '中药学综合知识与技能') as zhongyao_questions
FROM questions;

-- 显示最近导入的题目
SELECT 
  id,
  exam_type,
  subject,
  LEFT(content, 50) || '...' as content_preview,
  correct_answer,
  knowledge_points,
  created_at
FROM questions
WHERE '2024年真题' = ANY(knowledge_points)
ORDER BY created_at DESC
LIMIT 10;
