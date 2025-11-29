import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkQuestionTypes() {
  console.log('检查2022年题目的题型字段...\n');

  try {
    // 检查question_type字段的值
    const typeStats = await prisma.questions.groupBy({
      by: ['question_type'],
      where: {
        source_year: 2022,
        subject: '中药学专业知识（二）'
      },
      _count: true
    });

    console.log('=== question_type 字段统计 ===');
    typeStats.forEach(stat => {
      console.log(`${stat.question_type}: ${stat._count} 题`);
    });

    // 检查chapter字段的值
    const chapterStats = await prisma.questions.groupBy({
      by: ['chapter'],
      where: {
        source_year: 2022,
        subject: '中药学专业知识（二）'
      },
      _count: true
    });

    console.log('\n=== chapter 字段统计 ===');
    chapterStats.forEach(stat => {
      console.log(`"${stat.chapter}": ${stat._count} 题`);
    });

    // 检查前5题的详细信息
    const sampleQuestions = await prisma.questions.findMany({
      where: {
        source_year: 2022,
        subject: '中药学专业知识（二）'
      },
      select: {
        content: true,
        question_type: true,
        chapter: true
      },
      take: 5,
      orderBy: {
        created_at: 'asc'
      }
    });

    console.log('\n=== 前5题详细信息 ===');
    sampleQuestions.forEach((q, idx) => {
      console.log(`题${idx + 1}:`);
      console.log(`  内容: ${q.content.substring(0, 30)}...`);
      console.log(`  question_type: "${q.question_type}"`);
      console.log(`  chapter: "${q.chapter}"`);
      console.log('');
    });

  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuestionTypes().catch(console.error);
