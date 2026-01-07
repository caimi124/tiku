/**
 * 聚合节点（Aggregation Node）自动识别工具
 * 
 * 用于检测考点详情页是否因内容粒度过大导致结构骨架/模块错配与页面混乱的问题
 */

import { hasClassificationTable, hasTable } from '@/lib/contentUtils'
import { extractDrugsFromContent } from './contentExtractor'

export interface AggregationDetectionResult {
  is_aggregation_node: boolean
  aggregation_reasons: string[]
  aggregation_candidates: string[]
}

/**
 * 从内容中提取表格信息
 */
function extractTablesFromContent(content: string): Array<{
  headers: string[]
  rows: string[][]
  type: 'classification' | 'drug_info' | 'other'
}> {
  if (!content) return []

  const tables: Array<{
    headers: string[]
    rows: string[][]
    type: 'classification' | 'drug_info' | 'other'
  }> = []

  const lines = content.split('\n')
  let currentTable: string[] = []
  let inTable = false

  for (const line of lines) {
    const trimmed = line.trim()
    
    // 检测表格开始（Markdown表格格式）
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) {
        inTable = true
        currentTable = []
      }
      currentTable.push(trimmed)
    } else if (inTable) {
      // 表格结束
      if (currentTable.length >= 2) {
        // 解析表格
        const headers = currentTable[0]
          .split('|')
          .map(h => h.trim())
          .filter(Boolean)
        
        // 跳过分隔行
        const dataRows = currentTable
          .slice(1)
          .filter(row => !row.match(/^\|[\s\-|]+\|$/))
          .map(row => 
            row.split('|')
              .map(cell => cell.trim())
              .filter(Boolean)
          )
          .filter(row => row.length > 0)

        if (headers.length > 0 && dataRows.length > 0) {
          // 判断表格类型
          const headerStr = headers.join('')
          let type: 'classification' | 'drug_info' | 'other' = 'other'
          
          if (/分类|类型|种类|类别/.test(headerStr) && 
              (/代表药|药品|药物/.test(headerStr) || /作用机制|机制/.test(headerStr))) {
            type = 'classification'
          } else if (/药品|药物/.test(headerStr) && 
                     (/作用特点|不良反应|禁忌|相互作用|适应证/.test(headerStr))) {
            type = 'drug_info'
          }

          tables.push({
            headers,
            rows: dataRows,
            type
          })
        }
      }
      currentTable = []
      inTable = false
    }
  }

  // 处理最后一个表格
  if (inTable && currentTable.length >= 2) {
    const headers = currentTable[0]
      .split('|')
      .map(h => h.trim())
      .filter(Boolean)
    
    const dataRows = currentTable
      .slice(1)
      .filter(row => !row.match(/^\|[\s\-|]+\|$/))
      .map(row => 
        row.split('|')
          .map(cell => cell.trim())
          .filter(Boolean)
      )
      .filter(row => row.length > 0)

    if (headers.length > 0 && dataRows.length > 0) {
      const headerStr = headers.join('')
      let type: 'classification' | 'drug_info' | 'other' = 'other'
      
      if (/分类|类型|种类|类别/.test(headerStr) && 
          (/代表药|药品|药物/.test(headerStr) || /作用机制|机制/.test(headerStr))) {
        type = 'classification'
      } else if (/药品|药物/.test(headerStr) && 
                 (/作用特点|不良反应|禁忌|相互作用|适应证/.test(headerStr))) {
        type = 'drug_info'
      }

      tables.push({
        headers,
        rows: dataRows,
        type
      })
    }
  }

  return tables
}

/**
 * 从内容中提取药品名称
 */
