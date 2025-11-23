const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres'
});

async function testQueries() {
  try {
    console.log('🔍 测试Prisma查询\n');
    
    // 测试1: 直接查询2024年题目
    console.log('1️⃣ 查询 source_year = 2024 的题目：');
    const result1 = await prisma.questions.findMany({
      where: {
        source_year: 2024,
        is_published: true
      },
      take: 3
    });
    console.log(`   找到 ${result1.length} 道题`);
    if (result1.length > 0) {
      console.log(`   第一题: [${result1[0].id}] ${result1[0].content?.substring(0, 40)}...`);
    }
    
    // 测试2: 统计2024年题目总数
    console.log('\n2️⃣ 统计 source_year = 2024 的题目总数：');
    const count = await prisma.questions.count({
      where: {
        source_year: 2024,
        is_published: true
      }
    });
    console.log(`   总数: ${count} 道`);
    
    // 测试3: 带subject条件查询
    console.log('\n3️⃣ 查询 source_year = 2024 且 subject = 中药学综合知识与技能：');
    const result3 = await prisma.questions.findMany({
      where: {
        source_year: 2024,
        subject: '中药学综合知识与技能',
        is_published: true
      }
    });
    console.log(`   找到 ${result3.length} 道题`);
    
    // 测试4: 统计带subject的题目
    console.log('\n4️⃣ 统计 source_year = 2024 且 subject = 中药学综合知识与技能的总数：');
    const count2 = await prisma.questions.count({
      where: {
        source_year: 2024,
        subject: '中药学综合知识与技能',
        is_published: true
      }
    });
    console.log(`   总数: ${count2} 道`);
    
    // 测试5: 查看一条完整数据
    console.log('\n5️⃣ 查看一条完整数据的字段：');
    const sample = await prisma.questions.findFirst({
      where: { source_year: 2024 }
    });
    if (sample) {
      console.log('   字段值:');
      console.log(`   - id: ${sample.id}`);
      console.log(`   - source_year: ${sample.source_year}`);
      console.log(`   - subject: ${sample.subject}`);
      console.log(`   - is_published: ${sample.is_published}`);
      console.log(`   - exam_type: ${sample.exam_type}`);
    }
    
    console.log('\n✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testQueries();
