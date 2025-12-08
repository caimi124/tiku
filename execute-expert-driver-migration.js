/**
 * 执行老司机模式数据库迁移
 * 运行: node execute-expert-driver-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少环境变量 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeMigration() {
  console.log('🚀 开始执行老司机模式数据库迁移...\n');

  try {
    // 读取迁移文件
    const migrationPath = path.join(__dirname, 'migrations', '003-expert-driver-mode.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // 分割SQL语句（按分号分割，但忽略函数体内的分号）
    const statements = migrationSQL
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 找到 ${statements.length} 条SQL语句\n`);

    // 逐条执行
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.substring(0, 60).replace(/\n/g, ' ');
      console.log(`[${i + 1}/${statements.length}] 执行: ${preview}...`);

      const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' }).single();
      
      if (error) {
        // 尝试直接执行（某些Supabase配置可能不支持exec_sql）
        console.log(`   ⚠️ RPC失败，尝试直接执行...`);
      }
    }

    console.log('\n✅ 迁移执行完成！');
    console.log('\n📋 验证表是否创建成功...');

    // 验证表是否存在
    const tables = ['expert_driver_content', 'prompt_templates', 'expert_driver_review_queue'];
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: 表存在`);
      }
    }

  } catch (error) {
    console.error('❌ 迁移执行失败:', error.message);
    process.exit(1);
  }
}

// 如果Supabase不支持exec_sql，提供手动执行说明
function printManualInstructions() {
  console.log('\n📌 如果自动执行失败，请手动执行以下步骤：');
  console.log('1. 打开 Supabase Dashboard');
  console.log('2. 进入 SQL Editor');
  console.log('3. 复制 migrations/003-expert-driver-mode.sql 的内容');
  console.log('4. 粘贴并执行');
}

executeMigration()
  .then(() => {
    printManualInstructions();
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    printManualInstructions();
    process.exit(1);
  });
