const { Pool } = require('pg');

const CHAPTER_CODE = 'C1';
const CHAPTER_TITLE = '第一章 精神与中枢神经系统用药';

const SECTION_MAP = {
  C1_1: '第一节 镇静催眠药、中枢肌松药',
  C1_4: '第四节 抗记忆障碍及改善神经功能药',
  C1_5: '第五节 中枢镇痛药',
  C1_6: '第六节 抗帕金森病药',
  C1_7: '第七节 抗精神病药',
};

const QUESTIONS = [
  {
    question_type: '单选',
    section_code: 'C1.1',
    section_title: SECTION_MAP.C1_1,
    knowledge_point_code: 'C1.1.1',
    knowledge_point_title: '药物分类与代表药品',
    stem:
      '夜班护士因入睡困难求诊，希望药效快、清晨不残余嗜睡，并尽量减少肌松作用。以下哪种睡前用药最符合需求？',
    options: {
      A: '唑吡坦舌下片',
      B: '地西泮缓释胶囊',
      C: '氯硝西泮片',
      D: '水合氯醛口服液',
      E: '巴氯芬片',
    },
    answer: 'A',
    explanation:
      '非苯二氮卓类的唑吡坦以α1受体选择性、半衰期短见长，可快速诱导睡眠且次日不致明显嗜睡，优于长效苯二氮卓或肌松药。',
  },
  {
    question_type: '单选',
    section_code: 'C1.4',
    section_title: SECTION_MAP.C1_4,
    knowledge_point_code: 'C1.4.1',
    knowledge_point_title: '抗记忆障碍及改善神经功能药',
    stem:
      '72岁女性确诊轻中度阿尔茨海默病，希望通过药物改善胆碱能缺陷导致的记忆衰退。下列药物中，哪一种直接抑制胆碱酯酶、提升脑内乙酰胆碱含量，适合作为首选？',
    options: {
      A: '多奈哌齐',
      B: '倍他司汀',
      C: '丁苯酞',
      D: '尼麦角林',
      E: '维生素B复合制剂',
    },
    answer: 'A',
    explanation:
      '多奈哌齐属于乙酰胆碱酯酶抑制剂，可纠正胆碱能递质不足，是轻中度阿尔茨海默病标准用药；其余药物更多用于改善脑循环或周围神经功能。',
  },
  {
    question_type: '单选',
    section_code: 'C1.4',
    section_title: SECTION_MAP.C1_4,
    knowledge_point_code: 'C1.4.1',
    knowledge_point_title: '抗记忆障碍及改善神经功能药',
    stem:
      '66岁男性急性缺血性脑卒中准备启动改善神经功能的静脉治疗，但患者有严重芹菜过敏史。下列哪种药物应避免使用？',
    options: {
      A: '倍他司汀',
      B: '丁苯酞',
      C: '尼麦角林',
      D: '胞磷胆碱钠',
      E: '银杏叶提取物',
    },
    answer: 'B',
    explanation:
      '丁苯酞为我国开发的新药，结构与芹菜中的左旋芹菜甲素相似，芹菜过敏者禁用；其他选项无该禁忌。',
  },
  {
    question_type: '单选',
    section_code: 'C1.5',
    section_title: SECTION_MAP.C1_5,
    knowledge_point_code: 'C1.5.1',
    knowledge_point_title: '中枢镇痛药',
    stem:
      '恶性肿瘤患者伴血小板显著下降，NSAIDs禁用，但仍有持续的脏器性剧痛。何种镇痛策略最能绕开外周COX抑制、直接通过中枢μ受体提供镇痛？',
    options: {
      A: '吗啡静脉持续输注',
      B: '塞来昔布口服',
      C: '布洛芬缓释剂',
      D: '对乙酰氨基酚分次口服',
      E: '帕瑞昔布静滴',
    },
    answer: 'A',
    explanation:
      '吗啡等阿片类通过中枢μ受体产生强镇痛效果，适合中重度癌痛且不依赖外周抗炎；其他选项仍为外周抑制前列腺素的策略。',
  },
  {
    question_type: '单选',
    section_code: 'C1.5',
    section_title: SECTION_MAP.C1_5,
    knowledge_point_code: 'C1.5.1',
    knowledge_point_title: '中枢镇痛药',
    stem:
      '术后患者使用高剂量阿片类镇痛后出现呼吸频率8次/分并伴针尖样瞳孔。最符合阿片类中毒的警示征象是下列哪一项？',
    options: {
      A: '瞳孔散大合并血压升高',
      B: '顽固性便秘',
      C: '呼吸抑制伴针尖样瞳孔',
      D: '腹泻与出汗增加',
      E: '突发性心动过速',
    },
    answer: 'C',
    explanation:
      '阿片类急性中毒典型表现为针尖样瞳孔和致命性呼吸抑制，需要立即用纳洛酮拮抗；便秘或心率变化虽常见但非危及生命的首要信号。',
  },
  {
    question_type: '单选',
    section_code: 'C1.6',
    section_title: SECTION_MAP.C1_6,
    knowledge_point_code: 'C1.6.1',
    knowledge_point_title: '药物分类与代表药品',
    stem:
      '66岁帕金森病患者以静止性震颤为主，动作迟缓不明显，认知功能良好。哪类药物最适合作为初始治疗以缓解震颤？',
    options: {
      A: '苯海索',
      B: '左旋多巴',
      C: '恩他卡朋',
      D: '普拉克索',
      E: '金刚烷胺',
    },
    answer: 'A',
    explanation:
      '中枢抗胆碱药如苯海索主要改善震颤，尤其适用于70岁以下、震颤主导型患者；左旋多巴更适合明显运动迟缓者。',
  },
  {
    question_type: '单选',
    section_code: 'C1.6',
    section_title: SECTION_MAP.C1_6,
    knowledge_point_code: 'C1.6.2',
    knowledge_point_title: '左旋多巴的临床用药评价',
    stem:
      '帕金森病患者使用左旋多巴后出现明显恶心，医生计划调整方案以减少脑外脱羧。最合理的做法是？',
    options: {
      A: '与卡比多巴组成复方制剂',
      B: '单独加用恩他卡朋',
      C: '立即停用左旋多巴',
      D: '加用维生素B复合物即可',
      E: '快速加倍左旋多巴剂量',
    },
    answer: 'A',
    explanation:
      '左旋多巴在脑外大量脱羧致恶心，应合用外周多巴脱羧酶抑制剂（如卡比多巴）以增加进入中枢的比例并降低胃肠反应。',
  },
  {
    question_type: '单选',
    section_code: 'C1.6',
    section_title: SECTION_MAP.C1_6,
    knowledge_point_code: 'C1.6.2',
    knowledge_point_title: '左旋多巴的临床用药评价',
    stem:
      '58岁男性因动作迟缓影响穿衣与行走，单用MAO-B抑制剂控制欠佳。为快速改善运动徐缓，应首选何种药物？',
    options: {
      A: '左旋多巴制剂',
      B: '恩他卡朋单药',
      C: '苯二氮卓类',
      D: '倍他司汀',
      E: '司来吉兰继续加量',
    },
    answer: 'A',
    explanation:
      '左旋多巴是对运动迟缓控制最有效的对症药物，症状明显时应作为首选；恩他卡朋需与左旋多巴合用才有效。',
  },
  {
    question_type: '单选',
    section_code: 'C1.6',
    section_title: SECTION_MAP.C1_6,
    knowledge_point_code: 'C1.6.2',
    knowledge_point_title: '左旋多巴的临床用药评价',
    stem:
      '一名长期使用左旋多巴的患者出现眼睑痉挛与极度疲劳。该表现提示什么？',
    options: {
      A: '与疾病自然进程无关，可忽略',
      B: '属于左旋多巴严重不良反应，应评估剂量',
      C: '提示药物疗效下降，应迅速加量',
      D: '说明患者出现脱水，可继续观察',
      E: '意味着需要同时停用所有抗帕金森药',
    },
    answer: 'B',
    explanation:
      '左旋多巴的严重不良反应之一是眼睑痉挛及极度乏力，出现时需要重新评估剂量或间隔，避免毒性反应。',
  },
  {
    question_type: '单选',
    section_code: 'C1.6',
    section_title: SECTION_MAP.C1_6,
    knowledge_point_code: 'C1.6.2',
    knowledge_point_title: '左旋多巴的临床用药评价',
    stem:
      '患者在左旋多巴起始阶段诉说持续恶心但愿意坚持治疗。以下哪条用药教育最恰当？',
    options: {
      A: '恶心属常见反应，通常可在继续合用小剂量多巴脱羧酶抑制剂后逐渐耐受',
      B: '出现恶心必须立即停药并改用胆碱拮抗剂',
      C: '恶心表示疗效不足，应立即加倍剂量',
      D: '只要改为餐后立刻服用即可根治',
      E: '恶心说明药物无法进入中枢，应改口服多奈哌齐',
    },
    answer: 'A',
    explanation:
      '胃肠道不适是左旋多巴常见不良反应，多可随治疗继续或与脱羧酶抑制剂合用后减轻，需告知患者耐受过程。',
  },
  {
    question_type: '单选',
    section_code: 'C1.6',
    section_title: SECTION_MAP.C1_6,
    knowledge_point_code: 'C1.6.3',
    knowledge_point_title: '恩他卡朋的临床用药评价',
    stem:
      '左旋多巴治疗多年后出现“穿透”现象，下午症状提前反弹。为延长左旋多巴的治疗窗口，首选加用哪种药物？',
    options: {
      A: '恩他卡朋',
      B: '苯海索',
      C: '丁苯酞',
      D: '倍他司汀',
      E: '普拉克索单药',
    },
    answer: 'A',
    explanation:
      '恩他卡朋可选择性抑制COMT，阻止3-O-甲基多巴形成，延长左旋多巴半衰期并提高脑内暴露，常用于穿透或“关期”延长策略。',
  },
  {
    question_type: '单选',
    section_code: 'C1.6',
    section_title: SECTION_MAP.C1_6,
    knowledge_point_code: 'C1.6.3',
    knowledge_point_title: '恩他卡朋的临床用药评价',
    stem:
      '患者加用恩他卡朋后尿液呈红棕色并伴轻度腹泻。医生的最佳建议是：',
    options: {
      A: '立即停药并报告血色素下降',
      B: '改用胆碱拮抗剂可消除尿色变化',
      C: '此为药物常见现象，可继续用药并关注腹泻程度',
      D: '说明药物未与左旋多巴联用，应补加苯海索',
      E: '需用利福昔明控制腹泻',
    },
    answer: 'C',
    explanation:
      '恩他卡朋常见不良反应包括腹泻及尿液红棕色变色，属可逆、无害表现，通常无需停药，仅需教育并监测。',
  },
  {
    question_type: '单选',
    section_code: 'C1.7',
    section_title: SECTION_MAP.C1_7,
    knowledge_point_code: 'C1.7.1',
    knowledge_point_title: '第一代抗精神病药的临床用药评价',
    stem:
      '首发精神分裂症患者接受氟哌啶醇治疗1周后出现四肢僵硬和手部震颤。最可能的不良反应机制是？',
    options: {
      A: '5-HT2A受体选择性拮抗',
      B: 'α1受体激动导致低血压',
      C: '胆碱酯酶抑制导致乙酰胆碱积聚',
      D: '纹状体D2受体阻断引起锥体外系反应',
      E: '钠通道阻滞导致心律失常',
    },
    answer: 'D',
    explanation:
      '第一代抗精神病药通过阻断纹状体D2受体，易产生锥体外系不良反应，表现为肌强直、震颤等。',
  },
  {
    question_type: '单选',
    section_code: 'C1.7',
    section_title: SECTION_MAP.C1_7,
    knowledge_point_code: 'C1.7.1',
    knowledge_point_title: '第一代抗精神病药的临床用药评价',
    stem:
      '急诊收治一名激越型精神分裂症患者，需迅速控制幻觉与暴力行为且对代谢不良反应尚不担心。首选哪一类药物？',
    options: {
      A: '第一代抗精神病药如氟哌啶醇',
      B: '奥氮平口崩片',
      C: '喹硫平缓释剂',
      D: '碳酸锂',
      E: '倍他司汀',
    },
    answer: 'A',
    explanation:
      '典型抗精神病药对阳性症状（幻觉、激越）的控制迅速，适合作为急性期首选；非典型药或心境稳定剂起效较慢。',
  },
  {
    question_type: '单选',
    section_code: 'C1.7',
    section_title: SECTION_MAP.C1_7,
    knowledge_point_code: 'C1.7.2',
    knowledge_point_title: '第二代抗精神病药的临床用药评价',
    stem:
      '下列关于第二代抗精神病药的描述，哪一项最能解释其作为首发患者一线用药的原因？',
    options: {
      A: '仅拮抗D2受体，因而锥体外系反应更多',
      B: '主要激动5-HT1A受体，快速提高血压',
      C: '同时拮抗5-HT2A与D2受体，对阴性症状和代谢调控更有优势',
      D: '只在抑郁症患者中才有效',
      E: '与碳酸锂同用可消除代谢风险',
    },
    answer: 'C',
    explanation:
      '第二代抗精神病药为多巴胺-5-HT受体拮抗剂，拮抗5-HT2A>D2，可兼顾阳性与阴性症状并降低EPS，因此成为首发患者一线方案。',
  },
  {
    question_type: '单选',
    section_code: 'C1.7',
    section_title: SECTION_MAP.C1_7,
    knowledge_point_code: 'C1.7.2',
    knowledge_point_title: '第二代抗精神病药的临床用药评价',
    stem:
      '患者使用某第二代抗精神病药后3个月出现明显体重上升与空腹血糖升高。哪种药物最符合该不良反应特征？',
    options: {
      A: '奥氮平',
      B: '氟哌啶醇',
      C: '氯丙嗪',
      D: '利福昔明',
      E: '硫利达嗪',
    },
    answer: 'A',
    explanation:
      '奥氮平等第二代药物易引起体重增加、糖脂代谢紊乱，是代谢综合征风险最高的代表之一；典型药则以EPS为主。',
  },
  {
    question_type: '单选',
    section_code: 'C1.7',
    section_title: SECTION_MAP.C1_7,
    knowledge_point_code: 'C1.7.3',
    knowledge_point_title: '碳酸锂的临床用药评价',
    stem:
      '服用碳酸锂的躁郁症患者出现呕吐与腹泻。下列哪项处理最合适？',
    options: {
      A: '立即改用苯二氮卓类镇静药即可',
      B: '监测血锂浓度并警惕中毒，必要时调整剂量',
      C: '只需补充钾盐即可继续原剂量',
      D: '说明疗效良好，应增加剂量',
      E: '换用奥氮平即可避免问题',
    },
    answer: 'B',
    explanation:
      '大量体液丢失可迅速升高血锂浓度并诱发中毒，应监测血锂、评估肾功能并及时调整剂量，而非盲目加量或简单替换。',
  },
  {
    question_type: '单选',
    section_code: 'C1.7',
    section_title: SECTION_MAP.C1_7,
    knowledge_point_code: 'C1.7.3',
    knowledge_point_title: '碳酸锂的临床用药评价',
    stem: '关于碳酸锂维持治疗的监测，何者正确？',
    options: {
      A: '仅凭症状即可判断，不需实验室监测',
      B: '疗程中应定期检查肾功能、甲状腺功能并测血锂水平',
      C: '出现口干就说明中毒，应立即停药',
      D: '搭配低盐饮食可降低毒性',
      E: '血锂浓度越低疗效越好，应控制在0.2 mmol/L以下',
    },
    answer: 'B',
    explanation:
      '碳酸锂治疗需监测血锂浓度及肾、甲状腺功能，以便调整治疗量并及早识别中毒或器官损害。',
  },
];

async function main() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    for (const q of QUESTIONS) {
      await client.query(
        `
          INSERT INTO public.diagnostic_questions (
            question_type,
            stem,
            options,
            answer,
            explanation,
            source_type,
            chapter_code,
            chapter_title,
            section_code,
            section_title,
            knowledge_point_code,
            knowledge_point_title
          )
          VALUES (
            $1,
            $2,
            $3::jsonb,
            $4,
            $5,
            'ai_original',
            $6,
            $7,
            $8,
            $9,
            $10,
            $11
          )
        `,
        [
          q.question_type,
          q.stem,
          JSON.stringify(q.options),
          q.answer,
          q.explanation,
          CHAPTER_CODE,
          CHAPTER_TITLE,
          q.section_code,
          q.section_title,
          q.knowledge_point_code,
          q.knowledge_point_title,
        ],
      );
    }
    await client.query('COMMIT');
    console.log(`Inserted ${QUESTIONS.length} diagnostic questions.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to seed diagnostic questions:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

