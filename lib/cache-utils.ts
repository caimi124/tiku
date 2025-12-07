/**
 * 缓存工具
 * 
 * 提供简单的内存缓存和localStorage缓存功能
 * 用于减少重复API请求
 */

// 内存缓存
const memoryCache = new Map<string, { data: any; expiry: number }>()

// 默认缓存时间（5分钟）
const DEFAULT_TTL = 5 * 60 * 1000

/**
 * 设置内存缓存
 */
export function setMemoryCache(key: string, data: any, ttl: number = DEFAULT_TTL): void {
  memoryCache.set(key, {
    data,
    expiry: Date.now() + ttl
  })
}

/**
 * 获取内存缓存
 */
export function getMemoryCache<T>(key: string): T | null {
  const cached = memoryCache.get(key)
  if (!cached) return null
  
  if (Date.now() > cached.expiry) {
    memoryCache.delete(key)
    return null
  }
  
  return cached.data as T
}

/**
 * 清除内存缓存
 */
export function clearMemoryCache(key?: string): void {
  if (key) {
    memoryCache.delete(key)
  } else {
    memoryCache.clear()
  }
}

/**
 * 设置localStorage缓存
 */
export function setLocalCache(key: string, data: any, ttl: number = DEFAULT_TTL): void {
  if (typeof window === 'undefined') return
  
  try {
    const cacheData = {
      data,
      expiry: Date.now() + ttl
    }
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData))
  } catch (error) {
    console.warn('localStorage缓存设置失败:', error)
  }
}

/**
 * 获取localStorage缓存
 */
export function getLocalCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(`cache_${key}`)
    if (!cached) return null
    
    const { data, expiry } = JSON.parse(cached)
    
    if (Date.now() > expiry) {
      localStorage.removeItem(`cache_${key}`)
      return null
    }
    
    return data as T
  } catch (error) {
    console.warn('localStorage缓存读取失败:', error)
    return null
  }
}

/**
 * 清除localStorage缓存
 */
export function clearLocalCache(key?: string): void {
  if (typeof window === 'undefined') return
  
  try {
    if (key) {
      localStorage.removeItem(`cache_${key}`)
    } else {
      // 清除所有cache_开头的项
      const keys = Object.keys(localStorage).filter(k => k.startsWith('cache_'))
      keys.forEach(k => localStorage.removeItem(k))
    }
  } catch (error) {
    console.warn('localStorage缓存清除失败:', error)
  }
}

/**
 * 带缓存的fetch请求
 */
export async function cachedFetch<T>(
  url: string,
  options?: {
    ttl?: number
    useLocalStorage?: boolean
    forceRefresh?: boolean
  }
): Promise<T> {
  const { ttl = DEFAULT_TTL, useLocalStorage = false, forceRefresh = false } = options || {}
  const cacheKey = url
  
  // 检查缓存
  if (!forceRefresh) {
    const cached = useLocalStorage 
      ? getLocalCache<T>(cacheKey) 
      : getMemoryCache<T>(cacheKey)
    
    if (cached) {
      return cached
    }
  }
  
  // 发起请求
  const response = await fetch(url)
  const data = await response.json()
  
  // 存入缓存
  if (useLocalStorage) {
    setLocalCache(cacheKey, data, ttl)
  } else {
    setMemoryCache(cacheKey, data, ttl)
  }
  
  return data as T
}

/**
 * 缓存键生成器
 */
export const CacheKeys = {
  chapters: (subject: string) => `chapters_${subject}`,
  chapter: (chapterId: string) => `chapter_${chapterId}`,
  section: (sectionId: string) => `section_${sectionId}`,
  point: (pointId: string) => `point_${pointId}`,
  knowledgeTree: (subject: string) => `knowledge_tree_${subject}`,
  search: (query: string, subject: string) => `search_${subject}_${query}`,
}
