-- 智能学习系统数据库表增强
-- 用于支持掌握度追踪、学习计划和每日统计功能

-- ========================================
-- 1. 增强 study_plans 表（如果需要新字段）
-- ========================================

-- 添加目标考试日期字段（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'study_plans' AND column_name = 'target_exam_date') THEN
        ALTER TABLE study_plans ADD COLUMN target_exam_date DATE;
    END IF;
END $$;

-- 添加每日目标学习时长字段
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'study_plans' AND column_name = 'daily_target_minutes') THEN
        ALTER TABLE study_plans ADD COLUMN daily_target_minutes INT DEFAULT 60;
    END IF;
END $$;

-- 添加每日目标题数字段
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'study_plans' AND column_name = 'daily_target_questions') THEN
        ALTER TABLE study_plans ADD COLUMN daily_target_questions INT DEFAULT 30;
    END IF;
END $$;

-- 添加重点章节字段
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'study_plans' AND column_name = 'focus_chapters') THEN
        ALTER TABLE study_plans ADD COLUMN focus_chapters TEXT[];
    END IF;
END $$;

-- ========================================
-- 2. 创建 daily_learning_stats 表（增强版每日统计）
-- ========================================

CREATE TABLE IF NOT EXISTS daily_learning_stats (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL,
    
    -- 学习时长统计
    study_minutes INT DEFAULT 0,              -- 学习时长（分钟）
    
    -- 答题统计
    questions_done INT DEFAULT 0,             -- 完成题目数
    correct_count INT DEFAULT 0,              -- 正确数
    
    -- 知识点统计
    new_points_learned INT DEFAULT 0,         -- 新学习的知识点数
    weak_points_reviewed INT DEFAULT 0,       -- 复习的薄弱点数
    points_mastered INT DEFAULT 0,            -- 新掌握的知识点数
    
    -- 章节统计
    chapters_studied TEXT[],                  -- 学习的章节ID列表
    
    -- 正确率（计算字段，方便查询）
    accuracy_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN questions_done > 0 
             THEN (correct_count::DECIMAL / questions_done * 100)
             ELSE 0 
        END
    ) STORED,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, stat_date)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_daily_learning_stats_user ON daily_learning_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_learning_stats_date ON daily_learning_stats(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_learning_stats_user_date ON daily_learning_stats(user_id, stat_date DESC);

COMMENT ON TABLE daily_learning_stats IS '每日学习统计表 - 记录用户每天的学习数据，支持热力图和学习报告';

-- ========================================
-- 3. 创建复习队列表
-- ========================================

CREATE TABLE IF NOT EXISTS review_queue (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    knowledge_point_id TEXT NOT NULL REFERENCES knowledge_tree(id) ON DELETE CASCADE,
    
    -- 优先级计算因素
    priority_score DECIMAL(5,2) DEFAULT 50,   -- 优先级分数 0-100
    importance INT DEFAULT 3,                  -- 知识点重要性 1-5
    mastery_score DECIMAL(5,2) DEFAULT 0,     -- 当前掌握度
    
    -- 复习状态
    is_urgent BOOLEAN DEFAULT FALSE,          -- 是否紧急（掌握度<70%且重要性>=4）
    marked_by_user BOOLEAN DEFAULT FALSE,     -- 是否用户手动标记
    
    -- 时间信息
    added_at TIMESTAMPTZ DEFAULT NOW(),
    last_reviewed_at TIMESTAMPTZ,
    next_review_at TIMESTAMPTZ,
    
    UNIQUE(user_id, knowledge_point_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_review_queue_user ON review_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_review_queue_priority ON review_queue(user_id, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_review_queue_urgent ON review_queue(user_id, is_urgent) WHERE is_urgent = TRUE;
CREATE INDEX IF NOT EXISTS idx_review_queue_next_review ON review_queue(user_id, next_review_at);

COMMENT ON TABLE review_queue IS '复习队列表 - 存储用户需要复习的知识点及优先级';

-- ========================================
-- 4. 创建更新每日统计的函数
-- ========================================

CREATE OR REPLACE FUNCTION update_daily_learning_stats()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
BEGIN
    -- 插入或更新今日统计
    INSERT INTO daily_learning_stats (
        user_id, stat_date, questions_done, correct_count
    ) VALUES (
        NEW.user_id, today, 1, CASE WHEN NEW.is_correct THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id, stat_date) DO UPDATE SET
        questions_done = daily_learning_stats.questions_done + 1,
        correct_count = daily_learning_stats.correct_count + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器（如果不存在）
DROP TRIGGER IF EXISTS trigger_update_daily_stats ON learning_records;
CREATE TRIGGER trigger_update_daily_stats
    AFTER INSERT ON learning_records
    FOR EACH ROW
    WHEN (NEW.action_type = 'answer')
    EXECUTE FUNCTION update_daily_learning_stats();

-- ========================================
-- 5. 创建更新复习队列优先级的函数
-- ========================================

CREATE OR REPLACE FUNCTION calculate_review_priority(
    p_mastery_score DECIMAL,
    p_importance INT,
    p_days_since_review INT
) RETURNS DECIMAL AS $$
BEGIN
    -- 优先级计算公式：
    -- 基础分 = (100 - 掌握度) * 0.4 + 重要性 * 10 * 0.3 + 天数衰减 * 0.3
    RETURN LEAST(100, GREATEST(0,
        (100 - COALESCE(p_mastery_score, 0)) * 0.4 +
        COALESCE(p_importance, 3) * 10 * 0.3 +
        LEAST(30, COALESCE(p_days_since_review, 0)) * 3.33 * 0.3
    ));
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. 创建自动更新复习队列的函数
-- ========================================

CREATE OR REPLACE FUNCTION update_review_queue_on_mastery_change()
RETURNS TRIGGER AS $$
DECLARE
    v_importance INT;
    v_days_since_review INT;
    v_priority DECIMAL;
    v_is_urgent BOOLEAN;
BEGIN
    -- 获取知识点重要性
    SELECT importance INTO v_importance
    FROM knowledge_tree
    WHERE id = NEW.knowledge_point_id;
    
    -- 计算距离上次复习的天数
    v_days_since_review := COALESCE(
        EXTRACT(DAY FROM NOW() - NEW.last_review_at)::INT, 
        7
    );
    
    -- 计算优先级
    v_priority := calculate_review_priority(
        NEW.mastery_score, 
        v_importance, 
        v_days_since_review
    );
    
    -- 判断是否紧急（掌握度<70%且重要性>=4）
    v_is_urgent := (NEW.mastery_score < 70 AND v_importance >= 4);
    
    -- 如果是薄弱点或需要复习，加入/更新复习队列
    IF NEW.is_weak_point OR NEW.next_review_at <= NOW() THEN
        INSERT INTO review_queue (
            user_id, knowledge_point_id, priority_score, 
            importance, mastery_score, is_urgent,
            last_reviewed_at, next_review_at
        ) VALUES (
            NEW.user_id, NEW.knowledge_point_id, v_priority,
            v_importance, NEW.mastery_score, v_is_urgent,
            NEW.last_review_at, NEW.next_review_at
        )
        ON CONFLICT (user_id, knowledge_point_id) DO UPDATE SET
            priority_score = v_priority,
            mastery_score = NEW.mastery_score,
            is_urgent = v_is_urgent,
            last_reviewed_at = NEW.last_review_at,
            next_review_at = NEW.next_review_at;
    ELSE
        -- 如果已掌握，从复习队列移除（除非用户手动标记）
        DELETE FROM review_queue 
        WHERE user_id = NEW.user_id 
          AND knowledge_point_id = NEW.knowledge_point_id
          AND marked_by_user = FALSE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_review_queue ON user_knowledge_mastery;
CREATE TRIGGER trigger_update_review_queue
    AFTER INSERT OR UPDATE ON user_knowledge_mastery
    FOR EACH ROW
    EXECUTE FUNCTION update_review_queue_on_mastery_change();

-- ========================================
-- 7. 创建获取学习统计的视图
-- ========================================

CREATE OR REPLACE VIEW user_learning_summary AS
SELECT 
    u.id AS user_id,
    -- 总体统计
    COALESCE(SUM(dls.questions_done), 0) AS total_questions,
    COALESCE(SUM(dls.correct_count), 0) AS total_correct,
    COALESCE(SUM(dls.study_minutes), 0) AS total_study_minutes,
    -- 本周统计
    COALESCE(SUM(CASE WHEN dls.stat_date >= CURRENT_DATE - INTERVAL '7 days' 
                      THEN dls.questions_done ELSE 0 END), 0) AS week_questions,
    COALESCE(SUM(CASE WHEN dls.stat_date >= CURRENT_DATE - INTERVAL '7 days' 
                      THEN dls.study_minutes ELSE 0 END), 0) AS week_study_minutes,
    -- 正确率
    CASE WHEN SUM(dls.questions_done) > 0 
         THEN ROUND(SUM(dls.correct_count)::DECIMAL / SUM(dls.questions_done) * 100, 1)
         ELSE 0 
    END AS overall_accuracy,
    -- 连续学习天数
    (SELECT COUNT(DISTINCT stat_date) 
     FROM daily_learning_stats dls2 
     WHERE dls2.user_id = u.id 
       AND dls2.stat_date >= CURRENT_DATE - INTERVAL '30 days'
       AND dls2.questions_done > 0) AS active_days_30
FROM auth.users u
LEFT JOIN daily_learning_stats dls ON dls.user_id = u.id
GROUP BY u.id;

COMMENT ON VIEW user_learning_summary IS '用户学习统计汇总视图';

-- ========================================
-- 8. 创建获取连续学习天数的函数
-- ========================================

CREATE OR REPLACE FUNCTION get_learning_streak(p_user_id UUID)
RETURNS INT AS $$
DECLARE
    v_streak INT := 0;
    v_check_date DATE := CURRENT_DATE;
    v_has_record BOOLEAN;
BEGIN
    LOOP
        SELECT EXISTS(
            SELECT 1 FROM daily_learning_stats 
            WHERE user_id = p_user_id 
              AND stat_date = v_check_date 
              AND questions_done > 0
        ) INTO v_has_record;
        
        IF v_has_record THEN
            v_streak := v_streak + 1;
            v_check_date := v_check_date - INTERVAL '1 day';
        ELSE
            EXIT;
        END IF;
        
        -- 最多检查365天
        IF v_streak >= 365 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_learning_streak IS '获取用户连续学习天数';

-- ========================================
-- 完成
-- ========================================

SELECT '智能学习系统数据库表创建完成！' AS status;
