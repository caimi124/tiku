/**
 * 小节页面 - 重定向到首页
 * 
 * 由于页面层级优化，小节页面功能已合并到首页手风琴布局
 * 此页面保留用于兼容旧链接，自动重定向到首页并展开对应小节
 * 
 * Requirements: 1.1 (页面层级优化)
 */

'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function SectionPage() {
  const router = useRouter()
  const params = useParams()
  const sectionId = params.sectionId as string

  useEffect(() => {
    // 重定向到首页并通过锚点展开对应小节
    router.replace(`/knowledge#section-${sectionId}`)
  }, [sectionId, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在跳转...</p>
      </div>
    </div>
  )
}
