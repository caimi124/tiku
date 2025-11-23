-- ================================================================
-- 医考题库自动导入SQL - 高级版
-- ================================================================
-- 考试类型：执业药师
-- 科目：中药学综合知识与技能
-- 年份：2024
-- 题目总数：79 道
-- 生成时间：2025-11-20 20:56:01
-- 生成工具：Advanced Question Parser v1.0.0
-- ================================================================

-- 步骤1：清理现有数据
DELETE FROM questions 
WHERE exam_type = '执业药师' 
  AND subject = '中药学综合知识与技能' 
  AND source_year = 2024;

-- 步骤2：批量插入新数据


-- 📝 第1题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'single',
  '保存后告诉我，我会自动转换并导入

【题目格式示例】
一、最佳选择题
1. 题目内容...',
  '[{"key": "A", "value": "选项A"}, {"key": "B", "value": "选项B"}, {"key": "C", "value": "选项C"}, {"key": "D", "value": "选项D"}, {"key": "E", "value": "选项E\n答案：C\n解析：解析内容...\n\n========================================\n请在下方粘贴您的完整120道题目：\n========================================\n\n（请在此处粘贴所有题目）\n\n \n一、最佳选择题\n.属于“阳脉之海”的是\n1"}]'::json,
  'C',
  '督脉为“阳脉之海”。任脉为“阴脉之海”。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第2题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '痹证辨治',
  'single',
  '某女，40 岁，肢体肌肉酸楚、重着，疼痛，肿胀，活动不利，口中黏腻，舌苔白腻，脉濡
缓。治疗宜的基础方剂是',
  '[{"key": "A", "value": "薏苡仁汤"}, {"key": "B", "value": "独活寄生汤"}, {"key": "C", "value": "乌头汤"}, {"key": "D", "value": "桃红饮"}, {"key": "E", "value": "防风汤"}]'::json,
  'A',
  '依据关键词重着，舌苔白腻，辨证有湿邪痹症，故选用薏苡仁汤。',
  1,
  ARRAY['辨证', '选用'],
  '历年真题',
  2024,
  true
);


-- 📝 第3题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '中药注射剂',
  'single',
  '关于中药注射剂使用原则的说法，错误的是',
  '[{"key": "A", "value": "中药注射剂和其他药品一起混合滴注"}, {"key": "B", "value": "应密切观察用药反应，特别是用药后 30 分钟内"}, {"key": "C", "value": "按照药品说明书推荐的剂量给药速度和疗程使用"}, {"key": "D", "value": "临床使用中药注射剂应辨证用药"}, {"key": "E", "value": "选用中药注射剂应合理选择给药途径"}]'::json,
  'A',
  '中药注射剂应该单独滴注，故 A 说法错误。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第4题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '用药指导',
  'single',
  '下列治疗感冒的用药方案合理的是',
  '[{"key": "A", "value": "症状较重者，加倍服用感冒清片"}, {"key": "B", "value": "哺乳期患者使服用重感冒灵片"}, {"key": "C", "value": "严重性肾功能不全者服用复方感冒灵片"}, {"key": "D", "value": "风热感冒患者服用强力感冒片"}, {"key": "E", "value": "司机驾驶期间服用速感宁胶囊"}]'::json,
  'D',
  '强力感冒片，辛凉解表，清热解毒，解热镇痛，可用于风热感冒，故 D 用药方
案合理。。感冒清片需要按照规定的药物剂量区服。用，而不能加倍服用，故 A 不合理。重
感冒灵片含有安乃近，哺乳期不适宜服用，故 B 不合理。复方感冒灵片，严重性肾功能不全
者禁用，故 C 不合理。速感宁胶囊含有马来酸氯苯那敏，有嗜睡的不良反应，司机驾驶期间
不适宜服用，故 E 不合理。',
  2,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第5题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '用药指导',
  'single',
  '关于中药饮片处方用药适宜性的说法，错误的是',
  '[{"key": "A", "value": "应用玉屏风散固表止汗，宜选用生黄芪"}, {"key": "B", "value": "应用泻心汤泻火解毒，宜选用生黄连"}, {"key": "C", "value": "应用桃红四物汤活血行瘀，宜选用酒当归"}, {"key": "D", "value": "应用白虎汤清热泻火，宜选用生知母"}, {"key": "E", "value": "应用大黄䗪虫丸丸破瘀消疡，宜选用生大黄"}]'::json,
  'E',
  '大黄䗪虫丸丸破瘀消疡，宜选用熟大黄，故 E 说法错误。',
  1,
  ARRAY['选用'],
  '历年真题',
  2024,
  true
);


-- 📝 第6题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '方剂应用',
  'single',
  '某女，48 岁，月经紊乱，腰脊冷痛，肢软无力，神疲体倦。浮肿便溏，舌淡嫩苔白润，脉
细弱，治疗宜选用的基础方剂是',
  '[{"key": "A", "value": "一贯煎合逍遥散"}, {"key": "B", "value": "左归丸合二至丸"}, {"key": "C", "value": "保阴煎合圣愈汤"}, {"key": "D", "value": "右归丸合四君子汤"}, {"key": "E", "value": "举元煎合安仲汤"}]'::json,
  'D',
  '腰脊冷痛定位到肾，浮肿便溏定位到脾，再结合舌脉，辨证为脾肾阳虚，选用右
归丸。',
  1,
  ARRAY['辨证', '选用'],
  '历年真题',
  2024,
  true
);


-- 📝 第7题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '病例分析',
  'single',
  '某女，28 岁。乳房肿痛，皮肤红灼热，继之肿块变软，有应指感，伴身热口渴，溲赤便秘，
舌红苔黄腻，脉洪数。辨析其证候是',
  '[{"key": "A", "value": "肝胆湿热"}, {"key": "B", "value": "气滞热壅"}, {"key": "C", "value": "阴虚内热"}, {"key": "D", "value": "热毒炽盛"}, {"key": "E", "value": "肝郁痰凝"}]'::json,
  'D',
  '身热口渴，溲赤便秘，舌红苔黄腻，脉洪数，为热毒炽盛。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第8题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'single',
  '不属于实证的临床表现是',
  '[{"key": "A", "value": "神昏谵语"}, {"key": "B", "value": "痰涎壅盛"}, {"key": "C", "value": "腹痛喜按"}, {"key": "D", "value": "呼吸气粗"}, {"key": "E", "value": "舌苔厚腻"}]'::json,
  'C',
  '腹痛喜按为虚证。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第9题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '中医基础理论',
  'single',
  '寒极生热，热极生寒的体现的阴阳关系是',
  '[{"key": "A", "value": "转化"}, {"key": "B", "value": "消长"}, {"key": "C", "value": "互藏"}, {"key": "D", "value": "互损"}, {"key": "E", "value": "互根"}]'::json,
  'A',
  '寒极生热，热极生寒体现阴阳的转化。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第10题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '方剂应用',
  'single',
  '某女，52 岁，咳嗽日久，少痰咳甚。五心烦热，颧红，耳鸣，神疲消瘦，舌红少苔，脉
