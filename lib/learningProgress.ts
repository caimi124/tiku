const STORAGE_KEY = 'local_learning_progress_v1'

export interface LearningProgressSnapshot {
  completedPoints: string[]
  completedChapters: Record<string, number>
}

interface LocalProgressRaw {
  completedPoints?: unknown
  completedChapters?: unknown
}

function createDefault(): LearningProgressSnapshot {
  return {
    completedPoints: [],
    completedChapters: {},
  }
}

function isClient() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function normalizeCompletedPoints(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return Array.from(
    new Set(
      input.filter((item): item is string => typeof item === 'string' && item.trim().length > 0),
    ),
  )
}

function normalizeCompletedChapters(input: unknown): Record<string, number> {
  if (typeof input !== 'object' || input === null) return {}

  const result: Record<string, number> = {}
  for (const [key, value] of Object.entries(input)) {
    if (typeof key === 'string' && typeof value === 'number' && Number.isFinite(value)) {
      result[key.trim().toUpperCase()] = value
    }
  }
  return result
}

function readSnapshot(): LearningProgressSnapshot {
  if (!isClient()) return createDefault()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefault()

    const parsed = JSON.parse(raw) as LocalProgressRaw
    return {
      completedPoints: normalizeCompletedPoints(parsed.completedPoints),
      completedChapters: normalizeCompletedChapters(parsed.completedChapters),
    }
  } catch (error) {
    console.warn('读取本地学习进度失败', error)
    return createDefault()
  }
}

function writeSnapshot(snapshot: LearningProgressSnapshot) {
  if (!isClient()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch (error) {
    console.warn('保存本地学习进度失败', error)
  }
}

function dispatchUpdateEvent() {
  if (!isClient()) return
  window.dispatchEvent(new Event('learning-progress-updated'))
}

export function markPointCompleted(pointId: string, chapterCode?: string) {
  if (!pointId) return false

  const snapshot = readSnapshot()
  if (snapshot.completedPoints.includes(pointId)) return false

  snapshot.completedPoints.push(pointId)

  if (chapterCode) {
    const normalizedCode = chapterCode.trim().toUpperCase()
    const current = snapshot.completedChapters[normalizedCode] ?? 0
    snapshot.completedChapters[normalizedCode] = current + 1
  }

  writeSnapshot(snapshot)
  dispatchUpdateEvent()
  return true
}

export function isPointCompleted(pointId: string) {
  if (!pointId) return false
  const snapshot = readSnapshot()
  return snapshot.completedPoints.includes(pointId)
}

export function getChapterCompletedCount(chapterCode?: string) {
  if (!chapterCode) return 0
  const snapshot = readSnapshot()
  const normalized = chapterCode.trim().toUpperCase()
  return snapshot.completedChapters[normalized] ?? 0
}

export function getCompletedPoints() {
  return readSnapshot().completedPoints
}

export async function migrateLocalProgressToServer() {
  if (!isClient()) return { syncedCount: 0 }
  const completedPoints = getCompletedPoints()
  if (!completedPoints.length) {
    return { syncedCount: 0 }
  }

  const response = await fetch('/api/user/progress/batch-sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify({ completedPoints }),
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.error || '同步失败')
  }

  clearLearningProgress()

  return {
    syncedCount: typeof data?.syncedCount === 'number' ? data.syncedCount : completedPoints.length,
  }
}

export function clearLearningProgress() {
  if (!isClient()) return
  window.localStorage.removeItem(STORAGE_KEY)
  dispatchUpdateEvent()
}

