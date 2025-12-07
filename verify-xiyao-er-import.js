/**
 * 验证西药二知识点导入结果
 */

const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

const SUBJECT_CODE = 'xiyao_yaoxue_er'

async function verify() {
  const client = await pool.connect()
  
  try {
    // 查看考点示例
    const result = await client.query(`
      SELECT code, title, LEFT(content, 300) as content_preview, memory_tips
      FROM knowledge_tree 
      WHERE subject_code = $1 AND node_type = 'point'
      ORDER BY code
      LIMIT 5
    `, [SUBJECT_CODE])
    
    console.log('\n========== 考点内容示例 ==========')
    for (const row of result.rows) {
      console.log(`\n【${row.code}】${row.title}`)
      console.log(`内容预览: ${row.content_preview}...`)
      if (row.memory_tips) {
        console.log(`记忆口诀: ${row.memory_tips}`)
      }
    }
    
    // 统计各章节考点数
    const statsResult = await client.query(`
      SELECT c.title as chapter, COUNT(p.id) as point_count
      FROM knowledge_tree c
      LEFT JOIN knowledge_tree s ON s.parent_id = c.id AND s.node_type = 'section'
      LEFT JOIN knowledge_tree p ON p.parent_id = s.id AND p.node_type = 'point'
      WHERE c.subject_code = $1 AND c.node_type = 'chapter'
      GROUP BY c.id, c.title, c.sort_order
      ORDER BY c.sort_order
    `, [SUBJECT_CODE])
    
    console.log('\n========== 各章节考点统计 ==========')
    let total = 0
    for (const row of statsResult.rows) {
      console.log(`${row.chapter}: ${row.point_count} 个考点`)
      total += parseInt(row.point_count)
    }
    console.log(`\n总计: ${total} 个考点`)
    
    // 查看有口诀的考点
    const mnemonicResult = await client.query(`
      SELECT code, title, memory_tips
      FROM knowledge_tree 
      WHERE subject_code = $1 AND node_type = 'point' AND memory_tips IS NOT NULL
      ORDER BY code
    `, [SUBJECT_CODE])
    
    console.log('\n========== 包含记忆口诀的考点 ==========')
    for (const row of mnemonicResult.rows) {
      console.log(`【${row.code}】${row.title}`)
      console.log(`  口诀: ${row.memory_tips}`)
    }
    
  } finally {
    client.release()
    await pool.end()
  }
}

verify()
  .then(() => {
    console.log('\n✅ 验证完成！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 验证出错:', error)
    process.exit(1)
  })
