/**
 * KnowledgeGraph 组件（图谱视图）
 * 
 * 以节点和连线形式展示知识点关系：
 * - 节点仅显示标题
 * - 支持缩放和拖动
 * - 不同章节不同颜色
 * - 节点大小表示重要性
 * 
 * Requirements: 3.2, 3.3, 3.6, 3.7, 3.8
 * Property 15: 图谱节点颜色分组
 * Property 16: 图谱节点大小与重要性映射
 */

'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react'

export interface GraphNode {
  id: string
  title: string
  type: 'chapter' | 'section' | 'point'
  importance?: number
  chapterIndex?: number
  x?: number
  y?: number
}

export interface GraphEdge {
  source: string
  target: string
}

export interface KnowledgeGraphProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  onNodeClick?: (node: GraphNode) => void
  className?: string
}

// 章节颜色映射 - Property 15
const CHAPTER_COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#14B8A6', // teal
  '#06B6D4', // cyan
  '#6366F1', // indigo
]

/**
 * 获取章节颜色
 * Property 15: 图谱节点颜色分组
 */
export function getChapterColor(chapterIndex: number): string {
  return CHAPTER_COLORS[chapterIndex % CHAPTER_COLORS.length]
}

/**
 * 获取节点大小
 * Property 16: 图谱节点大小与重要性映射
 */
export function getNodeSize(type: GraphNode['type'], importance?: number): number {
  if (type === 'chapter') return 60
  if (type === 'section') return 45
  // 考点根据重要性调整大小
  const baseSize = 30
  const importanceBonus = (importance || 3) * 3
  return baseSize + importanceBonus
}

/**
 * KnowledgeGraph 组件
 */
