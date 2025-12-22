/**
 * 创建知识点树表并导入数据
 * 使用方法: npx ts-node setup-knowledge-tree.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Supabase 配置
const SUPABASE_URL = 'https://tparjdkxxtnentsdazfw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE4MTAzOCwiZXhwIjoyMDc4NzU3MDM4fQ.i0nA_AOLnBdeK7chICmeltFchkdJmYKMVqVxu8IaofE'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface KnowledgeRecord {
  type: string
  id: string
  code: string
  title: string
  content?: string
  point_type?: string
  drug_name?: string
  importance?: number
  memory_tips?: string
  parent_id: string | null
  subject_code: string
  level: number
}

async function createTables() {
  console.log('创建知识点树表...')
  
  // 创建 knowledge_tree 表
  const createTableSQL = `
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
      importance_level INT DEFAULT 3,
      learn_mode TEXT DEFAULT 'BOTH',
      error_pattern_tags TEXT[] DEFAULT '{}',
      parent_id TEXT,
      subject_code TEXT NOT NULL,
      level INT NOT NULL,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_kt_code ON knowledge_tree(code);
    CREATE INDEX IF NOT EXISTS idx_kt_parent ON knowledge_tree(parent_id);
    CREATE INDEX IF NOT EXISTS idx_kt_subject ON knowledge_tree(subject_code);
    CREATE INDEX IF NOT EXISTS idx_kt_type ON knowledge_tree(node_type);
    CREATE INDEX IF NOT EXISTS idx_kt_importance ON knowledge_tree(importance DESC);
  `
  
  const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL })
  
  if (error) {
    console.log('表可能已存在，继续导入数据...')
  } else {
    console.log('表创建成功!')
  }
}

async function importData() {
  console.log('\n开始导入知识点数据...')
  
  // 读取JSON数据
  const dataPath = path.join(__dirname, 'shuju', '西药药二_数据库记录_v2.json')
  const rawData = fs.readFileSync(dataPath, 'utf-8')
  const records: KnowledgeRecord[] = JSON.parse(rawData)
  
  console.log(`读取到 ${records.length} 条记录`)
  
  // 按层级排序
  const sortedRecords = records.sort((a, b) => a.level - b.level)
  
  // 转换为数据库格式
  const dbRecords = sortedRecords.map(record => ({
    id: record.id,
    code: record.code,
    title: record.title,
    content: record.content || null,
    node_type: record.type,
    point_type: record.point_type || null,
    drug_name: record.drug_name || null,
    importance: record.importance || 3,
    importance_level: record.importance || 3,
    learn_mode: record.learn_mode || 'BOTH',
    error_pattern_tags: record.error_pattern_tags || [],
    memory_tips: record.memory_tips || null,
    parent_id: record.parent_id,
    subject_code: record.subject_code,
    level: record.level,
    sort_order: parseInt(record.code.split('.').pop() || '0')
  }))
  
  // 分批插入（每批20条）
  const batchSize = 20
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < dbRecords.length; i += batchSize) {
    const batch = dbRecords.slice(i, i + batchSize)
    
    const { data, error } = await supabase
      .from('knowledge_tree')
      .upsert(batch, { onConflict: 'id' })
    
    if (error) {
      console.error(`批次 ${Math.floor(i/batchSize) + 1} 导入失败:`, error.message)
      errorCount += batch.length
    } else {
      successCount += batch.length
      console.log(`已导入 ${successCount}/${dbRecords.length} 条记录...`)
    }
  }
  
  console.log('\n=== 导入完成 ===')
  console.log(`成功: ${successCount} 条`)
  console.log(`失败: ${errorCount} 条`)
}

async function verifyData() {
  console.log('\n验证导入结果...')
  
  // 统计各类型数量
  const { data: chapters } = await supabase
    .from('knowledge_tree')
    .select('id', { count: 'exact' })
    .eq('node_type', 'chapter')
  
  const { data: sections } = await supabase
    .from('knowledge_tree')
    .select('id', { count: 'exact' })
    .eq('node_type', 'section')
  
  const { data: points } = await supabase
    .from('knowledge_tree')
    .select('id', { count: 'exact' })
    .eq('node_type', 'knowledge_point')
  
  console.log('\n=== 数据统计 ===')
  console.log(`章节数: ${chapters?.length || 0}`)
  console.log(`小节数: ${sections?.length || 0}`)
  console.log(`知识点数: ${points?.length || 0}`)
  
  // 显示章节列表
  const { data: chapterList } = await supabase
    .from('knowledge_tree')
    .select('code, title')
    .eq('node_type', 'chapter')
    .order('code')
  
  console.log('\n=== 章节列表 ===')
  chapterList?.forEach(ch => {
    console.log(`第${ch.code}章 ${ch.title}`)
  })
}

async function main() {
  try {
    // 1. 创建表
    await createTables()
    
    // 2. 导入数据
    await importData()
    
    // 3. 验证数据
    await verifyData()
    
    console.log('\n✅ 知识点树设置完成!')
    
  } catch (error) {
    console.error('执行出错:', error)
  }
}

main()
