/**
 * scripts/seed-diagnostic-c5-c13.js
 *
 * 功能：
 * 1) 清理 western / western-2 的 C5~C13 旧题
 * 2) 生成并写入 C5~C13 每章 12 道（每节 4 道）占位单选题
 *
 * 运行：
 *   node scripts/seed-diagnostic-c5-c13.js
 *
 * 依赖：
 *  - 环境变量 DATABASE_URL 已配置（.env.local / 系统环境变量）
 */

const { Pool } = require("pg");

const LICENSE = "western";
const SUBJECT = "western-2";
const SOURCE_TYPE = "ai_original";

const CHAPTERS = [
  {
    code: "C5",
    title: "第五章 骨骼肌肉与康复系统用药",
    sections: [
      { code: "C5.1", title: "第一节 抗炎与抗风湿" },
      { code: "C5.2", title: "第二节 骨代谢调控" },
      { code: "C5.3", title: "第三节 康复辅助与止痛" },
    ],
  },
  {
    code: "C6",
    title: "第六章 内分泌及代谢性疾病用药",
    sections: [
      { code: "C6.1", title: "第一节 糖尿病与代谢评估" },
      { code: "C6.2", title: "第二节 内分泌治疗" },
      { code: "C6.3", title: "第三节 代谢并发与康复" },
    ],
  },
  {
    code: "C7",
    title: "第七章 心血管系统用药",
    sections: [
      { code: "C7.1", title: "第一节 高血压药" },
      { code: "C7.2", title: "第二节 冠心病与血脂" },
      { code: "C7.3", title: "第三节 心衰与心律" },
    ],
  },
  {
    code: "C8",
    title: "第八章 泌尿系统与肾病用药",
    sections: [
      { code: "C8.1", title: "第一节 利尿与 RAAS" },
      { code: "C8.2", title: "第二节 泌尿抗菌" },
      { code: "C8.3", title: "第三节 肾病支持" },
    ],
  },
  {
    code: "C9",
    title: "第九章 抗感染与免疫调节用药",
    sections: [
      { code: "C9.1", title: "第一节 抗菌药" },
      { code: "C9.2", title: "第二节 抗病毒/真菌" },
      { code: "C9.3", title: "第三节 免疫调节" },
    ],
  },
  {
    code: "C10",
    title: "第十章 血液系统与止血辅助用药",
    sections: [
      { code: "C10.1", title: "第一节 抗凝与止血" },
      { code: "C10.2", title: "第二节 血液生成" },
      { code: "C10.3", title: "第三节 输血与止血" },
    ],
  },
  {
    code: "C11",
    title: "第十一章 肿瘤治疗与支持用药",
    sections: [
      { code: "C11.1", title: "第一节 传统化疗" },
      { code: "C11.2", title: "第二节 靶向与免疫" },
      { code: "C11.3", title: "第三节 护理与支持" },
    ],
  },
  {
    code: "C12",
    title: "第十二章 急症与毒理用药",
    sections: [
      { code: "C12.1", title: "第一节 急症止痛与呼吸" },
      { code: "C12.2", title: "第二节 毒理解毒" },
      { code: "C12.3", title: "第三节 危急心脑" },
    ],
  },
  {
    code: "C13",
    title: "第十三章 皮肤与皮肤病用药",
    sections: [
      { code: "C13.1", title: "第一节 皮炎与抗炎" },
      { code: "C13.2", title: "第二节 真菌/病毒" },
      { code: "C13.3", title: "第三节 屏障修复" },
    ],
  },
];

const QUESTIONS_PER_SECTION = 4;

function buildPlaceholderQuestion(chapter, section, i) {
  const no = i + 1;
  return {
    question_type: "单选",
    stem: `【占位题】${chapter.title} - ${section.title}（第 ${no} 题）：请选择最合理的选项。`,
    options: {
      A: "正确选项 A（占位）",
      B: "干扰选项 B（占位）",
      C: "干扰选项 C（占位）",
      D: "干扰选项 D（占位）",
      E: "干扰选项 E（占位）",
    },
    answer: "A",
    explanation:
      `本题为占位测试题，用于验证抽题与结果页复盘流程。` +
      `解析请后续替换为“考点→为何选A→其余选项为何不选”的三段式，并使用“主要/常见/适用于”等相对表述。`,
    source_type: SOURCE_TYPE,
    chapter_code: chapter.code,
    chapter_title: chapter.title,
    section_code: section.code,
    section_title: section.title,
    knowledge_point_code: `${section.code}.${no}`,
    knowledge_point_title: `考点 ${section.code}.${no}`,
    license: LICENSE,
    subject: SUBJECT,
  };
}

function buildAllQuestions() {
  const questions = [];
  for (const chapter of CHAPTERS) {
    for (const section of chapter.sections) {
      for (let i = 0; i < QUESTIONS_PER_SECTION; i += 1) {
        questions.push(buildPlaceholderQuestion(chapter, section, i));
      }
    }
  }
  return questions;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ 缺少环境变量 DATABASE_URL。请检查 .env.local 或系统环境变量。");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  const questions = buildAllQuestions();

  const chapterCodes = CHAPTERS.map((c) => c.code);
  const stats = {};
  let totalInserted = 0;

  try {
    await client.query("BEGIN");

    // 清理旧题
    await client.query(
      `
        DELETE FROM public.diagnostic_questions
        WHERE license = $1 AND subject = $2 AND chapter_code = ANY($3)
      `,
      [LICENSE, SUBJECT, chapterCodes],
    );

    // 插入新题
    for (const q of questions) {
      await client.query(
        `
          INSERT INTO public.diagnostic_questions (
            question_type,
            stem,
            options,
            answer,
            explanation,
            source_type,
            license,
            subject,
            chapter_code,
            chapter_title,
            section_code,
            section_title,
            knowledge_point_code,
            knowledge_point_title
          )
          VALUES ($1,$2,$3::jsonb,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        `,
        [
          q.question_type,
          q.stem,
          JSON.stringify(q.options),
          q.answer,
          q.explanation,
          q.source_type,
          q.license,
          q.subject,
          q.chapter_code,
          q.chapter_title,
          q.section_code,
          q.section_title,
          q.knowledge_point_code,
          q.knowledge_point_title,
        ],
      );

      stats[q.chapter_code] = (stats[q.chapter_code] || 0) + 1;
      totalInserted += 1;
    }

    await client.query("COMMIT");

    console.log("✅ C5–C13 占位题导入完成，数量如下：");
    for (const chapter of CHAPTERS) {
      console.log(`  ${chapter.code} (${chapter.title}): ${stats[chapter.code] || 0} 道`);
    }
    console.log(`✅ 总计：${totalInserted} 道`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ C5–C13 导入失败：", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  main();
}
