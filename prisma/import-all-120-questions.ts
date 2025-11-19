import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
const prisma = new PrismaClient();

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

// ==================== 所有120道题目数据 ====================
// 请在下方数组中填入所有题目数据
const allQuestions: QuestionData[] = [
  // TODO: 将下方示例题目替换为完整的120道题目
  // 示例格式（请按此格式添加所有120道题）:
  {
    examType: '执业药师',
    subject: '中药学综合知识与技能',
    chapter: '中医基础理论',
    questionType: 'single',
    content: '属于"阳脉之海"的是',
    options: [
      {key:'A', value:'阳维之脉'},
      {key:'B', value:'阳跷之脉'},
      {key:'C', value:'督脉'},
      {key:'D', value:'带脉'},
      {key:'E', value:'任脉'}
    ],
    correctAnswer: 'C',
    explanation: '督脉为"阳脉之海"。任脉为"阴脉之海"。',
    difficulty: 2,
    knowledgePoints: ['经络学说', '奇经八脉'],
    sourceType: '历年真题',
    sourceYear: 2024
  },
  // ... 继续添加第2题到第120题
];

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 2024年执业药师中药学综合知识与技能真题批量导入工具');
  console.log('='.repeat(70) + '\n');

  try {
    // 清理已存在的2024年题目
    console.log('🗑️  正在清理旧数据...');
    const deleted = await prisma.question.deleteMany({
      where: {
        examType: '执业药师',
        subject: '中药学综合知识与技能',
        sourceYear: 2024,
        sourceType: '历年真题'
      },
    });
    console.log(`✅ 已清理 ${deleted.count} 条旧数据\n`);

    // 批量导入
    console.log(`📦 准备导入 ${allQuestions.length} 道题目...\n`);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < allQuestions.length; i++) {
      try {
        await prisma.question.create({
          data: allQuestions[i],
        });
        successCount++;
        const progress = ((i + 1) / allQuestions.length * 100).toFixed(1);
        const preview = allQuestions[i].content.substring(0, 40);
        console.log(`✅ [${i + 1}/${allQuestions.length}] (${progress}%) ${preview}...`);
      } catch (error: any) {
        errorCount++;
        const errorMsg = `第${i + 1}题导入失败: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 导入统计报告');
    console.log('='.repeat(70));
    console.log(`✅ 成功导入: ${successCount} 道题目`);
    console.log(`❌ 导入失败: ${errorCount} 道题目`);
    console.log(`📝 总计题目: ${allQuestions.length} 道`);
    console.log(`🎯 成功率: ${(successCount / allQuestions.length * 100).toFixed(2)}%`);
    console.log('='.repeat(70) + '\n');

    if (errors.length > 0) {
      console.log('❌ 错误详情:');
      errors.forEach((err, idx) => console.log(`   ${idx + 1}. ${err}`));
      console.log('');
    }

    // 验证数据库
    const totalInDb = await prisma.question.count({
      where: {
        examType: '执业药师',
        subject: '中药学综合知识与技能',
        sourceYear: 2024,
      },
    });
    console.log(`✨ 数据库验证: 现有【2024年中药学综合知识与技能】题目 ${totalInDb} 道\n`);
    
    if (totalInDb === allQuestions.length) {
      console.log('🎉 恭喜！所有题目导入成功！\n');
    } else {
      console.log('⚠️  警告: 数据库题目数量与预期不符，请检查！\n');
    }

  } catch (error) {
    console.error('\n❌ 导入过程发生错误:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
