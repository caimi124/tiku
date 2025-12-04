import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  try {
    console.log('🔍 验证2024年西药药学综合与技能导入结果...\n');

    // 1. 检查总数
    const totalCount = await prisma.questions.count({
      where: {
        source_year: 2024,
        subject: '药学综合知识与技能'
      }
    });
    console.log(`📊 总题数: ${totalCount} (预期: 120)`);

    // 2. 检查题型分布
    const typeDistribution = await prisma.questions.groupBy({
      by: ['question_type'],
      where: {
        source_year: 2024,
        subject: '药学综合知识与技能'
      },
      _count: true
    });
    
    console.log('\n📈 题型分布:');
    typeDistribution.forEach(item => {
      console.log(`  ${item.question_type}: ${item._count}道`);
    });

    // 3. 检查章节分布
    const chapterDistribution = await prisma.questions.groupBy({
      by: ['chapter'],
      where: {
        source_year: 2024,
        subject: '药学综合知识与技能'
      },
      _count: true
    });
    
    console.log('\n📚 章节分布:');
    chapterDistribution.forEach(item => {
      console.log(`  ${item.chapter}: ${item._count}道`);
    });

    // 4. 抽查前5题
    const firstFive = await prisma.questions.findMany({
      where: {
        source_year: 2024,
        subject: '药学综合知识与技能'
      },
      orderBy: {
        created_at: 'asc'
      },
      take: 5,
      select: {
        content: true,
        options: true,
        correct_answer: true,
        question_type: true,
        chapter: true,
        ai_explanation: true
      }
    });

    console.log('\n🔍 前5题抽查:');
    firstFive.forEach((q, index) => {
      console.log(`\n题${index + 1}:`);
      console.log(`  内容: ${q.content.substring(0, 50)}...`);
      console.log(`  选项数: ${Array.isArray(q.options) ? q.options.length : 0}个`);
      console.log(`  答案: ${q.correct_answer}`);
      console.log(`  题型: ${q.question_type}`);
      console.log(`  章节: ${q.chapter}`);
      console.log(`  解析: ${q.ai_explanation ? '有' : '无'}`);
    });

    // 5. 检查配伍题选项（题41-90）
    const pairingQuestions = await prisma.questions.findMany({
      where: {
        source_year: 2024,
        subject: '药学综合知识与技能',
        chapter: '二、配伍选择题'
      },
      orderBy: {
        created_at: 'asc'
      },
      take: 5,
      select: {
        content: true,
        options: true,
        correct_answer: true
      }
    });

    console.log('\n🔗 配伍题抽查（前5题）:');
    pairingQuestions.forEach((q, index) => {
      const optionsArray = Array.isArray(q.options) ? q.options : [];
      const firstOption = optionsArray.length > 0 ? optionsArray[0] : '无';
      console.log(`\n题${index + 1}:`);
      console.log(`  内容: ${q.content.substring(0, 40)}...`);
      console.log(`  选项数: ${optionsArray.length}个`);
      console.log(`  第一个选项: ${typeof firstOption === 'string' ? firstOption.substring(0, 30) : firstOption}...`);
      console.log(`  答案: ${q.correct_answer}`);
    });

    // 6. 检查多选题（题111-120）
    const multipleQuestions = await prisma.questions.findMany({
      where: {
        source_year: 2024,
        subject: '药学综合知识与技能',
        question_type: 'multiple'
      },
      orderBy: {
        created_at: 'asc'
      },
      select: {
        content: true,
        correct_answer: true,
        options: true
      }
    });

    console.log('\n✅ 多选题检查:');
    console.log(`  数量: ${multipleQuestions.length}道 (预期: 10道)`);
    multipleQuestions.slice(0, 3).forEach((q, index) => {
      console.log(`\n题${index + 1}:`);
      console.log(`  内容: ${q.content.substring(0, 40)}...`);
      console.log(`  答案: ${q.correct_answer}`);
      console.log(`  选项数: ${Array.isArray(q.options) ? q.options.length : 0}个`);
    });

    // 7. 检查空答案
    const emptyAnswers = await prisma.questions.count({
      where: {
        source_year: 2024,
        subject: '药学综合知识与技能',
        correct_answer: ''
      }
    });

    console.log('\n⚠️  空答案检查:');
    console.log(`  空答案数量: ${emptyAnswers}道`);

    // 8. 检查空解析
    const emptyExplanations = await prisma.questions.count({
      where: {
        source_year: 2024,
        subject: '药学综合知识与技能',
        ai_explanation: ''
      }
    });

    console.log(`  空解析数量: ${emptyExplanations}道`);

    console.log('\n✨ 验证完成！');
    
    if (totalCount === 120 && emptyAnswers === 0) {
      console.log('🎉 数据质量良好，可以上线！');
    }

  } catch (error) {
    console.error('❌ 验证失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verify();
