/**
 * KnowledgeTreeNav 组件
 * 四级树状结构导航：章节→小节→考点→考点内容
 * 
 * Requirements: 1.1, 1.6, 5.6 (键盘导航)
 */

'use client'

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import {
  KnowledgeChapter,
  KnowledgeSection,
  KnowledgePoint,
  KnowledgeNode,
  toggleExpanded,
  expandToNode,
  searchNodes
} from '@/lib/knowledge-tree-utils'
import { MasteryProgressBar } from './MasteryProgressBar'
import { ImportanceStars } from './ImportanceStars'
import { MasteryStatusBadge } from './MasteryStatusBadge'

export interface KnowledgeTreeNavProps {
  tree: KnowledgeChapter[]
  selectedNodeId?: string
  onNodeSelect: (node: KnowledgeNode) => void
  onSearch?: (query: string) => void
  onEscape?: () => void  // Esc键回调
  className?: string
  enableKeyboardNav?: boolean  // 是否启用键盘导航
}

export function KnowledgeTreeNav({
  tree,
  selectedNodeId,
  onNodeSelect,
  onSearch,
  onEscape,
  className = '',
  enableKeyboardNav = true
}: KnowledgeTreeNavProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set())
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 获取所有可见节点的扁平列表（用于键盘导航）
  const visibleNodes = useMemo(() => {
    const nodes: KnowledgeNode[] = []
    const collectNodes = (chapters: KnowledgeChapter[]) => {
      for (const chapter of chapters) {
        nodes.push(chapter)
        if (expandedNodes.has(chapter.id)) {
          for (const section of chapter.children) {
            nodes.push(section)
            if (expandedNodes.has(section.id)) {
              for (const point of section.children) {
                nodes.push(point)
              }
            }
          }
        }
      }
    }
    collectNodes(tree)
    return nodes
  }, [tree, expandedNodes])

  // 键盘导航处理
  useEffect(() => {
    if (!enableKeyboardNav) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果焦点在搜索框内，只处理 Esc
      if (document.activeElement === searchInputRef.current) {
        if (e.key === 'Escape') {
          searchInputRef.current?.blur()
          setSearchQuery('')
          setHighlightedNodes(new Set())
          onSearch?.('')
        }
        return
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex(prev => {
            const next = Math.min(prev + 1, visibleNodes.length - 1)
            return next
          })
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'ArrowRight':
          e.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < visibleNodes.length) {
            const node = visibleNodes[focusedIndex]
            if (node.nodeType !== 'point' && !expandedNodes.has(node.id)) {
              setExpandedNodes(prev => toggleExpanded(prev, node.id))
            }
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < visibleNodes.length) {
            const node = visibleNodes[focusedIndex]
            if (expandedNodes.has(node.id)) {
              setExpandedNodes(prev => toggleExpanded(prev, node.id))
            }
          }
          break
        case 'Enter':
          e.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < visibleNodes.length) {
            const node = visibleNodes[focusedIndex]
            onNodeSelect(node)
          }
          break
        case 'Escape':
          e.preventDefault()
          onEscape?.()
          break
        case '/':
          // 快捷键聚焦搜索框
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            searchInputRef.current?.focus()
          }
          break
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('keydown', handleKeyDown)
      return () => container.removeEventListener('keydown', handleKeyDown)
    }
  }, [enableKeyboardNav, focusedIndex, visibleNodes, expandedNodes, onNodeSelect, onEscape, onSearch])

  // 同步选中节点和焦点索引
  useEffect(() => {
    if (selectedNodeId) {
      const index = visibleNodes.findIndex(n => n.id === selectedNodeId)
      if (index !== -1) {
        setFocusedIndex(index)
      }
    }
  }, [selectedNodeId, visibleNodes])

  const handleToggle = useCallback((nodeId: string) => {
    setExpandedNodes(prev => toggleExpanded(prev, nodeId))
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const matched = searchNodes(tree, query)
      setHighlightedNodes(matched)
      // 展开所有匹配节点的父节点
      const newExpanded = new Set(expandedNodes)
      matched.forEach(id => {
        const parents = getParentIdsFromTree(tree, id)
        parents.forEach(pid => newExpanded.add(pid))
      })
      setExpandedNodes(newExpanded)
    } else {
      setHighlightedNodes(new Set())
    }
    onSearch?.(query)
  }, [tree, expandedNodes, onSearch])

  // 获取节点的焦点状态
  const getNodeFocusState = useCallback((nodeId: string) => {
    const index = visibleNodes.findIndex(n => n.id === nodeId)
    return index === focusedIndex
  }, [visibleNodes, focusedIndex])

  return (
    <div 
      ref={containerRef}
      className={`bg-white rounded-lg border border-gray-200 ${className}`}
      tabIndex={0}
      role="tree"
      aria-label="知识点导航树"
    >
      {/* 搜索框 */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="搜索知识点... (按 / 聚焦)"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="搜索知识点"
          />
          {enableKeyboardNav && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border text-gray-500">/</kbd>
            </div>
          )}
        </div>
        {/* 键盘导航提示 */}
        {enableKeyboardNav && (
          <div className="mt-2 text-xs text-gray-400 flex flex-wrap gap-2">
            <span><kbd className="px-1 bg-gray-100 rounded">↑↓</kbd> 导航</span>
            <span><kbd className="px-1 bg-gray-100 rounded">←→</kbd> 展开/收起</span>
            <span><kbd className="px-1 bg-gray-100 rounded">Enter</kbd> 选择</span>
            <span><kbd className="px-1 bg-gray-100 rounded">Esc</kbd> 返回</span>
          </div>
        )}
      </div>

      {/* 树状导航 */}
      <div className="p-2 max-h-[600px] overflow-y-auto">
        {tree.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无知识点数据
          </div>
        ) : (
          tree.map(chapter => (
            <ChapterNode
              key={chapter.id}
              chapter={chapter}
              isExpanded={expandedNodes.has(chapter.id)}
              expandedNodes={expandedNodes}
              selectedNodeId={selectedNodeId}
              highlightedNodes={highlightedNodes}
              isFocused={getNodeFocusState(chapter.id)}
              getNodeFocusState={getNodeFocusState}
              onToggle={handleToggle}
              onSelect={onNodeSelect}
            />
          ))
        )}
      </div>
    </div>
  )
}

