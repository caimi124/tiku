import { PrismaClient } from '@prisma/client';

// 使用生产数据库连接
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:CwKXguB7eIA4tfTn@db.tparjdkxxtnentsdazfw.supabase.co:5432/postgres'
    }
  }
});

async function checkProduction() {
  console.log('🔍 检查生产数据库中的图片数据\n');

  try {
    // 检查2023年题目数量
    const count = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
      }
    });
    
    console.log(`📊 生产数据库中2023年题目数量: ${count}\n`);

    // 检查有图片标记的题目
    const imageQuestions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
        content: {
          contains: '图示'
        }
      },
      take: 5,
      orderBy: { created_at: 'asc' }
    });

    console.log(`📷 找到 ${imageQuestions.length} 道图示题\n`);

    if (imageQuestions.length === 0) {
      console.log('❌ 生产数据库中没有图示题！');
      console.log('💡 可能原因：');
      console.log('   1. 数据还没导入到生产数据库');
      console.log('   2. 导入时使用的是本地数据库连接');
      console.log('\n解决方案：需要重新导入数据到生产数据库！');
    } else {
      imageQuestions.forEach((q, idx) => {
        console.log(`\n题目 ${idx + 1}:`);
        console.log('━'.repeat(60));
        console.log('内容:', q.content.substring(0, 50));
        console.log('ai_explanation字段:', q.ai_explanation ? '✅ 存在' : '❌ 为空');
        
        if (q.ai_explanation) {
          try {
            const data = JSON.parse(q.ai_explanation);
            console.log('图片数量:', data.images?.length || 0);
            if (data.images && data.images.length > 0) {
              console.log('第一张图片:', data.images[0]);
            }
          } catch (e) {
            console.log('❌ JSON解析失败');
          }
        }
      });
    }

    // 检查所有题目的ai_explanation情况
    console.log('\n\n📊 统计ai_explanation字段情况:\n');
    const allQuestions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
      }
    });

    const withImages = allQuestions.filter(q => q.ai_explanation).length;
    const withoutImages = allQuestions.length - withImages;

    console.log(`总题目数: ${allQuestions.length}`);
    console.log(`有ai_explanation: ${withImages} 题`);
    console.log(`无ai_explanation: ${withoutImages} 题`);

    if (withImages === 0) {
      console.log('\n❌ 生产数据库中所有题目都没有图片数据！');
      console.log('✅ 确认问题：图片数据只在本地，没有导入到生产数据库');
    }

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProduction();