export function KnowledgeGraph({ 
  nodes, 
  edges, 
  onNodeClick,
  className = '' 
}: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map())
  
  // 计算节点位置（力导向布局简化版）
  useEffect(() => {
    if (nodes.length === 0) return
    
    const newPositions = new Map<string, { x: number; y: number }>()
    const width = containerRef.current?.clientWidth || 800
    const height = containerRef.current?.clientHeight || 600
    const centerX = width / 2
    const centerY = height / 2
    
    // 按类型分组
    const chapters = nodes.filter(n => n.type === 'chapter')
    const sections = nodes.filter(n => n.type === 'section')
    const points = nodes.filter(n => n.type === 'point')
    
    // 章节围绕中心排列
    chapters.forEach((chapter, i) => {
      const angle = (2 * Math.PI * i) / chapters.length - Math.PI / 2
      const radius = Math.min(width, height) * 0.35
      newPositions.set(chapter.id, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      })
    })
    
    // 小节围绕对应章节排列
    const sectionsByChapter = new Map<number, GraphNode[]>()
    sections.forEach(section => {
      const chapterIdx = section.chapterIndex || 0
      if (!sectionsByChapter.has(chapterIdx)) {
        sectionsByChapter.set(chapterIdx, [])
      }
      sectionsByChapter.get(chapterIdx)!.push(section)
    })
    
    sectionsByChapter.forEach((secs, chapterIdx) => {
      const chapter = chapters[chapterIdx]
      if (!chapter) return
      const chapterPos = newPositions.get(chapter.id)
      if (!chapterPos) return
      
      secs.forEach((section, i) => {
        const angle = (2 * Math.PI * i) / secs.length
        const radius = 80
        newPositions.set(section.id, {
          x: chapterPos.x + radius * Math.cos(angle),
          y: chapterPos.y + radius * Math.sin(angle)
        })
      })
    })
    
    // 考点围绕对应小节排列（简化处理）
    points.forEach((point, i) => {
      // 找到父节点
      const parentEdge = edges.find(e => e.target === point.id)
      if (parentEdge) {
        const parentPos = newPositions.get(parentEdge.source)
        if (parentPos) {
          const angle = (2 * Math.PI * (i % 8)) / 8
          const radius = 50
          newPositions.set(point.id, {
            x: parentPos.x + radius * Math.cos(angle),
            y: parentPos.y + radius * Math.sin(angle)
          })
          return
        }
      }
      // 默认位置
      newPositions.set(point.id, {
        x: centerX + (Math.random() - 0.5) * width * 0.6,
        y: centerY + (Math.random() - 0.5) * height * 0.6
      })
    })
    
    setPositions(newPositions)
  }, [nodes, edges])
  
  // 缩放控制
  const handleZoomIn = () => setScale(s => Math.min(s * 1.2, 3))
  const handleZoomOut = () => setScale(s => Math.max(s / 1.2, 0.3))
  const handleReset = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }
  
  // 拖动控制
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('graph-canvas')) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    }
  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(s => Math.max(0.3, Math.min(3, s * delta)))
  }
  
  // 节点点击
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node)
    onNodeClick?.(node)
  }
  
  return (
    <div className={`relative bg-gray-50 rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* 控制按钮 */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition"
          title="放大"
        >
          <ZoomIn className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition"
          title="缩小"
        >
          <ZoomOut className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition"
          title="重置视图"
        >
          <Maximize2 className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      {/* 图例 */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-200">
        <div className="text-xs font-medium text-gray-700 mb-2">图例</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-600">章节</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs text-gray-600">小节</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600">考点</span>
          </div>
        </div>
      </div>
      
      {/* 拖动提示 */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
        <Move className="w-3 h-3" />
        <span>拖动平移 · 滚轮缩放</span>
      </div>
      
      {/* 画布 */}
      <div
        ref={containerRef}
        className="graph-canvas w-full h-[600px] cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          width="100%"
          height="100%"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: 'center center'
          }}
        >
          {/* 连线 */}
          <g className="edges">
            {edges.map((edge, i) => {
              const sourcePos = positions.get(edge.source)
              const targetPos = positions.get(edge.target)
              if (!sourcePos || !targetPos) return null
              
              return (
                <line
                  key={`edge-${i}`}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke="#E5E7EB"
                  strokeWidth={1}
                />
              )
            })}
          </g>
          
          {/* 节点 */}
          <g className="nodes">
            {nodes.map(node => {
              const pos = positions.get(node.id)
              if (!pos) return null
              
              const size = getNodeSize(node.type, node.importance)
              const color = node.type === 'point' 
                ? getChapterColor(node.chapterIndex || 0)
                : node.type === 'section'
                  ? getChapterColor(node.chapterIndex || 0)
                  : getChapterColor(node.chapterIndex || 0)
              
              const isHovered = hoveredNode?.id === node.id
              const isSelected = selectedNode?.id === node.id
              
              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => handleNodeClick(node)}
                >
                  {/* 节点圆形 */}
                  <circle
                    r={size / 2}
                    fill={color}
                    opacity={node.type === 'point' ? 0.8 : 1}
                    stroke={isSelected ? '#1F2937' : isHovered ? '#6B7280' : 'white'}
                    strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                    className="transition-all duration-150"
                  />
                  
                  {/* 节点标题 */}
                  <text
                    textAnchor="middle"
                    dy={size / 2 + 14}
                    fontSize={node.type === 'chapter' ? 12 : node.type === 'section' ? 11 : 10}
                    fill="#374151"
                    className="pointer-events-none select-none"
                  >
                    {node.title.length > 10 ? node.title.slice(0, 10) + '...' : node.title}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>
      
      {/* 悬浮卡片 */}
      {hoveredNode && (
        <NodeTooltip node={hoveredNode} />
      )}
    </div>
  )
}

/**
 * 节点悬浮提示卡片
 */
function NodeTooltip({ node }: { node: GraphNode }) {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className={`
            px-2 py-0.5 text-xs rounded-full
            ${node.type === 'chapter' ? 'bg-blue-100 text-blue-700' :
              node.type === 'section' ? 'bg-purple-100 text-purple-700' :
              'bg-green-100 text-green-700'}
          `}>
            {node.type === 'chapter' ? '章节' : node.type === 'section' ? '小节' : '考点'}
          </span>
          {node.importance && (
            <span className="text-xs text-gray-500">
              {'★'.repeat(node.importance)}
            </span>
          )}
        </div>
        <div className="font-medium text-gray-900">{node.title}</div>
        <div className="text-xs text-gray-500 mt-2">点击查看详情</div>
      </div>
    </div>
  )
}

export default KnowledgeGraph
