/**
 * Breadcrumb 组件
 * 
 * 显示完整路径导航，支持：
 * - 显示完整路径：首页 > 知识库 > 第X章 > 第X节 > 考点X
 * - 点击跳转到对应页面
 * - 移动端折叠模式
 * 
 * Requirements: 5.1, 5.2, 5.3, 8.4
 */

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Home, ChevronDown } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  url: string
  type: 'home' | 'knowledge' | 'chapter' | 'section' | 'point'
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  mobile?: boolean
  className?: string
}

/**
 * 生成面包屑项的URL
 */
export function generateBreadcrumbUrl(type: BreadcrumbItem['type'], id?: string, parentIds?: { chapterId?: string }): string {
  switch (type) {
    case 'home':
      return '/'
    case 'knowledge':
      return '/knowledge'
    case 'chapter':
      return `/knowledge/chapter/${id}`
    case 'section':
      return `/knowledge/chapter/${parentIds?.chapterId}/section/${id}`
    case 'point':
      return `/knowledge/point/${id}`
    default:
      return '/knowledge'
  }
}

/**
 * 桌面端面包屑
 */
function DesktopBreadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="面包屑导航" className={`flex items-center text-sm ${className}`}>
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
            )}
            {index === items.length - 1 ? (
              // 当前页面（不可点击）
              <span className="text-gray-900 font-medium truncate max-w-[200px]" title={item.label}>
                {item.type === 'home' && <Home className="w-4 h-4 inline mr-1" />}
                {item.label}
              </span>
            ) : (
              // 可点击的链接
              <Link
                href={item.url}
                className="text-gray-500 hover:text-blue-600 transition-colors truncate max-w-[150px]"
                title={item.label}
              >
                {item.type === 'home' && <Home className="w-4 h-4 inline mr-1" />}
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/**
 * 移动端折叠面包屑
 */
function MobileBreadcrumb({ items, className = '' }: BreadcrumbProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  if (items.length <= 2) {
    return <DesktopBreadcrumb items={items} className={className} />
  }
  
  const currentItem = items[items.length - 1]
  const parentItems = items.slice(0, -1)
  
  return (
    <nav aria-label="面包屑导航" className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
      >
        <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        <span className="truncate max-w-[200px]">{currentItem.label}</span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[200px]">
          {parentItems.map((item, index) => (
            <Link
              key={index}
              href={item.url}
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center">
                {item.type === 'home' && <Home className="w-4 h-4 mr-2" />}
                {'→'.repeat(index)} {item.label}
              </span>
            </Link>
          ))}
          <div className="border-t border-gray-100 mt-1 pt-1">
            <span className="block px-4 py-2 text-sm text-gray-900 font-medium">
              {currentItem.label}
            </span>
          </div>
        </div>
      )}
    </nav>
  )
}

/**
 * Breadcrumb 主组件
 * Property 10: 面包屑路径完整性
 */
export function Breadcrumb({ items, mobile = false, className = '' }: BreadcrumbProps) {
  // 确保首页始终在最前面
  const fullItems: BreadcrumbItem[] = items[0]?.type !== 'home' 
    ? [{ label: '首页', url: '/', type: 'home' }, ...items]
    : items
  
  if (mobile) {
    return <MobileBreadcrumb items={fullItems} className={className} />
  }
  
  return <DesktopBreadcrumb items={fullItems} className={className} />
}

/**
 * 从知识点数据构建面包屑
 */
export function buildBreadcrumbFromPoint(
  chapter?: { id: string; title: string; code: string } | null,
  section?: { id: string; title: string; code: string } | null,
  point?: { id: string; title: string } | null
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: '首页', url: '/', type: 'home' },
    { label: '知识库', url: '/knowledge', type: 'knowledge' },
  ]
  
  if (chapter) {
    items.push({
      label: chapter.title,
      url: `/knowledge/chapter/${chapter.id}`,
      type: 'chapter'
    })
  }
  
  if (section && chapter) {
    items.push({
      label: section.title,
      url: `/knowledge/chapter/${chapter.id}/section/${section.id}`,
      type: 'section'
    })
  }
  
  if (point) {
    items.push({
      label: point.title,
      url: `/knowledge/point/${point.id}`,
      type: 'point'
    })
  }
  
  return items
}

export default Breadcrumb
