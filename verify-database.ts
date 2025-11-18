/**
 * 验证数据库连接和表结构
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// 加载 .env.local 文件
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['error', 'warn'],
})

async function verifyDatabase() {
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║           🔍 验证 Supabase tiku2 数据库配置              ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')

  try {
    // 1. 测试连接
    console.log('1️⃣ 测试数据库连接...')
    await prisma.$connect()
    console.log('   ✅ 数据库连接成功!\n')

    // 2. 获取数据库信息
    console.log('2️⃣ 获取数据库信息...')
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version
    ` as any[]
    
    if (dbInfo && dbInfo[0]) {
      console.log(`   数据库: ${dbInfo[0].database}`)
      console.log(`   用户: ${dbInfo[0].user}`)
      console.log(`   版本: ${dbInfo[0].version.split(',')[0]}\n`)
    }

    // 3. 列出所有表
    console.log('3️⃣ 检查数据库表结构...')
    const tables = await prisma.$queryRaw`
      SELECT 
        table_name,
        (SELECT COUNT(*) 
         FROM information_schema.columns 
         WHERE table_schema = 'public' 
         AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      ORDER BY table_name
    ` as Array<{ table_name: string; column_count: number }>
    
    console.log(`   找到 ${tables.length} 个表:\n`)
    tables.forEach((table, index) => {
      console.log(`   ${(index + 1).toString().padStart(2, ' ')}. ${table.table_name.padEnd(30, ' ')} (${table.column_count} 列)`)
    })
    console.log()

    // 4. 检查关键表的数据量
    console.log('4️⃣ 检查表数据量...')
    
    const tableChecks = [
      { name: 'questions', label: '题目' },
      { name: 'institutions', label: '培训机构' },
      { name: 'knowledge_points', label: '知识点' },
      { name: 'user_answers', label: '答题记录' },
    ]

    for (const check of tableChecks) {
      try {
        const count = await prisma.$queryRaw`
          SELECT COUNT(*) as count 
          FROM ${prisma.$queryRawUnsafe(`"${check.name}"`)}
        ` as any[]
        console.log(`   ${check.label.padEnd(12, ' ')}: ${count[0].count} 条记录`)
      } catch (error) {
        console.log(`   ${check.label.padEnd(12, ' ')}: 表不存在或无法访问`)
      }
    }
    console.log()

    // 5. 测试 Prisma Client 查询（如果表存在）
    console.log('5️⃣ 测试 Prisma Client 功能...')
    
    // 检查 _prisma_migrations 表
    try {
      const migrations = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM _prisma_migrations
      ` as any[]
      console.log(`   ✅ Prisma 迁移记录: ${migrations[0].count} 条\n`)
    } catch (error) {
      console.log('   ⚠️  未找到 _prisma_migrations 表')
      console.log('   建议: 运行 "npm run db:push" 来同步 schema\n')
    }

    console.log('╔═══════════════════════════════════════════════════════════╗')
    console.log('║                     ✅ 验证完成                           ║')
    console.log('╚═══════════════════════════════════════════════════════════╝\n')

    console.log('📋 当前状态:')
    console.log('   • 数据库连接: ✅ 正常')
    console.log('   • Session Pooler: ✅ 工作正常')
    console.log('   • 数据库表: ✅ 已存在 ' + tables.length + ' 个表')
    console.log()

    console.log('🎯 下一步操作:')
    if (tables.some(t => t.table_name === '_prisma_migrations')) {
      console.log('   1. 生成 Prisma 客户端: npm run db:generate')
      console.log('   2. 启动开发服务器: npm run dev')
    } else {
      console.log('   1. 同步 Prisma schema: npm run db:push')
      console.log('   2. 生成 Prisma 客户端: npm run db:generate')
      console.log('   3. 启动开发服务器: npm run dev')
    }
    console.log()

  } catch (error) {
    console.error('❌ 验证失败:', error)
    console.error('\n请检查:')
    console.error('1. .env.local 文件是否存在')
    console.error('2. DATABASE_URL 是否正确')
    console.error('3. 网络连接是否正常')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifyDatabase()
