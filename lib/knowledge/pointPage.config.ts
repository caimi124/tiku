/**
 * 全站考点详情页配置入口
 * 
 * 集中管理所有考点的页面配置，按 pointId 查询
 */

import type { PointPageConfig } from "./pointPage.schema"

export const POINT_PAGE_CONFIG: Record<string, PointPageConfig> = {
  "e75562a4-d0d9-491d-b7a0-837c3224e8d7": {
    pointId: "e75562a4-d0d9-491d-b7a0-837c3224e8d7",
    stars: 3,
    tags: [{ label: "常考", tone: "warn" }],

    studyPath: {
      text: "学习路线：先搞懂怎么考 → 再记重点 → 最后做3题自测",
    },

    examOverview: {
      title: "🧭 本考点在考什么？",
      intro: "本考点围绕【肝胆疾病用药】，考试通常从三个角度出题：",
      angles: [
        { id: "angle-classification", title: "药物如何分类", hint: "肝用药 vs 胆用药" },
        { id: "angle-characteristics", title: "各类药的作用特点与关键禁忌" },
        { id: "angle-core-drugs", title: "必考核心药物的典型考法" },
      ],
      focusTitle: "其中重点集中在：",
      focus: [
        { id: "focus-classification", text: "药物分类与代表药（高频送分）" },
        { id: "focus-evaluation", text: "临床用药评价中的\"禁忌 / 易错点\"" },
        { id: "focus-udca", text: "熊去氧胆酸（UDCA）的适应证 / 禁忌 / 相互作用" },
        { id: "focus-nac", text: "乙酰半胱氨酸（NAC）：对乙酰氨基酚过量的特异性解救药" },
      ],
      collapsible: true,
      defaultOpen: true,
    },

    takeaways: [
      { id: "ppc-benzyl", level: "danger", text: "磷脂针：苯甲醇 → 新生儿/早产儿禁用", anchorId: "a-ppc-benzyl" },
      { id: "ppc-dilution", level: "warn", text: "磷脂针：禁盐水/林格稀释", anchorId: "a-ppc-dilution" },
      { id: "nac", level: "key", text: "NAC：对乙酰氨基酚过量 → 秒选", anchorId: "a-nac" },
      { id: "glycyrrhizin", level: "warn", text: "甘草甜素：低钾 + 高血压雷区", anchorId: "a-glycyrrhizin" },
      { id: "bifendate", level: "key", text: "联苯双酯：ALT✅ AST❌（经典陷阱）", anchorId: "a-bifendate" },
      { id: "udca-indication", level: "key", text: "UDCA：适应证3连（溶石/胆汁淤积/PBC/反流胃炎）", anchorId: "a-udca-indication" },
      { id: "udca-contr", level: "danger", text: "UDCA：禁忌要背（炎症/阻塞/肝衰/胆囊问题）", anchorId: "a-udca-contr" },
      { id: "udca-interaction", level: "warn", text: "UDCA：考来烯胺/抗酸剂 → 间隔2h", anchorId: "a-udca-interaction" },
    ],

    inlineAnnotations: [
      {
        id: "ann-ppc-benzyl",
        match: { type: "regex", value: "(苯甲醇|喘息综合征|新生儿|早产儿).*?(禁用)" },
        annotation: {
          type: "坑点",
          level: "danger",
          message: "高频送命点：苯甲醇→喘息综合征；新生儿/早产儿禁用。",
        },
        anchorId: "a-ppc-benzyl",
      },
      {
        id: "ann-ppc-dilution",
        match: { type: "regex", value: "严禁用电解质溶液|0\\.9%氯化钠|林格液|只能用5%|10%葡萄糖|木糖醇" },
        annotation: {
          type: "秒选",
          level: "warn",
          message: "配制题：盐水/林格=错；只能葡萄糖/木糖醇。",
        },
        anchorId: "a-ppc-dilution",
      },
      {
        id: "ann-nac",
        match: { type: "regex", value: "对乙酰氨基酚|过量中毒|特异性解救药|乙酰半胱氨酸" },
        annotation: {
          type: "秒选",
          level: "key",
          message: "看到\"对乙酰氨基酚过量\"→ 直接选 NAC。",
        },
        anchorId: "a-nac",
      },
      {
        id: "ann-glycyrrhizin",
        match: { type: "regex", value: "低血钾|高血压|心衰|肾功能衰竭|禁用" },
        annotation: {
          type: "坑点",
          level: "warn",
          message: "甘草类：低钾+高血压雷区，题里常用来挖坑。",
        },
        anchorId: "a-glycyrrhizin",
      },
      {
        id: "ann-bifendate",
        match: { type: "regex", value: "降ALT|ALT.*肯定|AST.*不明显|远期疗效" },
        annotation: {
          type: "坑点",
          level: "key",
          message: "对比题：联苯双酯 ALT✅ AST❌（经典陷阱）。",
        },
        anchorId: "a-bifendate",
      },
      {
        id: "ann-udca-indication",
        match: { type: "regex", value: "熊去氧胆酸|胆固醇性胆囊结石|胆汁淤积|原发性胆汁性肝硬化|胆汁反流" },
        annotation: {
          type: "怎么考",
          level: "key",
          message: "UDCA：适应证/禁忌/相互作用经常连着考。",
        },
        anchorId: "a-udca-indication",
      },
      {
        id: "ann-udca-interaction",
        match: { type: "regex", value: "间隔2小时|考来烯胺|氢氧化铝|三硅酸镁" },
        annotation: {
          type: "秒选",
          level: "warn",
          message: "相互作用题：合用需间隔2h，否则吸收↓疗效↓。",
        },
        anchorId: "a-udca-interaction",
      },
    ],

    ui: {
      enableFocusMode: true,
      defaultFocusMode: false,
      showExamDistribution: "collapsed",
      showMnemonic: "collapsed",
    },
  },
}

/**
 * 获取考点配置
 */
export function getPointPageConfig(pointId: string): PointPageConfig | null {
  return POINT_PAGE_CONFIG[pointId] || null
}

/**
 * 检查是否有配置
 */
export function hasPointPageConfig(pointId: string): boolean {
  return pointId in POINT_PAGE_CONFIG
}
