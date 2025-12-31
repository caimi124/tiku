/**
 * 本页重点速览配置
 * 
 * 为特定考点ID配置重点速览内容
 * 后续可以扩展为从数据库或API获取
 */

export interface KeyTakeawayConfig {
  pointId: string
  items: string[]
}

/**
 * 重点速览配置表
 * key: 考点ID
 * value: 重点列表
 */
const KEY_TAKEAWAYS_CONFIG: Record<string, string[]> = {
  // 肝病辅助用药考点
  'e75562a4-d0d9-491d-b7a0-837c3224e8d7': [
    '多烯磷脂酰胆碱注射液含苯甲醇 → 新生儿/早产儿禁用（可致"喘息综合征"）',
    '多烯磷脂酰胆碱注射液严禁用电解质溶液（生理盐水/林格）稀释；只能用葡萄糖（5%/10%）或木糖醇',
    '乙酰半胱氨酸：谷胱甘肽前体 → 对乙酰氨基酚过量中毒的特异性解救药',
    '甘草甜素制剂：可致低血钾、加重高血压 → 严重低钾/高钠/高血压/心衰/肾衰禁用',
    '联苯双酯：降ALT明显，但对AST作用不明显；短期好，远期疗效差',
    '熊去氧胆酸适应证：X线可穿透胆固醇结石+胆囊收缩正常；胆汁淤积性肝病（如PBC）；胆汁反流性胃炎',
    '熊去氧胆酸禁忌：急性胆囊炎/胆管炎、胆道阻塞、严重肝功减退等；溶石12个月无效应停药',
    '熊去氧胆酸相互作用：不与考来烯胺/含铝抗酸剂同服；必要时间隔2小时',
  ],
}

/**
 * 获取考点的重点速览
 */
export function getKeyTakeaways(pointId: string): string[] {
  return KEY_TAKEAWAYS_CONFIG[pointId] || []
}

/**
 * 检查是否有配置的重点速览
 */
export function hasKeyTakeaways(pointId: string): boolean {
  return pointId in KEY_TAKEAWAYS_CONFIG && KEY_TAKEAWAYS_CONFIG[pointId].length > 0
}

