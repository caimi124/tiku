/**
 * SearchEnhanced 组件
 * 
 * 增强搜索组件，支持拼音搜索和分类显示
 * 
 * 功能：
 * - 支持拼音模糊搜索
 * - 支持考点别名/关联词搜索
 * - 分类显示结果：考点、小节、章节
 * - 高亮匹配关键词
 * 
 * Requirements: 5.1, 5.2, 14.1, 14.2, 14.3, 14.6
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, X, Loader2, BookOpen, FileText, 
  Lightbulb, ChevronRight, History, ArrowRight
} from 'lucide-react'

// 搜索结果类型
export type SearchResultType = 'chapter' | 'section' | 'point'

// 搜索结果项
export interface SearchResultItem {
  id: string
  title: string
  path: string
  url: string
  type: SearchResultType
  matchedText?: string
  importance?: number
  isHighFrequency?: boolean
}

// 分类后的搜索结果
export interface CategorizedResults {
  chapters: SearchResultItem[]
  sections: SearchResultItem[]
  points: SearchResultItem[]
}

export interface SearchEnhancedProps {
  subject?: string
  placeholder?: string
  onResultClick?: (result: SearchResultItem) => void
  onExpandSection?: (sectionId: string) => void
  onExpandChapter?: (chapterId: string) => void
  className?: string
  autoFocus?: boolean
}

// 搜索历史最大条数
const MAX_HISTORY = 5

/**
 * 高亮匹配文本
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

/**
 * 获取结果类型图标
 */
function getTypeIcon(type: SearchResultType) {
  switch (type) {
    case 'chapter':
      return <BookOpen className="w-4 h-4 text-blue-500" />
    case 'section':
      return <FileText className="w-4 h-4 text-purple-500" />
    case 'point':
      return <Lightbulb className="w-4 h-4 text-green-500" />
  }
}

/**
 * 获取结果类型标签
 */
function getTypeLabel(type: SearchResultType): string {
  switch (type) {
    case 'chapter': return '章节'
    case 'section': return '小节'
    case 'point': return '考点'
  }
}

/**
 * 获取结果类型颜色
 */
function getTypeColor(type: SearchResultType): string {
  switch (type) {
    case 'chapter': return 'bg-blue-100 text-blue-700'
    case 'section': return 'bg-purple-100 text-purple-700'
    case 'point': return 'bg-green-100 text-green-700'
  }
}

