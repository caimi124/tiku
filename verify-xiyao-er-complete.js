/**
 * 验证西药药二知识图谱导入结果
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const SUBJECT_CODE = 'xiyao_yaoxue_er';

async function verify() {
  const client = await pool.connect();
  
  try {
    console.log('=== 西药药二知识图谱验证 ===\n');
    
    // 1. 统计各类型节点数量
    const statsResult = await client.query(`
      SELECT node_type, COUNT(*) as count 
      FROM knowledge_tree 
      WHERE subject_code = $1 
      GROUP BY node_type 
      ORDER BY 
        CASE node_type 
          WHEN 'chapter' THEN 1 
          WHEN 'section' THEN 2 
          WHEN 'point' THEN 3 
        END
    `, [SUBJECT_CODE]);
    
    console.log('📊 节点统计:');
    let total = 0;
    for (const row of statsResult.rows) {
      console.log(`   - ${row.node_type}: ${row.count}`);
      total += parseInt(row.count);
    }
    console.log(`   - 总计: ${total}`);
    
    // 2. 验证层级一致性
    const levelCheck = await client.query(`
      SELECT 
        node_type,
        level,
        COUNT(*) as count
      FROM knowledge_tree 
      WHERE subject_code = $1 
      GROUP BY node_type, level
      ORDER BY level
    `, [SUBJECT_CODE]);
    
    console.log('\n📈 层级一致性检查:');
    let levelConsistent = true;
    for (const row of levelCheck.rows) {
      const expectedLevel = row.node_type === 'chapter' ? 1 : row.node_type === 'section' ? 2 : 3;
      const isConsistent = parseInt(row.level) === expectedLevel;
      console.log(`   - ${row.node_type} (level=${row.level}): ${row.count} ${isConsistent ? '✅' : '❌'}`);
      if (!isConsistent) levelConsistent = false;
    }
    console.log(`   层级一致性: ${levelConsistent ? '✅ 通过' : '❌ 失败'}`);
    
    // 3. 验证父子关系
    const orphanSections = await client.query(`
      SELECT COUNT(*) as count
      FROM knowledge_tree s
      WHERE s.subject_code = $1 
        AND s.node_type = 'section'
        AND NOT EXISTS (
          SELECT 1 FROM knowledge_tree c 
          WHERE c.id = s.parent_id AND c.node_type = 'chapter'
        )
    `, [SUBJECT_CODE]);
    
    const orphanPoints = await client.query(`
      SELECT COUNT(*) as count
      FROM knowledge_tree p
      WHERE p.subject_code = $1 
        AND p.node_type = 'point'
        AND NOT EXISTS (
          SELECT 1 FROM knowledge_tree s 
          WHERE s.id = p.parent_id AND s.node_type = 'section'
        )
    `, [SUBJECT_CODE]);
    
    console.log('\n🔗 父子关系检查:');
    console.log(`   - 孤立小节数: ${orphanSections.rows[0].count} ${orphanSections.rows[0].count === '0' ? '✅' : '❌'}`);
    console.log(`   - 孤立知识点数: ${orphanPoints.rows[0].count} ${orphanPoints.rows[0].count === '0' ? '✅' : '❌'}`);
    
    // 4. 列出所有章节
    const chapters = await client.query(`
      SELECT code, title, sort_order
      FROM knowledge_tree 
      WHERE subject_code = $1 AND node_type = 'chapter'
      ORDER BY sort_order
    `, [SUBJECT_CODE]);
    
    console.log('\n📚 章节列表:');
    for (const chapter of chapters.rows) {
      console.log(`   ${chapter.code}: ${chapter.title}`);
    }
    
    // 5. 检查口诀提取
    const mnemonicCount = await client.query(`
      SELECT COUNT(*) as count
      FROM knowledge_tree 
      WHERE subject_code = $1 AND memory_tips IS NOT NULL AND memory_tips != ''
    `, [SUBJECT_CODE]);
    
    console.log(`\n💡 包含口诀的节点数: ${mnemonicCount.rows[0].count}`);
    
    // 6. 检查重要性分布
    const importanceDistribution = await client.query(`
      SELECT importance, COUNT(*) as count
      FROM knowledge_tree 
      WHERE subject_code = $1
      GROUP BY importance
      ORDER BY importance
    `, [SUBJECT_CODE]);
    
    console.log('\n⭐ 重要性分布:');
    for (const row of importanceDistribution.rows) {
      console.log(`   - 重要性 ${row.importance}: ${row.count} 个节点`);
    }
    
    console.log('\n✅ 验证完成！');
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verify().catch(console.error);
