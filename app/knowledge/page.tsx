'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ChevronRight, ChevronDown, BookOpen, Brain, Target,
  Search, Filter, CheckCircle, AlertTriangle, XCircle, Play,
  TrendingUp, Zap, Eye, EyeOff
} from 'lucide-react'
import { MasteryProgressBar } from '@/components/ui/MasteryProgressBar'
import { MasteryStatusBadge } from '@/components/ui/MasteryStatusBadge'
import { ImportanceStars } from '@/components/ui/ImportanceStars'
import { getStatusConfig, getMasteryStatus as getMasteryStatusUtil } from '@/lib/mastery-utils'

interface KnowledgeNode {
  id: string
  code: string
  title: string
  content?: string
  node_type: string
  point_type?: string
  drug_name?: string
  importance: number
  memory_tips?: string
  mastery_score?: number  // 掌握度 0-100
  mastery_status?: string
  is_weak_point?: boolean
  last_review_at?: string
  practice_count?: number
  correct_rate?: number
  children?: KnowledgeNode[]
}

interface Stats {
  chapter_count: number
  section_count: number
  point_count: number
  high_importance_count: number
  mastered_count?: number
  review_count?: number
  weak_count?: number
  unlearned_count?: number
  overall_mastery?: number
}

// 判断是否为可练习的知识点（考点或亚类）
const isKnowledgePoint = (nodeType: string) => {
  return ['knowledge_point', 'point', 'subsection'].includes(nodeType)
}

