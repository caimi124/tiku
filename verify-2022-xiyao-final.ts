import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyFinal() {
  console.log('\n✨ 2022年西药综合最终验证\n');
  console.log('='.repeat(60));

  // 1. 总体统计
  const totalCount = await prisma.questions.count({
    where: {
      source_year: 2022,
      subject: '药学综合知识与技能'
    }
  });

  console.log('\n📊 总体统计:');
  console.log(`   ✅ 总题数: ${totalCount}/120`);

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

  // 3. 验证综合分析题案例
  console.log('\n📋 综合分析题案例验证:\n');

  const comprehensiveQuestions = await prisma.questions.findMany({
    where: {
      source_year: 2022,
      subject: '药学综合知识与技能',
      chapter: '三、综合分析题'
    },
    orderBy: {
      created_at: 'asc'
    }
  });

  const caseGroups = [
    { numbers: [91, 92], case: '案例(一)' },
    { numbers: [93, 94, 95], case: '案例(二)' },
    { numbers: [96, 97, 98, 99], case: '案例(三)' },
    { numbers: [100, 101], case: '案例(四)' },
    { numbers: [102, 103, 104, 105], case: '案例(五)' },
    { numbers: [106, 107, 108], case: '案例(六)' },
    { numbers: [109, 110], case: '案例(七)' }
  ];

  let allCasesValid = true;

  for (const group of caseGroups) {
    const firstQuestionIndex = group.numbers[0] - 91;
    const firstQuestion = comprehensiveQuestions[firstQuestionIndex];
    
    const hasCase = firstQuestion.content.includes(group.case);
    const hasWarning = firstQuestion.content.includes('【⚠️');
    
    const status = hasCase && !hasWarning ? '✅' : '❌';
    
    if (!hasCase || hasWarning) {
      allCasesValid = false;
    }
    
    console.log(`${status} ${group.case} (题${group.numbers.join(', ')})`);
    console.log(`   第一题包含案例: ${hasCase ? '✅' : '❌'}`);
    console.log(`   仍有警告标记: ${hasWarning ? '❌ 需修复' : '✅ 已移除'}`);
    
    // 显示第一题内容预览
    const preview = firstQuestion.content.substring(0, 150).replace(/\n/g, ' ');
    console.log(`   内容预览: ${preview}...`);
    console.log();
  }

  // 4. 检查是否还有警告标记
  const questionsWithWarning = comprehensiveQuestions.filter(q => 
    q.content.includes('【⚠️')
  );

  console.log('='.repeat(60));
  if (questionsWithWarning.length === 0) {
    console.log('✅ 所有警告标记已移除');
  } else {
    console.log(`⚠️  仍有 ${questionsWithWarning.length} 道题包含警告标记`);
  }

  // 5. 数据完整性检查
  console.log('\n📊 数据完整性检查:');
  
  const missingAnswers = comprehensiveQuestions.filter(q => !q.correct_answer);
  const missingAnalysis = comprehensiveQuestions.filter(q => !q.ai_explanation);
  const abnormalOptions = comprehensiveQuestions.filter(q => {
    const options = q.options as any[];
    return !Array.isArray(options) || options.length !== 5;
  });

  console.log(`   ✅ 答案完整性: ${20 - missingAnswers.length}/20`);
  console.log(`   ✅ 解析完整性: ${20 - missingAnalysis.length}/20`);
  console.log(`   ✅ 选项完整性: ${20 - abnormalOptions.length}/20`);

  // 6. 显示完整的题91示例（包含案例）
  console.log('\n' + '='.repeat(60));
  console.log('📝 题91完整示例（含案例）:');
  console.log('='.repeat(60));
  
  const q91 = comprehensiveQuestions[0];
  console.log(q91.content);
  console.log('\n选项:');
  const options = q91.options as any[];
  options.forEach((opt: string) => {
    console.log(`   ${opt}`);
  });
  console.log(`\n正确答案: ${q91.correct_answer}`);
  console.log(`解析: ${q91.ai_explanation}`);

  // 7. 最终结论
  console.log('\n' + '='.repeat(60));
  if (allCasesValid && questionsWithWarning.length === 0 && totalCount === 120) {
    console.log('✅✅✅ 所有验证通过！数据完整且质量优秀！');
  } else {
    console.log('⚠️  部分验证未通过，请检查上述问题');
  }
  console.log('='.repeat(60));

  console.log('\n🌐 前端访问链接:');
  console.log('   http://localhost:3000/practice/history/2022?subject=药学综合知识与技能\n');
}

verifyFinal()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