细数。治疗易选用的基础方剂',
  '[{"key": "A", "value": "二陈平胃散"}, {"key": "B", "value": "沙参麦冬汤"}, {"key": "C", "value": "清金化痰汤"}, {"key": "D", "value": "三子养心汤"}, {"key": "E", "value": "麻杏石甘汤"}]'::json,
  'B',
  '依据五心烦热，颧红，舌红少苔，脉细数，辨证为阴虚，选用沙参麦冬汤。',
  1,
  ARRAY['辨证', '选用'],
  '历年真题',
  2024,
  true
);


-- 📝 第11题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'single',
  '藏药以五元学说和味、性、效理论为导，形成独具特色的理论体系。其中功效为轻、糙、
凉、锐、浮、可用于医治赤巴病、麻风、晕眩、瘟疫等疾病的药味是',
  '[{"key": "A", "value": "酸味"}, {"key": "B", "value": "涩味"}, {"key": "C", "value": "咸味"}, {"key": "D", "value": "苦味"}, {"key": "E", "value": "辛味"}]'::json,
  'D',
  '苦味功效为轻、糙、凉、锐、浮、可用于医治赤巴病、麻风、晕眩、瘟疫等疾病。',
  2,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第12题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'single',
  '“壮水之主，以制阳光”的治法适用于',
  '[{"key": "A", "value": "虚寒证"}, {"key": "B", "value": "虚热证"}, {"key": "C", "value": "阴阳两虚证"}, {"key": "D", "value": "实热证"}, {"key": "E", "value": "实寒证"}]'::json,
  'B',
  '“壮水之主，以制阳光”的治法适用于虚热证。',
  1,
  ARRAY['治法'],
  '历年真题',
  2024,
  true
);


-- 📝 第13题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'single',
  '下列正别名错误的是',
  '[{"key": "A", "value": "重楼别名蚤休"}, {"key": "B", "value": "补骨脂别名破故纸"}, {"key": "C", "value": "鸡血藤别名红藤"}, {"key": "D", "value": "牵牛子别名黑丑"}, {"key": "E", "value": "海螵蛸别名乌贼骨"}]'::json,
  'C',
  '大血藤别名红藤。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第14题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'single',
  '五色主病理论中，热证对应的颜色是',
  '[{"key": "A", "value": "青色"}, {"key": "B", "value": "赤色"}, {"key": "C", "value": "黄色"}, {"key": "D", "value": "白色"}, {"key": "E", "value": "黑色"}]'::json,
  'B',
  '五色主病理论中，热证对应的颜色是赤色。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第15题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'single',
  '根据中药斗谱编排要求，不能摆放在一起的是',
  '[{"key": "A", "value": "陈皮和青皮"}, {"key": "B", "value": "三棱和莪术"}, {"key": "C", "value": "知母和浙贝母"}, {"key": "D", "value": "黄精和熟地黄"}, {"key": "E", "value": "杜仲和续断"}]'::json,
  'D',
  '黄精和熟地黄外观形状相似，但功效不同，不适宜排列在一起。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第16题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'single',
  '下列中西药联用，起到协同作用的是',
  '[{"key": "A", "value": "维 C 银翘片+解热镇痛药"}, {"key": "B", "value": "芍药甘草汤+解痉药"}, {"key": "C", "value": "槐角丸+磺胺类药物"}, {"key": "D", "value": "人参鹿茸丸+磺酰脲类药物"}, {"key": "E", "value": "桂枝汤+糖皮质激素"}]'::json,
  'B',
  '芍药甘草汤与西药解痉药联用，可提高疗效，起到协同作用。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第17题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '方剂应用',
  'single',
  '某男，68 岁，眩晕日久不愈，精神萎靡，目涩耳鸣，视物模糊，腰膝酸软，五心烦热，
舌红少苔，脉细数。治疗宜选用的基础方剂是',
  '[{"key": "A", "value": "半夏白术天麻汤"}, {"key": "B", "value": "左归丸"}, {"key": "C", "value": "二陈汤"}, {"key": "D", "value": "归脾汤"}, {"key": "E", "value": "天麻钩藤饮"}]'::json,
  'B',
  '辨证肾精不足，选用左归丸。',
  1,
  ARRAY['辨证', '选用'],
  '历年真题',
  2024,
  true
);


-- 📝 第18题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '痹证辨治',
  'single',
  '某女，71 岁。胸痹心痛 8 年，加重 3 天。心胸疼痛，痛如针刺而有定处，入夜为甚，伴
胸闷、心悸；舌紫暗，脉弦涩。治疗宜选用的中成药是',
  '[{"key": "A", "value": "芪参益气滴丸"}, {"key": "B", "value": "芪苈强心胶囊"}, {"key": "C", "value": "宽胸气雾剂"}, {"key": "D", "value": "血府逐瘀口服液."}, {"key": "E", "value": "天王补心丸"}]'::json,
  'D',
  '辨证有瘀血，选用血府逐瘀口服液.。',
  1,
  ARRAY['辨证', '选用'],
  '历年真题',
  2024,
  true
);


-- 📝 第19题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '方剂应用',
  'single',
  '口疮心脾积热证常以凉膈散为基础方剂加减治疗，关于该方用药指导的访法，错误的是',
  '[{"key": "A", "value": "方中薄荷宜选用薄荷叶，清头目，利咽喉"}, {"key": "B", "value": "方中芒硝一般不入煎剂，待汤剂煎得后，溶入汤液中服用"}, {"key": "C", "value": "方中黄芩宜选用酒黄芩，善清上焦热"}, {"key": "D", "value": "方中大黄峻烈攻下，脾虚体弱者宜减少用量"}, {"key": "E", "value": "方中甘草宜选用炙甘草，取其补益之功"}]'::json,
  'E',
  '选用生甘草，取其清热解毒之效',
  1,
  ARRAY['选用'],
  '历年真题',
  2024,
  true
);


-- 📝 第20题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '病例分析',
  'single',
  '某男，28 岁、因发热、恶寒，咽痛、咳嗽，血常规检查显示:白细胞计数 12.2x109/L，中
性粒细胞计数 9.5x109/L，白细胞和中性拉细胞均增多，其临床意义是',
  '[{"key": "A", "value": "放射损伤"}, {"key": "B", "value": "免疫缺陷"}, {"key": "C", "value": "细菌感染"}, {"key": "D", "value": "变态反应\nE 病毒感染"}]'::json,
  'C',
  '白细胞和中性拉细胞均增多，提示细菌感染。',
  2,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第21题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '病例分析',
  'single',
  '某女，68 岁，大便秘结，脘腹痞满，不思饮食，口唇干燥，面无华，舌红少苔，脉细涩。
