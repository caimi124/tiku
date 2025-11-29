import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查法规题目选项数据\n');

  // 检查前5题的详细信息
  const questions = await prisma.questions.findMany({
    where: {
      source_year: 2024,
      subject: '药事管理与法规'
    },
    orderBy: { created_at: 'asc' },
    take: 5,
    select: {
      content: true,
      options: true,
      correct_answer: true
    }
  });

  questions.forEach((q, index) => {
    console.log(`\n题${index + 1}:`);
    console.log(`内容: ${q.content.substring(0, 30)}...`);
    console.log(`选项类型: ${typeof q.options}`);
    console.log(`选项内容:`, q.options);
    console.log(`答案: ${q.correct_answer}`);
    console.log('-'.repeat(50));
  });
}

main()
  .catch((error) => {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
