/**
 * 直接连接PostgreSQL创建表并导入数据
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// 数据库连接配置 - 使用 Transaction pooler
const pool = new Pool({
  connectionString: 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

async function createTables() {
  console.log('创建知识点树表...')
  
  const client = await pool.connect()
  
  try {
    // 创建 knowledge_tree 表
    await client.query(`
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
      )
    `)
    console.log('✓ knowledge_tree 表创建成功')
    
    // 创建索引
    await client.query(`CREATE INDEX IF NOT EXISTS idx_kt_code ON knowledge_tree(code)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_kt_parent ON knowledge_tree(parent_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_kt_subject ON knowledge_tree(subject_code)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_kt_type ON knowledge_tree(node_type)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_kt_importance ON knowledge_tree(importance DESC)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_kt_drug ON knowledge_tree(drug_name)`)
    console.log('✓ 索引创建成功')
    
    // 创建用户掌握度表
    await client.query(`
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
      )
    `)
    console.log('✓ user_knowledge_mastery 表创建成功')
    
    // 创建学习记录表
    await client.query(`
      CREATE TABLE IF NOT EXISTS learning_records (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id UUID NOT NULL,
        knowledge_point_id TEXT,
        question_id TEXT,
        action_type TEXT NOT NULL,
        is_correct BOOLEAN,
        time_spent INT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)
    console.log('✓ learning_records 表创建成功')
    
    // 创建索引
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ukm_user ON user_knowledge_mastery(user_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ukm_point ON user_knowledge_mastery(knowledge_point_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_lr_user ON learning_records(user_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_lr_date ON learning_records(user_id, created_at DESC)`)
    console.log('✓ 所有索引创建成功')
    
  } finally {
    client.release()
  }
}

async function importData() {
  console.log('\n开始导入知识点数据...')
  
  // 读取JSON数据
  const dataPath = path.join(__dirname, 'shuju', '西药药二_数据库记录_v2.json')
  const rawData = fs.readFileSync(dataPath, 'utf-8')
  const records = JSON.parse(rawData)
  
  console.log(`读取到 ${records.length} 条记录`)
  
  // 按层级排序
  const sortedRecords = records.sort((a, b) => a.level - b.level)
  
  const client = await pool.connect()
  
  try {
    let successCount = 0
    let errorCount = 0
    
    for (const record of sortedRecords) {
      try {
        await client.query(`
          INSERT INTO knowledge_tree (
            id, code, title, content, node_type, point_type,
            drug_name, importance, memory_tips, parent_id,
            subject_code, level, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            point_type = EXCLUDED.point_type,
            drug_name = EXCLUDED.drug_name,
            importance = EXCLUDED.importance,
            memory_tips = EXCLUDED.memory_tips,
            updated_at = NOW()
        `, [
          record.id,
          record.code,
          record.title,
          record.content || null,
          record.type,
          record.point_type || null,
          record.drug_name || null,
          record.importance || 3,
          record.memory_tips || null,
          record.parent_id,
          record.subject_code,
          record.level,
          parseInt(record.code.split('.').pop() || '0')
        ])
        
        successCount++
        if (successCount % 20 === 0) {
          console.log(`已导入 ${successCount}/${records.length} 条记录...`)
        }
      } catch (err) {
        errorCount++
        console.error(`导入失败: ${record.id}`, err.message)
      }
    }
    
    console.log('\n=== 导入完成 ===')
    console.log(`成功: ${successCount} 条`)
    console.log(`失败: ${errorCount} 条`)
    
  } finally {
    client.release()
  }
}

async function verifyData() {
  console.log('\n验证导入结果...')
  
  const client = await pool.connect()
  
  try {
    // 统计各类型数量
    const result = await client.query(`
      SELECT 
        node_type,
        COUNT(*) as count
      FROM knowledge_tree
      WHERE subject_code = 'xiyao_yaoxue_er'
      GROUP BY node_type
      ORDER BY 
        CASE node_type 
          WHEN 'chapter' THEN 1 
          WHEN 'section' THEN 2 
          WHEN 'knowledge_point' THEN 3 
        END
    `)
    
    console.log('\n=== 数据统计 ===')
    result.rows.forEach(row => {
      const typeNames = {
        'chapter': '章节',
        'section': '小节',
        'knowledge_point': '知识点'
      }
      console.log(`${typeNames[row.node_type] || row.node_type}: ${row.count}`)
    })
    
    // 显示章节列表
    const chapters = await client.query(`
      SELECT code, title
      FROM knowledge_tree
      WHERE node_type = 'chapter' AND subject_code = 'xiyao_yaoxue_er'
      ORDER BY code
    `)
    
    console.log('\n=== 章节列表 ===')
    chapters.rows.forEach(ch => {
      console.log(`第${ch.code}章 ${ch.title}`)
    })
    
    // 显示高重要性知识点
    const importantPoints = await client.query(`
      SELECT code, title, importance, drug_name
      FROM knowledge_tree
      WHERE node_type = 'knowledge_point' 
        AND subject_code = 'xiyao_yaoxue_er'
        AND importance >= 4
      ORDER BY importance DESC, code
      LIMIT 10
    `)
    
    if (importantPoints.rows.length > 0) {
      console.log('\n=== 高重要性知识点 (Top 10) ===')
      importantPoints.rows.forEach(p => {
        const stars = '★'.repeat(p.importance) + '☆'.repeat(5 - p.importance)
        console.log(`[${stars}] ${p.code} ${p.title}`)
      })
    }
    
  } finally {
    client.release()
  }
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
  } finally {
    await pool.end()
  }
}

main()
