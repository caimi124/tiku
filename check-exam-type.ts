import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
    }
  }
});

async function checkExamType() {
  try {
    console.log('🔍 检查exam_type字段值...\n');
    
    // 统计不同exam_type的题目数量
    const examTypeStats = await prisma.questions.groupBy({
      by: ['exam_type'],
      _count: {
        id: true
      }
    });
    
    console.log('📊 exam_type分布：');
    examTypeStats.forEach(stat => {
      console.log(`  - ${stat.exam_type}: ${stat._count.id}题`);
    });
    
    // 检查特定条件的查询结果（模拟API查询）
    console.log('\n🔍 模拟API查询 (exam_type = "pharmacist"):');
    const pharmacistQuestions = await prisma.questions.count({
      where: {
        exam_type: 'pharmacist',
        is_published: true,
        source_year: { not: null }
      }
    });
    console.log(`  - 符合条件的题目数: ${pharmacistQuestions}题`);
    
    // 查看几条数据的exam_type
    console.log('\n📋 查看前5条题目的exam_type:');
    const samples = await prisma.questions.findMany({
      take: 5,
      select: {
        source_year: true,
        subject: true,
        exam_type: true,
        question_number: true
      }
    });
    
    samples.forEach(q => {
      console.log(`  题${q.question_number} - ${q.source_year}年 ${q.subject} - exam_type: "${q.exam_type}"`);
    });
    
    // 如果exam_type不是pharmacist，提供修复SQL
    if (pharmacistQuestions === 0) {
      console.log('\n⚠️  问题确认：所有题目的exam_type不是"pharmacist"');
      console.log('\n💡 解决方案1：批量更新exam_type');
      console.log('   执行以下Prisma更新命令：');
      console.log('   await prisma.questions.updateMany({ data: { exam_type: "pharmacist" } });');
      
      console.log('\n💡 解决方案2：修改API查询条件');
      console.log('   移除或调整 exam_type 过滤条件');
    }
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExamType();
