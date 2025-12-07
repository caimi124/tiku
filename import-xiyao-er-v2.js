/**
 * 西药二知识点导入脚本 V2
 * 从 shuju/执业药师西药二1-50页修改版.json 导入到数据库
 * 按章节 -> 小节 -> 考点结构组织
 * 
 * 使用方法: node import-xiyao-er-v2.js
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// 生成UUID
function generateUUID() {
  return crypto.randomUUID()
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

const SUBJECT_CODE = 'xiyao_yaoxue_er'

// 中文数字转阿拉伯数字
function chineseToNumber(chinese) {
  const map = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
    '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15
  }
  return map[chinese] || parseInt(chinese) || 0
}

// 提取口诀
function extractMnemonics(text) {
  const mnemonics = []
  const patterns = [
    /【润德巧记】([^【】\n\|]+)/g,
    /【巧记】([^【】\n\|]+)/g,
    /【口诀】([^【】\n\|]+)/g,
    /\[润德巧记\]([^\[\]\n\|]+)/g,
  ]
  
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const mnemonic = match[1].trim()
      // 过滤掉太长的内容（可能是误匹配）
      if (mnemonic.length > 0 && mnemonic.length < 100) {
        mnemonics.push(mnemonic)
      }
    }
  }
  
  // 去重
  return [...new Set(mnemonics)]
}

// 构建考点内容
function buildPointContent(knowledgePoint) {
  const parts = []
  
  if (!knowledgePoint.content || knowledgePoint.content.length === 0) {
    return ''
  }
  
  for (const item of knowledgePoint.content) {
    if (item.type === 'text' && item.content) {
      parts.push(item.content)
    } else if (item.type === 'table' && item.content) {
      parts.push(item.content)
    } else if (item.type === 'image' && item.content) {
      parts.push(`[图片: ${item.content}]`)
    }
  }
  
  return parts.join('\n\n')
}

// 构建小节通用内容
function buildGeneralContent(generalContent) {
  if (!generalContent || generalContent.length === 0) {
    return ''
  }
  
  const parts = []
  for (const item of generalContent) {
    if (item.type === 'text' && item.content) {
      parts.push(item.content)
    } else if (item.type === 'table' && item.content) {
      parts.push(item.content)
    }
  }
  
  return parts.join('\n\n')
}

async function importFromJson() {
  const client = await pool.connect()
  
  try {
    // 读取JSON文件
    const jsonPath = path.join(__dirname, 'shuju', '执业药师西药二1-50页修改版.json')
    console.log(`读取文件: ${jsonPath}`)
    
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8')
    const data = JSON.parse(jsonContent)
    
    console.log('\n========== 数据统计 ==========')
    console.log(`章节数: ${data.length}`)
    console.log('================================\n')
    
    await client.query('BEGIN')
    
    // 清除现有数据
    console.log('清除现有西药二知识图谱数据...')
    await client.query(`DELETE FROM knowledge_tree WHERE subject_code = $1`, [SUBJECT_CODE])
    
    let totalNodes = 0
    let chapterOrder = 0
    
    // 遍历章节
    for (const chapter of data) {
      chapterOrder++
      const chapterNum = chineseToNumber(chapter.chapter_number)
      
      // 创建章节节点
      const chapterId = generateUUID()
      const chapterTitle = `第${chapter.chapter_number}章 ${chapter.chapter_title}`
      
      await client.query(
        `INSERT INTO knowledge_tree (
          id, code, title, content, node_type, importance, parent_id, 
          subject_code, level, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          chapterId,
          `C${chapterNum}`,
          chapterTitle,
          `包含 ${chapter.sections ? chapter.sections.length : 0} 个小节`,
          'chapter',
          4,
          null,
          SUBJECT_CODE,
          1,
          chapterOrder
        ]
      )
      totalNodes++
      console.log(`\n导入章节: ${chapterTitle}`)
      
      if (!chapter.sections) continue
      
      let sectionOrder = 0
      
      // 遍历小节
      for (const section of chapter.sections) {
        sectionOrder++
        const sectionNum = chineseToNumber(section.section_number)
        
        // 创建小节节点
        const sectionId = generateUUID()
        const sectionTitle = `第${section.section_number}节 ${section.section_title}`
        
        // 收集小节的通用内容
        let sectionContent = ''
        const allKnowledgePoints = []
        
        if (section.parts) {
          for (const [partName, partData] of Object.entries(section.parts)) {
            // 收集通用内容
            if (partData.general_content && partData.general_content.length > 0) {
              const generalText = buildGeneralContent(partData.general_content)
              if (generalText) {
                sectionContent += `【${partName}】\n${generalText}\n\n`
              }
            }
            
            // 收集知识点
            if (partData.knowledge_points && partData.knowledge_points.length > 0) {
              for (const kp of partData.knowledge_points) {
                allKnowledgePoints.push({
                  ...kp,
                  partName: partName
                })
              }
            }
          }
        }
        
        await client.query(
          `INSERT INTO knowledge_tree (
            id, code, title, content, node_type, importance, parent_id, 
            subject_code, level, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            sectionId,
            `C${chapterNum}.${sectionNum}`,
            sectionTitle,
            sectionContent || `包含 ${allKnowledgePoints.length} 个考点`,
            'section',
            4,
            chapterId,
            SUBJECT_CODE,
            2,
            sectionOrder
          ]
        )
        totalNodes++
        console.log(`  导入小节: ${sectionTitle} (${allKnowledgePoints.length} 个考点)`)
        
        // 导入知识点
        let pointOrder = 0
        for (const kp of allKnowledgePoints) {
          pointOrder++
          
          const content = buildPointContent(kp)
          if (!content) continue
          
          // 提取口诀
          const mnemonics = extractMnemonics(content)
          
          // 计算重要性
          let importance = 3
          if (content.includes('禁用') || content.includes('禁忌')) {
            importance = 5
          } else if (content.includes('不良反应') || content.includes('典型')) {
            importance = 4
          }
          
          const pointTitle = `考点${kp.number}: ${kp.title}`
          
          await client.query(
            `INSERT INTO knowledge_tree (
              id, code, title, content, node_type, importance, parent_id, 
              subject_code, level, sort_order, memory_tips, point_type
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              generateUUID(),
              `C${chapterNum}.${sectionNum}.${kp.number}`,
              pointTitle,
              content,
              'point',
              importance,
              sectionId,
              SUBJECT_CODE,
              3,
              pointOrder,
              mnemonics.length > 0 ? mnemonics.join('\n') : null,
              kp.partName
            ]
          )
          totalNodes++
        }
      }
    }
    
    await client.query('COMMIT')
    
    console.log('\n========== 导入完成 ==========')
    console.log(`总节点数: ${totalNodes}`)
    console.log('================================')
    
    // 验证
    const countResult = await client.query(
      `SELECT node_type, COUNT(*) as count FROM knowledge_tree 
       WHERE subject_code = $1 GROUP BY node_type ORDER BY node_type`,
      [SUBJECT_CODE]
    )
    
    console.log('\n数据库验证:')
    for (const row of countResult.rows) {
      console.log(`  ${row.node_type}: ${row.count}`)
    }
    
    // 显示章节列表
    const chaptersResult = await client.query(
      `SELECT code, title FROM knowledge_tree 
       WHERE subject_code = $1 AND node_type = 'chapter' 
       ORDER BY sort_order`,
      [SUBJECT_CODE]
    )
    
    console.log('\n导入的章节:')
    for (const row of chaptersResult.rows) {
      console.log(`  ${row.code}: ${row.title}`)
    }
    
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('导入失败:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// 执行导入
importFromJson()
  .then(() => {
    console.log('\n✅ 西药二知识点导入成功！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 导入出错:', error)
    process.exit(1)
  })
