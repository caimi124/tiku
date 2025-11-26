import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 第二批需要更新的题目数据
const updatedQuestions = [
  // 一、最佳选择题
  {
    number: 5,
    correctAnswer: 'D',
    explanation: '荤麦——龋齿牙痛。'
  },
  
  // 二、配伍选择题 44-100
  {
    number: 44,
    correctAnswer: 'E',
    explanation: '通宣理肺丸—风寒束表、肺气不宣感冒咳嗽，症见发热、恶寒、咳嗽、鼻塞流涕、头痛、无汗、肢体酸痛。'
  },
  {
    number: 45,
    correctAnswer: 'A',
    explanation: '镰石滚痰丸—痰火扰心所致的癫狂惊悸，或喘咳痰稠、大便秘结。'
  },
  {
    number: 46,
    correctAnswer: 'E',
    explanation: '乳糖消积丸—软坚散结，活血消痈，清热解毒。'
  },
  {
    number: 47,
    correctAnswer: 'C',
    explanation: '小金丸—散结消肿，化瘀止痛。'
  },
  {
    number: 48,
    correctAnswer: 'B',
    explanation: '内消瘰疬丸—化痰，软坚，散结。'
  },
  {
    number: 49,
    correctAnswer: 'A',
    explanation: '桑寄生—祛风湿，强筋骨，又能安胎。'
  },
  {
    number: 50,
    correctAnswer: 'B',
    explanation: '臭梧桐—祛风湿，通经络，又能降血压。'
  },
  {
    number: 51,
    correctAnswer: 'C',
    explanation: '鹿衔草—祛风湿，强筋骨，又能调经止血。'
  },
  {
    number: 55,
    correctAnswer: 'A',
    explanation: '苏合香丸—芳香开窍、行气止痛。'
  },
  {
    number: 56,
    correctAnswer: 'D',
    explanation: '万氏牛黄清心丸——清热解毒，镇惊安神。'
  },
  {
    number: 57,
    correctAnswer: 'C',
    explanation: '硫磺配大黄——治疗酒糟鼻、粉刺。'
  },
  {
    number: 58,
    correctAnswer: 'A',
    explanation: '雄黄配白矾——湿疹、疥癣瘙痒。'
  },
  {
    number: 59,
    correctAnswer: 'A',
    explanation: '吴茱萸——中寒肝逆，头痛、吐涎沫，经寒痛经。'
  },
  {
    number: 60,
    correctAnswer: 'B',
    explanation: '肉桂——下元虚冷，虚阳上浮之上热下寒证。'
  },
  {
    number: 61,
    correctAnswer: 'E',
    explanation: '木贼——疏散风热、止血、明目退翳。'
  },
  {
    number: 63,
    correctAnswer: 'D',
    explanation: '穿山甲—活血散瘀，消肿排脓。'
  },
  {
    number: 64,
    correctAnswer: 'B',
    explanation: '土鳖虫—破血逐瘀，续筋接骨。'
  },
  {
    number: 65,
    correctAnswer: 'A',
    explanation: '土荆皮—外用杀虫、疗癣、止痛，治体癣、手足癣、头痛。'
  },
  {
    number: 66,
    correctAnswer: 'E',
    explanation: '轻粉——外用杀虫、攻毒敛疮，治疗癣、梅毒、疮疡溃烂。'
  },
  {
    number: 67,
    correctAnswer: 'C',
    explanation: '柿蒂—主治呃逆。'
  },
  {
    number: 68,
    correctAnswer: 'E',
    explanation: '梅花——主治胸胁胃脘胀痛。'
  },
  {
    number: 69,
    correctAnswer: 'D',
    explanation: '橘红——主治湿阻中焦。'
  },
  {
    number: 73,
    correctAnswer: 'A',
    explanation: '启脾丸——消食化滞，健脾和胃，主治消化不良，食少、便秘、脘腹胀满，面黄肌瘦。'
  },
  {
    number: 78,
    correctAnswer: 'B',
    explanation: '强力枇杷胶囊—清热化痰，敛肺止咳。'
  },
  {
    number: 79,
    correctAnswer: 'D',
    explanation: '解肌宁嗽丸—解表宣肺，止咳化痰。'
  },
  {
    number: 80,
    correctAnswer: 'A',
    explanation: '急支糖浆—清热化痰，宣肺止咳。'
  },
  {
    number: 81,
    correctAnswer: 'C',
    explanation: '十全大补丸—温补气血。'
  },
  {
    number: 82,
    correctAnswer: 'B',
    explanation: '健脾生血颗粒—益气补血，健脾宁心。'
  },
  {
    number: 84,
    correctAnswer: 'C',
    explanation: '萆薢——除下焦之湿而分清祛浊，为治膏淋要药。'
  },
  {
    number: 85,
    correctAnswer: 'A',
    explanation: '地肤子——利尿通淋、祛风止痒，为治热淋及风疹、湿疹要药。'
  },
  {
    number: 86,
    correctAnswer: 'B',
    explanation: '海金沙——善通淋、止痛，为治淋证涩痛要药。'
  },
  {
    number: 87,
    correctAnswer: 'A',
    explanation: '紫菀—化痰，润肺下气。'
  },
  {
    number: 88,
    correctAnswer: 'D',
    explanation: '竹茹—化痰，又能除烦止呕。'
  },
  {
    number: 89,
    correctAnswer: 'E',
    explanation: '补骨脂—固精缩尿，纳气平喘。'
  },
  {
    number: 90,
    correctAnswer: 'A',
    explanation: '菟丝子—固精缩尿，明目止泻。'
  },
  {
    number: 91,
    correctAnswer: 'D',
    explanation: '骨碎补—止痛续伤，补肾活血。'
  },
  
  // 三、综合分析题 92-110
  {
    number: 92,
    correctAnswer: 'C',
    explanation: '开胃健脾丸——脾胃虚弱，中气不和所致的泄泻、痞满，症见食欲不振、嗳气吞酸、腹胀泄泻；消化不良见上述证候者。'
  },
  {
    number: 93,
    correctAnswer: 'A',
    explanation: '胃苏颗粒—气滞型胃脘痛，症见胃脘胀痛，窜及胁肋，遇嗳气舒缓，情绪郁怒则加重，胸闷食少，排便不畅。'
  },
  {
    number: 94,
    correctAnswer: 'D',
    explanation: '木香顺气丸—湿滞脾胃证，症见胸膈痞闷，脘腹胀痛，恶心呕吐，嗳气纳呆。'
  },
  {
    number: 95,
    correctAnswer: 'A',
    explanation: '云南白药片—跌打损伤，瘀血肿痛，吐血，咳血，便血，痔血，崩漏下血，疮疡肿毒及软组织挫伤，闭合性骨折，支气管扩张及肺结核咳血，溃疡病出血。'
  },
  {
    number: 96,
    correctAnswer: 'A',
    explanation: '云南白药片—可治皮肤感染性疾病。'
  },
  {
    number: 97,
    correctAnswer: 'C',
    explanation: '黄氏响声丸—风热外束，痰热内盛所致的急、慢性喉痹。'
  },
  {
    number: 98,
    correctAnswer: 'D',
    explanation: '复方鱼腥草片—外感风热所致的急喉痹。'
  },
  {
    number: 99,
    correctAnswer: 'A',
    explanation: '缩泉丸——药物组成包括山药、益智仁、乌药。'
  },
  {
    number: 100,
    correctAnswer: 'D',
    explanation: '金锁固精丸——药物组成包括沙苑子（炒）、芡实、莲子、莲须、煅龙骨、煅牡蛎。'
  },
  {
    number: 101,
    correctAnswer: 'C',
    explanation: '黄芩、薄荷——均不具有清心火功效。'
  },
  {
    number: 102,
    correctAnswer: 'C',
    explanation: '导赤丸—清热泻火、利尿通便。'
  },
  {
    number: 103,
    correctAnswer: 'D',
    explanation: '导赤丸使用注意：脾虚便溏者慎用。'
  },
  {
    number: 104,
    correctAnswer: 'D',
    explanation: '桑叶—疏散风热、清肺。'
  },
  {
    number: 105,
    correctAnswer: 'B',
    explanation: '瓜蒌—清肺润肺，化痰，润肠通便。'
  },
  {
    number: 106,
    correctAnswer: 'A',
    explanation: '旋覆花——消痰行水，降气止呕。'
  },
  {
    number: 107,
    correctAnswer: 'C',
    explanation: '赭石——与旋覆花配伍，增强降肺、胃逆气之功效。'
  },
  {
    number: 108,
    correctAnswer: 'C',
    explanation: '安坤颗粒组方中的佐药是白术、茯苓。'
  },
  {
    number: 109,
    correctAnswer: 'A',
    explanation: '人参归脾丸—益气补血，健脾宁心。'
  },
  {
    number: 110,
    correctAnswer: 'B',
    explanation: '龙眼肉—易助热生火，内有实火、痰热、湿热者忌服。'
  }
];

