const { Pool } = require('pg');

async function main() {
  const sql = process.argv.slice(2).join(' ');
  if (!sql) {
    console.error('Usage: node scripts/db-query.js "<SQL>"');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false },
  });

  try {
    const result = await pool.query(sql);
    console.log(result.rows);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

