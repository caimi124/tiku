/**
 * 检查数据库表并导入内容块
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
    
    const hasFilesTable = tableCheck.rows.some(r => r.table_name === 'knowledge_point_content_files')
    const hasBlocksTable = tableCheck.rows.some(r => r.table_name === 'knowledge_point_content_blocks')
    
    console.log(`   knowledge_point_content_files: ${hasFilesTable ? '✅ 存在' : '❌ 不存在'}`)
    console.log(`   knowledge_point_content_blocks: ${hasBlocksTable ? '✅ 存在' : '❌ 不存在'}\n`)
    
    if (!hasFilesTable || !hasBlocksTable) {
      console.log('⚠️  表不存在，需要先执行迁移脚本:')
      console.log('   在 Supabase SQL Editor 中执行: migrations/010-point-content-blocks.sql\n')
      return
    }
    
    // 2. 检查数据
    const filesCount = await client.query(`SELECT COUNT(*) as count FROM knowledge_point_content_files`)
    const blocksCount = await client.query(`SELECT COUNT(*) as count FROM knowledge_point_content_blocks`)
    
    console.log('2. 检查数据...\n')
    console.log(`   文件记录数: ${filesCount.rows[0].count}`)
    console.log(`   内容块记录数: ${blocksCount.rows[0].count}\n`)
    
    if (parseInt(blocksCount.rows[0].count) === 0) {
      console.log('⚠️  数据库中没有内容块数据！')
      console.log('   需要运行导入脚本: npx tsx scripts/import-point-content-blocks.ts\n')
    } else {
      // 显示示例数据
      const sample = await client.query(`
        SELECT code, COUNT(*) as block_count
        FROM knowledge_point_content_blocks
        GROUP BY code
        ORDER BY block_count DESC
        LIMIT 5
      `)
      
      console.log('   示例考点（内容块数量最多的5个）:')
      sample.rows.forEach(row => {
        console.log(`     - ${row.code}: ${row.block_count} 个块`)
      })
    }
    
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(console.error)