宜采用的治法',
  '[{"key": "A", "value": "消食导滞法"}, {"key": "B", "value": "消痞散积法"}, {"key": "C", "value": "攻补兼施法"}, {"key": "D", "value": "调和肠胃法"}, {"key": "E", "value": "润燥缓下法"}]'::json,
  'E',
  '辨证为血虚津枯，肠燥便秘，选用的治法是润燥缓下法。',
  1,
  ARRAY['辨证', '选用', '治法'],
  '历年真题',
  2024,
  true
);


-- 📝 第22题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '病例分析',
  'single',
  '某女，23 岁。周身皮肤多发风团，色鲜红，灼热剧痒，遇热则剧，得冷则减，伴发热，
咽喉肿痛，舌苔黄，脉浮数。诊断为瘾疹，其证候是',
  '[{"key": "A", "value": "血虚风燥"}, {"key": "B", "value": "胃肠湿热"}, {"key": "C", "value": "风热犯表"}, {"key": "D", "value": "湿浊瘀滞"}, {"key": "E", "value": "风寒束表"}]'::json,
  'C',
  '脉浮数，辨证为风热犯表。',
  1,
  ARRAY['辨证'],
  '历年真题',
  2024,
  true
);


-- 📝 第23题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'single',
  '具有调畅排精行经生理功能的脏是',
  '[{"key": "A", "value": "肺"}, {"key": "B", "value": "肝"}, {"key": "C", "value": "脾"}, {"key": "D", "value": "肾"}, {"key": "E", "value": "心"}]'::json,
  'B',
  '肝具有调畅排精行经生理功能。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第24题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '方剂应用',
  'single',
  '某男，3 岁，不思进食，食少饮多，皮肤失润，大便偏干，手足心热。苔花剥，脉细数，
治疗宜选用的基础方剂是',
  '[{"key": "A", "value": "健脾丸"}, {"key": "B", "value": "保和丸"}, {"key": "C", "value": "养胃增液汤"}, {"key": "D", "value": "不换金正气散"}, {"key": "E", "value": "参苓白术散"}]'::json,
  'C',
  '辨证为胃阴亏虚，选用养胃增液汤。',
  1,
  ARRAY['辨证', '选用'],
  '历年真题',
  2024,
  true
);


-- 📝 第25题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '方剂应用',
  'single',
  '宜热服的方剂是',
  '[{"key": "A", "value": "奔豚汤"}, {"key": "B", "value": "桂枝汤"}, {"key": "C", "value": "半夏汤"}, {"key": "D", "value": "麦门冬汤"}, {"key": "E", "value": "玉女煎"}]'::json,
  'B',
  '桂枝汤宜热服。玉女煎清胃滋阴，适宜冷服。奔豚汤和麦门冬汤日三夜一服用。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第26题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '病例分析',
  'single',
  '某男，31 岁，鼻塞，流涕黄浊黏稠，味臭，头痛头昏，口苦咽千，耳鸣，舌红台黄，脉
弦数。诊鼻渊、证属胆经郁热。治疗用的中成药是',
  '[{"key": "A", "value": "鼻渊片"}, {"key": "B", "value": "鼻渊通窍颗粒"}, {"key": "C", "value": "鼻渊舒胶囊"}, {"key": "D", "value": "鼻舒适片"}, {"key": "E", "value": "利鼻片"}]'::json,
  'C',
  '胆经郁热，选用鼻渊舒胶囊。',
  1,
  ARRAY['选用'],
  '历年真题',
  2024,
  true
);


-- 📝 第27题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '中医基础理论',
  'single',
  '某女，25 岁，经量少，经期后，气乏力，头晕；舌淡、脉虚弱。诊断为月经过少，证属
气血亏虚。治疗选用的中成药是',
  '[{"key": "A", "value": "益母丸"}, {"key": "B", "value": "复方益母草膏"}, {"key": "C", "value": "妇宁康片"}, {"key": "D", "value": "调经活血片"}, {"key": "E", "value": "十二乌鸡白凤丸"}]'::json,
  'E',
  '气血亏虚选用十二乌鸡白凤丸。',
  1,
  ARRAY['选用'],
  '历年真题',
  2024,
  true
);


-- 📝 第28题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'single',
  '根据《中国药典》收载的毒性药材和饮片内容，含毒性饮片的中成药是',
  '[{"key": "A", "value": "胃肠安丸"}, {"key": "B", "value": "胃疡灵颗粒"}, {"key": "C", "value": "养胃颗粒"}, {"key": "D", "value": "胃安胶囊"}, {"key": "E", "value": "舒肝和胃丸"}]'::json,
  'A',
  '胃肠安丸含有毒性中药巴豆霜。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第29题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'single',
  '肝阳上亢头痛的特点是',
  '[{"key": "A", "value": "隐痛"}, {"key": "B", "value": "刺痛"}, {"key": "C", "value": "重痛"}, {"key": "D", "value": "冷痛"}, {"key": "E", "value": "胀痛"}]'::json,
  'E',
  '肝阳上亢头痛的特点是胀痛。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第30题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'single',
  '下列中成药联用，不存在相同毒性成分叠加风险的是',
  '[{"key": "A", "value": "安宫牛黄丸与内消瘰疬丸"}, {"key": "B", "value": "朱砂安神丸与天王补心丸"}, {"key": "C", "value": "血栓心脉宁片与麝香保心丸"}, {"key": "D", "value": "大活络丸与天麻丸"}, {"key": "E", "value": "附子理中丸与温胃舒胶囊"}]'::json,
  'A',
  '安宫牛黄丸含有朱砂，含有汞离子，内消瘰疬丸含有溴碘离子，二者容易形成溴
化汞或者碘化汞，而不是相同毒性成分叠加风险，故正确答案 A.。朱砂安神丸与天王补心
丸都含有汞，毒性叠加。大活络丸与天麻丸都含有附子，毒性叠加。血栓心脉宁片与麝香保
心丸都含有蟾酥，毒性叠加。附子理中丸与温胃舒胶囊都含有附子，毒性叠加。',
  2,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第31题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'single',
  '根据中药七情配伍，相畏的药组是',
  '[{"key": "A", "value": "黄连，黄芩"}, {"key": "B", "value": "黄芩，生姜"}, {"key": "C", "value": "半夏， 生姜"}, {"key": "D", "value": "连翘，金银花"}, {"key": "E", "value": "甘草，海藻"}]'::json,
  'C',
  '半夏畏生姜。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第32题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '病例分析',
  'single',
  '某男，34 岁，外感发热，微恶风寒，鼻塞，流黄浊涕，无汗，头痛，口干，咳嗽，咽喉
