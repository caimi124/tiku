const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const client = await pool.connect();
  try {
    // 获取考点信息
    const pointId = '5a5f37d8-b821-42c1-8668-b508faa8c30b';
    
    const result = await client.query(`
      SELECT id, title, level, parent_id, node_type
      FROM knowledge_tree 
      WHERE id = $1
    `, [pointId]);
    
    console.log('考点信息:', result.rows[0]);
    
    // 获取面包屑
    let currentId = result.rows[0].parent_id;
    const breadcrumb = [];
    
    while (currentId) {
      const parentResult = await client.query(`
        SELECT id, title, level, parent_id, node_type
        FROM knowledge_tree 
        WHERE id = $1
      `, [currentId]);
      
      if (parentResult.rows.length === 0) break;
      
      const node = parentResult.rows[0];
      breadcrumb.unshift({
        id: node.id,
        title: node.title,
        level: node.level,
        node_type: node.node_type
      });
      
      currentId = node.parent_id;
    }
    
    console.log('\n面包屑数据:', JSON.stringify(breadcrumb, null, 2));
    
    // 检查point_tags表是否存在
    try {
      const tagsResult = await client.query(`
        SELECT * FROM point_tags WHERE point_id = $1
      `, [pointId]);
      console.log('\n标签数据:', tagsResult.rows);
    } catch (e) {
      console.log('\npoint_tags表不存在或查询失败:', e.message);
    }
    
  } finally {
    client.release();
    pool.end();
  }
}
check().catch(console.error);