// 辅助函数：从树中获取父节点ID
function getParentIdsFromTree(tree: KnowledgeChapter[], nodeId: string): string[] {
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

// 章节节点组件
interface ChapterNodeProps {
  chapter: KnowledgeChapter
  isExpanded: boolean
  expandedNodes: Set<string>
  selectedNodeId?: string
  highlightedNodes: Set<string>
  isFocused: boolean
  getNodeFocusState: (nodeId: string) => boolean
  onToggle: (id: string) => void
  onSelect: (node: KnowledgeNode) => void
}

function ChapterNode({
  chapter,
  isExpanded,
  expandedNodes,
  selectedNodeId,
  highlightedNodes,
  isFocused,
  getNodeFocusState,
  onToggle,
  onSelect
}: ChapterNodeProps) {
  const isHighlighted = highlightedNodes.has(chapter.id)
  const isSelected = selectedNodeId === chapter.id

  return (
    <div className="mb-2" role="treeitem" aria-expanded={isExpanded}>
      <button
        onClick={() => onToggle(chapter.id)}
        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors text-left
          ${isSelected ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'}
          ${isHighlighted ? 'ring-2 ring-yellow-400' : ''}
          ${isFocused ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
        `}
      >
        <span className="text-gray-400 w-4">
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className="text-lg">📚</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 truncate">
              {chapter.code}. {chapter.title}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {chapter.pointCount}个考点
            </span>
          </div>
          {chapter.masteryScore !== undefined && (
            <MasteryProgressBar score={chapter.masteryScore} size="sm" className="mt-1" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="ml-6 mt-1 space-y-1" role="group">
          {chapter.children.map(section => (
            <SectionNode
              key={section.id}
              section={section}
              isExpanded={expandedNodes.has(section.id)}
              selectedNodeId={selectedNodeId}
              highlightedNodes={highlightedNodes}
              isFocused={getNodeFocusState(section.id)}
              getNodeFocusState={getNodeFocusState}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// 小节节点组件
interface SectionNodeProps {
  section: KnowledgeSection
  isExpanded: boolean
  selectedNodeId?: string
  highlightedNodes: Set<string>
  isFocused: boolean
  getNodeFocusState: (nodeId: string) => boolean
  onToggle: (id: string) => void
  onSelect: (node: KnowledgeNode) => void
}

function SectionNode({
  section,
  isExpanded,
  selectedNodeId,
  highlightedNodes,
  isFocused,
  getNodeFocusState,
  onToggle,
  onSelect
}: SectionNodeProps) {
  const isHighlighted = highlightedNodes.has(section.id)
  const isSelected = selectedNodeId === section.id

  return (
    <div role="treeitem" aria-expanded={isExpanded}>
      <button
        onClick={() => onToggle(section.id)}
        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors text-left
          ${isSelected ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'}
          ${isHighlighted ? 'ring-2 ring-yellow-400' : ''}
          ${isFocused ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
        `}
      >
        <span className="text-gray-400 w-4">
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className="text-base">📖</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 truncate">
              {section.code} {section.title}
            </span>
            {section.highFrequencyCount > 0 && (
              <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                {section.highFrequencyCount}高频
              </span>
            )}
          </div>
          {section.masteryScore !== undefined && (
            <MasteryProgressBar score={section.masteryScore} size="sm" className="mt-1" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="ml-6 mt-1 space-y-1" role="group">
          {section.children.map(point => (
            <PointNode
              key={point.id}
              point={point}
              isSelected={selectedNodeId === point.id}
              isHighlighted={highlightedNodes.has(point.id)}
              isFocused={getNodeFocusState(point.id)}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// 考点节点组件
interface PointNodeProps {
  point: KnowledgePoint
  isSelected: boolean
  isHighlighted: boolean
  isFocused: boolean
  onSelect: (node: KnowledgeNode) => void
}

function PointNode({
  point,
  isSelected,
  isHighlighted,
  isFocused,
  onSelect
}: PointNodeProps) {
  return (
    <button
      onClick={() => onSelect(point)}
      role="treeitem"
      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors text-left
        ${isSelected ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-50'}
        ${isHighlighted ? 'ring-2 ring-yellow-400' : ''}
        ${isFocused ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
      `}
    >
      <span className="text-sm">💊</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 truncate">{point.title}</span>
          <ImportanceStars level={point.importance} size="sm" />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {point.drugName && (
            <span className="text-xs text-gray-500">{point.drugName}</span>
          )}
          <MasteryStatusBadge score={point.masteryScore || 0} size="sm" />
        </div>
      </div>
    </button>
  )
}

// 导出子组件供外部使用
export { ChapterNode, SectionNode, PointNode }
