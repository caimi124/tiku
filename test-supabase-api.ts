/**
 * 使用 Supabase JS Client 通过 API 访问数据库
 * 这种方式不需要直连数据库，通过 HTTPS API 访问
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tparjdkxxtnentsdazfw.supabase.co'
// 这里需要 anon key，我先用一个测试来获取信息
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NTA5NzgsImV4cCI6MjA0NzQyNjk3OH0.test' // 需要从 Dashboard 获取

async function testAPIConnection() {
  console.log('🔍 测试 Supabase API 连接（不需要直连数据库）\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 测试 1: 基础连接
  console.log('✅ 测试 1: 创建 Supabase 客户端')
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('   ✓ 客户端创建成功\n')

    // 测试 2: 数据库查询
    console.log('✅ 测试 2: 查询数据库元数据')
    const { data, error } = await supabase
      .from('_prisma_migrations') // 尝试查询 Prisma 迁移表
      .select('*')
      .limit(1)

    if (error) {
      if (error.message.includes('JWT')) {
        console.log('   ⚠️  需要正确的 API Key')
        console.log('   请从 Supabase Dashboard 获取 anon key\n')
      } else if (error.message.includes('does not exist')) {
        console.log('   ✓ API 连接正常，但数据库表还未创建')
        console.log('   这是正常的，说明连接成功!\n')
      } else {
        console.log('   错误:', error.message, '\n')
      }
    } else {
      console.log('   ✓ 数据库查询成功!')
      console.log('   迁移记录:', data?.length || 0, '\n')
    }

  } catch (error) {
    console.log('   ❌ 错误:', error instanceof Error ? error.message : error, '\n')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 获取 Supabase API Keys 的步骤:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n1. 访问 Supabase Dashboard:')
  console.log('   https://supabase.com/dashboard/project/tparjdkxxtnentsdazfw')
  console.log('\n2. 进入 Settings → API')
  console.log('\n3. 复制以下 keys:')
  console.log('   • Project URL: ' + supabaseUrl)
  console.log('   • anon public key (公开密钥)')
  console.log('   • service_role key (服务端密钥，保密)')
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

testAPIConnection()
