import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkAllData() {
  console.log('🔍 检查数据库中所有历年真题数据\n');

  try {
    // 1. 检查所有历年真题
    const allHistoryQuestions = await prisma.questions.findMany({
      where: {
        source_type: '历年真题'
      },
      select: {
        id: true,
        exam_type: true,
        subject: true,
        source_year: true,
        chapter: true,
      }
    });

    console.log(`📊 历年真题总数: ${allHistoryQuestions.length}\n`);

    // 2. 按年份和科目分组统计
    const stats: Record<string, Record<string, number>> = {};
    
    allHistoryQuestions.forEach(q => {
      const year = q.source_year?.toString() || '未知';
      const subject = q.subject || '未知';
      
      if (!stats[year]) {
        stats[year] = {};
      }
      if (!stats[year][subject]) {
        stats[year][subject] = 0;
      }
      stats[year][subject]++;
    });

    console.log('📋 按年份和科目分组统计:\n');
    Object.keys(stats).sort().forEach(year => {
      console.log(`📅 ${year}年:`);
      Object.keys(stats[year]).forEach(subject => {
        console.log(`   ${subject}: ${stats[year][subject]}道`);
      });
      console.log('');
    });

    // 3. 检查具体的2024年数据
    const data2024 = await prisma.questions.groupBy({
      by: ['subject', 'source_year'],
      where: {
        source_type: '历年真题',
        source_year: 2024
      },
      _count: {
        id: true
      }
    });

    console.log('📊 2024年详细数据:');
    data2024.forEach(item => {
      console.log(`   ${item.subject}: ${item._count.id}道`);
    });
    console.log('');

    // 4. 检查药学综合知识与技能的数据
    const zhongyaoZonghe = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_type: '历年真题'
      }
    });

    console.log(`📌 中药学综合知识与技能总数: ${zhongyaoZonghe}道\n`);

    // 5. 按年份统计中药学综合知识与技能
    const zhongyaoZongheByYear = await prisma.questions.groupBy({
      by: ['source_year'],
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_type: '历年真题'
      },
      _count: {
        id: true
      }
    });

    console.log('📅 中药学综合知识与技能按年份统计:');
    zhongyaoZongheByYear.forEach(item => {
      console.log(`   ${item.source_year}年: ${item._count.id}道`);
    });
    console.log('');

    // 6. 检查所有唯一的科目名称
    const allSubjects = await prisma.questions.findMany({
      where: {
        source_type: '历年真题'
      },
      select: {
        subject: true
      },
      distinct: ['subject']
    });

    console.log('📚 所有历年真题科目列表:');
    allSubjects.forEach(item => {
      console.log(`   - ${item.subject}`);
    });

  } catch (error: any) {
    console.error('❌ 检查失败:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData();
