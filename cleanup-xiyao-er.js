const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

async function cleanup() {
  const client = await pool.connect()
  try {
    const result = await client.query("DELETE FROM knowledge_tree WHERE subject_code = 'xiyao-er'")
    console.log('已删除 xiyao-er 数据:', result.rowCount, '条')
  } finally {
    client.release()
    await pool.end()
  }
}

cleanup()
