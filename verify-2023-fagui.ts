import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 验证2023年法规真题导入结果\n');

  // 1. 统计总数
  const total = await prisma.questions.count({
    where: {
      source_year: 2023,
      subject: '药事管理与法规'
    }
  });

  console.log(`📊 总题数: ${total} (预期: 120)\n`);

  // 2. 题型分布
  const singleCount = await prisma.questions.count({
    where: {
      source_year: 2023,
      subject: '药事管理与法规',
      question_type: 'single'
    }
  });

  const multipleCount = await prisma.questions.count({
    where: {
      source_year: 2023,
      subject: '药事管理与法规',
      question_type: 'multiple'
    }
  });

  console.log('📊 题型分布:');
  console.log(`   单选题: ${singleCount} (预期: 110)`);
  console.log(`   多选题: ${multipleCount} (预期: 10)\n`);

  // 3. 章节分布
  const chapter1 = await prisma.questions.count({
    where: {
      source_year: 2023,
      subject: '药事管理与法规',
      chapter: '一、最佳选择题'
    }
  });

  const chapter2 = await prisma.questions.count({
    where: {
      source_year: 2023,
      subject: '药事管理与法规',
      chapter: '二、配伍选择题'
    }
  });

  const chapter3 = await prisma.questions.count({
    where: {
      source_year: 2023,
      subject: '药事管理与法规',
      chapter: '三、多项选择题'
    }
  });

  console.log('📊 章节分布:');
  console.log(`   一、最佳选择题: ${chapter1} (预期: 40)`);
  console.log(`   二、配伍选择题: ${chapter2} (预期: 70)`);
  console.log(`   三、多项选择题: ${chapter3} (预期: 10)\n`);

  // 4. 检查修复的题目（8选项问题）
  const fixedQuestions = [40, 42, 45, 48, 51, 53, 55, 58, 61, 63, 66, 68, 70, 73, 75, 78, 80, 82, 85, 87];
  
  console.log('🔧 验证修复的题目（8选项 -> 4选项）:');
  
  for (const num of fixedQuestions.slice(0, 5)) { // 抽查前5个
    const questions = await prisma.questions.findMany({
      where: {
        source_year: 2023,
        subject: '药事管理与法规'
      },
      orderBy: { created_at: 'asc' },
      skip: num - 1,
      take: 1
    });

    if (questions.length > 0) {
      const q = questions[0];
      const optionsCount = Array.isArray(q.options) ? q.options.length : 0;
      const status = optionsCount === 4 ? '✅' : '❌';
      console.log(`   题${num}: ${optionsCount}个选项 ${status}`);
    }
  }

  console.log(`   ... (共${fixedQuestions.length}道题被修复)\n`);

  // 5. 检查解析数据
  const withExplanation = await prisma.questions.count({
    where: {
      source_year: 2023,
      subject: '药事管理与法规',
      ai_explanation: { not: '' }
    }
  });

  console.log('📝 解析数据:');
  console.log(`   有解析: ${withExplanation}/${total} (${((withExplanation/total)*100).toFixed(1)}%)\n`);

  // 6. 抽查题目内容
  console.log('📋 抽查题目内容:');
  
  const samples = [1, 40, 80, 112];
  for (const num of samples) {
    const questions = await prisma.questions.findMany({
      where: {
        source_year: 2023,
        subject: '药事管理与法规'
      },
      orderBy: { created_at: 'asc' },
      skip: num - 1,
      take: 1,
      select: {
        content: true,
        options: true,
        correct_answer: true,
        chapter: true
      }
    });

    if (questions.length > 0) {
      const q = questions[0];
      const optionsCount = Array.isArray(q.options) ? q.options.length : 0;
      console.log(`\n   题${num} (${q.chapter}):`);
      console.log(`   内容: ${q.content.substring(0, 30)}...`);
      console.log(`   选项: ${optionsCount}个`);
      console.log(`   答案: ${q.correct_answer}`);
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
