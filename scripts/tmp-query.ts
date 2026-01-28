import { config } from 'dotenv'
import { Pool } from 'pg'

config({ path: '.env.local' })

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  const pointResult = await pool.query(
    'SELECT id, title FROM knowledge_tree WHERE id = $1',
    ['604ae99d-6c17-488f-8c63-6392a791b206']
  )

  console.log('knowledge_tree rows:', pointResult.rows)

  const knowledgePointResult = await pool.query(
    'SELECT id, point_name, exam_point_type, hf_patterns, pitfalls, hf_generated_at FROM knowledge_points WHERE point_name = $1',
    ['药物分类与代表药品']
  )

  console.log('knowledge_points rows:', knowledgePointResult.rows)
  await pool.end()
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

