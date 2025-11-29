import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFrontendOptions() {
  console.log('测试前端选项数据格式...\n');

  // 模拟前端API调用
  const questions = await prisma.questions.findMany({
    where: {
      source_year: 2023,
      subject: '中药学专业知识（二）'
    },
    orderBy: {
      created_at: 'asc'
    },
    take: 3,
    select: {
      id: true,
      content: true,
      options: true,
      correct_answer: true,
      explanation: true,
      question_type: true
    }
  });

  console.log('前端将接收到的数据格式:');
  questions.forEach((q, idx) => {
    const options = q.options as { key: string; value: string }[];
    
    console.log(`\n题${idx + 1}:`);
    console.log(`  题目: ${q.content.substring(0, 40)}...`);
    console.log(`  选项:`);
    options.forEach(opt => {
      console.log(`    ${opt.key}. ${opt.value}`);
    });
    console.log(`  答案: ${q.correct_answer}`);
    console.log(`  类型: ${q.question_type}`);
  });

  await prisma.$disconnect();
}

testFrontendOptions().catch(console.error);
