/**
 * 西药二知识点导入脚本
 * 从 shuju/西药药二_知识点_完整版.json 导入到数据库
 * 
 * 使用方法: npx ts-node import-xiyao-er-from-json.ts
 */

import { Pool } from 'pg'
import * as fs from 'fs'
import * as path from 'path'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

const SUBJECT_CODE = 'xiyao-er'

interface DrugInfo {
  名称: string
  分类: string
  亚类: string
  作用特点: {
    作用机制: string[]
    选择性: string
    适应证: string[]
    药动学: Record<string, string>
    特殊特点: string[]
  }
  不良反应: {
    严重: string[]
    中度: string[]
    轻度: string[]
    常见: string[]
    典型: string[]
  }
  药物相互作用: {
    协同: string[]
    拮抗: string[]
    禁忌合用: string[]
    慎重合用: string[]
    一般: string[]
  }
  禁忌证: string[]
  注意事项: string[]
  用法用量: Record<string, string>
  临床应用: string[]
  特殊人群用药: Record<string, string>
  考点标记: string[]
  相关图片: string[]
}

interface ExamPoint {
  名称: string
  章节: string
  小节: string
  考试年份: string[]
  相关药物: string[]
  内容: string
}

interface KnowledgeData {
  统计信息: {
    药物总数: number
    考点总数: number
    表格总数: number
    图片引用数: number
    药物列表: string[]
  }
  药物信息: Record<string, DrugInfo>
  考点列表: ExamPoint[]
  表格数据: any[]
  图片引用: Record<string, any>
}

// 提取口诀
function extractMnemonics(text: string): string[] {
  const mnemonics: string[] = []
  const patterns = [
    /【润德巧记】([^【】]+)/g,
    /【巧记】([^【】]+)/g,
    /【口诀】([^【】]+)/g,
  ]
  
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      mnemonics.push(match[1].trim())
    }
  }
  
  return mnemonics
}

// 构建药物内容
function buildDrugContent(drug: DrugInfo): string {
  const parts: string[] = []
  
  // 分类信息
  if (drug.分类) {
    parts.push(`【分类】${drug.分类}`)
  }
  if (drug.亚类) {
    parts.push(`【亚类】${drug.亚类}`)
  }
  
  // 作用机制
  if (drug.作用特点.作用机制.length > 0) {
    parts.push(`【作用机制】\n${drug.作用特点.作用机制.join('\n')}`)
  }
  
  // 作用特点
  if (drug.作用特点.特殊特点.length > 0) {
    parts.push(`【作用特点】\n${drug.作用特点.特殊特点.join('\n')}`)
  }
  
  // 不良反应
  const adverseReactions: string[] = []
  if (drug.不良反应.严重.length > 0) {
    adverseReactions.push(`🔴 严重：${drug.不良反应.严重.join('；')}`)
  }
  if (drug.不良反应.中度.length > 0) {
    adverseReactions.push(`🟡 中度：${drug.不良反应.中度.join('；')}`)
  }
  if (drug.不良反应.轻度.length > 0) {
    adverseReactions.push(`🟢 轻度：${drug.不良反应.轻度.join('；')}`)
  }
  if (drug.不良反应.典型.length > 0 && adverseReactions.length === 0) {
    adverseReactions.push(`典型：${drug.不良反应.典型.join('；')}`)
  }
  if (adverseReactions.length > 0) {
    parts.push(`【不良反应】\n${adverseReactions.join('\n')}`)
  }
  
  // 药物相互作用
  const interactions: string[] = []
  if (drug.药物相互作用.禁忌合用.length > 0) {
    interactions.push(`禁忌合用：${drug.药物相互作用.禁忌合用.join('；')}`)
  }
  if (drug.药物相互作用.一般.length > 0) {
    interactions.push(`相互作用：${drug.药物相互作用.一般.join('；')}`)
  }
  if (interactions.length > 0) {
    parts.push(`【药物相互作用】\n${interactions.join('\n')}`)
  }
  
  // 禁忌证
  if (drug.禁忌证.length > 0) {
    parts.push(`【禁忌证】${drug.禁忌证.join('；')}`)
  }
  
  // 提取口诀
  const allText = parts.join('\n')
  const mnemonics = extractMnemonics(allText)
  if (mnemonics.length > 0) {
    parts.push(`【记忆口诀】\n${mnemonics.join('\n')}`)
  }
  
  return parts.join('\n\n')
}

