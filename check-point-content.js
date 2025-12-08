const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const client = await pool.connect();
  try {
    // 检查考点内容
    const result = await client.query(`
      SELECT id, code, title, content, memory_tips, key_takeaway 
      FROM knowledge_tree 
      WHERE node_type = 'point' 
      LIMIT 5
    `);
    
    console.log('=== 考点内容检查 ===');
    result.rows.forEach(row => {
      console.log('\n--- ' + row.title + ' ---');
      console.log('content:', row.content ? row.content.substring(0, 300) + '...' : 'NULL');
      console.log('memory_tips:', row.memory_tips || 'NULL');
      console.log('key_takeaway:', row.key_takeaway || 'NULL');
    });
    
    // 检查特定的考点 (用户提到的URL中的section)
    console.log('\n\n=== 检查用户提到的小节 ===');
    const sectionResult = await client.query(`
      SELECT id, code, title, node_type, parent_id
      FROM knowledge_tree 
      WHERE id = 'a194e3ce-3542-4744-b1ee-738a2bde469a'
    `);
    console.log('小节信息:', sectionResult.rows[0]);
    
    // 检查该小节下的考点
    const pointsResult = await client.query(`
      SELECT id, code, title, content, memory_tips
      FROM knowledge_tree 
      WHERE parent_id = 'a194e3ce-3542-4744-b1ee-738a2bde469a'
    `);
    console.log('\n该小节下的考点:');
    pointsResult.rows.forEach(row => {
      console.log('\n考点:', row.title);
      console.log('content:', row.content ? row.content.substring(0, 500) : 'NULL');
      console.log('memory_tips:', row.memory_tips || 'NULL');
    });
    
  } finally {
    client.release();
    pool.end();
  }
}
check().catch(console.error);
