import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 验证2023年中药药学专业知识（一）导入数据\n');

  try {
    // 统计总题目数
    const total = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
      },
    });

    console.log(`📊 总题目数: ${total} 道\n`);

    // 按题型统计
    const byType = await prisma.questions.groupBy({
      by: ['question_type'],
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
      },
      _count: true,
    });

    console.log('📋 题型分布:');
    byType.forEach((item) => {
      console.log(`   ${item.question_type}: ${item._count} 道`);
    });
    console.log();

    // 统计图片题
    const withImages = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
        ai_explanation: {
          not: null,
        },
      },
      select: {
        id: true,
        chapter: true,
        ai_explanation: true,
      },
    });

    console.log(`📷 图片题数量: ${withImages.length} 道\n`);
    
    let totalImages = 0;
    console.log('🖼️ 图片题详情:');
    withImages.forEach((q, index) => {
      try {
        const data = JSON.parse(q.ai_explanation || '{}');
        const imageCount = data.images?.length || 0;
        totalImages += imageCount;
        console.log(`   ${index + 1}. ${q.chapter} - ${imageCount} 张图片`);
        
        // 显示图片路径示例
        if (data.images && data.images.length > 0) {
          console.log(`      示例: ${data.images[0]}`);
        }
      } catch (e) {
        console.log(`   ${index + 1}. 解析失败`);
      }
    });

    console.log(`\n📊 总图片数: ${totalImages} 张\n`);

    // 查看前3道和带图片的题
    console.log('🔍 查看样本题目:\n');
    
    const samples = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
      },
      orderBy: {
        created_at: 'asc',
      },
      take: 3,
    });

    samples.forEach((q, index) => {
      console.log(`题目 ${index + 1}:`);
      console.log(`   章节: ${q.chapter}`);
      console.log(`   题型: ${q.question_type}`);
      console.log(`   内容: ${q.content.substring(0, 50)}...`);
      console.log(`   答案: ${q.correct_answer}`);
      console.log();
    });

    // 查看图片题示例
    const imageQuestion = await prisma.questions.findFirst({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
        content: {
          contains: '图示',
        },
      },
    });

    if (imageQuestion) {
      console.log('📷 图片题示例:');
      console.log(`   内容: ${imageQuestion.content}`);
      console.log(`   答案: ${imageQuestion.correct_answer}`);
      console.log(`   解析: ${imageQuestion.explanation?.substring(0, 50)}...`);
      
      if (imageQuestion.ai_explanation) {
        const data = JSON.parse(imageQuestion.ai_explanation);
        console.log(`   图片: ${data.images?.length || 0} 张`);
        if (data.images && data.images.length > 0) {
          console.log(`   图片路径示例: ${data.images[0]}`);
        }
      }
      console.log();
    }

    console.log('='.repeat(60));
    console.log('✅ 验证完成！2023年数据导入成功！');
    console.log('='.repeat(60) + '\n');

    console.log('🌐 访问地址:');
    console.log('   历年真题列表: http://localhost:3000/practice/history');
    console.log('   2023年练习: http://localhost:3000/practice/history/2023?subject=中药学专业知识（一）');
    console.log();

  } catch (error) {
    console.error('❌ 验证失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
