/**
 * 测试西药药二知识图谱搜索功能
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const SUBJECT_CODE = 'xiyao_yaoxue_er';

async function testSearch() {
  const client = await pool.connect();
  
  try {
    console.log('=== 西药药二搜索功能测试 ===\n');
    
    // 测试用例
    const testQueries = [
      '阿司匹林',
      '禁忌',
      '不良反应',
      '抗菌药物',
      '糖尿病'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 搜索: "${query}"`);
      
      const searchPattern = `%${query}%`;
      
      // 搜索知识点
      const result = await client.query(`
        SELECT 
          kt.id, kt.title, kt.code, kt.node_type,
          section.title as section_title,
          chapter.title as chapter_title
        FROM knowledge_tree kt
        LEFT JOIN knowledge_tree section ON kt.parent_id = section.id
        LEFT JOIN knowledge_tree chapter ON section.parent_id = chapter.id
        WHERE kt.subject_code = $1
          AND (kt.title ILIKE $2 OR kt.content ILIKE $2)
        ORDER BY kt.node_type, kt.sort_order
        LIMIT 5
      `, [SUBJECT_CODE, searchPattern]);
      
      if (result.rows.length === 0) {
        console.log('   未找到结果');
      } else {
        console.log(`   找到 ${result.rows.length} 个结果:`);
        for (const row of result.rows) {
          const path = row.chapter_title 
            ? `${row.chapter_title} > ${row.section_title || ''} > ${row.title}`
            : row.title;
          console.log(`   - [${row.node_type}] ${path}`);
        }
      }
    }
    
    // 验证搜索结果包含上下文信息
    console.log('\n\n📋 验证搜索结果上下文信息:');
    
    const contextTest = await client.query(`
      SELECT 
        kt.id, kt.title, kt.code, kt.node_type,
        section.title as section_title,
        chapter.title as chapter_title,
        CASE 
          WHEN kt.node_type = 'point' AND section.title IS NOT NULL AND chapter.title IS NOT NULL THEN true
          WHEN kt.node_type = 'section' AND chapter.title IS NOT NULL THEN true
          WHEN kt.node_type = 'chapter' THEN true
          ELSE false
        END as has_context
      FROM knowledge_tree kt
      LEFT JOIN knowledge_tree section ON kt.parent_id = section.id AND kt.node_type = 'point'
      LEFT JOIN knowledge_tree chapter ON 
        (section.parent_id = chapter.id AND kt.node_type = 'point')
        OR (kt.parent_id = chapter.id AND kt.node_type = 'section')
      WHERE kt.subject_code = $1
        AND kt.title ILIKE '%药%'
      LIMIT 10
    `, [SUBJECT_CODE]);
    
    let allHaveContext = true;
    for (const row of contextTest.rows) {
      const hasContext = row.has_context;
      if (!hasContext && row.node_type !== 'chapter') {
        allHaveContext = false;
        console.log(`   ❌ ${row.title} (${row.node_type}) - 缺少上下文`);
      }
    }
    
    if (allHaveContext) {
      console.log('   ✅ 所有搜索结果都包含正确的上下文信息');
    }
    
    console.log('\n✅ 搜索功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testSearch().catch(console.error);
