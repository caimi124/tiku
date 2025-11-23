import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 验证题100内容是否已清洗\n');

  try {
    const q100 = await prisma.questions.findFirst({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
        content: {
          contains: '川木通',
        },
      },
    });

    if (q100) {
      console.log('题100内容:');
      console.log(q100.content);
      console.log('\n内容长度:', q100.content.length);
      console.log('\n是否包含"三、综合分析题":', q100.content.includes('三、综合分析题'));
      console.log('是否包含"案例：":', q100.content.includes('案例：'));
      console.log('是否包含"开胃健脾丸":', q100.content.includes('开胃健脾丸'));
      
      if (!q100.content.includes('三、综合分析题') && 
          !q100.content.includes('案例：') && 
          !q100.content.includes('开胃健脾丸')) {
        console.log('\n✅ 题100内容已成功清洗！');
      } else {
        console.log('\n❌ 题100内容仍包含其他题目的内容');
      }
    } else {
      console.log('❌ 未找到题100');
    }

  } catch (error) {
    console.error('❌ 验证失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
