import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📋 2023年法规缺少解析的题目清单\n');
  console.log('=' .repeat(80));

  const questions = await prisma.questions.findMany({
    where: {
      source_year: 2023,
      subject: '药事管理与法规',
      OR: [
        { ai_explanation: null },
        { ai_explanation: '' }
      ]
    },
    orderBy: { created_at: 'asc' },
    select: {
      content: true,
      options: true,
      correct_answer: true,
      chapter: true
    }
  });

  console.log(`\n找到 ${questions.length} 道题缺少解析\n`);
  console.log('=' .repeat(80));

  questions.forEach((q, index) => {
    // 通过创建顺序推算题号（假设按顺序导入）
    const questionNum = index + 1;
    
    console.log(`\n题${questionNum}: ${q.content.substring(0, 60)}...`);
    console.log(`章节: ${q.chapter || '未知'}`);
    console.log(`答案: ${q.correct_answer}`);
    
    if (Array.isArray(q.options) && q.options.length > 0) {
      console.log('选项:');
      q.options.slice(0, 4).forEach((opt: any) => {
        const optStr = typeof opt === 'string' ? opt : String(opt);
        console.log(`  ${optStr.substring(0, 60)}${optStr.length > 60 ? '...' : ''}`);
      });
    }
    console.log('-'.repeat(80));
  });

  console.log(`\n\n📊 统计:`);
  console.log(`总题数: 120`);
  console.log(`有解析: ${120 - questions.length}`);
  console.log(`缺少解析: ${questions.length}`);
  console.log(`覆盖率: ${((120 - questions.length) / 120 * 100).toFixed(1)}%`);
  
  console.log('\n\n💡 题101-110的具体缺失情况:');
  
  const q101to110 = await prisma.questions.findMany({
    where: {
      source_year: 2023,
      subject: '药事管理与法规'
    },
    orderBy: { created_at: 'asc' },
    skip: 100,
    take: 10,
    select: {
      content: true,
      ai_explanation: true,
      correct_answer: true
    }
  });

  q101to110.forEach((q, index) => {
    const questionNum = 101 + index;
    const hasExplanation = q.ai_explanation && q.ai_explanation.trim() !== '';
    const status = hasExplanation ? '✅ 有' : '❌ 缺';
    console.log(`  题${questionNum}: ${status}解析 (答案: ${q.correct_answer})`);
  });
}

main()
  .catch((error) => {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
