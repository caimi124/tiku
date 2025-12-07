/**
 * 执行知识图谱页面优化数据库迁移
 * 
 * 运行方式: node execute-knowledge-optimization-migration.js
 */

const { Pool } = require('pg')

// 数据库连接配置 - 使用 Transaction pooler
const pool = new Pool({
  connectionString: 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

async function runMigration() {
  console.log('🚀 开始执行知识图谱页面优化数据库迁移...\n')

  const client = await pool.connect()

  try {
    // 1. 扩展 knowledge_tree 表
    console.log('📝 1. 扩展 knowledge_tree 表...')
    
    await client.query(`ALTER TABLE knowledge_tree ADD COLUMN IF NOT EXISTS key_takeaway TEXT`)
    console.log('   ✅ 添加 key_takeaway 字段')
    
    await client.query(`ALTER TABLE knowledge_tree ADD COLUMN IF NOT EXISTS exam_years INTEGER[] DEFAULT '{}'`)
    console.log('   ✅ 添加 exam_years 字段')
    
    await client.query(`ALTER TABLE knowledge_tree ADD COLUMN IF NOT EXISTS exam_frequency INTEGER DEFAULT 0`)
    console.log('   ✅ 添加 exam_frequency 字段')
    
    await client.query(`ALTER TABLE knowledge_tree ADD COLUMN IF NOT EXISTS search_vector tsvector`)
    console.log('   ✅ 添加 search_vector 字段')

    // 2. 创建考点标签表
    console.log('\n📝 2. 创建考点标签表...')
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS point_tags (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        point_id TEXT NOT NULL REFERENCES knowledge_tree(id) ON DELETE CASCADE,
        tag_type TEXT NOT NULL CHECK (tag_type IN (
          'high_frequency', 'must_test', 'easy_mistake', 'basic', 'reinforce'
        )),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(point_id, tag_type)
      )
    `)
    console.log('   ✅ point_tags 表创建成功')

    // 3. 创建索引
    console.log('\n📝 3. 创建索引...')
    
    await client.query(`CREATE INDEX IF NOT EXISTS idx_point_tags_point ON point_tags(point_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_point_tags_type ON point_tags(tag_type)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_knowledge_tree_exam_years ON knowledge_tree USING GIN(exam_years)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_knowledge_tree_exam_frequency ON knowledge_tree(exam_frequency DESC)`)
    console.log('   ✅ 索引创建成功')

    // 4. 创建全文搜索函数和触发器
    console.log('\n📝 4. 创建全文搜索触发器...')
    
    await client.query(`
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
      $$ LANGUAGE plpgsql
    `)
    console.log('   ✅ 搜索向量更新函数创建成功')

    await client.query(`DROP TRIGGER IF EXISTS trigger_update_knowledge_search ON knowledge_tree`)
    await client.query(`
      CREATE TRIGGER trigger_update_knowledge_search
        BEFORE INSERT OR UPDATE ON knowledge_tree
        FOR EACH ROW
        EXECUTE FUNCTION update_knowledge_search_vector()
    `)
    console.log('   ✅ 搜索触发器创建成功')

    await client.query(`CREATE INDEX IF NOT EXISTS idx_knowledge_tree_search ON knowledge_tree USING GIN(search_vector)`)
    console.log('   ✅ 全文搜索索引创建成功')

    // 5. 更新现有数据的搜索向量
    console.log('\n📝 5. 更新现有数据的搜索向量...')
    const updateResult = await client.query(`UPDATE knowledge_tree SET updated_at = NOW() WHERE search_vector IS NULL`)
    console.log(`   ✅ 更新了 ${updateResult.rowCount} 条记录的搜索向量`)

    // 6. 验证结果
    console.log('\n📝 6. 验证迁移结果...')
    
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'knowledge_tree' 
      AND column_name IN ('key_takeaway', 'exam_years', 'exam_frequency', 'search_vector')
    `)
    console.log(`   ✅ knowledge_tree 新增字段: ${columnsResult.rows.map(r => r.column_name).join(', ')}`)

    const tagsTableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'point_tags'
      )
    `)
    console.log(`   ✅ point_tags 表存在: ${tagsTableResult.rows[0].exists}`)

    console.log('\n' + '='.repeat(50))
    console.log('🎉 数据库迁移成功完成！')
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ 迁移执行失败:', error.message)
    throw error
  } finally {
    client.release()
  }
}

// 执行迁移
async function main() {
  try {
    await runMigration()
  } catch (error) {
    console.error('执行出错:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
