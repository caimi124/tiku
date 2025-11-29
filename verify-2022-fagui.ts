import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 验证2022年执业药师法规历年真题数据质量\n');

  // 1. 基础统计
  const totalCount = await prisma.questions.count({
    where: {
      source_year: 2022,
      subject: '药事管理与法规'
    }
  });

  console.log('📊 基础统计:');
  console.log(`   总题数: ${totalCount} 道 (预期: 120)`);

  // 2. 题型分布
  const chapterStats = await prisma.$queryRaw<Array<{ chapter: string; count: bigint }>>`
    SELECT chapter, COUNT(*) as count
    FROM questions
    WHERE source_year = 2022 AND subject = '药事管理与法规'
    GROUP BY chapter
    ORDER BY MIN(created_at)
  `;

  console.log('\n📊 章节分布:');
  chapterStats.forEach(stat => {
    console.log(`   ${stat.chapter}: ${stat.count} 道`);
  });

  // 3. 选项数量检查
  console.log('\n📊 选项数量检查:');
  const allQuestions = await prisma.questions.findMany({
    where: {
      source_year: 2022,
      subject: '药事管理与法规'
    },
    orderBy: { created_at: 'asc' },
    select: {
      content: true,
      options: true,
      chapter: true
    }
  });

  const optionStats: Record<number, number> = {};
  allQuestions.forEach(q => {
    const optionCount = (q.options as string[]).length;
    optionStats[optionCount] = (optionStats[optionCount] || 0) + 1;
  });

  Object.entries(optionStats).forEach(([count, num]) => {
    console.log(`   ${count}个选项: ${num} 道题`);
  });

  // 4. 检查配伍选择题选项
  console.log('\n📊 配伍选择题选项检查（前10题、后10题）:');
  const peiwuQuestions = allQuestions.filter(q => q.chapter === '二、配伍选择题');
  
  console.log('   前10题:');
  peiwuQuestions.slice(0, 10).forEach((q, idx) => {
    const optionCount = (q.options as string[]).length;
    const questionPreview = q.content.substring(0, 30);
    console.log(`     题${idx + 41}: ${optionCount}个选项 - ${questionPreview}...`);
  });

  console.log('\n   后10题:');
  peiwuQuestions.slice(-10).forEach((q, idx) => {
    const actualQuestionNumber = 101 + idx;
    const optionCount = (q.options as string[]).length;
    const questionPreview = q.content.substring(0, 30);
    console.log(`     题${actualQuestionNumber}: ${optionCount}个选项 - ${questionPreview}...`);
  });

  // 5. 检查多选题
  console.log('\n📊 多项选择题检查:');
  const multipleQuestions = await prisma.questions.findMany({
    where: {
      source_year: 2022,
      subject: '药事管理与法规',
      question_type: 'multiple'
    },
    orderBy: { created_at: 'asc' },
    select: {
      content: true,
      correct_answer: true,
      options: true
    }
  });

  multipleQuestions.forEach((q, idx) => {
    const questionNumber = 111 + idx;
    const answerLength = q.correct_answer.length;
    const optionCount = (q.options as string[]).length;
    const questionPreview = q.content.substring(0, 30);
    console.log(`   题${questionNumber}: 答案${q.correct_answer}(${answerLength}个) | ${optionCount}个选项 - ${questionPreview}...`);
  });

  // 6. 检查是否有空答案或空解析
  const emptyAnswerCount = await prisma.questions.count({
    where: {
      source_year: 2022,
      subject: '药事管理与法规',
      correct_answer: ''
    }
  });

  const emptyExplanationCount = await prisma.questions.count({
    where: {
      source_year: 2022,
      subject: '药事管理与法规',
      ai_explanation: ''
    }
  });

  console.log('\n📊 数据完整性检查:');
  console.log(`   空答案题目: ${emptyAnswerCount} 道 ${emptyAnswerCount === 0 ? '✅' : '⚠️'}`);
  console.log(`   空解析题目: ${emptyExplanationCount} 道 ${emptyExplanationCount > 0 ? '⚠️ (部分题目可能无解析)' : '✅'}`);

  // 7. 抽查具体题目内容
  console.log('\n🔍 抽查具体题目:');
  const sampleNumbers = [1, 40, 41, 42, 80, 110, 111, 120];
  
  for (const num of sampleNumbers) {
    const question = await prisma.questions.findFirst({
      where: {
        source_year: 2022,
        subject: '药事管理与法规'
      },
      orderBy: { created_at: 'asc' },
      skip: num - 1,
      take: 1
    });

    if (question) {
      const options = question.options as string[];
      console.log(`\n   题${num}: ${question.chapter}`);
      console.log(`     题目: ${question.content.substring(0, 50)}...`);
      console.log(`     选项数: ${options.length}个`);
      console.log(`     第1个选项: ${options[0]}`);
      console.log(`     答案: ${question.correct_answer}`);
      console.log(`     题型: ${question.question_type}`);
    }
  }

  console.log('\n✅ 验证完成！');
}

main()
  .catch((error) => {
    console.error('❌ 验证过程出错:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
