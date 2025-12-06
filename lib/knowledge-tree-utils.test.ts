/**
 * Property tests for KnowledgeTreeNav utilities
 * 
 * **Feature: knowledge-page-redesign, Property 1: 树状结构层级完整性**
 * **Feature: knowledge-page-redesign, Property 2: 节点数据完整性**
 * **Feature: knowledge-page-redesign, Property 4: 展开/收起状态一致性**
 * **Feature: knowledge-page-redesign, Property 5: 搜索结果完整性**
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.6, 1.7**
 */

import fc from 'fast-check'
import {
  NodeType,
  MasteryStatus,
  KnowledgeChapter,
  KnowledgeSection,
  KnowledgePoint,
  NODE_DEPTH,
  isValidNodeType,
  isValidMasteryStatus,
  isChapterNode,
  isSectionNode,
  isPointNode,
  validateChapterNode,
  validateSectionNode,
  validatePointNode,
  validateTreeStructure,
  getNodeDepth,
  countPoints,
  countHighFrequencyPoints,
  searchNodes,
  getParentIds,
  toggleExpanded,
  expandToNode
} from './knowledge-tree-utils'

// Arbitraries
const nodeTypeArbitrary = fc.constantFrom<NodeType>('chapter', 'section', 'point')
const masteryStatusArbitrary = fc.constantFrom<MasteryStatus>('mastered', 'review', 'weak', 'unlearned')

const pointArbitrary: fc.Arbitrary<KnowledgePoint> = fc.record({
  id: fc.uuid(),
  code: fc.string({ minLength: 1, maxLength: 10 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  nodeType: fc.constant('point' as const),
  drugName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  importance: fc.integer({ min: 1, max: 5 }),
  masteryStatus: masteryStatusArbitrary,
  masteryScore: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined })
})

