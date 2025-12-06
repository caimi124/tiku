/**
 * 智能学习系统数据库表设置脚本
 * 执行方式: npx ts-node setup-learning-system-tables.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少 Supabase 配置，请检查 .env.local 文件')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSql(sql: string, description: string) {
  console.log(`\n📝 执行: ${description}`)
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      // 如果 exec_sql 函数不存在，尝试直接执行
      console.log('   ⚠️ exec_sql 函数不可用，请在 Supabase SQL Editor 中手动执行')
      return false
    }
    
    console.log('   ✅ 成功')
    return true
  } catch (err) {
    console.log('   ⚠️ 需要在 Supabase SQL Editor 中手动执行')
    return false
  }
}

async function main() {
  console.log('🚀 开始设置智能学习系统数据库表...\n')
  console.log(`📍 Supabase URL: ${supabaseUrl}`)
  
  // 读取 SQL 文件
  const sqlPath = path.join(__dirname, 'create-learning-system-tables.sql')
  
  if (!fs.existsSync(sqlPath)) {
    console.error('❌ 找不到 SQL 文件:', sqlPath)
    process.exit(1)
  }
  
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8')
  
  console.log('\n📋 SQL 文件已读取，包含以下内容:')
  console.log('   - study_plans 表增强')
  console.log('   - daily_learning_stats 表')
  console.log('   - review_queue 表')
  console.log('   - 自动更新触发器')
  console.log('   - 学习统计视图')
  console.log('   - 连续学习天数函数')
  
  console.log('\n' + '='.repeat(60))
  console.log('⚠️  重要提示：')
  console.log('='.repeat(60))
  console.log('\n由于 Supabase 安全限制，请按以下步骤操作：\n')
  console.log('1. 打开 Supabase Dashboard: https://supabase.com/dashboard')
  console.log('2. 选择项目: tparjdkxxtnentsdazfw')
  console.log('3. 进入 SQL Editor')
  console.log('4. 复制并执行 create-learning-system-tables.sql 文件内容')
  console.log('\n' + '='.repeat(60))
  
  // 验证现有表
  console.log('\n🔍 验证现有表结构...')
  
  const { data: tables, error: tablesError } = await supabase
    .from('knowledge_tree')
    .select('id')
    .limit(1)
  
  if (tablesError) {
    console.log('   ⚠️ knowledge_tree 表可能不存在，请先执行 create-knowledge-tree-tables.sql')
  } else {
    console.log('   ✅ knowledge_tree 表存在')
  }
  
  // 检查 daily_learning_stats 表
  const { data: statsTable, error: statsError } = await supabase
    .from('daily_learning_stats')
    .select('id')
    .limit(1)
  
  if (statsError) {
    console.log('   ⚠️ daily_learning_stats 表不存在，需要创建')
  } else {
    console.log('   ✅ daily_learning_stats 表已存在')
  }
  
  // 检查 review_queue 表
  const { data: queueTable, error: queueError } = await supabase
    .from('review_queue')
    .select('id')
    .limit(1)
  
  if (queueError) {
    console.log('   ⚠️ review_queue 表不存在，需要创建')
  } else {
    console.log('   ✅ review_queue 表已存在')
  }
  
  console.log('\n✨ 脚本执行完成！')
  console.log('📝 请在 Supabase SQL Editor 中执行 create-learning-system-tables.sql')
}

main().catch(console.error)
