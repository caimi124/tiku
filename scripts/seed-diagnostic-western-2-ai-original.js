const { Pool } = require("pg");
const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data/diagnostic/western-2/ai_original");
const LICENSE = "western";
const SUBJECT = "western-2";
const SOURCE_TYPE = "ai_original";
const DEFAULT_CHAPTERS = ["C5", "C6", "C7", "C8", "C9", "C10", "C11", "C12", "C13"];
const REQUIRED_OPTION_KEYS = ["A", "B", "C", "D"];
const PLACEHOLDER_REGEX = /占位|placeholder|【占位题】/i;

function normalizeChapterList(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
}

function splitChapterTokens(raw) {
  return raw
    .split(/[, ]+/)
    .map((token) => token.trim().toUpperCase())
    .filter(Boolean);
}

function parseCliChapters(argv = process.argv.slice(2)) {
  const chapters = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      continue;
    }
    if (arg.startsWith("--chapters=")) {
      chapters.push(...splitChapterTokens(arg.slice("--chapters=".length)));
      continue;
    }
    if (arg === "--chapters") {
      let j = i + 1;
      while (j < argv.length && !argv[j].startsWith("--")) {
        chapters.push(...splitChapterTokens(argv[j]));
        j += 1;
      }
      i = j - 1;
      continue;
    }
    if (!arg.startsWith("--")) {
      chapters.push(...splitChapterTokens(arg));
    }
  }
  return [...new Set(chapters)];
}

async function loadQuestionFiles(dataDirectory) {
  const entries = await fs.readdir(dataDirectory);
  const files = entries.filter((entry) => entry.endsWith(".json"));
  const byChapter = new Map();

  for (const file of files) {
    const absolute = path.join(dataDirectory, file);
    const fileName = path.basename(file);
    const raw = await fs.readFile(absolute, "utf-8");
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new Error(`无法解析 ${file}: ${error.message}`);
    }
    if (!Array.isArray(parsed)) {
      throw new Error(`${file} 必须导出一个问题数组`);
    }
    for (const item of parsed) {
      const chapterFromFile = path.basename(file, ".json").toUpperCase();
      const chapterCode =
        (typeof item.chapter_code === "string" && item.chapter_code.trim().toUpperCase()) ||
        chapterFromFile;
      if (!chapterCode) {
        throw new Error(`${fileName} 中存在缺少 chapter_code 的题目`);
      }
      if (!item.stem || typeof item.stem !== "string") {
        throw new Error(`${fileName} 的某题缺少有效 stem`);
      }
      if (PLACEHOLDER_REGEX.test(item.stem)) {
        throw new Error(`占位题出现在 ${fileName}：${item.stem}`);
      }
      if (!item.section_code || !item.section_title) {
        throw new Error(`${fileName} 的题目缺少节/章节描述`);
      }
      if (!item.knowledge_point_code || !item.knowledge_point_title) {
        throw new Error(`${fileName} 的题目缺少知识点描述`);
      }
      const options = item.options;
      if (!options || typeof options !== "object") {
        throw new Error(`${fileName} 的题目缺少 options`);
      }
      for (const key of REQUIRED_OPTION_KEYS) {
        if (typeof options[key] !== "string") {
          throw new Error(`${fileName} 中问题缺少选项 ${key}`);
        }
      }

      const normalized = {
        question_type: item.question_type || "单选",
        chapter_code: chapterCode,
        chapter_title: item.chapter_title || "",
        section_code: item.section_code,
        section_title: item.section_title,
        knowledge_point_code: item.knowledge_point_code,
        knowledge_point_title: item.knowledge_point_title,
        stem: item.stem.trim(),
        options: options,
        answer: item.answer,
        explanation: item.explanation,
      };

      if (!normalized.chapter_title) {
        throw new Error(`${fileName} 的题目缺少 chapter_title`);
      }
      if (!normalized.answer || typeof normalized.answer !== "string") {
        throw new Error(`${fileName} 的题目缺少 answer`);
      }
      if (!normalized.explanation || typeof normalized.explanation !== "string") {
        throw new Error(`${fileName} 的题目缺少 explanation`);
      }

      if (!byChapter.has(chapterCode)) {
        byChapter.set(chapterCode, []);
      }
      byChapter.get(chapterCode).push(normalized);
    }
  }

  return byChapter;
}

