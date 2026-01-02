/**
 * Global Knowledge Point Page Schema
 * Used by /knowledge/point/[id] template to render consistent exam-driven layout.
 */

export type PointTag = {
  label: string              // e.g. "常考"
  tone?: "neutral" | "info" | "warn" | "danger"
}

export type TakeawayLevel = "key" | "warn" | "danger"
// key=蓝(高频/秒选/机制), warn=橙(注意/易错), danger=红(禁忌/致命)

export type Takeaway = {
  id: string                 // unique stable id, e.g. "udca-interaction"
  level: TakeawayLevel
  text: string               // trigger-style short phrase
  anchorId?: string          // optional: scroll target in original content
}

export type ExamAngle = {
  id: string                 // e.g. "angle-classification"
  title: string              // e.g. "药物如何分类"
  hint?: string              // e.g. "肝用药 vs 胆用药"
}

export type ExamFocus = {
  id: string                 // e.g. "focus-udca"
  text: string               // e.g. "UDCA 的适应证 / 禁忌 / 相互作用"
}

export type ExamOverviewBlock = {
  title: string              // "🧭 本考点在考什么？"
  intro?: string             // one short intro line
  angles: ExamAngle[]        // 3 angles
  focusTitle?: string         // "其中重点集中在："
  focus: ExamFocus[]         // bullet list of focus points
  collapsible?: boolean       // default true
  defaultOpen?: boolean       // default true
}

export type StudyPathBlock = {
  text: string               // "学习路线：先搞懂怎么考 → 再记重点 → 最后做题"
}

export type AnnotationType = "怎么考" | "坑点" | "秒选"

export type InlineAnnotationRule = {
  id: string
  // match can be regex string for storage; runtime can convert to RegExp
  match: { type: "contains"; value: string } | { type: "regex"; value: string }
  annotation: {
    type: AnnotationType
    level: TakeawayLevel     // controls color
    title?: string           // optional short title
    message: string          // short (1-2 bullets max)
  }
  anchorId?: string          // optional: used for takeaways -> scroll mapping
}

export type UIOptions = {
  enableFocusMode?: boolean  // default true
  defaultFocusMode?: boolean // default false
  showExamDistribution?: "collapsed" | "visible" | "hidden" // default "collapsed"
  showMnemonic?: "visible" | "collapsed" | "hidden"         // default "collapsed"
}

export type PointPageConfig = {
  pointId: string
  titleOverride?: string     // optional if you want override point title
  stars?: number             // 1-5
  tags?: PointTag[]          // e.g. 常考/高频
  studyPath: StudyPathBlock
  examOverview: ExamOverviewBlock   // THIS is your "D block" replacement
  takeaways?: Takeaway[]            // 6-8 recommended
  inlineAnnotations?: InlineAnnotationRule[]
  ui?: UIOptions

  /**
   * NOTE: We do NOT store original tables here.
   * Original content comes from DB/API and is rendered ONCE.
   * This config only controls top blocks + highlighting/annotations.
   */
}

/**
 * 获取默认 UI 选项
 */
export function getDefaultUIOptions(): UIOptions {
  return {
    enableFocusMode: true,
    defaultFocusMode: false,
    showExamDistribution: "collapsed",
    showMnemonic: "collapsed",
  }
}

/**
 * 获取默认考试概览（当没有配置时）
 */
export function getDefaultExamOverview(title: string): ExamOverviewBlock {
  return {
    title: "🧭 本考点在考什么？",
    intro: `本考点围绕【${title}】，考试通常从以下角度出题：`,
    angles: [
      { id: "angle-1", title: "基本概念与分类" },
      { id: "angle-2", title: "作用特点与临床应用" },
      { id: "angle-3", title: "注意事项与禁忌" },
    ],
    focusTitle: "其中重点集中在：",
    focus: [
      { id: "focus-1", text: "核心概念与分类（高频送分）" },
      { id: "focus-2", text: "临床应用与注意事项" },
    ],
    collapsible: true,
    defaultOpen: true,
  }
}
