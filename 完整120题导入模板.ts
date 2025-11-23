import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
const prisma = new PrismaClient();

// 完整的120道题目数据
// 【请将您的完整数据粘贴到这里】
const allQuestions = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 一、最佳选择题（1-40题）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
    isPublished: true
  },
  // 第2题
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
    isPublished: true
  },
  
  // 【请继续添加第3-40题，格式同上】
  // 第3题
  // ...
  // 第40题

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 二、配伍选择题（41-90题，共50题）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 配伍选择题说明：共用备选答案，每组2-5题
  
  // 【配伍组1】共用选项
  // 第41题
  {
    examType: '执业药师',
    subject: '中药学综合知识与技能',
    chapter: '中药学',
    questionType: 'match',
    content: '配伍题示例：某患者症状描述1...',
    options: [
      { key: 'A', value: '选项A' },
      { key: 'B', value: '选项B' },
      { key: 'C', value: '选项C' },
      { key: 'D', value: '选项D' },
      { key: 'E', value: '选项E' }
    ],
    correctAnswer: 'A',
    explanation: '解析内容',
    difficulty: 2,
    knowledgePoints: ['知识点1', '知识点2'],
    sourceType: '历年真题',
    sourceYear: 2024,
    isPublished: true
  },
  // 第42题（共用上面的选项）
  {
    examType: '执业药师',
    subject: '中药学综合知识与技能',
    chapter: '中药学',
    questionType: 'match',
    content: '配伍题示例：某患者症状描述2...',
    options: [
      { key: 'A', value: '选项A' },
      { key: 'B', value: '选项B' },
      { key: 'C', value: '选项C' },
      { key: 'D', value: '选项D' },
      { key: 'E', value: '选项E' }
    ],
    correctAnswer: 'B',
    explanation: '解析内容',
    difficulty: 2,
    knowledgePoints: ['知识点1', '知识点2'],
    sourceType: '历年真题',
    sourceYear: 2024,
    isPublished: true
  },

  // 【请继续添加第43-90题】
  // ...

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 三、综合分析题（91-110题，共20题）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 综合分析题说明：病例分析，一个案例下有多个小题
  
  // 【病例1】
  // 第91题
  {
    examType: '执业药师',
    subject: '中药学综合知识与技能',
    chapter: '病例分析',
    questionType: 'comprehensive',
    content: '某女，40岁，肢体肌肉酸楚、重着，疼痛，肿胀，活动不利，口中黏腻，舌苔白腻，脉濡缓。该患者的诊断是',
    options: [
      { key: 'A', value: '风寒湿痹' },
      { key: 'B', value: '风湿热痹' },
      { key: 'C', value: '湿热痹' },
      { key: 'D', value: '痰湿痹' },
      { key: 'E', value: '肾虚痹' }
    ],
    correctAnswer: 'A',
    explanation: '依据关键词重着，舌苔白腻，辨证有湿邪痹症。',
    difficulty: 2,
    knowledgePoints: ['痹证', '辨证论治'],
    sourceType: '历年真题',
    sourceYear: 2024,
    isPublished: true
  },
  // 第92题（同一病例）
  {
    examType: '执业药师',
    subject: '中药学综合知识与技能',
    chapter: '病例分析',
    questionType: 'comprehensive',
    content: '（承上题）治疗该患者应选用的基础方剂是',
    options: [
      { key: 'A', value: '薏苡仁汤' },
      { key: 'B', value: '独活寄生汤' },
      { key: 'C', value: '乌头汤' },
      { key: 'D', value: '桃红饮' },
      { key: 'E', value: '防风汤' }
    ],
    correctAnswer: 'A',
    explanation: '依据湿邪痹症，选用薏苡仁汤。',
    difficulty: 2,
    knowledgePoints: ['方剂应用', '痹证治疗'],
    sourceType: '历年真题',
    sourceYear: 2024,
    isPublished: true
  },

  // 【请继续添加第93-110题】
  // ...

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 四、多项选择题（111-120题，共10题）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 多项选择题说明：可以选2个或2个以上答案
  
  // 第111题
  {
    examType: '执业药师',
    subject: '中药学综合知识与技能',
    chapter: '综合知识',
    questionType: 'multiple',
    content: '关于中药注射剂使用原则，正确的说法有',
    options: [
      { key: 'A', value: '应单独使用' },
      { key: 'B', value: '密切观察用药反应' },
      { key: 'C', value: '按说明书推荐剂量使用' },
      { key: 'D', value: '辨证用药' },
      { key: 'E', value: '合理选择给药途径' }
    ],
    correctAnswer: 'ABCDE', // 多选题答案
    explanation: '所有选项都正确。中药注射剂使用需要遵循多个原则。',
    difficulty: 2,
    knowledgePoints: ['中药注射剂', '用药安全'],
    sourceType: '历年真题',
    sourceYear: 2024,
    isPublished: true
  },

  // 【请继续添加第112-120题】
  // ...
  // 第120题

];

