import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function check() {
  console.log('🔍 检查第一道图示题的完整数据\n');

  try {
    const imageQuestion = await prisma.questions.findFirst({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
        content: {
          contains: '图示'
        }
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    if (imageQuestion) {
      console.log('图示题数据:');
      console.log('━'.repeat(60));
      console.log('内容:', imageQuestion.content);
      console.log('\noptions字段类型:', typeof imageQuestion.options);
      console.log('options字段值:', JSON.stringify(imageQuestion.options, null, 2));
      
      if (Array.isArray(imageQuestion.options)) {
        console.log('\n✅ options是数组');
        console.log('长度:', imageQuestion.options.length);
        console.log('\n每个选项:');
        (imageQuestion.options as any[]).forEach((opt, idx) => {
          console.log(`  [${idx}] key="${opt.key}" value="${opt.value}"`);
        });
      } else if (typeof imageQuestion.options === 'object' && imageQuestion.options) {
        console.log('\n⚠️  options是对象');
        console.log('键:', Object.keys(imageQuestion.options || {}));
      }
      
      console.log('\nai_explanation:', imageQuestion.ai_explanation);
      
      if (imageQuestion.ai_explanation) {
        const data = JSON.parse(imageQuestion.ai_explanation);
        console.log('\n图片数据:');
        console.log('  数量:', data.images.length);
        data.images.forEach((img: string, idx: number) => {
          console.log(`  [${idx}] ${img}`);
        });
      }
    } else {
      console.log('❌ 未找到图示题');
    }

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
