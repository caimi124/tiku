/**
 * 创建 expert_tips 表
 * 用于存储老司机带路内容
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function setupExpertTipsTable() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 开始创建 expert_tips 表...\n');
    
    // 读取SQL文件
    const sqlPath = path.join(__dirname, 'create-expert-tips-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // 执行SQL
    await client.query(sql);
    
    console.log('✅ expert_tips 表创建成功！\n');
    
    // 验证表结构
    const tableCheck = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'expert_tips'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 表结构:');
    tableCheck.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? '可空' : '非空'})`);
    });
    
    // 检查索引
    const indexCheck = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'expert_tips'
    `);
    
    console.log('\n📊 索引:');
    indexCheck.rows.forEach(idx => {
      console.log(`   - ${idx.indexname}`);
    });
    
    console.log('\n✅ 设置完成！');
    
  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupExpertTipsTable().catch(console.error);
