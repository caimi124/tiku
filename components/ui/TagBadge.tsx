/**
 * TagBadge 组件
 * 
 * 显示考点优先级标签，支持5种标签类型：
 * - high_frequency (高频) - 红色
 * - must_test (必考) - 橙色
 * - easy_mistake (易错) - 黄色
 * - basic (基础) - 蓝色
 * - reinforce (强化) - 紫色
 * 
 * Requirements: 4.2, 4.3, 4.4, 4.5, 4.6
 */

import React from 'react'

export type TagType = 'high_frequency' | 'must_test' | 'easy_mistake' | 'basic' | 'reinforce'

export interface PointTag {
  type: TagType
  label: string
  color: string
}

export interface TagBadgeProps {
  tag: PointTag
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// 标签颜色映射 - 符合 Property 8 要求
export const TAG_COLORS: Record<TagType, { bg: string; text: string; border: string; hex: string }> = {
  high_frequency: { 
    bg: 'bg-red-100', 
    text: 'text-red-700', 
    border: 'border-red-200',
    hex: '#EF4444'
  },
  must_test: { 
    bg: 'bg-orange-100', 
    text: 'text-orange-700', 
    border: 'border-orange-200',
    hex: '#F97316'
  },
  easy_mistake: { 
    bg: 'bg-yellow-100', 
    text: 'text-yellow-700', 
    border: 'border-yellow-200',
    hex: '#EAB308'
  },
  basic: { 
    bg: 'bg-blue-100', 
    text: 'text-blue-700', 
    border: 'border-blue-200',
    hex: '#3B82F6'
  },
  reinforce: { 
    bg: 'bg-purple-100', 
    text: 'text-purple-700', 
    border: 'border-purple-200',
    hex: '#8B5CF6'
  },
}

// 标签定义
export const TAG_DEFINITIONS: Record<TagType, { label: string; definition: string }> = {
  high_frequency: { label: '高频', definition: '过去5年至少考3次' },
  must_test: { label: '必考', definition: '教材显性要求 + 历年多次命题' },
  easy_mistake: { label: '易错', definition: '学员反馈错误概率>40%' },
  basic: { label: '基础', definition: '概念、定义类基础知识' },
  reinforce: { label: '强化', definition: '适合图示、总结、思维导图强化' },
}

// 尺寸映射
const SIZE_CLASSES = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-0.5',
  lg: 'text-base px-2.5 py-1',
}

/**
 * 获取标签颜色
 * Property 8: 标签颜色映射正确性
 */
export function getTagColor(tagType: TagType): string {
  return TAG_COLORS[tagType]?.hex || '#6B7280'
}

/**
 * 获取标签样式类
 */
export function getTagClasses(tagType: TagType): { bg: string; text: string; border: string } {
  return TAG_COLORS[tagType] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
}

/**
 * TagBadge 组件
 */
export function TagBadge({ tag, size = 'md', className = '' }: TagBadgeProps) {
  const colors = getTagClasses(tag.type)
  const sizeClass = SIZE_CLASSES[size]
  
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium border
        ${colors.bg} ${colors.text} ${colors.border}
        ${sizeClass}
        ${className}
      `}
      title={TAG_DEFINITIONS[tag.type]?.definition}
    >
      {tag.label}
    </span>
  )
}

/**
 * 创建标签对象
 */
export function createTag(type: TagType): PointTag {
  const def = TAG_DEFINITIONS[type]
  const colors = TAG_COLORS[type]
  return {
    type,
    label: def?.label || type,
    color: colors?.hex || '#6B7280'
  }
}

/**
 * 多标签显示组件
 */
export interface TagListProps {
  tags: PointTag[]
  size?: 'sm' | 'md' | 'lg'
  maxDisplay?: number
  className?: string
}

export function TagList({ tags, size = 'md', maxDisplay, className = '' }: TagListProps) {
  const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags
  const remainingCount = maxDisplay && tags.length > maxDisplay ? tags.length - maxDisplay : 0
  
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayTags.map((tag, index) => (
        <TagBadge key={`${tag.type}-${index}`} tag={tag} size={size} />
      ))}
      {remainingCount > 0 && (
        <span className={`inline-flex items-center text-gray-500 ${SIZE_CLASSES[size]}`}>
          +{remainingCount}
        </span>
      )}
    </div>
  )
}

export default TagBadge
