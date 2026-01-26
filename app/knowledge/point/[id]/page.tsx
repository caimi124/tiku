/**
 * 知识点详情页（重构版 - 应试驱动布局）
 * 
 * 布局顺序：
 * A. 考试价值卡（顶部首屏必见）
 * B. 本页重点速览（6-8条，可折叠）
 * C. 结构骨架（分类表，可折叠）
 * D. 老司机/易错点（先从重点速览复用；后续可自动化）
 * E. 细节查阅区（临床用药评价/药物信息表：默认折叠，表格后显示口诀）
 * F. 历年考点分布（弱化展示，默认折叠）
 * G. 行动区（桌面端可做粘底；否则页面底部）
 * 
 * 注意：口诀不再单独显示，只在表格后以小卡片形式出现
 */

'use client'

const DEBUG_BADGE_ENABLED =
  process.env.NODE_ENV !== 'production' ||
  process.env.NEXT_PUBLIC_KNOWLEDGE_POINT_DEBUG === 'true'

import { useEffect, useState, useMemo, type ReactNode } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getModuleTheme } from '@/lib/knowledge/moduleTheme'

import { ExamValueCard } from '@/components/ui/ExamValueCard'
import { SmartContentRenderer } from '@/components/ui/SmartContentRenderer'
import { PointBottomActions } from '@/components/ui/PointBottomActions'
import { getPointPageConfig } from '@/lib/knowledge/pointPage.config'
import { getPointConfig } from '@/lib/knowledge/pointConfigs'
import { getDefaultExamOverview, type Takeaway } from '@/lib/knowledge/pointPage.schema'
import { formatAbbreviations } from '@/lib/abbreviations'
import type { Action } from '@/lib/knowledge/pointPage.types'
import { hasClassificationTable } from '@/lib/contentUtils'
import {
  extractDrugsFromContent,
  generateStudyAdviceFromContent,
} from '@/lib/knowledge/contentExtractor'
import {
  getStructureTemplate,
  fillStructureFromContent,
  type StructurePointType,
} from '@/lib/knowledge/structureTemplate'
import {
  detectAggregationNode,
  logAggregationNode,
  type AggregationDetectionResult,
} from '@/lib/knowledge/aggregationDetector'
import {
  getModuleRenderConfig,
  hasModuleContent,
  generateStructurePlaceholder,
} from '@/lib/knowledge/examPointTypeRenderer'
import { getChapterContext } from '@/lib/knowledge/getChapterContext'
import type { ExamPointType } from '@/lib/knowledge/examPointType'
import { isValidExamPointType } from '@/lib/knowledge/examPointType'
import { parseFromDatabase } from '@/lib/knowledge/highFreqExtractor'
import { highlightKeywords, shouldHighlight } from '@/lib/knowledge/highlightKeywords'

/* =========================
   类型（宽松版，避免 build 卡死）
========================= */

interface KnowledgePointDetail {
  id: string
  code?: string
  title: string
  content?: string
  importance?: number
  importance_level?: number
  learn_mode?: 'MEMORIZE' | 'PRACTICE' | 'BOTH' | string
  mastery_score?: number
  mastery_status?: string
  memory_tips?: string
  drug_name?: string
  point_type?: string
  last_review_at?: string
  practice_count?: number
  correct_rate?: number
  exam_years?: number[]
  exam_frequency?: number
  exam_point_type?: string | null
  hf_patterns?: string | null
  pitfalls?: string | null
  hf_generated_at?: string | null
  point_missing?: boolean
  match_key_used?: string | null
  matched_candidates?: number | null
  build_version?: string | null
  related_points?: any[]
  content_item_accuracy?: any[]
  navigation?: {
    prev_point?: any
    next_point?: any
    section_points?: any[]
  }
  chapter?: { id: string; title: string; code: string }
  section?: { id: string; title: string; code: string }
}

type HighYieldCard = {
  id: string
  bucket: string
  level: 'key' | 'warn' | 'danger'
  oneLiner: string
  examMove?: string
}

type CoreDrugBullet = {
  id: string
  text: string
  level?: 'key' | 'warn' | 'danger'
}

type CoreDrugCardUI = {
  id: string
  name: string
  alias?: string
  why?: string
  bullets: CoreDrugBullet[]
}

type ExamDistributionItem = {
  id: string
  text: string
  years: string
}

type ModuleShellProps = {
  title: string
  description?: string
  children: ReactNode
}

