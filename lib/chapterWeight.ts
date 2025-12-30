/**
 * 章节权重配置与UI辅助
 *
 * 兼容推荐系统与知识图谱，集中维护权重映射与文案展示。
 */

export const CHAPTER_WEIGHT: Record<number, number> = {
  9: 5, // 抗感染
  8: 5, // 内分泌
  5: 5, // 心血管
  4: 4, // 消化
  3: 4, // 呼吸
  2: 4, // 解热镇痛
  7: 4, // 泌尿
  1: 3, // 中枢神经
  6: 3, // 血液
  10: 3, // 抗肿瘤
  11: 2, // 水电解质/营养
  12: 2, // 眼科/耳鼻喉/口腔
  13: 2, // 皮肤/抗过敏
};

export type ChapterWeightLevel = 'core' | 'common' | 'auxiliary'

export interface ChapterWeightUI {
  levelKey: ChapterWeightLevel
  label: string
  stars: number
  starLabel: string
  shortHint: string
  badgeVariant: ChapterWeightLevel
}

interface GetChapterWeightOptions {
  fallback?: number
}

function parseChapterIdentifier(value?: number | string | null): number | null {
  if (value == null) return null

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null
    return Math.floor(value)
  }

  const normalized = String(value).trim()
  if (!normalized) return null

  const digitMatch = normalized.match(/\d+/)
  if (digitMatch) {
    const parsed = Number.parseInt(digitMatch[0], 10)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }

  const firstSegment = normalized.split(/[._\-\/]/)[0]
  const parsedSegment = Number.parseInt(firstSegment, 10)
  return Number.isNaN(parsedSegment) ? null : parsedSegment
}

export function getChapterWeight(
  chapterIdOrCode?: number | string | null,
  options: GetChapterWeightOptions = {},
) {
  const fallback = options.fallback ?? 3
  const chapterId = parseChapterIdentifier(chapterIdOrCode)
  if (chapterId && CHAPTER_WEIGHT[chapterId] !== undefined) {
    return CHAPTER_WEIGHT[chapterId]
  }
  return fallback
}

const STARS_LABELS: Record<number, string> = {
  5: '⭐⭐⭐⭐⭐',
  4: '⭐⭐⭐⭐',
  3: '⭐⭐⭐',
}

export function getChapterWeightUI(weight: number): ChapterWeightUI {
  if (weight >= 5) {
    return {
      levelKey: 'core',
      label: '核心章节',
      stars: 5,
      starLabel: STARS_LABELS[5],
      shortHint: '优先学习',
      badgeVariant: 'core',
    }
  }

  if (weight === 4) {
    return {
      levelKey: 'common',
      label: '常考章节',
      stars: 4,
      starLabel: STARS_LABELS[4],
      shortHint: '建议尽早掌握',
      badgeVariant: 'common',
    }
  }

  return {
    levelKey: 'auxiliary',
    label: '辅助章节',
    stars: 3,
    starLabel: STARS_LABELS[3],
    shortHint: '学完核心后补全',
    badgeVariant: 'auxiliary',
  }
}

export function parseChapterCode(value?: number | string | null): number | null {
  return parseChapterIdentifier(value)
}

