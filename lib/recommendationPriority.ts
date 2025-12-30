import {
  CHAPTER_WEIGHT as SHARED_CHAPTER_WEIGHT,
  getChapterWeight as resolveChapterWeight,
} from '@/lib/chapterWeight';

export const CHAPTER_WEIGHT = SHARED_CHAPTER_WEIGHT;

export const POINT_TYPE_WEIGHT: Record<string, number> = {
  mechanism: 5, // 分类&作用机制
  clinical_use: 5, // 作用特点&临床应用
  adverse_reaction: 4, // 不良反应
  contraindication: 4, // 禁忌
  interaction: 2, // 相互作用
  dosage: 1, // 剂量/用药注意
};

export function getChapterWeight(chapterId?: number | null) {
  return resolveChapterWeight(chapterId, { fallback: 1 });
}

export function getPointTypeWeight(pointType?: string | null) {
  if (!pointType) return 1;
  return POINT_TYPE_WEIGHT[pointType] ?? 1;
}

export function calculateRecommendationPriority(
  baseWeaknessScore: number,
  chapterId?: number | null,
  pointType?: string | null,
) {
  const chapterWeight = getChapterWeight(chapterId);
  const pointTypeWeight = getPointTypeWeight(pointType);
  let priority = baseWeaknessScore * chapterWeight * pointTypeWeight;

  if (!Number.isFinite(priority) || priority <= 0) {
    priority = baseWeaknessScore;
  }

  return {
    priority,
    chapterWeight,
    pointTypeWeight,
  };
}

