/**
 * 导入知识点树到数据库
 * 使用方法: npx ts-node import-knowledge-tree.ts
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface KnowledgeRecord {
  type: string
  id: string
  code: string
  title: string
  content?: string
  point_type?: string
  drug_name?: string
  importance?: number
  learn_mode?: string
  importance_level?: number
  error_pattern_tags?: string[]
  memory_tips?: string
  parent_id: string | null
  subject_code: string
  level: number
}

async function importKnowledgeTree() {
  console.log('开始导入知识点树...')
  
  // 读取JSON数据
  const dataPath = path.join(__dirname, 'shuju', '西药药二_数据库记录_v2.json')
  const rawData = fs.readFileSync(dataPath, 'utf-8')
  const records: KnowledgeRecord[] = JSON.parse(rawData)
  
  console.log(`读取到 ${records.length} 条记录`)
  
  // 按层级排序（先导入章节，再导入小节，最后导入知识点）
  const sortedRecords = records.sort((a, b) => a.level - b.level)
  
  // 使用原生SQL插入数据
  let successCount = 0
  let errorCount = 0
  
  for (const record of sortedRecords) {
    try {
      await prisma.$executeRaw`
        INSERT INTO knowledge_tree (
          id, code, title, content, node_type, point_type, 
          drug_name, importance, importance_level, learn_mode, error_pattern_tags,
          memory_tips, parent_id, subject_code, level, sort_order
        ) VALUES (
          ${record.id},
          ${record.code},
          ${record.title},
          ${record.content || null},
          ${record.type},
          ${record.point_type || null},
          ${record.drug_name || null},
          ${record.importance || 3},
          ${record.importance || 3},
          ${record.learn_mode || 'BOTH'},
          ${record.error_pattern_tags || []},
          ${record.memory_tips || null},
          ${record.parent_id},
          ${record.subject_code},
          ${record.level},
          ${parseInt(record.code.split('.').pop() || '0')}
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          point_type = EXCLUDED.point_type,
          drug_name = EXCLUDED.drug_name,
          importance = EXCLUDED.importance,
          importance_level = EXCLUDED.importance_level,
          learn_mode = EXCLUDED.learn_mode,
          error_pattern_tags = EXCLUDED.error_pattern_tags,
          memory_tips = EXCLUDED.memory_tips,
          updated_at = NOW()
      `
      successCount++
      
      if (successCount % 10 === 0) {
        console.log(`已导入 ${successCount} 条记录...`)
      }
    } catch (error) {
      errorCount++
      console.error(`导入失败: ${record.id} - ${record.title}`, error)
    }
  }
  
  console.log('\n=== 导入完成 ===')
  console.log(`成功: ${successCount} 条`)
  console.log(`失败: ${errorCount} 条`)
  
  // 统计导入结果
  const stats = await prisma.$queryRaw`
    SELECT 
      node_type,
      COUNT(*) as count
    FROM knowledge_tree
    WHERE subject_code = 'xiyao_yaoxue_er'
    GROUP BY node_type
    ORDER BY 
      CASE node_type 
        WHEN 'chapter' THEN 1 
        WHEN 'section' THEN 2 
        WHEN 'knowledge_point' THEN 3 
      END
  `
  
  console.log('\n=== 数据统计 ===')
  console.log(stats)
}

async function main() {
  try {
    await importKnowledgeTree()
  } catch (error) {
    console.error('导入出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
