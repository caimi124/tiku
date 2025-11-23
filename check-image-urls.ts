import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查图片URL\n');

  try {
    // 查询有图片的题目
    const questions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2024,
        ai_explanation: {
          not: null,
        },
      },
      orderBy: {
        created_at: 'asc',
      },
      take: 3,
    });

    console.log(`找到 ${questions.length} 道图片题目\n`);

    questions.forEach((q, index) => {
      console.log(`\n题目 ${index + 1}:`);
      console.log(`内容: ${q.content.substring(0, 50)}...`);
      
      if (q.ai_explanation) {
        const imageData = JSON.parse(q.ai_explanation);
        console.log(`图片数量: ${imageData.images?.length || 0}`);
        
        if (imageData.images && imageData.images.length > 0) {
          console.log('图片URL:');
          imageData.images.forEach((url: string, i: number) => {
            console.log(`  ${i + 1}. ${url}`);
          });
        }
      }
      console.log('---');
    });

  } catch (error: any) {
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
