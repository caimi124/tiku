#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成2024年执业药师中药学综合知识与技能真题SQL导入脚本
"""

import json

# 定义题目数据结构
questions = []

# 第21-40题继续添加
questions_data = [
    # 第21题
    {
        "chapter": "口疮辨治",
        "content": "口疮心脾积热证常以凉膈散为基础方剂加减治疗，关于该方用药指导的说法，错误的是",
        "options": [
            {"key": "A", "value": "方中薄荷宜选用薄荷叶，清头目，利咽喉"},
            {"key": "B", "value": "方中芒硝一般不入煎剂，待汤剂煎得后，溶入汤液中服用"},
            {"key": "C", "value": "方中黄芩宜选用酒黄芩，善清上焦热"},
            {"key": "D", "value": "方中大黄峻烈攻下，脾虚体弱者宜减少用量"},
            {"key": "E", "value": "方中甘草宜选用炙甘草，取其补益之功"}
        ],
        "correct_answer": "E",
        "explanation": "选用生甘草，取其清热解毒之效。",
        "difficulty": 2,
        "knowledge_points": ["口疮", "凉膈散", "用药指导"]
    },
    # 第22题
    {
        "chapter": "血常规检查",
        "content": "某男，28岁，因发热、恶寒，咽痛、咳嗽，血常规检查显示：白细胞计数12.2×10⁹/L，中性粒细胞计数9.5×10⁹/L，白细胞和中性粒细胞均增多，其临床意义是",
        "options": [
            {"key": "A", "value": "放射损伤"},
            {"key": "B", "value": "免疫缺陷"},
            {"key": "C", "value": "细菌感染"},
            {"key": "D", "value": "变态反应"},
            {"key": "E", "value": "病毒感染"}
        ],
        "correct_answer": "C",
        "explanation": "白细胞和中性粒细胞均增多，提示细菌感染。",
        "difficulty": 1,
        "knowledge_points": ["血常规", "细菌感染"]
    },
    # 第23题
    {
        "chapter": "便秘辨治",
        "content": "某女，68岁，大便秘结，脘腹痞满，不思饮食，口唇干燥，面无华，舌红少苔，脉细涩。宜采用的治法",
        "options": [
            {"key": "A", "value": "消食导滞法"},
            {"key": "B", "value": "消痞散积法"},
            {"key": "C", "value": "攻补兼施法"},
            {"key": "D", "value": "调和肠胃法"},
            {"key": "E", "value": "润燥缓下法"}
        ],
        "correct_answer": "E",
        "explanation": "辨证为血虚津枯，肠燥便秘，选用的治法是润燥缓下法。",
        "difficulty": 2,
        "knowledge_points": ["便秘", "血虚津枯"]
    },
    # 第24题
    {
        "chapter": "瘾疹辨治",
        "content": "某女，23岁。周身皮肤多发风团，色鲜红，灼热剧痒，遇热则剧，得冷则减，伴发热，咽喉肿痛，舌苔黄，脉浮数。诊断为瘾疹，其证候是",
        "options": [
            {"key": "A", "value": "血虚风燥"},
            {"key": "B", "value": "胃肠湿热"},
            {"key": "C", "value": "风热犯表"},
            {"key": "D", "value": "湿浊瘀滞"},
            {"key": "E", "value": "风寒束表"}
        ],
        "correct_answer": "C",
        "explanation": "脉浮数，辨证为风热犯表。",
        "difficulty": 2,
        "knowledge_points": ["瘾疹", "风热证"]
    },
    # 第25题
    {
        "chapter": "五脏功能",
        "content": "具有调畅排精行经生理功能的脏是",
        "options": [
            {"key": "A", "value": "肺"},
            {"key": "B", "value": "肝"},
            {"key": "C", "value": "脾"},
            {"key": "D", "value": "肾"},
            {"key": "E", "value": "心"}
        ],
        "correct_answer": "B",
        "explanation": "肝具有调畅排精行经生理功能。",
        "difficulty": 1,
        "knowledge_points": ["五脏功能", "肝的功能"]
    },
]

# 生成SQL语句
def generate_sql():
    sql_parts = []
    
    # 添加文件头
    sql_parts.append("-- 2024年执业药师中药学综合知识与技能真题（完整120题）")
    sql_parts.append("-- 导入前先清理可能存在的2024年中药综合真题")
    sql_parts.append("DELETE FROM questions")
    sql_parts.append("WHERE exam_type = '执业药师'")
    sql_parts.append("  AND subject = '中药学综合知识与技能'")
    sql_parts.append("  AND source_year = 2024;")
    sql_parts.append("")
    sql_parts.append("-- 一、最佳选择题（1-40题）")
    
    # 生成每道题的INSERT语句
    for idx, q in enumerate(questions_data, start=21):
        sql_parts.append(f"\n-- 第{idx}题")
        
        # 转换选项为JSON格式
        options_json = json.dumps(q['options'], ensure_ascii=False)
        knowledge_points = "ARRAY['" + "','".join(q['knowledge_points']) + "']"
        
        sql = f"""INSERT INTO questions (exam_type, subject, chapter, question_type, content, options, correct_answer, explanation, difficulty, knowledge_points, source_type, source_year, is_published)
VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '{q['chapter']}',
  'single',
  '{q['content']}',
  '{options_json}'::json,
  '{q['correct_answer']}',
  '{q['explanation']}',
  {q['difficulty']},
  {knowledge_points},
  '历年真题',
  2024,
  true
);"""
        sql_parts.append(sql)
    
    return "\n".join(sql_parts)

if __name__ == "__main__":
    sql_content = generate_sql()
    
    # 写入文件
    with open("导入2024年中药综合真题-第21-25题.sql", "w", encoding="utf-8") as f:
        f.write(sql_content)
    
    print("✅ SQL文件生成成功！")
    print(f"📊 已生成 {len(questions_data)} 道题目")
