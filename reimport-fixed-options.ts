import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

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

async function reimportFixedOptions() {
  console.log('🔧 重新导入修复后的第42-50题\n');
  console.log('='.repeat(80) + '\n');

  try {
    // 1. 读取修复后的JSON
    const jsonPath = './shuju/2024年执业药师中药药一历年真题/2024年中药药一历年真题.json';
    const rawData: Question[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    const questionsToFix = rawData.filter(q => q.number >= 42 && q.number <= 50);
    
    console.log(`📖 读取到第42-50题（${questionsToFix.length}道）\n`);
    
    // 2. 查找数据库中的这些题目
    const allQuestions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2024
      },
      orderBy: { question_number: 'asc' }
    });

    console.log(`📊 数据库中共有 ${allQuestions.length} 道题\n`);
    
    // 3. 按题号匹配并更新
    let updateCount = 0;
    
    for (const jsonQ of questionsToFix) {
      // 通过question_number字段查找
      const dbQ = allQuestions.find(q => (q as any).question_number === jsonQ.number);
      
      if (!dbQ) {
        console.log(`❌ 未找到题${jsonQ.number}，跳过`);
        continue;
      }
      
      console.log(`🔧 更新题${jsonQ.number}: ${jsonQ.question.substring(0, 40)}...`);
      console.log(`   新选项数量: ${jsonQ.options.length}`);
      if (jsonQ.options.length > 0) {
        console.log(`   新选项[0]: ${jsonQ.options[0]}`);
      }
      
      await prisma.questions.update({
        where: { id: dbQ.id },
        data: {
          options: parseOptions(jsonQ.options)
        }
      });
      
      updateCount++;
      console.log(`   ✅ 更新成功\n`);
    }
    
    console.log('='.repeat(80));
    console.log(`\n✅ 更新完成！共更新 ${updateCount} 道题目\n`);
    
    // 4. 验证更新结果
    console.log('📊 验证更新结果:\n');
    
    for (const num of [42, 43, 44, 45, 46, 47, 48, 49, 50]) {
      const dbQ = allQuestions.find(q => (q as any).question_number === num);
      if (dbQ) {
        const updated = await prisma.questions.findUnique({ where: { id: dbQ.id } });
        if (updated) {
          console.log(`题${num}: ${updated.content.substring(0, 40)}...`);
          const opts = updated.options as any[];
          console.log(`  选项数量: ${opts.length}`);
          if (opts.length > 0) {
            console.log(`  选项[0]: ${opts[0].key}. ${opts[0].value}`);
          }
          console.log('');
        }
      }
    }
    
  } catch (error: any) {
    console.error('❌ 更新失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

reimportFixedOptions();
