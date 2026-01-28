/**
 * 考点文件更新脚本
 * 
 * 功能：
 * 1. 删除指定考点（C6.4.2, C9.22.2, C9.22.3, C9.4.3）
 * 2. 更新指定考点（C13.2.1, C13.2.2, C8.4.1）- 从文件读取内容更新
 * 3. 新增指定考点（C8.4.10, C8.4.11, C8.4.12）- 从文件读取内容插入
 * 
 * 运行命令：npx tsx scripts/update-point-files.ts
 */

import { config } from 'dotenv'
import { Pool } from 'pg'
import { readFile, readdir } from 'fs/promises'
import { join } from 'path'

config({ path: '.env.local' })

const KNOWLEDGE_POINT_DIR = join(process.cwd(), 'shuju', '执业药师西药二考点')
const SUBJECT_CODE = 'xiyao_yaoxue_er'

// 要删除的考点 code
const CODES_TO_DELETE = ['c6.4.2', 'c9.22.2', 'c9.22.3', 'c9.4.3']

// 要更新的考点 code 和文件名
const CODES_TO_UPDATE: Array<{ code: string; filename: string }> = [
  { code: 'c13.2.1', filename: 'c13.2.1药物分类与代表药品.txt' },
  { code: 'c13.2.2', filename: 'C13.2.2药物临床用药评价.txt' },
  { code: 'c8.4.1', filename: 'c8.4.1胰岛素和胰岛素类似物的分类与代表药品.txt' }
]

// 要新增的考点 code 和文件名
const CODES_TO_ADD: Array<{ code: string; filename: string; title: string }> = [
  { 
    code: 'c8.4.10', 
    filename: 'c8.4.10钠-葡萄糖协同转运蛋白2抑制剂的临床用药评价.txt',
    title: '钠-葡萄糖协同转运蛋白2抑制剂的临床用药评价'
  },
  { 
    code: 'c8.4.11', 
    filename: 'c8.4.11葡萄糖激酶激活剂的临床用药评价.txt',
    title: '葡萄糖激酶激活剂的临床用药评价'
  },
  { 
    code: 'c8.4.12', 
    filename: 'c8.4.12肠促胰素类降糖药的临床用药评价.txt',
    title: '肠促胰素类降糖药的临床用药评价'
  }
]

/**
 * 从文件名提取标题
 */
function extractTitleFromFilename(filename: string): string {
  // 移除 .txt 扩展名和 code 前缀
  const withoutExt = filename.replace(/\.txt$/i, '')
  const match = withoutExt.match(/^c\d+\.\d+\.\d+(.+)$/i)
  if (match && match[1]) {
    return match[1].trim()
  }
  return withoutExt
}

/**
 * 查找实际的文件名（处理大小写）
 */
async function findActualFilename(expectedFilename: string): Promise<string | null> {
  try {
    const files = await readdir(KNOWLEDGE_POINT_DIR)
    const lowerExpected = expectedFilename.toLowerCase()
    
    // 精确匹配
    const exactMatch = files.find(f => f === expectedFilename)
    if (exactMatch) return exactMatch
    
    // 大小写不敏感匹配
    const caseInsensitiveMatch = files.find(f => f.toLowerCase() === lowerExpected)
    if (caseInsensitiveMatch) return caseInsensitiveMatch
    
    return null
  } catch (error) {
    console.error('读取目录失败:', error)
    return null
  }
}

/**
 * 获取考点的父节点信息
 */
async function getParentInfo(client: any, code: string): Promise<{ parent_id: string; sort_order: number } | null> {
  // 从 code 提取章节和小节信息（如 c8.4.10 -> 章节 C8, 小节 C8.4）
  const parts = code.split('.')
  if (parts.length < 2) return null
  
  // 转换为大写格式（数据库中使用大写）
  const sectionCode = `${parts[0].toUpperCase()}.${parts[1]}`
  
  // 查找小节（大小写不敏感）
  const sectionResult = await client.query(`
    SELECT id, code
    FROM knowledge_tree
    WHERE UPPER(code) = UPPER($1) AND node_type = 'section' AND subject_code = $2
    LIMIT 1
  `, [sectionCode, SUBJECT_CODE])
  
  if (sectionResult.rows.length === 0) {
    console.warn(`   ⚠️  未找到小节: ${sectionCode}`)
    return null
  }
  
  const sectionId = sectionResult.rows[0].id
  
  // 查找该小节下已有考点的最大 sort_order
  const maxOrderResult = await client.query(`
    SELECT COALESCE(MAX(sort_order), 0) as max_order
    FROM knowledge_tree
    WHERE parent_id = $1 AND node_type = 'point'
  `, [sectionId])
  
  const maxOrder = parseInt(maxOrderResult.rows[0].max_order) || 0
  
  return {
    parent_id: sectionId,
    sort_order: maxOrder + 1
  }
}

