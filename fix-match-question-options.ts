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

async function fixMatchQuestionOptions() {
  console.log('🔧 修复配伍选择题和综合分析题的选项\n');
  console.log('='.repeat(80) + '\n');

  // 1. 读取JSON源文件
  const jsonPath = './shuju/2024年执业药师中药药一历年真题/2024年中药药一历年真题.json';
  const rawData: Question[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // 2. 获取数据库中所有题目
  const dbQuestions = await prisma.questions.findMany({
    where: {
      exam_type: '执业药师',
      subject: '中药学专业知识（一）',
      source_year: 2024
    },
    orderBy: {
      question_number: 'asc'
    }
  });

  console.log(`数据库题目数: ${dbQuestions.length}`);
  console.log(`JSON题目数: ${rawData.length}\n`);

  // 3. 找出所有缺失选项的题目
  const missingOptions = dbQuestions.filter(q => {
    const opts = q.options as any[];
    return !opts || opts.length === 0;
  });

  console.log(`缺失选项的题目: ${missingOptions.length}道\n`);

  // 4. 为配伍选择题和综合分析题分组
  // 配伍选择题通常2-5题一组，综合分析题通常3题一组
  let fixedCount = 0;
  let errorCount = 0;

  for (const dbQ of missingOptions) {
    try {
      const questionNum = dbQ.question_number!;
      
      // 查找同组题目（前后2题范围内）
      let sharedOptions: any[] = [];
      
      // 向前查找
      for (let offset = -1; offset >= -4; offset--) {
        const neighborNum = questionNum + offset;
        const neighbor = dbQuestions.find(q => q.question_number === neighborNum);
        
        if (neighbor) {
          const opts = neighbor.options as any[];
          if (opts && opts.length > 0) {
            // 检查是否同一章节
            if (neighbor.chapter === dbQ.chapter) {
              sharedOptions = opts;
              console.log(`✅ 题${questionNum}从题${neighborNum}获取选项`);
              break;
            }
          }
        }
      }

      // 如果向前没找到，向后查找
      if (sharedOptions.length === 0) {
        for (let offset = 1; offset <= 4; offset++) {
          const neighborNum = questionNum + offset;
          const neighbor = dbQuestions.find(q => q.question_number === neighborNum);
          
          if (neighbor) {
            const opts = neighbor.options as any[];
            if (opts && opts.length > 0) {
              // 检查是否同一章节
              if (neighbor.chapter === dbQ.chapter) {
                sharedOptions = opts;
                console.log(`✅ 题${questionNum}从题${neighborNum}获取选项`);
                break;
              }
            }
          }
        }
      }

      // 如果还是没找到，从JSON源文件中查找答案推断
      if (sharedOptions.length === 0) {
        const jsonQ = rawData.find(q => q.number === questionNum);
        if (jsonQ && jsonQ.answer && jsonQ.analysis) {
          // 从分析中提取答案，查找相邻题目的选项
          console.log(`⚠️  题${questionNum}未找到邻近选项，跳过`);
          errorCount++;
          continue;
        }
      }

      if (sharedOptions.length > 0) {
        // 更新题目选项
        await prisma.questions.update({
          where: { id: dbQ.id },
          data: {
            options: sharedOptions
          }
        });
        fixedCount++;
      }

    } catch (error: any) {
      console.error(`❌ 修复题${dbQ.question_number}失败:`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 修复完成:`);
  console.log(`   ✅ 成功: ${fixedCount} 题`);
  console.log(`   ⚠️  跳过: ${errorCount} 题`);
  console.log('='.repeat(80));

  await prisma.$disconnect();
}

fixMatchQuestionOptions();
