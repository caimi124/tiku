/**
 * ContentModule 组件（可折叠内容模块）
 * 
 * 用于考点详情页的内容模块展示：
 * - 支持折叠/展开
 * - 移动端默认折叠
 * - 按预定义顺序展示非空模块
 * 
 * Requirements: 8.3
 * Property 6: 详情页内容模块顺序
 * Property 7: 空模块跳过
 */

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface ContentModuleProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
  collapsible?: boolean
  className?: string
  id?: string
}

/**
 * ContentModule 组件
 */
export function ContentModule({ 
  title, 
  icon, 
  children, 
  defaultExpanded = true,
  collapsible = true,
  className = '',
  id
}: ContentModuleProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [isMobile, setIsMobile] = useState(false)
  
  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // 移动端默认折叠
  useEffect(() => {
    if (isMobile && collapsible) {
      setIsExpanded(false)
    }
  }, [isMobile, collapsible])
  
  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded)
    }
  }
  
  return (
    <div id={id} className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* 标题栏 */}
      <div 
        className={`
          flex items-center justify-between px-4 py-3 bg-gray-50
          ${collapsible ? 'cursor-pointer hover:bg-gray-100' : ''}
          transition-colors
        `}
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-500">{icon}</span>}
          <h3 className="text-base font-medium text-gray-900">{title}</h3>
        </div>
        
        {collapsible && (
          <button className="p-1 text-gray-400 hover:text-gray-600">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      
      {/* 内容区域 */}
      {isExpanded && (
        <div className="px-4 py-4 text-sm text-gray-700 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * 内容模块顺序定义
 * Property 6: 详情页内容模块顺序
 */
export const CONTENT_MODULE_ORDER = [
  'summary',
  'core_memory_points',
  'mechanism',
  'clinical_application',
  'adverse_reactions',
  'contraindications',
  'drug_interactions',
  'mnemonics',
  'mind_map',
] as const

export type ContentModuleType = typeof CONTENT_MODULE_ORDER[number]

/**
 * 模块配置
 */
export const MODULE_CONFIG: Record<ContentModuleType, { title: string; icon?: string }> = {
  summary: { title: '考点简介', icon: '📋' },
  core_memory_points: { title: '核心记忆点', icon: '🎯' },
  mechanism: { title: '作用机制', icon: '⚙️' },
  clinical_application: { title: '临床应用', icon: '💊' },
  adverse_reactions: { title: '不良反应', icon: '⚠️' },
  contraindications: { title: '禁忌', icon: '🚫' },
  drug_interactions: { title: '药物相互作用', icon: '🔄' },
  mnemonics: { title: '记忆口诀', icon: '💡' },
  mind_map: { title: '思维导图', icon: '🗺️' },
}

/**
 * 检查模块内容是否为空
 * Property 7: 空模块跳过
 */
export function isModuleEmpty(content: any): boolean {
  if (content === null || content === undefined) return true
  if (typeof content === 'string' && content.trim() === '') return true
  if (Array.isArray(content) && content.length === 0) return true
  return false
}

/**
 * 按顺序渲染非空模块
 * Property 6 & 7: 按顺序展示非空模块
 */
export interface ModuleData {
  summary?: string
  core_memory_points?: string[]
  mechanism?: string
  clinical_application?: string
  adverse_reactions?: any[]
  contraindications?: string
  drug_interactions?: string
  mnemonics?: string
  mind_map_url?: string
}

export interface ContentModuleListProps {
  data: ModuleData
  renderModule?: (type: ContentModuleType, content: any) => React.ReactNode
  collapsible?: boolean
  className?: string
}

export function ContentModuleList({ 
  data, 
  renderModule,
  collapsible = true,
  className = '' 
}: ContentModuleListProps) {
  // 按顺序过滤非空模块
  const modules = CONTENT_MODULE_ORDER.filter(type => {
    const key = type === 'mind_map' ? 'mind_map_url' : type
    return !isModuleEmpty(data[key as keyof ModuleData])
  })
  
  if (modules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无内容
      </div>
    )
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {modules.map((type, index) => {
        const config = MODULE_CONFIG[type]
        const key = type === 'mind_map' ? 'mind_map_url' : type
        const content = data[key as keyof ModuleData]
        
        return (
          <ContentModule
            key={type}
            id={`module-${type}`}
            title={config.title}
            icon={<span>{config.icon}</span>}
            defaultExpanded={index < 3} // 前3个默认展开
            collapsible={collapsible}
          >
            {renderModule ? (
              renderModule(type, content)
            ) : (
              <DefaultModuleContent type={type} content={content} />
            )}
          </ContentModule>
        )
      })}
    </div>
  )
}

/**
 * 默认模块内容渲染
 */
function DefaultModuleContent({ type, content }: { type: ContentModuleType; content: any }) {
  if (type === 'core_memory_points' && Array.isArray(content)) {
    return (
      <ul className="list-disc list-inside space-y-1">
        {content.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    )
  }
  
  if (type === 'adverse_reactions' && Array.isArray(content)) {
    return (
      <div className="space-y-2">
        {content.map((reaction, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className={`
              px-2 py-0.5 text-xs rounded
              ${reaction.severity === 'severe' ? 'bg-red-100 text-red-700' : 
                reaction.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-green-100 text-green-700'}
            `}>
              {reaction.severity === 'severe' ? '严重' : 
               reaction.severity === 'moderate' ? '中度' : '轻度'}
            </span>
            <span>{reaction.description || reaction}</span>
          </div>
        ))}
      </div>
    )
  }
  
  if (type === 'mind_map') {
    return (
      <div className="text-center">
        <img 
          src={content} 
          alt="思维导图" 
          className="max-w-full h-auto rounded-lg"
        />
      </div>
    )
  }
  
  if (type === 'mnemonics') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        <div className="font-medium mb-1">💡 记忆口诀</div>
        <div className="whitespace-pre-line">{content}</div>
      </div>
    )
  }
  
  // 默认文本渲染
  return (
    <div className="whitespace-pre-line">{content}</div>
  )
}

export default ContentModule
