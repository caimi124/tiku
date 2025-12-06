/**
 * ContentTypeCard 工具函数
 * 用于考点内容类型的分类和配置
 * 
 * Requirements: 3.1, 1.5
 */

export type ContentType = 
  | 'mechanism'        // 作用机制
  | 'pharmacokinetics' // 药动学
  | 'adverse'          // 不良反应
  | 'clinical'         // 临床应用
  | 'interaction'      // 相互作用
  | 'memory'           // 记忆口诀

export interface ContentTypeConfig {
  type: ContentType
  label: string
  icon: string
  bgColor: string
  textColor: string
  borderColor: string
}

// 内容类型配置
export const CONTENT_TYPE_CONFIG: Record<ContentType, ContentTypeConfig> = {
  mechanism: {
    type: 'mechanism',
    label: '作用机制',
    icon: '⚙️',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200'
  },
  pharmacokinetics: {
    type: 'pharmacokinetics',
    label: '药动学',
    icon: '📊',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200'
  },
  adverse: {
    type: 'adverse',
    label: '不良反应',
    icon: '⚠️',
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200'
  },
  clinical: {
    type: 'clinical',
    label: '临床应用',
    icon: '💊',
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-200'
  },
  interaction: {
    type: 'interaction',
    label: '相互作用',
    icon: '🔄',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200'
  },
  memory: {
    type: 'memory',
    label: '记忆口诀',
    icon: '💡',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200'
  }
}

// 所有有效的内容类型
export const ALL_CONTENT_TYPES: ContentType[] = [
  'mechanism',
  'pharmacokinetics',
  'adverse',
  'clinical',
  'interaction',
  'memory'
]

/**
 * 获取内容类型配置
 */
export function getContentTypeConfig(type: ContentType): ContentTypeConfig {
  return CONTENT_TYPE_CONFIG[type]
}

/**
 * 验证内容类型是否有效
 */
export function isValidContentType(type: string): type is ContentType {
  return ALL_CONTENT_TYPES.includes(type as ContentType)
}

/**
 * 获取内容类型标签
 */
export function getContentTypeLabel(type: ContentType): string {
  return CONTENT_TYPE_CONFIG[type].label
}

/**
 * 获取内容类型图标
 */
export function getContentTypeIcon(type: ContentType): string {
  return CONTENT_TYPE_CONFIG[type].icon
}

/**
 * 考点内容数据结构
 */
export interface KnowledgeContent {
  mechanism?: string[]
  pharmacokinetics?: string[]
  adverseReactions?: { content: string; severity: 'severe' | 'moderate' | 'mild' }[]
  clinicalApplications?: string[]
  interactions?: string[]
  memoryTips?: string
}

/**
 * 将考点内容分类到各个类型
 */
export function categorizeContent(content: KnowledgeContent): { type: ContentType; items: string[] }[] {
  const result: { type: ContentType; items: string[] }[] = []

  if (content.mechanism && content.mechanism.length > 0) {
    result.push({ type: 'mechanism', items: content.mechanism })
  }

  if (content.pharmacokinetics && content.pharmacokinetics.length > 0) {
    result.push({ type: 'pharmacokinetics', items: content.pharmacokinetics })
  }

  if (content.adverseReactions && content.adverseReactions.length > 0) {
    result.push({ type: 'adverse', items: content.adverseReactions.map(r => r.content) })
  }

  if (content.clinicalApplications && content.clinicalApplications.length > 0) {
    result.push({ type: 'clinical', items: content.clinicalApplications })
  }

  if (content.interactions && content.interactions.length > 0) {
    result.push({ type: 'interaction', items: content.interactions })
  }

  if (content.memoryTips) {
    result.push({ type: 'memory', items: [content.memoryTips] })
  }

  return result
}

/**
 * 检查内容是否包含指定类型
 */
export function hasContentType(content: KnowledgeContent, type: ContentType): boolean {
  switch (type) {
    case 'mechanism':
      return !!(content.mechanism && content.mechanism.length > 0)
    case 'pharmacokinetics':
      return !!(content.pharmacokinetics && content.pharmacokinetics.length > 0)
    case 'adverse':
      return !!(content.adverseReactions && content.adverseReactions.length > 0)
    case 'clinical':
      return !!(content.clinicalApplications && content.clinicalApplications.length > 0)
    case 'interaction':
      return !!(content.interactions && content.interactions.length > 0)
    case 'memory':
      return !!content.memoryTips
    default:
      return false
  }
}

/**
 * 获取内容中包含的所有类型
 */
export function getContentTypes(content: KnowledgeContent): ContentType[] {
  return ALL_CONTENT_TYPES.filter(type => hasContentType(content, type))
}
