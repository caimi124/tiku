/**
 * GlobalSearch 组件
 * 
 * 全局搜索组件，包括：
 * - 搜索框UI
 * - 显示搜索历史和热门搜索
 * - 实时搜索建议
 * 
 * Requirements: 9.1, 9.2
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Clock, TrendingUp, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface SearchResult {
  id: string
  title: string
  path: string
  url: string
  type: 'chapter' | 'section' | 'point'
  highlight?: string
  relevance_score?: number
}

export interface GlobalSearchProps {
  onSearch?: (query: string) => void
  onResultClick?: (result: SearchResult) => void
  placeholder?: string
  className?: string
}

// 热门搜索（可从API获取）
const HOT_SEARCHES = [
  '质子泵抑制剂',
  '头孢菌素',
  '降压药',
  '糖尿病用药',
  '抗菌药物',
]

// 本地存储key
const SEARCH_HISTORY_KEY = 'knowledge_search_history'
const MAX_HISTORY_ITEMS = 10

/**
 * 获取搜索历史
 */
function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY)
    return history ? JSON.parse(history) : []
  } catch {
    return []
  }
}

/**
 * 保存搜索历史
 */
function saveSearchHistory(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return
  try {
    const history = getSearchHistory()
    const newHistory = [query, ...history.filter(h => h !== query)].slice(0, MAX_HISTORY_ITEMS)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
  } catch {
    // ignore
  }
}


/**
 * 清除搜索历史
 */
function clearSearchHistory(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  } catch {
    // ignore
  }
}

/**
 * GlobalSearch 组件
 */
export function GlobalSearch({ 
  onSearch, 
  onResultClick, 
  placeholder = '搜索知识点、药物、章节...',
  className = '' 
}: GlobalSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  // 加载搜索历史
  useEffect(() => {
    setHistory(getSearchHistory())
  }, [])
  
  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // 搜索防抖
  const searchDebounceRef = useRef<NodeJS.Timeout>()
  
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/knowledge/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (data.success) {
        const allResults: SearchResult[] = [
          ...(data.data.results.chapters || []).map((r: any) => ({ ...r, type: 'chapter' as const })),
          ...(data.data.results.sections || []).map((r: any) => ({ ...r, type: 'section' as const })),
          ...(data.data.results.points || []).map((r: any) => ({ ...r, type: 'point' as const })),
        ]
        setResults(allResults.slice(0, 10))
      }
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
    
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    
    searchDebounceRef.current = setTimeout(() => {
      performSearch(value)
    }, 300)
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      saveSearchHistory(query)
      setHistory(getSearchHistory())
      onSearch?.(query)
      setIsOpen(false)
    }
  }
  
  const handleResultClick = (result: SearchResult) => {
    saveSearchHistory(query)
    setHistory(getSearchHistory())
    onResultClick?.(result)
    router.push(result.url)
    setIsOpen(false)
    setQuery('')
  }
  
  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery)
    performSearch(historyQuery)
  }
  
  const handleClearHistory = () => {
    clearSearchHistory()
    setHistory([])
  }
  
  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = results.length > 0 ? results : (query ? [] : [...history, ...HOT_SEARCHES])
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, items.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        if (selectedIndex >= 0 && results.length > 0) {
          handleResultClick(results[selectedIndex])
        } else if (selectedIndex >= 0 && !query) {
          const item = items[selectedIndex]
          if (typeof item === 'string') {
            handleHistoryClick(item)
          }
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'chapter': return '章节'
      case 'section': return '小节'
      case 'point': return '考点'
      default: return ''
    }
  }
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'chapter': return 'bg-blue-100 text-blue-700'
      case 'section': return 'bg-green-100 text-green-700'
      case 'point': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }
  
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 搜索框 */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-100 border border-transparent rounded-lg
                       focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                       transition-all text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
      
      {/* 下拉面板 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
              搜索中...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors
                             ${selectedIndex === index ? 'bg-gray-50' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getTypeColor(result.type)}`}>
                      {getTypeLabel(result.type)}
                    </span>
                    <span className="font-medium text-gray-900 truncate">{result.title}</span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">{result.path}</div>
                  {result.highlight && (
                    <div className="text-xs text-gray-600 mt-1 line-clamp-1"
                         dangerouslySetInnerHTML={{ __html: result.highlight }} />
                  )}
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center text-gray-500">
              未找到相关内容
            </div>
          ) : (
            <>
              {/* 搜索历史 */}
              {history.length > 0 && (
                <div className="py-2 border-b border-gray-100">
                  <div className="px-4 py-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 搜索历史
                    </span>
                    <button
                      onClick={handleClearHistory}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      清除
                    </button>
                  </div>
                  {history.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(item)}
                      className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50
                                 ${selectedIndex === index ? 'bg-gray-50' : ''}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
              
              {/* 热门搜索 */}
              <div className="py-2">
                <div className="px-4 py-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> 热门搜索
                  </span>
                </div>
                <div className="px-4 py-2 flex flex-wrap gap-2">
                  {HOT_SEARCHES.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(item)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default GlobalSearch
