-- 知识点树状结构表
-- 用于存储药学知识点的层级结构（章节 -> 小节 -> 知识点）

-- 1. 创建知识树节点表
CREATE TABLE IF NOT EXISTS knowledge_tree (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL,                    -- 编码，如 "2.1.1"
    title TEXT NOT NULL,                   -- 标题
    content TEXT,                          -- 内容（仅知识点有）
    node_type TEXT NOT NULL,               -- 节点类型: chapter/section/knowledge_point
    point_type TEXT,                       -- 知识点类型: 适应证/禁忌/不良反应等
    drug_name TEXT,                        -- 所属药物名称
    importance INT DEFAULT 3,              -- 重要性 1-5
    memory_tips TEXT,                      -- 记忆口诀
    parent_id TEXT REFERENCES knowledge_tree(id) ON DELETE CASCADE,
    subject_code TEXT NOT NULL,            -- 科目代码
    level INT NOT NULL,                    -- 层级: 1=章, 2=节, 3=知识点
    sort_order INT DEFAULT 0,              -- 排序
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_knowledge_tree_code ON knowledge_tree(code);
CREATE INDEX IF NOT EXISTS idx_knowledge_tree_parent ON knowledge_tree(parent_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_tree_subject ON knowledge_tree(subject_code);
CREATE INDEX IF NOT EXISTS idx_knowledge_tree_type ON knowledge_tree(node_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_tree_importance ON knowledge_tree(importance DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_tree_drug ON knowledge_tree(drug_name);

-- 3. 创建用户知识点掌握度表
CREATE TABLE IF NOT EXISTS user_knowledge_mastery (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    knowledge_point_id TEXT NOT NULL REFERENCES knowledge_tree(id) ON DELETE CASCADE,
    total_attempts INT DEFAULT 0,          -- 总答题次数
    correct_attempts INT DEFAULT 0,        -- 正确次数
    mastery_score DECIMAL(5,2) DEFAULT 0,  -- 掌握度分数 0-100
    last_review_at TIMESTAMPTZ,            -- 上次复习时间
    next_review_at TIMESTAMPTZ,            -- 下次建议复习时间（艾宾浩斯）
    is_weak_point BOOLEAN DEFAULT FALSE,   -- 是否为薄弱点
    is_mastered BOOLEAN DEFAULT FALSE,     -- 是否已掌握
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, knowledge_point_id)
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_mastery_user ON user_knowledge_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mastery_point ON user_knowledge_mastery(knowledge_point_id);
CREATE INDEX IF NOT EXISTS idx_user_mastery_weak ON user_knowledge_mastery(user_id, is_weak_point) WHERE is_weak_point = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_mastery_review ON user_knowledge_mastery(user_id, next_review_at);

-- 5. 创建学习记录表
CREATE TABLE IF NOT EXISTS learning_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    knowledge_point_id TEXT REFERENCES knowledge_tree(id) ON DELETE SET NULL,
    question_id TEXT,                      -- 关联的题目ID
    action_type TEXT NOT NULL,             -- 动作类型: answer/review/mark
    is_correct BOOLEAN,                    -- 是否正确（答题时）
    time_spent INT,                        -- 花费时间（秒）
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 创建索引
CREATE INDEX IF NOT EXISTS idx_learning_records_user ON learning_records(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_date ON learning_records(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_records_point ON learning_records(knowledge_point_id);

-- 7. 创建更新掌握度的函数
CREATE OR REPLACE FUNCTION update_mastery_score()
RETURNS TRIGGER AS $$
BEGIN
    -- 更新掌握度
    UPDATE user_knowledge_mastery
    SET 
        total_attempts = total_attempts + 1,
        correct_attempts = correct_attempts + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
        mastery_score = LEAST(100, GREATEST(0, 
            (correct_attempts + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END)::DECIMAL / 
            NULLIF(total_attempts + 1, 0) * 100
        )),
        last_review_at = NOW(),
        -- 艾宾浩斯遗忘曲线：根据掌握度计算下次复习时间
        next_review_at = NOW() + INTERVAL '1 day' * POWER(2, FLOOR(mastery_score / 20)),
        is_weak_point = (mastery_score < 60),
        is_mastered = (mastery_score >= 80),
        updated_at = NOW()
    WHERE user_id = NEW.user_id AND knowledge_point_id = NEW.knowledge_point_id;
    
    -- 如果记录不存在，创建新记录
    IF NOT FOUND THEN
        INSERT INTO user_knowledge_mastery (
            user_id, knowledge_point_id, total_attempts, correct_attempts,
            mastery_score, last_review_at, next_review_at, is_weak_point
        ) VALUES (
            NEW.user_id, NEW.knowledge_point_id, 1,
            CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
            CASE WHEN NEW.is_correct THEN 100 ELSE 0 END,
            NOW(),
            NOW() + INTERVAL '1 day',
            NOT NEW.is_correct
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 创建触发器
DROP TRIGGER IF EXISTS trigger_update_mastery ON learning_records;
CREATE TRIGGER trigger_update_mastery
    AFTER INSERT ON learning_records
    FOR EACH ROW
    WHEN (NEW.action_type = 'answer' AND NEW.knowledge_point_id IS NOT NULL)
    EXECUTE FUNCTION update_mastery_score();

-- 9. 创建获取章节掌握度的视图
CREATE OR REPLACE VIEW chapter_mastery_view AS
SELECT 
    kt.id AS chapter_id,
    kt.code AS chapter_code,
    kt.title AS chapter_title,
    kt.subject_code,
    ukm.user_id,
    COUNT(DISTINCT kp.id) AS total_points,
    COUNT(DISTINCT CASE WHEN ukm.is_mastered THEN kp.id END) AS mastered_points,
    COALESCE(AVG(ukm.mastery_score), 0) AS avg_mastery_score
FROM knowledge_tree kt
LEFT JOIN knowledge_tree sec ON sec.parent_id = kt.id AND sec.node_type = 'section'
LEFT JOIN knowledge_tree kp ON kp.parent_id = sec.id AND kp.node_type = 'knowledge_point'
LEFT JOIN user_knowledge_mastery ukm ON ukm.knowledge_point_id = kp.id
WHERE kt.node_type = 'chapter'
GROUP BY kt.id, kt.code, kt.title, kt.subject_code, ukm.user_id;

COMMENT ON TABLE knowledge_tree IS '知识点树状结构表，存储章节、小节、知识点的层级关系';
COMMENT ON TABLE user_knowledge_mastery IS '用户知识点掌握度表，记录用户对每个知识点的掌握情况';
COMMENT ON TABLE learning_records IS '学习记录表，记录用户的每次学习行为';
