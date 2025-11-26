import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 验证2024年中药药学专业知识（二）导入数据\n');

  // 1. 统计总数
  const total = await prisma.questions.count({
    where: {
      source_year: 2024,
      subject: '中药学专业知识（二）'
    }
  });
  console.log(`📊 总题数: ${total} 道\n`);

  // 2. 按题型统计
  const byType = await prisma.questions.groupBy({
    by: ['question_type'],
    where: {
      source_year: 2024,
      subject: '中药学专业知识（二）'
    },
    _count: true
  });
  
  console.log('📋 题型分布:');
  byType.forEach(t => {
    console.log(`   ${t.question_type}: ${t._count} 道`);
  });

  // 3. 检查关键题目
  console.log('\n🔎 检查关键题目:\n');
  
  const checkNums = [1, 2, 41, 42, 70, 72, 91, 111, 116, 120];
  
  for (const num of checkNums) {
    const q = await prisma.questions.findFirst({
      where: {
        source_year: 2024,
        subject: '中药学专业知识（二）'
      },
      skip: num - 1,
      orderBy: { created_at: 'asc' }
    });

    if (q) {
      const options = q.options as any;
      const firstOption = options && options[0] ? options[0].value : '(无)';
      console.log(`题${num}: ${q.question_type.padEnd(8)} | 答案: ${q.correct_answer || '(空)'.padEnd(5)} | 选项A: ${firstOption.substring(0, 20)}...`);
    }
  }

  // 4. 检查空答案题目
  const emptyAnswers = await prisma.questions.findMany({
    where: {
      source_year: 2024,
      subject: '中药学专业知识（二）',
      correct_answer: ''
    },
    orderBy: { created_at: 'asc' },
    take: 10
  });

  console.log(`\n⚠️  空答案题目: ${emptyAnswers.length} 道`);
  if (emptyAnswers.length > 0) {
    emptyAnswers.slice(0, 5).forEach((q, idx) => {
      const options = q.options as any;
      const firstOption = options && options[0] ? options[0].value : '(无)';
      console.log(`   题目: ${q.content.substring(0, 30)}... | 选项A: ${firstOption.substring(0, 20)}`);
    });
  }

  console.log('\n✅ 验证完成\n');
}

main()
  .catch((e) => {
    console.error('❌ 验证失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
