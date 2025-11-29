import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查题80的详细数据\n');

  // 获取题80的数据
  const q80 = await prisma.questions.findFirst({
    where: {
      source_year: 2024,
      subject: '药事管理与法规'
    },
    orderBy: { created_at: 'asc' },
    skip: 79, // 第80题
    take: 1
  });

  if (q80) {
    console.log('题目内容:', q80.content);
    console.log('\n选项类型:', typeof q80.options);
    console.log('选项数组:', JSON.stringify(q80.options, null, 2));
    console.log('\n选项数量:', Array.isArray(q80.options) ? q80.options.length : 0);
    console.log('答案:', q80.correct_answer);
    console.log('题型:', q80.question_type);
    console.log('章节:', q80.chapter);
  } else {
    console.log('未找到题80');
  }

  // 检查题79和81，看是否有关联
  console.log('\n\n🔍 检查相邻题目（题79-81）\n');
  const nearby = await prisma.questions.findMany({
    where: {
      source_year: 2024,
      subject: '药事管理与法规'
    },
    orderBy: { created_at: 'asc' },
    skip: 78,
    take: 3,
    select: {
      content: true,
      options: true,
      correct_answer: true,
      question_type: true,
      chapter: true
    }
  });

  nearby.forEach((q, index) => {
    const num = 79 + index;
    console.log(`\n题${num}:`);
    console.log(`内容: ${q.content.substring(0, 50)}...`);
    console.log(`选项数: ${Array.isArray(q.options) ? q.options.length : 0}`);
    console.log(`答案: ${q.correct_answer}`);
    console.log(`题型: ${q.question_type}`);
    console.log(`章节: ${q.chapter}`);
    if (Array.isArray(q.options)) {
      console.log('选项:', q.options);
    }
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
