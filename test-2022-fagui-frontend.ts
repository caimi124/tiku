import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 测试2022年法规真题的前端显示
 * 检查章节分组是否正确
 */

async function main() {
  console.log('🧪 测试2022年法规真题前端显示\n');

  // 1. 获取所有题目
  const questions = await prisma.questions.findMany({
    where: {
      source_year: 2022,
      subject: '药事管理与法规'
    },
    orderBy: { created_at: 'asc' },
    select: {
      content: true,
      chapter: true,
      question_type: true,
      options: true,
      correct_answer: true
    }
  });

  console.log(`📊 获取到 ${questions.length} 道题目\n`);

  // 2. 按章节分组
  const grouped: Record<string, any[]> = {};
  
  questions.forEach(q => {
    const chapter = q.chapter || '未分类';
    if (!grouped[chapter]) {
      grouped[chapter] = [];
    }
    grouped[chapter].push(q);
  });

  // 3. 显示章节统计
  console.log('📚 章节分组统计:');
  console.log('='.repeat(60));
  
  const possibleChapters = [
    '一、最佳选择题',
    '二、配伍选择题',
    '三、综合分析题',
    '三、多项选择题', // 法规真题的第三章
    '四、多项选择题',
  ];

  let totalCount = 0;
  let startIndex = 0;

  possibleChapters.forEach(chapterTitle => {
    if (grouped[chapterTitle] && grouped[chapterTitle].length > 0) {
      const count = grouped[chapterTitle].length;
      const endIndex = startIndex + count - 1;
      
      console.log(`\n${chapterTitle}:`);
      console.log(`   题数: ${count} 道`);
      console.log(`   范围: 第 ${startIndex + 1}-${endIndex + 1} 题`);
      console.log(`   题型: ${grouped[chapterTitle][0].question_type}`);
      
      // 检查选项数量
      const optionCounts = grouped[chapterTitle].map(q => (q.options as string[]).length);
      const uniqueCounts = [...new Set(optionCounts)];
      console.log(`   选项数: ${uniqueCounts.join(', ')}个`);
      
      // 抽查第一题
      const firstQ = grouped[chapterTitle][0];
      console.log(`   第一题: ${firstQ.content.substring(0, 30)}...`);
      console.log(`   第一题答案: ${firstQ.correct_answer}`);
      
      totalCount += count;
      startIndex += count;
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`总计: ${totalCount} 道题 ${totalCount === 120 ? '✅' : '⚠️'}`);

  // 4. 检查是否有未分类的题目
  const uncategorized = Object.keys(grouped).filter(
    chapter => !possibleChapters.includes(chapter)
  );

  if (uncategorized.length > 0) {
    console.log('\n⚠️  发现未分类的章节:');
    uncategorized.forEach(chapter => {
      console.log(`   ${chapter}: ${grouped[chapter].length} 道题`);
    });
  } else {
    console.log('\n✅ 所有题目都已正确分类');
  }

  // 5. 验证题型标签映射
  console.log('\n📝 题型标签验证:');
  const typeMap: Record<string, string> = {
    single: '最佳选择题',
    match: '配伍选择题',
    comprehensive: '综合分析题',
    multiple: '多项选择题',
  };

  const uniqueTypes = [...new Set(questions.map(q => q.question_type))];
  uniqueTypes.forEach(type => {
    const displayName = typeMap[type] || type;
    const count = questions.filter(q => q.question_type === type).length;
    console.log(`   ${type} → ${displayName} (${count}道)`);
  });

  // 6. 前端API查询模拟
  console.log('\n🌐 模拟前端API查询:');
  console.log(`   请求: GET /api/questions?sourceYear=2022&subject=药事管理与法规&limit=200`);
  console.log(`   预期返回: ${questions.length} 道题`);
  console.log(`   章节分组: ${Object.keys(grouped).filter(k => possibleChapters.includes(k)).length} 个`);

  // 7. 前端访问路径
  console.log('\n🔗 前端访问路径:');
  console.log('   历年真题列表: http://localhost:3001/practice/history');
  console.log('   逐题练习: http://localhost:3001/practice/history/2022?subject=药事管理与法规');
  console.log('   模拟考试: http://localhost:3001/practice/history/2022/mock?subject=药事管理与法规');

  console.log('\n✅ 测试完成！');
}

main()
  .catch((error) => {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
