import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查2022年数据库中的图片路径...\n');

  try {
    // 查询所有2022年的图片题
    const imageQuestions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2022,
        ai_explanation: {
          not: null,
        },
      },
      select: {
        id: true,
        content: true,
        ai_explanation: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    console.log(`📊 找到 ${imageQuestions.length} 道图片题\n`);

    for (let i = 0; i < imageQuestions.length; i++) {
      const q = imageQuestions[i];
      console.log(`${i + 1}. ${q.content.substring(0, 30)}...`);
      
      try {
        const imageData = JSON.parse(q.ai_explanation as string);
        console.log(`   图片数量: ${imageData.images.length}`);
        
        // 显示前3个图片路径
        imageData.images.slice(0, 3).forEach((path: string, idx: number) => {
          console.log(`   图片${idx + 1}: ${path}`);
        });
        
        if (imageData.images.length > 3) {
          console.log(`   ... 还有 ${imageData.images.length - 3} 张图片`);
        }
        
      } catch (e) {
        console.log(`   ❌ 解析图片数据失败`);
      }
      console.log('');
    }

    // 检查路径格式是否正确
    console.log('🔍 路径格式检查:');
    const sampleQuestion = imageQuestions[0];
    if (sampleQuestion) {
      try {
        const imageData = JSON.parse(sampleQuestion.ai_explanation as string);
        const firstImagePath = imageData.images[0];
        
        console.log(`   示例路径: ${firstImagePath}`);
        console.log(`   预期格式: /shuju/2022年执业药师中药师药一历年真题图片/37_A.jpg`);
        
        if (firstImagePath.includes('/shuju/2022年执业药师中药师药一历年真题图片/')) {
          console.log(`   ✅ 路径格式正确`);
        } else {
          console.log(`   ❌ 路径格式可能有问题`);
        }
        
      } catch (e) {
        console.log(`   ❌ 无法检查路径格式`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ 数据库图片路径检查完成');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