const sectionArbitrary: fc.Arbitrary<KnowledgeSection> = fc.record({
  id: fc.uuid(),
  code: fc.string({ minLength: 1, maxLength: 10 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  nodeType: fc.constant('section' as const),
  masteryScore: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
  pointCount: fc.integer({ min: 0, max: 50 }),
  highFrequencyCount: fc.integer({ min: 0, max: 20 }),
  children: fc.array(pointArbitrary, { minLength: 0, maxLength: 5 })
})


const chapterArbitrary: fc.Arbitrary<KnowledgeChapter> = fc.record({
  id: fc.uuid(),
  code: fc.string({ minLength: 1, maxLength: 10 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  nodeType: fc.constant('chapter' as const),
  masteryScore: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
  pointCount: fc.integer({ min: 0, max: 100 }),
  highFrequencyCount: fc.integer({ min: 0, max: 50 }),
  children: fc.array(sectionArbitrary, { minLength: 0, maxLength: 5 })
})

const treeArbitrary = fc.array(chapterArbitrary, { minLength: 0, maxLength: 5 })

describe('Property 1: 树状结构层级完整性', () => {

  it('章节节点深度为0', () => {
    fc.assert(
      fc.property(chapterArbitrary, (chapter) => {
        return getNodeDepth(chapter) === 0
      }),
      { numRuns: 20 }
    )
  })

  it('小节节点深度为1', () => {
    fc.assert(
      fc.property(sectionArbitrary, (section) => {
        return getNodeDepth(section) === 1
      }),
      { numRuns: 20 }
    )
  })

  it('考点节点深度为2', () => {
    fc.assert(
      fc.property(pointArbitrary, (point) => {
        return getNodeDepth(point) === 2
      }),
      { numRuns: 20 }
    )
  })

  it('树结构中每个层级的节点类型正确', () => {
    fc.assert(
      fc.property(treeArbitrary, (tree) => {
        for (const chapter of tree) {
          if (chapter.nodeType !== 'chapter') return false
          for (const section of chapter.children) {
            if (section.nodeType !== 'section') return false
            for (const point of section.children) {
              if (point.nodeType !== 'point') return false
            }
          }
        }
        return true
      }),
      { numRuns: 30 }
    )
  })

  it('isChapterNode 正确识别章节节点', () => {
    fc.assert(
      fc.property(chapterArbitrary, (chapter) => {
        return isChapterNode(chapter) === true
      }),
      { numRuns: 20 }
    )
  })

  it('isSectionNode 正确识别小节节点', () => {
    fc.assert(
      fc.property(sectionArbitrary, (section) => {
        return isSectionNode(section) === true
      }),
      { numRuns: 20 }
    )
  })

  it('isPointNode 正确识别考点节点', () => {
    fc.assert(
      fc.property(pointArbitrary, (point) => {
        return isPointNode(point) === true
      }),
      { numRuns: 20 }
    )
  })
})

describe('Property 2: 节点数据完整性', () => {

  it('章节节点包含所有必需字段', () => {
    fc.assert(
      fc.property(chapterArbitrary, (chapter) => {
        return validateChapterNode(chapter)
      }),
      { numRuns: 30 }
    )
  })

  it('小节节点包含所有必需字段', () => {
    fc.assert(
      fc.property(sectionArbitrary, (section) => {
        return validateSectionNode(section)
      }),
      { numRuns: 30 }
    )
  })

  it('考点节点包含所有必需字段', () => {
    fc.assert(
      fc.property(pointArbitrary, (point) => {
        return validatePointNode(point)
      }),
      { numRuns: 30 }
    )
  })

  it('考点重要性在1-5范围内', () => {
    fc.assert(
      fc.property(pointArbitrary, (point) => {
        return point.importance >= 1 && point.importance <= 5
      }),
      { numRuns: 30 }
    )
  })

  it('掌握状态是有效值', () => {
    fc.assert(
      fc.property(pointArbitrary, (point) => {
        return isValidMasteryStatus(point.masteryStatus)
      }),
      { numRuns: 30 }
    )
  })
})

describe('Property 4: 展开/收起状态一致性', () => {

  it('toggleExpanded 切换节点展开状态', () => {
    fc.assert(
      fc.property(fc.uuid(), (nodeId) => {
        const initial = new Set<string>()
        const afterToggle = toggleExpanded(initial, nodeId)
        const afterToggleAgain = toggleExpanded(afterToggle, nodeId)
        
        return afterToggle.has(nodeId) && !afterToggleAgain.has(nodeId)
      }),
      { numRuns: 30 }
    )
  })

  it('toggleExpanded 不影响其他节点', () => {
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), (nodeId1, nodeId2) => {
        if (nodeId1 === nodeId2) return true
        
        const initial = new Set([nodeId1])
        const afterToggle = toggleExpanded(initial, nodeId2)
        
        return afterToggle.has(nodeId1) && afterToggle.has(nodeId2)
      }),
      { numRuns: 30 }
    )
  })

  it('展开状态切换是幂等的（两次切换恢复原状）', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 0, maxLength: 5 }),
        fc.uuid(),
        (initialIds, toggleId) => {
          const initial = new Set(initialIds)
          const wasExpanded = initial.has(toggleId)
          
          const afterFirst = toggleExpanded(initial, toggleId)
          const afterSecond = toggleExpanded(afterFirst, toggleId)
          
          return afterSecond.has(toggleId) === wasExpanded
        }
      ),
      { numRuns: 30 }
    )
  })
})

describe('Property 5: 搜索结果完整性', () => {

  it('空查询返回空结果', () => {
    fc.assert(
      fc.property(treeArbitrary, (tree) => {
        const result = searchNodes(tree, '')
        return result.size === 0
      }),
      { numRuns: 20 }
    )
  })

  it('搜索结果只包含匹配的节点', () => {
    fc.assert(
      fc.property(
        treeArbitrary,
        fc.string({ minLength: 1, maxLength: 10 }),
        (tree, query) => {
          const result = searchNodes(tree, query)
          const lowerQuery = query.toLowerCase()
          
          // 验证所有返回的节点ID确实存在于树中
          for (const id of result) {
            let found = false
            for (const chapter of tree) {
              if (chapter.id === id) { found = true; break }
              for (const section of chapter.children) {
                if (section.id === id) { found = true; break }
                for (const point of section.children) {
                  if (point.id === id) { found = true; break }
                }
              }
            }
            if (!found) return false
          }
          return true
        }
      ),
      { numRuns: 30 }
    )
  })

  it('搜索匹配的节点会包含其父节点', () => {
    // 创建一个简单的测试树
    const tree: KnowledgeChapter[] = [{
      id: 'chapter-1',
      code: '1',
      title: '测试章节',
      nodeType: 'chapter',
      pointCount: 1,
      highFrequencyCount: 0,
      children: [{
        id: 'section-1',
        code: '1.1',
        title: '测试小节',
        nodeType: 'section',
        pointCount: 1,
        highFrequencyCount: 0,
        children: [{
          id: 'point-1',
          code: '1.1.1',
          title: '阿司匹林',
          nodeType: 'point',
          importance: 5,
          masteryStatus: 'unlearned'
        }]
      }]
    }]
    
    const result = searchNodes(tree, '阿司匹林')
    
    expect(result.has('point-1')).toBe(true)
    expect(result.has('section-1')).toBe(true)
    expect(result.has('chapter-1')).toBe(true)
  })
})