async function seedWestern2AiOriginal(options = {}) {
  const requested = options.chapters ?? [];
  const envChapters = normalizeChapterList(process.env.CHAPTERS || "");
  const chapters = requested.length
    ? requested
    : envChapters.length
    ? envChapters
    : DEFAULT_CHAPTERS;

  const invalid = chapters.filter((code) => !DEFAULT_CHAPTERS.includes(code));
  if (invalid.length) {
    throw new Error(`不支持的章节：${invalid.join(", ")}`);
  }

  const dataDir = options.dataDir || DATA_DIR;
  const byChapter = await loadQuestionFiles(dataDir);
  const chaptersToSeed = chapters.filter((code) => byChapter.has(code));
  if (!chaptersToSeed.length) {
    throw new Error(`未在 ${dataDir} 发现这批章节的题目：${chapters.join(", ")}`);
  }

  const missing = chapters.filter((code) => !byChapter.has(code));
  if (missing.length) {
    console.warn(`以下章节未提供题目数据，跳过：${missing.join(", ")}`);
  }

  const isDryRun = Boolean(options.dryRun);
  if (isDryRun) {
    console.log("🔎 Dry run 模式，仅校验 JSON 并统计题量：");
    let dryRunTotal = 0;
    for (const chapterCode of chaptersToSeed) {
      const count = byChapter.get(chapterCode)?.length ?? 0;
      dryRunTotal += count;
      console.log(`  ${chapterCode}: ${count} 道`);
    }
    console.log(`✅ Dry run 完成，共 ${dryRunTotal} 道题`);
    return;
  }

  console.log("🌐 Connecting to database...");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  let client;
  try {
    client = await pool.connect();
    console.log("✅ 数据库连接成功");
  } catch (error) {
    await pool.end();
    throw new Error(`无法连接数据库：${error.message}`);
  }

  const stats = {};
  let totalInserted = 0;

  try {
    await client.query("BEGIN");
    const deleteResult = await client.query(
      `
        DELETE FROM public.diagnostic_questions
        WHERE license = $1 AND subject = $2 AND chapter_code = ANY($3)
      `,
      [LICENSE, SUBJECT, chaptersToSeed],
    );
    console.log(`🧹 已删除旧题 ${deleteResult.rowCount} 条`);

    const insertQuery = `
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
    `;

    for (const chapterCode of chaptersToSeed) {
      const chapterQuestions = byChapter.get(chapterCode) ?? [];
      stats[chapterCode] = 0;
      for (const question of chapterQuestions) {
        await client.query(insertQuery, [
          question.question_type,
          question.stem,
          JSON.stringify(question.options),
          question.answer,
          question.explanation,
          SOURCE_TYPE,
          LICENSE,
          SUBJECT,
          question.chapter_code,
          question.chapter_title,
          question.section_code,
          question.section_title,
          question.knowledge_point_code,
          question.knowledge_point_title,
        ]);
        stats[chapterCode] += 1;
        totalInserted += 1;
      }
      console.log(`  -> ${chapterCode}: 插入 ${stats[chapterCode]} 道`);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  console.log("✅ Diagnostic ai_original questions imported:");
  for (const chapterCode of chaptersToSeed) {
    console.log(`  ${chapterCode}: ${stats[chapterCode] || 0} 道`);
  }
  console.log(`✅ 总计：${totalInserted} 道`);
  if (!totalInserted) {
    throw new Error("未插入任何题目，请检查数据文件是否为空。");
  }
}

module.exports = { seedWestern2AiOriginal };

if (require.main === module) {
  (async () => {
    const argv = process.argv.slice(2);
    const cliChapters = parseCliChapters(argv);
    const isDryRun = argv.includes("--dry-run");
    await seedWestern2AiOriginal({
      chapters: cliChapters.length ? cliChapters : undefined,
      dryRun: isDryRun,
    });
  })()
    .then(() => {
      console.log("诊断题目导入完成。");
    })
    .catch((error) => {
      console.error("诊断题导入失败：", error.stack || error.message);
      process.exit(1);
    });
}

