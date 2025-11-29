import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOptions() {
  console.log('检查2023年中药药学专业知识（二）选项数据...\n');

  // 检查前5题的选项数据
  const first5 = await prisma.questions.findMany({
    where: {
      source_year: 2023,
      subject: '中药学专业知识（二）'
    },
    orderBy: {
      created_at: 'asc'
    },
    take: 5,
    select: {
      content: true,
      options: true,
      correct_answer: true
    }
  });

  console.log('前5题选项详细数据:');
  first5.forEach((q, idx) => {
    const content = (q.content as string).substring(0, 50);
    const options = q.options as any;
    
    console.log(`\n题${idx + 1}:`);
    console.log(`  题目: ${content}...`);
    console.log(`  选项类型: ${typeof options}`);
    console.log(`  选项原始数据:`, JSON.stringify(options, null, 2));
    console.log(`  答案: ${q.correct_answer}`);
    
    if (Array.isArray(options)) {
      console.log(`  选项数组长度: ${options.length}`);
      options.forEach((opt, i) => {
        console.log(`    ${String.fromCharCode(65 + i)}: ${JSON.stringify(opt)}`);
      });
    }
  });

  await prisma.$disconnect();
}

checkOptions().catch(console.error);
