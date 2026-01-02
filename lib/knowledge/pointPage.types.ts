/**
 * 全站考点页面配置类型定义
 * 
 * 基于 JSON Schema 的 TypeScript 类型
 */

export type Level = "danger" | "warn" | "key"

export type PointPageConfig = {
  version: "1.0"
  pointId: string
  meta: {
    title: string
    subtitle?: string
    examTag: "常考" | "高频" | "冷门" | "必背"
    stars: 1 | 2 | 3 | 4 | 5
    studyRoute: string[]
    breadcrumbs?: string[]
  }
  modules: Module[]
  actions: {
    primary: Action
    secondary: Action
    tertiary: Action
  }
}

export type Action = {
  label: string
  type: "selfTest" | "practice" | "backToGraph" | "markDone"
  href?: string
  payload?: Record<string, unknown>
}

export type Module =
  | ExamMapModule
  | ClassificationMapModule
  | HighYieldModule
  | CoreDrugsModule
  | SourceMaterialModule
  | ExamDistributionModule

export type ExamMapModule = {
  id: string
  type: "examMap"
  title: string
  collapsible?: boolean
  defaultExpanded?: boolean
  data: {
    prompt: string
    angles: string[]
    focusTitle?: string
    focus: Takeaway[]
  }
}

export type ClassificationMapModule = {
  id: string
  type: "classificationMap"
  title: string
  collapsible?: boolean
  defaultExpanded?: boolean
  data: {
    sections: {
      id: string
      title: string
      hint?: string
      items: { id: string; text: string }[]
    }[]
  }
}

export type HighYieldModule = {
  id: string
  type: "highYield"
  title: string
  collapsible?: boolean
  defaultExpanded?: boolean
  data: {
    intro?: string
    rules: ExamRule[]
  }
}

export type ExamRule = {
  id: string
  bucket: "必须磷脂类" | "解毒类" | "抗炎类" | "抗氧化药" | "其他"
  level: Level
  oneLiner: string   // 一句话骨干
  examMove?: string  // "看到题干…怎么选"
  anchors?: string[] // 定位到原文
}

export type CoreDrugsModule = {
  id: string
  type: "coreDrugs"
  title: string
  collapsible?: boolean
  defaultExpanded?: boolean
  data: {
    cards: CoreDrugCard[]
  }
}

export type CoreDrugCard = {
  id: string
  name: string
  alias?: string
  why: string // 为什么必考
  bullets: Takeaway[]
  relatedPracticeTag?: string
}

export type Takeaway = {
  id: string
  level: Level
  text: string
  anchorId?: string
}

export type SourceMaterialModule = {
  id: string
  type: "sourceMaterial"
  title: string
  collapsible?: boolean
  defaultExpanded?: boolean
  data: {
    strategy: "singleSourceOnly" | "singleSourceWithHighlights"
    blocks: SourceBlock[]
  }
}

export type SourceBlock = {
  id: string
  title: string
  renderFrom: "existingTables" | "existingMarkdown" | "existingSmartRenderer"
  defaultExpanded?: boolean
  highlighting?: {
    enabled?: boolean
    palette?: { danger?: string; warn?: string; key?: string }
    stickers?: StickerRule[]
  }
}

export type StickerRule = {
  id: string
  match: string // regex string
  label: string // 贴纸文本
  level: Level
}

export type ExamDistributionModule = {
  id: string
  type: "examDistribution"
  title: string
  collapsible?: boolean
  defaultExpanded?: boolean
  data: {
    items: { id: string; text: string; years: string }[]
  }
}