async function importFromJson() {
  const client = await pool.connect()
  
  try {
    // 读取JSON文件
    const jsonPath = path.join(__dirname, 'shuju', '西药药二_知识点_完整版.json')
    console.log(`读取文件: ${jsonPath}`)
    
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8')
    const data: KnowledgeData = JSON.parse(jsonContent)
    
    console.log('\n========== 数据统计 ==========')
    console.log(`药物总数: ${data.统计信息.药物总数}`)
    console.log(`考点总数: ${data.统计信息.考点总数}`)
    console.log(`表格总数: ${data.统计信息.表格总数}`)
    console.log('================================\n')
    
    await client.query('BEGIN')
    
    // 清除现有数据
    console.log('清除现有西药二知识图谱数据...')
    await client.query(`DELETE FROM knowledge_tree WHERE subject_code = $1`, [SUBJECT_CODE])
    
    // 按分类组织药物
    const drugsByCategory: Record<string, DrugInfo[]> = {}
    for (const [name, drug] of Object.entries(data.药物信息)) {
      const category = drug.分类 || '其他'
      if (!drugsByCategory[category]) {
        drugsByCategory[category] = []
      }
      drugsByCategory[category].push(drug)
    }
    
    let chapterOrder = 0
    let totalNodes = 0
    
    // 导入药物信息（按分类）
    for (const [category, drugs] of Object.entries(drugsByCategory)) {
      chapterOrder++
      
      // 创建章节节点
      const chapterResult = await client.query(
        `INSERT INTO knowledge_tree (
          code, title, content, node_type, importance, parent_id, 
          subject_code, level, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`,
        [
          `C${chapterOrder}`,
          category,
          `包含 ${drugs.length} 种药物`,
          'chapter',
          4,
          null,
          SUBJECT_CODE,
          1,
          chapterOrder
        ]
      )
      const chapterId = chapterResult.rows[0].id
      totalNodes++
      console.log(`导入章节: ${category} (${drugs.length} 种药物)`)
      
      // 导入该分类下的药物
      let drugOrder = 0
      for (const drug of drugs) {
        drugOrder++
        const content = buildDrugContent(drug)
        
        // 计算重要性（根据内容丰富程度）
        let importance = 3
        if (drug.不良反应.严重.length > 0 || drug.药物相互作用.一般.length > 0) {
          importance = 4
        }
        if (drug.作用特点.作用机制.length > 0 && drug.不良反应.严重.length > 0) {
          importance = 5
        }
        
        await client.query(
          `INSERT INTO knowledge_tree (
            code, title, content, node_type, importance, parent_id, 
            subject_code, level, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            `C${chapterOrder}.${drugOrder}`,
            drug.名称,
            content,
            'point',
            importance,
            chapterId,
            SUBJECT_CODE,
            2,
            drugOrder
          ]
        )
        totalNodes++
      }
    }
    
    // 导入考点列表
    if (data.考点列表 && data.考点列表.length > 0) {
      chapterOrder++
      
      // 创建考点章节
      const examChapterResult = await client.query(
        `INSERT INTO knowledge_tree (
          code, title, content, node_type, importance, parent_id, 
          subject_code, level, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`,
        [
          `EXAM`,
          '考点汇总',
          `包含 ${data.考点列表.length} 个考点`,
          'chapter',
          5,
          null,
          SUBJECT_CODE,
          1,
          chapterOrder
        ]
      )
      const examChapterId = examChapterResult.rows[0].id
      totalNodes++
      console.log(`\n导入考点汇总: ${data.考点列表.length} 个考点`)
      
      let examOrder = 0
      for (const examPoint of data.考点列表) {
        examOrder++
        
        // 构建考点内容
        let examContent = examPoint.内容 || ''
        if (examPoint.考试年份.length > 0) {
          examContent = `【考试年份】${examPoint.考试年份.join('、')}\n\n${examContent}`
        }
        if (examPoint.相关药物.length > 0) {
          examContent = `【相关药物】${examPoint.相关药物.join('、')}\n\n${examContent}`
        }
        
        // 提取口诀
        const mnemonics = extractMnemonics(examContent)
        
        await client.query(
          `INSERT INTO knowledge_tree (
            code, title, content, node_type, importance, parent_id, 
            subject_code, level, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            `EXAM.${examOrder}`,
            examPoint.名称,
            examContent,
            'point',
            examPoint.考试年份.length > 0 ? 5 : 4,
            examChapterId,
            SUBJECT_CODE,
            2,
            examOrder
          ]
        )
        totalNodes++
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
