import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function diagnose() {
  console.log('🔍 诊断图片显示问题\n');

  try {
    // 查询2023年题目中有图片的题目
    const questions = await prisma.questions.findMany({
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

    console.log(`找到 ${questions.length} 道图示题\n`);

    questions.forEach((q, idx) => {
      console.log(`\n题目 ${idx + 1}:`);
      console.log('━'.repeat(60));
      console.log('内容:', q.content.substring(0, 50));
      console.log('ai_explanation字段:', q.ai_explanation);
      
      if (q.ai_explanation) {
        try {
          const data = JSON.parse(q.ai_explanation);
          console.log('✅ JSON解析成功');
          console.log('图片数组:', data.images);
          console.log('图片数量:', data.images?.length || 0);
          
          if (data.images && data.images.length > 0) {
            console.log('\n图片路径详情:');
            data.images.forEach((img: string, i: number) => {
              console.log(`  [${i}] ${img}`);
            });
          } else {
            console.log('⚠️ images数组为空');
          }
        } catch (e) {
          console.log('❌ JSON解析失败:', e);
        }
      } else {
        console.log('❌ ai_explanation字段为空');
      }
      
      console.log('选项数量:', Array.isArray(q.options) ? q.options.length : Object.keys(q.options || {}).length);
    });

    // 测试API返回的数据
    console.log('\n\n🌐 测试API返回的数据格式\n');
    console.log('━'.repeat(60));
    
    const testQuestion = questions[0];
    if (testQuestion) {
      // 模拟API的formatQuestion函数
      const formatted = {
        ...testQuestion,
        correctAnswer: testQuestion.correct_answer,
        questionType: testQuestion.question_type,
        aiExplanation: testQuestion.ai_explanation,
      };
      
      console.log('API返回的aiExplanation:', formatted.aiExplanation);
      
      if (formatted.aiExplanation) {
        try {
          const data = JSON.parse(formatted.aiExplanation);
          console.log('✅ 前端可以解析');
          console.log('前端会获取到的图片:', data.images);
        } catch (e) {
          console.log('❌ 前端无法解析');
        }
      }
    }

  } catch (error) {
    console.error('❌ 诊断失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
