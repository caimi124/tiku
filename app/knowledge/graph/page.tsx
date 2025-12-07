/**
 * 知识图谱视图页面
 * 
 * 以图形化方式展示知识点关系
 * 
 * Requirements: 3.1
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, ArrowLeft, Grid3X3, Network, 
  Search, X, Info
} from 'lucide-react'
import { KnowledgeGraph, GraphNode, GraphEdge } from '@/components/ui/KnowledgeGraph'

interface ChapterData {
  id: string
  code: string
  title: string
  children?: SectionData[]
}

interface SectionData {
  id: string
  code: string
  title: string
  children?: PointData[]
}

interface PointData {
  id: string
  code: string
  title: string
  importance: number
}

export default function KnowledgeGraphPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  
  useEffect(() => {
    fetchGraphData()
  }, [])
  
  const fetchGraphData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/knowledge-tree?subject=xiyao_yaoxue_er&content=true')
      const data = await res.json()
      
      if (data.success) {
        const { graphNodes, graphEdges } = convertToGraph(data.data.tree)
        setNodes(graphNodes)
        setEdges(graphEdges)
      }
    } catch (error) {
      console.error('获取图谱数据失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 转换树结构为图结构
  const convertToGraph = (tree: ChapterData[]): { graphNodes: GraphNode[], graphEdges: GraphEdge[] } => {
    const graphNodes: GraphNode[] = []
    const graphEdges: GraphEdge[] = []
    
    tree.forEach((chapter, chapterIndex) => {
      // 添加章节节点
      graphNodes.push({
        id: chapter.id,
        title: chapter.title,
        type: 'chapter',
        chapterIndex
      })
      
      // 处理小节
      chapter.children?.forEach(section => {
        graphNodes.push({
          id: section.id,
          title: section.title,
          type: 'section',
          chapterIndex
        })
        
        // 章节到小节的边
        graphEdges.push({
          source: chapter.id,
          target: section.id
        })
        
        // 处理考点
        section.children?.forEach(point => {
          graphNodes.push({
            id: point.id,
            title: point.title,
            type: 'point',
            importance: point.importance,
            chapterIndex
          })
          
          // 小节到考点的边
          graphEdges.push({
            source: section.id,
            target: point.id
          })
        })
      })
    })
    
    return { graphNodes, graphEdges }
  }
  
  // 节点点击处理
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node)
  }
  
  // 查看详情
  const handleViewDetail = () => {
    if (!selectedNode) return
    
    if (selectedNode.type === 'chapter') {
      router.push(`/knowledge/chapter/${selectedNode.id}`)
    } else if (selectedNode.type === 'section') {
      // 需要找到章节ID
      const chapterEdge = edges.find(e => e.target === selectedNode.id)
      if (chapterEdge) {
        router.push(`/knowledge/chapter/${chapterEdge.source}/section/${selectedNode.id}`)
      }
    } else {
      router.push(`/knowledge/point/${selectedNode.id}`)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载知识图谱...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 头部导航 */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/knowledge')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Network className="w-6 h-6 text-purple-500" />
                  知识图谱视图
                </h1>
                <p className="text-sm text-gray-500">西药二 · 药学专业知识（二）</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 视图切换 */}
              <Link
                href="/knowledge"
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-700"
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="text-sm">列表视图</span>
              </Link>
              
              {/* 帮助按钮 */}
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="使用说明"
              >
                <Info className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* 使用说明弹窗 */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">使用说明</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• <strong>拖动</strong>：按住鼠标左键拖动画布</p>
              <p>• <strong>缩放</strong>：使用鼠标滚轮或右侧按钮</p>
              <p>• <strong>查看详情</strong>：点击节点查看信息</p>
              <p>• <strong>节点大小</strong>：表示考点重要性</p>
              <p>• <strong>节点颜色</strong>：区分不同章节</p>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              知道了
            </button>
          </div>
        </div>
      )}
      
      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 统计信息 */}
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white rounded-lg px-4 py-2 border shadow-sm">
            <span className="text-gray-500 text-sm">章节：</span>
            <span className="font-semibold text-blue-600 ml-1">
              {nodes.filter(n => n.type === 'chapter').length}
            </span>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 border shadow-sm">
            <span className="text-gray-500 text-sm">小节：</span>
            <span className="font-semibold text-purple-600 ml-1">
              {nodes.filter(n => n.type === 'section').length}
            </span>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 border shadow-sm">
            <span className="text-gray-500 text-sm">考点：</span>
            <span className="font-semibold text-green-600 ml-1">
              {nodes.filter(n => n.type === 'point').length}
            </span>
          </div>
        </div>
        
        {/* 图谱组件 */}
        <KnowledgeGraph
          nodes={nodes}
          edges={edges}
          onNodeClick={handleNodeClick}
          className="h-[calc(100vh-280px)] min-h-[500px]"
        />
        
        {/* 选中节点详情卡片 */}
        {selectedNode && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 min-w-[300px]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`
                      px-2 py-0.5 text-xs rounded-full
                      ${selectedNode.type === 'chapter' ? 'bg-blue-100 text-blue-700' :
                        selectedNode.type === 'section' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'}
                    `}>
                      {selectedNode.type === 'chapter' ? '章节' : 
                       selectedNode.type === 'section' ? '小节' : '考点'}
                    </span>
                    {selectedNode.importance && (
                      <span className="text-yellow-500 text-sm">
                        {'★'.repeat(selectedNode.importance)}
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900">{selectedNode.title}</h4>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleViewDetail}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                >
                  查看详情
                </button>
                {selectedNode.type === 'point' && (
                  <Link
                    href={`/practice/point/${selectedNode.id}`}
                    className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium text-center"
                  >
                    开始练习
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
