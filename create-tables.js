/**
 * 在Supabase中创建知识点树表
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://tparjdkxxtnentsdazfw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE4MTAzOCwiZXhwIjoyMDc4NzU3MDM4fQ.i0nA_AOLnBdeK7chICmeltFchkdJmYKMVqVxu8IaofE'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function createTables() {
  console.log('正在创建知识点树表...')
  
  // 使用 Supabase REST API 执行 SQL
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  })
  
  console.log('请在 Supabase 控制台的 SQL Editor 中执行以下 SQL:')
  console.log('=' .repeat(60))
  
  const sql = `
-- 知识点树状结构表
CREATE TABLE IF NOT EXISTS knowledge_tree (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    node_type TEXT NOT NULL,
    point_type TEXT,
    drug_name TEXT,
    importance INT DEFAULT 3,
    memory_tips TEXT,
    parent_id TEXT,
    subject_code TEXT NOT NULL,
    level INT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_kt_code ON knowledge_tree(code);
CREATE INDEX IF NOT EXISTS idx_kt_parent ON knowledge_tree(parent_id);
CREATE INDEX IF NOT EXISTS idx_kt_subject ON knowledge_tree(subject_code);
CREATE INDEX IF NOT EXISTS idx_kt_type ON knowledge_tree(node_type);
CREATE INDEX IF NOT EXISTS idx_kt_importance ON knowledge_tree(importance DESC);
CREATE INDEX IF NOT EXISTS idx_kt_drug ON knowledge_tree(drug_name);

-- 用户知识点掌握度表
CREATE TABLE IF NOT EXISTS user_knowledge_mastery (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL,
    knowledge_point_id TEXT NOT NULL,
    total_attempts INT DEFAULT 0,
    correct_attempts INT DEFAULT 0,
    mastery_score DECIMAL(5,2) DEFAULT 0,
    last_review_at TIMESTAMPTZ,
    next_review_at TIMESTAMPTZ,
    is_weak_point BOOLEAN DEFAULT FALSE,
    is_mastered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, knowledge_point_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ukm_user ON user_knowledge_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_ukm_point ON user_knowledge_mastery(knowledge_point_id);
CREATE INDEX IF NOT EXISTS idx_ukm_weak ON user_knowledge_mastery(user_id, is_weak_point) WHERE is_weak_point = TRUE;

-- 学习记录表
CREATE TABLE IF NOT EXISTS learning_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL,
    knowledge_point_id TEXT,
    question_id TEXT,
    action_type TEXT NOT NULL,
    is_correct BOOLEAN,
    time_spent INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_lr_user ON learning_records(user_id);
CREATE INDEX IF NOT EXISTS idx_lr_date ON learning_records(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lr_point ON learning_records(knowledge_point_id);
`
  
  console.log(sql)
  console.log('=' .repeat(60))
  console.log('\n请复制上面的SQL到 Supabase Dashboard -> SQL Editor 执行')
  console.log('Supabase Dashboard: https://supabase.com/dashboard/project/tparjdkxxtnentsdazfw/sql')
}

createTables()
