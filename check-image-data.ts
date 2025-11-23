import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkImageData() {
  console.log('🔍 检查数据库中的图片数据\n');
  
  try {
    // 查询第8题（有图片的单选题）
    const question8 = await prisma.questions.findFirst({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2024,
        ai_explanation: {
          not: null
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    if (question8) {
      console.log('='.repeat(80));
      console.log('📋 示例题目信息：');
      console.log('='.repeat(80));
      console.log('ID:', question8.id);
      console.log('题型:', question8.question_type);
      console.log('章节:', question8.chapter);
      console.log('\n题目内容:');
      console.log(question8.content);
      console.log('\n选项:');
      console.log(JSON.stringify(question8.options, null, 2));
      console.log('\nAI解析字段 (ai_explanation):');
      console.log(question8.ai_explanation);
      
      if (question8.ai_explanation) {
        try {
          const parsed = JSON.parse(question8.ai_explanation);
          console.log('\n解析后的图片数据:');
          console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log('解析失败');
        }
      }
      console.log('='.repeat(80));
    }

    // 统计有图片的题目
    const withImages = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2024,
        ai_explanation: {
          not: null
        }
      }
    });

    console.log(`\n📊 统计: 共 ${withImages} 道题包含图片数据\n`);

  } catch (error: any) {
    console.error('❌ 查询失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkImageData();
