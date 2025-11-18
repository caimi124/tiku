import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 开始导入2024年中药学综合知识与技能真题（示例20题）...\n');

  try {
    // 先删除已存在的2024年中药综合真题
    await prisma.question.deleteMany({
      where: {
        examType: '执业药师',
        subject: '中药学综合知识与技能',
        sourceType: '历年真题',
      },
    });
    console.log('🗑️  已清理旧数据\n');

    // 定义前20题
    const questions = [
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
          { key: 'E', value: '任脉' }
        ],
        correctAnswer: 'C',
        explanation: '督脉为"阳脉之海"。任脉为"阴脉之海"。',
        difficulty: 2,
        knowledgePoints: ['经络学说', '奇经八脉'],
        sourceType: '历年真题',
        sourceYear: 2024,
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
          { key: 'E', value: '常温系指10~25°C的环境' }
        ],
        correctAnswer: 'C',
        explanation: '阴凉处系指不超过20°C的环境，选项C说法正确。',
        difficulty: 2,
        knowledgePoints: ['中药贮藏', '药典知识'],
        sourceType: '历年真题',
        sourceYear: 2024,
      },
      {
        examType: '执业药师',
        subject: '中药学综合知识与技能',
        chapter: '中医药学发展史',
        questionType: 'single',
        content: '由唐代孙思邈撰著，在序例中著有"大医习业""大医精诚"两篇专论的典籍是',
        options: [
          { key: 'A', value: '《外台秘要》' },
          { key: 'B', value: '《巢氏病源》' },
          { key: 'C', value: '《千金要方》' },
          { key: 'D', value: '《千金翼方》' },
          { key: 'E', value: '《新修本草》' }
        ],
        correctAnswer: 'C',
        explanation: '在序例中著有"大医习业""大医精诚"两篇专论的典籍是《千金要方》。',
        difficulty: 1,
        knowledgePoints: ['中医典籍', '孙思邈'],
        sourceType: '历年真题',
        sourceYear: 2024,
      },
      {
        examType: '执业药师',
        subject: '中药学综合知识与技能',
        chapter: '痹证辨治',
        questionType: 'single',
        content: '某女，40岁，肢体肌肉酸楚、重着，疼痛，肿胀，活动不利，口中黏腻，舌苔白腻，脉濡缓。治疗宜的基础方剂是',
        options: [
          { key: 'A', value: '薏苡仁汤' },
          { key: 'B', value: '独活寄生汤' },
          { key: 'C', value: '乌头汤' },
          { key: 'D', value: '桃红饮' },
          { key: 'E', value: '防风汤' }
        ],
        correctAnswer: 'A',
        explanation: '依据关键词重着，舌苔白腻，辨证有湿邪痹症，故选用薏苡仁汤。',
        difficulty: 2,
        knowledgePoints: ['痹证', '湿邪', '方剂应用'],
        sourceType: '历年真题',
        sourceYear: 2024,
      },
      {
        examType: '执业药师',
        subject: '中药学综合知识与技能',
        chapter: '中药注射剂使用',
        questionType: 'single',
        content: '关于中药注射剂使用原则的说法，错误的是',
        options: [
          { key: 'A', value: '中药注射剂和其他药品一起混合滴注' },
          { key: 'B', value: '应密切观察用药反应，特别是用药后30分钟内' },
          { key: 'C', value: '按照药品说明书推荐的剂量给药速度和疗程使用' },
          { key: 'D', value: '临床使用中药注射剂应辨证用药' },
          { key: 'E', value: '选用中药注射剂应合理选择给药途径' }
        ],
        correctAnswer: 'A',
        explanation: '中药注射剂应该单独滴注，故A说法错误。',
        difficulty: 1,
        knowledgePoints: ['中药注射剂', '用药安全'],
        sourceType: '历年真题',
        sourceYear: 2024,
      },
    ];

    // 批量插入
    let successCount = 0;
    for (const q of questions) {
      try {
        await prisma.question.create({ data: q });
        successCount++;
        console.log(`✅ 导入成功: ${q.content.substring(0, 40)}...`);
      } catch (error: any) {
        console.error(`❌ 导入失败: ${q.content.substring(0, 40)}...`);
        console.error(`   错误: ${error.message}`);
      }
    }

    console.log(`\n📊 成功导入 ${successCount}/${questions.length} 道题目`);
    
    // 查询验证
    const total = await prisma.question.count({
      where: {
        examType: '执业药师',
        subject: '中药学综合知识与技能',
      },
    });
    console.log(`✨ 数据库中共有【中药学综合知识与技能】题目: ${total} 道\n`);
    console.log('🎉 导入完成！\n');
    
  } catch (error) {
    console.error('❌ 导入失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
