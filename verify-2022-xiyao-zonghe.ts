import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('\n📊 验证2022年西药药学综合与技能数据质量\n');
  console.log('='.repeat(60));

  // 1. 统计总数
  const totalCount = await prisma.questions.count({
    where: {
      source_year: 2022,
      subject: '药学综合知识与技能'
    }
  });
  console.log(`✅ 总题数: ${totalCount}/120`);

  // 2. 按章节统计
  const chapters = [
    '一、最佳选择题',
    '二、配伍选择题', 
    '三、综合分析题',
    '四、多项选择题'
  ];

  for (const chapter of chapters) {
    const count = await prisma.questions.count({
      where: {
        source_year: 2022,
        subject: '药学综合知识与技能',
        chapter
      }
    });
    console.log(`   ${chapter}: ${count}道`);
  }

  // 3. 检查选项数量
  const allQuestions = await prisma.questions.findMany({
    where: {
      source_year: 2022,
      subject: '药学综合知识与技能'
    },
    orderBy: {
      created_at: 'asc'
    }
  });

  const abnormalOptions: any[] = [];
  for (const q of allQuestions) {
    const options = q.options as any[];
    if (!Array.isArray(options) || options.length !== 5) {
      abnormalOptions.push({
        题号: allQuestions.indexOf(q) + 1,
        选项数量: options?.length || 0,
        章节: q.chapter
      });
    }
  }

  console.log(`\n✅ 选项检查: ${totalCount - abnormalOptions.length}/${totalCount}道题有5个选项`);
  if (abnormalOptions.length > 0) {
    console.log(`⚠️  选项数量异常的题目:`);
    console.table(abnormalOptions);
  }

  // 4. 检查答案
  const emptyAnswers = allQuestions.filter(q => !q.correct_answer);
  console.log(`\n✅ 答案检查: ${totalCount - emptyAnswers.length}/${totalCount}道题有答案`);
  if (emptyAnswers.length > 0) {
    console.log(`⚠️  缺少答案的题目: ${emptyAnswers.map((q, i) => allQuestions.indexOf(q) + 1).join(', ')}`);
  }

  // 5. 检查解析
  const emptyAnalysis = allQuestions.filter(q => !q.ai_explanation);
  console.log(`\n✅ 解析检查: ${totalCount - emptyAnalysis.length}/${totalCount}道题有解析`);
  if (emptyAnalysis.length > 0) {
    console.log(`⚠️  缺少解析的题目: ${emptyAnalysis.map((q, i) => allQuestions.indexOf(q) + 1).join(', ')}`);
  }

  // 6. 多选题检查
  const multipleQuestions = allQuestions.filter((q, i) => i >= 110);
  console.log(`\n✅ 多选题检查: ${multipleQuestions.length}/10道`);
  const wrongType = multipleQuestions.filter(q => q.question_type !== 'multiple');
  if (wrongType.length > 0) {
    console.log(`⚠️  题型错误的多选题: ${wrongType.map((q, i) => allQuestions.indexOf(q) + 1).join(', ')}`);
  }

  // 7. 检查案例缺失警告
  const caseWarnings = allQuestions.filter(q => 
    q.content.includes('【⚠️ 案例背景可能缺失】')
  );
  console.log(`\n⚠️  案例缺失警告: ${caseWarnings.length}/20道综合分析题`);
  if (caseWarnings.length > 0) {
    console.log(`   题号: ${caseWarnings.map((q, i) => allQuestions.indexOf(q) + 1).join(', ')}`);
    console.log(`   建议: 这些题目可能需要补充患者案例背景`);
  }

  // 8. 抽查关键题目
  console.log('\n📝 抽查关键题目:');
  
  // 题1（最佳选择题）
  const q1 = allQuestions[0];
  console.log(`\n题1 [${q1.chapter}]:`);
  console.log(`   内容: ${q1.content.substring(0, 50)}...`);
  console.log(`   选项数: ${(q1.options as any[]).length}`);
  console.log(`   答案: ${q1.correct_answer}`);

  // 题45（配伍选择题）
  const q45 = allQuestions[44];
  console.log(`\n题45 [${q45.chapter}]:`);
  console.log(`   内容: ${q45.content.substring(0, 50)}...`);
  console.log(`   选项数: ${(q45.options as any[]).length}`);
  console.log(`   答案: ${q45.correct_answer}`);

  // 题91（综合分析题）
  const q91 = allQuestions[90];
  console.log(`\n题91 [${q91.chapter}]:`);
  console.log(`   内容: ${q91.content.substring(0, 100)}...`);
  console.log(`   选项数: ${(q91.options as any[]).length}`);
  console.log(`   答案: ${q91.correct_answer}`);
  console.log(`   案例警告: ${q91.content.includes('【⚠️') ? '是' : '否'}`);

  // 题111（多选题）
  const q111 = allQuestions[110];
  console.log(`\n题111 [${q111.chapter}]:`);
  console.log(`   内容: ${q111.content.substring(0, 50)}...`);
  console.log(`   选项数: ${(q111.options as any[]).length}`);
  console.log(`   答案: ${q111.correct_answer}`);
  console.log(`   题型: ${q111.question_type}`);

  console.log('\n' + '='.repeat(60));
  console.log('✨ 验证完成！\n');
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
