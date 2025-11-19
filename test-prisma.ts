import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:CwKXguB7eIA4tfTn@db.tparjdkxxtnentsdazfw.supabase.co:5432/postgres'
    }
  }
});

async function test() {
  console.log('Testing Prisma connection...');
  console.log('Prisma object:', typeof prisma);
  console.log('Prisma.question:', typeof prisma.question);
  
  try {
    const count = await prisma.question.count();
    console.log('✅ Connection successful! Total questions:', count);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
