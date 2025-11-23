import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
    }
  }
});

async function checkAllMissingOptions() {
  console.log('🔍 全面检查所有缺失选项的题目\n');
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

  console.log(`总题数: ${allQuestions.length}\n`);

  // 检查所有缺失选项的题目
  const missingOptions: any[] = [];
  
  allQuestions.forEach(q => {
    const options = q.options as any[];
    if (!options || options.length === 0) {
      missingOptions.push(q);
    }
  });

  console.log(`❌ 缺失选项的题目数量: ${missingOptions.length}\n`);

  if (missingOptions.length > 0) {
    console.log('缺失选项的题目列表：\n');
    missingOptions.forEach(q => {
      console.log(`题${q.question_number}: ${q.content.substring(0, 50)}...`);
      console.log(`  章节: ${q.chapter}`);
      console.log(`  题型: ${q.question_type}`);
      console.log(`  答案: ${q.correct_answer || '无'}`);
      console.log('');
    });
  }

  console.log('='.repeat(80) + '\n');

  // 特别检查第75-76题
  console.log('🔍 检查第75-76题：\n');
  
  const q75 = allQuestions.find(q => q.question_number === 75);
  const q76 = allQuestions.find(q => q.question_number === 76);

  if (q75) {
    console.log(`题75: ${q75.content.substring(0, 60)}...`);
    console.log(`  选项数量: ${(q75.options as any[]).length}`);
    console.log(`  答案: ${q75.correct_answer}`);
    console.log('');
  }

  if (q76) {
    console.log(`题76: ${q76.content.substring(0, 60)}...`);
    console.log(`  选项数量: ${(q76.options as any[]).length}`);
    console.log(`  答案: ${q76.correct_answer}`);
    console.log('');
  }

  // 检查周围的题目（73-78）看是否能找到共享选项
  console.log('='.repeat(80) + '\n');
  console.log('🔍 检查73-78题的选项情况：\n');

  for (let num = 73; num <= 78; num++) {
    const q = allQuestions.find(q => q.question_number === num);
    if (q) {
      const opts = q.options as any[];
      console.log(`题${num}: 选项数量=${opts.length}`);
      if (opts.length > 0) {
        console.log(`  选项内容:`);
        opts.forEach(opt => {
          console.log(`    ${opt.key}. ${opt.value}`);
        });
      }
      console.log('');
    }
  }

  await prisma.$disconnect();
}

checkAllMissingOptions();
