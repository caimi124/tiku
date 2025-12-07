/**
 * 清理旧的混乱数据，只保留新导入的正确结构
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function cleanup() {
  const client = await pool.connect();
  
  try {
    console.log('=== 清理旧数据 ===\n');
    
    // 删除所有不是以 xiyao_er_ 开头的数据
    const result = await client.query(`
      DELETE FROM knowledge_tree 
      WHERE subject_code = 'xiyao_yaoxue_er' 
        AND id NOT LIKE 'xiyao_er_%'
    `);
    
    console.log(`删除了 ${result.rowCount} 条旧数据\n`);
    
    // 验证结果
    const stats = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE node_type = 'chapter') as chapters,
        COUNT(*) FILTER (WHERE node_type = 'section') as sections,
        COUNT(*) FILTER (WHERE node_type = 'point') as points,
        COUNT(*) FILTER (WHERE node_type = 'section_summary') as summaries,
        COUNT(*) FILTER (WHERE importance >= 4) as high_freq
      FROM knowledge_tree
      WHERE subject_code = 'xiyao_yaoxue_er'
    `);
    
    console.log('清理后数据统计:');
    console.log(`  - 章节: ${stats.rows[0].chapters}`);
    console.log(`  - 节: ${stats.rows[0].sections}`);
    console.log(`  - 考点: ${stats.rows[0].points}`);
    console.log(`  - 小节总结: ${stats.rows[0].summaries}`);
    console.log(`  - 高频考点: ${stats.rows[0].high_freq}`);
    
    // 显示树结构示例
    const tree = await client.query(`
      SELECT id, code, title, node_type, level, parent_id
      FROM knowledge_tree
      WHERE subject_code = 'xiyao_yaoxue_er'
      ORDER BY level, sort_order
      LIMIT 30
    `);
    
    console.log('\n树结构示例:');
    tree.rows.forEach(row => {
      const indent = '  '.repeat(row.level - 1);
      console.log(`${indent}[${row.node_type}] ${row.code} - ${row.title}`);
    });
    
    console.log('\n=== 清理完成 ===');
    
  } finally {
    client.release();
    pool.end();
  }
}

cleanup().catch(console.error);
