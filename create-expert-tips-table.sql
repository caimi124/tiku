-- 老司机带路内容表
-- 用于存储考点的考试技巧、出题套路、记忆方法等辅助内容

-- 1. 创建老司机带路内容表
CREATE TABLE IF NOT EXISTS expert_tips (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    knowledge_point_id TEXT NOT NULL REFERENCES knowledge_tree(id) ON DELETE CASCADE,
    
    -- 出题套路 (JSON数组)
    -- 格式: [{ "title": "题目类型", "questionExample": "示例题目", "options": ["A", "B", "C", "D"], "correctAnswer": "A" }]
    exam_patterns JSONB DEFAULT '[]',
    
    -- 坑位分析 (JSON数组)
    -- 格式: [{ "trapName": "坑位名称", "description": "描述", "commonMistake": "常见错误", "solution": "解决方案" }]
    trap_analysis JSONB DEFAULT '[]',
    
    -- 记忆技巧 (JSON数组)
    -- 格式: [{ "type": "mnemonic|association|scenario", "content": "记忆内容" }]
    memory_techniques JSONB DEFAULT '[]',
    
    -- 应试战术 (JSON数组)
    -- 格式: [{ "trigger": "触发条件", "reaction": "条件反射" }]
    exam_tactics JSONB DEFAULT '[]',
    
    -- 必考预测 (JSON数组)
    -- 格式: [{ "question": "预测题目", "answer": "答案", "explanation": "解析", "probability": 95 }]
    predictions JSONB DEFAULT '[]',
    
    -- 版本控制
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(knowledge_point_id)
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_expert_tips_point ON expert_tips(knowledge_point_id);
CREATE INDEX IF NOT EXISTS idx_expert_tips_updated ON expert_tips(updated_at DESC);

-- 3. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_expert_tips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_expert_tips_updated ON expert_tips;
CREATE TRIGGER trigger_expert_tips_updated
    BEFORE UPDATE ON expert_tips
    FOR EACH ROW
    EXECUTE FUNCTION update_expert_tips_updated_at();

-- 4. 添加表注释
COMMENT ON TABLE expert_tips IS '老司机带路内容表，存储考点的考试技巧、出题套路、记忆方法等辅助内容';
COMMENT ON COLUMN expert_tips.exam_patterns IS '出题套路：常见的出题形式和题目示例';
COMMENT ON COLUMN expert_tips.trap_analysis IS '坑位分析：考生容易犯的错误和出题人常用的陷阱';
COMMENT ON COLUMN expert_tips.memory_techniques IS '记忆技巧：口诀、联想记忆、场景记忆等方法';
COMMENT ON COLUMN expert_tips.exam_tactics IS '应试战术：条件反射式解题思路';
COMMENT ON COLUMN expert_tips.predictions IS '必考预测：预测题目和正确答案解析';
