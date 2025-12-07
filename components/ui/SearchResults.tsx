/**
 * SearchResults 组件
 * 
 * 搜索结果展示组件：
 * - 分类展示结果（章节、小节、考点）
 * - 显示完整路径
 * - 高亮匹配关键词
 * 
 * Requirements: 9.6, 9.7, 9.8
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { BookOpen, FileText, Target, ChevronRight, Search } from 'lucide-react'

export interface SearchResult {
  id: string
  title: string
  path: string
  url: string
  type: 'chapter' | 'section' | 'point'
  highlight?: string
  relevance_score?: number
}

export interface SearchResultsData {
  chapters: SearchResult[]
  sections: SearchResult[]
  points: SearchResult[]
}

export interface SearchResultsProps {
  query: string
  results: SearchResultsData
  onResultClick?: (result: SearchResult) => void
  isLoading?: boolean
  className?: string
}

/**
 * 高亮匹配关键词
 */
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
        {part}
      </mark>
    ) : part
  )
}

/**
 * 结果类型图标
 */
function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'chapter':
      return <BookOpen className="w-4 h-4" />
    case 'section':
      return <FileText className="w-4 h-4" />
    case 'point':
      return <Target className="w-4 h-4" />
    default:
      return <Search className="w-4 h-4" />
  }
}

/**
 * 结果类型样式
 */
const TYPE_STYLES = {
  chapter: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    label: '章节',
    labelBg: 'bg-blue-100 text-blue-700',
  },
  section: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    label: '小节',
    labelBg: 'bg-green-100 text-green-700',
  },
  point: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    label: '考点',
    labelBg: 'bg-purple-100 text-purple-700',
  },
}

/**
 * 单个搜索结果项
 */
interface ResultItemProps {
  result: SearchResult
  query: string
  onClick?: () => void
}

function ResultItem({ result, query, onClick }: ResultItemProps) {
  const style = TYPE_STYLES[result.type] || TYPE_STYLES.point
  
  return (
    <Link
      href={result.url}
      onClick={onClick}
      className={`block p-4 rounded-lg border ${style.border} ${style.bg} hover:shadow-md transition-all`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-white ${style.icon}`}>
          <TypeIcon type={result.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-1.5 py-0.5 rounded ${style.labelBg}`}>
              {style.label}
            </span>
            <h4 className="font-medium text-gray-900 truncate">
              {highlightText(result.title, query)}
            </h4>
          </div>
          <p className="text-sm text-gray-500 truncate">{result.path}</p>
          {result.highlight && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2"
               dangerouslySetInnerHTML={{ __html: result.highlight }} />
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </Link>
  )
}

/**
 * 结果分组
 */
interface ResultGroupProps {
  title: string
  icon: React.ReactNode
  results: SearchResult[]
  query: string
  onResultClick?: (result: SearchResult) => void
}

function ResultGroup({ title, icon, results, query, onResultClick }: ResultGroupProps) {
  if (results.length === 0) return null
  
  return (
    <div className="mb-6">
      <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
        {icon}
        {title}
        <span className="text-gray-400">({results.length})</span>
      </h3>
      <div className="space-y-3">
        {results.map(result => (
          <ResultItem
            key={result.id}
            result={result}
            query={query}
            onClick={() => onResultClick?.(result)}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * 无结果提示
 */
interface NoResultsProps {
  query: string
  suggestions?: string[]
}

function NoResults({ query, suggestions }: NoResultsProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        未找到相关内容
      </h3>
      <p className="text-gray-500 mb-4">
        没有找到与 "{query}" 相关的结果
      </p>
      {suggestions && suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">您是否在找：</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * SearchResults 组件
 */
export function SearchResults({ 
  query, 
  results, 
  onResultClick,
  isLoading = false,
  className = '' 
}: SearchResultsProps) {
  const totalCount = results.chapters.length + results.sections.length + results.points.length
  
  if (isLoading) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">搜索中...</p>
      </div>
    )
  }
  
  if (totalCount === 0) {
    return <NoResults query={query} />
  }
  
  return (
    <div className={className}>
      {/* 结果统计 */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          找到 <span className="font-medium text-gray-900">{totalCount}</span> 个相关结果
        </p>
      </div>
      
      {/* 章节结果 */}
      <ResultGroup
        title="章节"
        icon={<BookOpen className="w-4 h-4 text-blue-600" />}
        results={results.chapters}
        query={query}
        onResultClick={onResultClick}
      />
      
      {/* 小节结果 */}
      <ResultGroup
        title="小节"
        icon={<FileText className="w-4 h-4 text-green-600" />}
        results={results.sections}
        query={query}
        onResultClick={onResultClick}
      />
      
      {/* 考点结果 */}
      <ResultGroup
        title="考点"
        icon={<Target className="w-4 h-4 text-purple-600" />}
        results={results.points}
        query={query}
        onResultClick={onResultClick}
      />
    </div>
  )
}

export default SearchResults
