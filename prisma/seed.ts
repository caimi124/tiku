import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始插入种子数据...');

  // 1. 创建测试用户
  console.log('创建用户...');
  
  const users = await Promise.all([
    // 管理员账号
    prisma.user.create({
      data: {
        email: 'admin@medexam.pro',
        username: '管理员',
        passwordHash: await bcrypt.hash('admin123456', 10),
        isVip: true,
        vipExpireDate: new Date('2030-12-31'),
      },
    }),
    // 普通用户
    prisma.user.create({
      data: {
        email: 'user1@example.com',
        username: '张医师',
        passwordHash: await bcrypt.hash('password123', 10),
        isVip: true,
        vipExpireDate: new Date('2025-12-31'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'user2@example.com',
        username: '李同学',
        passwordHash: await bcrypt.hash('password123', 10),
        isVip: true,
        vipExpireDate: new Date('2025-12-31'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'user3@example.com',
        username: '王老师',
        passwordHash: await bcrypt.hash('password123', 10),
        isVip: false,
      },
    }),
    prisma.user.create({
      data: {
        email: 'user4@example.com',
        username: '刘药师',
        passwordHash: await bcrypt.hash('password123', 10),
        isVip: false,
      },
    }),
  ]);

  console.log(`✓ 创建了 ${users.length} 个用户`);

  // 2. 创建题目数据
  console.log('创建题目...');

  const questions = [
    // 执业药师 - 药学专业知识一
    {
      examType: '执业药师',
      subject: '药学专业知识一',
      chapter: '抗生素',
      questionType: 'single',
      content: '青霉素类抗生素的作用机制是？',
      options: [
        { key: 'A', value: '抑制细菌细胞壁合成' },
        { key: 'B', value: '抑制蛋白质合成' },
        { key: 'C', value: '抑制DNA合成' },
        { key: 'D', value: '破坏细胞膜结构' },
      ],
      correctAnswer: 'A',
      explanation: '青霉素类抗生素通过抑制细菌细胞壁合成来发挥抗菌作用。细菌细胞壁的主要成分是肽聚糖，青霉素能够抑制转肽酶，阻止肽聚糖链的交联，导致细胞壁缺陷，细菌因渗透压变化而溶解死亡。这是β-内酰胺类抗生素的共同作用机制。',
      difficulty: 2,
      knowledgePoints: ['β-内酰胺类', '抗生素作用机制', '细菌细胞壁'],
      isPublished: true,
    },
    {
      examType: '执业药师',
      subject: '药学专业知识一',
      chapter: '抗生素',
      questionType: 'single',
      content: '以下哪种药物属于第三代头孢菌素？',
      options: [
        { key: 'A', value: '头孢唑林' },
        { key: 'B', value: '头孢呋辛' },
        { key: 'C', value: '头孢曲松' },
        { key: 'D', value: '头孢吡肟' },
      ],
      correctAnswer: 'C',
      explanation: '头孢曲松是第三代头孢菌素的代表药物。第一代头孢菌素（如头孢唑林）主要对革兰阳性菌有效；第二代头孢菌素（如头孢呋辛）对革兰阴性菌的作用增强；第三代头孢菌素（如头孢曲松）对革兰阴性菌的抗菌作用进一步增强，且部分品种可以透过血脑屏障；第四代头孢菌素（如头孢吡肟）抗菌谱更广。',
      difficulty: 3,
      knowledgePoints: ['头孢菌素', '抗生素分类'],
      isPublished: true,
    },
    {
      examType: '执业药师',
      subject: '药学专业知识二',
      chapter: '药物代谢动力学',
      questionType: 'single',
      content: '首过效应主要发生在哪种给药途径？',
      options: [
        { key: 'A', value: '静脉注射' },
        { key: 'B', value: '口服给药' },
        { key: 'C', value: '皮下注射' },
        { key: 'D', value: '肌肉注射' },
      ],
      correctAnswer: 'B',
      explanation: '首过效应（First-pass effect）主要发生在口服给药时。药物经胃肠道吸收后，首先通过门静脉进入肝脏，在肝脏中被代谢酶代谢，导致进入体循环的药物量减少，生物利用度降低。某些药物（如硝酸甘油、普萘洛尔）的首过效应很强，口服生物利用度很低，因此需要采用其他给药途径（如舌下含服、透皮贴剂）。静脉注射、皮下注射和肌肉注射均可避免首过效应。',
      difficulty: 2,
      knowledgePoints: ['首过效应', '药物代谢', '生物利用度'],
      isPublished: true,
    },
    {
      examType: '执业药师',
      subject: '药学专业知识二',
      chapter: '心血管系统药物',
      questionType: 'single',
      content: '阿司匹林的主要药理作用不包括？',
      options: [
        { key: 'A', value: '解热镇痛' },
        { key: 'B', value: '抗炎' },
        { key: 'C', value: '抗血小板聚集' },
        { key: 'D', value: '升高血压' },
      ],
      correctAnswer: 'D',
      explanation: '阿司匹林是一种非甾体抗炎药（NSAIDs），具有多种药理作用：1. 解热镇痛：抑制前列腺素合成，降低体温、缓解疼痛；2. 抗炎：减轻炎症反应；3. 抗血小板聚集：不可逆地抑制环氧化酶-1（COX-1），减少血栓素A2的生成，用于预防心脑血管疾病。阿司匹林不具有升高血压的作用，相反，长期使用可能对血压有轻微的降低作用。',
      difficulty: 2,
      knowledgePoints: ['阿司匹林', '解热镇痛药', '抗血小板'],
      isPublished: true,
    },
    {
      examType: '执业药师',
      subject: '药学综合知识与技能',
      chapter: '用药教育与咨询',
      questionType: 'single',
      content: '患者服用华法林期间，应避免大量摄入哪类食物？',
      options: [
        { key: 'A', value: '高蛋白食物' },
        { key: 'B', value: '富含维生素K的食物' },
        { key: 'C', value: '高糖食物' },
        { key: 'D', value: '高脂肪食物' },
      ],
      correctAnswer: 'B',
      explanation: '华法林是一种口服抗凝药，通过抑制维生素K依赖的凝血因子（II、VII、IX、X）发挥抗凝作用。维生素K是这些凝血因子合成的必需物质，如果患者大量摄入富含维生素K的食物（如菠菜、西兰花、卷心菜、动物肝脏等），会降低华法林的抗凝效果。因此，服用华法林的患者应保持维生素K摄入的稳定，避免大量或突然改变摄入量，同时需要定期监测INR（国际标准化比值）。',
      difficulty: 3,
      knowledgePoints: ['华法林', '药物相互作用', '用药教育'],
      isPublished: true,
    },

    // 药学职称
    {
      examType: '药学职称',
      subject: '基础知识',
      chapter: '药物化学',
      questionType: 'single',
      content: '药物的化学结构中，哪个基团是亲水性的？',
      options: [
        { key: 'A', value: '羟基' },
        { key: 'B', value: '苯环' },
        { key: 'C', value: '烷基' },
        { key: 'D', value: '长链脂肪酸' },
      ],
      correctAnswer: 'A',
      explanation: '羟基（-OH）是极性基团，具有亲水性。它可以与水分子形成氢键，增加药物的水溶性。相反，苯环、烷基和长链脂肪酸都是疏水性基团，增加药物的脂溶性。药物的水溶性和脂溶性是影响其吸收、分布、代谢和排泄的重要因素。一般来说，药物需要有适当的脂溶性以穿透生物膜，也需要一定的水溶性以在体液中溶解和转运。',
      difficulty: 2,
      knowledgePoints: ['药物化学', '亲水性', '极性基团'],
      isPublished: true,
    },
    {
      examType: '药学职称',
      subject: '专业知识',
      chapter: '药物分析',
      questionType: 'single',
      content: '高效液相色谱法（HPLC）最常用的检测器是？',
      options: [
        { key: 'A', value: '紫外检测器' },
        { key: 'B', value: '荧光检测器' },
        { key: 'C', value: '示差折光检测器' },
        { key: 'D', value: '电化学检测器' },
      ],
      correctAnswer: 'A',
      explanation: '紫外检测器（UV detector）是高效液相色谱法最常用的检测器。它利用物质对紫外光的吸收特性进行检测，具有灵敏度高、线性范围宽、响应快、适用范围广等优点。大多数药物都含有共轭系统或芳香环，对紫外光有吸收，因此紫外检测器适用于大多数药物的分析。常用的检测波长包括254nm、280nm等。其他检测器如荧光检测器、示差折光检测器和电化学检测器虽然也有应用，但使用范围相对较窄。',
      difficulty: 3,
      knowledgePoints: ['高效液相色谱', '检测器', '药物分析'],
      isPublished: true,
    },

    // 中医执业医师
    {
      examType: '中医执业医师',
      subject: '中医基础理论',
      chapter: '阴阳学说',
      questionType: 'single',
      content: '根据阴阳学说，下列哪项属于阳的范畴？',
      options: [
        { key: 'A', value: '寒' },
        { key: 'B', value: '静' },
        { key: 'C', value: '热' },
        { key: 'D', value: '暗' },
      ],
      correctAnswer: 'C',
      explanation: '在中医阴阳学说中，阳具有温热、明亮、向上、外在、动态等属性；阴具有寒凉、晦暗、向下、内在、静止等属性。因此，热属于阳的范畴，而寒、静、暗都属于阴的范畴。阴阳学说是中医理论的基础，用于解释人体的生理功能、病理变化，指导疾病的诊断和治疗。',
      difficulty: 1,
      knowledgePoints: ['阴阳学说', '中医基础理论'],
      isPublished: true,
    },
    {
      examType: '中医执业医师',
      subject: '中药学',
      chapter: '解表药',
      questionType: 'single',
      content: '麻黄的主要功效是？',
      options: [
        { key: 'A', value: '发汗解表，宣肺平喘' },
        { key: 'B', value: '清热解毒，凉血止血' },
        { key: 'C', value: '活血化瘀，行气止痛' },
        { key: 'D', value: '补气健脾，养血安神' },
      ],
      correctAnswer: 'A',
      explanation: '麻黄是常用的解表药，性温味辛，归肺、膀胱经。其主要功效是发汗解表、宣肺平喘、利水消肿。临床上常用于治疗：1. 风寒表实证（恶寒发热、无汗、头痛身痛等）；2. 肺气不宣的咳喘证（咳嗽气喘、痰多等）；3. 水肿证（小便不利、水肿等）。麻黄含有麻黄碱，具有兴奋中枢、收缩血管、舒张支气管等作用。需要注意的是，麻黄辛温发散，体虚多汗、心悸失眠者慎用。',
      difficulty: 2,
      knowledgePoints: ['麻黄', '解表药', '中药功效'],
      isPublished: true,
    },

    // 中药师
    {
      examType: '中药师',
      subject: '中药学专业知识一',
      chapter: '中药炮制',
      questionType: 'single',
      content: '生地黄炮制成熟地黄的主要目的是？',
      options: [
        { key: 'A', value: '增强清热凉血作用' },
        { key: 'B', value: '增强滋阴补血作用' },
        { key: 'C', value: '降低毒性' },
        { key: 'D', value: '便于保存' },
      ],
      correctAnswer: 'B',
      explanation: '生地黄经过九蒸九晒等炮制工艺后，成为熟地黄。这一炮制过程改变了药物的性味和功效：生地黄性寒味甘苦，功能清热凉血、养阴生津；熟地黄性微温味甘，功能滋阴补血、益精填髓。炮制后，寒性减弱，滋补作用增强，更适合用于血虚证、精髓不足证等。这体现了中药炮制"制其偏性，增强疗效"的原则。临床上，生地黄用于血热证、阴虚内热证；熟地黄用于血虚萎黄、肝肾阴虚、遗精等。',
      difficulty: 3,
      knowledgePoints: ['中药炮制', '生地黄', '熟地黄', '炮制目的'],
      isPublished: true,
    },

    // 更多题目...（为了示例，这里创建10道题）
  ];

  const createdQuestions = await prisma.question.createMany({
    data: questions,
  });

  console.log(`✓ 创建了 ${createdQuestions.count} 道题目`);

  // 3. 创建一些答题记录
  console.log('创建答题记录...');

  const allQuestions = await prisma.question.findMany({
    take: 10,
  });

  const answers = [];
  for (let i = 0; i < 30; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];
    const isCorrect = Math.random() > 0.3; // 70%正确率

    answers.push({
      userId: randomUser.id,
      questionId: randomQuestion.id,
      userAnswer: isCorrect ? randomQuestion.correctAnswer : 'B',
      isCorrect: isCorrect,
      timeSpent: Math.floor(Math.random() * 120) + 30, // 30-150秒
    });
  }

  await prisma.userAnswer.createMany({
    data: answers,
  });

  console.log(`✓ 创建了 ${answers.length} 条答题记录`);

  // 4. 创建错题记录
  console.log('创建错题记录...');

  const wrongAnswers = answers.filter((a) => !a.isCorrect).slice(0, 10);
  const wrongQuestions = wrongAnswers.map((wa) => ({
    userId: wa.userId,
    questionId: wa.questionId,
    wrongCount: Math.floor(Math.random() * 3) + 1,
    lastWrongAt: new Date(),
  }));

  await prisma.wrongQuestion.createMany({
    data: wrongQuestions,
  });

  console.log(`✓ 创建了 ${wrongQuestions.length} 条错题记录`);

  // 5. 创建收藏记录
  console.log('创建收藏记录...');

  const favorites = [];
  for (let i = 0; i < 5; i++) {
    const randomUser = users[1]; // 使用第二个用户
    const randomQuestion = allQuestions[i];

    favorites.push({
      userId: randomUser.id,
      questionId: randomQuestion.id,
    });
  }

  await prisma.favorite.createMany({
    data: favorites,
  });

  console.log(`✓ 创建了 ${favorites.length} 条收藏记录`);

  // 6. 创建学习记录
  console.log('创建学习记录...');

  const sessions = [];
  for (let i = 0; i < 5; i++) {
    const randomUser = users[1];
    const questionsCount = Math.floor(Math.random() * 30) + 10;
    const correctCount = Math.floor(questionsCount * (0.6 + Math.random() * 0.3));

    sessions.push({
      userId: randomUser.id,
      examType: '执业药师',
      questionsCount: questionsCount,
      correctCount: correctCount,
      timeSpent: questionsCount * 60 + Math.floor(Math.random() * 600),
      startedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      endedAt: new Date(),
    });
  }

  await prisma.studySession.createMany({
    data: sessions,
  });

  console.log(`✓ 创建了 ${sessions.length} 条学习记录`);

  console.log('\n✅ 种子数据插入完成！');
  console.log('\n📊 数据统计：');
  console.log(`   - 用户：${users.length} 个`);
  console.log(`   - 题目：${createdQuestions.count} 道`);
  console.log(`   - 答题记录：${answers.length} 条`);
  console.log(`   - 错题记录：${wrongQuestions.length} 条`);
  console.log(`   - 收藏记录：${favorites.length} 条`);
  console.log(`   - 学习记录：${sessions.length} 条`);
  console.log('\n🔐 测试账号：');
  console.log('   管理员：admin@medexam.pro / admin123456');
  console.log('   用户1：user1@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ 错误：', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

