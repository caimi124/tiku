import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
const prisma = new PrismaClient();

async function cleanData() {
  console.log('🧹 开始清理2024年中药学综合真题数据...\n');

  try {
    // 1. 获取所有2024年题目
    const allQuestions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    console.log(`📊 当前总数: ${allQuestions.length} 道题\n`);

    // 2. 识别并删除测试数据（占位文本）
    const testDataKeywords = [
      '请将您的完整题目文本粘贴',
      '保持原始格式即可',
      '保存后告诉我',
      '题目内容',
    ];

    const testDataIds: string[] = [];
    allQuestions.forEach((q) => {
      if (testDataKeywords.some(keyword => q.content.includes(keyword))) {
        testDataIds.push(q.id);
      }
    });

    if (testDataIds.length > 0) {
      const deletedTest = await prisma.questions.deleteMany({
        where: {
          id: { in: testDataIds },
        },
      });
      console.log(`✅ 删除测试数据: ${deletedTest.count} 条\n`);
    }

    // 3. 处理重复题目（保留第一条，删除后续重复）
    const contentMap = new Map<string, string[]>();
    const validQuestions = allQuestions.filter(q => !testDataIds.includes(q.id));

    validQuestions.forEach((q) => {
      const existing = contentMap.get(q.content) || [];
      existing.push(q.id);
      contentMap.set(q.content, existing);
    });

    const duplicateIds: string[] = [];
    contentMap.forEach((ids, content) => {
      if (ids.length > 1) {
        // 保留第一个，删除其他
        duplicateIds.push(...ids.slice(1));
        console.log(`   📝 "${content.substring(0, 40)}..." 重复 ${ids.length} 次，保留1条`);
      }
    });

    if (duplicateIds.length > 0) {
      const deletedDuplicates = await prisma.questions.deleteMany({
        where: {
          id: { in: duplicateIds },
        },
      });
      console.log(`\n✅ 删除重复题目: ${deletedDuplicates.count} 条\n`);
    }

    // 4. 验证最终结果
    const finalCount = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024,
      },
    });

    const byType = await prisma.questions.groupBy({
      by: ['question_type'],
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024,
      },
      _count: true,
    });

    console.log('=' .repeat(60));
    console.log('📊 清理后统计:');
    console.log(`   总计: ${finalCount} 道题`);
    console.log('\n   按题型统计:');
    byType.forEach((item) => {
      const typeName = {
        single: '最佳选择题',
        match: '配伍选择题',
        comprehensive: '综合分析题',
        multiple: '多项选择题',
      }[item.question_type] || item.question_type;
      console.log(`   - ${typeName}: ${item._count} 道`);
    });
    console.log('=' .repeat(60));

    console.log('\n✨ 数据清理完成！\n');

  } catch (error) {
    console.error('❌ 清理失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanData();
