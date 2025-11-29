import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 验证2024年法规真题导入结果\n');

  // 1. 统计总数
  const total = await prisma.questions.count({
    where: {
      source_year: 2024,
      subject: '药事管理与法规'
    }
  });

  console.log(`📊 总题数: ${total} 道题\n`);

  // 2. 题型分布
  const typeStats = await prisma.questions.groupBy({
    by: ['question_type'],
    where: {
      source_year: 2024,
      subject: '药事管理与法规'
    },
    _count: true
  });

  console.log('📈 题型分布:');
  typeStats.forEach(stat => {
    const typeName = stat.question_type === 'single' ? '单选题' : '多选题';
    console.log(`   ${typeName}: ${stat._count} 道`);
  });

  // 3. 检查前10题
  console.log('\n📝 前10题验证:');
  const firstTen = await prisma.questions.findMany({
    where: {
      source_year: 2024,
      subject: '药事管理与法规'
    },
    orderBy: { created_at: 'asc' },
    take: 10,
    select: {
      content: true,
      correct_answer: true,
      question_type: true,
      options: true
    }
  });

  firstTen.forEach((q, index) => {
    const questionNum = index + 1;
    const preview = q.content.substring(0, 30);
    console.log(`   题${questionNum}: ${q.correct_answer} - ${preview}...`);
  });

  // 4. 检查多选题
  console.log('\n🔢 多选题验证（题111-120）:');
  const multipleQuestions = await prisma.questions.findMany({
    where: {
      source_year: 2024,
      subject: '药事管理与法规',
      question_type: 'multiple'
    },
    orderBy: { created_at: 'asc' },
    take: 10,
    select: {
      content: true,
      correct_answer: true,
      options: true
    }
  });

  multipleQuestions.forEach((q, index) => {
    const questionNum = 111 + index;
    const preview = q.content.substring(0, 40);
    const optionCount = Array.isArray(q.options) ? q.options.length : 0;
    console.log(`   题${questionNum}: 答案=${q.correct_answer}, 选项数=${optionCount} - ${preview}...`);
  });

  // 5. 检查修复的题目
  console.log('\n✨ 修复题目验证:');
  const fixedQuestions = [99, 100, 112, 116, 119, 120];
  for (const num of fixedQuestions) {
    const question = await prisma.questions.findFirst({
      where: {
        source_year: 2024,
        subject: '药事管理与法规'
      },
      orderBy: { created_at: 'asc' },
      skip: num - 1,
      take: 1,
      select: {
        content: true,
        correct_answer: true,
        question_type: true
      }
    });
    
    if (question) {
      const preview = question.content.substring(0, 30);
      console.log(`   题${num}: 答案=${question.correct_answer} (${question.question_type}) - ${preview}...`);
    }
  }

  console.log('\n✅ 验证完成！');
}

main()
  .catch((error) => {
    console.error('❌ 验证失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
