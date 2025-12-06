-- 西药药二知识点导入SQL
-- 自动生成于 extract_markdown_knowledge.py

-- 清理旧数据（可选）
-- DELETE FROM knowledge_tree WHERE subject_code = 'xiyao_yaoxue_er';

-- 插入知识点数据

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_1', '1', '精神与中枢神经系统用药', NULL, 'xiyao_yaoxue_er', 1, 3, 'chapter')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_1.1', '1.1', '镇静催眠药、中枢肌松药', 'xiyao_yaoxue_er_1', 'xiyao_yaoxue_er', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.1.1', '1.1.1', '镇静催眠药的临床用药评价', '', 'xiyao_yaoxue_er_1.1', 'xiyao_yaoxue_er', 3, 3, 'point', '其他', '镇静催眠药', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.1.2', '1.1.2', '地西泮特点', '药物: **地西泮**; 作用时间: 长效; 特点: 抗焦虑、抗惊厥、肌松; 记忆口诀: "地"久天长', 'xiyao_yaoxue_er_1.1', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '地西泮', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.1.3', '1.1.3', '艾司唑仑特点', '药物: **艾司唑仑**; 作用时间: 中效; 特点: 催眠为主; 记忆口诀: 艾司"中"间', 'xiyao_yaoxue_er_1.1', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '艾司唑仑', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.1.4', '1.1.4', '三唑仑特点', '药物: **三唑仑**; 作用时间: 短效; 特点: 入睡困难; 记忆口诀: "三"分钟入睡', 'xiyao_yaoxue_er_1.1', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '三唑仑', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.1.5', '1.1.5', '咪达唑仑特点', '药物: **咪达唑仑**; 作用时间: 超短效; 特点: 麻醉前给药; 记忆口诀: "咪"一下就睡', 'xiyao_yaoxue_er_1.1', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '咪达唑仑', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.1.6', '1.1.6', '镇静催眠药记忆口诀', '苯二氮䓬频率增，巴比妥类时间延', 'xiyao_yaoxue_er_1.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '镇静催眠药', '苯二氮䓬频率增，巴比妥类时间延')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.1.7', '1.1.7', '镇静催眠药记忆口诀', '地西泮长艾司中，三唑短效咪超短', 'xiyao_yaoxue_er_1.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '镇静催眠药', '地西泮长艾司中，三唑短效咪超短')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.1.8', '1.1.8', '唑吡坦特点', '药物: **唑吡坦**; 半衰期: 2.5h; 特点: 入睡困难首选', 'xiyao_yaoxue_er_1.1', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '唑吡坦', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.1.9', '1.1.9', '佐匹克隆特点', '药物: **佐匹克隆**; 半衰期: 5h; 特点: 右旋体更优', 'xiyao_yaoxue_er_1.1', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '佐匹克隆', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.1.10', '1.1.10', '扎来普隆特点', '药物: **扎来普隆**; 半衰期: 1h; 特点: 超短效', 'xiyao_yaoxue_er_1.1', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '扎来普隆', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.1.11', '1.1.11', '镇静催眠药记忆口诀', 'Z药选择α1，催眠强来肌松弱', 'xiyao_yaoxue_er_1.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '镇静催眠药', 'Z药选择α1，催眠强来肌松弱')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.1.12', '1.1.12', '镇静催眠药记忆口诀', '唑吡坦入睡好，佐匹克隆维持妙', 'xiyao_yaoxue_er_1.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '镇静催眠药', '唑吡坦入睡好，佐匹克隆维持妙')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.1.13', '1.1.13', '雷美替胺特点', '药物: **雷美替胺**; 机制: MT1/MT2激动; 特点: 无依赖性，老年人适用', 'xiyao_yaoxue_er_1.1', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '雷美替胺', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.1.14', '1.1.14', '镇静催眠药记忆口诀', '雷美替胺调节律，老年失眠无依赖', 'xiyao_yaoxue_er_1.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '镇静催眠药', '雷美替胺调节律，老年失眠无依赖')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.1.15', '1.1.15', '中枢肌松药的临床用药评价', '', 'xiyao_yaoxue_er_1.1', 'xiyao_yaoxue_er', 3, 3, 'point', '其他', '中枢肌松药', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.1.16', '1.1.16', '中枢肌松药记忆口诀', '巴氯芬激动B，替扎尼定α2', 'xiyao_yaoxue_er_1.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '中枢肌松药', '巴氯芬激动B，替扎尼定α2')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_1.2', '1.2', '抗癫痫药', 'xiyao_yaoxue_er_1', 'xiyao_yaoxue_er', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.2.17', '1.2.17', '卡马西平的临床用药评价', '', 'xiyao_yaoxue_er_1.2', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', '卡马西平', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.2.18', '1.2.18', '卡马西平记忆口诀', '卡马西平钠通道，自身诱导要记牢', 'xiyao_yaoxue_er_1.2', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '卡马西平', '卡马西平钠通道，自身诱导要记牢')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.2.19', '1.2.19', '卡马西平记忆口诀', '皮肤反应最严重，亚裔基因要筛查', 'xiyao_yaoxue_er_1.2', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '卡马西平', '皮肤反应最严重，亚裔基因要筛查')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.2.20', '1.2.20', '苯妥英钠的临床用药评价', '', 'xiyao_yaoxue_er_1.2', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', '苯妥英钠', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.2.21', '1.2.21', '苯妥英钠记忆口诀', '苯妥英钠零级消，治疗窗窄要监测', 'xiyao_yaoxue_er_1.2', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '苯妥英钠', '苯妥英钠零级消，治疗窗窄要监测')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.2.22', '1.2.22', '苯妥英钠记忆口诀', '牙龈增生多毛症，长期用药要注意', 'xiyao_yaoxue_er_1.2', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '苯妥英钠', '牙龈增生多毛症，长期用药要注意')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.2.23', '1.2.23', '丙戊酸钠的临床用药评价', '', 'xiyao_yaoxue_er_1.2', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', '丙戊酸钠', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.2.24', '1.2.24', '丙戊酸钠记忆口诀', '丙戊酸钠广谱抗，肝毒致畸要警惕', 'xiyao_yaoxue_er_1.2', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '丙戊酸钠', '丙戊酸钠广谱抗，肝毒致畸要警惕')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.2.25', '1.2.25', '丙戊酸钠记忆口诀', '小于两岁风险高，孕妇禁用记心间', 'xiyao_yaoxue_er_1.2', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '丙戊酸钠', '小于两岁风险高，孕妇禁用记心间')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_1.3', '1.3', '抗抑郁药', 'xiyao_yaoxue_er_1', 'xiyao_yaoxue_er', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.3.26', '1.3.26', 'SSRIs类的临床用药评价', '', 'xiyao_yaoxue_er_1.3', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', 'SSRIs类', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.3.27', '1.3.27', '氟西汀特点', '药物: **氟西汀**; 半衰期: 1-3天; 特点: 半衰期最长，CYP2D6抑制', 'xiyao_yaoxue_er_1.3', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '氟西汀', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.3.28', '1.3.28', '帕罗西汀特点', '药物: **帕罗西汀**; 半衰期: 21h; 特点: 抗胆碱作用最强', 'xiyao_yaoxue_er_1.3', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '帕罗西汀', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.3.29', '1.3.29', '舍曲林特点', '药物: **舍曲林**; 半衰期: 26h; 特点: 对CYP影响小', 'xiyao_yaoxue_er_1.3', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '舍曲林', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.3.30', '1.3.30', '西酞普兰特点', '药物: **西酞普兰**; 半衰期: 35h; 特点: 选择性最高', 'xiyao_yaoxue_er_1.3', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '西酞普兰', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.3.31', '1.3.31', '艾司西酞普兰特点', '药物: **艾司西酞普兰**; 半衰期: 27-32h; 特点: S-异构体，疗效更好', 'xiyao_yaoxue_er_1.3', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '艾司西酞普兰', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.3.32', '1.3.32', 'SSRIs类记忆口诀', 'SSRI选择5-HT，氟西汀长帕罗胆', 'xiyao_yaoxue_er_1.3', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', 'SSRIs类', 'SSRI选择5-HT，氟西汀长帕罗胆')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.3.33', '1.3.33', 'SSRIs类记忆口诀', '舍曲林安全性好，西酞普兰选择高', 'xiyao_yaoxue_er_1.3', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', 'SSRIs类', '舍曲林安全性好，西酞普兰选择高')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_1.4', '1.4', '中枢镇痛药', 'xiyao_yaoxue_er_1', 'xiyao_yaoxue_er', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.4.34', '1.4.34', '吗啡的临床用药评价', '', 'xiyao_yaoxue_er_1.4', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', '吗啡', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.4.35', '1.4.35', '吗啡记忆口诀', '吗啡μ受体全激动，镇痛镇静抑呼吸', 'xiyao_yaoxue_er_1.4', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '吗啡', '吗啡μ受体全激动，镇痛镇静抑呼吸')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.4.36', '1.4.36', '吗啡记忆口诀', '便秘最常不耐受，呼吸抑制最危险', 'xiyao_yaoxue_er_1.4', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '吗啡', '便秘最常不耐受，呼吸抑制最危险')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.4.37', '1.4.37', '镇痛药强度比较记忆口诀', '芬太尼百倍强，舒芬千倍更厉害', 'xiyao_yaoxue_er_1.4', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '镇痛药强度比较', '芬太尼百倍强，舒芬千倍更厉害')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.4.38', '1.4.38', '镇痛药强度比较记忆口诀', '哌替啶弱十倍，曲马多也差不多', 'xiyao_yaoxue_er_1.4', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '镇痛药强度比较', '哌替啶弱十倍，曲马多也差不多')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_1.5', '1.5', '抗帕金森病药', 'xiyao_yaoxue_er_1', 'xiyao_yaoxue_er', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.5.39', '1.5.39', '左旋多巴的临床用药评价', '', 'xiyao_yaoxue_er_1.5', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', '左旋多巴', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.5.40', '1.5.40', '左旋多巴记忆口诀', '左旋多巴补DA，蜜月期后并发多', 'xiyao_yaoxue_er_1.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '左旋多巴', '左旋多巴补DA，蜜月期后并发多')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.5.41', '1.5.41', '左旋多巴记忆口诀', '开关现象异动症，长期用药要注意', 'xiyao_yaoxue_er_1.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '左旋多巴', '开关现象异动症，长期用药要注意')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_1.6', '1.6', '抗精神病药', 'xiyao_yaoxue_er_1', 'xiyao_yaoxue_er', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.6.42', '1.6.42', '第二代抗精神病药的临床用药评价', '', 'xiyao_yaoxue_er_1.6', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', '第二代抗精神病药', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.6.43', '1.6.43', '利培酮特点', '药物: **利培酮**; 特点: EPS风险相对高; 主要不良反应: 高泌乳素血症', 'xiyao_yaoxue_er_1.6', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '利培酮', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.6.44', '1.6.44', '奥氮平特点', '药物: **奥氮平**; 特点: 代谢综合征风险高; 主要不良反应: 体重增加、血糖升高', 'xiyao_yaoxue_er_1.6', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '奥氮平', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.6.45', '1.6.45', '喹硫平特点', '药物: **喹硫平**; 特点: 镇静作用强; 主要不良反应: 嗜睡、体位性低血压', 'xiyao_yaoxue_er_1.6', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '喹硫平', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.6.46', '1.6.46', '阿立哌唑特点', '药物: **阿立哌唑**; 特点: DA部分激动剂; 主要不良反应: 静坐不能', 'xiyao_yaoxue_er_1.6', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '阿立哌唑', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.6.47', '1.6.47', '第二代抗精神病药记忆口诀', '一代阻断D2多，二代加上5-HT', 'xiyao_yaoxue_er_1.6', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '第二代抗精神病药', '一代阻断D2多，二代加上5-HT')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_1.6.48', '1.6.48', '第二代抗精神病药记忆口诀', '奥氮平胖利培乳，喹硫平困阿立动', 'xiyao_yaoxue_er_1.6', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '第二代抗精神病药', '奥氮平胖利培乳，喹硫平困阿立动')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_2', '2', '解热、镇痛、抗炎、抗风湿及抗痛风药', NULL, 'xiyao_yaoxue_er', 1, 3, 'chapter')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_2.1', '2.1', '解热、镇痛、抗炎药（NSAIDs）', 'xiyao_yaoxue_er_2', 'xiyao_yaoxue_er', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.1.49', '2.1.49', '阿司匹林的临床用药评价', '', 'xiyao_yaoxue_er_2.1', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', '阿司匹林', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.1.50', '2.1.50', '阿司匹林记忆口诀', '阿司匹林不可逆，小剂抗栓大剂炎', 'xiyao_yaoxue_er_2.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '阿司匹林', '阿司匹林不可逆，小剂抗栓大剂炎')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.1.51', '2.1.51', '阿司匹林记忆口诀', '瑞氏综合征儿童禁，哮喘三联要警惕', 'xiyao_yaoxue_er_2.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '阿司匹林', '瑞氏综合征儿童禁，哮喘三联要警惕')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.1.52', '2.1.52', '布洛芬的临床用药评价', '', 'xiyao_yaoxue_er_2.1', 'xiyao_yaoxue_er', 3, 4, 'point', '其他', '布洛芬', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.1.53', '2.1.53', '布洛芬记忆口诀', '布洛芬可逆抑制，胃肠反应相对轻', 'xiyao_yaoxue_er_2.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '布洛芬', '布洛芬可逆抑制，胃肠反应相对轻')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.1.54', '2.1.54', '塞来昔布的临床用药评价', '', 'xiyao_yaoxue_er_2.1', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', '塞来昔布', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.1.55', '2.1.55', '塞来昔布记忆口诀', '塞来昔布选择二，胃肠安全心血管', 'xiyao_yaoxue_er_2.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '塞来昔布', '塞来昔布选择二，胃肠安全心血管')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.1.56', '2.1.56', '塞来昔布记忆口诀', '磺胺过敏要禁用，心脑血管风险高', 'xiyao_yaoxue_er_2.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '塞来昔布', '磺胺过敏要禁用，心脑血管风险高')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_2.2', '2.2', '抗风湿药', 'xiyao_yaoxue_er_2', 'xiyao_yaoxue_er', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.2.57', '2.2.57', '甲氨蝶呤的临床用药评价', '', 'xiyao_yaoxue_er_2.2', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', '甲氨蝶呤', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.2.58', '2.2.58', '甲氨蝶呤记忆口诀', '甲氨蝶呤RA首选，叶酸补充减毒性', 'xiyao_yaoxue_er_2.2', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '甲氨蝶呤', '甲氨蝶呤RA首选，叶酸补充减毒性')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.2.59', '2.2.59', '甲氨蝶呤记忆口诀', '骨髓肝肺要监测，孕妇禁用致畸形', 'xiyao_yaoxue_er_2.2', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '甲氨蝶呤', '骨髓肝肺要监测，孕妇禁用致畸形')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_2.3', '2.3', '抗痛风药', 'xiyao_yaoxue_er_2', 'xiyao_yaoxue_er', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.3.60', '2.3.60', '秋水仙碱的临床用药评价', '', 'xiyao_yaoxue_er_2.3', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', '秋水仙碱', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.3.61', '2.3.61', '秋水仙碱记忆口诀', '秋水仙碱急性用，抑制白细胞趋化', 'xiyao_yaoxue_er_2.3', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '秋水仙碱', '秋水仙碱急性用，抑制白细胞趋化')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.3.62', '2.3.62', '秋水仙碱记忆口诀', '腹泻出现要停药，骨髓抑制要警惕', 'xiyao_yaoxue_er_2.3', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '秋水仙碱', '腹泻出现要停药，骨髓抑制要警惕')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.3.63', '2.3.63', '别嘌醇的临床用药评价', '', 'xiyao_yaoxue_er_2.3', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', '别嘌醇', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.3.64', '2.3.64', '别嘌醇记忆口诀', '别嘌醇抑制XO，减少尿酸生成好', 'xiyao_yaoxue_er_2.3', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '别嘌醇', '别嘌醇抑制XO，减少尿酸生成好')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.3.65', '2.3.65', '别嘌醇记忆口诀', '超敏反应最严重，基因筛查要做到', 'xiyao_yaoxue_er_2.3', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '别嘌醇', '超敏反应最严重，基因筛查要做到')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.3.66', '2.3.66', '非布司他的临床用药评价', '', 'xiyao_yaoxue_er_2.3', 'xiyao_yaoxue_er', 3, 4, 'point', '其他', '非布司他', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.3.67', '2.3.67', '非布司他记忆口诀', '非布司他选择性，肾功不全不调量', 'xiyao_yaoxue_er_2.3', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '非布司他', '非布司他选择性，肾功不全不调量')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_2.3.68', '2.3.68', '非布司他记忆口诀', '心血管风险要注意，黑框警告记心上', 'xiyao_yaoxue_er_2.3', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '非布司他', '心血管风险要注意，黑框警告记心上')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_3', '3', '呼吸系统用药', NULL, 'xiyao_yaoxue_er', 1, 3, 'chapter')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_3.1', '3.1', '镇咳药', 'xiyao_yaoxue_er_3', 'xiyao_yaoxue_er', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.1.69', '3.1.69', '右美沙芬的临床用药评价', '', 'xiyao_yaoxue_er_3.1', 'xiyao_yaoxue_er', 3, 4, 'point', '其他', '右美沙芬', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.1.70', '3.1.70', '右美沙芬记忆口诀', '右美沙芬不成瘾，中枢镇咳效果好', 'xiyao_yaoxue_er_3.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '右美沙芬', '右美沙芬不成瘾，中枢镇咳效果好')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.1.71', '3.1.71', '右美沙芬记忆口诀', 'MAOIs禁合用，痰多患者要慎用', 'xiyao_yaoxue_er_3.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '右美沙芬', 'MAOIs禁合用，痰多患者要慎用')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_3.2', '3.2', '祛痰药', 'xiyao_yaoxue_er_3', 'xiyao_yaoxue_er', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.2.72', '3.2.72', '氨溴索的临床用药评价', '', 'xiyao_yaoxue_er_3.2', 'xiyao_yaoxue_er', 3, 4, 'point', '其他', '氨溴索', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.2.73', '3.2.73', '氨溴索记忆口诀', '氨溴索促分泌，表面活性物质增', 'xiyao_yaoxue_er_3.2', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '氨溴索', '氨溴索促分泌，表面活性物质增')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_3.3', '3.3', '平喘药', 'xiyao_yaoxue_er_3', 'xiyao_yaoxue_er', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.74', '3.3.74', 'β2受体激动剂的临床用药评价', '', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', 'β2受体激动剂', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.75', '3.3.75', '沙丁胺醇特点', '药物: **沙丁胺醇**; 类型: SABA; 起效时间: 5min; 持续时间: 4-6h', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '沙丁胺醇', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.76', '3.3.76', '特布他林特点', '药物: **特布他林**; 类型: SABA; 起效时间: 15min; 持续时间: 4-6h', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '特布他林', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.77', '3.3.77', '沙美特罗特点', '药物: **沙美特罗**; 类型: LABA; 起效时间: 30min; 持续时间: 12h', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '沙美特罗', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.78', '3.3.78', '福莫特罗特点', '药物: **福莫特罗**; 类型: LABA; 起效时间: 5min; 持续时间: 12h', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '福莫特罗', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.79', '3.3.79', 'β2受体激动剂记忆口诀', 'β2激动松平滑，SABA急救LABA控', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', 'β2受体激动剂', 'β2激动松平滑，SABA急救LABA控')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.80', '3.3.80', 'β2受体激动剂记忆口诀', '沙丁胺醇快又短，沙美特罗慢而长', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', 'β2受体激动剂', '沙丁胺醇快又短，沙美特罗慢而长')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.81', '3.3.81', '茶碱类的临床用药评价', '', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', '茶碱类', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.82', '3.3.82', '茶碱类记忆口诀', '茶碱窗窄要监测，十到二十是范围', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '茶碱类', '茶碱窗窄要监测，十到二十是范围')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.83', '3.3.83', '茶碱类记忆口诀', '西咪大环喹诺酮，升高浓度要小心', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '茶碱类', '西咪大环喹诺酮，升高浓度要小心')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.84', '3.3.84', '吸入糖皮质激素（ICS）的临床用药评价', '', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', '吸入糖皮质激素（ICS）', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.85', '3.3.85', '布地奈德特点', '药物: **布地奈德**; 效价（相对）: 1; 特点: 首过效应大，安全性好', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '布地奈德', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.86', '3.3.86', '氟替卡松特点', '药物: **氟替卡松**; 效价（相对）: 2; 特点: 脂溶性高，局部作用强', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '氟替卡松', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.87', '3.3.87', '倍氯米松特点', '药物: **倍氯米松**; 效价（相对）: 0.5; 特点: 前药，需转化', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '倍氯米松', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.88', '3.3.88', '吸入糖皮质激素（ICS）记忆口诀', 'ICS哮喘控制首选，吸后漱口防念珠', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '吸入糖皮质激素（ICS）', 'ICS哮喘控制首选，吸后漱口防念珠')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.89', '3.3.89', '吸入糖皮质激素（ICS）记忆口诀', '布地奈德安全好，氟替卡松效价高', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '吸入糖皮质激素（ICS）', '布地奈德安全好，氟替卡松效价高')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.90', '3.3.90', '白三烯受体拮抗剂的临床用药评价', '', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 4, 'point', '其他', '白三烯受体拮抗剂', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_3.3.91', '3.3.91', '白三烯受体拮抗剂记忆口诀', '孟鲁司特口服好，运动哮喘效果妙', 'xiyao_yaoxue_er_3.3', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '白三烯受体拮抗剂', '孟鲁司特口服好，运动哮喘效果妙')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_4', '4', '消化系统用药', NULL, 'xiyao_yaoxue_er', 1, 3, 'chapter')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_4.1', '4.1', '抑酸剂、抗酸药与胃黏膜保护药', 'xiyao_yaoxue_er_4', 'xiyao_yaoxue_er', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.92', '4.1.92', '质子泵抑制剂（PPI）的临床用药评价', '', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', '质子泵抑制剂（PPI）', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.93', '4.1.93', '奥美拉唑特点', '药物: **奥美拉唑**; 代谢特点: CYP2C19、CYP3A4; 相互作用: 氯吡格雷相互作用', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '奥美拉唑', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.94', '4.1.94', '兰索拉唑特点', '药物: **兰索拉唑**; 代谢特点: CYP2C19、CYP3A4; 相互作用: 相互作用较多', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '兰索拉唑', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.95', '4.1.95', '泮托拉唑特点', '药物: **泮托拉唑**; 代谢特点: 主要硫酸化; 相互作用: 相互作用最少', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '泮托拉唑', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.96', '4.1.96', '雷贝拉唑特点', '药物: **雷贝拉唑**; 代谢特点: 非酶代谢为主; 相互作用: 受CYP2C19影响小', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '雷贝拉唑', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.97', '4.1.97', '艾司奥美拉唑特点', '药物: **艾司奥美拉唑**; 代谢特点: CYP2C19; 相互作用: S-异构体，疗效更稳定', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '艾司奥美拉唑', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.98', '4.1.98', '质子泵抑制剂（PPI）记忆口诀', 'PPI不可逆抑制，质子泵被永久封', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '质子泵抑制剂（PPI）', 'PPI不可逆抑制，质子泵被永久封')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.99', '4.1.99', '质子泵抑制剂（PPI）记忆口诀', '泮托拉唑相互少，雷贝拉唑不受影响', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '质子泵抑制剂（PPI）', '泮托拉唑相互少，雷贝拉唑不受影响')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.100', '4.1.100', '质子泵抑制剂（PPI）记忆口诀', '长期使用骨折险，艰难梭菌要警惕', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '质子泵抑制剂（PPI）', '长期使用骨折险，艰难梭菌要警惕')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.101', '4.1.101', 'H2受体拮抗剂的临床用药评价', '', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', 'H2受体拮抗剂', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.102', '4.1.102', '西咪替丁特点', '药物: **西咪替丁**; 效价（相对）: 1; 特点: CYP抑制作用强', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '西咪替丁', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.103', '4.1.103', '雷尼替丁特点', '药物: **雷尼替丁**; 效价（相对）: 5-10; 特点: 相互作用较少', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '雷尼替丁', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.104', '4.1.104', '法莫替丁特点', '药物: **法莫替丁**; 效价（相对）: 20-50; 特点: 效价最高', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '法莫替丁', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.105', '4.1.105', 'H2受体拮抗剂记忆口诀', 'H2拮抗竞争性，西咪替丁相互多', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', 'H2受体拮抗剂', 'H2拮抗竞争性，西咪替丁相互多')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.106', '4.1.106', 'H2受体拮抗剂记忆口诀', '抗雄激素乳房大，老年人用要小心', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', 'H2受体拮抗剂', '抗雄激素乳房大，老年人用要小心')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.107', '4.1.107', '胃黏膜保护药的临床用药评价', '', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 3, 'point', '其他', '胃黏膜保护药', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.108', '4.1.108', '胃黏膜保护药记忆口诀', '硫糖铝需酸环境，餐前服用效果好', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '胃黏膜保护药', '硫糖铝需酸环境，餐前服用效果好')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.1.109', '4.1.109', '胃黏膜保护药记忆口诀', '铋剂杀菌又保护，黑便黑舌不用怕', 'xiyao_yaoxue_er_4.1', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '胃黏膜保护药', '铋剂杀菌又保护，黑便黑舌不用怕')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_4.2', '4.2', '胃肠动力药', 'xiyao_yaoxue_er_4', 'xiyao_yaoxue_er', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.2.110', '4.2.110', '甲氧氯普胺的临床用药评价', '', 'xiyao_yaoxue_er_4.2', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', '甲氧氯普胺', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.2.111', '4.2.111', '甲氧氯普胺记忆口诀', '甲氧氯普胺D2阻，促进排空又止吐', 'xiyao_yaoxue_er_4.2', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '甲氧氯普胺', '甲氧氯普胺D2阻，促进排空又止吐')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.2.112', '4.2.112', '甲氧氯普胺记忆口诀', '锥体外系要警惕，帕金森病禁使用', 'xiyao_yaoxue_er_4.2', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '甲氧氯普胺', '锥体外系要警惕，帕金森病禁使用')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.2.113', '4.2.113', '多潘立酮的临床用药评价', '', 'xiyao_yaoxue_er_4.2', 'xiyao_yaoxue_er', 3, 4, 'point', '其他', '多潘立酮', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.2.114', '4.2.114', '多潘立酮记忆口诀', '多潘立酮不入脑，锥体外系反应少', 'xiyao_yaoxue_er_4.2', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '多潘立酮', '多潘立酮不入脑，锥体外系反应少')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.2.115', '4.2.115', '多潘立酮记忆口诀', '心脏风险要注意，QT延长需警惕', 'xiyao_yaoxue_er_4.2', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '多潘立酮', '心脏风险要注意，QT延长需警惕')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_4.3', '4.3', '止吐药', 'xiyao_yaoxue_er_4', 'xiyao_yaoxue_er', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.3.116', '4.3.116', '5-HT3受体拮抗剂的临床用药评价', '', 'xiyao_yaoxue_er_4.3', 'xiyao_yaoxue_er', 3, 5, 'point', '其他', '5-HT3受体拮抗剂', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.3.117', '4.3.117', '昂丹司琼特点', '药物: **昂丹司琼**; 半衰期: 3-4h; 特点: 最常用', 'xiyao_yaoxue_er_4.3', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '昂丹司琼', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.3.118', '4.3.118', '格拉司琼特点', '药物: **格拉司琼**; 半衰期: 9h; 特点: 作用时间长', 'xiyao_yaoxue_er_4.3', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '格拉司琼', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.3.119', '4.3.119', '帕洛诺司琼特点', '药物: **帕洛诺司琼**; 半衰期: 40h; 特点: 半衰期最长，延迟性呕吐', 'xiyao_yaoxue_er_4.3', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '帕洛诺司琼', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.3.120', '4.3.120', '5-HT3受体拮抗剂记忆口诀', '司琼类阻5-HT3，化疗呕吐首选药', 'xiyao_yaoxue_er_4.3', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '5-HT3受体拮抗剂', '司琼类阻5-HT3，化疗呕吐首选药')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.3.121', '4.3.121', '5-HT3受体拮抗剂记忆口诀', '帕洛诺司琼最长效，延迟呕吐效果好', 'xiyao_yaoxue_er_4.3', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '5-HT3受体拮抗剂', '帕洛诺司琼最长效，延迟呕吐效果好')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_4.4', '4.4', '泻药与便秘治疗药', 'xiyao_yaoxue_er_4', 'xiyao_yaoxue_er', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.4.122', '4.4.122', '乳果糖的临床用药评价', '', 'xiyao_yaoxue_er_4.4', 'xiyao_yaoxue_er', 3, 4, 'point', '其他', '乳果糖', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.4.123', '4.4.123', '乳果糖记忆口诀', '乳果糖渗透泻，肝性脑病也能用', 'xiyao_yaoxue_er_4.4', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '乳果糖', '乳果糖渗透泻，肝性脑病也能用')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('xiyao_yaoxue_er_4.5', '4.5', '止泻药', 'xiyao_yaoxue_er_4', 'xiyao_yaoxue_er', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.124', '4.5.124', '洛哌丁胺的临床用药评价', '', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '其他', '洛哌丁胺', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.125', '4.5.125', '洛哌丁胺记忆口诀', '洛哌丁胺μ激动，不入脑来无成瘾', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '洛哌丁胺', '洛哌丁胺μ激动，不入脑来无成瘾')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.126', '4.5.126', '洛哌丁胺记忆口诀', '感染腹泻禁使用，小儿禁用要记牢', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '洛哌丁胺', '感染腹泻禁使用，小儿禁用要记牢')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.127', '4.5.127', '镇静催眠特点', '系统: 镇静催眠; 高频药物: 苯二氮䓬类; 核心机制: 增强GABA_A; 记忆要点: 频率增加', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '镇静催眠', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.128', '4.5.128', '镇静催眠特点', '系统: 镇静催眠; 高频药物: 非苯二氮䓬类; 核心机制: 选择性α1; 记忆要点: Z药选择', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '镇静催眠', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.129', '4.5.129', '抗癫痫特点', '系统: 抗癫痫; 高频药物: 卡马西平; 核心机制: Na⁺通道阻滞; 记忆要点: 自身诱导', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '抗癫痫', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.130', '4.5.130', '抗癫痫特点', '系统: 抗癫痫; 高频药物: 丙戊酸钠; 核心机制: 多机制; 记忆要点: 肝毒致畸', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '抗癫痫', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.131', '4.5.131', '抗抑郁特点', '系统: 抗抑郁; 高频药物: SSRIs; 核心机制: 抑制5-HT再摄取; 记忆要点: 5-HT综合征', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '抗抑郁', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.132', '4.5.132', '镇痛特点', '系统: 镇痛; 高频药物: 吗啡; 核心机制: μ受体激动; 记忆要点: 呼吸抑制', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '镇痛', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.133', '4.5.133', '抗帕金森特点', '系统: 抗帕金森; 高频药物: 左旋多巴; 核心机制: 补充DA; 记忆要点: 开关现象', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '抗帕金森', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.134', '4.5.134', 'NSAIDs特点', '系统: NSAIDs; 高频药物: 阿司匹林; 核心机制: 不可逆抑制COX; 记忆要点: 小剂抗栓', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', 'NSAIDs', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.135', '4.5.135', '抗痛风特点', '系统: 抗痛风; 高频药物: 秋水仙碱; 核心机制: 抑制白细胞; 记忆要点: 腹泻停药', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '抗痛风', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.136', '4.5.136', '抗痛风特点', '系统: 抗痛风; 高频药物: 别嘌醇; 核心机制: 抑制XO; 记忆要点: 超敏反应', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '抗痛风', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.137', '4.5.137', '平喘特点', '系统: 平喘; 高频药物: β2激动剂; 核心机制: cAMP↑; 记忆要点: SABA急救', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '平喘', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.138', '4.5.138', '平喘特点', '系统: 平喘; 高频药物: 茶碱; 核心机制: PDE抑制; 记忆要点: 窗窄监测', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '平喘', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.139', '4.5.139', '抑酸特点', '系统: 抑酸; 高频药物: PPI; 核心机制: 不可逆抑制质子泵; 记忆要点: 长期骨折', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '抑酸', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.140', '4.5.140', '胃动力特点', '系统: 胃动力; 高频药物: 甲氧氯普胺; 核心机制: D2阻断; 记忆要点: 锥体外系', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '胃动力', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.141', '4.5.141', '呼吸抑制特点', '不良反应: 呼吸抑制; 相关药物: 吗啡、苯二氮䓬类; 记忆口诀: "阿片苯二抑呼吸"', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '呼吸抑制', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.142', '4.5.142', '锥体外系特点', '不良反应: 锥体外系; 相关药物: 甲氧氯普胺、抗精神病药; 记忆口诀: "D2阻断锥体外"', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '锥体外系', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.143', '4.5.143', '5-HT综合征特点', '不良反应: 5-HT综合征; 相关药物: SSRIs+MAOIs; 记忆口诀: "5-HT过多要命"', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '5-HT综合征', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.144', '4.5.144', 'Stevens-Johnson特点', '不良反应: Stevens-Johnson; 相关药物: 卡马西平、别嘌醇; 记忆口诀: "皮肤反应查基因"', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', 'Stevens-Johnson', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.145', '4.5.145', 'QT延长特点', '不良反应: QT延长; 相关药物: 多潘立酮、5-HT3拮抗剂; 记忆口诀: "心脏风险要监测"', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', 'QT延长', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.146', '4.5.146', '骨质疏松特点', '不良反应: 骨质疏松; 相关药物: PPI长期、糖皮质激素; 记忆口诀: "长期用药骨头松"', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '骨质疏松', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.147', '4.5.147', '高泌乳素特点', '不良反应: 高泌乳素; 相关药物: 甲氧氯普胺、利培酮; 记忆口诀: "D2阻断乳汁多"', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '高泌乳素', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.148', '4.5.148', '闭角型青光眼特点', '禁忌症: 闭角型青光眼; 禁用药物: 苯二氮䓬类、抗胆碱药; 原因: 升高眼压', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '闭角型青光眼', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.149', '4.5.149', '重症肌无力特点', '禁忌症: 重症肌无力; 禁用药物: 苯二氮䓬类、氨基糖苷类; 原因: 加重肌无力', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '重症肌无力', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.150', '4.5.150', '帕金森病特点', '禁忌症: 帕金森病; 禁用药物: 甲氧氯普胺、抗精神病药; 原因: 加重症状', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '帕金森病', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.151', '4.5.151', '哮喘特点', '禁忌症: 哮喘; 禁用药物: β受体阻滞剂、吗啡; 原因: 支气管收缩', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '哮喘', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.152', '4.5.152', '消化道溃疡特点', '禁忌症: 消化道溃疡; 禁用药物: NSAIDs; 原因: 加重溃疡', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '消化道溃疡', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.153', '4.5.153', '妊娠特点', '禁忌症: 妊娠; 禁用药物: 丙戊酸钠、甲氨蝶呤; 原因: 致畸', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '药物对比', '妊娠', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.154', '4.5.154', '镇静催眠药的临床用药评价', '', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '其他', '镇静催眠药', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.155', '4.5.155', '镇静催眠药记忆口诀', '苯二氮䓬频率增，巴比妥类时间延', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '镇静催眠药', '苯二氮䓬频率增，巴比妥类时间延')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.156', '4.5.156', '镇静催眠药记忆口诀', '地西泮长艾司中，三唑短效咪超短', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '镇静催眠药', '地西泮长艾司中，三唑短效咪超短')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.157', '4.5.157', '镇静催眠药记忆口诀', 'Z药选择α1，催眠强来肌松弱', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '镇静催眠药', 'Z药选择α1，催眠强来肌松弱')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.158', '4.5.158', '抗癫痫药的临床用药评价', '', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '其他', '抗癫痫药', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.159', '4.5.159', '抗癫痫药记忆口诀', '卡马西平钠通道，自身诱导要记牢', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '抗癫痫药', '卡马西平钠通道，自身诱导要记牢')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.160', '4.5.160', '抗癫痫药记忆口诀', '苯妥英钠零级消，治疗窗窄要监测', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '抗癫痫药', '苯妥英钠零级消，治疗窗窄要监测')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.161', '4.5.161', '抗癫痫药记忆口诀', '丙戊酸钠广谱抗，肝毒致畸要警惕', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '抗癫痫药', '丙戊酸钠广谱抗，肝毒致畸要警惕')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.162', '4.5.162', '抗抑郁药的临床用药评价', '', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '其他', '抗抑郁药', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.163', '4.5.163', '抗抑郁药记忆口诀', 'SSRI选择5-HT，氟西汀长帕罗胆', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '抗抑郁药', 'SSRI选择5-HT，氟西汀长帕罗胆')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.164', '4.5.164', '抗抑郁药记忆口诀', 'MAOIs禁合用，5-HT综合征要命', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '抗抑郁药', 'MAOIs禁合用，5-HT综合征要命')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.165', '4.5.165', '镇痛药的临床用药评价', '', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '其他', '镇痛药', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.166', '4.5.166', '镇痛药记忆口诀', '吗啡μ受体全激动，镇痛镇静抑呼吸', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '镇痛药', '吗啡μ受体全激动，镇痛镇静抑呼吸')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.167', '4.5.167', '镇痛药记忆口诀', '芬太尼百倍强，舒芬千倍更厉害', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '镇痛药', '芬太尼百倍强，舒芬千倍更厉害')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.168', '4.5.168', 'NSAIDs的临床用药评价', '', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '其他', 'NSAIDs', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.169', '4.5.169', 'NSAIDs记忆口诀', '阿司匹林不可逆，小剂抗栓大剂炎', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', 'NSAIDs', '阿司匹林不可逆，小剂抗栓大剂炎')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.170', '4.5.170', 'NSAIDs记忆口诀', '塞来昔布选择二，胃肠安全心血管', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', 'NSAIDs', '塞来昔布选择二，胃肠安全心血管')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.171', '4.5.171', '抗痛风药的临床用药评价', '', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '其他', '抗痛风药', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.172', '4.5.172', '抗痛风药记忆口诀', '秋水仙碱急性用，腹泻出现要停药', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '抗痛风药', '秋水仙碱急性用，腹泻出现要停药')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.173', '4.5.173', '抗痛风药记忆口诀', '别嘌醇抑制XO，超敏反应最严重', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '抗痛风药', '别嘌醇抑制XO，超敏反应最严重')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.174', '4.5.174', '平喘药的临床用药评价', '', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '其他', '平喘药', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.175', '4.5.175', '平喘药记忆口诀', 'β2激动松平滑，SABA急救LABA控', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '平喘药', 'β2激动松平滑，SABA急救LABA控')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.176', '4.5.176', '平喘药记忆口诀', '茶碱窗窄要监测，十到二十是范围', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '平喘药', '茶碱窗窄要监测，十到二十是范围')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.177', '4.5.177', '平喘药记忆口诀', 'ICS哮喘控制首选，吸后漱口防念珠', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '平喘药', 'ICS哮喘控制首选，吸后漱口防念珠')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.178', '4.5.178', '消化系统药的临床用药评价', '', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 3, 'point', '其他', '消化系统药', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.179', '4.5.179', '消化系统药记忆口诀', 'PPI不可逆抑制，长期使用骨折险', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '消化系统药', 'PPI不可逆抑制，长期使用骨折险')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.180', '4.5.180', '消化系统药记忆口诀', '甲氧氯普胺D2阻，锥体外系要警惕', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '消化系统药', '甲氧氯普胺D2阻，锥体外系要警惕')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;

INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('xiyao_yaoxue_er_4.5.181', '4.5.181', '消化系统药记忆口诀', '司琼类阻5-HT3，化疗呕吐首选药', 'xiyao_yaoxue_er_4.5', 'xiyao_yaoxue_er', 3, 4, 'point', '记忆口诀', '消化系统药', '司琼类阻5-HT3，化疗呕吐首选药')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;