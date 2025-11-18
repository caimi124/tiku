#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
解析2024年执业药师中药学综合知识与技能真题文本
并生成可执行的TypeScript导入脚本
"""

import re
import json

def parse_questions_from_text(text):
    """
    从文本中解析题目
    """
    questions = []
    
    # 分割题目
    # 正则匹配题目编号（例如：1. 或 41. 等）
    question_pattern = r'^\d+\.'
    lines = text.split('\n')
    
    current_question = None
    collecting_options = False
    collecting_explanation = False
    
    for line in lines:
        line = line.strip()
        
        if not line:
            continue
            
        # 检查是否是新题目的开始
        if re.match(question_pattern, line):
            # 保存上一道题
            if current_question:
                questions.append(current_question)
            
            # 开始新题目
            current_question = {
                'content': line[line.find('.')+1:].strip(),
                'options': [],
                'correct_answer': '',
                'explanation': '',
                'chapter': '待分类',
                'difficulty': 2,
                'knowledge_points': []
            }
            collecting_options = True
            collecting_explanation = False
            
        elif line.startswith(('A.', 'B.', 'C.', 'D.', 'E.')):
            # 选项
            if current_question:
                key = line[0]
                value = line[2:].strip()
                current_question['options'].append({'key': key, 'value': value})
                
        elif line.startswith('正确答案：'):
            # 正确答案
            if current_question:
                current_question['correct_answer'] = line.replace('正确答案：', '').strip()
                collecting_options = False
                
        elif line.startswith('解题思路：'):
            # 解题思路/解析
            if current_question:
                current_question['explanation'] = line.replace('解题思路：', '').strip()
                collecting_explanation = True
        elif collecting_explanation and current_question:
            # 继续收集解析内容
            current_question['explanation'] += ' ' + line
    
    # 保存最后一道题
    if current_question:
        questions.append(current_question)
    
    return questions

def generate_typescript_code(questions):
    """
    生成TypeScript导入代码
    """
    code_lines = []
    
    for i, q in enumerate(questions, 1):
        options_str = json.dumps(q['options'], ensure_ascii=False, indent=8)
        knowledge_points_str = json.dumps(q['knowledge_points'], ensure_ascii=False)
        
        code = f'''
      createQuestion(
        '{q['chapter']}',
        '{q['content']}',
        {options_str},
        '{q['correct_answer']}',
        '{q['explanation']}',
        {q['difficulty']},
        {knowledge_points_str}
      ),'''
        
        code_lines.append(code)
    
    return '\n'.join(code_lines)

# 示例：从您的真题文本生成代码
sample_text = """
1.属于"阳脉之海"的是
A.阳维之脉
B.阳跷之脉
C.督脉
D.带脉
E.任脉
正确答案：C
解题思路：督脉为"阳脉之海"。任脉为"阴脉之海"。
"""

if __name__ == '__main__':
    # 这里可以读取您的真题文件
    # 由于题目内容很长，建议您将完整的真题文本保存到文件中
    print("真题解析工具已创建")
    print("请将您的真题文本保存为 questions_text.txt 文件")
    print("然后修改此脚本以读取该文件并生成导入代码")
    
    # 示例用法
    questions = parse_questions_from_text(sample_text)
    print(f"\n解析到 {len(questions)} 道题目")
    
    if questions:
        print("\n第一道题目：")
        print(json.dumps(questions[0], ensure_ascii=False, indent=2))
