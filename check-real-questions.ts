import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查2024年中药学综合知识与技能真题数据\n');

  try {
    // 1. 统计总数
    const total = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024,
      },
    });
    console.log(`📊 总题目数: ${total} 道\n`);

    // 2. 按题型分组统计
    const byType = await prisma.questions.groupBy({
      by: ['question_type'],
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024,
      },
      _count: true,
      orderBy: {
        question_type: 'asc',
      },
    });

    console.log('📋 按题型分类统计:');
    const typeNames: Record<string, string> = {
      single: '最佳选择题',
      match: '配伍选择题',
      comprehensive: '综合分析题',
      multiple: '多项选择题',
    };
    
    byType.forEach((item) => {
      const typeName = typeNames[item.question_type] || item.question_type;
      console.log(`   ${typeName} (${item.question_type}): ${item._count} 道`);
    });
    console.log('');

    // 3. 检查是否有重复题目
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
        created_at: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    // 检测重复内容
    const contentMap = new Map<string, any[]>();
    allQuestions.forEach((q) => {
      const content = q.content.trim();
      if (!contentMap.has(content)) {
        contentMap.set(content, []);
      }
      contentMap.get(content)!.push(q);
    });

    const duplicates = Array.from(contentMap.entries()).filter(([_, items]) => items.length > 1);
    
    if (duplicates.length > 0) {
      console.log(`⚠️  发现 ${duplicates.length} 组重复题目:`);
      duplicates.forEach(([content, items]) => {
        console.log(`\n   题目: ${content.substring(0, 50)}...`);
        console.log(`   重复次数: ${items.length}`);
        items.forEach((item) => {
          console.log(`   - ID: ${item.id}, 类型: ${item.question_type}, 创建时间: ${item.created_at}`);
        });
      });
      console.log('');
    } else {
      console.log('✅ 没有发现重复题目\n');
    }

    // 4. 按创建时间顺序显示前10题和后10题
    console.log('📝 前10道题:');
    allQuestions.slice(0, 10).forEach((q, idx) => {
      const typeName = typeNames[q.question_type] || q.question_type;
      console.log(`   ${idx + 1}. [${typeName}] ${q.content.substring(0, 40)}...`);
    });
    
    console.log('\n📝 后10道题:');
    allQuestions.slice(-10).forEach((q, idx) => {
      const typeName = typeNames[q.question_type] || q.question_type;
      console.log(`   ${total - 9 + idx}. [${typeName}] ${q.content.substring(0, 40)}...`);
    });

    // 5. 检查是否有测试数据
    const testData = allQuestions.filter((q) => 
      q.content.includes('请将您的完整题目') ||
      q.content.includes('保持原始格式') ||
      q.content.includes('题目内容')
    );

    if (testData.length > 0) {
      console.log(`\n⚠️  发现 ${testData.length} 条测试占位数据:`);
      testData.forEach((q) => {
        console.log(`   - ID: ${q.id}, 内容: ${q.content.substring(0, 60)}...`);
      });
    } else {
      console.log('\n✅ 没有发现测试占位数据');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ 检查完成！\n');

  } catch (error) {
    console.error('❌ 检查失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
