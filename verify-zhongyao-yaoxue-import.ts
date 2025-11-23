import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 验证2024年中药药学专业知识（一）导入数据\n');

  try {
    // 查询所有题目
    const questions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2024,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    console.log(`📊 总题目数: ${questions.length}\n`);

    // 统计题型
    const typeStats = questions.reduce((acc, q) => {
      const type = q.question_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📋 题型统计:');
    Object.entries(typeStats).forEach(([type, count]) => {
      const typeMap: Record<string, string> = {
        'single': '最佳选择题',
        'match': '配伍选择题',
        'comprehensive': '综合分析题',
        'multiple': '多项选择题',
      };
      console.log(`   ${typeMap[type] || type}: ${count} 道`);
    });
    console.log();

    // 统计章节
    const chapterStats = questions.reduce((acc, q) => {
      const chapter = q.chapter || 'unknown';
      acc[chapter] = (acc[chapter] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📚 章节统计:');
    Object.entries(chapterStats).forEach(([chapter, count]) => {
      console.log(`   ${chapter}: ${count} 道`);
    });
    console.log();

    // 检查有图片的题目
    const questionsWithImages = questions.filter(q => q.ai_explanation);
    console.log(`📷 包含图片的题目: ${questionsWithImages.length} 道\n`);

    if (questionsWithImages.length > 0) {
      console.log('📸 图片题目详情:');
      questionsWithImages.forEach(q => {
        const imageData = JSON.parse(q.ai_explanation || '{}');
        const imageCount = imageData.images?.length || 0;
        const preview = q.content.substring(0, 40);
        console.log(`   题目: ${preview}... (${imageCount}张图片)`);
      });
    } else {
      console.log('⚠️  警告: 没有找到包含图片的题目！');
    }
    console.log();

    // 检查特定图片题
    console.log('🔎 检查特定图片题:');
    const imageQuestionNumbers = [8, 9, 10, 11, 61, 62, 63, 64, 90, 91, 92];
    for (const num of imageQuestionNumbers) {
      const q = questions.find(q => q.content.includes(`number": ${num}`) || 
                                    q.content.substring(0, 50).includes('图示'));
      if (q) {
        const hasImage = q.ai_explanation ? '✅有图' : '❌无图';
        const preview = q.content.substring(0, 30);
        console.log(`   题${num}: ${hasImage} - ${preview}...`);
      }
    }
    console.log();

    console.log('✅ 验证完成！\n');

  } catch (error: any) {
    console.error('❌ 验证失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
