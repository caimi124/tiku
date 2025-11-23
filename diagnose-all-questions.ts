import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function diagnoseAll() {
  console.log('🔍 全面诊断数据库和前端配置\n');
  console.log('═'.repeat(60));

  try {
    // 1. 检查数据库连接
    console.log('\n📡 步骤1：测试数据库连接...');
    await prisma.$connect();
    console.log('✅ 数据库连接成功\n');

    // 2. 检查所有题目总数
    const totalQuestions = await prisma.questions.count();
    console.log(`📊 数据库中总题目数: ${totalQuestions}\n`);

    // 3. 检查历年真题总数
    const historyQuestionsCount = await prisma.questions.count({
      where: {
        source_type: '历年真题'
      }
    });
    console.log(`📚 历年真题总数: ${historyQuestionsCount}\n`);

    // 4. 按考试类型分组
    console.log('📋 按考试类型分组:');
    const byExamType = await prisma.questions.groupBy({
      by: ['exam_type'],
      where: {
        source_type: '历年真题'
      },
      _count: {
        id: true
      }
    });
    byExamType.forEach(item => {
      console.log(`   ${item.exam_type || '未知'}: ${item._count.id}道`);
    });
    console.log('');

    // 5. 按科目分组统计
    console.log('📖 按科目分组统计:');
    const bySubject = await prisma.questions.groupBy({
      by: ['subject'],
      where: {
        source_type: '历年真题',
        exam_type: '执业药师'
      },
      _count: {
        id: true
      }
    });
    bySubject.forEach(item => {
      console.log(`   ${item.subject || '未知'}: ${item._count.id}道`);
    });
    console.log('');

    // 6. 按年份和科目详细统计
    console.log('📅 按年份和科目详细统计:');
    const byYearAndSubject = await prisma.questions.groupBy({
      by: ['source_year', 'subject'],
      where: {
        source_type: '历年真题',
        exam_type: '执业药师'
      },
      _count: {
        id: true
      },
      orderBy: [
        { source_year: 'desc' },
        { subject: 'asc' }
      ]
    });

    const yearGroups: Record<number, any[]> = {};
    byYearAndSubject.forEach(item => {
      const year = item.source_year || 0;
      if (!yearGroups[year]) {
        yearGroups[year] = [];
      }
      yearGroups[year].push(item);
    });

    Object.keys(yearGroups).sort((a, b) => Number(b) - Number(a)).forEach(year => {
      console.log(`\n   ${year}年:`);
      yearGroups[Number(year)].forEach((item: any) => {
        console.log(`      ${item.subject}: ${item._count.id}道`);
      });
    });
    console.log('');

    // 7. 检查is_published状态
    console.log('🔓 检查发布状态:');
    const publishedCount = await prisma.questions.count({
      where: {
        source_type: '历年真题',
        is_published: true
      }
    });
    const unpublishedCount = await prisma.questions.count({
      where: {
        source_type: '历年真题',
        is_published: false
      }
    });
    console.log(`   已发布: ${publishedCount}道`);
    console.log(`   未发布: ${unpublishedCount}道`);
    console.log('');

    // 8. 检查所有唯一科目名称
    console.log('📚 数据库中所有唯一科目名称:');
    const allSubjects = await prisma.questions.findMany({
      where: {
        source_type: '历年真题'
      },
      select: {
        subject: true
      },
      distinct: ['subject']
    });
    allSubjects.forEach(item => {
      console.log(`   - "${item.subject}"`);
    });
    console.log('');

    // 9. 抽查几条数据
    console.log('🔍 抽查前5条2024年数据:');
    const sampleQuestions = await prisma.questions.findMany({
      where: {
        source_type: '历年真题',
        source_year: 2024
      },
      select: {
        id: true,
        exam_type: true,
        subject: true,
        source_year: true,
        is_published: true,
        content: true
      },
      take: 5
    });
    sampleQuestions.forEach(q => {
      console.log(`   ID: ${q.id}`);
      console.log(`   科目: ${q.subject}`);
      console.log(`   年份: ${q.source_year}`);
      console.log(`   已发布: ${q.is_published}`);
      console.log(`   题目: ${q.content.substring(0, 30)}...`);
      console.log('   ---');
    });
    console.log('');

    // 10. 模拟前端API调用
    console.log('🌐 模拟前端API调用测试:');
    const subjects = [
      "中药学综合知识与技能",
      "中药学专业知识（一）",
      "药学专业知识（一）"
    ];
    const years = [2024, 2023, 2022];

    for (const year of years) {
      console.log(`\n   ${year}年:`);
      for (const subject of subjects) {
        const count = await prisma.questions.count({
          where: {
            source_type: '历年真题',
            source_year: year,
            subject: subject,
            is_published: true
          }
        });
        if (count > 0) {
          console.log(`      ${subject}: ${count}道 ✅`);
        }
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ 诊断完成！\n');

  } catch (error: any) {
    console.error('\n❌ 诊断失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseAll();
