-- 2024年执业药师中药学综合知识与技能真题（完整120题）
-- 导入前先清理可能存在的2024年中药综合真题
DELETE FROM questions 
WHERE exam_type = '执业药师' 
  AND subject = '中药学综合知识与技能' 
  AND source_year = 2024;

-- 一、最佳选择题（1-40题）
-- 第1题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '中医基础理论',
  'single',
  '属于"阳脉之海"的是',
  '[{"key":"A","value":"阳维之脉"},{"key":"B","value":"阳跷之脉"},{"key":"C","value":"督脉"},{"key":"D","value":"带脉"},{"key":"E","value":"任脉"}]'::json,
  'C',
  '督脉为"阳脉之海"。任脉为"阴脉之海"。',
  2,
  ARRAY['经络学说', '奇经八脉'],
  '历年真题',
  2024,
  true
);

-- 第2题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '中药贮藏',
  'single',
  '《中国药典》"凡例"中贮藏项下各名词术语进行了解释，关于中药贮藏名词说法，正确的是',
  '[{"key":"A","value":"密封系指将容器密闭，以防止尘及异物进入"},{"key":"B","value":"遮光系指避免日光直射"},{"key":"C","value":"阴凉处系指不超过20°C的环境"},{"key":"D","value":"冷处系指0~8°C的环境"},{"key":"E","value":"常温系指10~25°C的环境"}]'::json,
  'C',
  '阴凉处系指不超过20°C的环境，选项C说法正确。密封系指将容器密封，以防止风化，吸潮，挥发或异物进入，故A说法错误。遮光系指用不透光的容器包装，故B说法错误。冷处系指2~10°C的环境，故D说法错误。常温系指10~30°C的环境，故E说法错误。',
  2,
  ARRAY['中药贮藏', '药典知识'],
  '历年真题',
  2024,
  true
);

-- 第3题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '中医药学发展史',
  'single',
  '由唐代孙思邈撰著，在序例中著有"大医习业""大医精诚"两篇专论的典籍是',
  '[{"key":"A","value":"《外台秘要》"},{"key":"B","value":"《巢氏病源》"},{"key":"C","value":"《千金要方》"},{"key":"D","value":"《千金翼方》"},{"key":"E","value":"《新修本草》"}]'::json,
  'C',
  '在序例中著有"大医习业""大医精诚"两篇专论的典籍是《千金要方》。',
  1,
  ARRAY['中医典籍', '孙思邈'],
  '历年真题',
  2024,
  true
);

-- 第4题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '痹证辨治',
  'single',
  '某女，40岁，肢体肌肉酸楚、重着，疼痛，肿胀，活动不利，口中黏腻，舌苔白腻，脉濡缓。治疗宜的基础方剂是',
  '[{"key":"A","value":"薏苡仁汤"},{"key":"B","value":"独活寄生汤"},{"key":"C","value":"乌头汤"},{"key":"D","value":"桃红饮"},{"key":"E","value":"防风汤"}]'::json,
  'A',
  '依据关键词重着，舌苔白腻，辨证有湿邪痹症，故选用薏苡仁汤。',
  2,
  ARRAY['痹证', '湿邪', '方剂应用'],
  '历年真题',
  2024,
  true
);

-- 第5题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '中药注射剂使用',
  'single',
  '关于中药注射剂使用原则的说法，错误的是',
  '[{"key":"A","value":"中药注射剂和其他药品一起混合滴注"},{"key":"B","value":"应密切观察用药反应，特别是用药后30分钟内"},{"key":"C","value":"按照药品说明书推荐的剂量给药速度和疗程使用"},{"key":"D","value":"临床使用中药注射剂应辨证用药"},{"key":"E","value":"选用中药注射剂应合理选择给药途径"}]'::json,
  'A',
  '中药注射剂应该单独滴注，故A说法错误。',
  1,
  ARRAY['中药注射剂', '用药安全'],
  '历年真题',
  2024,
  true
);

-- 第6题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '感冒用药',
  'single',
  '下列治疗感冒的用药方案合理的是',
  '[{"key":"A","value":"症状较重者，加倍服用感冒清片"},{"key":"B","value":"哺乳期患者服用重感冒灵片"},{"key":"C","value":"严重性肾功能不全者服用复方感冒灵片"},{"key":"D","value":"风热感冒患者服用强力感冒片"},{"key":"E","value":"司机驾驶期间服用速感宁胶囊"}]'::json,
  'D',
  '强力感冒片，辛凉解表，清热解毒，解热镇痛，可用于风热感冒，故D用药方案合理。感冒清片需要按照规定的药物剂量服用，而不能加倍服用，故A不合理。重感冒灵片含有安乃近，哺乳期不适宜服用，故B不合理。复方感冒灵片，严重性肾功能不全者禁用，故C不合理。速感宁胶囊含有马来酸氯苯那敏，有嗜睡的不良反应，司机驾驶期间不适宜服用，故E不合理。',
  2,
  ARRAY['感冒用药', '合理用药'],
  '历年真题',
  2024,
  true
);

