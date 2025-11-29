import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查2024年法规题101-110的解析数据（作为参考）\n');

  const questions = await prisma.questions.findMany({
    where: {
      source_year: 2024,
      subject: '药事管理与法规'
    },
    orderBy: { created_at: 'asc' },
    skip: 100,
    take: 10,
    select: {
      content: true,
      correct_answer: true,
      ai_explanation: true
    }
  });

  console.log('📊 2024年法规题101-110解析情况:\n');
  questions.forEach((q, index) => {
    const questionNum = 101 + index;
    const hasExplanation = q.ai_explanation && q.ai_explanation.trim() !== '';
    const status = hasExplanation ? '✅' : '❌';
    console.log(`题${questionNum} ${status}: ${hasExplanation ? '有解析' : '无解析'}`);
    if (hasExplanation) {
      console.log(`   解析: ${q.ai_explanation.substring(0, 60)}...`);
    }
    console.log('');
  });

  const withExplanation = questions.filter(q => q.ai_explanation && q.ai_explanation.trim() !== '').length;
  console.log(`📊 统计: ${withExplanation}/10 题有解析`);
}

main()
  .catch((error) => {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
