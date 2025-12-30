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
export const CHAPTER_NAME_MAP: Record<number, string> = {
  1: " 绗?绔犅蜂腑鏋㈢缁忕郴缁熺柧鐥呯敤鑽痋,
 2: \绗?绔犅疯В鐑晣鐥涗笌鎶楃値鐢ㄨ嵂\,
 3: \绗?绔犅峰懠鍚哥郴缁熺柧鐥呯敤鑽痋,
 4: \绗?绔犅锋秷鍖栫郴缁熺柧鐥呯敤鑽痋,
 5: \绗?绔犅峰績琛€绠＄郴缁熺柧鐥呯敤鑽痋,
 6: \绗?绔犅疯娑茬郴缁熺柧鐥呯敤鑽痋,
 7: \绗?绔犅锋硨灏跨郴缁熺柧鐥呯敤鑽痋,
 8: \绗?绔犅峰唴鍒嗘硨涓庝唬璋㈢柧鐥呯敤鑽痋,
 9: \绗?绔犅锋姉鎰熸煋\,
 10: \绗?0绔犅锋姉鑲跨槫\,
 11: \绗?1绔犅锋按鐢佃В璐ㄤ笌钀ュ吇\,
 12: \绗?2绔犅风溂鑰抽蓟鍠変笌鍙ｈ厰\,
 13: \绗?3绔犅风毊鑲や笌鎶楄繃鏁廫,
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
 return 绗?{chapterId}绔燻;
 }
 return \寰呭畾浣嶇珷鑺俓;
}
