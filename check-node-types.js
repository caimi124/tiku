const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

async function check() {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT node_type, COUNT(*) as count 
      FROM knowledge_tree 
      WHERE subject_code = 'xiyao_yaoxue_er' 
      GROUP BY node_type 
      ORDER BY node_type
    `)
    console.log('数据库中的 node_type:')
    result.rows.forEach(row => console.log('  ' + row.node_type + ': ' + row.count))
  } finally {
    client.release()
    await pool.end()
  }
}

check()
