/**
 * 检查特定考点 code 在数据库中的状态
 */

import { config } from 'dotenv'
import { Pool } from 'pg'

config({ path: '.env.local' })

async function main() {
  const code = process.argv[2] || 'C8.4.10'
  console.log(`🔍 检查考点: ${code}\n`)
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  
  const client = await pool.connect()
  
  try {
    // 1. 检查文件表
    const fileRecord = await client.query(`
      SELECT code, file_name, file_hash, updated_at
      FROM knowledge_point_content_files
      WHERE UPPER(code) = UPPER($1)
    `, [code])
    
    if (fileRecord.rows.length > 0) {
      console.log('✅ 文件记录存在:')
      console.log(`   文件名: ${fileRecord.rows[0].file_name}`)
      console.log(`   更新时间: ${fileRecord.rows[0].updated_at}`)
    } else {
      console.log('❌ 文件记录不存在')
    }
    console.log('')
    
    // 2. 检查内容块表
    const blocks = await client.query(`
      SELECT code, stage, module, title, LENGTH(content) as content_length
      FROM knowledge_point_content_blocks
      WHERE UPPER(code) = UPPER($1)
      ORDER BY 
        CASE stage 
          WHEN 'stage1' THEN 1 
          WHEN 'stage2' THEN 2 
          WHEN 'stage3' THEN 3 
          ELSE 4 
        END,
        CASE module 
          WHEN 'M02' THEN 1 
          WHEN 'M03' THEN 2 
          WHEN 'M04' THEN 3 
          WHEN 'M05' THEN 4 
          WHEN 'M06' THEN 5 
          ELSE 6 
        END
    `, [code])
    
    if (blocks.rows.length > 0) {
      console.log(`✅ 内容块存在 (共 ${blocks.rows.length} 个):`)
      blocks.rows.forEach(row => {
        console.log(`   ${row.stage} | ${row.module} | ${row.title || '(无标题)'} (${row.content_length} 字符)`)
      })
    } else {
      console.log('❌ 内容块不存在')
      console.log('   建议运行导入脚本: npx tsx scripts/import-point-content-blocks.ts')
    }
    
    // 3. 检查文件系统
    const { readFile } = await import('fs/promises')
    const { join } = await import('path')
    const KNOWLEDGE_POINT_DIR = join(process.cwd(), 'shuju', '执业药师西药二考点')
    const { readdir } = await import('fs/promises')
    
    const files = await readdir(KNOWLEDGE_POINT_DIR)
    const matchingFiles = files.filter(f => 
      f.toLowerCase().startsWith(code.toLowerCase()) && f.endsWith('.txt')
    )
    
    console.log('')
    if (matchingFiles.length > 0) {
      console.log(`✅ 文件系统中找到文件:`)
      matchingFiles.forEach(f => console.log(`   - ${f}`))
    } else {
      console.log(`❌ 文件系统中未找到文件`)
    }
    
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(console.error)