async function main() {
  console.log('\n🔧 开始第二批答案更新（共' + updatedQuestions.length + '道题）\n');

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
  console.log('📊 第二批更新统计');
  console.log('='.repeat(60));
  console.log(`✅ 成功: ${successCount} 道题`);
  console.log(`❌ 失败: ${errorCount} 道题`);
  console.log(`📝 总计: ${updatedQuestions.length} 道题`);
  console.log('='.repeat(60) + '\n');

  // 统计空答案剩余数量
  const allQuestions = await prisma.questions.findMany({
    where: {
      source_year: 2024,
      subject: '中药学专业知识（二）'
    },
    orderBy: { created_at: 'asc' }
  });

  const emptyCount = allQuestions.filter(q => !q.correct_answer || q.correct_answer.trim() === '').length;
  const totalUpdated = 9 + successCount; // 第一批9道 + 第二批

  console.log('📈 整体进度统计\n');
  console.log(`✅ 已补充答案: ${120 - emptyCount} 道题`);
  console.log(`⚠️  剩余空答案: ${emptyCount} 道题`);
  console.log(`📊 完成进度: ${Math.round((120 - emptyCount) / 120 * 100)}%`);
  console.log(`🎯 累计更新: ${totalUpdated} 道题（两批合计）\n`);

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
