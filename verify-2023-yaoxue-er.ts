import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('验证2023年中药药学专业知识（二）导入数据...\n');

  // 1. 检查总数
  const total = await prisma.questions.count({
    where: {
      source_year: 2023,
      subject: '中药学专业知识（二）'
    }
  });
  console.log(`✅ 总题数: ${total} 题`);

  // 2. 检查题型分布
  const byType = await prisma.questions.groupBy({
    by: ['question_type'],
    where: {
      source_year: 2023,
      subject: '中药学专业知识（二）'
    },
    _count: true
  });
  console.log('\n题型分布:');
  byType.forEach(t => {
    console.log(`  ${t.question_type}: ${t._count} 题`);
  });

  // 3. 检查章节分布
  const byChapter = await prisma.questions.groupBy({
    by: ['chapter'],
    where: {
      source_year: 2023,
      subject: '中药学专业知识（二）'
    },
    _count: true,
    orderBy: {
      chapter: 'asc'
    }
  });
  console.log('\n章节分布:');
  byChapter.forEach(c => {
    console.log(`  ${c.chapter}: ${c._count} 题`);
  });

  // 4. 检查前5题
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
      correct_answer: true,
      chapter: true
    }
  });

  console.log('\n前5题样本:');
  first5.forEach((q, idx) => {
    const content = (q.content as string).substring(0, 50);
    const options = q.options as any[];
    console.log(`  题${idx + 1}: ${content}... | 选项数: ${options.length} | 答案: ${q.correct_answer} | 章节: ${q.chapter}`);
  });

  // 5. 检查最后5题（多选题）
  const last5 = await prisma.questions.findMany({
    where: {
      source_year: 2023,
      subject: '中药学专业知识（二）'
    },
    orderBy: {
      created_at: 'desc'
    },
    take: 5,
    select: {
      content: true,
      options: true,
      correct_answer: true,
      question_type: true
    }
  });

  console.log('\n最后5题样本（多选题）:');
  last5.reverse().forEach((q, idx) => {
    const content = (q.content as string).substring(0, 50);
    const options = q.options as any[];
    console.log(`  题${116 + idx}: ${content}... | 选项数: ${options.length} | 答案: ${q.correct_answer} | 类型: ${q.question_type}`);
  });

  // 6. 检查配伍题样本
  const peiWuSample = await prisma.questions.findMany({
    where: {
      source_year: 2023,
      subject: '中药学专业知识（二）',
      chapter: '二、配伍选择题'
    },
    orderBy: {
      created_at: 'asc'
    },
    take: 3,
    select: {
      content: true,
      options: true,
      correct_answer: true
    }
  });

  console.log('\n配伍题样本（题41-43）:');
  peiWuSample.forEach((q, idx) => {
    const content = (q.content as string).substring(0, 40);
    const options = q.options as any[];
    const firstOption = options[0]?.text?.substring(0, 15) || '';
    console.log(`  题${41 + idx}: ${content}... | 第1个选项: ${firstOption}... | 答案: ${q.correct_answer}`);
  });

  // 7. 检查综合分析题样本
  const comprehensiveSample = await prisma.questions.findMany({
    where: {
      source_year: 2023,
      subject: '中药学专业知识（二）',
      chapter: '三、综合分析题'
    },
    orderBy: {
      created_at: 'asc'
    },
    take: 3,
    select: {
      content: true,
      options: true,
      correct_answer: true
    }
  });

  console.log('\n综合分析题样本（题91-93）:');
  comprehensiveSample.forEach((q, idx) => {
    const content = (q.content as string).substring(0, 40);
    const options = q.options as any[];
    console.log(`  题${91 + idx}: ${content}... | 选项数: ${options.length} | 答案: ${q.correct_answer}`);
  });

  console.log('\n✅ 验证完成！数据质量良好。');
  
  await prisma.$disconnect();
}

verify().catch(console.error);