function extractDrugNames(content: string): string[] {
  const drugNames = new Set<string>()
  
  // 方法1：从表格中提取
  const tables = extractTablesFromContent(content)
  for (const table of tables) {
    // 查找包含药品名称的列
    const drugColIndex = table.headers.findIndex(h => 
      /药品|药物|代表药|药物名称|名称/.test(h)
    )
    
    if (drugColIndex >= 0) {
      for (const row of table.rows) {
        if (row[drugColIndex]) {
          const drugName = row[drugColIndex].trim()
          // 清理药名（移除括号内容、特殊字符等）
          const cleanName = drugName
            .replace(/[（(].*?[）)]/g, '')
            .replace(/【.*?】/g, '')
            .replace(/[润德巧记].*/g, '')
            .trim()
          
          if (cleanName && cleanName.length > 0 && cleanName.length < 20) {
            drugNames.add(cleanName)
          }
        }
      }
    }
  }

  // 方法2：使用现有的提取函数
  const extractedDrugs = extractDrugsFromContent(content)
  for (const drug of extractedDrugs) {
    if (drug.name) {
      drugNames.add(drug.name)
    }
  }

  // 方法3：从文本中识别常见药名模式
  const drugPatterns = [
    /([\u4e00-\u9fa5]{2,8})(?:酸|酯|胺|素|醇|酮|林|平|汀|洛尔|普利|地平|噻嗪|司琼|拉唑|替丁|必利|沙芬|维林|哌林)/g,
    /【([\u4e00-\u9fa5]{2,10})】/g,
    /([\u4e00-\u9fa5]{2,8})(?:的|临床用药评价|用药|作用|特点)/g,
  ]

  for (const pattern of drugPatterns) {
    const matches = content.matchAll(pattern)
    for (const match of matches) {
      const name = match[1]?.trim()
      if (name && name.length >= 2 && name.length <= 10) {
        // 排除常见非药名词汇
        if (!/作用|机制|特点|分类|类型|禁忌|不良反应|相互作用|适应证/.test(name)) {
          drugNames.add(name)
        }
      }
    }
  }

  return Array.from(drugNames)
}

/**
 * 检测是否为聚合节点
 */
export function detectAggregationNode(
  pointId: string,
  content: string | undefined | null
): AggregationDetectionResult {
  const result: AggregationDetectionResult = {
    is_aggregation_node: false,
    aggregation_reasons: [],
    aggregation_candidates: []
  }

  if (!content || content.trim().length === 0) {
    return result
  }

  // 提取表格
  const tables = extractTablesFromContent(content)
  const classificationTables = tables.filter(t => t.type === 'classification')
  const drugInfoTables = tables.filter(t => t.type === 'drug_info')
  const allTables = tables

  // 提取药品名称
  const drugNames = extractDrugNames(content)
  result.aggregation_candidates = drugNames

  // 【条件A】同时存在"药物分类表"和"药物信息表"
  if (classificationTables.length > 0 && drugInfoTables.length > 0) {
    result.is_aggregation_node = true
    result.aggregation_reasons.push(
      `同时存在药物分类表（${classificationTables.length}个）和药物信息表（${drugInfoTables.length}个）`
    )
  }

  // 【条件B】可识别的不同药品名数量 ≥ 4
  if (drugNames.length >= 4) {
    result.is_aggregation_node = true
    result.aggregation_reasons.push(
      `可识别的不同药品名数量 ≥ 4（当前：${drugNames.length}个）`
    )
  }

  // 【条件C】同一内容里既出现分类体系又出现单药细节块
  const hasClassificationSystem = 
    /(?:第[一二三四五六七八九十\d]+[类种]|I{1,4}|[\d一二三四五六七八九十]+[\.、]\s*)/.test(content) ||
    /分类依据|分类体系|分为.*类|主要分为/.test(content) ||
    classificationTables.length > 0 ||
    hasClassificationTable(content)
  
  const hasSingleDrugDetails = 
    /作用特点|不良反应|禁忌|相互作用|适应证|适应症/.test(content) &&
    /【[\u4e00-\u9fa5]{2,10}】|[\u4e00-\u9fa5]{2,10}(?:的|临床用药评价)/.test(content) &&
    drugInfoTables.length > 0

  if (hasClassificationSystem && hasSingleDrugDetails) {
    result.is_aggregation_node = true
    result.aggregation_reasons.push(
      '同一内容里既出现分类体系（如 I/II/III/IV 类、分类依据、代表药）又出现单药细节块（作用特点/不良反应/禁忌/相互作用）'
    )
  }

  // 【条件D】（可选兜底）表格数量 ≥ 2 或单药信息块 ≥ 3
  if (allTables.length >= 2) {
    // 检查是否有多个不同的单药信息块
    const singleDrugBlocks = content.match(/【[\u4e00-\u9fa5]{2,10}】|[\u4e00-\u9fa5]{2,10}(?:的|临床用药评价)/g) || []
    const uniqueDrugBlocks = new Set(singleDrugBlocks)
    
    if (uniqueDrugBlocks.size >= 3) {
      result.is_aggregation_node = true
      result.aggregation_reasons.push(
        `表格数量 ≥ 2（当前：${allTables.length}个）且单药信息块 ≥ 3（当前：${uniqueDrugBlocks.size}个）`
      )
    } else if (allTables.length >= 3) {
      result.is_aggregation_node = true
      result.aggregation_reasons.push(
        `表格数量 ≥ 3（当前：${allTables.length}个）`
      )
    }
  }

  return result
}

