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
      '夜班护士因入睡困难就诊，希望使用一种能快速起效且次日无残留镇静作用的催眠药。应首选下列哪种药物？',
    options: {
      A: '唑吡坦',
      B: '地西泮',
      C: '氯硝西泮',
      D: '苯巴比妥',
      E: '阿普唑仑',
    },
    answer: 'A',
    explanation:
      '本题考查短效非苯二氮卓类催眠药的选择。唑吡坦选择性作用于 GABA-A α1 亚基，半衰期短（约 2.5 小时），可快速诱导睡眠且次日残留效应低；地西泮、氯硝西泮、阿普唑仑属长效苯二氮卓类，易导致次日嗜睡；苯巴比妥为巴比妥类，安全性差，不再作为首选。',
  },
  {
    question_type: '单选',
    section_code: 'C1.4',
    section_title: SECTION_MAP.C1_4,
    knowledge_point_code: 'C1.4.1',
    knowledge_point_title: '抗记忆障碍及改善神经功能药',
    stem:
      '75岁轻中度阿尔茨海默病患者希望改善记忆与认知功能，应首选下列哪种药物？',
    options: {
      A: '多奈哌齐',
      B: '加兰他敏',
      C: '美金刚',
      D: '银杏叶片',
      E: '尼麦角林',
    },
    answer: 'A',
    explanation:
      '本题考查胆碱酯酶抑制剂的首选。多奈哌齐为指南推荐的轻中度阿尔茨海默病首选药；加兰他敏虽同属胆碱酯酶抑制剂但多用于中重度或耐受差者；美金刚为 NMDA 受体拮抗剂，主要用于中度/重度；银杏叶与尼麦角林为脑循环改善药，不能直接纠正胆碱能缺陷。',
  },
  {
    question_type: '单选',
    section_code: 'C1.4',
    section_title: SECTION_MAP.C1_4,
    knowledge_point_code: 'C1.4.1',
    knowledge_point_title: '抗记忆障碍及改善神经功能药',
    stem:
      '66岁脑卒中康复患者因严重芹菜过敏拟启动改善神经功能治疗，下列哪项应避免使用？',
    options: {
      A: '倍他司汀',
      B: '丁苯酞',
      C: '银杏叶片',
      D: '脑蛋白水解物片',
      E: '胞磷胆碱钠',
    },
    answer: 'B',
    explanation:
      '本题考查丁苯酞与芹菜的交叉过敏。丁苯酞结构与芹菜中成分接近，芹菜过敏者可能出现过敏反应；其余药物无该禁忌，可安全使用。',
  },
  {
    question_type: '单选',
    section_code: 'C1.5',
    section_title: SECTION_MAP.C1_5,
    knowledge_point_code: 'C1.5.1',
    knowledge_point_title: '中枢镇痛药',
    stem:
      '恶性肿瘤患者伴血小板显著下降、NSAIDs 禁用，但仍需对抗持续脏器性剧痛。应首选下列哪种镇痛策略？',
    options: {
      A: '吗啡静脉持续输注',
      B: '塞来昔布口服',
      C: '布洛芬缓释片',
      D: '曲马多口服缓释片',
      E: '帕瑞昔布静滴',
    },
    answer: 'A',
    explanation:
      '本题考查血小板减少患者的中重度疼痛治疗。吗啡为强阿片受体激动剂，不抑制血小板功能，是中重度癌痛的首选；塞来昔布、布洛芬、帕瑞昔布均属 NSAIDs，抑制血小板聚集，在血小板显著下降时禁用；曲马多为弱阿片，镇痛有限且兼具 5-HT/NE 再摄取抑制，不能作为中重度脏器痛的首选。',
  },
  {
    question_type: '单选',
    section_code: 'C1.5',
    section_title: SECTION_MAP.C1_5,
    knowledge_point_code: 'C1.5.1',
    knowledge_point_title: '中枢镇痛药',
    stem:
      '术后患者使用大剂量阿片类药物后出现呼吸频率 8 次/分、瞳孔针尖样缩小。此时首先应考虑的诊断是？',
    options: {
      A: '瞳孔散大并伴血压升高',
      B: '顽固性便秘',
      C: '阿片类药物急性中毒',
      D: '腹泻伴出汗',
      E: '突发性心动过速',
    },
    answer: 'C',
    explanation:
      '本题考查阿片类急性中毒的典型征象。呼吸抑制、针尖样瞳孔和意识改变构成阿片中毒的“三联征”，需立即处理；其他选项虽可能出现于不同情况，但非关键诊断线索。',
  },
  {
    question_type: '单选',
    section_code: 'C1.6',
    section_title: SECTION_MAP.C1_6,
    knowledge_point_code: 'C1.6.1',
    knowledge_point_title: '药物分类与代表药品',
    stem:
      '66岁帕金森病患者以静止性震颤为主、认知功能良好，需首选下列哪类药物控制震颤？',
    options: {
      A: '苯海索',
      B: '左旋多巴',
      C: '恩他卡朋',
      D: '普拉克索',
      E: '金刚烷胺',
    },
    answer: 'A',
    explanation:
      '本题考查震颤主导型帕金森病的首选药物。苯海索为中枢抗胆碱药，对震颤改善显著，适用于认知良好者；左旋多巴更适用于动作迟缓主导；恩他卡朋需合用左旋多巴；普拉克索与金刚烷胺为多巴胺激动剂，起效较慢。',
  },
  {
    question_type: '单选',
    section_code: 'C1.6',
    section_title: SECTION_MAP.C1_6,
    knowledge_point_code: 'C1.6.2',
    knowledge_point_title: '左旋多巴的临床用药评价',
    stem:
      '帕金森病患者初始服用左旋多巴后出现严重恶心与呕吐。为减少外周不良反应，最合理的用药调整是？',
    options: {
      A: '与卡比多巴复方制剂同时服用',
      B: '单独加用恩他卡朋',
      C: '立即停用左旋多巴',
      D: '加用维生素 B 复合物',
      E: '快速加倍左旋多巴总量',
    },
    answer: 'A',
    explanation:
      '本题考查左旋多巴外周不良反应的应对。卡比多巴等外周脱羧酶抑制剂可减少左旋多巴在外周转化为多巴胺，从而显著减轻恶心与呕吐；恩他卡朋为 COMT 抑制剂，主要延长作用时间，不能减少外周脱羧；立即停药、剂量加倍或单靠维生素均无法缓解恶心，甚至加重副作用。',
  },
  {
    question_type: '单选',
    section_code: 'C1.6',
    section_title: SECTION_MAP.C1_6,
    knowledge_point_code: 'C1.6.2',
    knowledge_point_title: '左旋多巴的临床用药评价',
    stem:
      '帕金森病患者长期服用左旋多巴/卡比多巴后出现剂末现象，且伴轻度肝功能异常，不适合使用 COMT 抑制剂。下列哪种药物可通过 MAO-B 抑制延长多巴胺作用？',
    options: {
      A: '托卡朋',
      B: '雷沙吉兰',
      C: '恩他卡朋',
      D: '普拉克索',
      E: '溴隐亭',
    },
    answer: 'B',
    explanation:
      '本题考查剂末现象时的 MAO-B 抑制剂使用。雷沙吉兰为 MAO-B 抑制剂，可减少脑内多巴胺降解、延长多巴胺作用时间，适合 COMT 抑制剂受限的患者；托卡朋与恩他卡朋均为 COMT 抑制剂，因肝功能异常需慎用；普拉克索、溴隐亭为多巴胺激动剂，机制不同，不能直接延长左旋多巴半衰期。',
  },
  {
    question_type: '单选',
    section_code: 'C1.6',
    section_title: SECTION_MAP.C1_6,
    knowledge_point_code: 'C1.6.2',
    knowledge_point_title: '左旋多巴的临床用药评价',
    stem:
      '帕金森病患者长期服用左旋多巴后出现剂峰异动症（仅在血药浓度高峰时发生的舞蹈样不自主运动）。为控制该副作用，最合理的药物调整是？',
    options: {
      A: '减小单次左旋多巴剂量并适度增加频次',
      B: '立即停用左旋多巴并改用 NMDA 抑制剂',
      C: '改用高剂量控释制剂',
      D: '补充维生素 B6 并继续原剂量',
      E: '加用典型抗精神病药以抑制运动',
    },
    answer: 'A',
    explanation:
      '本题考查剂峰异动症的剂量管理。此类舞动症通常因峰值过高，减小单次剂量并增加频次可降低峰值；停用或加 NMDA、典型抗精神病药难以维持运动功能；高剂量控释或仅补充维生素无助于降低峰值。',
  },
  {
    question_type: '单选',
    section_code: 'C1.6',
    section_title: SECTION_MAP.C1_6,
    knowledge_point_code: 'C1.6.3',
    knowledge_point_title: '恩他卡朋的临床用药评价',
    stem:
      '帕金森病患者长期服用左旋多巴后出现剂末现象，为延长作用时间，应首选哪种药物加用？',
    options: {
      A: '托卡朋',
      B: '恩他卡朋',
      C: '雷沙吉兰',
      D: '普拉克索',
      E: '溴隐亭',
    },
    answer: 'B',
    explanation:
      '本题考查 COMT 抑制剂在剂末现象中的作用。恩他卡朋与每次左旋多巴/卡比多巴同服，抑制 COMT 延长半衰期；托卡朋虽同类但肝毒性高需慎用；雷沙吉兰为 MAO-B 抑制剂；普拉克索与溴隐亭为多巴胺激动剂，不能延长左旋多巴作用时间。',
  },
  {
    question_type: '单选',
    section_code: 'C1.6',
    section_title: SECTION_MAP.C1_6,
    knowledge_point_code: 'C1.6.3',
    knowledge_point_title: '恩他卡朋的临床用药评价',
    stem:
      '帕金森病患者加用恩他卡朋后出现尿液红棕色与轻度腹泻，应如何处理？',
    options: {
      A: '继续用药并监测腹泻程度，通常属可耐受反应',
      B: '立即停药并改用多巴胺激动剂普拉克索',
      C: '改用雷沙吉兰以避免尿色变化',
      D: '立即停药并加用洛哌丁胺止泻',
      E: '改用托卡朋以获得相同效果',
    },
    answer: 'A',
    explanation:
      '本题考查恩他卡朋常见非严重不良反应。尿色变化为药代产物所致无临床意义；轻度腹泻可耐受，继续用药并观察即可；普拉克索/雷沙吉兰/托卡朋作用机制不同，不能直接替代；在未排除其他原因前不可轻易加止泻药。',
  },
  {
    question_type: '单选',
    section_code: 'C1.6',
    section_title: SECTION_MAP.C1_6,
    knowledge_point_code: 'C1.6.3',
    knowledge_point_title: '恩他卡朋的临床用药评价',
    stem:
      '帕金森病患者为改善剂末现象而加用恩他卡朋。关于用法，下列叙述哪项正确？',
    options: {
      A: '与每次左旋多巴/卡比多巴剂量同时服用',
      B: '每日早晚各一次，可独立于左旋多巴',
      C: '仅在剂末现象明显时才服用',
      D: '与左旋多巴隔日服用以防累积',
      E: '睡前一次即可覆盖全天',
    },
    answer: 'A',
    explanation:
      '本题考查恩他卡朋的给药时机。需与每次左旋多巴/卡比多巴同步服用，以持续抑制 COMT 并减少 3-OMD；每日固定两次或间歇使用会导致抑制作用中断；睡前一次无法覆盖全天，作用不持久。',
  },
  {
    question_type: '单选',
    section_code: 'C1.7',
    section_title: SECTION_MAP.C1_7,
    knowledge_point_code: 'C1.7.1',
    knowledge_point_title: '第一代抗精神病药的临床用药评价',
    stem:
      '首发精神分裂症患者使用氟哌啶醇治疗 1 周后出现四肢肌强直与震颤。最可能的不良反应机制是？',
    options: {
      A: '5-HT2A 受体选择性拮抗',
      B: 'α1 受体激动导致低血压',
      C: '胆碱酯酶抑制导致乙酰胆碱积聚',
      D: '纹状体 D2 受体阻断引起锥体外系反应',
      E: '钠通道阻滞导致心律失常',
    },
    answer: 'D',
    explanation:
      '本题考查典型抗精神病药的 EPS 机制。氟哌啶醇通过阻断纹状体 D2 受体导致锥体外系反应；其余选项与该症状无直接关联。',
  },
  {
    question_type: '单选',
    section_code: 'C1.7',
    section_title: SECTION_MAP.C1_7,
    knowledge_point_code: 'C1.7.1',
    knowledge_point_title: '第一代抗精神病药的临床用药评价',
    stem:
      '急诊收治激越型精神分裂症患者，需迅速控制幻觉与攻击。以下哪种用药策略最符合急诊路径？',
    options: {
      A: '肌内注射第一代抗精神病药（如氟哌啶醇）',
      B: '奥氮平口崩片',
      C: '喹硫平缓释片',
      D: '口服碳酸锂',
      E: '倍他司汀口服',
    },
    answer: 'A',
    explanation:
      '本题考查急性激越期的用药策略。肌注第一代药起效最快，适合急诊；口服非典型或碳酸锂起效慢，不满足急救需求。',
  },
  {
    question_type: '单选',
    section_code: 'C1.7',
    section_title: SECTION_MAP.C1_7,
    knowledge_point_code: 'C1.7.2',
    knowledge_point_title: '第二代抗精神病药的临床用药评价',
    stem:
      '首发精神分裂症患者即将开始抗精神病药治疗，医生希望在控制阳性症状的同时减少锥体外系反应与改善阴性症状。与第一代药物相比，第二代药物的主要优势是？',
    options: {
      A: '仅拮抗 D2 受体，锥体外系反应明显',
      B: '主要激动 5-HT1A 受体，快速升压',
      C: '改善阴性症状与认知功能的同时，锥体外系反应风险较低',
      D: '只在抑郁伴发时才有效',
      E: '需与碳酸锂合用才能避免代谢问题',
    },
    answer: 'C',
    explanation:
      '本题考查第二代抗精神病药的优势。第二代药通过 5-HT2A 与 D2 双重拮抗，既改善阴性与认知症状又显著降低 EPS，相较第一代更适合首发患者；其他选项与指南不符或为错误表述。',
  },
  {
    question_type: '单选',
    section_code: 'C1.7',
    section_title: SECTION_MAP.C1_7,
    knowledge_point_code: 'C1.7.2',
    knowledge_point_title: '第二代抗精神病药的临床用药评价',
    stem:
      '患者使用第二代抗精神病药 3 个月后出现明显体重上升与空腹血糖升高。下列药物中最可能是罪魁？',
    options: {
      A: '奥氮平',
      B: '氟哌啶醇',
      C: '喹硫平',
      D: '氯氮平',
      E: '利培酮',
    },
    answer: 'A',
    explanation:
      '本题考查第二代药物的代谢副作用。奥氮平代谢风险最高；氟哌啶醇属典型药、以 EPS 为主；喹硫平虽然有代谢风险但不如奥氮平；氯氮平虽代谢副作用显著但常用于耐药；利培酮代谢风险较低。',
  },
  {
    question_type: '单选',
    section_code: 'C1.7',
    section_title: SECTION_MAP.C1_7,
    knowledge_point_code: 'C1.7.3',
    knowledge_point_title: '碳酸锂的临床用药评价',
    stem:
      '碳酸锂治疗期间患者出现呕吐与腹泻，怀疑血锂升高。应如何处理？',
    options: {
      A: '监测血锂浓度与肾功能，必要时调整剂量',
      B: '立即改用苯二氮卓类镇静药',
      C: '补钾即可继续原剂量',
      D: '说明疗效良好，应加剂量',
      E: '改用奥氮平避免问题',
    },
    answer: 'A',
    explanation:
      '本题考查碳酸锂中毒的初步处理。呕吐与腹泻可能导致脱水使血锂升高，应立即监测血锂与肾功能并调整剂量；其余选项无法识别或处理毒性。',
  },
  {
    question_type: '单选',
    section_code: 'C1.7',
    section_title: SECTION_MAP.C1_7,
    knowledge_point_code: 'C1.7.3',
    knowledge_point_title: '碳酸锂的临床用药评价',
    stem:
      '碳酸锂维持治疗期间，关于监测的正确做法是？',
    options: {
      A: '仅凭症状判断，无需实验室监测',
      B: '定期检查肾功能、甲状腺功能并测血锂浓度',
      C: '出现口干即为中毒，应立即停药',
      D: '低盐饮食即可自动避免毒性',
      E: '血锂越低疗效越好，应控制在 0.2 mmol/L 以下',
    },
    answer: 'B',
    explanation:
      '本题考查碳酸锂治疗的监测原则。需定期监测肾功能、甲状腺功能与血锂浓度，以便及时调整剂量并识别中毒；其余选项或错误或误导。',
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

