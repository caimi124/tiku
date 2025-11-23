import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
    }
  }
});

async function test() {
  try {
    console.log('测试数据库连接...');
    const count = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2024
      }
    });
    console.log(`✅ 连接成功！当前有 ${count} 道题`);
  } catch (error: any) {
    console.error('❌ 连接失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
