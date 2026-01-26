-- 考点内容模块化存储表
-- Migration: 010-point-content-blocks
-- Date: 2024-12-XX
-- 
-- 用途：将考点文件内容按阶段和模块拆分存储，用于AI出题和搜索
-- 注意：文件仍然是内容主源，此表仅作为索引/缓存层

-- ============================================
-- 1. 创建考点内容文件表（记录文件元信息）
-- ============================================

CREATE TABLE IF NOT EXISTS knowledge_point_content_files (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    raw_content TEXT, -- 全文备份（可选）
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_point_content_files_code ON knowledge_point_content_files(code);
CREATE INDEX IF NOT EXISTS idx_point_content_files_hash ON knowledge_point_content_files(file_hash);

-- 添加注释
COMMENT ON TABLE knowledge_point_content_files IS '考点内容文件元信息表，记录文件hash用于增量更新';
COMMENT ON COLUMN knowledge_point_content_files.code IS '考点code，如 C8.4.2';
COMMENT ON COLUMN knowledge_point_content_files.file_name IS '文件名，如 c8.4.2胰岛素和胰岛素类似物的临床用药评价.txt';
COMMENT ON COLUMN knowledge_point_content_files.file_hash IS '文件内容hash，用于判断是否需要更新';
COMMENT ON COLUMN knowledge_point_content_files.raw_content IS '文件全文备份（可选，用于调试）';

-- ============================================
-- 2. 创建考点内容模块表（按阶段和模块拆分）
-- ============================================

CREATE TABLE IF NOT EXISTS knowledge_point_content_blocks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN ('stage1', 'stage2', 'stage3')),
    module TEXT NOT NULL CHECK (module IN ('M02', 'M03', 'M04', 'M05', 'M06')),
    title TEXT, -- 模块标题，如 "必背要点"
    content TEXT NOT NULL, -- 该模块原文全文（保持原样）
    source TEXT NOT NULL DEFAULT 'file',
    file_name TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    parsed_version INTEGER DEFAULT 1, -- 解析版本号，便于以后升级解析规则
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 唯一约束：同一code+stage+module+source只能有一条记录
    UNIQUE(code, stage, module, source)
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_point_content_blocks_code ON knowledge_point_content_blocks(code);
CREATE INDEX IF NOT EXISTS idx_point_content_blocks_stage ON knowledge_point_content_blocks(stage);
CREATE INDEX IF NOT EXISTS idx_point_content_blocks_module ON knowledge_point_content_blocks(module);
CREATE INDEX IF NOT EXISTS idx_point_content_blocks_code_stage_module ON knowledge_point_content_blocks(code, stage, module);
CREATE INDEX IF NOT EXISTS idx_point_content_blocks_file_hash ON knowledge_point_content_blocks(file_hash);

-- 添加注释
COMMENT ON TABLE knowledge_point_content_blocks IS '考点内容模块表，按阶段和模块拆分存储，用于AI出题';
COMMENT ON COLUMN knowledge_point_content_blocks.code IS '考点code，如 C8.4.2';
COMMENT ON COLUMN knowledge_point_content_blocks.stage IS '阶段：stage1(第一阶段)、stage2(第二阶段)、stage3(第三阶段)';
COMMENT ON COLUMN knowledge_point_content_blocks.module IS '模块：M02-M06';
COMMENT ON COLUMN knowledge_point_content_blocks.title IS '模块标题，如 "本页定位"、"必背要点"';
COMMENT ON COLUMN knowledge_point_content_blocks.content IS '该模块原文全文（保持原样，含换行）';
COMMENT ON COLUMN knowledge_point_content_blocks.source IS '内容来源，默认 file';
COMMENT ON COLUMN knowledge_point_content_blocks.file_hash IS '文件hash，用于增量更新';
COMMENT ON COLUMN knowledge_point_content_blocks.parsed_version IS '解析版本号，便于以后升级解析规则';

-- ============================================
-- 3. 创建更新时间触发器
-- ============================================

-- 文件表触发器
CREATE OR REPLACE FUNCTION update_point_content_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_point_content_files_updated ON knowledge_point_content_files;
CREATE TRIGGER trigger_point_content_files_updated
    BEFORE UPDATE ON knowledge_point_content_files
    FOR EACH ROW
    EXECUTE FUNCTION update_point_content_files_updated_at();

-- 模块表触发器
CREATE OR REPLACE FUNCTION update_point_content_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_point_content_blocks_updated ON knowledge_point_content_blocks;
CREATE TRIGGER trigger_point_content_blocks_updated
    BEFORE UPDATE ON knowledge_point_content_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_point_content_blocks_updated_at();