async function main() {
  console.log('🚀 开始导入2024年执业药师中药学综合知识与技能真题（120题完整版）\n');
  console.log('=' .repeat(70));

  try {
    // 1. 删除已存在的2024年数据
    console.log('🗑️  第1步：清理现有2024年数据...');
    const deleted = await prisma.questions.deleteMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024,
      },
    });
    console.log(`   ✅ 已删除 ${deleted.count} 条旧数据\n`);

    // 2. 验证数据完整性
    console.log('🔍 第2步：验证数据完整性...');
    if (allQuestions.length !== 120) {
      console.warn(`   ⚠️  警告：当前只有 ${allQuestions.length} 道题，应该是120道！`);
      console.log(`   📝 请补充剩余 ${120 - allQuestions.length} 道题\n`);
    } else {
      console.log(`   ✅ 数据完整：120道题\n`);
    }

    // 3. 验证题型分布
    console.log('📊 第3步：检查题型分布...');
    const typeCount: Record<string, number> = {};
    allQuestions.forEach(q => {
      typeCount[q.questionType] = (typeCount[q.questionType] || 0) + 1;
    });
    
    console.log('   题型统计:');
    console.log(`   - 最佳选择题 (single): ${typeCount.single || 0} 道 ${typeCount.single === 40 ? '✅' : '⚠️ 应该40道'}`);
    console.log(`   - 配伍选择题 (match): ${typeCount.match || 0} 道 ${typeCount.match === 50 ? '✅' : '⚠️ 应该50道'}`);
    console.log(`   - 综合分析题 (comprehensive): ${typeCount.comprehensive || 0} 道 ${typeCount.comprehensive === 20 ? '✅' : '⚠️ 应该20道'}`);
    console.log(`   - 多项选择题 (multiple): ${typeCount.multiple || 0} 道 ${typeCount.multiple === 10 ? '✅' : '⚠️ 应该10道'}`);
    console.log('');

    // 4. 批量导入
    console.log('📥 第4步：开始批量导入...\n');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < allQuestions.length; i++) {
      try {
        const q = allQuestions[i];
        await prisma.questions.create({
          data: {
            exam_type: q.examType,
            subject: q.subject,
            chapter: q.chapter,
            question_type: q.questionType,
            content: q.content,
            options: q.options,
            correct_answer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            knowledge_points: q.knowledgePoints,
            source_type: q.sourceType,
            source_year: q.sourceYear,
            is_published: q.isPublished,
          },
        });
        successCount++;
        
        const progress = `[${i + 1}/${allQuestions.length}]`;
        const typeEmoji = {
          single: '📝',
          match: '🔗',
          comprehensive: '📋',
          multiple: '✅'
        }[q.questionType] || '❓';
        
        console.log(`   ${typeEmoji} ${progress} ${q.content.substring(0, 40)}...`);
      } catch (error: any) {
        errorCount++;
        console.error(`   ❌ [${i + 1}] 导入失败: ${error.message}`);
      }
    }

    // 5. 最终验证
    console.log('\n' + '='.repeat(70));
    console.log('📊 导入统计:');
    console.log(`   ✅ 成功导入: ${successCount} 道`);
    console.log(`   ❌ 导入失败: ${errorCount} 道`);
    console.log(`   📝 总计: ${allQuestions.length} 道`);
    console.log('='.repeat(70) + '\n');

    // 6. 数据库验证
    const total = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024,
      },
    });

    const byType = await prisma.questions.groupBy({
      by: ['question_type'],
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024,
      },
      _count: true,
    });

    console.log('✨ 数据库验证结果:');
    console.log(`   总题目数: ${total} 道 ${total === 120 ? '✅' : '⚠️'}`);
    console.log('\n   各题型统计:');
    byType.forEach(item => {
      const typeName = {
        single: '最佳选择题',
        match: '配伍选择题',
        comprehensive: '综合分析题',
        multiple: '多项选择题'
      }[item.question_type] || item.question_type;
      console.log(`   - ${typeName}: ${item._count} 道`);
    });

    console.log('\n🎉 导入完成！\n');

    if (total === 120) {
      console.log('✅ 完美！数据库中现有完整的120道2024年中药综合真题！');
      console.log('🚀 现在可以访问前端查看效果了！\n');
    } else {
      console.log(`⚠️  注意：数据库中只有 ${total} 道题，还需要补充 ${120 - total} 道题\n`);
    }

  } catch (error) {
    console.error('❌ 导入失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