疼痛；舌红苔薄黄，脉浮数。宜选用的中成药是',
  '[{"key": "A", "value": "败毒散"}, {"key": "B", "value": "银翘解毒丸"}, {"key": "C", "value": "通宣理肺丸"}, {"key": "D", "value": "感冒软胶囊"}, {"key": "E", "value": "参苏丸"}]'::json,
  'B',
  '辨证风热感冒，选用银翘解毒丸。',
  1,
  ARRAY['辨证', '选用'],
  '历年真题',
  2024,
  true
);


-- 📝 第33题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'single',
  '马钱子中毒表现不包括',
  '[{"key": "A", "value": "烦躁不安、面部肌肉紧张、吞咽困难"}, {"key": "B", "value": "惊厥、痉挛"}, {"key": "C", "value": "角弓反张"}, {"key": "D", "value": "呼吸肌痉挛窒息"}, {"key": "E", "value": "心电图显示房室传导阻滞等"}]'::json,
  'E',
  '心电图显示房室传导阻滞是蟾酥中毒的表现。故答案 E',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第34题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '用药指导',
  'single',
  '根据《中国药典》规定特殊调剂，用法，煎法错误的是',
  '[{"key": "A", "value": "珍珠母用时捣碎，先煎 1 小时以上"}, {"key": "B", "value": "水牛角洗净镑片，先煎 3 小时以上"}, {"key": "C", "value": "两面针不可过量服用，忌与酸性食物同服"}, {"key": "D", "value": "洋金花宜入丸散，也可卷烟分次燃吸"}, {"key": "E", "value": "轻粉可入丸剂或装胶囊服，服后漱口"}]'::json,
  'A',
  '珍珠母质地坚硬，有效成分不易煎出，应打碎先煎 15 分钟，故 A 说法错误。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第35题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '用药指导',
  'single',
  '与中药合理用药基本原则不符的是',
  '[{"key": "A", "value": "风寒湿痹患者用适量黄酒送服大活络丸"}, {"key": "B", "value": "湿热泄泻患者同时服用肠康片、泻痢消胶囊和香连片"}, {"key": "C", "value": "乳汁不通患者处方中用王不留行替代穿山甲"}, {"key": "D", "value": "久病体虚患者空腹服用滋补类中药"}, {"key": "E", "value": "服用含黄药子的制剂的患者定期监测肝功能"}]'::json,
  'B',
  '湿热泄泻患者同时服用肠康片、泻痢消胶囊和香连片，属于重复用药。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第36题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '病例分析',
  'single',
  '患者肌肤不仁，手足麻木，突然发生口眼歪斜语言不利，口角流涎，舌强语謇，半身不
遂，证属风痰入络，应选用',
  '[{"key": "A", "value": "再造丸"}, {"key": "B", "value": "全天麻胶囊"}, {"key": "C", "value": "脑安颗粒"}, {"key": "D", "value": "复方地龙胶囊"}, {"key": "E", "value": "越婢加术汤"}]'::json,
  'A',
  '风痰入络选用再造丸。',
  1,
  ARRAY['选用'],
  '历年真题',
  2024,
  true
);


-- 📝 第37题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'single',
  '因治疗需要，医师会应用不同术语，中药饮片的产地、炮制、质量等特殊要求在处方以
注明。下列说法正确的是',
  '[{"key": "A", "value": "为标明药材颜色，处方金毛狗脊"}, {"key": "B", "value": "为标明药材采收季节，处方紫丹参"}, {"key": "C", "value": "为标明药材产地，处方绵茵陈"}, {"key": "D", "value": "为标明药材品质，广藿香"}, {"key": "E", "value": "为标明药材修治，处方山萸肉"}]'::json,
  'E',
  'A 金毛狗脊，属于药材品质类；B 紫丹参，为药材颜色；C 绵茵陈，为药材采收
季节；D 广藿香，为药材产地；E 山萸肉，为药材药材修治，即山茱萸去核后为山萸肉。故
正确答案 E',
  2,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📝 第38题 (single)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '病例分析',
  'single',
  '某女，56 岁。患高血脂，服用辛伐他汀。又因颈椎、腰椎疼痛服用仙灵骨葆胶囊，每日
2
次，每次 3 粒，一段时间后出现眼黄、尿黄、乏力、纳差。查肝生化指标:总胆红素
(STB)63umol/L，谷氨酸氨基转移酶(ALT)832U/L、门冬氨酸氨基转移酶(AST)744U/L；查肝炎
病毒学、自身免疫性肝炎指标，均呈阴性。该不良反应与仙灵骨葆胶囊的关联性评价为',
  '[{"key": "A", "value": "肯定"}, {"key": "B", "value": "很可能"}, {"key": "C", "value": "可能"}, {"key": "D", "value": "无法评价"}, {"key": "E", "value": "待评价"}]'::json,
  'C',
  '用药与不良反应发生关系密切，但是引发不良反应的药品不止一种，所以关联性
评价是可能。
二、配伍选择题


 
【41-43】
A.番泻叶
B.瓦楞子
C.僵蚕
D.补骨脂
E.蜈蚣',
  3,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 🔗 第39题 (match)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'match',
  '处方直接写药名，需调配煅制的是',
  '[{"key": "A", "value": "吲哚美辛"}, {"key": "B", "value": "马来酸氯苯那敏"}, {"key": "C", "value": "水杨酸甲酯"}, {"key": "D", "value": "盐酸麻黄碱"}]'::json,
  'C',
  '处方直接写药名，需调配麸炒的是僵蚕；处方直接写药名，需调配盐炙的是补骨
脂；处方直接写药名，需调配煅制的是瓦楞子。
【44-46】
A.吲哚美辛
B.马来酸氯苯那敏
C.水杨酸甲酯
D.盐酸麻黄碱
E.格列本脲',
  2,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 🔗 第40题 (match)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'match',
  '新癀片中的西药成分是',
  '[{"key": "A", "value": "淡白舌"}, {"key": "B", "value": "淡红舌"}, {"key": "C", "value": "红舌"}, {"key": "D", "value": "绛舌"}, {"key": "E", "value": "紫舌\n4\n4\n4"}]'::json,
  'B',
  '咳特灵片中的西药成分是马来酸氯苯那敏；消渴丸中的西药成分是格列本脲；新
癀片中的西药成分是吲哚美辛。
【47-49】
A.淡白舌
B.淡红舌
C.红舌
D.绛舌
E.紫舌
4
4
4',
  2,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 🔗 第41题 (match)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '方剂应用',
  'match',
  '月经过少血瘀证，宜选用的基础方剂是',
  '[{"key": "A", "value": "鱼腥草"}, {"key": "B", "value": "苦杏仁"}, {"key": "C", "value": "石膏"}, {"key": "D", "value": "旋覆花"}]'::json,
  'E',
  '月经过多气虚证，宜选用的基础方剂是举元煎；月经先期肝郁血热证，宜选用的
