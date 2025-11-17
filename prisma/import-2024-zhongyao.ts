import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// 加载环境变量
config({ path: '.env.local' });

const prisma = new PrismaClient();

// 2024年执业药师中药药综真题数据
const questions2024 = [
  {
    examType: '执业药师',
    subject: '中药学综合知识与技能',
    chapter: '中医基础理论',
    questionType: 'single',
    content: '属于"阳脉之海"的是',
    options: [
      { key: 'A', value: '阳维之脉' },
      { key: 'B', value: '阳跷之脉' },
      { key: 'C', value: '督脉' },
      { key: 'D', value: '带脉' },
      { key: 'E', value: '任脉' },
    ],
    correctAnswer: 'C',
    explanation: '督脉为"阳脉之海"。任脉为"阴脉之海"。',
    difficulty: 2,
    knowledgePoints: ['经络学说', '高频考点'],
  },
  {
    examType: '执业药师',
    subject: '中药学综合知识与技能',
    chapter: '中药贮藏',
    questionType: 'single',
    content: '《中国药典》"凡例"中贮藏项下各名词术语进行了解释，关于中药贮藏名词说法，正确的是',
    options: [
      { key: 'A', value: '密封系指将容器密闭，以防止尘及异物进入' },
      { key: 'B', value: '遮光系指避免日光直射' },
      { key: 'C', value: '阴凉处系指不超过20°C的环境' },
      { key: 'D', value: '冷处系指0~8°C的环境' },
      { key: 'E', value: '常温系指10~25°C的环境' },
    ],
    correctAnswer: 'C',
    explanation: '阴凉处系指不超过20°C的环境。',
    difficulty: 2,
    knowledgePoints: ['中药贮藏', '药典'],
  },
  // TODO: 继续添加其他118道题目...
  // 您可以按照相同格式继续添加题目
];

async function importQuestions() {
  console.log('🚀 开始导入2024年执业药师中药药综真题...\n');

  try {
    // 逐个插入题目
    let successCount = 0;
    let errorCount = 0;

    for (const questionData of questions2024) {
      try {
        const question = await prisma.question.create({
          data: questionData,
        });
        successCount++;
        console.log(`✅ 导入成功: ${question.content.substring(0, 30)}...`);
      } catch (error) {
        errorCount++;
        console.error(`❌ 导入失败: ${questionData.content.substring(0, 30)}...`);
        console.error(`   错误: ${error}`);
      }
    }

    console.log('\n📊 导入统计:');
    console.log(`   成功: ${successCount} 道题目`);
    console.log(`   失败: ${errorCount} 道题目`);
    console.log(`   总计: ${questions2024.length} 道题目`);

    // 查询验证
    const total = await prisma.question.count({
      where: {
        examType: '执业药师',
        subject: '中药学综合知识与技能',
      },
    });

    console.log(`\n✨ 数据库中现有【执业药师-中药学综合知识与技能】题目: ${total} 道\n`);
  } catch (error) {
    console.error('❌ 导入失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行导入
importQuestions();
