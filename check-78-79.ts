import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  const questions = await prisma.questions.findMany({
    where: {
      exam_type: '执业药师',
      subject: '中药学专业知识（一）',
      source_year: 2022,
    },
    orderBy: {
      created_at: 'asc',
    },
    take: 120,
  });

  const q78 = questions[77];
  const q79 = questions[78];

  console.log('题78:',q78.content.substring(0, 50));
  console.log('有图片:', q78.ai_explanation ? '是' : '否');
  console.log('AI说明:', q78.ai_explanation);

  console.log('\n题79:', q79.content.substring(0, 50));
  console.log('有图片:', q79.ai_explanation ? '是' : '否');
  console.log('AI说明:', q79.ai_explanation);

  await prisma.$disconnect();
}

main();
