-- ========================================
-- 执业药师题库平台 - 完整数据库结构
-- 在 Supabase Dashboard SQL Editor 中运行
-- ========================================

-- ========================================
-- 第一部分：题库核心表
-- ========================================

-- 1. 题目表（核心表）
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  exam_type TEXT NOT NULL,                -- 考试类型：执业药师、药学职称等
  subject TEXT NOT NULL,                  -- 科目：中药学综合知识与技能等
  chapter TEXT,                           -- 章节
  question_type TEXT NOT NULL,            -- 题型：single(单选)/multiple(多选)/judge(判断)
  content TEXT NOT NULL,                  -- 题目内容
  options JSONB NOT NULL,                 -- 选项 [{key: 'A', value: '...'}]
  correct_answer TEXT NOT NULL,           -- 正确答案：A 或 AB 或 true/false
  explanation TEXT,                       -- 解析
  ai_explanation TEXT,                    -- AI生成的解析
  difficulty INTEGER DEFAULT 1,           -- 难度：1-5
  knowledge_points TEXT[] DEFAULT '{}',   -- 知识点标签数组
  source_type TEXT,                       -- 来源类型：真题/押题/模拟题/章节练习
  source_institution TEXT,                -- 来源机构
  source_year INTEGER,                    -- 年份
  is_published BOOLEAN DEFAULT true,      -- 是否发布
  view_count INTEGER DEFAULT 0,           -- 查看次数
  correct_count INTEGER DEFAULT 0,        -- 答对次数
  answer_count INTEGER DEFAULT 0,         -- 答题总次数
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_questions_exam_type ON questions(exam_type);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_source_type ON questions(source_type);
CREATE INDEX IF NOT EXISTS idx_questions_source_year ON questions(source_year);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_published ON questions(is_published);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);

-- GIN索引用于知识点数组搜索
CREATE INDEX IF NOT EXISTS idx_questions_knowledge_points ON questions USING GIN(knowledge_points);

COMMENT ON TABLE questions IS '题目表 - 存储所有类型的题目';
COMMENT ON COLUMN questions.options IS 'JSONB格式的选项，例如：[{"key":"A","value":"选项内容"}]';
COMMENT ON COLUMN questions.knowledge_points IS '知识点标签数组，用于分类和搜索';

-- ========================================
-- 2. 机构表
CREATE TABLE IF NOT EXISTS institutions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,              -- 机构名称
  description TEXT,                       -- 机构描述
  logo_url TEXT,                          -- Logo URL
  website TEXT,                           -- 官网
  accuracy_rate DECIMAL(5,2),             -- 总体命中率(%)
  total_predictions INTEGER DEFAULT 0,    -- 总押题数
  correct_predictions INTEGER DEFAULT 0,  -- 总命中数
  reputation_score DECIMAL(5,2),          -- 信誉评分(1-5)
  is_verified BOOLEAN DEFAULT false,      -- 是否认证
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_institutions_accuracy ON institutions(accuracy_rate DESC);
CREATE INDEX IF NOT EXISTS idx_institutions_reputation ON institutions(reputation_score DESC);

COMMENT ON TABLE institutions IS '培训机构表 - 存储各培训机构信息';

-- ========================================
-- 3. 押题卷表
CREATE TABLE IF NOT EXISTS prediction_papers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  institution_id TEXT REFERENCES institutions(id) ON DELETE CASCADE,
  exam_year INTEGER NOT NULL,             -- 考试年份
  subject TEXT NOT NULL,                  -- 科目
  paper_name TEXT NOT NULL,               -- 卷名
  paper_type TEXT,                        -- 类型：押题卷/模拟卷/冲刺卷
  question_ids TEXT[],                    -- 题目ID列表
  total_questions INTEGER,                -- 总题数
  publish_date DATE,                      -- 发布日期
  actual_exam_date DATE,                  -- 实际考试日期
  hit_count INTEGER DEFAULT 0,            -- 命中题数
  hit_rate DECIMAL(5,2),                  -- 命中率(%)
  similarity_score DECIMAL(5,2),          -- AI分析的相似度分数
  analysis_result JSONB,                  -- AI分析详细结果
  is_analyzed BOOLEAN DEFAULT false,      -- 是否已分析
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prediction_papers_institution ON prediction_papers(institution_id);
CREATE INDEX IF NOT EXISTS idx_prediction_papers_year ON prediction_papers(exam_year);
CREATE INDEX IF NOT EXISTS idx_prediction_papers_subject ON prediction_papers(subject);
CREATE INDEX IF NOT EXISTS idx_prediction_papers_hit_rate ON prediction_papers(hit_rate DESC);

