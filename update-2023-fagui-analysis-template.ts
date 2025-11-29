import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 📝 在这里添加缺失的解析内容
// 格式: 题号 -> 解析内容
const MISSING_ANALYSIS: Record<number, string> = {
  // 题101-110 缺失的解析（请根据实际题目内容补充）
  
  // 101: '解析内容...',
  // 102: '解析内容...',
  // 104: '解析内容...',
  // 105: '解析内容...',
  // 106: '解析内容...',
  // 108: '解析内容...',
  // 109: '解析内容...',
  // 110: '解析内容...',
  
  // 示例（取消注释并修改）:
  // 101: '根据《药品管理法》，甲作为药品上市许可持有人，有责任对疫苗的储存条件进行监督管理。丙配置的普通冰箱不符合疫苗储存要求，属于违规行为。',
};

async function main() {
  console.log('🔧 更新2023年法规缺失的解析\n');

  if (Object.keys(MISSING_ANALYSIS).length === 0) {
    console.log('⚠️  MISSING_ANALYSIS为空，请先添加解析内容');
    console.log('\n💡 使用步骤:');
    console.log('1. 运行 npx tsx list-2023-fagui-missing-analysis.ts 查看缺失题目');
    console.log('2. 在本文件的 MISSING_ANALYSIS 中添加解析内容');
    console.log('3. 再次运行本脚本进行更新');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const [questionNumStr, analysis] of Object.entries(MISSING_ANALYSIS)) {
    const questionNum = parseInt(questionNumStr);
    
    try {
      // 获取指定题号的题目
      const questions = await prisma.questions.findMany({
        where: {
          source_year: 2023,
          subject: '药事管理与法规'
        },
        orderBy: { created_at: 'asc' },
        skip: questionNum - 1,
        take: 1
      });

      if (questions.length === 0) {
        console.log(`❌ 题${questionNum}: 未找到`);
        errorCount++;
        continue;
      }

      const question = questions[0];

      // 更新解析
      await prisma.questions.update({
        where: { id: question.id },
        data: {
          ai_explanation: analysis
        }
      });

      console.log(`✅ 题${questionNum}: 已更新解析 (${analysis.substring(0, 30)}...)`);
      successCount++;

    } catch (error) {
      console.error(`❌ 题${questionNum}: 更新失败`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 更新统计:');
  console.log(`✅ 成功: ${successCount} 道题`);
  console.log(`❌ 失败: ${errorCount} 道题`);
  console.log('='.repeat(60));

  // 验证更新结果
  if (successCount > 0) {
    console.log('\n🔍 验证更新结果:\n');
    
    const updatedQuestions = await prisma.questions.findMany({
      where: {
        source_year: 2023,
        subject: '药事管理与法规'
      },
      orderBy: { created_at: 'asc' },
      skip: 100,
      take: 10,
      select: {
        ai_explanation: true
      }
    });

    updatedQuestions.forEach((q, index) => {
      const questionNum = 101 + index;
      const hasExplanation = q.ai_explanation && q.ai_explanation.trim() !== '';
      const status = hasExplanation ? '✅' : '❌';
      console.log(`题${questionNum} ${status}: ${hasExplanation ? '有解析' : '无解析'}`);
    });
  }
}

main()
  .catch((error) => {
    console.error('❌ 更新过程出错:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
