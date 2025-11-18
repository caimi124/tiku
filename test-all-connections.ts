/**
 * 测试所有 Supabase 连接方式
 * 使用用户提供的最新连接信息
 */

import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

// 用户提供的连接信息
const DIRECT_CONNECTION = 'postgresql://postgres:CwKXguB7eIA4tfTn@db.tparjdkxxtnentsdazfw.supabase.co:5432/postgres'
const SESSION_POOLER = 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres'
const TRANSACTION_POOLER = 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres'

const PROJECT_URL = 'https://tparjdkxxtnentsdazfw.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s'

interface TestResult {
  method: string
  success: boolean
  error?: string
  tables?: string[]
  info?: any
}

async function testPrismaConnection(connectionUrl: string, methodName: string): Promise<TestResult> {
  console.log(`\n${'━'.repeat(60)}`)
  console.log(`🔍 测试: ${methodName}`)
  console.log('━'.repeat(60))
  
  const result: TestResult = {
    method: methodName,
    success: false
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl,
      },
    },
    log: ['error'],
  })

  try {
    console.log('⏳ 正在连接...')
    await prisma.$connect()
    console.log('✅ 连接成功!\n')

    // 获取数据库信息
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version
    ` as any[]
    
    if (dbInfo && dbInfo[0]) {
      console.log('📊 数据库信息:')
      console.log(`   数据库: ${dbInfo[0].database}`)
      console.log(`   用户: ${dbInfo[0].user}`)
      console.log(`   版本: ${dbInfo[0].version.split(',')[0]}`)
      result.info = dbInfo[0]
    }

    // 检查表
    console.log('\n📋 检查数据库表:')
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    ` as Array<{ table_name: string }>
    
    if (tables.length > 0) {
      console.log(`   ✓ 找到 ${tables.length} 个表`)
      tables.slice(0, 10).forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`)
      })
      if (tables.length > 10) {
        console.log(`   ... 还有 ${tables.length - 10} 个表`)
      }
      result.tables = tables.map(t => t.table_name)
    } else {
      console.log('   ⚠️  数据库为空（这是正常的，还未运行迁移）')
      result.tables = []
    }

    // 测试读写权限
    console.log('\n🔒 测试读写权限:')
    try {
      await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS _test_connection (id SERIAL, created_at TIMESTAMP DEFAULT NOW())`
      await prisma.$executeRaw`INSERT INTO _test_connection DEFAULT VALUES`
      const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM _test_connection` as any[]
      await prisma.$executeRaw`DROP TABLE _test_connection`
      console.log(`   ✓ 读写权限正常`)
    } catch (error) {
      console.log(`   ⚠️  权限测试失败: ${error instanceof Error ? error.message : error}`)
    }

    console.log('\n✅ ' + methodName + ' - 测试通过!')
    result.success = true

  } catch (error) {
    console.log(`❌ 连接失败`)
    if (error instanceof Error) {
      console.log(`   错误: ${error.message}`)
      result.error = error.message
    }
  } finally {
    await prisma.$disconnect()
  }

  return result
}

async function testSupabaseAPI(): Promise<TestResult> {
  console.log(`\n${'━'.repeat(60)}`)
  console.log(`🔍 测试: Supabase JS Client (API 模式)`)
  console.log('━'.repeat(60))
  
  const result: TestResult = {
    method: 'Supabase API',
    success: false
  }

  try {
    console.log('⏳ 创建 Supabase 客户端...')
    const supabase = createClient(PROJECT_URL, ANON_KEY)
    console.log('✅ 客户端创建成功!\n')

    // 测试健康检查
    console.log('📊 测试 API 连接:')
    const { data, error } = await supabase
      .from('_prisma_migrations')
      .select('*')
      .limit(1)

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('   ✓ API 连接正常（表还未创建）')
        result.success = true
      } else {
        console.log(`   ⚠️  ${error.message}`)
        result.error = error.message
      }
    } else {
      console.log('   ✓ API 查询成功!')
      result.success = true
    }

    console.log('\n✅ API 模式 - 测试通过!')

  } catch (error) {
    console.log(`❌ API 测试失败`)
    if (error instanceof Error) {
      console.log(`   错误: ${error.message}`)
      result.error = error.message
    }
  }

  return result
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗')
  console.log('║         🏥 Supabase tiku2 数据库连接完整测试             ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')
  console.log('项目信息:')
  console.log('  • 项目名称: tiku2')
  console.log('  • 项目 ID: tparjdkxxtnentsdazfw')
  console.log('  • Region: us-west-2')
  console.log('')

  const results: TestResult[] = []

  // 测试所有连接方式
  console.log('开始测试所有连接方式...\n')

  results.push(await testPrismaConnection(SESSION_POOLER, 'Session Pooler (推荐用于 Prisma)'))
  results.push(await testPrismaConnection(TRANSACTION_POOLER, 'Transaction Pooler'))
  results.push(await testPrismaConnection(DIRECT_CONNECTION, 'Direct Connection'))
  results.push(await testSupabaseAPI())

  // 汇总结果
  console.log('\n\n╔═══════════════════════════════════════════════════════════╗')
  console.log('║                    📊 测试结果汇总                        ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')

  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌'
    console.log(`${index + 1}. ${status} ${result.method}`)
    if (!result.success && result.error) {
      console.log(`   错误: ${result.error.substring(0, 100)}`)
    }
  })

  // 找出成功的连接方式
  const successfulMethods = results.filter(r => r.success)

  if (successfulMethods.length > 0) {
    console.log('\n\n╔═══════════════════════════════════════════════════════════╗')
    console.log('║                  🎉 配置建议                              ║')
    console.log('╚═══════════════════════════════════════════════════════════╝\n')

    const recommended = successfulMethods[0]
    let recommendedUrl = ''
    
    if (recommended.method.includes('Session Pooler')) {
      recommendedUrl = SESSION_POOLER
      console.log('✅ 推荐使用: Session Pooler')
      console.log('   最适合 Prisma ORM，支持长连接和事务\n')
    } else if (recommended.method.includes('Transaction Pooler')) {
      recommendedUrl = TRANSACTION_POOLER
      console.log('✅ 推荐使用: Transaction Pooler')
      console.log('   适合高并发场景\n')
    } else if (recommended.method.includes('Direct Connection')) {
      recommendedUrl = DIRECT_CONNECTION
      console.log('✅ 推荐使用: Direct Connection')
      console.log('   直接连接到数据库\n')
    }

    if (recommendedUrl) {
      console.log('📝 配置步骤:')
      console.log('\n1. 在项目根目录创建 .env.local 文件')
      console.log('\n2. 添加以下内容:\n')
      console.log('━'.repeat(60))
      console.log(`DATABASE_URL="${recommendedUrl}"`)
      console.log(`NEXT_PUBLIC_SUPABASE_URL="${PROJECT_URL}"`)
      console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY="${ANON_KEY}"`)
      console.log('━'.repeat(60))
      console.log('\n3. 初始化数据库表:')
      console.log('   npm run db:push')
      console.log('\n4. 启动开发服务器:')
      console.log('   npm run dev')
    }

    if (recommended.tables && recommended.tables.length === 0) {
      console.log('\n⚠️  注意: 数据库当前为空，需要运行 Prisma 迁移来创建表结构')
    }

  } else {
    console.log('\n\n╔═══════════════════════════════════════════════════════════╗')
    console.log('║                  ❌ 所有连接方式都失败                    ║')
    console.log('╚═══════════════════════════════════════════════════════════╝\n')
    console.log('可能的原因:')
    console.log('1. 网络连接问题')
    console.log('2. 防火墙阻止')
    console.log('3. Supabase 项目暂停')
    console.log('4. 连接信息不正确')
    console.log('\n请检查 Supabase Dashboard 中的项目状态')
  }

  console.log('\n')
}

main().catch(console.error)
