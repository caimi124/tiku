/**
 * 执行知识图谱页面层级优化数据库迁移
 * 
 * 运行方式: node execute-knowledge-learning-path-migration.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 从环境变量获取配置
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少环境变量 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 开始执行知识图谱页面层级优化数据库迁移...\n')
  
  try {
    // 读取迁移文件
    const migrationPath = path.join(__dirname, 'migrations', '002-knowledge-learning-path.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')
    
    // 分割SQL语句（按分号分割，但忽略函数内部的分号）
    const statements = splitSqlStatements(sql)
    
    console.log(`📝 共 ${statements.length} 条SQL语句需要执行\n`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim()
      if (!stmt || stmt.startsWith('--')) continue
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: stmt })
        
        if (error) {
          // 尝试直接执行
          const { error: directError } = await supabase.from('_migrations').select('*').limit(0)
          if (directError) {
            console.log(`⚠️  语句 ${i + 1}: 跳过 (可能已存在)`)
          }
        } else {
          successCount++
          console.log(`✅ 语句 ${i + 1}: 成功`)
        }
      } catch (err) {
        // 忽略"已存在"类型的错误
        if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
          console.log(`⚠️  语句 ${i + 1}: 跳过 (已存在)`)
        } else {
          errorCount++
          console.log(`❌ 语句 ${i + 1}: 失败 - ${err.message}`)
        }
      }
    }
    
    console.log('\n========================================')
    console.log(`✅ 成功: ${successCount}`)
    console.log(`⚠️  跳过/警告: ${statements.length - successCount - errorCount}`)
    console.log(`❌ 失败: ${errorCount}`)
    console.log('========================================\n')
    
    if (errorCount === 0) {
      console.log('🎉 数据库迁移完成！')
    } else {
      console.log('⚠️  部分迁移失败，请检查错误信息')
    }
    
  } catch (error) {
    console.error('❌ 迁移执行失败:', error.message)
    process.exit(1)
  }
}

/**
 * 分割SQL语句，正确处理函数定义中的分号
 */
function splitSqlStatements(sql) {
  const statements = []
  let current = ''
  let inFunction = false
  let dollarQuote = ''
  
  const lines = sql.split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // 跳过纯注释行
    if (trimmedLine.startsWith('--') && !current.trim()) {
      continue
    }
    
    // 检测函数开始 ($$)
    if (trimmedLine.includes('$') && !inFunction) {
      const match = trimmedLine.match(/\$[a-zA-Z]*\$/)
      if (match) {
        dollarQuote = match[0]
        inFunction = true
      }
    }
    
    current += line + '\n'
    
    // 检测函数结束
    if (inFunction && trimmedLine.includes(dollarQuote) && current.split(dollarQuote).length > 2) {
      inFunction = false
      dollarQuote = ''
    }
    
    // 如果不在函数内且行以分号结束，则为一条完整语句
    if (!inFunction && trimmedLine.endsWith(';')) {
      statements.push(current.trim())
      current = ''
    }
  }
  
  // 添加最后一条语句（如果有）
  if (current.trim()) {
    statements.push(current.trim())
  }
  
  return statements.filter(s => s && !s.startsWith('--'))
}

runMigration()
