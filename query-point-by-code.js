// 查询考点 C5.1.1 的所有内容
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/tiku',
});

async function queryPointByCode() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        id,
        code,
        title,
        content,
        node_type,
        point_type,
        drug_name,
        importance,
        importance_level,
        learn_mode,
        error_pattern_tags,
        memory_tips,
        parent_id,
        subject_code,
        level,
        sort_order,
        key_takeaway,
        exam_years,
        exam_frequency
      FROM knowledge_tree
      WHERE code = 'C5.1.1'
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('未找到考点 C5.1.1');
    }
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

queryPointByCode();

