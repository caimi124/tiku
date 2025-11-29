import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteData() {
  console.log('删除2023年中药药学专业知识（二）数据...');

  const result = await prisma.questions.deleteMany({
    where: {
      source_year: 2023,
      subject: '中药学专业知识（二）'
    }
  });

  console.log(`✅ 删除了 ${result.count} 条记录`);
  
  await prisma.$disconnect();
}

deleteData().catch(console.error);
