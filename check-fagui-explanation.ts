import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查法规题目解析数据\n');

  // 检查前5题的解析
  const questions = await prisma.questions.findMany({
    where: {
      source_year: 2024,
      subject: '药事管理与法规'
    },
    orderBy: { created_at: 'asc' },
    take: 5,
    select: {
      content: true,
      correct_answer: true,
      ai_explanation: true,
      explanation: true
    }
  });

  questions.forEach((q, index) => {
    console.log(`\n题${index + 1}:`);
    console.log(`内容: ${q.content.substring(0, 30)}...`);
    console.log(`答案: ${q.correct_answer}`);
    console.log(`ai_explanation字段: ${q.ai_explanation && q.ai_explanation.length > 0 ? q.ai_explanation.substring(0, 50) + '...' : '(空)'}`);
    console.log(`explanation字段: ${q.explanation || '(空)'}`);
    console.log('-'.repeat(50));
  });

  // 统计有解析的题目数量
  const totalWithExplanation = await prisma.questions.count({
    where: {
      source_year: 2024,
      subject: '药事管理与法规',
      AND: [
        { ai_explanation: { not: null } },
        { ai_explanation: { not: '' } }
      ]
    }
  });

  const total = await prisma.questions.count({
    where: {
      source_year: 2024,
      subject: '药事管理与法规'
    }
  });

  console.log(`\n📊 统计: ${totalWithExplanation}/${total} 道题有解析`);
}

main()
  .catch((error) => {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
