#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSV转SQL导入工具
===============
将CSV格式的题库数据转换为Supabase SQL导入文件

使用方法：
  python csv_to_sql.py 题库.csv
  python csv_to_sql.py 题库.csv --output custom.sql
"""

import csv
import json
import argparse
from datetime import datetime
from pathlib import Path


def csv_to_sql(csv_file: str, output_file: str = None, year: int = 2024):
    """将CSV转换为SQL"""
    
    print(f"🚀 CSV转SQL工具")
    print(f"{'='*70}\n")
    
    # 读取CSV
    print(f"📖 读取文件：{csv_file}")
    questions = []
    
    with open(csv_file, 'r', encoding='utf-8-sig') as f:  # utf-8-sig处理BOM
        reader = csv.DictReader(f)
        for row in reader:
            if not row.get('题号'):  # 跳过空行
                continue
            
            q = {
                'number': int(row['题号']),
                'type': row['题型'],
                'content': row['题目内容'],
                'options': {
                    'A': row['选项A'],
                    'B': row['选项B'],
                    'C': row['选项C'],
                    'D': row['选项D'],
                    'E': row['选项E']
                },
                'answer': row['答案'],
                'explanation': row['解析']
            }
            questions.append(q)
    
    print(f"✅ 成功读取 {len(questions)} 道题\n")
    
    # 生成SQL
    print("📝 生成SQL文件...")
    
    if not output_file:
        output_file = f'import-{year}-questions-complete.sql'
    
    sql_parts = []
    
    # 文件头
    header = f"""-- ================================================================
-- 医考题库导入SQL - 从CSV生成
-- ================================================================
-- 年份：{year}
-- 题目总数：{len(questions)} 道
-- 生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
-- 数据来源：{csv_file}
-- ================================================================

-- 清理现有数据
DELETE FROM questions 
WHERE exam_type = '执业药师' 
  AND subject = '中药学综合知识与技能' 
  AND source_year = {year};

-- 批量插入
"""
    sql_parts.append(header)
    
    # 题型映射
    type_map = {
        'single': '最佳选择题',
        'match': '配伍选择题',
        'comprehensive': '综合分析题',
        'multiple': '多项选择题'
    }
    
    # 生成INSERT语句
    for q in questions:
        num = q['number']
        qtype = q['type']
        type_name = type_map.get(qtype, qtype)
        
        content = q['content'].replace("'", "''").replace("\\", "\\\\")
        explanation = q['explanation'].replace("'", "''").replace("\\", "\\\\")
        
        # 处理选项 - 只包含非空选项
        options_list = []
        for key in ['A', 'B', 'C', 'D', 'E']:
            value = q['options'].get(key, '')
            if value:
                options_list.append({'key': key, 'value': str(value)})
        
        options_json = json.dumps(options_list, ensure_ascii=False).replace("'", "''")
        
        sql = f"""
-- 第{num}题 - {type_name}
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '执业药师',
  '中药学综合知识与技能',
  '综合知识',
  '{qtype}',
  '{content}',
  '{options_json}'::json,
  '{q["answer"]}',
  '{explanation}',
  2,
  ARRAY['综合知识'],
  '历年真题',
  {year},
  true
);
"""
        sql_parts.append(sql)
    
    # 验证查询
    footer = f"""
-- ================================================================
-- 验证导入结果
-- ================================================================
SELECT 
  question_type as "题型",
  COUNT(*) as "数量"
FROM questions 
WHERE source_year = {year}
GROUP BY question_type;

SELECT COUNT(*) as "总数" FROM questions WHERE source_year = {year};
"""
    sql_parts.append(footer)
    
    # 保存文件
    sql_content = '\n'.join(sql_parts)
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print(f"✅ SQL文件生成成功：{output_file}")
    print(f"   文件大小：{len(sql_content) / 1024:.1f} KB")
    print(f"   题目数量：{len(questions)} 道\n")
    
    # 统计信息
    type_count = {}
    for q in questions:
        qtype = q['type']
        type_count[qtype] = type_count.get(qtype, 0) + 1
    
    print("📊 题型分布：")
    for qtype, count in sorted(type_count.items()):
        type_name = type_map.get(qtype, qtype)
        print(f"   - {type_name}: {count} 道")
    
    print(f"\n{'='*70}")
    print("💡 下一步：")
    print(f"   1. 打开 Supabase SQL 编辑器")
    print(f"   2. 复制粘贴 {output_file} 的内容")
    print(f"   3. 点击运行")
    print(f"{'='*70}\n")
    
    return True


def main():
    parser = argparse.ArgumentParser(description='CSV转SQL工具')
    parser.add_argument('input', help='输入CSV文件')
    parser.add_argument('--output', '-o', help='输出SQL文件')
    parser.add_argument('--year', '-y', type=int, default=2024, help='年份')
    
    args = parser.parse_args()
    
    if not Path(args.input).exists():
        print(f"❌ 文件不存在：{args.input}")
        return
    
    csv_to_sql(args.input, args.output, args.year)


if __name__ == '__main__':
    main()