基础方剂是丹栀逍遥丸；月经过少血瘀证，宜选用的基础方剂是桃红四物汤。
【53-55】
A.鱼腥草
B.苦杏仁
C.石膏
D.旋覆花
E.车前子',
  2,
  ARRAY['选用', '方剂'],
  '历年真题',
  2024,
  true
);


-- 🔗 第42题 (match)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'match',
  '有效成分是黏液质，需要包煎的是',
  '[{"key": "A", "value": "气郁发热"}, {"key": "B", "value": "气虚发热"}, {"key": "C", "value": "湿温潮热"}, {"key": "D", "value": "血瘀发热"}]'::json,
  'A',
  '含挥发油成分校多，要后下的是鱼腥草；有效成分不易煎出，要先煎的是石膏；
有效成分是黏液质，需要包煎的是车前子。
【56-57】
A.气郁发热
B.气虚发热
C.湿温潮热
D.血瘀发热
E.阳明潮热',
  2,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 🔗 第43题 (match)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'match',
  '午后热甚，身热不扬，困倦乏力，其临床意义是',
  '[{"key": "A", "value": "和络舒肝胶囊"}, {"key": "B", "value": "复方益肝灵片"}, {"key": "C", "value": "元胡止痛片"}, {"key": "D", "value": "利胆片"}, {"key": "E", "value": "舒肝止痛丸\n5"}]'::json,
  'B',
  '长期低热，乏力懒言，劳倦则甚，其临床意义是气虚发热；午后热甚，:身热不
扬，困倦乏力，其临床意义是湿温潮热。
【58-59】
A.和络舒肝胶囊
B.复方益肝灵片
C.元胡止痛片
D.利胆片
E.舒肝止痛丸
5',
  2,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 🔗 第44题 (match)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'match',
  '肝功能不全者慎用的中药是',
  '[{"key": "A", "value": "气虚"}, {"key": "B", "value": "阴虚"}, {"key": "C", "value": "津亏"}, {"key": "D", "value": "血瘀"}]'::json,
  'D',
  '肾功能不全者慎用的中药是天仙藤。肝功能不全者慎用的中药是千里光。
【62-63】
A.气虚
B.阴虚
C.津亏
D.血瘀
E.血虚',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 🔗 第45题 (match)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '病例分析',
  'match',
  '面色不华，爪甲色淡，头目眩晕，心悸怔忡神疲乏力，舌淡，脉细。其病机是',
  '[{"key": "A", "value": "四神丸"}, {"key": "B", "value": "痛泻要方"}, {"key": "C", "value": "藿香正气散"}, {"key": "D", "value": "芍药汤"}]'::json,
  'B',
  '其一，五心烦热，骨蒸潮热，红少苔，脉细数，辨证为阴虚。其二，面色不华，
爪甲色淡，辨证为血虚。
【64-65】
A.四神丸
B.痛泻要方
C.藿香正气散
D.芍药汤
E.葛根芩连汤',
  2,
  ARRAY['辨证'],
  '历年真题',
  2024,
  true
);


-- 🔗 第46题 (match)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '方剂应用',
  'match',
  '治疗泄泻肾阳虚衰证，宜选用的基础方剂是',
  '[{"key": "A", "value": "生姜"}, {"key": "B", "value": "生姜皮"}, {"key": "C", "value": "干姜"}, {"key": "D", "value": "干姜炭"}, {"key": "E", "value": "炮姜\n\n\n \n6\n6\n6"}]'::json,
  'C',
  '治疗泄泻寒湿内盛证，宜选用的基础方剂是藿香正气散。治疗泄泻肾阳虚衰证，
宜选用的基础方剂是四神丸。
【66-68】
A.生姜
B.生姜皮
C.干姜
D.干姜炭
E.炮姜


 
6
6
6',
  2,
  ARRAY['选用', '方剂'],
  '历年真题',
  2024,
  true
);


-- 🔗 第47题 (match)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'match',
  '湿热壅盛对应的症状是',
  '[{"key": "A", "value": "第一级"}, {"key": "B", "value": "第二级"}, {"key": "C", "value": "第三级"}, {"key": "D", "value": "第四级"}, {"key": "E", "value": "第五级\n根据美国安全用药研究所(ISPM)6 个层级实施用药错误防范策略，其有效性由强到弱。\n7"}]'::json,
  'B',
  '风水相搏对应的症状是眼睑浮肿，伴恶寒发热，肢节酸楚；湿热壅盛对应的症状
是遍体浮肿，皮肤绷急光亮，小便短赤。
【71-73】
A.第一级
B.第二级
C.第三级
D.第四级
E.第五级
根据美国安全用药研究所(ISPM)6 个层级实施用药错误防范策略，其有效性由强到弱。
7',
  2,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 🔗 第48题 (match)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '用药指导',
  'match',
  '具有生殖毒性，过量服用导致男性精子产生和成熟发生障碍，抑制卵巢功能的是',
  '[{"key": "A", "value": "面"}, {"key": "B", "value": "爪"}, {"key": "C", "value": "毛"}, {"key": "D", "value": "发"}, {"key": "E", "value": "唇\n7\n8\n8"}]'::json,
  'A',
  '蓖麻子过量服用导致四肢麻木，步态不稳，手舞足蹈，烦躁不安，精神错乱。胆
矾过量服用导致恶心呕吐，腹痛，腹泻，粪便蓝绿色，有特殊金属味。雷公藤具有生殖毒性，
过量服用导致男性精子产生和成熟发生障碍，抑制卵巢功能。
【79-81】
A.面
B.爪
C.毛
D.发
E.唇
7
8
8',
  2,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 🔗 第49题 (match)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'match',
  '喘证风寒闭肺证的临床特点是',
  '[{"key": "A", "value": "疏风清热汤"}, {"key": "B", "value": "清咽利膈汤"}, {"key": "C", "value": "养阴清肺汤"}, {"key": "D", "value": "益气聪明汤"}, {"key": "E", "value": "龙胆泻肝汤\n8"}]'::json,
  'A',
  '喘证痰浊阻肺证的临床特点是喘满胸闷，痰多白黏，呕恶口黏。喘证风寒闭肺证


 
的临床特点是喘咳气逆，痰白稀薄，恶寒无汗。
【84-85】
A.疏风清热汤
B.清咽利膈汤
C.养阴清肺汤
D.益气聪明汤
E.龙胆泻肝汤
8',
  2,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 🔗 第50题 (match)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '中医基础理论',
  'match',
  '体现阴阳“消长"关系的是',
  '[{"key": "A", "value": "扶正祛邪"}, {"key": "B", "value": "标本缓急"}, {"key": "C", "value": "调整阴阳"}, {"key": "D", "value": "调和脏腑"}]'::json,
  'B',
  '气能生血，血能生气体现阴阳“互用”关系。阴盛则阳病，阳盛则阴病体现阴阳