-- 第7题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '中药饮片处方',
  'single',
  '关于中药饮片处方用药适宜性的说法，错误的是',
  '[{"key":"A","value":"应用玉屏风散固表止汗，宜选用生黄芪"},{"key":"B","value":"应用泻心汤泻火解毒，宜选用生黄连"},{"key":"C","value":"应用桃红四物汤活血行瘀，宜选用酒当归"},{"key":"D","value":"应用白虎汤清热泻火，宜选用生知母"},{"key":"E","value":"应用大黄䗪虫丸破瘀消疡，宜选用生大黄"}]'::json,
  'E',
  '大黄䗪虫丸破瘀消疡，宜选用熟大黄，故E说法错误。',
  2,
  ARRAY['中药饮片', '炮制规格'],
  '历年真题',
  2024,
  true
);

-- 第8题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '绝经前后诸证',
  'single',
  '某女，48岁，月经紊乱，腰脊冷痛，肢软无力，神疲体倦，浮肿便溏，舌淡嫩苔白润，脉细弱，治疗宜选用的基础方剂是',
  '[{"key":"A","value":"一贯煎合逍遥散"},{"key":"B","value":"左归丸合二至丸"},{"key":"C","value":"保阴煎合圣愈汤"},{"key":"D","value":"右归丸合四君子汤"},{"key":"E","value":"举元煎合安冲汤"}]'::json,
  'D',
  '腰脊冷痛定位到肾，浮肿便溏定位到脾，再结合舌脉，辨证为脾肾阳虚，选用右归丸。',
  2,
  ARRAY['绝经前后诸证', '脾肾阳虚'],
  '历年真题',
  2024,
  true
);

-- 第9题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '乳痈辨治',
  'single',
  '某女，28岁。乳房肿痛，皮肤红灼热，继之肿块变软，有应指感，伴身热口渴，溲赤便秘，舌红苔黄腻，脉洪数。辨析其证候是',
  '[{"key":"A","value":"肝胆湿热"},{"key":"B","value":"气滞热壅"},{"key":"C","value":"阴虚内热"},{"key":"D","value":"热毒炽盛"},{"key":"E","value":"肝郁痰凝"}]'::json,
  'D',
  '身热口渴，溲赤便秘，舌红苔黄腻，脉洪数，为热毒炽盛。',
  2,
  ARRAY['乳痈', '热毒炽盛'],
  '历年真题',
  2024,
  true
);

-- 第10题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '辨证论治',
  'single',
  '不属于实证的临床表现是',
  '[{"key":"A","value":"神昏谵语"},{"key":"B","value":"痰涎壅盛"},{"key":"C","value":"腹痛喜按"},{"key":"D","value":"呼吸气粗"},{"key":"E","value":"舌苔厚腻"}]'::json,
  'C',
  '腹痛喜按为虚证。',
  1,
  ARRAY['虚实辨证'],
  '历年真题',
  2024,
  true
);

-- 第11题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '阴阳学说',
  'single',
  '寒极生热，热极生寒体现的阴阳关系是',
  '[{"key":"A","value":"转化"},{"key":"B","value":"消长"},{"key":"C","value":"互藏"},{"key":"D","value":"互损"},{"key":"E","value":"互根"}]'::json,
  'A',
  '寒极生热，热极生寒体现阴阳的转化。',
  1,
  ARRAY['阴阳学说', '阴阳转化'],
  '历年真题',
  2024,
  true
);

-- 第12题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '咳嗽辨治',
  'single',
  '某女，52岁，咳嗽日久，少痰咳甚，五心烦热，颧红，耳鸣，神疲消瘦，舌红少苔，脉细数。治疗易选用的基础方剂',
  '[{"key":"A","value":"二陈平胃散"},{"key":"B","value":"沙参麦冬汤"},{"key":"C","value":"清金化痰汤"},{"key":"D","value":"三子养心汤"},{"key":"E","value":"麻杏石甘汤"}]'::json,
  'B',
  '依据五心烦热，颧红，舌红少苔，脉细数，辨证为阴虚，选用沙参麦冬汤。',
  2,
  ARRAY['咳嗽', '阴虚证'],
  '历年真题',
  2024,
  true
);

