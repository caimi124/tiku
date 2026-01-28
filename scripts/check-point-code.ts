/**
 * 检查考点的 code
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
    const pointId = '97ef601a-82a0-43be-8812-0f4939535cd0'
    
    const result = await client.query(`
      SELECT id, code, title, node_type
      FROM knowledge_tree
      WHERE id = $1
    `, [pointId])
    
    if (result.rows.length > 0) {
      const point = result.rows[0]
      console.log('考点信息:')
      console.log(`  ID: ${point.id}`)
      console.log(`  Code: ${point.code || '(空)'}`)
      console.log(`  Title: ${point.title}`)
      console.log(`  Node Type: ${point.node_type}`)
      
      if (point.code) {
        // 检查是否有对应文件
        const { readdir } = await import('fs/promises')
        const { join } = await import('path')
        const KNOWLEDGE_POINT_DIR = join(process.cwd(), 'shuju', '执业药师西药二考点')
        
        const files = await readdir(KNOWLEDGE_POINT_DIR)
        const codeNorm = point.code.toLowerCase().trim()
        const matchedFiles = files.filter(f => {
          const fileName = f.toLowerCase()
          return fileName.startsWith(codeNorm) && fileName.endsWith('.txt')
        })
        
        console.log(`\n匹配的文件: ${matchedFiles.length} 个`)
        matchedFiles.forEach(f => console.log(`  - ${f}`))
      }
    } else {
      console.log('未找到考点')
    }
    
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(console.error)
