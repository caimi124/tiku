import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function check() {
  try {
    const q101 = await prisma.questions.findFirst({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
        content: { contains: '菌丝' }
      }
    });

    console.log('题101当前内容:');
    console.log(q101?.content);
    console.log('\n内容长度:', q101?.content.length);
    console.log('是否包含案例:', q101?.content.includes('案例'));
    console.log('是否包含开胃健脾丸:', q101?.content.includes('开胃健脾丸'));

  } catch (error) {
    console.error('错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
