import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查2023年法规题8的解析数据\n');

  const questions = await prisma.questions.findMany({
    where: {
      source_year: 2023,
      subject: '药事管理与法规'
    },
    orderBy: { created_at: 'asc' },
    skip: 7,  // 跳过前7题，获取第8题
    take: 1,
    select: {
      content: true,
      correct_answer: true,
      ai_explanation: true,
      explanation: true
    }
  });

  if (questions.length === 0) {
    console.log('❌ 没有找到第8题');
    return;
  }

  const q = questions[0];
  console.log('题目内容:', q.content.substring(0, 50) + '...');
  console.log('答案:', q.correct_answer);
  console.log('\nai_explanation字段:');
  console.log(q.ai_explanation || '(空)');
  console.log('\nexplanation字段:');
  console.log(q.explanation || '(空)');
  console.log('\n' + '='.repeat(50));

  // 检查JSON源数据
  const fs = require('fs');
  const path = require('path');
  const jsonPath = path.join(process.cwd(), 'shuju', '2023年执业药师法规历年真题.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const q8 = data.find((item: any) => item.number === 8);
  
  console.log('\nJSON源数据中的analysis字段:');
  console.log(q8?.analysis || '(空)');
}

main()
  .catch((error) => {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
