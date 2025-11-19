import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
const prisma = new PrismaClient();

// 题目数据接口
interface QuestionData {
  examType: string;
  subject: string;
  chapter: string;
  questionType: string;
  content: string;
  options: { key: string; value: string }[];
  correctAnswer: string;
  explanation: string;
  difficulty: number;
  knowledgePoints: string[];
  sourceType: string;
  sourceYear: number;
}

// 导入函数
async function importQuestions(questions: QuestionData[], batchName: string) {
  console.log(`\n🚀 开始导入 ${batchName}\n`);
  console.log(`📦 准备导入 ${questions.length} 道题目\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < questions.length; i++) {
    try {
      await prisma.question.create({
        data: questions[i],
      });
      successCount++;
      const progress = `[${i + 1}/${questions.length}]`;
      const preview = questions[i].content.substring(0, 30);
      console.log(`✅ ${progress} ${preview}...`);
    } catch (error: any) {
      errorCount++;
      console.error(`❌ [${i + 1}] 导入失败: ${error.message}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 ${batchName} 导入统计:`);
  console.log(`   ✅ 成功: ${successCount} 道`);
  console.log(`   ❌ 失败: ${errorCount} 道`);
  console.log(`   📝 总计: ${questions.length} 道`);
  console.log(`${'='.repeat(60)}\n`);

  return { successCount, errorCount };
}

// 导出函数供其他脚本使用
export type { QuestionData };
export { importQuestions, prisma };