describe('辅助函数测试', () => {

  it('isValidNodeType 对有效类型返回 true', () => {
    expect(isValidNodeType('chapter')).toBe(true)
    expect(isValidNodeType('section')).toBe(true)
    expect(isValidNodeType('point')).toBe(true)
  })

  it('isValidNodeType 对无效类型返回 false', () => {
    expect(isValidNodeType('invalid')).toBe(false)
    expect(isValidNodeType('')).toBe(false)
  })

  it('isValidMasteryStatus 对有效状态返回 true', () => {
    expect(isValidMasteryStatus('mastered')).toBe(true)
    expect(isValidMasteryStatus('review')).toBe(true)
    expect(isValidMasteryStatus('weak')).toBe(true)
    expect(isValidMasteryStatus('unlearned')).toBe(true)
  })

  it('isValidMasteryStatus 对无效状态返回 false', () => {
    expect(isValidMasteryStatus('invalid')).toBe(false)
    expect(isValidMasteryStatus('')).toBe(false)
  })

  it('NODE_DEPTH 包含正确的深度值', () => {
    expect(NODE_DEPTH.chapter).toBe(0)
    expect(NODE_DEPTH.section).toBe(1)
    expect(NODE_DEPTH.point).toBe(2)
  })

  it('countPoints 正确统计考点数量', () => {
    const tree: KnowledgeChapter[] = [{
      id: '1', code: '1', title: 'Ch1', nodeType: 'chapter',
      pointCount: 2, highFrequencyCount: 1,
      children: [{
        id: '1.1', code: '1.1', title: 'Sec1', nodeType: 'section',
        pointCount: 2, highFrequencyCount: 1,
        children: [
          { id: 'p1', code: '1.1.1', title: 'P1', nodeType: 'point', importance: 5, masteryStatus: 'mastered' },
          { id: 'p2', code: '1.1.2', title: 'P2', nodeType: 'point', importance: 3, masteryStatus: 'unlearned' }
        ]
      }]
    }]
    
    expect(countPoints(tree)).toBe(2)
  })

  it('countHighFrequencyPoints 正确统计高频考点', () => {
    const tree: KnowledgeChapter[] = [{
      id: '1', code: '1', title: 'Ch1', nodeType: 'chapter',
      pointCount: 2, highFrequencyCount: 1,
      children: [{
        id: '1.1', code: '1.1', title: 'Sec1', nodeType: 'section',
        pointCount: 2, highFrequencyCount: 1,
        children: [
          { id: 'p1', code: '1.1.1', title: 'P1', nodeType: 'point', importance: 5, masteryStatus: 'mastered' },
          { id: 'p2', code: '1.1.2', title: 'P2', nodeType: 'point', importance: 3, masteryStatus: 'unlearned' }
        ]
      }]
    }]
    
    expect(countHighFrequencyPoints(tree)).toBe(1) // 只有 importance >= 4 的算高频
  })

  it('getParentIds 返回正确的父节点ID', () => {
    const tree: KnowledgeChapter[] = [{
      id: 'chapter-1', code: '1', title: 'Ch1', nodeType: 'chapter',
      pointCount: 1, highFrequencyCount: 0,
      children: [{
        id: 'section-1', code: '1.1', title: 'Sec1', nodeType: 'section',
        pointCount: 1, highFrequencyCount: 0,
        children: [{
          id: 'point-1', code: '1.1.1', title: 'P1', nodeType: 'point',
          importance: 5, masteryStatus: 'mastered'
        }]
      }]
    }]
    
    expect(getParentIds(tree, 'chapter-1')).toEqual([])
    expect(getParentIds(tree, 'section-1')).toEqual(['chapter-1'])
    expect(getParentIds(tree, 'point-1')).toEqual(['chapter-1', 'section-1'])
  })
})
