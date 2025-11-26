import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 最后3道题的答案更新
const updatedQuestions = [
  {
    number: 52,
    correctAnswer: 'C',
    explanation: '八正合剂—湿热下注所致的淋证，症见小便短赤，淋沥涩痛，口燥咽干。'
  },
  {
    number: 53,
    correctAnswer: 'D',
    explanation: '藿清片（藿香片）—下焦湿热所致的热淋，症见尿频、尿急、尿痛、腰痛、小腹坠胀。亦用于慢性前列腺炎之湿热蕴结兼瘀血证，症见小便频急，尿后余沥不尽，尿道灼热，会阴少腹腰骶部疼痛或不适等。'
  },
  {
    number: 54,
    correctAnswer: 'A',
    explanation: '肾炎四味片——湿热内蕴兼气虚所致的水肿，症见浮肿、腰痛、乏力、小便不利。'
  }
];

async function main() {
  console.log('\n🎯 开始最终答案更新（最后3道题）\n');

  let successCount = 0;
  let errorCount = 0;

  for (const update of updatedQuestions) {
    try {
      // 查找对应题目
      const question = await prisma.questions.findFirst({
        where: {
          source_year: 2024,
          subject: '中药学专业知识（二）'
        },
        skip: update.number - 1,
        orderBy: { created_at: 'asc' }
      });

      if (!question) {
        console.error(`❌ 题${update.number}: 未找到题目`);
        errorCount++;
        continue;
      }

      // 更新答案和解析
      await prisma.questions.update({
        where: { id: question.id },
        data: {
          correct_answer: update.correctAnswer,
          explanation: update.explanation
        }
      });

      console.log(`✅ 题${update.number}: 答案=${update.correctAnswer} | ${update.explanation.substring(0, 40)}...`);
      successCount++;

    } catch (error) {
      console.error(`❌ 题${update.number}: 更新失败`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 最终更新统计');
  console.log('='.repeat(60));
  console.log(`✅ 成功: ${successCount} 道题`);
  console.log(`❌ 失败: ${errorCount} 道题`);
  console.log(`📝 总计: ${updatedQuestions.length} 道题`);
  console.log('='.repeat(60) + '\n');

  // 统计完成情况
  const allQuestions = await prisma.questions.findMany({
    where: {
      source_year: 2024,
      subject: '中药学专业知识（二）'
    },
    orderBy: { created_at: 'asc' }
  });

  const emptyCount = allQuestions.filter(q => !q.correct_answer || q.correct_answer.trim() === '').length;
  const totalAnswered = 120 - emptyCount;

  console.log('🎉 完成情况统计\n');
  console.log(`✅ 已补充答案: ${totalAnswered} 道题`);
  console.log(`⚠️  剩余空答案: ${emptyCount} 道题`);
  console.log(`📊 完成进度: ${Math.round(totalAnswered / 120 * 100)}%`);
  
  if (emptyCount === 0) {
    console.log('\n🎊🎊🎊 恭喜！所有120道题目答案已全部补充完成！ 🎊🎊🎊\n');
  }

  // 累计更新统计
  const batch1 = 9;
  const batch2 = 56;
  const batch3 = successCount;
  const totalUpdates = batch1 + batch2 + batch3;

  console.log('📈 累计更新记录\n');
  console.log(`第一批（2024-11-25）: ${batch1} 道题`);
  console.log(`第二批（2024-11-26）: ${batch2} 道题`);
  console.log(`第三批（2024-11-26）: ${batch3} 道题`);
  console.log(`总计更新: ${totalUpdates} 道题\n`);

  console.log('✅ 更新完成！\n');
}

main()
  .catch((e) => {
    console.error('💥 更新失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
