/**
 * 调试 C7.2.2 匹配问题
 */

import { config } from 'dotenv'
import { Pool } from 'pg'
import { readdir } from 'fs/promises'
import { join } from 'path'

config({ path: '.env.local' })

const KNOWLEDGE_POINT_DIR = join(process.cwd(), 'shuju', '执业药师西药二考点')

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function findPointFiles(code: string, allFiles: string[]): Promise<string[]> {
  const codeNorm = code.trim().toLowerCase()
  const pattern = new RegExp(`^${escapeRegExp(codeNorm)}(?!\\d)`)
  
  console.log(`\n查找 code: ${code}`)
  console.log(`归一化: ${codeNorm}`)
  console.log(`正则: ${pattern}`)
  
  return allFiles.filter(file => {
    const fileName = file.toLowerCase()
    const matches = pattern.test(fileName) && fileName.endsWith('.txt')
    if (matches) {
      console.log(`  ✅ 匹配: ${file}`)
    }
    return matches
  })
}

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  
  const client = await pool.connect()
  
  try {
    // 查找 C7.2.2 考点
    const result = await client.query(`
      SELECT id, code, title
      FROM knowledge_tree
      WHERE code LIKE '%7.2.2%' AND node_type = 'point'
    `)
    
    console.log('数据库中的考点:')
    result.rows.forEach(row => {
      console.log(`  Code: "${row.code}" (长度: ${row.code.length})`)
      console.log(`  Title: ${row.title}`)
      console.log(`  Code bytes: ${JSON.stringify(Array.from(row.code).map(c => c.charCodeAt(0)))}`)
    })
    
    // 读取文件
    const allFiles = await readdir(KNOWLEDGE_POINT_DIR)
    const c7Files = allFiles.filter(f => f.toLowerCase().includes('c7.2.2'))
    
    console.log('\n文件系统中的文件:')
    c7Files.forEach(file => {
      console.log(`  "${file}" (长度: ${file.length})`)
      console.log(`  File bytes: ${JSON.stringify(Array.from(file).map(c => c.charCodeAt(0)))}`)
    })
    
    // 测试匹配
    if (result.rows.length > 0) {
      const code = result.rows[0].code
      const matched = await findPointFiles(code, allFiles)
      console.log(`\n匹配结果: ${matched.length} 个文件`)
    }
    
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(console.error)
