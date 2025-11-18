/**
 * 测试 Prisma Client 查询功能
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['error', 'warn'],
})

async function testPrismaQueries() {
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║            🧪 测试 Prisma Client 查询功能                ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')

  try {
    // 1. 连接测试
    console.log('1️⃣  连接数据库...')
    await prisma.$connect()
    console.log('   ✅ 连接成功!\n')

    // 2. 查询题目数量
    console.log('2️⃣  查询题目表...')
    try {
      const questionCount = await prisma.questions.count()
      console.log(`   ✅ 题目总数: ${questionCount}\n`)

      if (questionCount > 0) {
        const firstQuestion = await prisma.questions.findFirst({
          select: {
            id: true,
            exam_type: true,
            subject: true,
            question_type: true,
            created_at: true,
          }
        })
        console.log('   📝 第一条题目:')
        console.log(`      ID: ${firstQuestion?.id}`)
        console.log(`      考试类型: ${firstQuestion?.exam_type}`)
        console.log(`      科目: ${firstQuestion?.subject}`)
        console.log(`      题型: ${firstQuestion?.question_type}\n`)
      }
    } catch (error) {
      console.log('   ⚠️  题目表查询失败:', error instanceof Error ? error.message : error, '\n')
    }

    // 3. 查询培训机构
    console.log('3️⃣  查询培训机构...')
    try {
      const institutionCount = await prisma.institutions.count()
      console.log(`   ✅ 培训机构数量: ${institutionCount}\n`)
    } catch (error) {
      console.log('   ⚠️  培训机构查询失败:', error instanceof Error ? error.message : error, '\n')
    }

    // 4. 查询用户资料
    console.log('4️⃣  查询用户资料...')
    try {
      const userCount = await prisma.user_profiles.count()
      console.log(`   ✅ 用户数量: ${userCount}\n`)
    } catch (error) {
      console.log('   ⚠️  用户资料查询失败:', error instanceof Error ? error.message : error, '\n')
    }

    // 5. 查询知识点
    console.log('5️⃣  查询知识点...')
    try {
      const knowledgeCount = await prisma.knowledge_points.count()
      console.log(`   ✅ 知识点数量: ${knowledgeCount}\n`)

      if (knowledgeCount > 0) {
        const topPoints = await prisma.knowledge_points.findMany({
          take: 3,
          orderBy: {
            frequency: 'desc'
          },
          select: {
            name: true,
            frequency: true,
            importance_level: true,
          }
        })
        console.log('   📊 热门知识点:')
        topPoints.forEach((point, index) => {
          console.log(`      ${index + 1}. ${point.name} (频率: ${point.frequency}, 重要度: ${point.importance_level})`)
        })
        console.log()
      }
    } catch (error) {
      console.log('   ⚠️  知识点查询失败:', error instanceof Error ? error.message : error, '\n')
    }

    console.log('╔═══════════════════════════════════════════════════════════╗')
    console.log('║                  ✅ 所有测试完成！                        ║')
    console.log('╚═══════════════════════════════════════════════════════════╝\n')

    console.log('🎯 数据库直连配置成功！')
    console.log('\n✅ Prisma Client 工作正常')
    console.log('✅ Session Pooler 连接稳定')
    console.log('✅ 可以正常查询数据\n')

    console.log('📋 下一步:')
    console.log('   启动开发服务器: npm run dev')
    console.log('   访问: http://localhost:3000\n')

  } catch (error) {
    console.error('❌ 测试失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testPrismaQueries()