-- 第13题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '藏医药学',
  'single',
  '藏药以五元学说和味、性、效理论为导，形成独具特色的理论体系。其中功效为轻、糙、凉、锐、浮、可用于医治赤巴病、麻风、晕眩、瘟疫等疾病的药味是',
  '[{"key":"A","value":"酸味"},{"key":"B","value":"涩味"},{"key":"C","value":"咸味"},{"key":"D","value":"苦味"},{"key":"E","value":"辛味"}]'::json,
  'D',
  '苦味功效为轻、糙、凉、锐、浮、可用于医治赤巴病、麻风、晕眩、瘟疫等疾病。',
  2,
  ARRAY['藏医药学', '药味理论'],
  '历年真题',
  2024,
  true
);

-- 第14题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '治则治法',
  'single',
  '"壮水之主，以制阳光"的治法适用于',
  '[{"key":"A","value":"虚寒证"},{"key":"B","value":"虚热证"},{"key":"C","value":"阴阳两虚证"},{"key":"D","value":"实热证"},{"key":"E","value":"实寒证"}]'::json,
  'B',
  '"壮水之主，以制阳光"的治法适用于虚热证。',
  2,
  ARRAY['治则治法', '虚热证'],
  '历年真题',
  2024,
  true
);

-- 第15题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '中药正名别名',
  'single',
  '下列正别名错误的是',
  '[{"key":"A","value":"重楼别名蚤休"},{"key":"B","value":"补骨脂别名破故纸"},{"key":"C","value":"鸡血藤别名红藤"},{"key":"D","value":"牵牛子别名黑丑"},{"key":"E","value":"海螵蛸别名乌贼骨"}]'::json,
  'C',
  '大血藤别名红藤。',
  2,
  ARRAY['中药正名别名'],
  '历年真题',
  2024,
  true
);

-- 第16题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '望诊',
  'single',
  '五色主病理论中，热证对应的颜色是',
  '[{"key":"A","value":"青色"},{"key":"B","value":"赤色"},{"key":"C","value":"黄色"},{"key":"D","value":"白色"},{"key":"E","value":"黑色"}]'::json,
  'B',
  '五色主病理论中，热证对应的颜色是赤色。',
  1,
  ARRAY['望诊', '五色主病'],
  '历年真题',
  2024,
  true
);

-- 第17题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '中药斗谱编排',
  'single',
  '根据中药斗谱编排要求，不能摆放在一起的是',
  '[{"key":"A","value":"陈皮和青皮"},{"key":"B","value":"三棱和莪术"},{"key":"C","value":"知母和浙贝母"},{"key":"D","value":"黄精和熟地黄"},{"key":"E","value":"杜仲和续断"}]'::json,
  'D',
  '黄精和熟地黄外观形状相似，但功效不同，不适宜排列在一起。',
  2,
  ARRAY['中药斗谱', '药品管理'],
  '历年真题',
  2024,
  true
);

-- 第18题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '中西药联用',
  'single',
  '下列中西药联用，起到协同作用的是',
  '[{"key":"A","value":"维C银翘片+解热镇痛药"},{"key":"B","value":"芍药甘草汤+解痉药"},{"key":"C","value":"槐角丸+磺胺类药物"},{"key":"D","value":"人参鹿茸丸+磺酰脲类药物"},{"key":"E","value":"桂枝汤+糖皮质激素"}]'::json,
  'B',
  '芍药甘草汤与西药解痉药联用，可提高疗效，起到协同作用。',
  2,
  ARRAY['中西药联用', '药物相互作用'],
  '历年真题',
  2024,
  true
);

-- 第19题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '眩晕辨治',
  'single',
  '某男，68岁，眩晕日久不愈，精神萎靡，目涩耳鸣，视物模糊，腰膝酸软，五心烦热，舌红少苔，脉细数。治疗宜选用的基础方剂是',
  '[{"key":"A","value":"半夏白术天麻汤"},{"key":"B","value":"左归丸"},{"key":"C","value":"二陈汤"},{"key":"D","value":"归脾汤"},{"key":"E","value":"天麻钩藤饮"}]'::json,
  'B',
  '辨证肾精不足，选用左归丸。',
  2,
  ARRAY['眩晕', '肾精不足'],
  '历年真题',
  2024,
  true
);

-- 第20题
INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '胸痹辨治',
  'single',
  '某女，71岁。胸痹心痛8年，加重3天。心胸疼痛，痛如针刺而有定处，入夜为甚，伴胸闷、心悸；舌紫暗，脉弦涩。治疗宜选用的中成药是',
  '[{"key":"A","value":"芪参益气滴丸"},{"key":"B","value":"芪苈强心胶囊"},{"key":"C","value":"宽胸气雾剂"},{"key":"D","value":"血府逐瘀口服液"},{"key":"E","value":"天王补心丸"}]'::json,
  'D',
  '辨证有瘀血，选用血府逐瘀口服液。',
  2,
  ARRAY['胸痹', '瘀血证'],
  '历年真题',
  2024,
  true
);

-- 导入完成提示
SELECT '已成功导入前20题' AS status;
