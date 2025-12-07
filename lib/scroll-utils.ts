/**
 * 滚动工具函数
 * 
 * 用于实现考点梳理中点击标题平滑滚动到对应卡片的功能
 * 
 * Requirements: 6.6
 */

/**
 * 平滑滚动到指定元素
 */
export function scrollToElement(elementId: string, options?: {
  behavior?: ScrollBehavior
  block?: ScrollLogicalPosition
  offset?: number
}): void {
  const element = document.getElementById(elementId)
  if (!element) return
  
  const { behavior = 'smooth', block = 'center', offset = 0 } = options || {}
  
  if (offset !== 0) {
    // 使用 offset 时需要手动计算位置
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset
    
    window.scrollTo({
      top: offsetPosition,
      behavior
    })
  } else {
    element.scrollIntoView({
      behavior,
      block
    })
  }
}

/**
 * 滚动到考点卡片
 */
export function scrollToPointCard(pointId: string): void {
  scrollToElement(`point-card-${pointId}`, {
    behavior: 'smooth',
    block: 'center'
  })
}

/**
 * 滚动到内容模块
 */
export function scrollToModule(moduleType: string): void {
  scrollToElement(`module-${moduleType}`, {
    behavior: 'smooth',
    block: 'start',
    offset: 80 // 考虑固定导航栏高度
  })
}

/**
 * 高亮元素（临时添加高亮效果）
 */
export function highlightElement(elementId: string, duration: number = 2000): void {
  const element = document.getElementById(elementId)
  if (!element) return
  
  // 添加高亮类
  element.classList.add('highlight-flash')
  
  // 移除高亮类
  setTimeout(() => {
    element.classList.remove('highlight-flash')
  }, duration)
}

/**
 * 滚动并高亮
 */
export function scrollAndHighlight(elementId: string): void {
  scrollToElement(elementId, { behavior: 'smooth', block: 'center' })
  
  // 延迟添加高亮，等待滚动完成
  setTimeout(() => {
    highlightElement(elementId)
  }, 500)
}

/**
 * 检查元素是否在视口中
 */
export function isElementInViewport(elementId: string): boolean {
  const element = document.getElementById(elementId)
  if (!element) return false
  
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * 获取当前可见的考点ID
 */
export function getVisiblePointId(pointIds: string[]): string | null {
  for (const id of pointIds) {
    if (isElementInViewport(`point-card-${id}`)) {
      return id
    }
  }
  return null
}
