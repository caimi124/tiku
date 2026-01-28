/**
 * 检查小节 code 格式
 */

import { config } from 'dotenv'
import { Pool } from 'pg'

config({ path: '.env.local' })

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  
  const client = await pool.connect()
  
  try {
    // 查找章节 c13 和 c8
    console.log('查找章节 c13 和 c8...\n')
    
    const chapters = await client.query(`
      SELECT id, code, title, node_type
      FROM knowledge_tree
      WHERE subject_code = 'xiyao_yaoxue_er'
        AND node_type = 'chapter'
        AND (code LIKE 'c13%' OR code LIKE 'c8%' OR code LIKE 'C13%' OR code LIKE 'C8%')
      ORDER BY code
    `)
    
    console.log('章节:')
    chapters.rows.forEach(row => {
      console.log(`  ${row.code} - ${row.title} (id: ${row.id})`)
    })
    console.log('')
    
    // 查找小节 c13.2 和 c8.4
    console.log('查找小节 c13.2 和 c8.4...\n')
    
    const sections = await client.query(`
      SELECT id, code, title, node_type, parent_id
      FROM knowledge_tree
      WHERE subject_code = 'xiyao_yaoxue_er'
        AND node_type = 'section'
        AND (
          code LIKE 'c13.2%' OR code LIKE 'C13.2%' OR
          code LIKE 'c8.4%' OR code LIKE 'C8.4%'
        )
      ORDER BY code
    `)
    
    console.log('小节:')
    sections.rows.forEach(row => {
      console.log(`  ${row.code} - ${row.title} (id: ${row.id}, parent: ${row.parent_id})`)
    })
    console.log('')
    
    // 查找相关考点
    console.log('查找相关考点...\n')
    
    const points = await client.query(`
      SELECT id, code, title, node_type, parent_id
      FROM knowledge_tree
      WHERE subject_code = 'xiyao_yaoxue_er'
        AND node_type = 'point'
        AND (
          code LIKE 'c13.2%' OR code LIKE 'C13.2%' OR
          code LIKE 'c8.4%' OR code LIKE 'C8.4%' OR
          code LIKE 'c6.4.2%' OR code LIKE 'c9.22.2%' OR
          code LIKE 'c9.22.3%' OR code LIKE 'c9.4.3%'
        )
      ORDER BY code
      LIMIT 20
    `)
    
    console.log('考点（前20个）:')
    points.rows.forEach(row => {
      console.log(`  ${row.code} - ${row.title} (id: ${row.id}, parent: ${row.parent_id})`)
    })
    
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(console.error)
