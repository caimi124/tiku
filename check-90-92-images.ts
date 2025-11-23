import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
    }
  }
});

async function check90_92() {
  console.log('🔍 检查第90-92题的图片数据\n');
  console.log('='.repeat(80) + '\n');

  const questions = await prisma.questions.findMany({
    where: {
      exam_type: '执业药师',
      subject: '中药学专业知识（一）',
      source_year: 2024,
      question_number: {
        in: [90, 91, 92]
      }
    },
    orderBy: {
      question_number: 'asc'
    }
  });

  questions.forEach(q => {
    console.log(`题${q.question_number}: ${q.content.substring(0, 60)}...`);
    console.log(`  章节: ${q.chapter}`);
    console.log(`  题型: ${q.question_type}`);
    
    const opts = q.options as any[];
    console.log(`  选项数量: ${opts.length}`);
    if (opts.length > 0) {
      console.log(`  选项内容:`);
      opts.forEach(opt => {
        console.log(`    ${opt.key}. ${opt.value || '(无文字，可能是图片选项)'}`);
      });
    }
    
    console.log(`  ai_explanation: ${q.ai_explanation ? '有数据' : '❌ 无数据'}`);
    
    if (q.ai_explanation) {
      try {
        const data = JSON.parse(q.ai_explanation);
        console.log(`  图片数量: ${data.images?.length || 0}`);
        if (data.images && data.images.length > 0) {
          console.log(`  图片列表:`);
          data.images.forEach((img: string, idx: number) => {
            console.log(`    [${idx}] ${img}`);
          });
        }
      } catch (e) {
        console.log(`  ❌ JSON解析失败`);
      }
    }
    
    console.log('');
  });

  // 检查图片文件是否存在
  console.log('='.repeat(80) + '\n');
  console.log('🔍 检查图片文件是否存在：\n');
  
  const fs = require('fs');
  const path = require('path');
  const imgDir = 'E:\\tiku\\public\\shuju\\2024年执业药师中药药一历年真题\\img';
  
  const expectedImages = [
    '90-92-A.jpeg',
    '90-92-B.jpeg',
    '90-92-C.jpeg',
    '90-92-D.jpeg',
    '90-92-E.jpeg'
  ];
  
  expectedImages.forEach(imgName => {
    const imgPath = path.join(imgDir, imgName);
    const exists = fs.existsSync(imgPath);
    console.log(`${exists ? '✅' : '❌'} ${imgName}`);
  });

  await prisma.$disconnect();
}

check90_92();
