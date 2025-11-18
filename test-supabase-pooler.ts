/**
 * Supabase 连接池模式测试（使用 6543 端口）
 * 适用于无法直连 5432 端口的情况
 */

import { PrismaClient } from '@prisma/client'

// Supabase 连接池模式 - 使用 6543 端口
const POOLER_URL = 'postgresql://postgres.tparjdkxxtnentsdazfw:bdcW5inRuvSMfwYN@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres'

// 或者尝试直连模式（如果 DNS 解析成功）
const DIRECT_URL = 'postgresql://postgres:bdcW5inRuvSMfwYN@db.tparjdkxxtnentsdazfw.supabase.co:5432/postgres?sslmode=require'

async function testConnection(connectionUrl: string, modeName: string) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🔍 测试 ${modeName}`)
  console.log('='.repeat(60))
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl,
      },
    },
    log: ['error', 'warn'],
  })

  try {
    console.log('⏳ 正在连接数据库...')
    await prisma.$connect()
    console.log('✅ 数据库连接成功!\n')

    // 获取数据库信息
    console.log('📊 数据库信息:')
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        version() as version,
        current_database() as database,
        current_user as user,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    ` as any[]
    
    if (dbInfo && dbInfo[0]) {
      const info = dbInfo[0]
      console.log(`   数据库: ${info.database}`)
      console.log(`   用户: ${info.user}`)
      console.log(`   服务器IP: ${info.server_ip || 'N/A'}`)
      console.log(`   端口: ${info.server_port || 'N/A'}`)
      console.log(`   版本: ${info.version.split(',')[0]}`)
    }

    // 检查表
    console.log('\n📋 数据库表:')
    const tables = await prisma.$queryRaw`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      ORDER BY table_name
    ` as Array<{ table_name: string; column_count: number }>
    
    if (tables.length > 0) {
      console.log(`   找到 ${tables.length} 个表:`)
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name} (${table.column_count} 列)`)
      })
    } else {
      console.log('   ⚠️  数据库为空，需要运行迁移')
    }

    // 测试写操作
    console.log('\n🔒 测试数据库权限:')
    try {
      await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS _connection_test (id SERIAL PRIMARY KEY, test_time TIMESTAMP DEFAULT NOW())`
      await prisma.$executeRaw`INSERT INTO _connection_test DEFAULT VALUES`
      const testResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM _connection_test` as any[]
      await prisma.$executeRaw`DROP TABLE _connection_test`
      console.log(`   ✓ 读写权限正常 (测试记录数: ${testResult[0].count})`)
    } catch (error) {
      console.log(`   ⚠️  权限测试失败:`, error instanceof Error ? error.message : error)
    }

    console.log('\n🎉 连接测试成功!')
    console.log(`\n✅ 推荐使用: ${modeName}`)
    console.log(`\n📝 请在 .env.local 中配置:`)
    console.log(`DATABASE_URL="${connectionUrl}"`)
    
    return true

  } catch (error) {
    console.log(`❌ ${modeName} 连接失败`)
    if (error instanceof Error) {
      console.log(`   错误: ${error.message}`)
    }
    return false
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  console.log('🏥 Supabase tiku2 数据库连接测试')
  console.log('测试不同的连接方式...\n')

  // 首先尝试连接池模式（推荐）
  const poolerSuccess = await testConnection(POOLER_URL, '连接池模式 (6543端口)')

  if (!poolerSuccess) {
    // 如果连接池失败，尝试直连模式
    console.log('\n⚠️  连接池模式失败，尝试直连模式...')
    const directSuccess = await testConnection(DIRECT_URL, '直连模式 (5432端口)')
    
    if (!directSuccess) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('❌ 所有连接方式都失败了')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('\n可能的原因:')
      console.log('1. 网络问题或防火墙阻止')
      console.log('2. Supabase 项目已暂停（免费版闲置会自动暂停）')
      console.log('3. 数据库密码不正确')
      console.log('4. 项目 ID 不正确')
      console.log('\n请登录 Supabase Dashboard 检查:')
      console.log('🔗 https://supabase.com/dashboard/project/tparjdkxxtnentsdazfw')
      process.exit(1)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ 数据库配置成功!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n下一步:')
  console.log('1. 复制上面显示的 DATABASE_URL')
  console.log('2. 创建或编辑 .env.local 文件')
  console.log('3. 如果需要初始化数据库: npm run db:push')
  console.log('4. 启动开发服务器: npm run dev')
}

main()
