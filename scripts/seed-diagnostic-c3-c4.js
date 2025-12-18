const { Pool } = require("pg");

const QUESTIONS = [
  {
    question_type: "单选",
    chapter_code: "C3",
    chapter_title: "第三章 呼吸系统疾病用药",
    section_code: "C3.1",
    section_title: "第一节 镇咳与祛痰药",
    knowledge_point_code: "C3.1.1",
    knowledge_point_title: "干咳镇咳药",
    stem:
      "干咳持续两周、夜间加重、无痰且排除感染后，最适宜选用哪种中枢镇咳药？",
    options: {
      A: "右美沙芬",
      B: "溴己新",
      C: "氨溴索",
      D: "复方甘草酸苷",
      E: "盐酸左氧氟沙星",
    },
    answer: "A",
    explanation:
      "本题考查中枢镇咳。右美沙芬抑制延髓咳嗽中枢，适用于干咳；其他选项为祛痰/保护/抗菌，非首选。",
  },
  {
    question_type: "单选",
    chapter_code: "C3",
    chapter_title: "第三章 呼吸系统疾病用药",
    section_code: "C3.1",
    section_title: "第一节 镇咳与祛痰药",
    knowledge_point_code: "C3.1.2",
    knowledge_point_title: "黏液溶解剂",
    stem:
      "慢性支气管炎痰稠难咳，最适合使用哪种黏液溶解剂？",
    options: {
      A: "氨溴索",
      B: "右美沙芬",
      C: "甘草酸",
      D: "布地奈德",
      E: "头孢克肟",
    },
    answer: "A",
    explanation:
      "本题考查黏液溶解剂。氨溴索降低黏度、促进排痰；其他选项为镇咳/保护/激素/抗菌。",
  },
  {
    question_type: "单选",
    chapter_code: "C3",
    chapter_title: "第三章 呼吸系统疾病用药",
    section_code: "C3.1",
    section_title: "第一节 镇咳与祛痰药",
    knowledge_point_code: "C3.1.3",
    knowledge_point_title: "儿童镇咳安全",
    stem:
      "6 岁儿童干咳，家长想要止咳药。以下哪种药物因呼吸抑制与成瘾风险，已禁用于 12 岁以下儿童，应首要避免？",
    options: {
      A: "右美沙芬",
      B: "氨溴索",
      C: "复方甘草片",
      D: "头孢克肟",
      E: "可待因",
    },
    answer: "E",
    explanation:
      "可待因会造成呼吸抑制 & 成瘾风险，禁用于 12 岁以下；右美沙芬虽需谨慎但仍可短期应用；其他选项为辅助。",
  },
  {
    question_type: "单选",
    chapter_code: "C3",
    chapter_title: "第三章 呼吸系统疾病用药",
    section_code: "C3.2",
    section_title: "第二节 平喘药",
    knowledge_point_code: "C3.2.1",
    knowledge_point_title: "短效β2激动剂",
    stem:
      "急性哮喘发作、呼气性喘鸣明显，应首先吸入哪种短效 β2 激动剂？",
    options: {
      A: "沙丁胺醇",
      B: "福莫特罗",
      C: "布地奈德",
      D: "孟鲁司特",
      E: "赫尔蒙",
    },
    answer: "A",
    explanation:
      "沙丁胺醇为短效 β2 激动剂，可快速缓解；其他选项为长效/激素/辅助药。",
  },
  {
    question_type: "单选",
    chapter_code: "C3",
    chapter_title: "第三章 呼吸系统疾病用药",
    section_code: "C3.2",
    section_title: "第二节 平喘药",
    knowledge_point_code: "C3.2.2",
    knowledge_point_title: "吸入糖皮质激素",
    stem:
      "哮喘控制不佳，加入吸入糖皮质激素的核心目的是什么？",
    options: {
      A: "降低气道炎症、减少发作",
      B: "快速舒张支气管",
      C: "降低肺动脉压",
      D: "抗菌作用",
      E: "利尿",
    },
    answer: "A",
    explanation:
      "ICS 通过抑制炎症细胞、减少血管通透，改善控制并减少发作。",
  },
  {
    question_type: "单选",
    chapter_code: "C3",
    chapter_title: "第三章 呼吸系统疾病用药",
    section_code: "C3.2",
    section_title: "第二节 平喘药",
    knowledge_point_code: "C3.2.3",
    knowledge_point_title: "长效抗胆碱药",
    stem:
      "慢阻肺患者需每日一次维持治疗，应该优先使用哪种长效抗胆碱药？",
    options: {
      A: "噻托溴铵",
      B: "沙丁胺醇",
      C: "孟鲁司特",
      D: "布地奈德",
      E: "阿奇霉素",
    },
    answer: "A",
    explanation:
      "噻托溴铵为长效 M3 拮抗剂，适用于慢阻肺；其他选项不属抗胆碱类。",
  },
  {
    question_type: "单选",
    chapter_code: "C3",
    chapter_title: "第三章 呼吸系统疾病用药",
    section_code: "C3.3",
    section_title: "第三节 呼吸道抗感染",
    knowledge_point_code: "C3.3.1",
    knowledge_point_title: "社区获得性肺炎经验性抗菌",
    stem:
      "健康成人社区获得性肺炎，首选哪种经验性口服抗菌？",
    options: {
      A: "阿奇霉素",
      B: "利福昔明",
      C: "甲硝唑",
      D: "头孢呋辛",
      E: "洛哌丁胺",
    },
    answer: "A",
    explanation:
      "阿奇霉素覆盖典型与非典型病原体；其他选项不适合 CAP。",
  },
  {
    question_type: "单选",
    chapter_code: "C3",
    chapter_title: "第三章 呼吸系统疾病用药",
    section_code: "C3.3",
    section_title: "第三节 呼吸道抗感染",
    knowledge_point_code: "C3.3.2",
    knowledge_point_title: "慢阻肺急性加重抗菌",
    stem:
      "慢阻肺急性加重伴脓痰，短期首选哪种抗菌？",
    options: {
      A: "阿莫西林/克拉维酸",
      B: "头孢呋辛",
      C: "氨溴索",
      D: "布地奈德",
      E: "左氧氟沙星",
    },
    answer: "A",
    explanation:
      "阿莫西林/克拉维酸覆盖常见肺炎链球菌和流感嗜血杆菌；其他为辅助治疗。",
  },
  {
    question_type: "单选",
    chapter_code: "C3",
    chapter_title: "第三章 呼吸系统疾病用药",
    section_code: "C3.3",
    section_title: "第三节 呼吸道抗感染",
    knowledge_point_code: "C3.3.3",
    knowledge_point_title: "ICS 局部不良反应",
    stem:
      "长期使用吸入激素的哮喘患者, 需提醒哪个局部不良反应？",
    options: {
      A: "口腔念珠菌感染",
      B: "QT 延长",
      C: "肝酶升高",
      D: "血糖升高",
      E: "胃溃疡",
    },
    answer: "A",
    explanation:
      "ICS 常导致口腔念珠菌，应指导患者漱口；其他情况较少见。",
  },
  {
    question_type: "单选",
    chapter_code: "C3",
    chapter_title: "第三章 呼吸系统疾病用药",
    section_code: "C3.3",
    section_title: "第三节 呼吸道抗感染",
    knowledge_point_code: "C3.3.4",
    knowledge_point_title: "慢阻肺预防性抗菌",
    stem:
      "慢阻肺反复加重, 计划预防性抗菌, 下列哪种方案符合指南？",
    options: {
      A: "低剂量阿奇霉素",
      B: "洛哌丁胺",
      C: "泮托拉唑",
      D: "布地奈德",
      E: "米诺环素",
    },
    answer: "A",
    explanation:
      "低剂量阿奇霉素可减少加重次数；其他为止泻/辅助药。",
  },
  {
    question_type: "单选",
    chapter_code: "C3",
    chapter_title: "第三章 呼吸系统疾病用药",
    section_code: "C3.3",
    section_title: "第三节 呼吸道抗感染",
    knowledge_point_code: "C3.3.5",
    knowledge_point_title: "重症 CAP 方案",
    stem:
      "重症社区获得性肺炎患者适合哪种经验性静脉方案？",
    options: {
      A: "头孢曲松 + 阿奇霉素",
      B: "左氧氟沙星 + 头孢呋辛",
      C: "阿莫西林/克拉维酸",
      D: "利福昔明 + 甲硝唑",
      E: "复方甘草酸苷",
    },
    answer: "A",
    explanation:
      "β-内酰胺 + 大环内酯覆盖典型/非典型；其余选项拟覆盖不足或无关。",
  },
  {
    question_type: "单选",
    chapter_code: "C3",
    chapter_title: "第三章 呼吸系统疾病用药",
    section_code: "C3.3",
    section_title: "第三节 呼吸道抗感染",
    knowledge_point_code: "C3.3.6",
    knowledge_point_title: "流感抗病毒",
    stem:
      "流感高危患者在症状出现 48 小时内应优先使用哪种口服抗病毒药？",
    options: {
      A: "奥司他韦",
      B: "头孢呋辛",
      C: "利巴韦林",
      D: "苯巴比妥",
      E: "盐酸左氧氟沙星",
    },
    answer: "A",
    explanation:
      "奥司他韦需在 48 小时内使用；其他选项无抗病毒作用。",
  },
  {
    question_type: "单选",
    chapter_code: "C3",
    chapter_title: "第三章 呼吸系统疾病用药",
    section_code: "C3.3",
    section_title: "第三节 呼吸道抗感染",
    knowledge_point_code: "C3.3.7",
    knowledge_point_title: "流感疫苗与药物",
    stem:
      "流感疫苗后出现低热, 患者咨询是否继续药物, 最主要提醒哪方面？",
    options: {
      A: "非甾体抗炎药可缓解发热",
      B: "立即使用抗病毒药",
      C: "停止服用维生素",
      D: "停用慢性抗凝",
      E: "补充钾剂",
    },
    answer: "A",
    explanation:
      "疫苗引起低热可用 NSAIDs 缓解；无需调整抗病毒/抗凝, 也无需补钾。",
  },
  {
    question_type: "单选",
    chapter_code: "C4",
    chapter_title: "第四章 消化道功能与肝胆辅助用药",
    section_code: "C4.1",
    section_title: "第一节 胃肠功能调节",
    knowledge_point_code: "C4.1.1",
    knowledge_point_title: "消胀药",
    stem:
      "功能性胃肠胀气患者以腹胀、嗳气为主，选择哪种药物通过降低气泡表面张力促进排气？",
    options: {
      A: "西甲硅油",
      B: "二甲硅油",
      C: "复方消化酶",
      D: "乳酶生",
      E: "莫沙必利",
    },
    answer: "A",
    explanation:
      "西甲硅油/二甲硅油为表面活性剂，减少泡沫；其他选项为助消化/促动力。",
  },
  {
    question_type: "单选",
    chapter_code: "C4",
    chapter_title: "第四章 消化道功能与肝胆辅助用药",
    section_code: "C4.1",
    section_title: "第一节 胃肠功能调节",
    knowledge_point_code: "C4.1.2",
    knowledge_point_title: "益生菌",
    stem:
      "儿童感染性腹泻恢复期使用哪种益生菌制剂可帮助恢复菌群？",
    options: {
      A: "双歧杆菌三联活菌",
      B: "洛哌丁胺",
      C: "甘草酸",
      D: "头孢克肟",
      E: "泮托拉唑",
    },
    answer: "A",
    explanation:
      "双歧杆菌三联活菌为益生菌；其他选项为止泻/抗菌/抑酸。",
  },
  {
    question_type: "单选",
    chapter_code: "C4",
    chapter_title: "第四章 消化道功能与肝胆辅助用药",
    section_code: "C4.1",
    section_title: "第一节 胃肠功能调节",
    knowledge_point_code: "C4.1.3",
    knowledge_point_title: "促胃动力药",
    stem:
      "糖尿病胃轻瘫患者需促进胃排空，下列哪种药物通过多巴胺受体拮抗促进蠕动？",
    options: {
      A: "多潘立酮",
      B: "甲氧氯普胺",
      C: "莫沙必利",
      D: "伊托必利",
      E: "西沙必利",
    },
    answer: "A",
    explanation:
      "多潘立酮阻断外周 D2 受体，促进胃排空；其他选项机制各异，如 5-HT4 激动或 QT 风险。",
  },
  {
    question_type: "单选",
    chapter_code: "C4",
    chapter_title: "第四章 消化道功能与肝胆辅助用药",
    section_code: "C4.2",
    section_title: "第二节 肝胆辅助药",
    knowledge_point_code: "C4.2.1",
    knowledge_point_title: "保肝药",
    stem:
      "脂肪肝伴 ALT 轻度升高，应优先使用哪种保肝药辅助修复肝细胞？",
    options: {
      A: "多烯磷脂酰胆碱",
      B: "洛伐他汀",
      C: "阿奇霉素",
      D: "氢氧化铝",
      E: "泮托拉唑",
    },
    answer: "A",
    explanation:
      "多烯磷脂酰胆碱修复肝细胞膜；其他选项与保肝无关。",
  },
  {
    question_type: "单选",
    chapter_code: "C4",
    chapter_title: "第四章 消化道功能与肝胆辅助用药",
    section_code: "C4.2",
    section_title: "第二节 肝胆辅助药",
    knowledge_point_code: "C4.2.2",
    knowledge_point_title: "利胆药",
    stem:
      "原发性胆汁性胆管炎患者需促进胆汁流动，首选哪种药物？",
    options: {
      A: "熊去氧胆酸",
      B: "腺苷蛋氨酸",
      C: "茴三硫",
      D: "苯丙醇",
      E: "硫酸镁",
    },
    answer: "A",
    explanation:
      "熊去氧胆酸促进胆汁流动；其他选项为对症或导泻。",
  },
  {
    question_type: "单选",
    chapter_code: "C4",
    chapter_title: "第四章 消化道功能与肝胆辅助用药",
    section_code: "C4.2",
    section_title: "第二节 肝胆辅助药",
    knowledge_point_code: "C4.2.3",
    knowledge_point_title: "水飞蓟宾",
    stem:
      "慢性乙肝患者常用哪种天然保肝成分？",
    options: {
      A: "水飞蓟宾",
      B: "利福昔明",
      C: "洛伐他汀",
      D: "硫酸镁",
      E: "泮托拉唑",
    },
    answer: "A",
    explanation:
      "水飞蓟宾具有抗氧化、稳定肝细胞膜的效应；其他选项不属于保肝药。",
  },
  {
    question_type: "单选",
    chapter_code: "C4",
    chapter_title: "第四章 消化道功能与肝胆辅助用药",
    section_code: "C4.3",
    section_title: "第三节 药物监测与相互作用",
    knowledge_point_code: "C4.3.1",
    knowledge_point_title: "胆汁酸与抗凝",
    stem:
      "原发性胆汁性胆管炎患者正在服用熊去氧胆酸与华法林，应重点监测？",
    options: {
      A: "凝血功能（INR）",
      B: "血钾",
      C: "血糖",
      D: "血尿酸",
      E: "血脂",
    },
    answer: "A",
    explanation:
      "胆汁酸可能影响肝代谢，联合华法林需监测 INR。",
  },
  {
    question_type: "单选",
    chapter_code: "C4",
    chapter_title: "第四章 消化道功能与肝胆辅助用药",
    section_code: "C4.3",
    section_title: "第三节 药物监测与相互作用",
    knowledge_point_code: "C4.3.2",
    knowledge_point_title: "胆汁酸副作用",
    stem:
      "服用胆汁酸制剂的患者出现轻度腹泻，最可能原因是？",
    options: {
      A: "胆汁酸刺激肠道分泌",
      B: "QT 延长",
      C: "低血压",
      D: "肌肉痉挛",
      E: "咳嗽",
    },
    answer: "A",
    explanation:
      "胆汁酸促进分泌与蠕动，常见副作用为腹泻；其他选项无相关性。",
  },
  {
    question_type: "单选",
    chapter_code: "C4",
    chapter_title: "第四章 消化道功能与肝胆辅助用药",
    section_code: "C4.3",
    section_title: "第三节 药物监测与相互作用",
    knowledge_point_code: "C4.3.3",
    knowledge_point_title: "肝酶诱导药",
    stem:
      "长期服用苯巴比妥的癫痫患者 ALT 升高，应重点监测？",
    options: {
      A: "肝功能（ALT/AST）",
      B: "血糖",
      C: "血氧",
      D: "视力",
      E: "血钙",
    },
    answer: "A",
    explanation:
      "苯巴比妥诱导肝酶，可能引起肝损，应监测 ALT/AST。",
  },
  {
    question_type: "单选",
    chapter_code: "C4",
    chapter_title: "第四章 消化道功能与肝胆辅助用药",
    section_code: "C4.3",
    section_title: "第三节 药物监测与相互作用",
    knowledge_point_code: "C4.3.4",
    knowledge_point_title: "胆汁酸与脂溶性维生素",
    stem:
      "长期服用熊去氧胆酸的患者，应重点监测哪类维生素？",
    options: {
      A: "维生素 K",
      B: "维生素 C",
      C: "维生素 B1",
      D: "维生素 B12",
      E: "维生素 B6",
    },
    answer: "A",
    explanation:
      "胆汁酸影响脂溶性维生素吸收，维生素 K 与凝血相关，应监测。",
  },
  {
    question_type: "单选",
    chapter_code: "C4",
    chapter_title: "第四章 消化道功能与肝胆辅助用药",
    section_code: "C4.3",
    section_title: "第三节 药物监测与相互作用",
    knowledge_point_code: "C4.3.5",
    knowledge_point_title: "保肝药与抗凝",
    stem:
      "华法林患者拟增加多烯磷脂酰胆碱辅助治疗，应重点监测哪项？",
    options: {
      A: "凝血功能（INR）",
      B: "肌酸激酶",
      C: "血压",
      D: "血尿素氮",
      E: "呼吸频率",
    },
    answer: "A",
    explanation:
      "影响肝功能的药物可能改变华法林代谢，需监测 INR。",
  },
  {
    question_type: "单选",
    chapter_code: "C4",
    chapter_title: "第四章 消化道功能与肝胆辅助用药",
    section_code: "C4.3",
    section_title: "第三节 药物监测与相互作用",
    knowledge_point_code: "C4.3.6",
    knowledge_point_title: "胆汁酸与药物相互作用",
    stem:
      "胆汁酸制剂患者合用华法林时应优先监测？",
    options: {
      A: "INR",
      B: "肌酸",
      C: "呼吸",
      D: "血糖",
      E: "电解质"
    },
    answer: "A",
    explanation:
      "凝血功能最直接受影响。",
  }
];

async function main() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    for (const q of QUESTIONS) {
      await client.query(
        `
          INSERT INTO public.diagnostic_questions (
            question_type,
            chapter_code,
            chapter_title,
            section_code,
            section_title,
            knowledge_point_code,
            knowledge_point_title,
            stem,
            options,
            answer,
            explanation,
            source_type
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'ai_original')
        `,
        [
          q.question_type,
          q.chapter_code,
          q.chapter_title,
          q.section_code,
          q.section_title,
          q.knowledge_point_code,
          q.knowledge_point_title,
          q.stem,
          JSON.stringify(q.options),
          q.answer,
          q.explanation,
        ],
      );
    }
    await client.query("COMMIT");
    console.log(`Inserted ${QUESTIONS.length} C3/C4 questions.`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to seed C3/C4 questions:", error);
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