/**
 * 记录聚合节点日志
 */
export function logAggregationNode(
  pointId: string,
  result: AggregationDetectionResult
): void {
  if (!result.is_aggregation_node) {
    return
  }

  const logData = {
    point_id: pointId,
    timestamp: new Date().toISOString(),
    aggregation_reasons: result.aggregation_reasons,
    aggregation_candidates: result.aggregation_candidates,
    candidate_count: result.aggregation_candidates.length
  }

  // 控制台日志
  console.group(`[聚合节点检测] ${pointId}`)
  console.log('判定结果:', result.is_aggregation_node ? '是聚合节点' : '非聚合节点')
  console.log('判定原因:', result.aggregation_reasons)
  console.log('候选药名:', result.aggregation_candidates)
  console.log('完整数据:', logData)
  console.groupEnd()

  // 可选：写入本地存储或发送到日志系统
  if (typeof window !== 'undefined') {
    try {
      const existingLogs = JSON.parse(
        localStorage.getItem('aggregation_nodes_log') || '[]'
      ) as Array<typeof logData>
      
      // 避免重复记录
      if (!existingLogs.some(log => log.point_id === pointId)) {
        existingLogs.push(logData)
        localStorage.setItem('aggregation_nodes_log', JSON.stringify(existingLogs))
      }
    } catch (e) {
      // 忽略存储错误
    }
  }
}

/**
 * 导出待拆分清单（用于后续批量拆点）
 * 返回 CSV 格式字符串
 */
export function exportAggregationNodesList(
  logs: Array<{
    point_id: string
    timestamp: string
    aggregation_reasons: string[]
    aggregation_candidates: string[]
    candidate_count: number
  }>
): string {
  if (logs.length === 0) {
    return 'point_id,聚合原因,候选药名数量,候选药名列表,检测时间\n'
  }

  const csvRows = [
    'point_id,聚合原因,候选药名数量,候选药名列表,检测时间'
  ]

  for (const log of logs) {
    const reasons = log.aggregation_reasons.join('; ')
    const candidates = log.aggregation_candidates.join('; ')
    csvRows.push(
      `"${log.point_id}","${reasons}",${log.candidate_count},"${candidates}","${log.timestamp}"`
    )
  }

  return csvRows.join('\n')
}

/**
 * 导出待拆分清单为 JSON 格式
 */
export function exportAggregationNodesListJSON(
  logs: Array<{
    point_id: string
    timestamp: string
    aggregation_reasons: string[]
    aggregation_candidates: string[]
    candidate_count: number
  }>
): string {
  return JSON.stringify(logs, null, 2)
}

