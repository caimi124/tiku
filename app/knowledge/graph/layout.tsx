/**
 * 图谱视图布局
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '知识图谱视图',
  description: '以图形化方式展示执业药师知识点关系，直观了解药学知识体系结构。',
  keywords: ['知识图谱', '药学知识结构', '执业药师知识点关系'],
}

export default function GraphLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
