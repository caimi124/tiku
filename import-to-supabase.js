const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase 数据库连接配置 (使用 Session Pooler)
const client = new Client({
  connectionString: 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function importQuestions() {
  try {
    console.log('🔌 正在连接到 Supabase tiku2 数据库...\n');
    await client.connect();
    console.log('✅ 数据库连接成功！\n');

    // 读取SQL文件
    const sqlFile = path.join(__dirname, '03-导入2024年中药药综真题-完整版.sql');
    console.log('📖 正在读取SQL文件...');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // 先清理旧数据
    console.log('🗑️  正在清理2024年旧数据...');
    const deleteResult = await client.query(`
      DELETE FROM questions 
      WHERE source_year = 2024 
      AND subject = '中药学综合知识与技能'
    `);
    console.log(`   已删除 ${deleteResult.rowCount} 条旧记录\n`);

    // 执行导入
    console.log('📥 开始导入120道题目...\n');
    await client.query(sql);
    
    // 验证导入结果
    const result = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN question_type = 'single' THEN 1 END) as single_choice,
        COUNT(CASE WHEN question_type = 'matching' THEN 1 END) as matching,
        COUNT(CASE WHEN question_type = 'case' THEN 1 END) as case_analysis,
        COUNT(CASE WHEN question_type = 'multiple' THEN 1 END) as multiple_choice
      FROM questions 
      WHERE source_year = 2024 
      AND subject = '中药学综合知识与技能'
    `);

    const stats = result.rows[0];
    
    console.log('✅ 导入成功！\n');
    console.log('📊 导入统计：');
    console.log('='.repeat(50));
    console.log(`   总题数：         ${stats.total} 道`);
    console.log(`   最佳选择题：     ${stats.single_choice} 道`);
    console.log(`   配伍选择题：     ${stats.matching} 道`);
    console.log(`   综合分析题：     ${stats.case_analysis} 道`);
    console.log(`   多项选择题：     ${stats.multiple_choice} 道`);
    console.log('='.repeat(50));
    console.log('\n🎉 数据导入完成！\n');
    
    // 显示前3题作为验证
    const sampleResult = await client.query(`
      SELECT id, content, correct_answer 
      FROM questions 
      WHERE source_year = 2024 
      ORDER BY id 
      LIMIT 3
    `);
    
    console.log('📝 前3道题预览：');
    console.log('-'.repeat(50));
    sampleResult.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. [${row.id}] ${row.content.substring(0, 40)}...`);
      console.log(`   答案: ${row.correct_answer}\n`);
    });
    
    console.log('🌐 现在可以访问：');
    console.log('   历年真题页面：https://yikaobiguo.com/practice/history');
    console.log('   2024年真题：  https://yikaobiguo.com/practice/history/2024');
    
  } catch (error) {
    console.error('❌ 导入失败：', error.message);
    console.error('详细错误：', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 数据库连接已关闭');
  }
}

// 执行导入
console.log('🚀 2024年执业药师中药学综合知识与技能真题导入工具');
console.log('='.repeat(60));
console.log('📍 目标数据库: Supabase tiku2');
console.log('📦 题目数量: 120道');
console.log('='.repeat(60));
console.log('');

importQuestions();
