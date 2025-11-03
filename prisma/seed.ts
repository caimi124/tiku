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

  // 7. 创建培训机构
  console.log('创建培训机构...');

  const institutions = await Promise.all([
    prisma.institution.create({
      data: {
        name: '医学教育网',
        description: '国内领先的医学远程教育基地，专注医药卫生类考试培训20年',
        foundedYear: 2003,
        website: 'https://www.med66.com',
        overallRating: 4.8,
        priceRating: 4.5,
        hitRateRating: 4.9,
        serviceRating: 4.7,
        reviewCount: 3280,
        courseCount: 156,
        materialCount: 89,
        studentCount: 120000,
        isVerified: true,
        isPremium: true,
        tags: ['名师授课', '高通过率', '全程督学', '24小时答疑'],
        examTypes: ['执业药师', '护士资格', '药学职称', '中医执业医师'],
      },
    }),
    prisma.institution.create({
      data: {
        name: '环球网校',
        description: '职业教育行业知名品牌，医药类考试培训经验丰富',
        foundedYear: 2001,
        website: 'https://www.hqwx.com',
        overallRating: 4.6,
        priceRating: 4.8,
        hitRateRating: 4.5,
        serviceRating: 4.6,
        reviewCount: 2150,
        courseCount: 128,
        materialCount: 76,
        studentCount: 85000,
        isVerified: true,
        isPremium: true,
        tags: ['性价比高', '课程丰富', '服务完善'],
        examTypes: ['执业药师', '护士资格', '药学职称'],
      },
    }),
    prisma.institution.create({
      data: {
        name: '润德教育',
        description: '专注执业药师培训，通过率业内领先',
        foundedYear: 2008,
        website: 'https://www.rundeedu.com',
        overallRating: 4.7,
        priceRating: 4.4,
        hitRateRating: 4.8,
        serviceRating: 4.6,
        reviewCount: 2420,
        courseCount: 64,
        materialCount: 52,
        studentCount: 78000,
        isVerified: true,
        isPremium: true,
        tags: ['执业药师专家', '高通过率', '针对性强'],
        examTypes: ['执业药师', '药学职称'],
      },
    }),
  ]);

  console.log(`✓ 创建了 ${institutions.length} 个培训机构`);

  // 8. 创建学习资料
  console.log('创建学习资料...');

  const materials = await Promise.all([
    prisma.material.create({
      data: {
        institutionId: institutions[0].id,
        name: '2024执业药师核心考点精编',
        type: 'PDF讲义',
        examType: '执业药师',
        subject: '药学综合',
        year: 2024,
        description: '涵盖所有高频考点，浓缩精华内容，适合冲刺复习',
        price: 0,
        hitRate: 88.5,
        coverageRate: 92.3,
        accuracyScore: 4.8,
        downloadCount: 15230,
        viewCount: 28500,
        rating: 4.8,
        reviewCount: 486,
        pageCount: 256,
        isActive: true,
        isFeatured: true,
        isPremium: false,
      },
    }),
    prisma.material.create({
      data: {
        institutionId: institutions[1].id,
        name: '执业药师历年真题详解（2019-2023）',
        type: '真题集',
        examType: '执业药师',
        subject: '全科',
        year: 2023,
        description: '5年真题完整收录，每题配详细解析和考点标注',
        price: 98,
        hitRate: 95.2,
        coverageRate: 98.5,
        accuracyScore: 4.9,
        downloadCount: 12850,
        viewCount: 21400,
        rating: 4.9,
        reviewCount: 623,
        pageCount: 428,
        isActive: true,
        isFeatured: true,
        isPremium: true,
      },
    }),
    prisma.material.create({
      data: {
        institutionId: institutions[0].id,
        name: '2024护士资格考前押题包',
        type: '押题',
        examType: '护士资格',
        subject: '全科',
        year: 2024,
        description: 'AI智能预测，精选300道高频题，历年命中率92%',
        price: 198,
        hitRate: 92.0,
        coverageRate: 85.6,
        accuracyScore: 4.7,
        downloadCount: 8960,
        viewCount: 15200,
        rating: 4.7,
        reviewCount: 324,
        pageCount: 180,
        isActive: true,
        isFeatured: true,
        isPremium: true,
      },
    }),
  ]);

  console.log(`✓ 创建了 ${materials.length} 个学习资料`);

  // 9. 创建押题包
  console.log('创建押题包...');

  const predictionPackages = await Promise.all([
    prisma.predictionPackage.create({
      data: {
        name: '2024执业药师考前冲刺押题包',
        examType: '执业药师',
        subject: '全科',
        year: 2024,
        description: 'AI智能分析历年考题规律，精准预测2024年高频考点',
        price: 398,
        discountPrice: 198,
        questionCount: 500,
        questionIds: [], // 实际应关联题目ID
        hitRate: 92.5,
        confidenceScore: 95,
        features: ['AI智能预测', '名师精选', '真题同源', '考前密训', '命中率保障'],
        purchaseCount: 12580,
        viewCount: 28400,
        rating: 4.9,
        reviewCount: 1246,
        isActive: true,
        isFeatured: true,
      },
    }),
    prisma.predictionPackage.create({
      data: {
        name: '护士资格终极押题300题',
        examType: '护士资格',
        subject: '全科',
        year: 2024,
        description: '历年押题命中率90%+，覆盖所有核心考点',
        price: 298,
        discountPrice: 148,
        questionCount: 300,
        questionIds: [],
        hitRate: 90.2,
        confidenceScore: 92,
        features: ['高频考点', '精准预测', '快速提分', '考前必刷'],
        purchaseCount: 8960,
        viewCount: 16800,
        rating: 4.8,
        reviewCount: 876,
        isActive: true,
        isFeatured: true,
      },
    }),
  ]);

  console.log(`✓ 创建了 ${predictionPackages.length} 个押题包`);

  // 10. 创建评价
  console.log('创建评价...');

  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: users[1].id,
        targetType: 'institution',
        targetId: institutions[0].id,
        institutionId: institutions[0].id,
        overallRating: 5,
        priceRating: 4.5,
        contentRating: 5,
        serviceRating: 4.5,
        title: '非常专业的培训机构',
        content: '老师讲得非常详细，重点突出，押题也很准确。我是零基础，跟着课程学习，一次通过了执业药师考试。客服态度也很好，有问必答。强烈推荐！',
        tags: ['通过考试', '老师专业', '服务好'],
        examType: '执业药师',
        passedExam: true,
        helpfulCount: 128,
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: users[2].id,
        targetType: 'material',
        targetId: materials[0].id,
        materialId: materials[0].id,
        overallRating: 4.5,
        priceRating: 5,
        contentRating: 4.5,
        title: '性价比很高的资料',
        content: '资料整理得很系统，重点突出，而且是免费的！对于预算有限的考生来说非常友好。配合课程使用效果更好。',
        tags: ['免费', '重点突出', '系统全面'],
        examType: '执业药师',
        helpfulCount: 86,
        isVerified: false,
      },
    }),
  ]);

  console.log(`✓ 创建了 ${reviews.length} 条评价`);

  // 11. 创建UGC内容
  console.log('创建UGC内容...');

  const userContents = await Promise.all([
    prisma.userContent.create({
      data: {
        userId: users[1].id,
        contentType: 'experience',
        title: '零基础一次通过执业药师，我的备考经验分享',
        content: '大家好！我是一名零基础考生，今年一次性通过了执业药师考试，想和大家分享一下我的备考经验。首先，要制定合理的学习计划，我是从6个月前开始准备的。第一阶段（2个月）：系统学习教材，跟着网课过一遍。第二阶段（2个月）：做题巩固，重点突破薄弱环节。第三阶段（2个月）：冲刺复习，背诵考点，做押题。其次，要选择适合自己的培训机构和资料...',
        tags: ['零基础', '通关经验', '备考计划', '学习方法'],
        examType: '执业药师',
        viewCount: 12850,
        likeCount: 2340,
        commentCount: 186,
        isPinned: true,
        isFeatured: true,
        isPublished: true,
      },
    }),
    prisma.userContent.create({
      data: {
        userId: users[2].id,
        contentType: 'note',
        title: '护理学基础知识点总结（超详细）',
        content: '整理了三个月的笔记，覆盖所有重点章节，希望对大家有帮助。包括：基础护理技术、内科护理、外科护理、妇产科护理等。每个章节都有详细的知识点梳理和重点标注...',
        tags: ['知识点总结', '笔记分享', '护理学基础'],
        examType: '护士资格',
        subject: '基础护理学',
        viewCount: 8960,
        likeCount: 1520,
        commentCount: 94,
        isFeatured: true,
        isPublished: true,
      },
    }),
  ]);

  console.log(`✓ 创建了 ${userContents.length} 条UGC内容`);

  // 12. 创建评论
  console.log('创建评论...');

  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        userId: users[3].id,
        contentId: userContents[0].id,
        content: '非常感谢分享！你的经验对我很有帮助，我也是零基础，正在备考中。',
        likeCount: 24,
      },
    }),
    prisma.comment.create({
      data: {
        userId: users[4].id,
        contentId: userContents[0].id,
        content: '请问你报的是哪个培训机构？推荐一下呗',
        likeCount: 18,
      },
    }),
  ]);

  console.log(`✓ 创建了 ${comments.length} 条评论`);

  console.log('\n✅ 种子数据插入完成！');
  console.log('\n📊 数据统计：');
  console.log(`   - 用户：${users.length} 个`);
  console.log(`   - 题目：${createdQuestions.count} 道`);
  console.log(`   - 答题记录：${answers.length} 条`);
  console.log(`   - 错题记录：${wrongQuestions.length} 条`);
  console.log(`   - 收藏记录：${favorites.length} 条`);
  console.log(`   - 学习记录：${sessions.length} 条`);
  console.log(`   - 培训机构：${institutions.length} 个`);
  console.log(`   - 学习资料：${materials.length} 个`);
  console.log(`   - 押题包：${predictionPackages.length} 个`);
  console.log(`   - 评价：${reviews.length} 条`);
  console.log(`   - UGC内容：${userContents.length} 条`);
  console.log(`   - 评论：${comments.length} 条`);
  console.log('\n🔐 测试账号：');
  console.log('   管理员：admin@medexam.pro / admin123456');
  console.log('   用户1：user1@example.com / password123');
  console.log('\n💡 提示：运行 `npm run db:push` 推送数据库架构');
  console.log('   然后运行 `npx prisma db seed` 插入种子数据');
}

main()
  .catch((e) => {
    console.error('❌ 错误：', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

