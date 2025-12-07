-- 知识图谱页面结构优化 - 数据库迁移脚本
-- Migration: 001-knowledge-page-optimization
-- Date: 2024-12-07

-- ============================================
-- 1. 扩展 knowledge_tree 表
-- ============================================

-- 添加一句话简介字段（≤40字）
ALTER TABLE knowledge_tree ADD COLUMN IF NOT EXISTS key_takeaway TEXT;

-- 添加历年考查年份数组字段
ALTER TABLE knowledge_tree ADD COLUMN IF NOT EXISTS exam_years INTEGER[] DEFAULT '{}';

-- 添加考查频率字段（过去5年考查次数）
ALTER TABLE knowledge_tree ADD COLUMN IF NOT EXISTS exam_frequency INTEGER DEFAULT 0;

-- 添加全文搜索向量字段
ALTER TABLE knowledge_tree ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 添加注释
COMMENT ON COLUMN knowledge_tree.key_takeaway IS '一句话简介，用于考点卡片展示，不超过40字';
COMMENT ON COLUMN knowledge_tree.exam_years IS '历年考查年份数组，如 {2020, 2022, 2024}';
COMMENT ON COLUMN knowledge_tree.exam_frequency IS '考查频率，过去5年考查次数';
COMMENT ON COLUMN knowledge_tree.search_vector IS '全文搜索向量，用于快速搜索';

-- ============================================
-- 2. 创建考点标签表
-- ============================================

CREATE TABLE IF NOT EXISTS point_tags (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    point_id TEXT NOT NULL REFERENCES knowledge_tree(id) ON DELETE CASCADE,
    tag_type TEXT NOT NULL CHECK (tag_type IN (
        'high_frequency',  -- 高频：过去5年至少考3次
        'must_test',       -- 必考：教材显性要求 + 历年多次命题
        'easy_mistake',    -- 易错：学员反馈错误概率>40%
        'basic',           -- 基础：概念、定义类基础知识
        'reinforce'        -- 强化：适合图示、总结、思维导图强化
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(point_id, tag_type)
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_point_tags_point ON point_tags(point_id);
CREATE INDEX IF NOT EXISTS idx_point_tags_type ON point_tags(tag_type);

-- 添加注释
COMMENT ON TABLE point_tags IS '考点优先级标签表，存储考点的标签信息';
COMMENT ON COLUMN point_tags.tag_type IS '标签类型：high_frequency/must_test/easy_mistake/basic/reinforce';


-- ============================================
-- 3. 创建全文搜索触发器
-- ============================================

-- 创建更新搜索向量的函数
CREATE OR REPLACE FUNCTION update_knowledge_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(NEW.key_takeaway, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(NEW.content, '')), 'C') ||
        setweight(to_tsvector('simple', coalesce(NEW.drug_name, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(NEW.memory_tips, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_knowledge_search ON knowledge_tree;
CREATE TRIGGER trigger_update_knowledge_search
    BEFORE INSERT OR UPDATE ON knowledge_tree
    FOR EACH ROW
    EXECUTE FUNCTION update_knowledge_search_vector();

-- 创建全文搜索索引
CREATE INDEX IF NOT EXISTS idx_knowledge_tree_search ON knowledge_tree USING GIN(search_vector);

-- ============================================
-- 4. 创建辅助索引
-- ============================================

-- 历年考查年份索引（用于筛选高频考点）
CREATE INDEX IF NOT EXISTS idx_knowledge_tree_exam_years ON knowledge_tree USING GIN(exam_years);

-- 考查频率索引（用于排序）
CREATE INDEX IF NOT EXISTS idx_knowledge_tree_exam_frequency ON knowledge_tree(exam_frequency DESC);

-- ============================================
-- 5. 更新现有数据的搜索向量
-- ============================================

-- 触发所有现有记录的搜索向量更新
UPDATE knowledge_tree SET updated_at = NOW() WHERE search_vector IS NULL;

-- ============================================
-- 6. 创建标签定义视图（方便查询）
-- ============================================

CREATE OR REPLACE VIEW tag_definitions AS
SELECT 
    'high_frequency' AS tag_type,
    '高频' AS label,
    '#EF4444' AS color,
    '过去5年至少考3次' AS definition
UNION ALL
SELECT 
    'must_test',
    '必考',
    '#F97316',
    '教材显性要求 + 历年多次命题'
UNION ALL
SELECT 
    'easy_mistake',
    '易错',
    '#EAB308',
    '学员反馈错误概率>40%'
UNION ALL
SELECT 
    'basic',
    '基础',
    '#3B82F6',
    '概念、定义类基础知识'
UNION ALL
SELECT 
    'reinforce',
    '强化',
    '#8B5CF6',
    '适合图示、总结、思维导图强化';

COMMENT ON VIEW tag_definitions IS '标签定义视图，包含所有标签类型的显示信息';
