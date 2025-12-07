/**
 * 知识图谱布局
 * 
 * 为知识图谱相关页面提供统一的元数据和布局
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | 知识图谱 - 医药考试通',
    default: '知识图谱 - 医药考试通',
  },
  description: '执业药师知识图谱，系统化学习药学专业知识，掌握高频考点，提升备考效率。',
  keywords: ['执业药师知识点', '药学知识图谱', '西药二知识点', '药理学考点', '执业药师备考'],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    title: '知识图谱 - 医药考试通',
    description: '系统化学习药学专业知识，掌握高频考点',
    siteName: '医药考试通',
  },
}

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