export function SearchEnhanced({
  subject = 'xiyao_yaoxue_er',
  placeholder = '搜索知识点、药物名称...',
  onResultClick,
  onExpandSection,
  onExpandChapter,
  className = '',
  autoFocus = false
}: SearchEnhancedProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<CategorizedResults>({
    chapters: [],
    sections: [],
    points: []
  })
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  // 加载搜索历史
  useEffect(() => {
    const history = localStorage.getItem('search_history')
    if (history) {
      try {
        setSearchHistory(JSON.parse(history))
      } catch (e) {
        // ignore
      }
    }
  }, [])
  
  // 保存搜索历史
  const saveToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    const newHistory = [
      searchQuery,
      ...searchHistory.filter(h => h !== searchQuery)
    ].slice(0, MAX_HISTORY)
    
    setSearchHistory(newHistory)
    localStorage.setItem('search_history', JSON.stringify(newHistory))
  }, [searchHistory])
  
  // 搜索API调用
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ chapters: [], sections: [], points: [] })
      return
    }
    
    setIsLoading(true)
    try {
      const res = await fetch(
        `/api/knowledge/search?q=${encodeURIComponent(searchQuery)}&subject=${subject}`
      )
      const data = await res.json()
      
      if (data.success) {
        setResults({
          chapters: data.data.results.chapters || [],
          sections: data.data.results.sections || [],
          points: data.data.results.points || []
        })
      }
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [subject])
  
  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [query, performSearch])
  
  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // 获取所有结果的扁平列表
  const allResults = [
    ...results.chapters,
    ...results.sections,
    ...results.points
  ]
  
  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < allResults.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && allResults[selectedIndex]) {
          handleResultClick(allResults[selectedIndex])
        } else if (query.trim()) {
          saveToHistory(query)
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }
  
  // 处理结果点击
  const handleResultClick = (result: SearchResultItem) => {
    saveToHistory(query)
    setIsOpen(false)
    setQuery('')
    
    if (onResultClick) {
      onResultClick(result)
      return
    }
    
    // 默认行为
    switch (result.type) {
      case 'point':
        router.push(result.url)
        break
      case 'section':
        if (onExpandSection) {
          onExpandSection(result.id)
        } else {
          router.push(`/knowledge#section-${result.id}`)
        }
        break
      case 'chapter':
        if (onExpandChapter) {
          onExpandChapter(result.id)
        } else {
          router.push(`/knowledge#chapter-${result.id}`)
        }
        break
    }
  }
  
  // 处理历史点击
  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery)
    performSearch(historyQuery)
  }
  
  // 清除历史
  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('search_history')
  }
  
  const hasResults = allResults.length > 0
  const showDropdown = isOpen && (hasResults || searchHistory.length > 0 || isLoading)
  
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults({ chapters: [], sections: [], points: [] })
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
        )}
      </div>
      
      {/* 搜索结果下拉 */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg 
                        border border-gray-200 max-h-[70vh] overflow-y-auto z-50">
          {/* 搜索中 */}
          {isLoading && !hasResults && (
            <div className="px-4 py-6 text-center text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              搜索中...
            </div>
          )}
          
          {/* 搜索结果 */}
          {hasResults && (
            <div className="py-2">
              {/* 章节结果 */}
              {results.chapters.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-xs font-medium text-gray-500 bg-gray-50">
                    章节 ({results.chapters.length})
                  </div>
                  {results.chapters.map((result, index) => (
                    <SearchResultRow
                      key={`chapter-${result.id}`}
                      result={result}
                      query={query}
                      isSelected={selectedIndex === index}
                      onClick={() => handleResultClick(result)}
                    />
                  ))}
                </div>
              )}
              
              {/* 小节结果 */}
              {results.sections.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-xs font-medium text-gray-500 bg-gray-50">
                    小节 ({results.sections.length})
                  </div>
                  {results.sections.map((result, index) => (
                    <SearchResultRow
                      key={`section-${result.id}`}
                      result={result}
                      query={query}
                      isSelected={selectedIndex === results.chapters.length + index}
                      onClick={() => handleResultClick(result)}
                    />
                  ))}
                </div>
              )}
              
              {/* 考点结果 */}
              {results.points.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-xs font-medium text-gray-500 bg-gray-50">
                    考点 ({results.points.length})
                  </div>
                  {results.points.map((result, index) => (
                    <SearchResultRow
                      key={`point-${result.id}`}
                      result={result}
                      query={query}
                      isSelected={selectedIndex === results.chapters.length + results.sections.length + index}
                      onClick={() => handleResultClick(result)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* 无结果 */}
          {!isLoading && query && !hasResults && (
            <div className="px-4 py-6 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>未找到相关结果</p>
              <p className="text-sm mt-1">试试其他关键词或拼音搜索</p>
            </div>
          )}
          
          {/* 搜索历史 */}
          {!query && searchHistory.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">搜索历史</span>
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  清除
                </button>
              </div>
              {searchHistory.map((historyItem, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(historyItem)}
                  className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 text-left"
                >
                  <History className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{historyItem}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 搜索结果行组件
 */
function SearchResultRow({
  result,
  query,
  isSelected,
  onClick
}: {
  result: SearchResultItem
  query: string
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full px-4 py-2.5 flex items-start gap-3 text-left transition-colors
        ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
      `}
    >
      {/* 类型图标 */}
      <div className="flex-shrink-0 mt-0.5">
        {getTypeIcon(result.type)}
      </div>
      
      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-1.5 py-0.5 rounded ${getTypeColor(result.type)}`}>
            {getTypeLabel(result.type)}
          </span>
          {result.isHighFrequency && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600">
              高频
            </span>
          )}
        </div>
        <div className="font-medium text-gray-800 mt-1 line-clamp-1">
          {highlightMatch(result.title, query)}
        </div>
        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
          {result.path}
        </div>
      </div>
      
      {/* 箭头 */}
      <div className="flex-shrink-0">
        <ArrowRight className="w-4 h-4 text-gray-300" />
      </div>
    </button>
  )
}

export default SearchEnhanced
