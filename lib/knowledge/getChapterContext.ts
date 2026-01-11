export type ChapterContextInput = {
  id: string
  title?: string | null
  chapter?: { title?: string | null; code?: string | null } | null
  section?: { title?: string | null; code?: string | null } | null
  breadcrumb?: Array<{ title?: string | null; code?: string | null }> | null
}

export type ChapterContext = {
  breadcrumbText: string
  chapterLabel?: string
  sectionLabel?: string
  nodeTitle: string
  nodeId: string
}

export function getChapterContext(input: ChapterContextInput): ChapterContext {
  const nodeId = input.id
  const nodeTitle = input.title?.trim() || '未命名节点'

  const chapterLabel = input.chapter?.title?.trim() || input.chapter?.code?.trim()
  const sectionLabel = input.section?.title?.trim() || input.section?.code?.trim()

  const segments: string[] = []

  if (input.breadcrumb && Array.isArray(input.breadcrumb) && input.breadcrumb.length > 0) {
    input.breadcrumb.forEach(item => {
      const label = item?.title?.trim() || item?.code?.trim()
      if (label) {
        segments.push(label)
      }
    })
  } else {
    if (chapterLabel) {
      segments.push(`章「${chapterLabel}」`)
    }
    if (sectionLabel) {
      segments.push(`小节「${sectionLabel}」`)
    }
  }

  segments.push(`条目「${nodeTitle}」`)

  return {
    breadcrumbText: segments.filter(Boolean).join(' · '),
    chapterLabel: chapterLabel || undefined,
    sectionLabel: sectionLabel || undefined,
    nodeTitle,
    nodeId,
  }
}

