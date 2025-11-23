import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkQuestion62() {
  console.log('🔍 检查第61-64题的图片数据\n');
  
  // 查询所有2024年中药学专业知识（一）的题目
  const allQuestions = await prisma.questions.findMany({
    where: {
      exam_type: '执业药师',
      subject: '中药学专业知识（一）',
      source_year: 2024,
    },
    orderBy: {
      created_at: 'asc'
    }
  });

  console.log(`总题目数: ${allQuestions.length}\n`);

  // 找到配伍选择题（第41-90题）
  const matchQuestions = allQuestions.filter(q => q.chapter === '二、配伍选择题');
  console.log(`配伍选择题数量: ${matchQuestions.length}\n`);

  // 检查前10道配伍选择题
  console.log('前10道配伍选择题的图片数据:\n');
  matchQuestions.slice(0, 10).forEach((q, idx) => {
    const questionNumber = 41 + idx; // 配伍选择题从41开始
    console.log(`题目 ${questionNumber}:`);
    console.log(`  ID: ${q.id}`);
    console.log(`  题干: ${q.content.substring(0, 50)}...`);
    console.log(`  ai_explanation: ${q.ai_explanation ? '有数据' : '❌ 无数据'}`);
    if (q.ai_explanation) {
      try {
        const data = JSON.parse(q.ai_explanation);
        console.log(`  图片数量: ${data.images?.length || 0}`);
      } catch (e) {
        console.log(`  解析失败`);
      }
    }
    console.log('');
  });

  await prisma.$disconnect();
}

checkQuestion62().catch(console.error);