“消长"关系。
【88-90】
A.扶正祛邪
B.标本缓急
C.调整阴阳
D.调和脏腑
E.三因制宜',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📋 第51题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'comprehensive',
  '四诊合参，辨析其证候是',
  '[{"key": "A", "value": "胃肠湿热证"}, {"key": "B", "value": "风伤肠络证"}, {"key": "C", "value": "脾虚气陷证"}, {"key": "D", "value": "湿热下注证"}, {"key": "E", "value": "气滞血瘀证"}]'::json,
  'C',
  '纳少便溏定位到脾，少气懒言，脉弱，属于气虚，辨证为脾虚气陷证。',
  1,
  ARRAY['辨证'],
  '历年真题',
  2024,
  true
);


-- 📋 第52题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '方剂应用',
  'comprehensive',
  '宜选用的基础方剂是',
  '[{"key": "A", "value": "凉血地黄汤"}, {"key": "B", "value": "止痛如神汤"}, {"key": "C", "value": "补中益气汤"}, {"key": "D", "value": "脏连丸"}, {"key": "E", "value": "银翘散"}]'::json,
  'C',
  '脾虚气陷证选用补中益气汤。
案例：（二）某女，49 岁。腹部积块明显，质地较硬，固定不移，隐痛，形体消瘦，纳谷减
少。舌质紫，脉细涩。',
  1,
  ARRAY['选用'],
  '历年真题',
  2024,
  true
);


-- 📋 第53题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'comprehensive',
  '四诊合参，辨析其证候是',
  '[{"key": "A", "value": "正虚邪结证"}, {"key": "B", "value": "瘀血内结证"}, {"key": "C", "value": "气滞血阻证"}, {"key": "D", "value": "肝气郁结证"}, {"key": "E", "value": "肝胆湿热证"}]'::json,
  'B',
  '积块固定不移，舌质紫，脉细涩，辨证为瘀血内结证。',
  1,
  ARRAY['辨证'],
  '历年真题',
  2024,
  true
);


-- 📋 第54题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'comprehensive',
  '宜选用的治法是',
  '[{"key": "A", "value": "疏肝解郁，行气散结"}, {"key": "B", "value": "理气消积，活血散瘀"}, {"key": "C", "value": "祛瘀软坚，扶正健脾"}, {"key": "D", "value": "补益气血，活血化瘀"}, {"key": "E", "value": "清热除湿，散瘀止痛"}]'::json,
  'C',
  '瘀血兼有纳谷减少，宜选用的治法是，祛瘀软坚，扶正健脾。',
  1,
  ARRAY['选用', '治法'],
  '历年真题',
  2024,
  true
);


-- 📋 第55题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '方剂应用',
  'comprehensive',
  '宜选用的基础方剂是',
  '[{"key": "A", "value": "逍遥散合木香顺气散加减"}, {"key": "B", "value": "龙胆泻肝汤加减"}, {"key": "C", "value": "柴胡疏肝散合失笑散加减"}, {"key": "D", "value": "膈下逐瘀汤合六君子汤加减"}, {"key": "E", "value": "八珍汤合化积丸加减"}]'::json,
  'D',
  '瘀血宜选用的基础方剂是膈下逐瘀汤合六君子汤加减。',
  1,
  ARRAY['选用', '方剂'],
  '历年真题',
  2024,
  true
);


-- 📋 第56题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'comprehensive',
  '宜选用的中成药是',
  '[{"key": "A", "value": "龙胆泻肝丸"}, {"key": "B", "value": "肝脾康胶囊"}, {"key": "C", "value": "慢肝养阴胶囊"}, {"key": "D", "value": "和络舒肝胶囊"}, {"key": "E", "value": "化癥回生片"}]'::json,
  'E',
  '瘀血宜选用的中成药是化癥回生片。
案例：（三）某男，65 岁，因咳嗽、气喘多年，加重 10 天就诊，症见咳嗽，喘急，口渴，
尿赤，大便干结:苔黄腻，脉滑数。诊断为肺胀。',
  1,
  ARRAY['选用'],
  '历年真题',
  2024,
  true
);


-- 📋 第57题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'comprehensive',
  '四诊合参，辨析其证候是',
  '[{"key": "A", "value": "痰热郁肺"}, {"key": "B", "value": "肺肾气虚"}, {"key": "C", "value": "痰浊阻肺"}, {"key": "D", "value": "风寒袭肺"}, {"key": "E", "value": "风热犯肺"}]'::json,
  'A',
  '苔黄腻，脉滑数，辨证为痰热郁肺。',
  1,
  ARRAY['辨证'],
  '历年真题',
  2024,
  true
);


-- 📋 第58题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'comprehensive',
  '宜选用的治法是',
  '[{"key": "A", "value": "疏风散寒，宣肺理气"}, {"key": "B", "value": "疏风清热，宣肺理气"}, {"key": "C", "value": "清肺化痰，降逆平喘"}, {"key": "D", "value": "补肺摄纳，降气平喘"}, {"key": "E", "value": "化痰降气，健脾益肺"}]'::json,
  'C',
  '痰热郁肺宜选用的治法是清肺化痰，降逆平喘。',
  1,
  ARRAY['选用', '治法'],
  '历年真题',
  2024,
  true
);


-- 📋 第59题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '方剂应用',
  'comprehensive',
  '宜选用的基础方剂是',
  '[{"key": "A", "value": "平喘固本汤"}, {"key": "B", "value": "苏子降气汤"}, {"key": "C", "value": "越婢加半夏汤"}, {"key": "D", "value": "桑菊饮"}, {"key": "E", "value": "麻黄汤"}]'::json,
  'C',
  '痰热郁肺宜选用的基础方剂是越婢加半夏汤 。',
  1,
  ARRAY['选用', '方剂'],
  '历年真题',
  2024,
  true
);


-- 📋 第60题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'comprehensive',
  '宜选用的中成药是',
  '[{"key": "A", "value": "理气定喘丸"}, {"key": "B", "value": "小青龙胶囊"}, {"key": "C", "value": "桂龙咳喘宁胶囊"}, {"key": "D", "value": "百令胶囊"}, {"key": "E", "value": "清肺消炎丸，"}]'::json,
  'E',
  '痰热郁肺宜宜选用的中成药是清肺消炎丸，。
案例：（四）某男，63 岁，小便点滴不爽，排出无力，尿量减少。舌淡胖苔白，脉沉细，中
医诊断癃闭，症属肾阳衰惫。',
  1,
  ARRAY['选用'],
  '历年真题',
  2024,
  true
);


-- 📋 第61题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'comprehensive',
  '为明确西医诊断，应选择的检验指标是',
  '[{"key": "A", "value": "血清肌钙蛋白 1"}, {"key": "B", "value": "血清高密度脂蛋白胆固醇"}, {"key": "C", "value": "血肌酐"}, {"key": "D", "value": "血淀粉酶"}, {"key": "E", "value": "血清碱性磷酸酶"}]'::json,
  'C',
  '癃闭对应西医学的尿潴留，无尿症等，需要检查肾的功能，因此应选择的检验指
