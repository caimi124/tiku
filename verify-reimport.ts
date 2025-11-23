import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
    }
  }
});

async function verify() {
  console.log('🔍 验证重新导入的数据\n');
  console.log('='.repeat(80) + '\n');

  const questions = await prisma.questions.findMany({
    where: {
      exam_type: '执业药师',
      subject: '中药学专业知识（一）',
      source_year: 2024
    },
    orderBy: {
      question_number: 'asc'
    }
  });

  console.log(`✅ 总题数: ${questions.length}\n`);

  // 问题1：检查题目顺序
  console.log('📊 问题1：题目顺序和题型');
  console.log('前20题：\n');
  questions.slice(0, 20).forEach((q, idx) => {
    console.log(`${q.question_number}. [${q.question_type.padEnd(13)}] ${q.chapter?.padEnd(20)} ${q.content.substring(0, 30)}...`);
  });

  console.log('\n' + '='.repeat(80) + '\n');

  // 问题2：检查第64题选项
  console.log('📊 问题2：第64题选项（之前有重复问题）\n');
  const q64 = questions.find(q => q.question_number === 64);
  if (q64) {
    console.log(`题${q64.question_number}: ${q64.content.substring(0, 50)}...`);
    console.log(`章节: ${q64.chapter}`);
    console.log(`题型: ${q64.question_type}`);
    console.log(`选项数量: ${(q64.options as any[]).length}`);
    console.log(`选项内容:`);
    (q64.options as any[]).forEach(opt => {
      console.log(`  ${opt.key}. ${opt.value || '(图片选项)'}`);
    });
    console.log(`是否有图片: ${q64.ai_explanation ? '是' : '否'}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // 问题3：检查第61题选项（之前缺失）
  console.log('📊 问题3：第61题选项（之前缺失）\n');
  const q61 = questions.find(q => q.question_number === 61);
  if (q61) {
    console.log(`题${q61.question_number}: ${q61.content.substring(0, 50)}...`);
    console.log(`章节: ${q61.chapter}`);
    console.log(`题型: ${q61.question_type}`);
    console.log(`选项数量: ${(q61.options as any[]).length}`);
    console.log(`选项内容:`);
    (q61.options as any[]).forEach(opt => {
      console.log(`  ${opt.key}. ${opt.value || '(图片选项)'}`);
    });
    console.log(`正确答案: ${q61.correct_answer}`);
    console.log(`是否有图片: ${q61.ai_explanation ? '是' : '否'}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // 检查第62题
  console.log('📊 第62题（用户报告的问题）\n');
  const q62 = questions.find(q => q.question_number === 62);
  if (q62) {
    console.log(`题${q62.question_number}: ${q62.content.substring(0, 50)}...`);
    console.log(`章节: ${q62.chapter}`);
    console.log(`题型: ${q62.question_type}`);
    console.log(`选项数量: ${(q62.options as any[]).length}`);
    console.log(`是否有图片: ${q62.ai_explanation ? '是 ✅' : '否 ❌'}`);
    if (q62.ai_explanation) {
      const data = JSON.parse(q62.ai_explanation);
      console.log(`图片数量: ${data.images?.length}`);
    }
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // 检查题型分布
  const typeCount: Record<string, number> = {};
  const chapterCount: Record<string, number> = {};
  
  questions.forEach(q => {
    typeCount[q.question_type] = (typeCount[q.question_type] || 0) + 1;
    chapterCount[q.chapter || '未知'] = (chapterCount[q.chapter || '未知'] || 0) + 1;
  });

  console.log('📊 题型分布：');
  Object.entries(typeCount).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}题`);
  });

  console.log('\n📊 章节分布：');
  Object.entries(chapterCount).forEach(([chapter, count]) => {
    console.log(`  ${chapter}: ${count}题`);
  });

  await prisma.$disconnect();
}

verify();
