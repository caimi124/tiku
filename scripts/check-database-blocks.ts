/**
 * 检查数据库中的内容块数据
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
    // 1. 检查表是否存在
    console.log('1. 检查表是否存在...\n')
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('knowledge_point_content_blocks', 'knowledge_point_content_files')
      ORDER BY table_name
    `)
    
    console.log('找到的表:')
    tableCheck.rows.forEach(row => {
      console.log(`  - ${row.table_name}`)
    })
    console.log('')
    
    // 2. 检查 knowledge_point_content_files 表的数据
    if (tableCheck.rows.some(r => r.table_name === 'knowledge_point_content_files')) {
      console.log('2. 检查 knowledge_point_content_files 表...\n')
      const filesCount = await client.query(`
        SELECT COUNT(*) as count FROM knowledge_point_content_files
      `)
      console.log(`   文件记录数: ${filesCount.rows[0].count}`)
      
      const sampleFiles = await client.query(`
        SELECT code, file_name, file_hash, updated_at
        FROM knowledge_point_content_files
        ORDER BY updated_at DESC
        LIMIT 5
      `)
      
      if (sampleFiles.rows.length > 0) {
        console.log('\n   示例文件记录（最近5个）:')
        sampleFiles.rows.forEach(row => {
          console.log(`     - ${row.code}: ${row.file_name}`)
          console.log(`       更新时间: ${row.updated_at}`)
        })
      }
      console.log('')
    }
    
    // 3. 检查 knowledge_point_content_blocks 表的数据
    if (tableCheck.rows.some(r => r.table_name === 'knowledge_point_content_blocks')) {
      console.log('3. 检查 knowledge_point_content_blocks 表...\n')
      const blocksCount = await client.query(`
        SELECT COUNT(*) as count FROM knowledge_point_content_blocks
      `)
      console.log(`   内容块记录数: ${blocksCount.rows[0].count}`)
      
      // 按 code 分组统计
      const codeStats = await client.query(`
        SELECT code, COUNT(*) as block_count, 
               COUNT(DISTINCT stage) as stage_count,
               COUNT(DISTINCT module) as module_count
        FROM knowledge_point_content_blocks
        GROUP BY code
        ORDER BY block_count DESC
        LIMIT 10
      `)
      
      if (codeStats.rows.length > 0) {
        console.log('\n   按考点 code 统计（前10个）:')
        codeStats.rows.forEach(row => {
          console.log(`     - ${row.code}: ${row.block_count} 个块, ${row.stage_count} 个阶段, ${row.module_count} 个模块`)
        })
      }
      
      // 检查特定考点
      const testCode = 'C5.2.1'
      const testBlocks = await client.query(`
        SELECT code, stage, module, title, LENGTH(content) as content_length
        FROM knowledge_point_content_blocks
        WHERE UPPER(code) = UPPER($1)
        ORDER BY stage, module
      `, [testCode])
      
      if (testBlocks.rows.length > 0) {
        console.log(`\n   示例：考点 ${testCode} 的内容块:`)
        testBlocks.rows.forEach(row => {
          console.log(`     - ${row.stage} | ${row.module} | ${row.title || '(无标题)'} (内容长度: ${row.content_length})`)
        })
      } else {
        console.log(`\n   ⚠️  考点 ${testCode} 在数据库中无内容块记录`)
      }
      console.log('')
    } else {
      console.log('3. ⚠️  knowledge_point_content_blocks 表不存在\n')
    }
    
    // 4. 检查是否有考点文件
    console.log('4. 检查考点文件目录...\n')
    const { readdir } = await import('fs/promises')
    const { join } = await import('path')
    const KNOWLEDGE_POINT_DIR = join(process.cwd(), 'shuju', '执业药师西药二考点')
    
    try {
      const files = await readdir(KNOWLEDGE_POINT_DIR)
      const txtFiles = files.filter(f => f.endsWith('.txt'))
      console.log(`   找到 ${txtFiles.length} 个 .txt 文件`)
      console.log(`   示例文件（前5个）:`)
      txtFiles.slice(0, 5).forEach(f => console.log(`     - ${f}`))
    } catch (error) {
      console.log(`   ⚠️  无法读取目录: ${error instanceof Error ? error.message : String(error)}`)
    }
    
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(console.error)
