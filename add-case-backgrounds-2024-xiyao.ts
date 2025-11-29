import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 完整的案例背景数据
const caseBackgrounds: Record<string, { questionNums: number[], background: string }> = {
  case1: {
    questionNums: [91, 92],
    background: '案例：（一）患者，男，56岁，5年前发现血糖异常，血压高，未用药，稳定型心绞痛病史2年，常在情动后诱发，舌下含服硝酸甘油可缓解。近日因胸痛2小时且舌下含服硝酸甘油3次，症状仍未缓解就诊。查体：心率110次/分，呼吸24次，心电图提示非ST段抬高型心肌梗死[NSTEMI]。\n\n'
  },
  case2: {
    questionNums: [93, 94, 95, 96],
    background: '案例：（二）患者，男，71岁，1年前上下楼梯时出现气短，气喘和呼吸费力症状。近日，憋喘症状明显加重，门诊肺功能评估：FEV1/FVC70%/50%≤FEV1<80%，诊断为慢性阻塞性肺疾病[COPD]。\n\n'
  },
  case3: {
    questionNums: [97, 98],
    background: '案例：（三）患者，男，45岁，身高165cm，体重87kg，平素每餐饱食，喜辛辣饮食，喜饮啤酒，每日500ml，无吸烟史，高血压病史六年，口服氯沙坦钾氢氯噻嗪片(50mg/12.5mg qd)，血压控制不佳，血压最高165/100mmHg。反流性食管炎病史8年。间断使用铝碳酸镁咀嚼片，对症治疗，1周前出现反酸，烧心加重，伴喉部刺激、咳嗽，影响睡眠，无恶心，呕吐、无腹痛，腹胀，胃镜检查提示反流性食管炎(LA-C级)。\n\n'
  },
  case4: {
    questionNums: [99, 100, 101],
    background: '案例：（四）患儿，女，7岁，体重24kg，因发热1天就诊。查体：体温38.6℃，呼吸频率25次/分，心率108次/分；双侧颈部可触及肿大淋巴结，最大约2.0cm×1.0cm，质地中等，无压痛，表面光滑；咽充血，双侧扁桃体II度肿大，可见白色分泌物。实验室检验白细胞计数13.03×10^9/L，中性粒细胞百分比83.2%，淋巴细胞百分比14.8%，单核细胞百分比6.0%，红细胞计数3.58×10^12/L，血红蛋白111g/L，C反应蛋白79.41mg/L。诊断为急性细菌性扁桃体炎，青霉素过敏史。\n\n'
  },
  case5: {
    questionNums: [102, 103, 104, 105],
    background: '案例：（五）患者，男，72岁，体重91kg，BMI 31kg/m²，高血压病史6年，不规律服用硝苯地平片，未监测血压。因乏力伴气短、下肢肿胀半年，加重2月余就诊，实验室检查：血肌酐84μmol/L，血钾4.6mmol/L，NT-proBNP 2721pg/ml，心脏超声提示左心房增大明显，LVEF39%，诊断为心力衰竭。\n\n'
  },
  case6: {
    questionNums: [106],
    background: '案例：（六）患者，女，68岁，49kg，高血压病史18年[高危型]，高脂血症病史20年，因间断胸痛3个月就诊，查体：血压170/105mmHg、心率95次/分，律齐，双肺呼吸音清，腹软，无压痛。诊断为冠状动脉粥样硬化性心脏病、高脂血症、高血压。\n处方：氨氯地平片5mg qd po，辛伐他汀片20mg qd po，阿司匹林肠溶片100mg qd po，琥珀酸美托洛尔缓释片23.75mg qd po，单硝酸异山梨酯缓释片60mg qd po。\n\n'
  },
  case7: {
    questionNums: [107, 108, 109, 110],
    background: '案例：（七）患者，女，46岁，身高164cm，体重45kg，糖尿病病史八年，高血压病15年。十年前因车祸致颈部受伤后出现肩颈疼痛。疼痛放射至双腋，五年前疼痛逐渐加重，近两个月该患者出现严重的持续性疼痛，伴情绪焦虑，抑郁及睡眠障碍，失眠后常出现头痛，眩晕和恶心症状。检查结果：血压160/105mmHg，心率94次/分，糖化血红蛋白7.3%。肝肾功能未见异常，颈椎核磁共振提示椎间盘突出伴退行性病变，压迫硬脊膜囊及神经根，诊断为颈椎病，颈源性头痛，焦虑，抑郁状态。睡眠障碍。患者入院前的治疗方案如下：\n药品名称 用法用量 给药途径：盐酸二甲双胍片 500mg tid po，阿司匹林肠溶片 100mg qd po，福辛普利钠片 10mg qd po，苯磺酸氨氯地平片 2.5mg qd po，双氯芬酸钠缓释片 75mg bid po。\n\n'
  }
};

async function addCaseBackgrounds() {
  try {
    console.log('🔧 开始补充综合分析题的案例背景...\n');

    // 获取所有题目
    const questions = await prisma.questions.findMany({
      where: {
        source_year: 2024,
        subject: '药学综合知识与技能'
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    let updateCount = 0;
    let skipCount = 0;

    for (const [caseKey, caseData] of Object.entries(caseBackgrounds)) {
      console.log(`\n处理${caseKey}（题${caseData.questionNums.join(', ')}）...`);
      
      for (const questionNum of caseData.questionNums) {
        const index = questionNum - 1;
        
        if (questions[index]) {
          const currentContent = questions[index].content;
          
          // 移除旧的【案例背景缺失】标记
          let newContent = currentContent.replace(/【案例背景缺失】[^\n]+\n\n/g, '');
          
          // 添加完整的案例背景
          newContent = caseData.background + newContent;
          
          await prisma.questions.update({
            where: { id: questions[index].id },
            data: {
              content: newContent
            }
          });
          
          console.log(`  ✅ 题${questionNum}: 已添加案例背景`);
          updateCount++;
        } else {
          console.log(`  ⚠️  题${questionNum}: 未找到对应题目`);
          skipCount++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 更新统计');
    console.log('='.repeat(60));
    console.log(`成功更新: ${updateCount}道题 ✅`);
    console.log(`跳过: ${skipCount}道题`);
    console.log('='.repeat(60));

    if (updateCount > 0) {
      console.log('\n🎉 案例背景已成功添加！');
      console.log('\n📋 已添加案例的题目：');
      console.log('  案例一（冠心病）: 题91-92');
      console.log('  案例二（COPD）: 题93-96');
      console.log('  案例三（反流性食管炎）: 题97-98');
      console.log('  案例四（儿童扁桃体炎）: 题99-101');
      console.log('  案例五（心力衰竭）: 题102-105');
      console.log('  案例六（冠心病+高脂血症）: 题106');
      console.log('  案例七（颈椎病+糖尿病+高血压）: 题107-110');
    }

  } catch (error) {
    console.error('❌ 更新失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addCaseBackgrounds();
