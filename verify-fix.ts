import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function verifyFix() {
  console.log('✅ 验证图片修复结果\n');
  
  const testQuestions = [
    '图示中药为茜草的是',
    '图示中药为威灵仙的是',
    '图示中药为肉桂的是',
    '图示中药为秦皮的是',
    '结构类型为香豆素类化合物的是'
  ];

  for (const questionText of testQuestions) {
    const question = await prisma.questions.findFirst({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2024,
        content: {
          contains: questionText
        }
      }
    });

    if (question) {
      console.log(`题目: ${questionText}`);
      console.log(`  ID: ${question.id}`);
      console.log(`  章节: ${question.chapter}`);
      console.log(`  有图片数据: ${question.ai_explanation ? '✅ 是' : '❌ 否'}`);
      
      if (question.ai_explanation) {
        try {
          const data = JSON.parse(question.ai_explanation);
          console.log(`  图片数量: ${data.images?.length || 0}`);
          console.log(`  第一张图片: ${data.images?.[0]}`);
        } catch (e) {
          console.log(`  ❌ 解析失败`);
        }
      }
      console.log('');
    } else {
      console.log(`❌ 未找到题目: ${questionText}\n`);
    }
  }

  await prisma.$disconnect();
}

verifyFix().catch(console.error);
