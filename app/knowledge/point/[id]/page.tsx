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

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'

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
  extractExamPatternsFromContent,
  extractDrugsFromContent,
  generateStudyAdviceFromContent,
  generateDefaultExamPatterns,
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
import type { ExamPointType } from '@/lib/knowledge/examPointType'
import { isValidExamPointType } from '@/lib/knowledge/examPointType'
import { parseFromDatabase } from '@/lib/knowledge/highFreqExtractor'

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

type ExamMapData = {
  prompt: string
  angles: string[]
  focusTitle?: string
  focus: { id: string; text: string }[]
}

type PointType = 'specific_drug' | 'drug_class' | 'exam_strategy' | 'structure_skeleton' | 'structure_only' | 'strategy'

type ExamCoreZone = {
  high_frequency_patterns: string[]
  common_traps: string[]
  isComplete: boolean
  isPlaceholder: boolean
}

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
  const showDebugBadge = DEBUG_BADGE_ENABLED && !!safePoint
  const examPointTypeDisplay = safePoint?.exam_point_type ?? '未设置'
  const isExamPointTypeMissing = !safePoint?.exam_point_type

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

  // 学习路线：仅保留一行固定提示
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
    return '学习路线：先看考什么 → 再记重点 → 最后做3题'
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

  // 【强制模块】exam_core_zone: 高频考法 & 易错点（应试核心区）
  // 适用范围：仅【具体必考药物】和【药物分类】
  // 优先级：配置数据 > 从 content 提取 > takeaways 回退 > 占位
  const examCoreZone = useMemo<ExamCoreZone>(() => {
    // 适用范围：仅【具体必考药物】和【药物分类】需要生成
    if (pointType !== 'specific_drug' && pointType !== 'drug_class') {
      return {
        high_frequency_patterns: [],
        common_traps: [],
        isComplete: false,
        isPlaceholder: false
      }
    }

    const patterns: string[] = []
    const traps: string[] = []

    // 优先级1：从 highYieldModule 配置提取
    if (highYieldModule?.data?.rules) {
      for (const rule of highYieldModule.data.rules) {
        // 高频考法：使用特定句式
        if (rule.examMove || rule.oneLiner) {
          const text = rule.examMove || rule.oneLiner
          // 检查是否符合句式要求
          if (text.includes('如果') && text.includes('问') && text.includes('选')) {
            patterns.push(formatAbbreviations(text))
          } else if (text.includes('题干出现') && text.includes('首选')) {
            patterns.push(formatAbbreviations(text))
          } else if (text.includes('常考问法')) {
            patterns.push(formatAbbreviations(text))
          } else if (rule.level === 'key') {
            // 转换为标准句式
            if (pointType === 'drug_class') {
              patterns.push(`常考问法是${formatAbbreviations(rule.oneLiner)}`)
            } else {
              patterns.push(`如果题干问${formatAbbreviations(rule.oneLiner)}，选${formatAbbreviations(rule.bucket)}`)
            }
          }
        }
        
        // 易错点：使用特定句式
        if (rule.level === 'warn' || rule.level === 'danger') {
          const trapText = rule.examMove || rule.oneLiner
          if (trapText && trapText.includes('常见误区')) {
            traps.push(formatAbbreviations(trapText))
          } else if (trapText) {
            traps.push(`常见误区是${formatAbbreviations(trapText)}，正确理解是${formatAbbreviations(rule.oneLiner)}`)
          }
        }
      }
    }

    // 优先级2：从 content 提取（仅在配置数据不足时）
    if ((patterns.length < 2 || traps.length < 2) && safePoint?.content) {
      const extracted = extractExamPatternsFromContent(safePoint.content, pointType)
      if (extracted) {
        patterns.push(...extracted.patterns.slice(0, 2 - patterns.length))
        traps.push(...extracted.traps.slice(0, 2 - traps.length))
      }
    }

    // 优先级3：从 takeaways 补充数据
    if (patterns.length < 2 || traps.length < 2) {
      for (const item of takeaways) {
        if (patterns.length < 2 && item.level === 'key') {
          if (pointType === 'drug_class') {
            patterns.push(`常考问法是${formatAbbreviations(item.text)}`)
          } else {
            patterns.push(`如果题干问${formatAbbreviations(item.text)}，选相关药物`)
          }
        }
        if (traps.length < 2 && (item.level === 'warn' || item.level === 'danger')) {
          traps.push(`常见误区是${formatAbbreviations(item.text)}，正确理解需参考教材原文`)
        }
      }
    }

    // 优先级4：生成默认高频考法和易错点（当所有提取方法都失败时）
    if ((patterns.length < 2 || traps.length < 2) && safePoint?.title) {
      const defaultPatterns = generateDefaultExamPatterns(safePoint.title, pointType)
      if (defaultPatterns) {
        // 补充不足的部分
        if (patterns.length < 2) {
          const needed = 2 - patterns.length
          patterns.push(...defaultPatterns.patterns.slice(0, needed))
        }
        if (traps.length < 2) {
          const needed = 2 - traps.length
          traps.push(...defaultPatterns.traps.slice(0, needed))
        }
      }
    }

    // 校验数量下限
    const hasMinPatterns = patterns.length >= 2
    const hasMinTraps = traps.length >= 2
    const isComplete = hasMinPatterns && hasMinTraps

    return {
      high_frequency_patterns: patterns.slice(0, 6), // 最多6条
      common_traps: traps.slice(0, 6), // 最多6条
      isComplete,
      isPlaceholder: !isComplete && (patterns.length > 0 || traps.length > 0)
    }
  }, [pointType, highYieldModule, takeaways, safePoint])

  // 确保高频考法模块存在（兼容旧逻辑）
  const hasHighYield = useMemo(() => {
    return examCoreZone.high_frequency_patterns.length > 0 || examCoreZone.common_traps.length > 0
  }, [examCoreZone])

  const structureSections = useMemo(() => {
    return classificationSections.length > 0 ? classificationSections : []
  }, [classificationSections])

  // 学习建议 - 仅 drug_class / exam_strategy 类型
  // 优先级：配置数据 > 从 content 生成 > 默认
  const studyAdvice = useMemo<string | null>(() => {
    if (pointType !== 'drug_class' && pointType !== 'exam_strategy') {
      return null
    }
    
    // 优先级1：从配置中提取（检查 oldConfig 的 studyPath）
    if (oldConfig?.studyPath?.text) {
      const text = oldConfig.studyPath.text.replace(/学习路线：/, '').trim()
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
                  exam_point_type: <span className="font-semibold text-gray-900">{examPointTypeDisplay}</span>
                </span>
                <span className="px-2 py-1 rounded bg-gray-100 border border-gray-200">
                  hf_patterns: {hfPatternCount > 0 ? `${hfPatternCount} 条` : 'empty'}
                </span>
                <span className="px-2 py-1 rounded bg-gray-100 border border-gray-200">
                  pitfalls: {pitfallsCount > 0 ? `${pitfallsCount} 条` : 'empty'}
                </span>
                {isExamPointTypeMissing && (
                  <span className="px-2 py-1 rounded text-red-700 bg-red-100 border border-red-200 font-semibold">
                    exam_point_type missing
                  </span>
                )}
              </div>
            )}
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-gray-800 leading-relaxed">
              【本页定位】
              <br />
              本页用于「考点复习与自测」，帮助你判断：
              <br />
              ✓ 这一考点考试怎么考
              <br />
              ✓ 哪些内容需要重点复习
              <br />
              ✓ 你目前是否掌握
            </div>
            {/* 学习路线：仅保留一行固定提示 */}
            <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/60 px-4 py-2 text-sm text-blue-900">
              {formatAbbreviations(studyRouteText)}
            </div>
          </div>

          {/* 【聚合节点降级渲染】当 is_aggregation_node = true 时，禁止渲染本模块 */}
          {!isAggregationNode && (
            <>
              {/* 【必须模块】本考点在考什么 - 所有考点类型都必须显示 */}
              {examMapData ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">📌 本考点在考什么？</h2>
              <div className="space-y-3 text-gray-800 leading-relaxed">
                <p className="whitespace-pre-line">
                  {formatAbbreviations(examMapData.prompt)}
                </p>
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
                {examMapData.focus.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatAbbreviations(examMapData.focusTitle || '👉 其中重点集中在：')}
                    </div>
                    <ul className="list-disc ml-5 space-y-1 text-gray-800">
                      {examMapData.focus.map((item) => (
                        <li key={item.id}>{formatAbbreviations(item.text)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">📌 本考点在考什么？</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  ⚠️ 本模块内容待补充（point_id: {safePointId}）
                </p>
              </div>
            </div>
          )}
            </>
          )}

          {/* 【聚合节点降级渲染】当 is_aggregation_node = true 时，禁止渲染结构骨架 */}
          {!isAggregationNode && (
            <>
              {/* 【必须模块】结构骨架（脑内地图）- 所有考点类型都必须显示 */}
              {/* 结构骨架必须始终存在，根据 exam_point_type 显示不同的结构模板 */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">结构骨架（脑内地图）</h2>
            {(() => {
              // 如果结构骨架没有内容，使用类型感知的占位符
              if (!hasModuleContent('structureSkeleton', moduleRenderConfig, structureSections)) {
                return (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-gray-600 text-sm mb-3">
                      {moduleRenderConfig.structureSkeleton.placeholder || '本考点该模块内容正在完善中，当前以教材原文为准'}
                    </p>
                    {moduleRenderConfig.structureSkeleton.sections.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-semibold text-gray-700">本类考点通常从以下维度考查：</p>
                        <ul className="space-y-1 text-gray-600 ml-4">
                          {moduleRenderConfig.structureSkeleton.sections.map((section, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              <span>{section.title}{section.description ? `：${section.description}` : ''}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              }
              
              // 过滤出有实际内容的结构项（非占位符）
              const sectionsWithContent = structureSections.filter(section => {
                return section.items.some(item => {
                  const isPlaceholder = (item as any).placeholder === true
                  const isPlaceholderText = item.text === '待补充' || item.text.trim() === ''
                  return !isPlaceholder && !isPlaceholderText
                })
              })

              // 统计无内容的结构项数量
              const emptySectionsCount = structureSections.length - sectionsWithContent.length

              // 如果 ≥2 个结构项无内容，使用概览式渲染
              if (emptySectionsCount >= 2) {
                return (
                  <div className="space-y-4">
                    <p className="text-gray-800 leading-relaxed font-medium">
                      本类考点通常从以下维度考查：
                    </p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      {structureSections.map((section) => (
                        <li key={section.id} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{formatAbbreviations(section.title)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-gray-600 leading-relaxed mt-4 pt-4 border-t border-gray-200">
                      本考点当前以建立整体认知结构为主，具体细节可结合下方教材原文理解。
                    </p>
                  </div>
                )
              }

              // 如果只有部分结构项有内容，只渲染有内容的部分
              if (sectionsWithContent.length > 0) {
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sectionsWithContent.map((section) => {
                      // 过滤出非占位符的 items
                      const validItems = section.items.filter(item => {
                        const isPlaceholder = (item as any).placeholder === true
                        const isPlaceholderText = item.text === '待补充' || item.text.trim() === ''
                        return !isPlaceholder && !isPlaceholderText
                      })

                      // 只渲染有有效内容的 section
                      if (validItems.length === 0) return null

                      return (
                        <div key={section.id} className="space-y-2">
                          <h3 className="text-base font-semibold text-gray-900">
                            {formatAbbreviations(section.title)}
                          </h3>
                          <ul className="space-y-1 text-gray-800 ml-1">
                            {validItems.map((item) => (
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

              // 如果所有结构项都无内容，使用概览式渲染
              return (
                <div className="space-y-4">
                  <p className="text-gray-800 leading-relaxed font-medium">
                    本类考点通常从以下维度考查：
                  </p>
                  <ul className="space-y-2 text-gray-700 ml-4">
                    {structureSections.map((section) => (
                      <li key={section.id} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{formatAbbreviations(section.title)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600 leading-relaxed mt-4 pt-4 border-t border-gray-200">
                    本考点当前以建立整体认知结构为主，具体细节可结合下方教材原文理解。
                  </p>
                </div>
              )
            })()}
          </div>
            </>
          )}

          {/* 【强制模块】高频考法 & 易错点（应试核心区）
          所有考点类型都必须显示，永远渲染框架
          渲染位置：结构骨架之后，核心药物详解卡之前 */}
          {moduleRenderConfig.examCoreZone.enabled && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                高频考法 & 易错点（应试核心区）
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 高频考法 */}
                <div>
                  <h3 className="text-base font-semibold text-blue-700 mb-3">📌 高频考法</h3>
                  {hfPatterns.length > 0 ? (
                    <ul className="space-y-2">
                      {hfPatterns.map((pattern, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-800 leading-relaxed">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{formatAbbreviations(pattern)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-gray-600 text-sm">
                        待补充：先从教材原文的『作用特点/适应证/用法用量』提炼
                      </p>
                    </div>
                  )}
                </div>

                {/* 易错点 */}
                <div>
                  <h3 className="text-base font-semibold text-orange-700 mb-3">⚠️ 易错点</h3>
                  {pitfalls.length > 0 ? (
                    <ul className="space-y-2">
                      {pitfalls.map((pitfall, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-800 leading-relaxed">
                          <span className="text-orange-600 mt-1">•</span>
                          <span>{formatAbbreviations(pitfall)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-gray-600 text-sm">
                        待补充：先从教材原文的『禁忌/相互作用/监测/典型不良反应』提炼
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 【聚合节点降级渲染】当 is_aggregation_node = true 时，禁止渲染代表药物应试定位 */}
          {!isAggregationNode && (
            <>
              {/* 【一类药物专用】代表药物应试定位（仅点名代表药，不展开成核心药物详解卡） */}
          {pointType === 'drug_class' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">代表药物应试定位</h2>
              {coreDrugCards.length > 0 ? (
                <div className="space-y-3">
                  {coreDrugCards.map((card) => (
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
                          为什么在考试中会出现：待补充
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ 代表药物应试定位待补充（point_id: {safePointId}）
                  </p>
                </div>
              )}
            </div>
          )}
            </>
          )}

          {/* 【聚合节点降级渲染】当 is_aggregation_node = true 时，禁止渲染学习建议 */}
          {!isAggregationNode && (
            <>
              {/* 【一类药物/策略专用】学习建议 */}
          {(pointType === 'drug_class' || pointType === 'exam_strategy') && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">学习建议</h2>
              {studyAdvice ? (
                <p className="text-gray-700 leading-relaxed">
                  {formatAbbreviations(studyAdvice)}
                </p>
              ) : safePoint?.content && safePoint.content.length > 100 ? (
                // 有完整教材原文时，必须自动生成，不允许显示占位
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    📝 正在从教材原文中生成学习建议...
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ 学习建议待补充（point_id: {safePointId}）
                    {pointType === 'drug_class' && '：建议侧重对比 / 情境判断'}
                  </p>
                </div>
              )}
            </div>
          )}
            </>
          )}

          {/* 【聚合节点降级渲染】当 is_aggregation_node = true 时，禁止渲染核心药物详解卡 */}
          {!isAggregationNode && (
            <>
              {/* 强制引入模块「核心药物详解卡」，所有考点类型都必须显示
                  根据 exam_point_type 切换模板：single_drug / drug_class / clinical_selection / adr_interaction / mechanism_basic */}
              {moduleRenderConfig.coreDrugCard.enabled && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {moduleRenderConfig.coreDrugCard.template === 'single_drug' && '核心药物详解卡（只保留必考药）'}
                {moduleRenderConfig.coreDrugCard.template === 'drug_class' && '分类核心卡'}
                {moduleRenderConfig.coreDrugCard.template === 'clinical_selection' && '用药决策卡'}
                {moduleRenderConfig.coreDrugCard.template === 'adr_interaction' && '风险专题卡'}
                {moduleRenderConfig.coreDrugCard.template === 'mechanism_basic' && '机制说明卡'}
                {!moduleRenderConfig.coreDrugCard.template && '核心药物详解卡'}
              </h2>
              {hasModuleContent('coreDrugCard', moduleRenderConfig, coreDrugCards) ? (
                <div className="space-y-4">
                  {coreDrugCards.map((card) => {
                    // 分类 bullets 到不同类别
                    const indicationBullets = card.bullets.filter(b => 
                      b.text.includes('适应证') || b.text.includes('适应症') || b.level === 'key'
                    )
                    const contraindicationBullets = card.bullets.filter(b => 
                      b.text.includes('禁忌') || b.level === 'danger'
                    )
                    const interactionBullets = card.bullets.filter(b => 
                      b.text.includes('相互作用') || b.text.includes('交互') || b.level === 'warn'
                    )
                    const otherBullets = card.bullets.filter(b => 
                      !indicationBullets.includes(b) && 
                      !contraindicationBullets.includes(b) && 
                      !interactionBullets.includes(b)
                    )

                    return (
                      <div key={card.id} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-blue-50">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">🧠</span>
                          <h3 className="text-lg font-bold text-gray-900">
                            {formatAbbreviations(card.name)}
                            {card.alias && (
                              <span className="text-sm font-normal text-gray-600 ml-2">
                                ({formatAbbreviations(card.alias)})
                              </span>
                            )}
                          </h3>
                        </div>
                        
                        {/* 为什么考它（必需） */}
                        {card.why ? (
                          <div className="mb-4">
                            <div className="font-semibold text-gray-900 mb-1">【为什么考它】</div>
                            <p className="text-gray-800 leading-relaxed">{formatAbbreviations(card.why)}</p>
                          </div>
                        ) : (
                          <div className="mb-4 text-red-600 text-sm">⚠️ 缺少「为什么考它」字段</div>
                        )}

                        {/* 适应证（必需） */}
                        {indicationBullets.length > 0 ? (
                          <div className="mb-4">
                            <div className="font-semibold text-blue-700 mb-2">【适应证】</div>
                            <ul className="list-disc ml-5 space-y-1 text-gray-800">
                              {indicationBullets.map((bullet) => (
                                <li key={bullet.id} className="leading-relaxed">
                                  {formatAbbreviations(bullet.text.replace(/【适应证】|【适应症】/g, '').trim())}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="mb-4 text-red-600 text-sm">⚠️ 缺少「适应证」字段</div>
                        )}

                        {/* 禁忌（必需） */}
                        {contraindicationBullets.length > 0 ? (
                          <div className="mb-4">
                            <div className="font-semibold text-red-700 mb-2">【禁忌】</div>
                            <ul className="list-disc ml-5 space-y-1 text-red-700">
                              {contraindicationBullets.map((bullet) => (
                                <li key={bullet.id} className="leading-relaxed">
                                  {formatAbbreviations(bullet.text.replace(/【禁忌】/g, '').trim())}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="mb-4 text-red-600 text-sm">⚠️ 缺少「禁忌」字段</div>
                        )}

                        {/* 相互作用（必需） */}
                        {interactionBullets.length > 0 ? (
                          <div className="mb-4">
                            <div className="font-semibold text-orange-700 mb-2">【相互作用】</div>
                            <ul className="list-disc ml-5 space-y-1 text-orange-700">
                              {interactionBullets.map((bullet) => (
                                <li key={bullet.id} className="leading-relaxed">
                                  {formatAbbreviations(bullet.text.replace(/【相互作用】|【交互】/g, '').trim())}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="mb-4 text-red-600 text-sm">⚠️ 缺少「相互作用」字段</div>
                        )}

                        {/* 其他信息 */}
                        {otherBullets.length > 0 && (
                          <div className="mb-4">
                            <div className="font-semibold text-gray-700 mb-2">【其他】</div>
                            <ul className="list-disc ml-5 space-y-1 text-gray-800">
                              {otherBullets.map((bullet) => (
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
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-gray-600 text-sm">
                    {moduleRenderConfig.coreDrugCard.placeholder || '本考点该模块内容正在完善中，当前以教材原文为准'}
                  </p>
                </div>
              )}
            </div>
          )}
            </>
          )}

          {/* 【聚合节点降级渲染】教材原文（精选整理）- 聚合节点时允许渲染 */}
          {safePoint.content && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 sm:p-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {sourceModule?.title || '📘 教材原文（精选整理，用于系统复习）'}
                </h2>
              </div>
              <div className="p-4 sm:p-5 space-y-3">
                <div className="font-semibold text-gray-900">
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
                  <div className="border border-gray-200 rounded-lg p-4">
                    <SmartContentRenderer
                      content={safePoint.content}
                      annotations={inlineAnnotations.length > 0 ? inlineAnnotations : undefined}
                      variant="minimal"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

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

          {/* 【聚合节点降级渲染】考点分布（只保留一次）- 聚合节点时允许渲染 */}
          {examDistributionItems.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">考点分布（只保留一次）</h2>
              <div className="divide-y divide-gray-100">
                {examDistributionItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-gray-800">{formatAbbreviations(item.text)}</span>
                    <span className="text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                      {item.years}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 【聚合节点降级渲染】提示文案 */}
          {isAggregationNode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm leading-relaxed">
                💡 本页为章节聚合概览，详细考点正在拆分完善。
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
