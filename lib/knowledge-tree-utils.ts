/**
 * KnowledgeTreeNav 工具函数
 * 用于四级树状结构的类型定义和工具函数
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.6
 */

// 节点类型
export type NodeType = 'chapter' | 'section' | 'point' | 'section_summary'

// 掌握状态
export type MasteryStatus = 'mastered' | 'review' | 'weak' | 'unlearned'

// 章节节点
export interface KnowledgeChapter {
  id: string
  code: string
  title: string
  nodeType: 'chapter'
  masteryScore?: number
  pointCount: number
  highFrequencyCount: number
  children: KnowledgeSection[]
}

// 小节节点
export interface KnowledgeSection {
  id: string
  code: string
  title: string
  nodeType: 'section'
  masteryScore?: number
  pointCount: number
  highFrequencyCount: number
  children: KnowledgePoint[]
}

// 考点节点
export interface KnowledgePoint {
  id: string
  code: string
  title: string
  nodeType: 'point' | 'section_summary'
  drugName?: string
  importance: number
  masteryStatus: MasteryStatus
  masteryScore?: number
  isHighFrequency?: boolean  // 高频考点标记
}

// 通用节点类型
export type KnowledgeNode = KnowledgeChapter | KnowledgeSection | KnowledgePoint

// 节点深度映射
export const NODE_DEPTH: Record<NodeType, number> = {
  chapter: 0,
  section: 1,
  point: 2,
  section_summary: 2
}

// 验证节点类型
export function isValidNodeType(type: string): type is NodeType {
  return ['chapter', 'section', 'point', 'section_summary'].includes(type)
}

// 验证掌握状态
export function isValidMasteryStatus(status: string): status is MasteryStatus {
  return ['mastered', 'review', 'weak', 'unlearned'].includes(status)
}


// 检查是否为章节节点
export function isChapterNode(node: KnowledgeNode): node is KnowledgeChapter {
  return node.nodeType === 'chapter'
}

// 检查是否为小节节点
export function isSectionNode(node: KnowledgeNode): node is KnowledgeSection {
  return node.nodeType === 'section'
}

// 检查是否为考点节点
export function isPointNode(node: KnowledgeNode): node is KnowledgePoint {
  return node.nodeType === 'point' || node.nodeType === 'section_summary'
}

// 检查是否为小节总结节点
export function isSectionSummaryNode(node: KnowledgeNode): boolean {
  return node.nodeType === 'section_summary'
}

// 验证章节节点数据完整性
export function validateChapterNode(node: KnowledgeChapter): boolean {
  return (
    typeof node.id === 'string' && node.id.length > 0 &&
    typeof node.code === 'string' && node.code.length > 0 &&
    typeof node.title === 'string' && node.title.length > 0 &&
    node.nodeType === 'chapter' &&
    typeof node.pointCount === 'number' && node.pointCount >= 0 &&
    typeof node.highFrequencyCount === 'number' && node.highFrequencyCount >= 0 &&
    Array.isArray(node.children)
  )
}

// 验证小节节点数据完整性
export function validateSectionNode(node: KnowledgeSection): boolean {
  return (
    typeof node.id === 'string' && node.id.length > 0 &&
    typeof node.code === 'string' && node.code.length > 0 &&
    typeof node.title === 'string' && node.title.length > 0 &&
    node.nodeType === 'section' &&
    typeof node.pointCount === 'number' && node.pointCount >= 0 &&
    typeof node.highFrequencyCount === 'number' && node.highFrequencyCount >= 0 &&
    Array.isArray(node.children)
  )
}

// 验证考点节点数据完整性
export function validatePointNode(node: KnowledgePoint): boolean {
  return (
    typeof node.id === 'string' && node.id.length > 0 &&
    typeof node.code === 'string' && node.code.length > 0 &&
    typeof node.title === 'string' && node.title.length > 0 &&
    node.nodeType === 'point' &&
    typeof node.importance === 'number' && node.importance >= 1 && node.importance <= 5 &&
    isValidMasteryStatus(node.masteryStatus)
  )
}

// 验证树结构层级完整性
export function validateTreeStructure(tree: KnowledgeChapter[]): boolean {
  for (const chapter of tree) {
    if (!validateChapterNode(chapter)) return false
    if (chapter.nodeType !== 'chapter') return false
    
    for (const section of chapter.children) {
      if (!validateSectionNode(section)) return false
      if (section.nodeType !== 'section') return false
      
      for (const point of section.children) {
        if (!validatePointNode(point)) return false
        if (point.nodeType !== 'point') return false
      }
    }
  }
  return true
}

// 获取节点深度
export function getNodeDepth(node: KnowledgeNode): number {
  return NODE_DEPTH[node.nodeType]
}

// 统计树中的考点数量
export function countPoints(tree: KnowledgeChapter[]): number {
  let count = 0
  for (const chapter of tree) {
    for (const section of chapter.children) {
      count += section.children.length
    }
  }
  return count
}

// 统计树中的高频考点数量
export function countHighFrequencyPoints(tree: KnowledgeChapter[]): number {
  let count = 0
  for (const chapter of tree) {
    for (const section of chapter.children) {
      count += section.children.filter(p => p.importance >= 4).length
    }
  }
  return count
}

// 搜索节点
export function searchNodes(
  tree: KnowledgeChapter[],
  query: string
): Set<string> {
  const matchedIds = new Set<string>()
  const trimmedQuery = query.trim()
  
  // 空查询返回空结果
  if (!trimmedQuery) {
    return matchedIds
  }
  
  const lowerQuery = trimmedQuery.toLowerCase()
  
  for (const chapter of tree) {
    let chapterMatched = false
    
    if (chapter.title.toLowerCase().includes(lowerQuery)) {
      matchedIds.add(chapter.id)
      chapterMatched = true
    }
    
    for (const section of chapter.children) {
      let sectionMatched = false
      
      if (section.title.toLowerCase().includes(lowerQuery)) {
        matchedIds.add(section.id)
        sectionMatched = true
        if (!chapterMatched) matchedIds.add(chapter.id)
      }
      
      for (const point of section.children) {
        if (
          point.title.toLowerCase().includes(lowerQuery) ||
          (point.drugName && point.drugName.toLowerCase().includes(lowerQuery))
        ) {
          matchedIds.add(point.id)
          if (!sectionMatched) matchedIds.add(section.id)
          if (!chapterMatched) matchedIds.add(chapter.id)
        }
      }
    }
  }
  
  return matchedIds
}

// 获取节点的父节点ID列表
export function getParentIds(
  tree: KnowledgeChapter[],
  nodeId: string
): string[] {
  for (const chapter of tree) {
    if (chapter.id === nodeId) return []
    
    for (const section of chapter.children) {
      if (section.id === nodeId) return [chapter.id]
      
      for (const point of section.children) {
        if (point.id === nodeId) return [chapter.id, section.id]
      }
    }
  }
  
  return []
}

// 展开/收起状态管理
export function toggleExpanded(
  expandedNodes: Set<string>,
  nodeId: string
): Set<string> {
  const newExpanded = new Set(expandedNodes)
  if (newExpanded.has(nodeId)) {
    newExpanded.delete(nodeId)
  } else {
    newExpanded.add(nodeId)
  }
  return newExpanded
}

// 展开到指定节点
export function expandToNode(
  tree: KnowledgeChapter[],
  nodeId: string,
  currentExpanded: Set<string>
): Set<string> {
  const parentIds = getParentIds(tree, nodeId)
  const newExpanded = new Set(currentExpanded)
  parentIds.forEach(id => newExpanded.add(id))
  return newExpanded
}
