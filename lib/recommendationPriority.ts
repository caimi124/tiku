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

export const POINT_TYPE_WEIGHT: Record<string, number> = {
  mechanism: 5, // 分类&作用机制
  clinical_use: 5, // 作用特点&临床应用
  adverse_reaction: 4, // 不良反应
  contraindication: 4, // 禁忌
  interaction: 2, // 相互作用
  dosage: 1, // 剂量/用药注意
};

export function getChapterWeight(chapterId?: number | null) {
  if (!chapterId) return 1;
  return CHAPTER_WEIGHT[chapterId] ?? 1;
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

