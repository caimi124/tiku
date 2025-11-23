import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
    }
  }
});

async function verify() {
  console.log('✅ 验证选项修复结果\n');
  console.log('='.repeat(80) + '\n');

  const allQuestions = await prisma.questions.findMany({
    where: {
      exam_type: '执业药师',
      subject: '中药学专业知识（一）',
      source_year: 2024
    },
    orderBy: {
      question_number: 'asc'
    }
  });

  // 检查是否还有缺失选项的题目
  const stillMissing = allQuestions.filter(q => {
    const opts = q.options as any[];
    return !opts || opts.length === 0;
  });

  console.log(`📊 总题数: ${allQuestions.length}`);
  console.log(`❌ 仍缺失选项: ${stillMissing.length}道\n`);

  if (stillMissing.length > 0) {
    console.log('⚠️  仍有题目缺失选项：\n');
    stillMissing.forEach(q => {
      console.log(`题${q.question_number}: ${q.content.substring(0, 50)}...`);
    });
  } else {
    console.log('✅ 所有题目都有选项了！\n');
  }

  console.log('='.repeat(80) + '\n');

  // 特别验证第75-76题
  console.log('🔍 验证第75-76题（用户报告的问题）：\n');

  const q75 = allQuestions.find(q => q.question_number === 75);
  const q76 = allQuestions.find(q => q.question_number === 76);

  if (q75) {
    console.log(`题75: ${q75.content.substring(0, 60)}...`);
    console.log(`  章节: ${q75.chapter}`);
    console.log(`  题型: ${q75.question_type}`);
    const opts75 = q75.options as any[];
    console.log(`  选项数量: ${opts75.length} ${opts75.length > 0 ? '✅' : '❌'}`);
    if (opts75.length > 0) {
      console.log(`  选项内容:`);
      opts75.forEach(opt => {
        console.log(`    ${opt.key}. ${opt.value}`);
      });
    }
    console.log('');
  }

  if (q76) {
    console.log(`题76: ${q76.content.substring(0, 60)}...`);
    console.log(`  章节: ${q76.chapter}`);
    console.log(`  题型: ${q76.question_type}`);
    const opts76 = q76.options as any[];
    console.log(`  选项数量: ${opts76.length} ${opts76.length > 0 ? '✅' : '❌'}`);
    if (opts76.length > 0) {
      console.log(`  选项内容:`);
      opts76.forEach(opt => {
        console.log(`    ${opt.key}. ${opt.value}`);
      });
    }
    console.log('');
  }

  console.log('='.repeat(80) + '\n');

  // 检查配伍选择题的选项分布
  console.log('📊 配伍选择题选项统计：\n');
  
  const matchQuestions = allQuestions.filter(q => q.chapter === '二、配伍选择题');
  const matchWithOptions = matchQuestions.filter(q => {
    const opts = q.options as any[];
    return opts && opts.length > 0;
  });

  console.log(`配伍选择题总数: ${matchQuestions.length}`);
  console.log(`有选项的题目: ${matchWithOptions.length}`);
  console.log(`缺失选项: ${matchQuestions.length - matchWithOptions.length}`);

  console.log('\n='.repeat(80) + '\n');

  // 检查综合分析题
  console.log('📊 综合分析题选项统计：\n');
  
  const compQuestions = allQuestions.filter(q => q.chapter === '三、综合分析题');
  const compWithOptions = compQuestions.filter(q => {
    const opts = q.options as any[];
    return opts && opts.length > 0;
  });

  console.log(`综合分析题总数: ${compQuestions.length}`);
  console.log(`有选项的题目: ${compWithOptions.length}`);
  console.log(`缺失选项: ${compQuestions.length - compWithOptions.length}`);

  await prisma.$disconnect();
}

verify();
