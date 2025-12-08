-- 知识图谱页面层级优化 - 数据库迁移
-- 用于支持用户学习进度、收藏/标记、最近学习记录功能

-- ========================================
-- 1. 创建用户学习进度表 user_learning_progress
-- Requirements: 7.2, 9.4
-- ========================================

CREATE TABLE IF NOT EXISTS user_learning_progress (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    point_id TEXT NOT NULL REFERENCES knowledge_tree(id) ON DELETE CASCADE,
    
    -- 学习状态: not_started, in_progress, completed, mastered
    status TEXT NOT NULL DEFAULT 'not_started' 
        CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')),
    
    -- 时间记录
    first_visited_at TIMESTAMPTZ,
    last_visited_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- 学习统计
    visit_count INT DEFAULT 0,
    time_spent_seconds INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, point_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_user ON user_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_point ON user_learning_progress(point_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_status ON user_learning_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_last_visited ON user_learning_progress(user_id, last_visited_at DESC);

COMMENT ON TABLE user_learning_progress IS '用户学习进度表 - 记录用户对每个考点的学习状态和进度';

-- ========================================
-- 2. 创建用户收藏/标记表 user_favorites
-- Requirements: 12.1, 12.2
-- ========================================

CREATE TABLE IF NOT EXISTS user_favorites (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    point_id TEXT NOT NULL REFERENCES knowledge_tree(id) ON DELETE CASCADE,
    
    -- 类型: favorite (收藏), review (待复习)
    type TEXT NOT NULL CHECK (type IN ('favorite', 'review')),
    
    -- 备注
    note TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, point_id, type)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_point ON user_favorites(point_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_type ON user_favorites(user_id, type);

COMMENT ON TABLE user_favorites IS '用户收藏/标记表 - 存储用户收藏的考点和待复习标记';

-- ========================================
-- 3. 创建最近学习记录表 recent_learning
-- Requirements: 10.2
-- ========================================

CREATE TABLE IF NOT EXISTS recent_learning (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    point_id TEXT NOT NULL REFERENCES knowledge_tree(id) ON DELETE CASCADE,
    
    visited_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 学习时长（秒）
    duration_seconds INT DEFAULT 0
);

-- 创建索引（按时间倒序）
CREATE INDEX IF NOT EXISTS idx_recent_learning_user_time ON recent_learning(user_id, visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_recent_learning_point ON recent_learning(point_id);

COMMENT ON TABLE recent_learning IS '最近学习记录表 - 记录用户最近访问的考点';

-- ========================================
-- 4. 创建更新学习进度的函数
-- ========================================

CREATE OR REPLACE FUNCTION update_learning_progress(
    p_user_id UUID,
    p_point_id TEXT,
    p_time_spent INT DEFAULT 0
) RETURNS void AS $
BEGIN
    INSERT INTO user_learning_progress (
        user_id, point_id, status, 
        first_visited_at, last_visited_at, 
        visit_count, time_spent_seconds
    ) VALUES (
        p_user_id, p_point_id, 'in_progress',
        NOW(), NOW(),
        1, p_time_spent
    )
    ON CONFLICT (user_id, point_id) DO UPDATE SET
        status = CASE 
            WHEN user_learning_progress.status = 'not_started' THEN 'in_progress'
            ELSE user_learning_progress.status
        END,
        last_visited_at = NOW(),
        visit_count = user_learning_progress.visit_count + 1,
        time_spent_seconds = user_learning_progress.time_spent_seconds + p_time_spent,
        updated_at = NOW();
END;
$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_learning_progress IS '更新用户学习进度';

-- ========================================
-- 5. 创建记录最近学习的函数
-- ========================================

CREATE OR REPLACE FUNCTION record_recent_learning(
    p_user_id UUID,
    p_point_id TEXT,
    p_duration INT DEFAULT 0
) RETURNS void AS $
BEGIN
    -- 插入新记录
    INSERT INTO recent_learning (user_id, point_id, visited_at, duration_seconds)
    VALUES (p_user_id, p_point_id, NOW(), p_duration);
    
    -- 只保留最近100条记录
    DELETE FROM recent_learning
    WHERE user_id = p_user_id
      AND id NOT IN (
          SELECT id FROM recent_learning
          WHERE user_id = p_user_id
          ORDER BY visited_at DESC
          LIMIT 100
      );
END;
$ LANGUAGE plpgsql;

COMMENT ON FUNCTION record_recent_learning IS '记录最近学习并清理旧记录';

-- ========================================
-- 6. 创建获取学习进度统计的函数
-- ========================================

CREATE OR REPLACE FUNCTION get_learning_progress_stats(p_user_id UUID)
RETURNS TABLE (
    total_points BIGINT,
    learned_count BIGINT,
    completed_count BIGINT,
    mastered_count BIGINT,
    review_count BIGINT
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM knowledge_tree WHERE node_type = 'point')::BIGINT AS total_points,
        (SELECT COUNT(*) FROM user_learning_progress 
         WHERE user_id = p_user_id AND status IN ('in_progress', 'completed', 'mastered'))::BIGINT AS learned_count,
        (SELECT COUNT(*) FROM user_learning_progress 
         WHERE user_id = p_user_id AND status IN ('completed', 'mastered'))::BIGINT AS completed_count,
        (SELECT COUNT(*) FROM user_learning_progress 
         WHERE user_id = p_user_id AND status = 'mastered')::BIGINT AS mastered_count,
        (SELECT COUNT(*) FROM user_favorites 
         WHERE user_id = p_user_id AND type = 'review')::BIGINT AS review_count;
END;
$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_learning_progress_stats IS '获取用户学习进度统计';

-- ========================================
-- 7. 创建获取最近学习考点的函数
-- ========================================

CREATE OR REPLACE FUNCTION get_recent_learning_points(
    p_user_id UUID,
    p_limit INT DEFAULT 5
)
RETURNS TABLE (
    point_id TEXT,
    title TEXT,
    section_title TEXT,
    chapter_title TEXT,
    visited_at TIMESTAMPTZ
) AS $
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (rl.point_id)
        rl.point_id,
        kt.title,
        (SELECT title FROM knowledge_tree WHERE id = kt.parent_id) AS section_title,
        (SELECT title FROM knowledge_tree 
         WHERE id = (SELECT parent_id FROM knowledge_tree WHERE id = kt.parent_id)) AS chapter_title,
        rl.visited_at
    FROM recent_learning rl
    JOIN knowledge_tree kt ON kt.id = rl.point_id
    WHERE rl.user_id = p_user_id
    ORDER BY rl.point_id, rl.visited_at DESC
    LIMIT p_limit;
END;
$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_recent_learning_points IS '获取用户最近学习的考点';

-- ========================================
-- 完成
-- ========================================

SELECT '知识图谱页面层级优化数据库迁移完成！' AS status;
