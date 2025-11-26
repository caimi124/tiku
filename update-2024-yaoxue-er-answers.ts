import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 需要更新的题目数据
const updatedQuestions = [
  // 题41-43：便秘相关
  {
    number: 41,
    correctAnswer: 'A',
    explanation: '当归龙荟丸——肝胆火旺，症见心烦不宁、头晕目眩、耳鸣耳聋、胁肋疼痛、脘腹胀痛、大便秘结。'
  },
  {
    number: 42,
    correctAnswer: 'B',
    explanation: '通便宁片——胃肠实热，症见大便秘结，腹痛拒按，腹胀纳呆，口干苦，小便短赤。'
  },
  {
    number: 43,
    correctAnswer: 'D',
    explanation: '增液口服液——高热后，阴津亏损所致的便秘，症见大便秘结，兼见口渴咽干、口唇干燥、小便短赤、舌红少津。'
  },
  
  // 题70-72：凉血药物相关
  {
    number: 70,
    correctAnswer: 'C',
    explanation: '牡丹皮——凉血活血、退虚热。'
  },
  {
    number: 71,
    correctAnswer: 'D',
    explanation: '紫草——凉血活血、解毒透疹。'
  },
  {
    number: 72,
    correctAnswer: 'E',
    explanation: '水牛角——清热凉血、定惊。'
  },
  
  // 题75-77：明目药物相关
  {
    number: 75,
    correctAnswer: 'E',
    explanation: '谷精草——治风热目赤、肿痛者，且生翳膜，但血虚目疾者慎服。'
  },
  {
    number: 76,
    correctAnswer: 'C',
    explanation: '蝉蜕——治风热或肝热之目赤翳障，但孕妇慎服。'
  },
  {
    number: 77,
    correctAnswer: 'B',
    explanation: '青箱子——治肝火上炎之目赤肿痛，且生翳膜，但瞳孔散大者忌服。'
  }
];

async function main() {
  console.log('\n🔧 开始更新2024年中药药学专业知识（二）空答案题目\n');

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

      console.log(`✅ 题${update.number}: 答案=${update.correctAnswer} | ${update.explanation.substring(0, 30)}...`);
      successCount++;

    } catch (error) {
      console.error(`❌ 题${update.number}: 更新失败`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 更新统计');
  console.log('='.repeat(60));
  console.log(`✅ 成功: ${successCount} 道题`);
  console.log(`❌ 失败: ${errorCount} 道题`);
  console.log(`📝 总计: ${updatedQuestions.length} 道题`);
  console.log('='.repeat(60) + '\n');

  // 验证更新结果
  console.log('🔍 验证更新结果:\n');
  
  for (const update of updatedQuestions) {
    const question = await prisma.questions.findFirst({
      where: {
        source_year: 2024,
        subject: '中药学专业知识（二）'
      },
      skip: update.number - 1,
      orderBy: { created_at: 'asc' }
    });

    if (question) {
      const status = question.correct_answer === update.correctAnswer ? '✅' : '❌';
      console.log(`${status} 题${update.number}: 答案=${question.correct_answer || '(空)'} | 解析=${question.explanation?.substring(0, 25) || '(空)'}...`);
    }
  }

  console.log('\n✅ 更新完成！\n');
}

main()
  .catch((e) => {
    console.error('💥 更新失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
