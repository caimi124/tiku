import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n📋 列出2024年中药药学专业知识（二）剩余空答案题目\n');

  // 查找所有空答案题目
  const allQuestions = await prisma.questions.findMany({
    where: {
      source_year: 2024,
      subject: '中药学专业知识（二）'
    },
    orderBy: { created_at: 'asc' }
  });

  const emptyAnswerQuestions = allQuestions
    .map((q, index) => ({ ...q, number: index + 1 }))
    .filter(q => !q.correct_answer || q.correct_answer.trim() === '');

  console.log(`⚠️  共有 ${emptyAnswerQuestions.length} 道空答案题目\n`);
  console.log('='.repeat(80) + '\n');

  emptyAnswerQuestions.forEach((q, idx) => {
    const options = q.options as any;
    
    console.log(`题${q.number}: ${q.content}`);
    
    if (options && Array.isArray(options)) {
      options.forEach((opt: any) => {
        console.log(`${opt.key}.${opt.value}`);
      });
    }
    
    console.log(`当前答案: ${q.correct_answer || '(空)'}`);
    console.log(`当前解析: ${q.explanation || '(空)'}`);
    console.log(`正确答案：__________`);
    console.log(`解题思路：__________`);
    console.log('\n' + '-'.repeat(80) + '\n');
  });

  console.log('='.repeat(80));
  console.log(`📊 统计: ${emptyAnswerQuestions.length} 道题需要补充答案`);
  console.log('='.repeat(80) + '\n');

  // 按章节分组统计
  const byChapter: { [key: string]: number[] } = {};
  emptyAnswerQuestions.forEach(q => {
    const chapter = q.chapter || '未分类';
    if (!byChapter[chapter]) {
      byChapter[chapter] = [];
    }
    byChapter[chapter].push(q.number);
  });

  console.log('📚 按章节分布:\n');
  Object.entries(byChapter).forEach(([chapter, numbers]) => {
    console.log(`${chapter}: ${numbers.length}道 (题号: ${numbers.join(', ')})`);
  });

  console.log('\n✅ 列表生成完成！\n');
}

main()
  .catch((e) => {
    console.error('💥 查询失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
