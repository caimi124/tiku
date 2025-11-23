const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function verify() {
  try {
    await client.connect();
    console.log('✅ 连接成功\n');
    
    // 查询统计
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        MIN(id) as first_id,
        MAX(id) as last_id,
        COUNT(CASE WHEN question_type = 'single' THEN 1 END) as single_choice,
        COUNT(CASE WHEN question_type = 'matching' THEN 1 END) as matching,
        COUNT(CASE WHEN question_type = 'case' THEN 1 END) as case_analysis,
        COUNT(CASE WHEN question_type = 'multiple' THEN 1 END) as multiple_choice
      FROM questions 
      WHERE source_year = 2024 
      AND subject = '中药学综合知识与技能'
    `);
    
    console.log('📊 当前数据库统计：');
    console.log('='.repeat(50));
    console.log(`总题数：${stats.rows[0].total} 道`);
    console.log(`题目ID范围：${stats.rows[0].first_id} ~ ${stats.rows[0].last_id}`);
    console.log(`最佳选择题：${stats.rows[0].single_choice} 道`);
    console.log(`配伍选择题：${stats.rows[0].matching} 道`);
    console.log(`综合分析题：${stats.rows[0].case_analysis} 道`);
    console.log(`多项选择题：${stats.rows[0].multiple_choice} 道`);
    console.log('='.repeat(50));
    
    // 显示所有题目ID
    const questions = await client.query(`
      SELECT id, content 
      FROM questions 
      WHERE source_year = 2024 
      ORDER BY id
    `);
    
    console.log(`\n📝 所有${questions.rows.length}道题目：`);
    questions.rows.forEach((q, idx) => {
      console.log(`${idx + 1}. [${q.id}] ${q.content.substring(0, 50)}...`);
    });
    
  } catch (error) {
    console.error('❌ 错误：', error.message);
  } finally {
    await client.end();
  }
}

verify();