function ModuleShell({ title, description, children }: ModuleShellProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

type ModuleContentState = 'chapter' | 'real' | 'empty'

function getModuleContentState(options: {
  isAggregationNode: boolean
  pointMissing: boolean
  hasData: boolean
}): ModuleContentState {
  if (options.isAggregationNode || options.pointMissing) {
    return 'chapter'
  }
  if (options.hasData) {
    return 'real'
  }
  return 'empty'
}

type ExamMapData = {
  prompt: string
  angles: string[]
  focusTitle?: string
  focus: { id: string; text: string }[]
}

type PointType = 'specific_drug' | 'drug_class' | 'exam_strategy' | 'structure_skeleton' | 'structure_only' | 'strategy'

const DEFAULT_ACTIONS: Record<'primary' | 'secondary' | 'tertiary', Action> = {
  primary: { label: '▶ 开始考点自测（3-5题）', type: 'selfTest', payload: { count: 5 } },
  secondary: { label: '→ 进入专项练习', type: 'practice' },
  tertiary: { label: '返回知识图谱', type: 'backToGraph', href: '/knowledge' },
}

/* ========================= */

export default function KnowledgePointPage() {
  const params = useParams()
  const pointId = params.id as string

  const [point, setPoint] = useState<KnowledgePointDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [sourceExpanded, setSourceExpanded] = useState(false)
  const [pointFileContent, setPointFileContent] = useState<{
    stages: Array<{
      stageName: string
      modules: Array<{
        moduleCode: string
        moduleName: string
        content: string
      }>
    }>
    rawContent: string
  } | null>(null)
  const [fileContentLoading, setFileContentLoading] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!pointId) return
    fetch(`/api/knowledge-point/${pointId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.success) {
          setPoint(data.data)
        } else {
          setError(data?.error || '获取知识点失败')
        }
      })
      .catch(() => setError('网络错误'))
      .finally(() => setLoading(false))
  }, [pointId])

  // 所有 hooks 必须在早期返回之前调用
  // 使用安全的默认值，即使 point 为 null
  const safePoint = point ?? null
  const safePointId = pointId ?? ''

  // 读取考点文件内容
  useEffect(() => {
    if (!safePoint?.code) return
    
    setFileContentLoading(true)
    fetch(`/api/knowledge-point/content/${safePoint.code}`)
      .then(res => res.json())
      .then(data => {
        if (data?.success && data.data?.stages && data.data.stages.length > 0) {
          setPointFileContent({
            stages: data.data.stages,
            rawContent: data.data.rawContent || ''
          })
          // 调试信息（开发环境）
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[考点文件] ${safePoint.code} 加载成功，${data.data.stages.length} 个阶段`)
          }
        } else {
          // 文件不存在或解析失败时不报错，只是不显示文件内容
          setPointFileContent(null)
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[考点文件] ${safePoint.code} 未找到文件或解析失败`)
          }
        }
      })
      .catch((error) => {
        // 读取失败时不报错，使用数据库内容
        setPointFileContent(null)
        if (process.env.NODE_ENV !== 'production') {
          console.error(`[考点文件] ${safePoint.code} 读取失败:`, error)
        }
      })
      .finally(() => setFileContentLoading(false))
  }, [safePoint?.code])

  // 【聚合节点检测】在渲染前检测是否为聚合节点
  const aggregationResult = useMemo<AggregationDetectionResult>(() => {
    if (!safePoint?.content) {
      return {
        is_aggregation_node: false,
        aggregation_reasons: [],
        aggregation_candidates: []
      }
    }
    return detectAggregationNode(safePointId, safePoint.content)
  }, [safePointId, safePoint?.content])

  // 记录聚合节点日志
  useEffect(() => {
    if (aggregationResult.is_aggregation_node) {
      logAggregationNode(safePointId, aggregationResult)
    }
  }, [safePointId, aggregationResult])

  const isAggregationNode = aggregationResult.is_aggregation_node

  // 读取配置（优先使用新配置系统）
  const newConfig = useMemo(() => getPointConfig(safePointId), [safePointId])
  const oldConfig = useMemo(() => getPointPageConfig(safePointId), [safePointId])

  // 提取数据 - 使用安全的默认值（旧配置系统）
  const takeaways = useMemo<Takeaway[]>(() => {
    if (oldConfig?.takeaways && oldConfig.takeaways.length > 0) {
      return oldConfig.takeaways
    }
    return []
  }, [oldConfig])

  // 口诀不再单独使用，只在表格后显示（由 SmartContentRenderer 处理）

  // 计算有效值 - 使用安全的默认值
  const effectiveImportanceLevel = useMemo(() => {
    if (newConfig?.meta.stars) return newConfig.meta.stars
    if (oldConfig?.stars) return oldConfig.stars
    return safePoint?.importance_level ?? safePoint?.importance ?? 3
  }, [safePoint, newConfig, oldConfig])

  const effectiveLearnMode = useMemo(() => {
    return safePoint?.learn_mode ?? 'BOTH'
  }, [safePoint])

  // 内联注释（旧系统）
  const inlineAnnotations = useMemo(() => {
    return oldConfig?.inlineAnnotations || []
  }, [oldConfig])

  const examMapModule = useMemo(() => newConfig?.modules.find((m) => m.type === 'examMap'), [newConfig])
  const classificationModule = useMemo(() => newConfig?.modules.find((m) => m.type === 'classificationMap'), [newConfig])
  const highYieldModule = useMemo(() => newConfig?.modules.find((m) => m.type === 'highYield'), [newConfig])
  const coreDrugsModule = useMemo(() => newConfig?.modules.find((m) => m.type === 'coreDrugs'), [newConfig])
  const sourceModule = useMemo(() => newConfig?.modules.find((m) => m.type === 'sourceMaterial'), [newConfig])
  const examDistributionModule = useMemo(() => newConfig?.modules.find((m) => m.type === 'examDistribution'), [newConfig])

  const sourceSummary = useMemo(() => {
    if (!safePoint?.content) return '暂无原文'
    const firstLine = safePoint.content
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith('|---') && !line.startsWith('|')) || safePoint.content.trim()
    if (!firstLine) return '暂无原文'
    return firstLine.length > 80 ? `${firstLine.slice(0, 80)}…` : firstLine
  }, [safePoint])

  // 获取 exam_point_type 并生成模块渲染配置
  const examPointType = useMemo<ExamPointType | null>(() => {
    const type = safePoint?.exam_point_type
    return isValidExamPointType(type) ? type : null
  }, [safePoint?.exam_point_type])

  const moduleRenderConfig = useMemo(() => {
    return getModuleRenderConfig(examPointType)
  }, [examPointType])

  // 从数据库字段读取高频考法和易错点
  const hfPatterns = useMemo(() => {
    return parseFromDatabase(safePoint?.hf_patterns)
  }, [safePoint?.hf_patterns])

  const pitfalls = useMemo(() => {
    return parseFromDatabase(safePoint?.pitfalls)
  }, [safePoint?.pitfalls])

  const hfPatternCount = hfPatterns.length
  const pitfallsCount = pitfalls.length
  const pointMissing = safePoint?.point_missing === true
  const chapterTitle = safePoint?.chapter?.title
  const sectionTitle = safePoint?.section?.title
  const chapterDescriptor = `${chapterTitle ? `章节「${chapterTitle}」` : '本章节'}${
    sectionTitle ? ` · 小节「${sectionTitle}」` : ''
  }`
  const buildVersionDisplay = safePoint?.build_version ?? 'unknown'
  const hfGeneratedAtDisplay = safePoint?.hf_generated_at
    ? new Date(safePoint.hf_generated_at).toLocaleString()
    : '未生成'
  const showDebugBadge = DEBUG_BADGE_ENABLED && !!safePoint
  const examPointTypeDisplay = safePoint?.exam_point_type ?? '未设置'
  const isExamPointTypeMissing = !safePoint?.exam_point_type

  const chapterContext = useMemo(() => {
    return getChapterContext({
      id: safePointId,
      title: safePoint?.title,
      chapter: safePoint?.chapter,
      section: safePoint?.section,
      breadcrumb: (safePoint as any)?.breadcrumb || null,
    })
  }, [
    safePointId,
    safePoint?.title,
    safePoint?.chapter?.title,
    safePoint?.chapter?.code,
    safePoint?.section?.title,
    safePoint?.section?.code,
  ])

  const renderChapterPlaceholder = (extra?: React.ReactNode) => (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
      <p className="text-gray-800 font-semibold text-sm mb-2">
        💡 本页已提炼本章节的核心考法与判类要点，建议下方自测检验掌握情况。
      </p>
      {/* Updated: 2024-12-18 - 文案已更新 */}
      {extra}
      <p className="text-gray-500 text-xs mt-3 pt-3 border-t border-blue-200">
        当前 knowledge_tree_id: {chapterContext.nodeId}
        {chapterContext.breadcrumbText ? ` · 路径：${chapterContext.breadcrumbText}` : ''}
      </p>
    </div>
  )

  // ==================== 考点文件内容渲染函数 ====================
  /**
   * 渲染考点文件内容（三阶段结构）
   * 按照新模板结构展示：
   * 第一阶段：M02, M03, M04, M05
   * 第二阶段：M03, M04, M05, M06 + 进入章节自测
   * 第三阶段：M05, M06 + 进入冲刺检测
   */
  const renderPointFileContent = () => {
    if (fileContentLoading) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-600">正在加载考点内容...</p>
        </div>
      )
    }

    if (!pointFileContent || pointFileContent.stages.length === 0) {
      return null // 文件不存在时返回 null，使用原有内容
    }

    // 定义每个阶段应该显示的模块
    const stageModuleMap: Record<number, string[]> = {
      0: ['M02', 'M03', 'M04', 'M05'], // 第一阶段
      1: ['M03', 'M04', 'M05', 'M06'], // 第二阶段
      2: ['M05', 'M06'] // 第三阶段
    }

    return (
      <div className="space-y-8">
        {pointFileContent.stages.map((stage, stageIdx) => {
          // 获取该阶段应该显示的模块列表
          const allowedModules = stageModuleMap[stageIdx] || []
          
          // 过滤出该阶段应该显示的模块
          const displayModules = stage.modules.filter(module => 
            allowedModules.includes(module.moduleCode)
          )

          return (
            <div key={stageIdx} className="space-y-6">
              {/* 阶段标题 */}
              <div className={`border-l-4 pl-4 py-3 rounded-r shadow-sm ${
                stageIdx === 0 ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-50/50' :
                stageIdx === 1 ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-50/50' :
                'border-orange-500 bg-gradient-to-r from-orange-50 to-orange-50/50'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    stageIdx === 0 ? 'bg-blue-100 text-blue-700' :
                    stageIdx === 1 ? 'bg-green-100 text-green-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    阶段 {stageIdx + 1}/3
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">{formatAbbreviations(stage.stageName)}</h2>
                </div>
              </div>

              {/* 阶段内的模块 */}
              {displayModules.length > 0 ? (
                <>
                  {displayModules.map((module, moduleIdx) => {
                    // 根据模块代码确定标题
                    const moduleTitleMap: Record<string, string> = {
                      'M02': '本页定位',
                      'M03': '考什么 & 怎么考',
                      'M04': '核心结构',
                      'M05': '必背要点',
                      'M06': '解题逻辑与秒杀规则'
                    }

                    const moduleTitle = module.moduleName || moduleTitleMap[module.moduleCode] || `模块 ${module.moduleCode}`
                    
                    // 获取模块主题配置
                    const theme = getModuleTheme(module.moduleCode)
                    const IconComponent = theme.icon
                    
                    // 图标颜色映射（Tailwind 需要完整类名）
                    const iconColorMap: Record<string, string> = {
                      blue: 'text-blue-600',
                      green: 'text-green-600',
                      violet: 'text-violet-600',
                      amber: 'text-amber-600',
                      rose: 'text-rose-600',
                      gray: 'text-gray-600'
                    }
                    const iconColor = iconColorMap[theme.accent] || 'text-gray-600'

                    return (
                      <div key={moduleIdx} className={`${theme.card} rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow`}>
                        <div className={`mb-4 pb-3 ${theme.leftBar} pl-3 border-b border-gray-200`}>
                          <h3 className={`text-base ${theme.header} flex items-center gap-2`}>
                            <IconComponent className={`w-4 h-4 ${iconColor}`} />
                            【考点 {safePoint?.code || ''}｜{module.moduleCode}｜{formatAbbreviations(moduleTitle)}】
                          </h3>
                        </div>
                        <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                          <SmartContentRenderer
                            content={module.content}
                            variant="minimal"
                          />
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* 第二阶段末尾：进入章节自测 */}
                  {stageIdx === 1 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <Link
                        href={`/practice/by-point?pointId=${safePoint?.id}&mode=self-test&count=5`}
                        className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold"
                      >
                        （进入章节自测 跳转做题页）
                      </Link>
                    </div>
                  )}
                  
                  {/* 第三阶段末尾：进入冲刺检测 */}
                  {stageIdx === 2 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                      <Link
                        href={`/practice/by-point?pointId=${safePoint?.id}&mode=self-test&count=5`}
                        className="inline-flex items-center gap-2 text-orange-700 hover:text-orange-900 font-semibold"
                      >
                        （进入冲刺检测 跳转做题页）
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">该阶段暂无模块内容</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // ==================== 模块内容渲染函数 ====================
  // 结构骨架渲染
  const renderStructureContent = (state: ModuleContentState) => {
    if (state === 'real') {
      const sectionsWithContent = structureSections.filter(section =>
        section.items.some(item => {
          const isPlaceholder = (item as any).placeholder === true
          const isPlaceholderText = item.text === '待补充' || item.text.trim() === ''
          return !isPlaceholder && !isPlaceholderText
        })
      )

      if (sectionsWithContent.length > 0) {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sectionsWithContent.map(section => {
              const validItems = section.items.filter(item => {
                const isPlaceholder = (item as any).placeholder === true
                const isPlaceholderText = item.text === '待补充' || item.text.trim() === ''
                return !isPlaceholder && !isPlaceholderText
              })

              if (validItems.length === 0) return null

              return (
                <div key={section.id} className="space-y-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    {formatAbbreviations(section.title)}
                  </h3>
                  <ul className="space-y-1 text-gray-800 ml-1">
                    {validItems.map(item => (
                      <li key={item.id} className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span>{formatAbbreviations(item.text)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )
      }
    }

    if (state === 'chapter') {
      return renderChapterPlaceholder()
    }

    // 空态：有实体但结构数据为空
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-gray-600 text-sm mb-3">
          本考点结构骨架正在构建中，当前以章节结构为参考。
        </p>
        {moduleRenderConfig.structureSkeleton.sections.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-semibold text-gray-700">本类考点通常从以下维度考查：</p>
            <ul className="space-y-1 text-gray-600 ml-4">
              {moduleRenderConfig.structureSkeleton.sections.map((section, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    {section.title}
                    {section.description ? `：${section.description}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  // 高频考法渲染
  const renderHighFreqContent = (state: ModuleContentState) => {
    if (state === 'real') {
      return (
        <ul className="space-y-2">
          {hfPatterns.map((pattern, idx) => (
            <li key={idx} className="flex items-start gap-2 text-gray-800 leading-relaxed">
              <span className="text-blue-600 mt-1">•</span>
              <span>{formatAbbreviations(pattern)}</span>
            </li>
          ))}
        </ul>
      )
    }

    if (state === 'chapter') {
      return renderChapterPlaceholder()
    }

    // 空态
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-gray-600 text-sm">
          该模块在当前考点下暂未形成稳定考法，已为你保留结构位置，后续出现相关出题内容将自动激活。
        </p>
        <p className="text-gray-600 text-xs mt-1">
          常见考法通常集中在作用特点、适应证、用法对比。
        </p>
      </div>
    )
  }

  // 易错点渲染
  const renderPitfallContent = (state: ModuleContentState) => {
    if (state === 'real') {
      return (
        <ul className="space-y-2">
          {pitfalls.map((pitfall, idx) => (
            <li key={idx} className="flex items-start gap-2 text-gray-800 leading-relaxed">
              <span className="text-orange-600 mt-1">•</span>
              <span>{formatAbbreviations(pitfall)}</span>
            </li>
          ))}
        </ul>
      )
    }

    if (state === 'chapter') {
      return renderChapterPlaceholder()
    }

    // 空态
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-gray-600 text-sm">
          该模块在当前考点下暂未形成稳定考法，已为你保留结构位置，后续出现相关出题内容将自动激活。
        </p>
        <p className="text-gray-600 text-xs mt-1">
          易错点多集中在禁忌、相互作用、用药监测。
        </p>
      </div>
    )
  }

  // 核心药物渲染
  const renderCoreDrugContent = (state: ModuleContentState) => {
    if (state === 'real' && moduleRenderConfig.coreDrugCard.enabled) {
      if (hasModuleContent('coreDrugCard', moduleRenderConfig, coreDrugCards)) {
        return (
          <div className="space-y-4">
            {coreDrugCards.map(card => {
              const indicationBullets = card.bullets.filter(
                b => b.text.includes('适应证') || b.text.includes('适应症') || b.level === 'key'
              )
              const contraindicationBullets = card.bullets.filter(
                b => b.text.includes('禁忌') || b.level === 'danger'
              )
              const interactionBullets = card.bullets.filter(
                b => b.text.includes('相互作用') || b.text.includes('交互') || b.level === 'warn'
              )
              const otherBullets = card.bullets.filter(
                b => !indicationBullets.includes(b) && !contraindicationBullets.includes(b) && !interactionBullets.includes(b)
              )

              return (
                <div key={card.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="border-b border-gray-200 pb-3">
                    <div className="font-semibold text-lg text-gray-900 mb-1">
                      {formatAbbreviations(card.name)}
                      {card.alias && (
                        <span className="text-sm font-normal text-gray-600 ml-2">
                          ({formatAbbreviations(card.alias)})
                        </span>
                      )}
                    </div>
                    {card.why && (
                      <p className="text-sm text-gray-700 leading-relaxed">{formatAbbreviations(card.why)}</p>
                    )}
                  </div>

                  {indicationBullets.length > 0 && (
                    <div className="mb-4">
                      <div className="font-semibold text-green-700 mb-2">【适应证】</div>
                      <ul className="list-disc ml-5 space-y-1 text-green-700">
                        {indicationBullets.map(bullet => (
                          <li key={bullet.id} className="leading-relaxed">
                            {formatAbbreviations(bullet.text.replace(/【适应证】|【适应症】/g, '').trim())}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {contraindicationBullets.length > 0 && (
                    <div className="mb-4">
                      <div className="font-semibold text-red-700 mb-2">【禁忌】</div>
                      <ul className="list-disc ml-5 space-y-1 text-red-700">
                        {contraindicationBullets.map(bullet => (
                          <li key={bullet.id} className="leading-relaxed">
                            {formatAbbreviations(bullet.text.replace(/【禁忌】/g, '').trim())}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {interactionBullets.length > 0 && (
                    <div className="mb-4">
                      <div className="font-semibold text-orange-700 mb-2">【相互作用】</div>
                      <ul className="list-disc ml-5 space-y-1 text-orange-700">
                        {interactionBullets.map(bullet => (
                          <li key={bullet.id} className="leading-relaxed">
                            {formatAbbreviations(bullet.text.replace(/【相互作用】|【交互】/g, '').trim())}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {otherBullets.length > 0 && (
                    <div className="mb-4">
                      <div className="font-semibold text-gray-700 mb-2">【其他】</div>
                      <ul className="list-disc ml-5 space-y-1 text-gray-800">
                        {otherBullets.map(bullet => (
                          <li key={bullet.id} className="leading-relaxed">
                            {formatAbbreviations(bullet.text)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      }
    }

    if (state === 'chapter') {
      return renderChapterPlaceholder(
        <p className="text-gray-700 text-sm">
          本节为汇总节点，详见下方具体考点/代表药物卡。
        </p>
      )
    }

    // 空态或 enabled=false
    if (!moduleRenderConfig.coreDrugCard.enabled) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-gray-600 text-sm">
            该类型暂不支持，敬请期待。
          </p>
        </div>
      )
    }

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-gray-600 text-sm">
          本考点该模块内容正在完善中，当前以教材原文为准。
        </p>
      </div>
    )
  }

  // 教材原文渲染
  const renderSourceContent = (state: ModuleContentState) => {
    if (state === 'real') {
      return (
        <>
          <div className="font-semibold text-gray-900 mb-2">
            【一句话骨干】{formatAbbreviations(sourceSummary)}
          </div>
          <button
            type="button"
            onClick={() => setSourceExpanded(!sourceExpanded)}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            {sourceExpanded ? '收起完整原文' : '展开完整原文'}
            {sourceExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {sourceExpanded && (
            <div className="border border-gray-200 rounded-lg p-4 mt-3">
              <SmartContentRenderer
                content={safePoint?.content || '暂无内容'}
                annotations={inlineAnnotations.length > 0 ? inlineAnnotations : undefined}
                variant="minimal"
              />
            </div>
          )}
        </>
      )
    }

    if (state === 'chapter') {
      return renderChapterPlaceholder(
        <p className="text-gray-700 text-sm">
          本节的教材原文概览正在整理中，当前仅支持结构理解。
        </p>
      )
    }

    // 空态
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-gray-600 text-sm">
          当前暂无教材原文，章节级内容正在整理中。
        </p>
      </div>
    )
  }

  // 考点分布渲染
  const renderExamDistributionContent = (state: ModuleContentState) => {
    if (state === 'real') {
      return (
        <div className="divide-y divide-gray-100">
          {examDistributionItems.map(item => (
            <div key={item.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-gray-800">{formatAbbreviations(item.text)}</span>
              <span className="text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                {item.years}
              </span>
            </div>
          ))}
        </div>
      )
    }

    if (state === 'chapter') {
      return renderChapterPlaceholder(
        <p className="text-gray-700 text-sm">
          考点正在按小节拆分中，当前仅展示章节级分布。
        </p>
      )
    }

    // 空态
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-gray-600 text-sm">
          本节考点分布正在整理中，敬请期待。
        </p>
      </div>
    )
  }

  // 【必须模块】本考点在考什么 - 所有考点类型都必须显示
  const examMapData = useMemo<ExamMapData | null>(() => {
    // 优先级1：配置数据
    if (examMapModule?.data) {
      return {
        prompt: examMapModule.data.prompt,
        angles: examMapModule.data.angles || [],
        focusTitle: examMapModule.data.focusTitle,
        focus: (examMapModule.data.focus || []).map((item, idx) => ({
          id: item.id || `focus-${idx}`,
          text: item.text,
        })),
      }
    }
    if (oldConfig?.examOverview) {
      const overview = oldConfig.examOverview
      return {
        prompt: overview.intro || overview.title,
        angles: overview.angles.map((angle, idx) => angle.title || angle.id || `角度${idx + 1}`),
        focusTitle: overview.focusTitle,
        focus: (overview.focus || []).map((item, idx) => ({
          id: item.id || `legacy-focus-${idx}`,
          text: item.text,
        })),
      }
    }
    
    // 优先级2：默认生成（所有考点类型都有）
    if (safePoint?.title) {
      const overview = getDefaultExamOverview(safePoint.title)
      return {
        prompt: overview.intro || overview.title,
        angles: overview.angles.map((angle, idx) => angle.title || angle.id || `角度${idx + 1}`),
        focusTitle: overview.focusTitle,
        focus: overview.focus.map((item, idx) => ({
          id: item.id || `default-focus-${idx}`,
          text: item.text,
        })),
      }
    }
    
    // 优先级3：完全默认（即使没有 title 也返回基础结构）
    return {
      prompt: '本考点需要掌握核心概念和考试重点。',
      angles: ['基本概念与分类', '作用特点与临床应用', '注意事项与禁忌'],
      focusTitle: '其中重点集中在：',
      focus: [
        { id: 'default-focus-1', text: '核心概念与分类（高频送分）' },
        { id: 'default-focus-2', text: '临床应用与注意事项' },
      ],
    }
  }, [examMapModule, oldConfig, safePoint])

  // 结构骨架：禁止直接用表格，只用于建立脑内地图（必须在 basePointType 之前定义）
  const hasStructureTable = useMemo(() => {
    return safePoint?.content ? hasClassificationTable(safePoint.content) : false
  }, [safePoint])

  // 先计算基础 pointType（不依赖 coreDrugCards）
  // 【单一药物优先规则】：即使标题中有"临床用药评价"等字样，如果内容聚焦于单一具体药物，也要判定为 specific_drug
  const basePointType = useMemo<PointType>(() => {
    const title = safePoint?.title || ''
    const content = safePoint?.content || ''
    const combinedText = `${title} ${content}`.toLowerCase()

    // 【一、单一药物优先规则】
    // 1. 数据库字段明确标记为单一药物
    if (safePoint?.drug_name) {
      return 'specific_drug'
    }

    // 2. 标题或内容聚焦于"某一个具体药物"（非"一类药物"）
    // 检查是否存在单一药物特征
    const isSingleDrugTitle = /^(【|\[)?[^类分类药物评价]{1,10}(的|临床用药评价|用药|作用|特点|应用)/.test(title)
    const hasSingleDrugContent = /作用特点|临床应用|用药注意|监测要点|不良反应/.test(content) && 
                                 !/多类|分类|对比|比较|各类|多种/.test(content)
    
    // 3. 不存在"多类药物对比"或"分类依据"
    const hasNoComparison = !/多类|分类依据|各类代表|对比|比较|分为.*类/.test(combinedText)
    
    // 4. 即使标题中有"临床用药评价"，如果满足单一药物条件，也判定为 specific_drug
    if ((isSingleDrugTitle || hasSingleDrugContent) && hasNoComparison) {
      return 'specific_drug'
    }

    // 【二、drug_class 模板仅适用于明确的一类药物】
    // 必须同时满足：明确为"一类药物" + 存在多个代表药 + 存在分类或对比结构
    const isExplicitDrugClass = /类|分类|药物分类/.test(title) && 
                                /代表药|多种|各类|不同类/.test(combinedText) &&
                                (/分类|对比|比较|依据/.test(combinedText) || hasStructureTable)
    
    if (isExplicitDrugClass) {
      return 'drug_class'
    }

    // 若内容围绕考试分值/策略，判定为【考试策略】
    if (/策略|分值|考试|复习|备考/.test(title)) {
      return 'strategy'
    }

    // 默认使用 structure_only（概念/原理/框架型）
    return 'structure_only'
  }, [safePoint, hasStructureTable])

  // 【必须模块】结构骨架 - 所有考点类型都必须显示
  // 核心原则：基于考点类型使用固定模板，content 仅作为填充信息
  const classificationSections = useMemo(() => {
    // 优先级1：配置数据（如果存在配置，使用配置的结构）
    if (classificationModule?.data.sections?.length) {
      return classificationModule.data.sections
    }
    
    // 优先级2：根据考点类型获取固定结构模板
    // 将 pointType 映射到 structure template 类型
    let structureType: StructurePointType = 'structure_only'
    
    if (basePointType === 'specific_drug') {
      structureType = 'specific_drug'
    } else if (basePointType === 'drug_class') {
      structureType = 'drug_class'
    } else if (basePointType === 'strategy' || basePointType === 'exam_strategy') {
      structureType = 'strategy'
    } else {
      structureType = 'structure_only'
    }
    
    // 获取固定结构模板
    const template = getStructureTemplate(structureType)
    
    // 优先级3：从 content 填充到固定结构（不改变结构本身）
    if (safePoint?.content) {
      return fillStructureFromContent(template, safePoint.content)
    }
    
    // 如果没有 content，返回模板（包含占位符）
    return template
  }, [classificationModule, safePoint, basePointType])

  const highYieldCards = useMemo<HighYieldCard[]>(() => {
    if (highYieldModule?.data?.rules?.length) {
      return highYieldModule.data.rules.map((rule) => ({
        id: rule.id,
        bucket: rule.bucket,
        level: rule.level,
        oneLiner: rule.oneLiner,
        examMove: rule.examMove,
      }))
    }
    if (takeaways.length > 0) {
      return takeaways.slice(0, 6).map((item, idx) => ({
        id: item.id || `fallback-high-${idx}`,
        bucket: item.level === 'danger' ? '禁忌 / 致命' : item.level === 'warn' ? '易错提醒' : '高频秒选',
        level: item.level,
        oneLiner: item.text,
      }))
    }
    return []
  }, [highYieldModule, takeaways])

  // 代表药物应试定位 - 优先级：配置数据 > 从 content 提取 > 占位
  const coreDrugCards = useMemo<CoreDrugCardUI[]>(() => {
    // 优先级1：配置数据
    if (coreDrugsModule?.data?.cards?.length) {
      return coreDrugsModule.data.cards.map((card) => ({
        id: card.id,
        name: card.name,
        alias: card.alias,
        why: card.why,
        bullets: (card.bullets || []).map((bullet, idx) => ({
          id: bullet.id || `card-${card.id}-${idx}`,
          text: bullet.text,
          level: bullet.level,
        })),
      }))
    }
    
    // 优先级2：从数据库字段提取
    if (safePoint?.drug_name) {
      return [
        {
          id: `${safePoint.id}-core`,
          name: safePoint.drug_name,
          why: '本考点核心药物，需掌握适应证、禁忌与相互作用。',
          bullets: takeaways.slice(0, 4).map((item, idx) => ({
            id: item.id || `fallback-core-${idx}`,
            text: item.text,
            level: item.level,
          })),
        },
      ]
    }
    
    // 优先级3：从 content 提取（仅 drug_class 类型且有完整 content）
    if (basePointType === 'drug_class' && safePoint?.content && safePoint.content.length > 100) {
      const extractedDrugs = extractDrugsFromContent(safePoint.content)
      if (extractedDrugs.length > 0) {
        return extractedDrugs.map((drug, idx) => ({
          id: `extracted-drug-${idx}`,
          name: drug.name,
          why: drug.why || '本类药物中的代表药物，考试中常用来区分不同类别或对比作用特点。',
          bullets: [],
        }))
      }
    }
    
    return []
  }, [coreDrugsModule, safePoint, takeaways, basePointType])

  const examDistributionItems = useMemo<ExamDistributionItem[]>(() => {
    if (examDistributionModule?.data?.items?.length) {
      return examDistributionModule.data.items
    }
    if (safePoint?.exam_years?.length) {
      return [
        {
          id: `${safePoint.id}-distribution`,
          text: safePoint.title,
          years: safePoint.exam_years.join(' / '),
        },
      ]
    }
    return []
  }, [examDistributionModule, safePoint])

  const actionSet = useMemo(() => {
    return newConfig?.actions ?? DEFAULT_ACTIONS
  }, [newConfig])

  // 学习建议：仅保留一行固定提示
  const studyRouteText = useMemo(() => {
    if (newConfig?.meta.studyRoute?.length) {
      return newConfig.meta.studyRoute.join(' → ')
    }
    if (oldConfig?.studyPath?.text) {
      // 提取固定提示文本，移除展开解释
      const text = oldConfig.studyPath.text
      if (text.includes('：')) {
        return text.split('：')[0] + '：' + text.split('：')[1]?.split('→')[0]?.trim() || ''
      }
      return text
    }
    return '学习建议：先看考什么 → 再记重点 → 最后做本页自测'
  }, [newConfig, oldConfig])

  // 【步骤 1】判断考点类型（最终版本，考虑 coreDrugCards）
  const pointType = useMemo<PointType>(() => {
    // 若核心对象是"单一具体药物"，判定为【具体必考药物】
    if (basePointType === 'specific_drug' || 
        (coreDrugCards.length > 0 && coreDrugCards[0]?.name && !coreDrugCards[0]?.name.includes('类'))) {
      return 'specific_drug'
    }
    
    // 若核心对象是"某一类药物"，判定为【药物分类】
    if (basePointType === 'drug_class' ||
        (coreDrugCards.length > 0 && coreDrugCards[0]?.name?.includes('类'))) {
      return 'drug_class'
    }
    
    return basePointType
  }, [basePointType, coreDrugCards])

  // 检查是否为药物类考点（兼容旧逻辑）
  const isDrugPoint = useMemo(() => {
    return pointType === 'specific_drug' || pointType === 'drug_class'
  }, [pointType])

  // 验证核心药物详解卡必需字段
  const validateCoreDrugCard = useMemo(() => {
    if (!isDrugPoint) return true // 非药物类考点不需要验证
    
    if (coreDrugCards.length === 0) {
      console.error(`[系统错误] 药物类考点 ${safePointId} 缺少核心药物详解卡模块`)
      return false
    }

    for (const card of coreDrugCards) {
      const hasWhy = !!card.why
      const hasIndication = card.bullets.some(b => 
        b.text.includes('适应证') || b.text.includes('适应症') || b.level === 'key'
      )
      const hasContraindication = card.bullets.some(b => 
        b.text.includes('禁忌') || b.level === 'danger'
      )
      const hasInteraction = card.bullets.some(b => 
        b.text.includes('相互作用') || b.text.includes('交互') || b.level === 'warn'
      )

      if (!hasWhy || !hasIndication || !hasContraindication || !hasInteraction) {
        console.error(`[系统错误] 核心药物详解卡 ${card.name} 缺少必需字段`, {
          hasWhy,
          hasIndication,
          hasContraindication,
          hasInteraction
        })
        return false
      }
    }
    return true
  }, [isDrugPoint, coreDrugCards, safePointId])

  const structureSections = useMemo(() => {
    return classificationSections.length > 0 ? classificationSections : []
  }, [classificationSections])

  // ==================== 模块内容状态判断 ====================
  // 结构骨架状态
  const structureState = getModuleContentState({
    isAggregationNode,
    pointMissing,
    hasData: structureSections.length > 0 && structureSections.some(section =>
      section.items.some(item => {
        const isPlaceholder = (item as any).placeholder === true
        const isPlaceholderText = item.text === '待补充' || item.text.trim() === ''
        return !isPlaceholder && !isPlaceholderText
      })
    )
  })

  // 高频考法状态
  const highFreqState = getModuleContentState({
    isAggregationNode,
    pointMissing,
    hasData: hfPatternCount > 0
  })

  // 易错点状态
  const pitfallsState = getModuleContentState({
    isAggregationNode,
    pointMissing,
    hasData: pitfallsCount > 0
  })

  // 核心药物状态
  const coreDrugState = getModuleContentState({
    isAggregationNode,
    pointMissing,
    hasData: coreDrugCards.length > 0 && hasModuleContent('coreDrugCard', moduleRenderConfig, coreDrugCards)
  })

  // 教材原文状态
  const sourceState = getModuleContentState({
    isAggregationNode,
    pointMissing,
    hasData: !!(safePoint?.content && safePoint.content.length > 50)
  })

  // 考点分布状态
  const examDistributionState = getModuleContentState({
    isAggregationNode,
    pointMissing,
    hasData: examDistributionItems.length > 0
  })

  // 考什么模块状态
  const examMapState = getModuleContentState({
    isAggregationNode,
    pointMissing,
    hasData: !!examMapData,
  })

  const representativeExamFocusEntries = useMemo(() => {
    if (coreDrugCards.length === 0) {
      return []
    }
    const fallbackLine = hfPatterns[0] ?? pitfalls[0] ?? ''
    return coreDrugCards
      .map(card => {
        const focusLine =
          (card as any).examFocusLine ??
          (card as any).whyExam ??
          card.why ??
          fallbackLine
        if (!focusLine) return null
        return {
          id: card.id,
          name: card.name,
          focusLine,
        }
      })
      .filter((entry): entry is { id: string; name: string; focusLine: string } => !!entry)
      .slice(0, 4)
  }, [coreDrugCards, hfPatterns, pitfalls])

  // 学习建议 - 仅 drug_class / exam_strategy 类型
  // 优先级：配置数据 > 从 content 生成 > 默认
  const studyAdvice = useMemo<string | null>(() => {
    if (pointType !== 'drug_class' && pointType !== 'exam_strategy') {
      return null
    }
    
    // 优先级1：从配置中提取（检查 oldConfig 的 studyPath）
    if (oldConfig?.studyPath?.text) {
      const text = oldConfig.studyPath.text.replace(/学习(路线|建议)：/, '').trim()
      if (text && text.length > 10) {
        return text
      }
    }
    
    // 优先级2：从 content 生成（有完整教材原文时）
    if (safePoint?.content && safePoint.content.length > 100) {
      const generated = generateStudyAdviceFromContent(safePoint.content, pointType)
      if (generated) {
        return generated
      }
    }
    
    // 优先级3：默认建议
    if (pointType === 'drug_class') {
      return '本考点建议侧重对比和情境判断，通过做题巩固各类药物的应用场景。'
    }
    if (pointType === 'exam_strategy') {
      return '本考点建议结合真题练习，掌握考试出题规律和答题技巧。'
    }
    
    return null
  }, [pointType, oldConfig, safePoint])

  // 早期返回必须在所有 hooks 之后
  if (loading) return <div className="p-8">加载中…</div>
  if (error || !safePoint) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">{error || '知识点不存在'}</p>
        <Link href="/knowledge" className="text-blue-600">返回知识图谱</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="space-y-4">
            <ExamValueCard
              title={newConfig?.meta.title || safePoint.title}
              importanceLevel={effectiveImportanceLevel}
              masteryScore={safePoint.mastery_score}
              learnMode={effectiveLearnMode}
              examYears={safePoint.exam_years}
              examFrequency={safePoint.exam_frequency}
              className="mb-0"
            />
            {showDebugBadge && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                <span className="px-2 py-1 rounded bg-gray-100 border border-gray-200">
                  版本: <span className="font-semibold text-gray-900">{buildVersionDisplay}</span>
                </span>
                <span className="px-2 py-1 rounded bg-gray-100 border border-gray-200">
                  point_missing: <span className="font-semibold text-gray-900">{pointMissing ? 'true' : 'false'}</span>
                </span>
                <span className="px-2 py-1 rounded bg-gray-100 border border-gray-200">
                  exam_point_type: <span className="font-semibold text-gray-900">{examPointTypeDisplay}</span>
                </span>
                <span className="px-2 py-1 rounded bg-gray-100 border border-gray-200">
                  hf_patterns: {hfPatternCount > 0 ? `${hfPatternCount} 条` : 'empty'}
                </span>
                <span className="px-2 py-1 rounded bg-gray-100 border border-gray-200">
                  pitfalls: {pitfallsCount > 0 ? `${pitfallsCount} 条` : 'empty'}
                </span>
                <span className="px-2 py-1 rounded bg-gray-100 border border-gray-200">
                  hf_generated_at: <span className="font-semibold text-gray-900">{hfGeneratedAtDisplay}</span>
                  </span>
              </div>
            )}
            {/* 学习建议：仅保留一行固定提示 */}
            <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/60 px-4 py-2 text-sm text-blue-900">
              {formatAbbreviations(studyRouteText)}
            </div>
          </div>

          {/* 考点文件内容（如果存在则优先显示） */}
          {pointFileContent && pointFileContent.stages.length > 0 ? (
            <div className="space-y-6">
              {renderPointFileContent()}
            </div>
          ) : (
            <>
              {/* 原有内容（文件不存在时显示） */}
              <ModuleShell title="📌 本考点在考什么？">
                {examMapState === 'real' && examMapData && (
                  <div className="space-y-3 text-gray-800 leading-relaxed">
                    <p className="whitespace-pre-line">{formatAbbreviations(examMapData.prompt)}</p>
                    {examMapData.angles.length > 0 && (
                      <div className="space-y-2">
                        {examMapData.angles.map((angle, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-gray-900">
                            <span className="text-blue-600 mt-1">•</span>
                            <span className="leading-relaxed">{formatAbbreviations(angle)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  <p className="text-gray-900 text-sm font-semibold">
                    本考点围绕【{chapterContext.nodeTitle}】，考试通常从 3 个角度出题：
                  </p>
                  <ul className="list-disc ml-4 space-y-1 text-gray-700">
                    {[
                      '① 药物如何分类（同类区分、适用范围）',
                      '② 各类药物的作用特点及关键禁忌',
                      '③ 必考核心药物的典型考法',
                    ].map(angle => (
                      <li key={angle}>{angle}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-900">👉 其中重点集中在：</p>
                  <ul className="space-y-2 text-gray-700 ml-4 list-none">
                    {[
                      '药物分类与代表药（高频送分）',
                      '临床用药评价中的「禁忌 / 易错点」',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                    {representativeExamFocusEntries.map(entry => (
                      <li key={entry.id} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>
                          {formatAbbreviations(entry.name)}：{formatAbbreviations(entry.focusLine)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ModuleShell>

              <ModuleShell title="结构骨架（脑内地图）" description="无论是聚合还是单体，都帮助你建立梳理思路">
                {renderStructureContent(structureState)}
              </ModuleShell>

              <ModuleShell
                title="高频考法 & 易错点（应试核心区）"
                description="左栏展示出题人视角的高频命题，右栏展示考生容易翻车的风险点"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-base font-semibold text-blue-700 mb-3">📌 高频考法（出题人视角）</h3>
                    {renderHighFreqContent(highFreqState)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-orange-700 mb-3">⚠️ 易错点（考生翻车点）</h3>
                    {renderPitfallContent(pitfallsState)}
                  </div>
                </div>
              </ModuleShell>

              {pointType === 'drug_class' && (
                <ModuleShell title="代表药物应试定位" description="仅针对药物分类考点，帮助抓住代表药与不同类的差异">
                  {coreDrugCards.length > 0 ? (
                    <div className="space-y-3">
                      {coreDrugCards.map(card => (
                        <div key={card.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/30 rounded-r">
                          <div className="font-semibold text-gray-900 mb-1">
                            {formatAbbreviations(card.name)}
                            {card.alias && (
                              <span className="text-sm font-normal text-gray-600 ml-2">
                                ({formatAbbreviations(card.alias)})
                              </span>
                            )}
                          </div>
                          {card.why ? (
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {formatAbbreviations(card.why)}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              代表药正在整理中，详情待完善
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-gray-600 text-sm">
                        该模块在当前考点下暂未形成稳定考法，已为你保留结构位置，后续出现相关出题内容将自动激活。
                      </p>
                    </div>
                  )}
                </ModuleShell>
              )}

              {(pointType === 'drug_class' || pointType === 'exam_strategy') && (
                <ModuleShell title="学习建议">
                  {studyAdvice ? (
                    <p className="text-gray-700 leading-relaxed">
                      {formatAbbreviations(studyAdvice)}
                    </p>
                  ) : safePoint?.content && safePoint.content.length > 100 ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-800 text-sm">
                        📝 正在从教材原文中生成学习建议…
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-gray-600 text-sm">
                        该模块在当前考点下暂未形成稳定考法，已为你保留结构位置，后续出现相关出题内容将自动激活。
                      </p>
                    </div>
                  )}
                </ModuleShell>
              )}

              <ModuleShell
                title={
                  moduleRenderConfig.coreDrugCard.template === 'single_drug'
                    ? '核心药物详解卡（只保留必考药）'
                    : moduleRenderConfig.coreDrugCard.template === 'drug_class'
                    ? '分类核心卡'
                    : moduleRenderConfig.coreDrugCard.template === 'clinical_selection'
                    ? '用药决策卡'
                    : moduleRenderConfig.coreDrugCard.template === 'adr_interaction'
                    ? '风险专题卡'
                    : moduleRenderConfig.coreDrugCard.template === 'mechanism_basic'
                    ? '机制说明卡'
                    : '核心药物详解卡'
                }
                description="根据考点类型展示代表药或核心药物的应试要点"
              >
                {renderCoreDrugContent(coreDrugState)}
              </ModuleShell>

              <ModuleShell
                title={sourceModule?.title || '📘 教材原文（精选整理，用于系统复习）'}
                description="精选教材原文用于系统复习，支持折叠查看"
              >
                {renderSourceContent(sourceState)}
              </ModuleShell>

              {/* 【聚合节点降级渲染】分类表（药物分类表）- 聚合节点时允许渲染 */}
              {isAggregationNode && safePoint.content && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">分类表（药物分类表）</h2>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <SmartContentRenderer
                      content={safePoint.content}
                      annotations={inlineAnnotations.length > 0 ? inlineAnnotations : undefined}
                      variant="minimal"
                    />
                  </div>
                </div>
              )}

              <ModuleShell title="考点分布（只保留一次）" description="考点历年分布/小节覆盖情况">
                {renderExamDistributionContent(examDistributionState)}
              </ModuleShell>
            </>
          )}

          {/* 【聚合节点降级渲染】提示文案 */}
          {isAggregationNode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm leading-relaxed">
                💡 本页已提炼本章节的核心考法与判类要点，建议下方自测检验掌握情况。
              </p>
            </div>
          )}

          {/* 学习完成后的行动区（纵向布局，非固定） */}
          <PointBottomActions
            pointId={safePoint.id}
            sectionId={safePoint.section?.id}
            selfTestHref={(() => {
              const action = actionSet.primary
              if (!action) return undefined
              if (action.href) return action.href
              if (action.type === 'selfTest') {
                return `/practice/by-point?pointId=${safePoint.id}&mode=self-test&count=${action.payload?.count || 5}`
              }
              return undefined
            })()}
            practiceHref={(() => {
              const action = actionSet.secondary
              if (!action) return undefined
              if (action.href) return action.href
              if (action.type === 'practice') {
                return `/practice/by-point?pointId=${safePoint.id}`
              }
              return undefined
            })()}
          />
        </div>
      </div>
    </div>
  )
}
