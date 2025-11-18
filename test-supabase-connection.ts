/**
 * Supabase 数据库直连测试脚本
 * 测试直接连接到 tiku2 数据库
 */

import { PrismaClient } from '@prisma/client'

// Supabase tiku2 数据库连接配置
const DATABASE_URL = 'postgresql://postgres:bdcW5inRuvSMfwYN@db.tparjdkxxtnentsdazfw.supabase.co:5432/postgres'

async function testConnection() {
  console.log('🔍 开始测试 Supabase tiku2 数据库连接...\n')
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
    log: ['query', 'info', 'warn', 'error'],
  })

  try {
    // 测试 1: 基础连接
    console.log('✅ 测试 1: 基础数据库连接')
    await prisma.$connect()
    console.log('   ✓ 数据库连接成功!\n')

    // 测试 2: 执行简单查询
    console.log('✅ 测试 2: 执行原始查询')
    const result = await prisma.$queryRaw`SELECT version(), current_database(), current_user`
    console.log('   ✓ 查询成功!')
    console.log('   数据库信息:', result)
    console.log()

    // 测试 3: 检查现有表
    console.log('✅ 测试 3: 检查数据库表')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    ` as Array<{ table_name: string }>
    
    if (tables.length > 0) {
      console.log(`   ✓ 找到 ${tables.length} 个表:`)
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`)
      })
    } else {
      console.log('   ⚠️  数据库中还没有表，需要运行 Prisma 迁移')
    }
    console.log()

    // 测试 4: 测试 Prisma 客户端查询（如果表存在）
    if (tables.some(t => t.table_name === 'users')) {
      console.log('✅ 测试 4: Prisma 客户端查询')
      try {
        const userCount = await prisma.user.count()
        console.log(`   ✓ 用户表查询成功! 当前用户数: ${userCount}`)
      } catch (error) {
        console.log('   ⚠️  Prisma 查询失败，可能需要运行数据库迁移')
      }
      console.log()
    }

    console.log('🎉 所有测试完成！数据库连接正常！')
    console.log('\n📋 下一步操作:')
    console.log('1. 在项目根目录创建 .env.local 文件（如果还没有）')
    console.log('2. 添加以下内容到 .env.local:')
    console.log('   DATABASE_URL="postgresql://postgres:bdcW5inRuvSMfwYN@db.tparjdkxxtnentsdazfw.supabase.co:5432/postgres"')
    console.log('3. 如果数据库是空的，运行: npm run db:push')
    console.log('4. 运行开发服务器: npm run dev')

  } catch (error) {
    console.error('❌ 连接失败:', error)
    
    if (error instanceof Error) {
      console.error('\n错误详情:', error.message)
      
      if (error.message.includes('timeout')) {
        console.log('\n💡 建议: 网络超时，请检查:')
        console.log('   1. 网络连接是否正常')
        console.log('   2. 防火墙是否阻止了 5432 端口')
        console.log('   3. Supabase 项目是否处于激活状态')
      } else if (error.message.includes('authentication')) {
        console.log('\n💡 建议: 认证失败，请检查:')
        console.log('   1. 数据库密码是否正确')
        console.log('   2. 连接字符串格式是否正确')
      }
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行测试
testConnection()
