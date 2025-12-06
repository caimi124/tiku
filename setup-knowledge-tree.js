/**
 * 创建知识点树表并导入数据
 * 使用方法: node setup-knowledge-tree.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase 配置
const SUPABASE_URL = 'https://tparjdkxxtnentsdazfw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE4MTAzOCwiZXhwIjoyMDc4NzU3MDM4fQ.i0nA_AOLnBdeK7chICmeltFchkdJmYKMVqVxu8IaofE'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function importData() {
  console.log('开始导入知识点数据...')
  
  // 读取JSON数据
  const dataPath = path.join(__dirname, 'shuju', '西药药二_数据库记录_v2.json')
  const rawData = fs.readFileSync(dataPath, 'utf-8')
  const records = JSON.parse(rawData)
  
  console.log(`读取到 ${records.length} 条记录`)
  
  // 按层级排序
  const sortedRecords = records.sort((a, b) => a.level - b.level)
  
  // 转换为数据库格式
  const dbRecords = sortedRecords.map(record => ({
    id: record.id,
    code: record.code,
    title: record.title,
    content: record.content || null,
    node_type: record.type,
    point_type: record.point_type || null,
    drug_name: record.drug_name || null,
    importance: record.importance || 3,
    memory_tips: record.memory_tips || null,
    parent_id: record.parent_id,
    subject_code: record.subject_code,
    level: record.level,
    sort_order: parseInt(record.code.split('.').pop() || '0')
  }))
  
  // 分批插入（每批20条）
  const batchSize = 20
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < dbRecords.length; i += batchSize) {
    const batch = dbRecords.slice(i, i + batchSize)
    
    const { data, error } = await supabase
      .from('knowledge_tree')
      .upsert(batch, { onConflict: 'id' })
    
    if (error) {
      console.error(`批次 ${Math.floor(i/batchSize) + 1} 导入失败:`, error.message)
      errorCount += batch.length
    } else {
      successCount += batch.length
      console.log(`已导入 ${successCount}/${dbRecords.length} 条记录...`)
    }
  }
  
  console.log('\n=== 导入完成 ===')
  console.log(`成功: ${successCount} 条`)
  console.log(`失败: ${errorCount} 条`)
}

async function verifyData() {
  console.log('\n验证导入结果...')
  
  // 统计各类型数量
  const { data: chapters, count: chapterCount } = await supabase
    .from('knowledge_tree')
    .select('*', { count: 'exact', head: true })
    .eq('node_type', 'chapter')
  
  const { count: sectionCount } = await supabase
    .from('knowledge_tree')
    .select('*', { count: 'exact', head: true })
    .eq('node_type', 'section')
  
  const { count: pointCount } = await supabase
    .from('knowledge_tree')
    .select('*', { count: 'exact', head: true })
    .eq('node_type', 'knowledge_point')
  
  console.log('\n=== 数据统计 ===')
  console.log(`章节数: ${chapterCount || 0}`)
  console.log(`小节数: ${sectionCount || 0}`)
  console.log(`知识点数: ${pointCount || 0}`)
  
  // 显示章节列表
  const { data: chapterList } = await supabase
    .from('knowledge_tree')
    .select('code, title')
    .eq('node_type', 'chapter')
    .order('code')
  
  console.log('\n=== 章节列表 ===')
  if (chapterList) {
    chapterList.forEach(ch => {
      console.log(`第${ch.code}章 ${ch.title}`)
    })
  }
}

async function main() {
  try {
    // 先检查表是否存在
    const { data, error } = await supabase
      .from('knowledge_tree')
      .select('id')
      .limit(1)
    
    if (error && error.code === '42P01') {
      console.log('表不存在，请先在Supabase控制台执行SQL创建表')
      console.log('SQL文件: create-knowledge-tree-tables.sql')
      return
    }
    
    // 导入数据
    await importData()
    
    // 验证数据
    await verifyData()
    
    console.log('\n✅ 知识点树设置完成!')
    
  } catch (error) {
    console.error('执行出错:', error)
  }
}

main()
