const { Pool } = require("pg");

const LICENSE = "western";
const SUBJECT = "western-2";

function ensureEnv() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ 运行失败：缺少 DATABASE_URL，先在 PowerShell 中设置后再执行脚本。");
    process.exit(1);
  }
}

async function main() {
  ensureEnv();
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    const result = await client.query(
      `
        SELECT chapter_code, COUNT(*) AS count
        FROM public.diagnostic_questions
        WHERE license = $1 AND subject = $2 AND chapter_code BETWEEN 'C1' AND 'C13'
        GROUP BY chapter_code
        ORDER BY chapter_code
      `,
      [LICENSE, SUBJECT],
    );

    console.log("当前已导入题目分布：");
    result.rows.forEach((row) => {
      console.log(`  ${row.chapter_code}: ${row.count}`);
    });
  } catch (error) {
    console.error("统计题目分布失败：", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

