#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JSON转SQL导入工具
================
将JSON格式的题库数据转换为Supabase SQL导入文件

使用方法：
  python json_to_sql.py questions.json
  python json_to_sql.py questions.json --output custom.sql
"""

import json
import argparse
from datetime import datetime
from pathlib import Path


def json_to_sql(json_file: str, output_file: str = None, year: int = 2024):
    """将JSON转换为SQL"""
    
    print(f"🚀 JSON转SQL工具")
    print(f"{'='*70}\n")
    
    # 读取JSON
    print(f"📖 读取文件：{json_file}")
    with open(json_file, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    print(f"✅ 成功读取 {len(questions)} 道题\n")
    
    # 验证数据
    print("🔍 验证数据...")
    errors = []
    for i, q in enumerate(questions, 1):
        if 'content' not in q or not q['content']:
            errors.append(f"第{i}题缺少题目内容")
        if 'options' not in q:
            errors.append(f"第{i}题缺少选项")
        if 'answer' not in q or not q['answer']:
            errors.append(f"第{i}题缺少答案")
    
    if errors:
        print(f"⚠️  发现 {len(errors)} 个问题：")
        for error in errors[:5]:
            print(f"   - {error}")
        if len(errors) > 5:
            print(f"   ... 还有 {len(errors) - 5} 个问题")
        print("\n❌ 请修正后重试")
        return False
    
    print("✅ 数据验证通过\n")
    
    # 生成SQL
    print("📝 生成SQL文件...")
    
    if not output_file:
        output_file = f'import-{year}-questions-complete.sql'
    
    sql_parts = []
    
    # 文件头
    header = f"""-- ================================================================
-- 医考题库导入SQL - 从JSON生成
-- ================================================================
-- 年份：{year}
-- 题目总数：{len(questions)} 道
-- 生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
-- 数据来源：{json_file}
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
        num = q.get('number', 0)
        qtype = q.get('type', 'single')
        type_name = type_map.get(qtype, qtype)
        
        content = q['content'].replace("'", "''").replace("\\", "\\\\")
        explanation = q.get('explanation', '').replace("'", "''").replace("\\", "\\\\")
        
        # 处理选项
        options = q['options']
        if isinstance(options, dict):
            options_list = [{'key': k, 'value': v} for k, v in options.items()]
        else:
            options_list = options
        
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
        qtype = q.get('type', 'single')
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
    parser = argparse.ArgumentParser(description='JSON转SQL工具')
    parser.add_argument('input', help='输入JSON文件')
    parser.add_argument('--output', '-o', help='输出SQL文件')
    parser.add_argument('--year', '-y', type=int, default=2024, help='年份')
    
    args = parser.parse_args()
    
    if not Path(args.input).exists():
        print(f"❌ 文件不存在：{args.input}")
        return
    
    json_to_sql(args.input, args.output, args.year)


if __name__ == '__main__':
    main()
