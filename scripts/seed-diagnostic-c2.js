const { Pool } = require("pg");

const QUESTIONS = [
  {
    question_type: "单选",
    chapter_code: "C2",
    chapter_title: "第二章 消化系统用药",
    section_code: "C2.1",
    section_title: "第一节 抑酸与胃黏膜保护",
    knowledge_point_code: "C2.1.2",
    knowledge_point_title: "质子泵抑制剂与氯吡格雷相互作用",
    stem: "冠心病患者长期服用氯吡格雷，因慢性胃溃疡住院。为兼顾抗血小板与抑酸，应首选下列哪种质子泵抑制剂？",
    options: {
      A: "奥美拉唑",
      B: "兰索拉唑",
      C: "雷贝拉唑",
      D: "泮托拉唑",
      E: "埃索美拉唑",
    },
    answer: "D",
    explanation: "本题考查 PPI 与氯吡格雷的相互作用。泮托拉唑对 CYP2C19 抑制最弱，与氯吡格雷合用时对其活性影响最小，最适合合并抗血小板治疗；其他 PPI（如奥美拉唑、埃索美拉唑）均抑制 CYP2C19，可能降低氯吡格雷疗效。",
  },
  {
    question_type: "单选",
    chapter_code: "C2",
    chapter_title: "第二章 消化系统用药",
    section_code: "C2.1",
    section_title: "第一节 抑酸与胃黏膜保护",
    knowledge_point_code: "C2.1.4",
    knowledge_point_title: "H2 受体拮抗剂与华法林相互作用",
    stem: "华法林维持治疗的老年患者出现消化性溃疡，需加用 H2 受体拮抗剂。下列药物中，应首选哪一种以避免显著抑制 CYP2C9？",
    options: {
      A: "西咪替丁",
      B: "雷尼替丁",
      C: "尼扎替丁",
      D: "法莫替丁",
      E: "罗沙替丁",
    },
    answer: "D",
    explanation: "本题考查 H2RA 对 CYP450 的影响。法莫替丁与尼扎替丁对 CYP2C9 抑制最弱，是与华法林合用时的优选；西咪替丁抑制 CYP2C9/CYP3A4，易使华法林浓度升高；雷尼替丁虽影响较小但仍需监测；罗沙替丁与法莫替丁相似，可作为备选。",
  },
  {
    question_type: "单选",
    chapter_code: "C2",
    chapter_title: "第二章 消化系统用药",
    section_code: "C2.1",
    section_title: "第一节 抑酸与胃黏膜保护",
    knowledge_point_code: "C2.1.5",
    knowledge_point_title: "NSAIDs 相关溃疡的预防",
    stem: "类风湿关节炎患者有既往胃溃疡史，需长期服用非甾体抗炎药。为预防溃疡复发，应首选下列哪种合用药物？",
    options: {
      A: "奥美拉唑",
      B: "米索前列醇",
      C: "雷尼替丁",
      D: "枸橼酸铋钾",
      E: "铝碳酸镁",
    },
    answer: "A",
    explanation: "本题考查 NSAIDs 相关溃疡的一级预防。质子泵抑制剂如奥美拉唑能够强力抑酸并促使溃疡愈合，是指南推荐的首选；米索前列醇虽有黏膜保护作用，但腹泻等不良反应较多，不宜首选；其他药物为辅助或次选，疗效不如 PPI。",
  },
  {
    question_type: "单选",
    chapter_code: "C2",
    chapter_title: "第二章 消化系统用药",
    section_code: "C2.2",
    section_title: "第二节 胃肠动力与止吐药",
    knowledge_point_code: "C2.2.1",
    knowledge_point_title: "促动力药的适应证与不良反应",
    stem: "2 型糖尿病患者诊断为胃轻瘫，需使用促胃肠动力药。下列药物中，应首选但需提醒患者可能引起锥体外系反应的是？",
    options: {
      A: "甲氧氯普胺",
      B: "多潘立酮",
      C: "伊托必利",
      D: "莫沙必利",
      E: "西沙必利",
    },
    answer: "A",
    explanation: "本题考查促动力药的选择与不良反应。甲氧氯普胺是胃轻瘫一线用药，可促进胃排空但可穿透血脑屏障，可能诱发锥体外系反应；多潘立酮穿越血脑屏障较少，风险低；伊托必利心电风险低但作用较弱；莫沙必利安全性受限；西沙必利 QT 风险高，禁用于常规患者。",
  },
  {
    question_type: "单选",
    chapter_code: "C2",
    chapter_title: "第二章 消化系统用药",
    section_code: "C2.2",
    section_title: "第二节 胃肠动力与止吐药",
    knowledge_point_code: "C2.2.2",
    knowledge_point_title: "5-HT3 受体拮抗剂与肝功能",
    stem: "肝功能 Child-Pugh B 的白血病患者接受化疗，需预防化疗后呕吐。下列哪种 5-HT3 受体拮抗剂可减量使用而非绝对禁用？",
    options: {
      A: "昂丹司琼",
      B: "帕洛诺司琼",
      C: "阿扎司琼",
      D: "格拉司琼",
      E: "雷米司琼",
    },
    answer: "A",
    explanation: "本题考查 5-HT3 拮抗剂在肝功能不全中的剂量调整。昂丹司琼主要经肝代谢，在 Child-Pugh B 时可通过减量继续使用；帕洛诺司琼半衰期长、堆积风险高，慎用；其余药物肝功能资料更有限或不建议在重度肝病中使用。",
  },
  {
    question_type: "单选",
    chapter_code: "C2",
    chapter_title: "第二章 消化系统用药",
    section_code: "C2.2",
    section_title: "第二节 胃肠动力与止吐药",
    knowledge_point_code: "C2.2.3",
    knowledge_point_title: "促动力药与 QT 间期风险",
    stem: "功能性消化不良患者心电图提示 QT 间期延长，若需使用促动力药，应避免选择下列哪一种以降低心律失常风险？",
    options: {
      A: "伊托必利",
      B: "莫沙必利",
      C: "甲氧氯普胺",
      D: "多潘立酮",
      E: "西沙必利",
    },
    answer: "E",
    explanation: "本题考查促动力药的 QT 风险。西沙必利显著延长 QT 间期并增加尖端扭转型室速风险，已有 QT 延长者应避免；伊托必利与莫沙必利 QT 影响小；甲氧氯普胺需监测但风险低于西沙；多潘立酮风险存在但仍低于西沙。",
  },
  {
    question_type: "单选",
    chapter_code: "C2",
    chapter_title: "第二章 消化系统用药",
    section_code: "C2.3",
    section_title: "第三节 腹泻与肠道抗感染",
    knowledge_point_code: "C2.3.1",
    knowledge_point_title: "侵袭性腹泻的抗菌选择",
    stem: "旅行者因食用生冷食物后出现急性血性腹泻并伴发热，需系统抗菌治疗。下列哪种口服药物首选？",
    options: {
      A: "利福昔明",
      B: "阿奇霉素",
      C: "甲硝唑",
      D: "头孢克肟",
      E: "洛哌丁胺",
    },
    answer: "B",
    explanation: "本题考查侵袭性肠道菌感染。阿奇霉素对志贺菌、弯曲菌等有效，且在妊娠/儿童中可用；利福昔明主要针对非侵袭性产毒菌；甲硝唑针对厌氧或原虫；头孢克肟口服吸收有限；洛哌丁胺为止泻药，脓血便禁用。",
  },
  {
    question_type: "单选",
    chapter_code: "C2",
    chapter_title: "第二章 消化系统用药",
    section_code: "C2.3",
    section_title: "第三节 腹泻与肠道抗感染",
    knowledge_point_code: "C2.3.2",
    knowledge_point_title: "止泻药的风险识别",
    stem: "老年腹泻型肠易激综合征患者长期服用止泻药，近日出现腹痛、腹胀和便秘加重。此时最应首先采取的措施是？",
    options: {
      A: "立即停用止泻药并就医评估有无肠梗阻",
      B: "继续服用洛哌丁胺直到症状缓解",
      C: "换用蒙脱石散继续止泻",
      D: "加用匹维溴铵缓解腹痛",
      E: "增加膳食纤维摄入",
    },
    answer: "A",
    explanation: "本题考查止泻药潜在风险。腹痛、腹胀、便秘加重提示可能肠梗阻或严重便秘，应立即停药并进一步评估；继续或更换止泻药可能掩盖病情，加用解痉或调整饮食不能替代病因评估。",
  },
  {
    question_type: "单选",
    chapter_code: "C2",
    chapter_title: "第二章 消化系统用药",
    section_code: "C2.4",
    section_title: "第四节 肝胆与胆汁分泌药",
    knowledge_point_code: "C2.4.1",
    knowledge_point_title: "熊去氧胆酸的适应证",
    stem: "下列哪种疾病是熊去氧胆酸的主要治疗适应证？",
    options: {
      A: "原发性胆汁性胆管炎",
      B: "急性胆囊炎",
      C: "胃食管反流病",
      D: "肠易激综合征",
      E: "急性胰腺炎",
    },
    answer: "A",
    explanation: "本题考查熊去氧胆酸的主要应用。熊去氧胆酸是治疗原发性胆汁性胆管炎（PBC）的标准药物，能改善肝功能并延缓病程；其余疾病与其机制不匹配。",
  },
  {
    question_type: "单选",
    chapter_code: "C2",
    chapter_title: "第二章 消化系统用药",
    section_code: "C2.4",
    section_title: "第四节 肝胆与胆汁分泌药",
    knowledge_point_code: "C2.4.2",
    knowledge_point_title: "胆道痉挛与解痉药",
    stem: "急性胆绞痛患者需解除胆道痉挛，以下哪种解痉药直接作用于胆道平滑肌？",
    options: {
      A: "匹维溴铵",
      B: "阿托品",
      C: "地西泮",
      D: "莫沙必利",
      E: "奥美拉唑",
    },
    answer: "A",
    explanation: "本题考查胆道专用解痉药。匹维溴铵选择性作用于胆道/胃肠平滑肌，适合胆绞痛；阿托品作用广泛，易致全身副作用；地西泮为中枢肌松药；莫沙必利为促动力药；奥美拉唑为 PPI。",
  },
  {
    question_type: "单选",
    chapter_code: "C2",
    chapter_title: "第二章 消化系统用药",
    section_code: "C2.6",
    section_title: "第六节 肠道抗炎药",
    knowledge_point_code: "C2.6.3",
    knowledge_point_title: "炎症性肠病的 5-ASA 治疗",
    stem: "轻中度溃疡性结肠炎患者准备启动维持治疗，下列哪种口服药物属于 5-ASA 抗炎药的一线用药？",
    options: {
      A: "美沙拉秦",
      B: "柳氮磺吡啶",
      C: "甲氨蝶呤",
      D: "英夫利昔单抗",
      E: "阿达木单抗",
    },
    answer: "A",
    explanation: "本题考查 UC 轻中度的标准抗炎药。美沙拉秦作为 5-ASA 药物可局部抗炎并适合诱导/维持；柳氮磺吡啶需在结肠分解；甲氨蝶呤与生物制剂适用于中重度或耐药者；英夫利昔/阿达木为 TNF 抑制剂，常用于更高风险患者。",
  },
  {
    question_type: "单选",
    chapter_code: "C2",
    chapter_title: "第二章 消化系统用药",
    section_code: "C2.6",
    section_title: "第六节 肠道抗炎药",
    knowledge_point_code: "C2.6.5",
    knowledge_point_title: "柳氮磺吡啶的监测",
    stem: "柳氮磺吡啶治疗溃疡性结肠炎的初期，应重点监测下列哪一项以防骨髓抑制？",
    options: {
      A: "血常规",
      B: "肝功能",
      C: "肾功能",
      D: "血糖",
      E: "血清电解质",
    },
    answer: "A",
    explanation: "本题考查柳氮磺吡啶的最重要毒性。此药可导致粒细胞减少/骨髓抑制，应常规监测血常规；肝肾功能亦需关注但骨髓抑制风险最高；血糖、电解质与其直接毒性关系不强。",
  },
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
    for (const question of QUESTIONS) {
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
          question.question_type,
          question.chapter_code,
          question.chapter_title,
          question.section_code,
          question.section_title,
          question.knowledge_point_code,
          question.knowledge_point_title,
          question.stem,
          JSON.stringify(question.options),
          question.answer,
          question.explanation,
        ],
      );
    }
    await client.query("COMMIT");
    console.log(`Inserted ${QUESTIONS.length} C2 diagnostic questions.`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to seed C2 diagnostic questions:", error);
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

