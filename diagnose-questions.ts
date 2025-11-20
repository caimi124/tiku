import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
const prisma = new PrismaClient();

async function diagnose() {
  console.log('🔍 开始诊断题库数据...\n');

  try {
    // 1. 检查2024年中药学综合真题总数
    const total = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024,
      },
    });
    console.log(`📊 2024年中药学综合真题总数: ${total} 道\n`);

    // 2. 按题型分组统计
    const byType = await prisma.questions.groupBy({
      by: ['question_type'],
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024,
      },
      _count: true,
    });
    
    console.log('📋 按题型统计:');
    byType.forEach((item) => {
      console.log(`   - ${item.question_type}: ${item._count} 道`);
    });
    console.log();

    // 3. 检查是否有重复题目（按内容去重）
    const allQuestions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024,
      },
      select: {
        id: true,
        content: true,
        question_type: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    console.log('📝 前10道题目预览:');
    allQuestions.slice(0, 10).forEach((q, idx) => {
      console.log(`   ${idx + 1}. [${q.question_type}] ${q.content.substring(0, 30)}...`);
    });
    console.log();

    // 4. 检查重复内容
    const contentMap = new Map<string, number>();
    allQuestions.forEach((q) => {
      const count = contentMap.get(q.content) || 0;
      contentMap.set(q.content, count + 1);
    });

    const duplicates = Array.from(contentMap.entries()).filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log('⚠️  发现重复题目:');
      duplicates.forEach(([content, count]) => {
        console.log(`   - "${content.substring(0, 40)}..." 重复 ${count} 次`);
      });
    } else {
      console.log('✅ 未发现重复题目\n');
    }

    // 5. 检查所有历年真题
    console.log('\n📚 所有历年真题统计:');
    const allHistory = await prisma.questions.groupBy({
      by: ['source_year', 'subject'],
      where: {
        source_type: '历年真题',
      },
      _count: true,
    });

    allHistory.forEach((item) => {
      console.log(`   ${item.source_year}年 ${item.subject}: ${item._count} 道`);
    });

  } catch (error) {
    console.error('❌ 诊断失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