// 掌握度状态 (使用 Lucide 图标)
const getMasteryStatusWithIcon = (score: number | undefined) => {
  if (score === undefined || score === 0) return { text: '未学习', icon: Target, color: 'text-gray-400', bg: 'bg-gray-100', barColor: 'bg-gray-300' }
  if (score >= 80) return { text: '已掌握', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', barColor: 'bg-green-500' }
  if (score >= 60) return { text: '需复习', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100', barColor: 'bg-yellow-500' }
  return { text: '薄弱', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', barColor: 'bg-red-500' }
}

export default function KnowledgePage() {
  const [tree, setTree] = useState<KnowledgeNode[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'weak' | 'high'>('all')
  const [showMastered, setShowMastered] = useState(true)

  useEffect(() => {
    fetchKnowledgeTree()
  }, [])

  const fetchKnowledgeTree = async () => {
    try {
      // 构建 API URL，支持筛选参数
      // 使用 xiyao-er 作为默认科目（西药二完整知识图谱）
      const params = new URLSearchParams({
        subject: 'xiyao-er',
        content: 'true',
        filter: filterMode,
      })
      // TODO: 添加真实用户ID
      // params.append('userId', userId)
      
      const res = await fetch(`/api/knowledge-tree?${params}`)
      const data = await res.json()
      if (data.success) {
        // 如果 API 没有返回掌握度数据，添加模拟数据
        const addMastery = (nodes: KnowledgeNode[]): KnowledgeNode[] => {
          return nodes.map(node => ({
            ...node,
            mastery_score: node.mastery_score ?? (isKnowledgePoint(node.node_type) 
              ? Math.floor(Math.random() * 100) 
              : undefined),
            children: node.children ? addMastery(node.children) : undefined
          }))
        }
        setTree(addMastery(data.data.tree))
        setStats(data.data.stats)
        // 默认展开第一个章节
        if (data.data.tree.length > 0) {
          setExpandedNodes(new Set([data.data.tree[0].id]))
        }
      }
    } catch (error) {
      console.error('获取知识点树失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 计算章节掌握度
  const calculateChapterMastery = (node: KnowledgeNode): number => {
    if (isKnowledgePoint(node.node_type)) {
      return node.mastery_score || 0
    }
    if (!node.children || node.children.length === 0) return 0
    const scores = node.children.map(calculateChapterMastery)
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  // 使用新的 ImportanceStars 组件
  const renderImportanceStars = (importance: number) => {
    return <ImportanceStars level={importance} size="sm" />
  }

  const renderNode = (node: KnowledgeNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const isSelected = selectedNode?.id === node.id
    const mastery = isKnowledgePoint(node.node_type) 
      ? node.mastery_score 
      : calculateChapterMastery(node)
    const status = getMasteryStatusWithIcon(mastery)
    const StatusIcon = status.icon

    // 筛选逻辑
    if (filterMode === 'weak' && mastery !== undefined && mastery >= 60) return null
    if (filterMode === 'high' && node.importance < 4) return null
    if (!showMastered && mastery !== undefined && mastery >= 80) return null
    
    // 搜索过滤
    if (searchQuery && !node.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !node.drug_name?.toLowerCase().includes(searchQuery.toLowerCase())) {
      // 如果有子节点匹配，仍然显示父节点
      if (!hasChildren) return null
    }

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md
            ${isSelected ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-white hover:bg-gray-50'}
          `}
          style={{ marginLeft: `${depth * 24}px` }}
          onClick={() => {
            if (hasChildren) toggleNode(node.id)
            setSelectedNode(node)
          }}
        >
          {/* 展开/收起图标 */}
          {hasChildren ? (
            <button className="p-1 hover:bg-gray-200 rounded">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <span className="w-6" />
          )}
          
          {/* 掌握状态图标 */}
          <StatusIcon className={`w-5 h-5 ${status.color}`} />
          
          {/* 标题 */}
          <span className="font-medium text-gray-800 flex-1">
            {node.node_type === 'chapter' ? `第${node.code}章 ` : ''}
            {node.title}
          </span>
          
          {/* 重要性星级 */}
          {isKnowledgePoint(node.node_type) && (
            <span className="ml-2">{renderImportanceStars(node.importance)}</span>
          )}
          
          {/* 掌握度进度条 - 使用新组件 */}
          <div className="min-w-[100px]">
            <MasteryProgressBar 
              score={mastery || 0} 
              size="sm" 
              showLabel={false}
              showPercentage={true}
            />
          </div>
          
          {/* 状态标签 - 使用新组件 */}
          <MasteryStatusBadge score={mastery || 0} size="sm" showIcon={false} />
          
          {/* 练习按钮 */}
          {isKnowledgePoint(node.node_type) && (
            <Link 
              href={`/knowledge/point/${node.id}`}
              className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              onClick={(e) => e.stopPropagation()}
            >
              <Play className="w-4 h-4" />
            </Link>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div className="mt-2 space-y-2">
            {node.children!.map(child => renderNode(child, depth + 1)).filter(Boolean)}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载知识点树...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-blue-500" />
                知识图谱
              </h1>
              <p className="text-gray-500 text-sm mt-1">西药二 · 药学专业知识（二）· 完整13章知识图谱</p>
            </div>
            <Link href="/dashboard" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              学习仪表盘
            </Link>
          </div>
        </div>
      </header>

      {/* 统计卡片 + 图例 */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* 统计 */}
          <div className="flex gap-4">
            <div className="bg-white rounded-xl shadow-sm px-4 py-3 border flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-800">{stats?.chapter_count || 0}</div>
                <div className="text-xs text-gray-500">章节</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm px-4 py-3 border flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-800">{stats?.point_count || 0}</div>
                <div className="text-xs text-gray-500">知识点</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm px-4 py-3 border flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-800">{stats?.high_importance_count || 0}</div>
                <div className="text-xs text-gray-500">高频考点</div>
              </div>
            </div>
          </div>
          
          {/* 图例 */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">图例:</span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" /> 已掌握(≥80%)
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-yellow-500" /> 需复习(60-79%)
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="w-4 h-4 text-red-500" /> 薄弱(&lt;60%)
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4 text-gray-400" /> 未学习
            </span>
          </div>
        </div>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border flex flex-wrap items-center gap-4">
          {/* 搜索框 */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索知识点..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* 筛选按钮 */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                filterMode === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterMode('weak')}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                filterMode === 'weak' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              只看薄弱
            </button>
            <button
              onClick={() => setFilterMode('high')}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                filterMode === 'high' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              只看高频
            </button>
          </div>
          
          {/* 显示/隐藏已掌握 */}
          <button
            onClick={() => setShowMastered(!showMastered)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
              showMastered ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'
            }`}
          >
            {showMastered ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showMastered ? '显示已掌握' : '隐藏已掌握'}
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 知识点树 */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                知识点目录
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setExpandedNodes(new Set(tree.map(n => n.id)))}
                  className="text-xs text-blue-500 hover:underline"
                >
                  展开全部
                </button>
                <button 
                  onClick={() => setExpandedNodes(new Set())}
                  className="text-xs text-gray-500 hover:underline"
                >
                  收起全部
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-2">
              {tree.map(node => renderNode(node)).filter(Boolean)}
            </div>
          </div>

          {/* 详情面板 */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border sticky top-24">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              知识点详情
            </h2>
            
            {selectedNode ? (
              <div className="space-y-4">
                {/* 标题和状态 */}
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{selectedNode.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {renderImportanceStars(selectedNode.importance)}
                    {selectedNode.point_type && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {selectedNode.point_type}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* 掌握度卡片 - 使用新组件 */}
                {isKnowledgePoint(selectedNode.node_type) && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">我的掌握度</span>
                      <MasteryStatusBadge score={selectedNode.mastery_score || 0} size="sm" />
                    </div>
                    <MasteryProgressBar 
                      score={selectedNode.mastery_score || 0} 
                      size="lg" 
                      showLabel={false}
                      showPercentage={true}
                    />
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>练习次数: {selectedNode.practice_count || 0}次</span>
                      <span>正确率: {selectedNode.correct_rate || 0}%</span>
                      <span>上次: {selectedNode.last_review_at ? new Date(selectedNode.last_review_at).toLocaleDateString('zh-CN') : '未练习'}</span>
                    </div>
                  </div>
                )}
                
                {/* 药物名称 */}
                {selectedNode.drug_name && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">所属药物：</span>
                    <span className="text-sm font-medium bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">
                      {selectedNode.drug_name}
                    </span>
                  </div>
                )}
                
                {/* 内容 */}
                {selectedNode.content && (
                  <div>
                    <span className="text-sm text-gray-500 block mb-2">📝 核心内容：</span>
                    <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl whitespace-pre-wrap max-h-[250px] overflow-y-auto border">
                      {selectedNode.content}
                    </div>
                  </div>
                )}
                
                {/* 记忆口诀 */}
                {selectedNode.memory_tips && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                    <span className="text-sm font-medium text-yellow-800 flex items-center gap-1">
                      💡 记忆口诀
                    </span>
                    <p className="text-sm text-yellow-700 mt-2 italic">"{selectedNode.memory_tips}"</p>
                  </div>
                )}
                
                {/* 操作按钮 */}
                {isKnowledgePoint(selectedNode.node_type) && (
                  <div className="pt-4 border-t space-y-2">
                    <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition flex items-center justify-center gap-2">
                      <Play className="w-5 h-5" />
                      开始练习此考点
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="py-2 border rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                        ⭐ 加入收藏
                      </button>
                      <button className="py-2 border rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                        🔄 标记复习
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <Brain className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="text-lg">点击左侧知识点</p>
                <p className="text-sm mt-1">查看详情和掌握情况</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
