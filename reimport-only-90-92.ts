import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
    }
  }
});

interface Question {
  number: number;
  question: string;
  options: string[];
  answer: string;
  analysis: string;
}

function parseOptions(optionsArray: string[]): { key: string; value: string }[] {
  return optionsArray.map(opt => {
    const match = opt.match(/^([A-E])\.\s*(.*)$/);
    if (match) {
      return { key: match[1], value: match[2].trim() };
    }
    return { key: '', value: opt };
  });
}

async function reimportOnly90_92() {
  console.log('🔧 只重新导入第90-92题（图片题）\n');
  console.log('⚠️  不影响其他117道题目\n');
  console.log('='.repeat(80) + '\n');

  try {
    // 1. 读取JSON源文件
    const jsonPath = './shuju/2024年执业药师中药药一历年真题/2024年中药药一历年真题.json';
    const rawData: Question[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    // 2. 只提取第90-92题
    const questions90_92 = rawData.filter(q => q.number >= 90 && q.number <= 92);
    
    console.log(`📖 读取到第90-92题（${questions90_92.length}道）\n`);
    
    // 3. 找到数据库中的这3道题
    const allQuestions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2024
      }
    });

    const dbQ90 = allQuestions.find(q => q.content.includes('结构类型为香豆素类化合物的是'));
    const dbQ91 = allQuestions.find(q => q.content.includes('结构类型为有机酸类化合物的是'));
    const dbQ92 = allQuestions.find(q => q.content.includes('结构类型为黄酮类化合物的是'));

    if (!dbQ90 || !dbQ91 || !dbQ92) {
      console.log('❌ 未找到数据库中的第90-92题！');
      await prisma.$disconnect();
      return;
    }

    console.log('✅ 找到数据库中的3道题\n');
    
    // 4. 准备图片数据
    const imageDir = 'E:\\tiku\\public\\shuju\\2024年执业药师中药药一历年真题\\img';
    const imageUrls = [
      '/shuju/2024年执业药师中药药一历年真题/img/90-92-A.jpeg',
      '/shuju/2024年执业药师中药药一历年真题/img/90-92-B.jpeg',
      '/shuju/2024年执业药师中药药一历年真题/img/90-92-C.jpeg',
      '/shuju/2024年执业药师中药药一历年真题/img/90-92-D.jpeg',
      '/shuju/2024年执业药师中药药一历年真题/img/90-92-E.jpeg'
    ];

    // 验证图片文件存在
    console.log('📷 验证图片文件：\n');
    let allImagesExist = true;
    imageUrls.forEach(url => {
      const fileName = path.basename(url);
      const filePath = path.join(imageDir, fileName);
      const exists = fs.existsSync(filePath);
      console.log(`${exists ? '✅' : '❌'} ${fileName}`);
      if (!exists) allImagesExist = false;
    });
    
    if (!allImagesExist) {
      console.log('\n❌ 部分图片文件不存在，无法继续！');
      await prisma.$disconnect();
      return;
    }

    console.log('\n' + '='.repeat(80) + '\n');
    console.log('🔧 开始更新第90-92题...\n');

    const aiExplanationData = JSON.stringify({ images: imageUrls });

    // 5. 更新第90题
    const q90Data = questions90_92.find(q => q.number === 90)!;
    await prisma.questions.update({
      where: { id: dbQ90.id },
      data: {
        content: q90Data.question + '\n\n【题目包含图片】',
        options: parseOptions(['A.', 'B.', 'C.', 'D.', 'E.']),
        correct_answer: q90Data.answer,
        explanation: q90Data.analysis,
        ai_explanation: aiExplanationData
      }
    });
    console.log('✅ 题90更新完成');

    // 6. 更新第91题
    const q91Data = questions90_92.find(q => q.number === 91)!;
    await prisma.questions.update({
      where: { id: dbQ91.id },
      data: {
        content: q91Data.question + '\n\n【题目包含图片】',
        options: parseOptions(['A.', 'B.', 'C.', 'D.', 'E.']),
        correct_answer: q91Data.answer,
        explanation: q91Data.analysis,
        ai_explanation: aiExplanationData
      }
    });
    console.log('✅ 题91更新完成');

    // 7. 更新第92题
    const q92Data = questions90_92.find(q => q.number === 92)!;
    // 第92题的options有问题，只取前5个
    const cleanOptions = q92Data.options.slice(0, 5);
    await prisma.questions.update({
      where: { id: dbQ92.id },
      data: {
        content: q92Data.question + '\n\n【题目包含图片】',
        options: parseOptions(cleanOptions),
        correct_answer: q92Data.answer,
        explanation: q92Data.analysis,
        ai_explanation: aiExplanationData
      }
    });
    console.log('✅ 题92更新完成');

    console.log('\n' + '='.repeat(80) + '\n');

    // 8. 验证更新结果
    const updated90 = await prisma.questions.findUnique({ where: { id: dbQ90.id } });
    const updated91 = await prisma.questions.findUnique({ where: { id: dbQ91.id } });
    const updated92 = await prisma.questions.findUnique({ where: { id: dbQ92.id } });

    console.log('📊 更新后验证：\n');
    [updated90, updated91, updated92].forEach((q, idx) => {
      if (q) {
        console.log(`题${90 + idx}:`);
        console.log(`  题目: ${q.content.substring(0, 50)}...`);
        console.log(`  选项数量: ${(q.options as any[]).length}`);
        console.log(`  有图片: ${q.ai_explanation ? 'Yes ✅' : 'No ❌'}`);
        if (q.ai_explanation) {
          try {
            const data = JSON.parse(q.ai_explanation);
            console.log(`  图片数量: ${data.images?.length || 0}`);
          } catch (e) {
            console.log(`  ❌ 数据解析失败`);
          }
        }
        console.log('');
      }
    });

    console.log('='.repeat(80));
    console.log('\n🎉 修复完成！\n');
    console.log('✅ 只更新了第90-92题（3道）');
    console.log('✅ 其他117道题目未受影响');
    console.log('✅ 请刷新浏览器查看第90-92题的图片\n');

  } catch (error: any) {
    console.error('❌ 更新失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

reimportOnly90_92();