标血肌酐。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📋 第62题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '方剂应用',
  'comprehensive',
  '根据辨证结果，宜选用的基础方剂是',
  '[{"key": "A", "value": "代抵当汤"}, {"key": "B", "value": "八正散"}, {"key": "C", "value": "济生肾气丸"}, {"key": "D", "value": "疏凿饮子"}, {"key": "E", "value": "越婢加术汤"}]'::json,
  'C',
  '肾阳衰惫选用济生肾气丸。
案例：（五）某男，57 岁，患痹证 6 年余，四肢麻痹，活动艰难，遇寒加重，恶风畏寒，舌
暗淡苔白，脉紧。近日一直服用舒筋丸。昨日不慎跌倒，腿部软组织损伤，伤处青红紫斑，
肿胀疼痛。患者拟加服九分散。',
  2,
  ARRAY['选用'],
  '历年真题',
  2024,
  true
);


-- 📋 第63题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '方剂应用',
  'comprehensive',
  '执业药师指出，舒筋丸与九分散含有相同毒性中药饮片不宜联用。该饮片是',
  '[{"key": "A", "value": "草乌"}, {"key": "B", "value": "雪上一枝蒿"}, {"key": "C", "value": "草乌"}, {"key": "D", "value": "雄黄"}, {"key": "E", "value": "马钱子粉"}]'::json,
  'E',
  '舒筋丸与九分散都含有毒性中药马钱子。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📋 第64题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'comprehensive',
  '患者属于',
  '[{"key": "A", "value": "瘀血头痛"}, {"key": "B", "value": "血虚头痛"}, {"key": "C", "value": "肝阳头痛"}, {"key": "D", "value": "风寒头痛"}, {"key": "E", "value": "风热头痛"}]'::json,
  'A',
  '头部外伤史，痛处固定不移，舌紫暗，有瘀斑，辨证属于瘀血头痛。',
  1,
  ARRAY['辨证'],
  '历年真题',
  2024,
  true
);


-- 📋 第65题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'comprehensive',
  '应选用的治法为',
  '[{"key": "A", "value": "养血滋阴，和络止痛"}, {"key": "B", "value": "活血化瘀，通窍止痛"}, {"key": "C", "value": "平肝潜阳"}, {"key": "D", "value": "疏风清热和络"}, {"key": "E", "value": "疏风散寒止痛"}]'::json,
  'B',
  '瘀血头痛应选用的治法为活血化瘀，通窍止痛。',
  1,
  ARRAY['选用', '治法'],
  '历年真题',
  2024,
  true
);


-- 📋 第66题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '方剂应用',
  'comprehensive',
  '宜选用的基础方剂是',
  '[{"key": "A", "value": "芎芷石膏汤"}, {"key": "B", "value": "川芎茶调散"}, {"key": "C", "value": "加味四物汤"}, {"key": "D", "value": "天麻钩藤饮"}, {"key": "E", "value": "通窍活血汤"}]'::json,
  'E',
  '瘀血头痛宜选用的基础方剂是通窍活血汤。
案例：（七）某女，55 岁，平素手足麻木，肌肤不仁，日前突发口眼歪斜，口角流涎，舌强
语謇，半身不遂，手足拘挛、关节酸痛:舌苔薄白，脉浮数。血液生化指标检验结果显示:肌
酸激酶活性 300U/L，肌酸激酶同工酶 CK-BB 活性升高。诊断为中风，证属风痰入络。处方


 
如下:法半夏 9g、制白附子 6g、天南星 9g、天麻 9g、制川乌 3g、全蝎 6g、木香 6g、枳壳
9g7 剂、水煎服，每日 1 剂，早晚分服。',
  3,
  ARRAY['选用', '方剂'],
  '历年真题',
  2024,
  true
);


-- 📋 第67题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'comprehensive',
  '关于执业药师调剂时的操作，错误的是',
  '[{"key": "A", "value": "全蝎超量，提醒医师再次确认"}, {"key": "B", "value": "制川乌应单包先煎"}, {"key": "C", "value": "枳壳应付麸炒枳壳"}, {"key": "D", "value": "法半夏与制川乌存在“十八反”禁忌应再次确认"}, {"key": "E", "value": "天南星应付制天南星"}]'::json,
  'A',
  '全蝎用量 3-6g，没有超量。故 A 说法错误。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📋 第68题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'comprehensive',
  '肌酸激酶同工酶 CK-BB 活性升高的临床意义',
  '[{"key": "A", "value": "肾病综合征"}, {"key": "B", "value": "代谢综合征"}, {"key": "C", "value": "胰腺炎"}, {"key": "D", "value": "细菌感染"}, {"key": "E", "value": "急性脑血管疾病"}]'::json,
  'E',
  '肌酸激酶同工酶 CK-BB 活性升高，代表神经系统疾病，如脑血管意外，急性颅脑
损伤等。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- 📋 第69题 (comprehensive)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'comprehensive',
  '经治疗后中风症状缓解，欲改服中成药继续治疗，根据中医辨证，宜选用的中成药是',
  '[{"key": "A", "value": "再造丸"}, {"key": "B", "value": "全天麻胶囊"}, {"key": "C", "value": "消栓胶囊"}, {"key": "D", "value": "复方地龙胶囊"}, {"key": "E", "value": "心脑静片"}]'::json,
  'A',
  '风痰入络选用再造丸。
四、多项选择题',
  1,
  ARRAY['选用'],
  '历年真题',
  2024,
  true
);


-- ✅ 第70题 (multiple)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '中医基础理论',
  'multiple',
  '关于五行与情志的关系，正确的有（多选）',
  '[{"key": "A", "value": "脾在志为思"}, {"key": "B", "value": "肝在志为恐"}, {"key": "C", "value": "肺在志为悲"}, {"key": "D", "value": "心在志为喜"}, {"key": "E", "value": "肾在志为怒"}]'::json,
  'ACD',
  '肝在志为怒；肾在志为恐，BE 说法错误。正确答案选择 ACD.',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- ✅ 第71题 (multiple)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '用药指导',
  'multiple',
  '.执业药师对患者用药指导时，关于服药时间的说法，正确的有（多选）',
  '[{"key": "A", "value": "补益药宜饭前服用"}, {"key": "B", "value": "制酸药宜饭后服用"}, {"key": "C", "value": "峻下逐水药宜空腹服用"}, {"key": "D", "value": "健胃消食药宜饭后服用"}, {"key": "E", "value": "活血化瘀药宜空腹服用"}]'::json,
  'ACDE',
  '制酸药宜饭前服用，所以 B 的说法错误。正确答案 ACDE',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- ✅ 第72题 (multiple)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'multiple',
  '治疗粉刺胃肠湿热证，宜选用的中成药有（多选）',
  '[{"key": "A", "value": "防风通圣丸"}, {"key": "B", "value": "当归苦参丸"}, {"key": "C", "value": "消痤丸"}, {"key": "D", "value": "金花消痤丸"}, {"key": "E", "value": "清热暗疮片"}]'::json,
  'CDE',
  '治疗粉刺胃肠湿热证，宜选用的中成药有消痤丸，金花消痤丸，清热暗疮片。',
  1,
  ARRAY['选用'],
  '历年真题',
  2024,
  true
);


