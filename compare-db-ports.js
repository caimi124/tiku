// 比较两个端口的数据库数据
const { Pool } = require('pg');

async function checkPort(port) {
  const pool = new Pool({
    connectionString: `postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:${port}/postgres`,
    ssl: { rejectUnauthorized: false }
  });
  
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT node_type, COUNT(*) as count 
      FROM knowledge_tree 
      WHERE subject_code = 'xiyao_yaoxue_er' 
      GROUP BY node_type
    `);
    console.log(`\n端口 ${port} 的数据:`);
    console.table(result.rows);
    
    const total = await client.query(`
      SELECT COUNT(*) as total FROM knowledge_tree WHERE subject_code = 'xiyao_yaoxue_er'
    `);
    console.log(`总计: ${total.rows[0].total} 条记录`);
  } finally {
    client.release();
    pool.end();
  }
}

async function main() {
  console.log('比较两个端口的数据库数据...');
  
  await checkPort(5432);  // Session Pooler
  await checkPort(6543);  // Transaction Pooler
}

main().catch(console.error);
