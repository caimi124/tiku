const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const client = await pool.connect();
  try {
    // 检查所有 subject_code 的分布
    const result = await client.query('SELECT subject_code, node_type, COUNT(*) as count FROM knowledge_tree GROUP BY subject_code, node_type ORDER BY subject_code, node_type');
    console.log('数据库中的 subject_code 分布:');
    console.table(result.rows);
    
    // 检查西药药二的数据
    const xiyaoResult = await client.query("SELECT COUNT(*) as count FROM knowledge_tree WHERE subject_code = 'xiyao_yaoxue_er'");
    console.log('\nxiyao_yaoxue_er 数据量:', xiyaoResult.rows[0].count);
    
    // 检查最近导入的数据
    const recentResult = await client.query('SELECT id, code, title, subject_code, node_type FROM knowledge_tree ORDER BY created_at DESC LIMIT 10');
    console.log('\n最近导入的数据:');
    console.table(recentResult.rows);
  } finally {
    client.release();
    pool.end();
  }
}
check().catch(console.error);