COMMENT ON TABLE prediction_papers IS '押题卷表 - 存储各机构的押题卷信息';

-- ========================================
-- 4. 知识点表
CREATE TABLE IF NOT EXISTS knowledge_points (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  exam_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  section TEXT,                           -- 章节小节
  point_name TEXT NOT NULL,               -- 知识点名称
  point_content TEXT,                     -- 知识点内容
  importance_level INTEGER,               -- 重要程度(1-5)
  frequency INTEGER DEFAULT 0,            -- 历年出现频次
  exam_years INTEGER[],                   -- 出现过的年份数组
  related_questions TEXT[],               -- 关联题目ID数组
  pdf_url TEXT,                           -- 关联PDF URL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_points_exam_type ON knowledge_points(exam_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_points_subject ON knowledge_points(subject);
CREATE INDEX IF NOT EXISTS idx_knowledge_points_chapter ON knowledge_points(chapter);
CREATE INDEX IF NOT EXISTS idx_knowledge_points_importance ON knowledge_points(importance_level DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_points_frequency ON knowledge_points(frequency DESC);

COMMENT ON TABLE knowledge_points IS '知识点表 - 存储各章节知识点及其重要性';

-- ========================================
-- 第二部分：用户学习相关表
-- ========================================

-- 5. 用户扩展信息表（Supabase Auth已有基础用户表）
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  avatar_url TEXT,
  target_exam TEXT,                       -- 目标考试
  target_subjects TEXT[],                 -- 目标科目数组
  target_year INTEGER,                    -- 目标年份
  study_start_date DATE,                  -- 开始学习日期
  study_days INTEGER DEFAULT 0,           -- 累计学习天数
  total_questions INTEGER DEFAULT 0,      -- 总答题数
  correct_questions INTEGER DEFAULT 0,    -- 总正确数
  total_study_time INTEGER DEFAULT 0,     -- 总学习时长(分钟)
  level INTEGER DEFAULT 1,                -- 等级
  experience_points INTEGER DEFAULT 0,    -- 经验值
  is_vip BOOLEAN DEFAULT false,           -- 是否会员
  vip_expire_date DATE,                   -- 会员过期日期
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_target_exam ON user_profiles(target_exam);
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(level DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_vip ON user_profiles(is_vip);

COMMENT ON TABLE user_profiles IS '用户扩展信息表 - 存储用户学习相关信息';

-- ========================================
-- 6. 答题记录表
CREATE TABLE IF NOT EXISTS user_answers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
  user_answer TEXT,                       -- 用户答案
  is_correct BOOLEAN,                     -- 是否正确
  time_spent INTEGER,                     -- 答题耗时(秒)
  practice_mode TEXT,                     -- 练习模式：章节/随机/模拟/错题
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_is_correct ON user_answers(is_correct);
CREATE INDEX IF NOT EXISTS idx_user_answers_answered_at ON user_answers(answered_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_question ON user_answers(user_id, question_id);

COMMENT ON TABLE user_answers IS '答题记录表 - 记录用户每次答题的详细信息';

-- ========================================
-- 7. 学习计划表
CREATE TABLE IF NOT EXISTS study_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,                -- 计划名称
  plan_type TEXT,                         -- 计划类型：30天冲刺/90天备考等
  target_date DATE,                       -- 目标日期
  daily_questions INTEGER DEFAULT 50,     -- 每日题数目标
  daily_study_time INTEGER DEFAULT 120,   -- 每日学习时长目标(分钟)
  weak_chapters TEXT[],                   -- 薄弱章节
  focus_points TEXT[],                    -- 重点关注知识点
  completed_days INTEGER DEFAULT 0,       -- 已完成天数
  status TEXT DEFAULT 'active',           -- 状态：active/paused/completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_status ON study_plans(status);

COMMENT ON TABLE study_plans IS '学习计划表 - 存储用户的学习计划';

-- ========================================
-- 8. 用户评估记录表
CREATE TABLE IF NOT EXISTS user_assessments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type TEXT,                   -- 评估类型：入学测试/阶段测试
  exam_type TEXT,                         -- 考试类型
  subjects TEXT[],                        -- 测试科目
  total_questions INTEGER,                -- 总题数
  correct_count INTEGER,                  -- 正确数
  score DECIMAL(5,2),                     -- 分数
  time_spent INTEGER,                     -- 耗时(分钟)
  weak_chapters JSONB,                    -- 薄弱章节 {章节: 错误率}
  weak_points JSONB,                      -- 薄弱知识点
  strong_points JSONB,                    -- 强项知识点
  recommendations JSONB,                  -- 学习建议
  recommended_pdfs TEXT[],                -- 推荐PDF ID数组
  assessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_assessed_at ON user_assessments(assessed_at DESC);

COMMENT ON TABLE user_assessments IS '评估记录表 - 存储用户水平测试结果和分析';

-- ========================================
-- 第三部分：资源管理表
-- ========================================

-- 9. PDF资源表
CREATE TABLE IF NOT EXISTS pdf_resources (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,                    -- 标题
  description TEXT,                       -- 描述
  category TEXT NOT NULL,                 -- 分类：章节/高频考点/考试大纲/押题解析
  exam_type TEXT,                         -- 考试类型
  subject TEXT,                           -- 科目
  chapter TEXT,                           -- 章节
  file_path TEXT NOT NULL,                -- Storage中的文件路径
  file_url TEXT,                          -- 公开访问URL
  file_size INTEGER,                      -- 文件大小(字节)
  page_count INTEGER,                     -- 页数
  thumbnail_url TEXT,                     -- 缩略图
  tags TEXT[],                            -- 标签数组
  download_count INTEGER DEFAULT 0,       -- 下载次数
  view_count INTEGER DEFAULT 0,           -- 查看次数
  is_premium BOOLEAN DEFAULT false,       -- 是否付费资源
  is_published BOOLEAN DEFAULT true,      -- 是否发布
  published_at TIMESTAMPTZ,               -- 发布时间
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pdf_resources_category ON pdf_resources(category);
CREATE INDEX IF NOT EXISTS idx_pdf_resources_exam_type ON pdf_resources(exam_type);
CREATE INDEX IF NOT EXISTS idx_pdf_resources_subject ON pdf_resources(subject);
CREATE INDEX IF NOT EXISTS idx_pdf_resources_chapter ON pdf_resources(chapter);
CREATE INDEX IF NOT EXISTS idx_pdf_resources_is_premium ON pdf_resources(is_premium);
CREATE INDEX IF NOT EXISTS idx_pdf_resources_download_count ON pdf_resources(download_count DESC);

COMMENT ON TABLE pdf_resources IS 'PDF资源表 - 存储各类学习资料PDF信息';

-- ========================================
-- 10. AI生成题目记录表
CREATE TABLE IF NOT EXISTS ai_generated_questions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  source_question_ids TEXT[],             -- 参考题目ID数组
  generated_question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
  ai_model TEXT,                          -- AI模型：gpt-4/gpt-3.5-turbo等
  prompt TEXT,                            -- 使用的提示词
  generation_params JSONB,                -- 生成参数
  quality_score DECIMAL(3,2),             -- 质量评分(0-1)
  human_reviewed BOOLEAN DEFAULT false,   -- 是否人工审核
  approved BOOLEAN,                       -- 是否通过审核
  reviewer_id UUID REFERENCES auth.users(id),
  reviewer_notes TEXT,                    -- 审核意见
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ai_questions_generated_id ON ai_generated_questions(generated_question_id);
CREATE INDEX IF NOT EXISTS idx_ai_questions_human_reviewed ON ai_generated_questions(human_reviewed);
CREATE INDEX IF NOT EXISTS idx_ai_questions_approved ON ai_generated_questions(approved);

COMMENT ON TABLE ai_generated_questions IS 'AI生成题目记录表 - 追踪AI生成的题目及审核状态';

-- ========================================
-- 11. 错题本表
CREATE TABLE IF NOT EXISTS wrong_questions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
  wrong_count INTEGER DEFAULT 1,          -- 错误次数
  first_wrong_at TIMESTAMPTZ DEFAULT NOW(), -- 第一次做错时间
  last_wrong_at TIMESTAMPTZ DEFAULT NOW(),  -- 最后做错时间
  is_mastered BOOLEAN DEFAULT false,      -- 是否已掌握
  mastered_at TIMESTAMPTZ,                -- 掌握时间
  notes TEXT,                             -- 用户笔记
  UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_wrong_questions_user_id ON wrong_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_wrong_questions_is_mastered ON wrong_questions(is_mastered);
CREATE INDEX IF NOT EXISTS idx_wrong_questions_wrong_count ON wrong_questions(wrong_count DESC);

COMMENT ON TABLE wrong_questions IS '错题本表 - 记录用户的错题';

-- ========================================
-- 12. 学习统计表（按日汇总）
CREATE TABLE IF NOT EXISTS daily_stats (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,                -- 统计日期
  questions_answered INTEGER DEFAULT 0,   -- 答题数
  correct_count INTEGER DEFAULT 0,        -- 正确数
  study_time INTEGER DEFAULT 0,           -- 学习时长(分钟)
  chapters_studied TEXT[],                -- 学习的章节
  new_weak_points TEXT[],                 -- 新发现的薄弱点
  mastered_points TEXT[],                 -- 掌握的知识点
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, stat_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(stat_date DESC);

COMMENT ON TABLE daily_stats IS '每日学习统计表 - 按日汇总用户学习数据';

-- ========================================
-- 第四部分：系统管理表
-- ========================================

-- 13. 系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE system_configs IS '系统配置表 - 存储系统级配置';

-- 插入初始配置
INSERT INTO system_configs (key, value, description) VALUES
  ('exam_types', '["执业药师", "药学职称", "执业中药师"]', '支持的考试类型'),
  ('subjects', '{"执业药师": ["中药学综合知识与技能", "中药学专业知识一", "中药学专业知识二", "药事管理与法规"]}', '各考试类型的科目'),
  ('difficulty_levels', '[1, 2, 3, 4, 5]', '难度等级'),
  ('question_types', '{"single": "单选题", "multiple": "多选题", "judge": "判断题"}', '题目类型')
ON CONFLICT (key) DO NOTHING;

-- ========================================
-- 创建更新时间触发器
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加触发器
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prediction_papers_updated_at BEFORE UPDATE ON prediction_papers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_points_updated_at BEFORE UPDATE ON knowledge_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_plans_updated_at BEFORE UPDATE ON study_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pdf_resources_updated_at BEFORE UPDATE ON pdf_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 验证表创建
-- ========================================

-- 查询所有创建的表
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ========================================
-- 完成提示
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ 数据库表结构创建完成！';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '已创建以下表：';
  RAISE NOTICE '  1. questions - 题目表';
  RAISE NOTICE '  2. institutions - 机构表';
  RAISE NOTICE '  3. prediction_papers - 押题卷表';
  RAISE NOTICE '  4. knowledge_points - 知识点表';
  RAISE NOTICE '  5. user_profiles - 用户信息表';
  RAISE NOTICE '  6. user_answers - 答题记录表';
  RAISE NOTICE '  7. study_plans - 学习计划表';
  RAISE NOTICE '  8. user_assessments - 评估记录表';
  RAISE NOTICE '  9. pdf_resources - PDF资源表';
  RAISE NOTICE '  10. ai_generated_questions - AI生成题目表';
  RAISE NOTICE '  11. wrong_questions - 错题本表';
  RAISE NOTICE '  12. daily_stats - 每日统计表';
  RAISE NOTICE '  13. system_configs - 系统配置表';
  RAISE NOTICE '';
  RAISE NOTICE '下一步：';
  RAISE NOTICE '  1. 配置 Storage Buckets';
  RAISE NOTICE '  2. 设置 RLS 安全策略';
  RAISE NOTICE '  3. 导入初始数据';
  RAISE NOTICE '========================================';
END $$;
