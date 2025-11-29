import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 定义案例背景
const cases = {
  case1: {
    title: '案例(一)',
    content: '患者，女，27岁，孕32周，4天前受凉后开始持续发热，体温最高达39.5℃，伴咽痛、声音嘶哑。查体：扁桃体Ⅲ度肿大，咽部表面有脓点。患者否认药物过敏史。',
    questions: [91, 92]
  },
  case2: {
    title: '案例(二)',
    content: '患者，男，56岁，咳嗽、咳痰、发热1月余。查体：T37.3℃，P99次/分，R22次/分，BP123/85mmHg，身高160cm。体重50kg，双肺未闻及明显干湿啰音。检查结果：WBC8.06x10⁹/L,N%76.70%，CRP49.06mg/L;肝肾功能正常。肺部CT示：右肺上叶散在斑片和渗出影，痰涂片可见结核分枝杆菌，诊断为肺结核。',
    questions: [93, 94, 95]
  },
  case3: {
    title: '案例(三)',
    content: '患者，男，69岁，诊断为痛风、冠心病、高血压。查体：BP130/80mmHg;检查结果：血肌酐180umol/L，血尿酸594μmol/L。低密度脂蛋白胆固醇3.14mmol/L。目前服用的药品如下：硫酸氢氯吡格雷片75mg qd,氢氯噻嗪片25mg qd,非洛地平缓释片5mg qd,琥珀酸美托洛尔缓释片47.5mg qd,单硝酸异山梨酯片20mg bid,辛伐他汀片20mg qn。',
    questions: [96, 97, 98, 99]
  },
  case4: {
    title: '案例(四)',
    content: '患者，女，65岁，身高160cm,体重58kg。高血压病10年，1年前开始出现腰部酸痛。乏力、食欲减退、夜尿增多。近一周出现尿量少，双下肢、双手及面部水肿。检查结果：红细胞2.5x10¹²/L,血红蛋白68g/L,血肌酐 1360μmol/L,血磷明显升高；尿蛋白(++++)。诊断为高血压，肾功能衰竭、肾性贫血、肾性骨病。开始规律血液透析并给予：硝苯地平控释片60mg qd po,呋塞米片20mg bid po,骨化三醇胶丸0.25ug qd po,碳酸钙咀嚼片500mg tid po,重组人促红素注射液10000IU每周2次i.h。',
    questions: [100, 101]
  },
  case5: {
    title: '案例(五)',
    content: '患者，男，42岁，BMI22.1kg/m²，既往有高血压、2型糖尿病、高脂血症。近日血压控制不佳，查体：BP150/100mmHg。检查结果：糖化血红蛋白6.5%，低密度脂蛋白胆固醇3.0mmol/L,肝肾功能正常。患者长期规律使用硝苯地平控释片30mg qd,伏格列波糖片0.2mg tid,甘精胰岛素注射液100 gm,阿托伐他汀钠片40mg qd;间断服用多维元素片、褪黑素片。',
    questions: [102, 103, 104, 105]
  },
  case6: {
    title: '案例(六)',
    content: '患者，女，61岁，体检发现重度骨质疏松，既往患有食管裂孔疝、高血压、2型糖尿病。长期服用奥美拉唑肠溶片、厄贝沙坦氢氯噻嗪片、氨氯地平片、阿卡波糖片、阿司匹林肠溶片。检查结果：肝肾功能正常。',
    questions: [106, 107, 108]
  },
  case7: {
    title: '案例(七)',
    content: '患者，男，30岁，近日出现阵发性打喷嚏、流涕（清水样）、鼻塞以及眼、鼻和臀部瘙痒症状，鼻部呼吸不畅影响睡眠。',
    questions: [109, 110]
  }
};

async function updateCases() {
  console.log('\n🔄 开始更新2022年西药综合案例背景\n');
  console.log('='.repeat(60));

  // 1. 获取所有综合分析题
  const allQuestions = await prisma.questions.findMany({
    where: {
      source_year: 2022,
      subject: '药学综合知识与技能',
      chapter: '三、综合分析题'
    },
    orderBy: {
      created_at: 'asc'
    }
  });

  console.log(`✅ 找到 ${allQuestions.length} 道综合分析题\n`);

  let updateCount = 0;
  const caseEntries = Object.entries(cases);

  for (const [caseName, caseData] of caseEntries) {
    console.log(`\n📝 处理${caseData.title} (题${caseData.questions.join(', ')})`);
    console.log(`   案例内容: ${caseData.content.substring(0, 50)}...`);

    for (let i = 0; i < caseData.questions.length; i++) {
      const questionNumber = caseData.questions[i];
      const questionIndex = questionNumber - 91; // 综合分析题从91开始
      
      if (questionIndex < 0 || questionIndex >= allQuestions.length) {
        console.log(`   ⚠️  题${questionNumber}超出范围，跳过`);
        continue;
      }

      const question = allQuestions[questionIndex];
      let newContent = question.content;

      // 移除旧的警告标记
      if (newContent.includes('【⚠️ 案例背景可能缺失】')) {
        newContent = newContent.replace(/【⚠️ 案例背景可能缺失】本题组可能需要患者案例背景，但数据源中未找到。\n\n/g, '');
      }

      // 如果是该案例的第一题，添加完整案例
      if (i === 0) {
        newContent = `${caseData.title}\n\n${caseData.content}\n\n${newContent}`;
        console.log(`   ✅ 题${questionNumber}: 添加完整案例（第一题）`);
      } else {
        // 后续题目只移除警告，不添加案例（因为案例在第一题）
        console.log(`   ✅ 题${questionNumber}: 移除警告标记`);
      }

      // 更新数据库
      try {
        await prisma.questions.update({
          where: { id: question.id },
          data: { content: newContent }
        });
        updateCount++;
      } catch (error) {
        console.error(`   ❌ 题${questionNumber}更新失败:`, error);
      }
    }
  }

  // 3. 验证更新结果
  console.log('\n' + '='.repeat(60));
  console.log('📊 更新统计');
  console.log('='.repeat(60));
  console.log(`✅ 成功更新: ${updateCount}/20 道综合分析题`);

  // 4. 抽查几道题
  console.log('\n📋 抽查更新后的题目:\n');

  const updatedQuestions = await prisma.questions.findMany({
    where: {
      source_year: 2022,
      subject: '药学综合知识与技能',
      chapter: '三、综合分析题'
    },
    orderBy: {
      created_at: 'asc'
    }
  });

  // 抽查每个案例的第一题
  const samplesToCheck = [
    { number: 91, case: '案例(一)' },
    { number: 93, case: '案例(二)' },
    { number: 96, case: '案例(三)' },
    { number: 100, case: '案例(四)' }
  ];

  for (const sample of samplesToCheck) {
    const q = updatedQuestions[sample.number - 91];
    console.log(`题${sample.number} [${sample.case}]:`);
    console.log(`   内容长度: ${q.content.length}字符`);
    console.log(`   包含案例标题: ${q.content.includes(sample.case) ? '✅' : '❌'}`);
    console.log(`   包含警告标记: ${q.content.includes('【⚠️') ? '❌ 仍有警告' : '✅ 已移除'}`);
    console.log(`   内容预览: ${q.content.substring(0, 80)}...\n`);
  }

  console.log('='.repeat(60));
  console.log('✨ 案例背景更新完成！\n');
  console.log('📋 下一步：');
  console.log('1. 在浏览器中测试综合分析题显示');
  console.log('2. 验证案例背景显示完整');
  console.log('3. 检查题目连贯性\n');
}

updateCases()
  .catch((e) => {
    console.error('❌ 更新失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
