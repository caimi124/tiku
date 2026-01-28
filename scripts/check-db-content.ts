/**
 * 检查数据库中的考点内容
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
    // 检查特定考点
    const pointId = '140bc917-8cc4-4931-af31-7a96575b91b6'
    
    const result = await client.query(`
      SELECT 
        id, code, title, content, node_type,
        LENGTH(content) as content_length,
        LEFT(content, 200) as content_preview
      FROM knowledge_tree
      WHERE id = $1
    `, [pointId])
    
    if (result.rows.length > 0) {
      const point = result.rows[0]
      console.log('考点信息:')
      console.log(`  ID: ${point.id}`)
      console.log(`  Code: ${point.code}`)
      console.log(`  Title: ${point.title}`)
      console.log(`  Node Type: ${point.node_type}`)
      console.log(`  Content Length: ${point.content_length}`)
      console.log(`\n内容预览（前200字符）:`)
      console.log(point.content_preview)
      console.log(`\n内容是否包含"第一阶段": ${point.content?.includes('第一阶段') ? '是' : '否'}`)
      console.log(`内容是否包含"建立框架": ${point.content?.includes('建立框架') ? '是' : '否'}`)
    } else {
      console.log('未找到考点')
    }
    
    // 检查 knowledge_point_content_blocks 表是否存在
    const blocksTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'knowledge_point_content_blocks'
      )
    `)
    
    console.log(`\nknowledge_point_content_blocks 表是否存在: ${blocksTableCheck.rows[0].exists}`)
    
    if (blocksTableCheck.rows[0].exists) {
      // 检查该考点是否有内容块
      if (result.rows.length > 0 && result.rows[0].code) {
        const blocksResult = await client.query(`
          SELECT code, stage, module, title, LENGTH(content) as content_length
          FROM knowledge_point_content_blocks
          WHERE UPPER(code) = UPPER($1)
          ORDER BY stage, module
        `, [result.rows[0].code])
        
        console.log(`\n内容块数量: ${blocksResult.rows.length}`)
        if (blocksResult.rows.length > 0) {
          console.log('内容块列表:')
          blocksResult.rows.forEach(block => {
            console.log(`  ${block.stage} - ${block.module}: ${block.title} (${block.content_length} 字符)`)
          })
        }
      }
    }
    
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(console.error)
