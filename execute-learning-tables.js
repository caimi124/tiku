/**
 * 直接执行 SQL 创建学习系统表
 */

const { Client } = require('pg');
const fs = require('fs');

// 使用 Session pooler 连接
const client = new Client({
  connectionString: 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('🚀 连接数据库...');
  
  try {
    await client.connect();
    console.log('✅ 数据库连接成功！\n');
    
    // 读取 SQL 文件
    const sqlContent = fs.readFileSync('create-learning-system-tables.sql', 'utf-8');
    
    // 分割 SQL 语句执行
    const statements = sqlContent
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT \''));
    
    console.log(`📝 准备执行 ${statements.length} 条 SQL 语句...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.substring(0, 60).replace(/\n/g, ' ');
      
      try {
        await client.query(stmt);
        console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
        successCount++;
      } catch (err) {
        // 忽略 "already exists" 类型的错误
        if (err.message.includes('already exists') || 
            err.message.includes('duplicate') ||
            err.message.includes('does not exist')) {
          console.log(`⚠️ [${i + 1}/${statements.length}] ${preview}... (跳过: ${err.message.substring(0, 50)})`);
        } else {
          console.log(`❌ [${i + 1}/${statements.length}] ${preview}...`);
          console.log(`   错误: ${err.message}`);
          errorCount++;
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✨ 执行完成！成功: ${successCount}, 错误: ${errorCount}`);
    console.log('='.repeat(60));
    
    // 验证表是否创建成功
    console.log('\n🔍 验证表结构...');
    
    const tables = ['daily_learning_stats', 'review_queue', 'study_plans'];
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ ${table} 表存在，当前 ${result.rows[0].count} 条记录`);
      } catch (err) {
        console.log(`❌ ${table} 表不存在或无法访问`);
      }
    }
    
  } catch (err) {
    console.error('❌ 数据库连接失败:', err.message);
  } finally {
    await client.end();
    console.log('\n👋 数据库连接已关闭');
  }
}

main();
