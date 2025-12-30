export const CHAPTER_NAME_MAP: Record<number, string> = {
  1: "第1章·中枢神经系统疾病用药",
  2: "第2章·解热镇痛与抗炎用药",
  3: "第3章·呼吸系统疾病用药",
  4: "第4章·消化系统疾病用药",
  5: "第5章·心血管系统疾病用药",
  6: "第6章·血液系统疾病用药",
  7: "第7章·泌尿系统疾病用药",
  8: "第8章·内分泌与代谢疾病用药",
  9: "第9章·抗感染",
  10: "第10章·抗肿瘤",
  11: "第11章·水电解质与营养",
  12: "第12章·眼耳鼻喉与口腔",
  13: "第13章·皮肤与抗过敏",
};

export function getChapterDisplayName(
  chapterId?: number | null,
  fallbackLabel?: string | null,
): string {
  if (chapterId && CHAPTER_NAME_MAP[chapterId]) {
    return CHAPTER_NAME_MAP[chapterId];
  }
  if (fallbackLabel && fallbackLabel.trim()) {
    return fallbackLabel.trim();
  }
  if (chapterId) {
    return `第${chapterId}章`;
  }
  return "待定位章节";
}
