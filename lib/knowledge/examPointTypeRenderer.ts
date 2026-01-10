/**
 * 考点类型感知渲染工具
 * Exam Point Type Aware Rendering Utilities
 * 
 * 根据 exam_point_type 为 8 个固定模块建立类型感知渲染规则
 */

import type { ExamPointType } from './examPointType'

export interface ModuleRenderConfig {
  // 核心药物详解卡
  coreDrugCard: {
    enabled: boolean
    template: 'single_drug' | 'drug_class' | 'clinical_selection' | 'adr_interaction' | 'mechanism_basic' | 'none'
    placeholder?: string
  }
  
  // 高频考法 & 易错点
  examCoreZone: {
    enabled: boolean
    contentSource: 'adr_interaction' | 'classification_comparison' | 'clinical_selection' | 'mechanism_misconception' | 'auto_extract'
    placeholder?: string
  }
  
  // 结构骨架
  structureSkeleton: {
    enabled: boolean
    template: 'single_drug' | 'drug_class' | 'clinical_selection' | 'adr_interaction' | 'mechanism_basic'
    placeholder?: string
    sections: Array<{
      title: string
      description?: string
    }>
  }
}

/**
 * 获取模块渲染配置（根据 exam_point_type）
 */
export function getModuleRenderConfig(examPointType: ExamPointType | null | undefined): ModuleRenderConfig {
  // 默认配置（mechanism_basic）
  const defaultConfig: ModuleRenderConfig = {
    coreDrugCard: {
      enabled: true,
      template: 'mechanism_basic',
      placeholder: '本考点该模块内容正在完善中，当前以教材原文为准',
    },
    examCoreZone: {
      enabled: true,
      contentSource: 'mechanism_misconception',
      placeholder: '本考点该模块内容正在完善中，当前以教材原文为准',
    },
    structureSkeleton: {
      enabled: true,
      template: 'mechanism_basic',
      placeholder: '本考点该模块内容正在完善中，当前以教材原文为准',
      sections: [
        { title: '靶点', description: '作用靶点与受体' },
        { title: '通路', description: '信号转导通路' },
        { title: '药效', description: '最终药效与临床应用' },
      ],
    },
  }

  if (!examPointType) {
    return defaultConfig
  }

  switch (examPointType) {
    case 'single_drug':
      return {
        coreDrugCard: {
          enabled: true,
          template: 'single_drug',
          placeholder: '本考点该模块内容正在完善中，当前以教材原文为准',
        },
        examCoreZone: {
          enabled: true,
          contentSource: 'adr_interaction', // 从不良反应/禁忌/相互作用中自动提炼
          placeholder: '本考点该模块内容正在完善中，当前以教材原文为准',
        },
        structureSkeleton: {
          enabled: true,
          template: 'single_drug',
          placeholder: '本考点该模块内容正在完善中，当前以教材原文为准',
          sections: [
            { title: '机制', description: '作用机制与药理特点' },
            { title: '适应证', description: '临床应用与适应证' },
            { title: '不良反应', description: '常见不良反应与注意事项' },
            { title: '禁忌', description: '禁忌证与慎用情况' },
            { title: '相互作用', description: '药物相互作用' },
          ],
        },
      }

    case 'drug_class':
      return {
        coreDrugCard: {
          enabled: true,
          template: 'drug_class', // 分类核心卡（不是单药）
          placeholder: '本考点该模块内容正在完善中，当前以教材原文为准',
        },
        examCoreZone: {
          enabled: true,
          contentSource: 'classification_comparison', // 分类混淆点 / 代表药对比
          placeholder: '本考点该模块内容正在完善中，当前以教材原文为准',
        },
        structureSkeleton: {
          enabled: true,
          template: 'drug_class',
          placeholder: '本考点该模块内容正在完善中，当前以教材原文为准',
          sections: [
            { title: '分类', description: '药物分类依据与标准' },
            { title: '代表药', description: '各类代表药物' },
            { title: '机制差异', description: '不同类别的作用机制差异' },
            { title: '应试对比', description: '考试中的对比要点' },
          ],
        },
      }

    case 'clinical_selection':
      return {
        coreDrugCard: {
          enabled: true,
          template: 'clinical_selection', // 用药决策卡
          placeholder: '本考点该模块内容正在完善中，当前以教材原文为准',
        },
        examCoreZone: {
          enabled: true,
          contentSource: 'clinical_selection', // 选错药 / 禁忌场景
          placeholder: '本考点该模块内容正在完善中，当前以教材原文为准',
        },
        structureSkeleton: {
          enabled: true,
          template: 'clinical_selection',
          placeholder: '本考点该模块内容正在完善中，当前以教材原文为准',
          sections: [
            { title: '疾病', description: '目标疾病与诊断标准' },
            { title: '一线', description: '一线治疗方案' },
            { title: '二线', description: '二线/替代方案' },
            { title: '禁忌', description: '禁忌场景与注意事项' },
          ],
        },
      }

    case 'adr_interaction':
      return {
        coreDrugCard: {
          enabled: true,
          template: 'adr_interaction', // 风险专题卡
          placeholder: '本考点该模块内容正在完善中，当前以教材原文为准',
        },
        examCoreZone: {
          enabled: true,
          contentSource: 'adr_interaction', // 必显示（高权重）
          placeholder: '本考点该模块内容正在完善中，当前以教材原文为准',
        },
        structureSkeleton: {
          enabled: true,
          template: 'adr_interaction',
          placeholder: '本考点该模块内容正在完善中，当前以教材原文为准',
          sections: [
            { title: '不良反应类型', description: '常见不良反应分类' },
            { title: '高危组合', description: '高风险药物组合' },
            { title: '人群', description: '特殊人群注意事项' },
          ],
        },
      }

    case 'mechanism_basic':
    default:
      return defaultConfig
  }
}

/**
 * 生成结构骨架占位内容
 */
export function generateStructurePlaceholder(sections: Array<{ title: string; description?: string }>): string {
  if (sections.length === 0) {
    return '本考点该模块内容正在完善中，当前以教材原文为准'
  }

  return sections
    .map((section, idx) => {
      const prefix = `${idx + 1}. ${section.title}`
      return section.description ? `${prefix}：${section.description}` : prefix
    })
    .join('\n')
}

/**
 * 检查模块是否有内容（用于决定是否显示占位符）
 */
export function hasModuleContent(
  moduleType: 'coreDrugCard' | 'examCoreZone' | 'structureSkeleton',
  config: ModuleRenderConfig,
  actualContent: any
): boolean {
  switch (moduleType) {
    case 'coreDrugCard':
      return actualContent && Array.isArray(actualContent) && actualContent.length > 0
    case 'examCoreZone':
      return (
        actualContent &&
        ((actualContent.high_frequency_patterns?.length > 0) ||
          (actualContent.common_traps?.length > 0))
      )
    case 'structureSkeleton':
      return actualContent && Array.isArray(actualContent) && actualContent.length > 0
    default:
      return false
  }
}