-- ✅ 第73题 (multiple)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'multiple',
  '下列中成药的联用应用，合理的有（多选）',
  '[{"key": "A", "value": "附子理中丸与黄连上清丸联用治疗脾胃虚寒所致的胃脘疼痛"}, {"key": "B", "value": "二陈丸与平胃散联用治疗联用治疗湿痰咳"}, {"key": "C", "value": "乌鸡白凤丸与香砂六君丸联用治疗妇女气血不足、月经失调"}, {"key": "D", "value": "脑立清胶囊与六味地黄丸联用治疗肝肾阴虚风阳上扰所致的高血压"}, {"key": "E", "value": "六神丸内服与冰硼散吹喉联用治疗咽喉肿痛"}]'::json,
  'BCDE',
  'A 附子理中丸温热助阳，黄连上清丸清热，两者属于证候禁忌，不适宜联用。',
  1,
  ARRAY['证候'],
  '历年真题',
  2024,
  true
);


-- ✅ 第74题 (multiple)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '痹证辨治',
  'multiple',
  '某女，30 岁。恶寒重，发热轻，无汗头痛肢体酸痛，咽痒，咳嗽。舌苔薄白，脉浮紧。
治疗宜选用的中成药有（多选）',
  '[{"key": "A", "value": "荆防颗粒"}, {"key": "B", "value": "葛根汤颗粒"}, {"key": "C", "value": "参苏丸"}, {"key": "D", "value": "连花清瘟胶囊"}, {"key": "E", "value": "银翘解毒丸"}]'::json,
  'AB',
  '辨证为风寒感冒，选用荆防颗粒，葛根汤颗粒。',
  1,
  ARRAY['辨证', '选用'],
  '历年真题',
  2024,
  true
);


-- ✅ 第75题 (multiple)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '中医基础理论',
  'multiple',
  '补法，又称“补益法”，是用补益药物补养人体气血阴阳不足、改善衰弱状态，治疗各
种虚证的治法。关于补法临床应用说法正确的有（多选）',
  '[{"key": "A", "value": "补法必须因人因地、因时、因病、因证而异"}, {"key": "B", "value": "邪气有余而正气不虚者，不可妄补"}, {"key": "C", "value": "邪实正虚而以邪气偏盛者，应慎用补法，以免“闭门留寇''"}, {"key": "D", "value": "虚实夹杂的病证，往往使用补法与祛邪各法配合使用"}, {"key": "E", "value": "“大实有羸状”的真实假虚证，不宜使用补法"}]'::json,
  'ABCDE',
  '补法必须因人因地、因时、因病、因证而异。邪气有余而正气不虚者，不可妄补。
邪实正虚而以邪气偏盛者，应慎用补法，以免“闭门留寇''。虚实夹杂的病证，往往使用补
法与祛邪各法配合使用，“大实有羸状”的真实假虚证，不宜使用补法。',
  2,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- ✅ 第76题 (multiple)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '病例分析',
  'multiple',
  '某男，55 岁。小便浑浊如米泔水，诊为淋证，证属膏淋，治疗宜选用的中成药有（多选）',
  '[{"key": "A", "value": "萆薢分清丸"}, {"key": "B", "value": "前列泰片"}, {"key": "C", "value": "八正胶囊"}, {"key": "D", "value": "复方金钱草颗粒"}, {"key": "E", "value": "复肾宁片"}]'::json,
  'AB',
  '膏淋选用萆薢分清丸，前列泰片。',
  1,
  ARRAY['选用'],
  '历年真题',
  2024,
  true
);


-- ✅ 第77题 (multiple)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '用药指导',
  'multiple',
  '执业药师提供以患者为中心，以合理用药为核心的中药药学服务时，应具备的基本技能
有（多选）',
  '[{"key": "A", "value": "提供药学服务"}, {"key": "B", "value": "阅读医疗文书"}, {"key": "C", "value": "提供健康宣教"}, {"key": "D", "value": "设计用药方案"}, {"key": "E", "value": "中药处方审核"}]'::json,
  'ABCDE',
  '执业药师应具备的基本技能有提供药学服务，阅读医疗文书，提供健康宣教，设
计用药方案，中药处方审核等。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- ✅ 第78题 (multiple)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'multiple',
  '《中国药典》收载的毒性药材和饮片中，标注为大毒的有（多选）',
  '[{"key": "A", "value": "罂粟壳"}, {"key": "B", "value": "闹羊花"}, {"key": "C", "value": "巴豆霜"}, {"key": "D", "value": "天仙子"}, {"key": "E", "value": "洋金花"}]'::json,
  'BCD',
  '闹羊花，巴豆霜，天仙子有大毒。',
  1,
  ARRAY['综合知识'],
  '历年真题',
  2024,
  true
);


-- ✅ 第79题 (multiple)
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  'multiple',
  '治疗带下过多湿热下注证，宜选用的中成药有（多选）',
  '[{"key": "A", "value": "金樱子膏"}, {"key": "B", "value": "宫炎平片"}, {"key": "C", "value": "妇炎康片"}, {"key": "D", "value": "妇炎净胶囊"}, {"key": "E", "value": "盆炎净颗粒"}]'::json,
  'BCDE',
  '治疗带下过多湿热下注证，宜选用的中成药有宫炎平片，妇炎康片， 妇炎净胶
囊，盆炎净颗粒。',
  1,
  ARRAY['选用'],
  '历年真题',
  2024,
  true
);


-- ================================================================
-- 步骤3：验证导入结果
-- ================================================================

-- 检查题型分布
SELECT 
  question_type as "题型",
  COUNT(*) as "数量"
FROM questions 
WHERE exam_type = '执业药师' 
  AND subject = '中药学综合知识与技能' 
  AND source_year = 2024
GROUP BY question_type
ORDER BY 
  CASE question_type
    WHEN 'single' THEN 1
    WHEN 'match' THEN 2
    WHEN 'comprehensive' THEN 3
    WHEN 'multiple' THEN 4
  END;

-- 检查总数
SELECT 
  COUNT(*) as "总题目数",
  120 as "预期数量",
  CASE 
    WHEN COUNT(*) = 120 THEN '✅ 正确'
    ELSE '⚠️ 数量不符'
  END as "状态"
FROM questions 
WHERE exam_type = '执业药师' 
  AND subject = '中药学综合知识与技能' 
  AND source_year = 2024;
