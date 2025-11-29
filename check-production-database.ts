import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
    }
  }
});

async function checkProductionDatabase() {
  try {
    console.log('🔍 检查生产数据库 (Supabase tiku2)...\n');
    
    // 1. 统计总题目数
    const totalQuestions = await prisma.questions.count();
    console.log(`📊 总题目数: ${totalQuestions}`);
    
    if (totalQuestions === 0) {
      console.log('\n⚠️  生产数据库中没有任何题目！');
      console.log('❌ 问题确认：所有题目都在本地数据库，没有导入到生产环境');
      console.log('\n💡 解决方案：需要重新运行导入脚本，确保使用生产数据库URL');
      return;
    }
    
    // 2. 按年份和科目统计
    console.log('\n📋 按年份和科目统计：');
    
    const groupedQuestions = await prisma.questions.groupBy({
      by: ['source_year', 'subject'],
      _count: {
        id: true
      },
      orderBy: [
        { source_year: 'desc' },
        { subject: 'asc' }
      ]
    });
    
    const statsMap = new Map<number, Map<string, number>>();
    
    groupedQuestions.forEach(item => {
      const year = item.source_year || 0;
      const subject = item.subject;
      const count = item._count.id;
      
      if (!statsMap.has(year)) {
        statsMap.set(year, new Map());
      }
      statsMap.get(year)!.set(subject, count);
    });
    
    // 按年份输出
    for (const [year, subjects] of Array.from(statsMap.entries()).sort((a, b) => b[0] - a[0])) {
      console.log(`\n${year}年：`);
      for (const [subject, count] of subjects.entries()) {
        console.log(`  - ${subject}: ${count}题`);
      }
    }
    
    // 3. 检查各科目题型分布
    console.log('\n📊 题型分布统计：');
    const typeStats = await prisma.questions.groupBy({
      by: ['question_type'],
      _count: {
        id: true
      }
    });
    
    typeStats.forEach(stat => {
      console.log(`  - ${stat.question_type}: ${stat._count.id}题`);
    });
    
    // 4. 检查最近导入的题目
    console.log('\n📅 最近导入的10条题目：');
    const recentQuestions = await prisma.questions.findMany({
      take: 10,
      orderBy: {
        created_at: 'desc'
      },
      select: {
        source_year: true,
        subject: true,
        question_number: true,
        chapter: true,
        created_at: true
      }
    });
    
    recentQuestions.forEach(q => {
      console.log(`  题${q.question_number} - ${q.source_year}年 ${q.subject} - ${q.chapter || '未分类'} (${q.created_at?.toLocaleDateString()})`);
    });
    
    // 5. 检查是否有2022年法规真题
    console.log('\n🔍 检查2022年法规真题：');
    const faguiCount = await prisma.questions.count({
      where: {
        source_year: 2022,
        subject: {
          contains: '法规'
        }
      }
    });
    console.log(`  - 2022年法规题数: ${faguiCount}题`);
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    console.log('\n可能的原因：');
    console.log('1. DATABASE_URL 配置错误');
    console.log('2. 网络连接问题');
    console.log('3. Supabase项目未启动');
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionDatabase();
