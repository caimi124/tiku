/**
 * 诊断 C8.4.10 考点内容问题
 */

import { config } from 'dotenv'
import { Pool } from 'pg'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

config({ path: '.env.local' })

async function main() {
  const code = 'C8.4.10'
  console.log(`🔍 诊断考点: ${code}\n`)
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  
  const client = await pool.connect()
  
  try {
    // 1. 检查 knowledge_tree 表中的 code
    console.log('1. 检查 knowledge_tree 表中的 code...\n')
    const treeResult = await client.query(`
      SELECT id, code, title
      FROM knowledge_tree
      WHERE code = $1 OR code = $2 OR code = $3
    `, [code, code.toLowerCase(), '8.4.10'])
    
    if (treeResult.rows.length > 0) {
      console.log('✅ 找到知识点记录:')
      treeResult.rows.forEach(row => {
        console.log(`   ID: ${row.id}`)
        console.log(`   Code: ${row.code}`)
        console.log(`   Title: ${row.title}`)
      })
    } else {
      console.log('❌ knowledge_tree 表中未找到该 code')
    }
    console.log('')
    
    // 2. 检查 knowledge_point_content_blocks 表
    console.log('2. 检查 knowledge_point_content_blocks 表...\n')
    const blocksResult = await client.query(`
      SELECT code, stage, module, title, LENGTH(content) as content_length
      FROM knowledge_point_content_blocks
      WHERE UPPER(code) = UPPER($1) OR code = $2 OR code = $3
      ORDER BY stage, module
    `, [code, code.toLowerCase(), '8.4.10'])
    
    if (blocksResult.rows.length > 0) {
      console.log(`✅ 找到 ${blocksResult.rows.length} 个内容块:`)
      blocksResult.rows.forEach(row => {
        console.log(`   ${row.code} | ${row.stage} | ${row.module} | ${row.title || '(无标题)'} (${row.content_length} 字符)`)
      })
    } else {
      console.log('❌ knowledge_point_content_blocks 表中未找到内容块')
    }
    console.log('')
    
    // 3. 检查文件系统
    console.log('3. 检查文件系统...\n')
    const projectDir = process.cwd()
    const defaultDir = join(projectDir, 'shuju', '执业药师西药二考点')
    const desktopDir = 'C:\\Users\\chupi\\Desktop\\执业药师西药二考点'
    
    console.log(`   项目目录: ${defaultDir}`)
    console.log(`   桌面目录: ${desktopDir}`)
    
    // 检查项目目录
    try {
      const files = await readdir(defaultDir)
      const matchingFiles = files.filter(f => 
        f.toLowerCase().includes('c8.4.10') || 
        f.toLowerCase().includes('8.4.10')
      )
      
      if (matchingFiles.length > 0) {
        console.log(`   ✅ 项目目录中找到 ${matchingFiles.length} 个匹配文件:`)
        matchingFiles.forEach(f => console.log(`      - ${f}`))
      } else {
        console.log('   ❌ 项目目录中未找到匹配文件')
      }
    } catch (error) {
      console.log(`   ⚠️  无法读取项目目录: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    // 检查桌面目录
    try {
      const desktopFiles = await readdir(desktopDir)
      const matchingDesktopFiles = desktopFiles.filter(f => 
        f.toLowerCase().includes('c8.4.10') || 
        f.toLowerCase().includes('8.4.10')
      )
      
      if (matchingDesktopFiles.length > 0) {
        console.log(`   ✅ 桌面目录中找到 ${matchingDesktopFiles.length} 个匹配文件:`)
        matchingDesktopFiles.forEach(f => console.log(`      - ${f}`))
      } else {
        console.log('   ❌ 桌面目录中未找到匹配文件')
      }
    } catch (error) {
      console.log(`   ⚠️  无法读取桌面目录: ${error instanceof Error ? error.message : String(error)}`)
    }
    console.log('')
    
    // 4. 检查 knowledge_point_content_files 表
    console.log('4. 检查 knowledge_point_content_files 表...\n')
    const filesResult = await client.query(`
      SELECT code, file_name, file_hash, updated_at
      FROM knowledge_point_content_files
      WHERE UPPER(code) = UPPER($1) OR code = $2 OR code = $3
    `, [code, code.toLowerCase(), '8.4.10'])
    
    if (filesResult.rows.length > 0) {
      console.log('✅ 找到文件记录:')
      filesResult.rows.forEach(row => {
        console.log(`   Code: ${row.code}`)
        console.log(`   文件名: ${row.file_name}`)
        console.log(`   更新时间: ${row.updated_at}`)
      })
    } else {
      console.log('❌ knowledge_point_content_files 表中未找到文件记录')
    }
    
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(console.error)