async function main() {
  console.log('🚀 开始更新考点文件...\n')
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  
  const client = await pool.connect()
  
  try {
    // 1. 删除指定考点
    console.log('🗑️  删除指定考点...')
    for (const code of CODES_TO_DELETE) {
      const result = await client.query(`
        DELETE FROM knowledge_tree
        WHERE UPPER(code) = UPPER($1) AND node_type = 'point' AND subject_code = $2
      `, [code, SUBJECT_CODE])
      
      if (result.rowCount > 0) {
        console.log(`   ✅ 已删除: ${code}`)
      } else {
        console.log(`   ⚠️  未找到: ${code}`)
      }
    }
    console.log('')
    
    // 2. 更新指定考点
    console.log('📝 更新指定考点...')
    for (const { code, filename } of CODES_TO_UPDATE) {
      try {
        // 查找实际文件名（处理大小写）
        const actualFilename = await findActualFilename(filename)
        if (!actualFilename) {
          console.error(`   ❌ 文件不存在: ${filename}`)
          continue
        }
        
        const filePath = join(KNOWLEDGE_POINT_DIR, actualFilename)
        const content = await readFile(filePath, 'utf-8')
        const title = extractTitleFromFilename(filename)
        
        // 查找现有考点（大小写不敏感）
        const existingResult = await client.query(`
          SELECT id, title, code as actual_code
          FROM knowledge_tree
          WHERE UPPER(code) = UPPER($1) AND node_type = 'point' AND subject_code = $2
          LIMIT 1
        `, [code, SUBJECT_CODE])
        
        if (existingResult.rows.length === 0) {
          console.log(`   ⚠️  未找到考点: ${code}，将作为新增处理`)
          // 获取父节点信息
          const parentInfo = await getParentInfo(client, code)
          if (!parentInfo) {
            console.log(`   ❌ 无法获取父节点信息: ${code}`)
            continue
          }
          
          // 插入新考点（使用大写 code）
          const pointId = `xiyao_er_${code.replace(/\./g, '_').replace(/c/gi, '')}`
          const upperCode = code.toUpperCase()
          await client.query(`
            INSERT INTO knowledge_tree (
              id, code, title, content, node_type, point_type, drug_name,
              importance, importance_level, learn_mode, error_pattern_tags,
              memory_tips, parent_id, subject_code, level, sort_order
            ) VALUES (
              $1, $2, $3, $4, 'point', NULL, NULL,
              3, 3, 'BOTH', '{}',
              NULL, $5, $6, 3, $7
            )
          `, [
            pointId,
            upperCode,
            title,
            content,
            parentInfo.parent_id,
            SUBJECT_CODE,
            parentInfo.sort_order
          ])
          
          console.log(`   ✅ 已新增: ${upperCode} - ${title}`)
        } else {
          // 更新现有考点
          const pointId = existingResult.rows[0].id
          const actualCode = existingResult.rows[0].actual_code
          await client.query(`
            UPDATE knowledge_tree
            SET title = $1, content = $2
            WHERE id = $3
          `, [title, content, pointId])
          
          console.log(`   ✅ 已更新: ${actualCode} - ${title}`)
        }
      } catch (error) {
        console.error(`   ❌ 更新失败: ${code}`, error instanceof Error ? error.message : String(error))
      }
    }
    console.log('')
    
    // 3. 新增指定考点
    console.log('➕ 新增指定考点...')
    for (const { code, filename, title } of CODES_TO_ADD) {
      try {
        // 检查是否已存在（大小写不敏感）
        const existingResult = await client.query(`
          SELECT id, code as actual_code
          FROM knowledge_tree
          WHERE UPPER(code) = UPPER($1) AND node_type = 'point' AND subject_code = $2
          LIMIT 1
        `, [code, SUBJECT_CODE])
        
        if (existingResult.rows.length > 0) {
          const actualCode = existingResult.rows[0].actual_code
          console.log(`   ⚠️  考点已存在: ${actualCode}，跳过`)
          continue
        }
        
        // 查找实际文件名（处理大小写）
        const actualFilename = await findActualFilename(filename)
        if (!actualFilename) {
          console.error(`   ❌ 文件不存在: ${filename}`)
          continue
        }
        
        const filePath = join(KNOWLEDGE_POINT_DIR, actualFilename)
        const content = await readFile(filePath, 'utf-8')
        
        // 获取父节点信息
        const parentInfo = await getParentInfo(client, code)
        if (!parentInfo) {
          console.log(`   ❌ 无法获取父节点信息: ${code}`)
          continue
        }
        
        // 插入新考点（使用大写 code）
        const pointId = `xiyao_er_${code.replace(/\./g, '_').replace(/c/gi, '')}`
        const upperCode = code.toUpperCase()
        await client.query(`
          INSERT INTO knowledge_tree (
            id, code, title, content, node_type, point_type, drug_name,
            importance, importance_level, learn_mode, error_pattern_tags,
            memory_tips, parent_id, subject_code, level, sort_order
          ) VALUES (
            $1, $2, $3, $4, 'point', NULL, NULL,
            3, 3, 'BOTH', '{}',
            NULL, $5, $6, 3, $7
          )
        `, [
          pointId,
          upperCode,
          title,
          content,
          parentInfo.parent_id,
          SUBJECT_CODE,
          parentInfo.sort_order
        ])
        
        console.log(`   ✅ 已新增: ${upperCode} - ${title}`)
      } catch (error) {
        console.error(`   ❌ 新增失败: ${code}`, error instanceof Error ? error.message : String(error))
      }
    }
    console.log('')
    
    console.log('✅ 更新完成！')
    
  } catch (error) {
    console.error('❌ 执行失败:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
