const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const client = await pool.connect();
  try {
    // 1. 检查knowledge_tree表结构
    const tableInfo = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'knowledge_tree'
      ORDER BY ordinal_position
    `);
    console.log('=== knowledge_tree 表结构 ===');
    console.log(tableInfo.rows);
    
    // 2. 检查是否有数据
    const count = await client.query('SELECT COUNT(*) FROM knowledge_tree');
    console.log('\n=== 数据总数 ===');
    console.log(count.rows[0]);
    
    // 3. 检查node_type分布
    const nodeTypes = await client.query(`
      SELECT node_type, COUNT(*) as count 
      FROM knowledge_tree 
      GROUP BY node_type
    `);
    console.log('\n=== node_type 分布 ===');
    console.log(nodeTypes.rows);
    
    // 4. 检查是否有小节总结节点
    const summaryNodes = await client.query(`
      SELECT * FROM knowledge_tree 
      WHERE title LIKE '%小节总结%' OR node_type = 'section_summary'
      LIMIT 5
    `);
    console.log('\n=== 小节总结节点 ===');
    console.log(summaryNodes.rows.length > 0 ? summaryNodes.rows : '没有找到小节总结节点');
    
    // 5. 检查是否有importance字段和高频标记
    const highFreq = await client.query(`
      SELECT id, title, importance, node_type 
      FROM knowledge_tree 
      WHERE importance >= 4
      LIMIT 5
    `);
    console.log('\n=== 高频考点(importance>=4) ===');
    console.log(highFreq.rows.length > 0 ? highFreq.rows : '没有高频考点');
    
    // 6. 检查expert_tips表是否存在
    try {
      const expertTips = await client.query('SELECT COUNT(*) FROM expert_tips');
      console.log('\n=== expert_tips 数据数量 ===');
      console.log(expertTips.rows[0]);
    } catch (e) {
      console.log('\n=== expert_tips 表不存在 ===');
    }
    
    // 7. 检查树结构示例
    const treeExample = await client.query(`
      SELECT id, code, title, node_type, level, parent_id, importance
      FROM knowledge_tree 
      ORDER BY level, sort_order
      LIMIT 20
    `);
    console.log('\n=== 树结构示例(前20条) ===');
    console.log(treeExample.rows);
    
  } finally {
    client.release();
    pool.end();
  }
}
check().catch(console.error);
