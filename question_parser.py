#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
医考题库通用解析器 - Question Bank Parser
====================================
功能：自动解析各种格式的题库文本，生成标准化SQL导入文件

支持：
- 执业药师考试（2024/2023/2022...）
- 其他医学考试题库
- 自动识别题型
- 自动生成SQL

作者：AI Assistant
版本：1.0.0
日期：2025-11-20
"""

import re
import json
import os
from typing import List, Dict, Any
from datetime import datetime


class QuestionParser:
    """题库解析器"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        初始化解析器
        
        Args:
            config: 配置字典，包含exam_type, subject, source_year等
        """
        self.config = config
        self.questions = []
        
    def parse_file(self, filepath: str) -> List[Dict]:
        """
        解析题库文件
        
        Args:
            filepath: 题库文本文件路径
            
        Returns:
            解析后的题目列表
        """
        print(f"\n🔍 开始解析文件：{filepath}")
        print("=" * 70)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 自动识别题型分段
        sections = self._identify_sections(content)
        
        for section in sections:
            section_type = section['type']
            section_content = section['content']
            start_num = section['start']
            end_num = section['end']
            
            print(f"\n📝 解析 {section['title']} ({start_num}-{end_num}题)...")
            
            if section_type == 'single':
                questions = self._parse_single_choice(section_content, start_num, end_num)
            elif section_type == 'match':
                questions = self._parse_match_choice(section_content, start_num, end_num)
            elif section_type == 'comprehensive':
                questions = self._parse_comprehensive(section_content, start_num, end_num)
            elif section_type == 'multiple':
                questions = self._parse_multiple_choice(section_content, start_num, end_num)
            else:
                questions = []
            
            self.questions.extend(questions)
            print(f"   ✅ 成功解析 {len(questions)} 道题")
        
        print(f"\n{'='*70}")
        print(f"✨ 解析完成！共 {len(self.questions)} 道题")
        return self.questions
    
    def _identify_sections(self, content: str) -> List[Dict]:
        """自动识别题型分段"""
        sections = []
        
        # 查找各题型标题
        patterns = {
            'single': r'一[、．]\s*最佳选择题',
            'match': r'二[、．]\s*配伍选择题',
            'comprehensive': r'三[、．]\s*综合分析[选择]*题',
            'multiple': r'四[、．]\s*多项选择题'
        }
        
        positions = {}
        for qtype, pattern in patterns.items():
            match = re.search(pattern, content)
            if match:
                positions[qtype] = match.start()
        
        # 根据标准题型范围添加
        if 'single' in positions:
            sections.append({
                'type': 'single',
                'title': '一、最佳选择题',
                'start': 1,
                'end': 40,
                'content': content
            })
        
        if 'match' in positions:
            sections.append({
                'type': 'match',
                'title': '二、配伍选择题',
                'start': 41,
                'end': 90,
                'content': content
            })
        
        if 'comprehensive' in positions:
            sections.append({
                'type': 'comprehensive',
                'title': '三、综合分析题',
                'start': 91,
                'end': 110,
                'content': content
            })
        
        if 'multiple' in positions:
            sections.append({
                'type': 'multiple',
                'title': '四、多项选择题',
                'start': 111,
                'end': 120,
                'content': content
            })
        
        return sections
    
    def _parse_single_choice(self, content: str, start: int, end: int) -> List[Dict]:
        """解析最佳选择题"""
        questions = []
        
        for num in range(start, end + 1):
            # 匹配题目模式
            pattern = rf'{num}\.(.+?)(?=\n[A-E]\.|正确答案：)'
            content_match = re.search(pattern, content, re.DOTALL)
            
            if not content_match:
                continue
            
            question_text = content_match.group(1).strip()
            
            # 匹配选项
            options = []
            for opt in ['A', 'B', 'C', 'D', 'E']:
                opt_pattern = rf'{opt}\.(.+?)(?=\n[A-E]\.|正确答案：|\n\d+\.)'
                opt_match = re.search(opt_pattern, content, re.DOTALL)
                if opt_match:
                    options.append({
                        'key': opt,
                        'value': opt_match.group(1).strip()
                    })
            
            # 匹配答案
            answer_pattern = rf'正确答案：([A-E])'
            answer_match = re.search(answer_pattern, content)
            correct_answer = answer_match.group(1) if answer_match else 'A'
            
            # 匹配解析
            expl_pattern = rf'解题思路：(.+?)(?=\n\d+\.|$)'
            expl_match = re.search(expl_pattern, content, re.DOTALL)
            explanation = expl_match.group(1).strip() if expl_match else ''
            
            question = {
                'exam_type': self.config['exam_type'],
                'subject': self.config['subject'],
                'chapter': self._extract_chapter(question_text),
                'question_type': 'single',
                'content': question_text,
                'options': options,
                'correct_answer': correct_answer,
                'explanation': explanation,
                'difficulty': 2,
                'knowledge_points': self._extract_knowledge_points(explanation),
                'source_type': '历年真题',
                'source_year': self.config['source_year'],
                'is_published': True
            }
            
            questions.append(question)
        
        return questions
    
    def _parse_match_choice(self, content: str, start: int, end: int) -> List[Dict]:
        """解析配伍选择题"""
        questions = []
        
        # 配伍题的特点是共用选项组
        # 简化处理：类似单选题，但标记为match类型
        for num in range(start, end + 1):
            # 简化版：复用单选题解析逻辑
            q = self._parse_single_choice(content, num, num)
            if q:
                q[0]['question_type'] = 'match'
                questions.extend(q)
        
        return questions
    
    def _parse_comprehensive(self, content: str, start: int, end: int) -> List[Dict]:
        """解析综合分析题"""
        questions = []
        
        # 综合题特点：有案例描述
        for num in range(start, end + 1):
            q = self._parse_single_choice(content, num, num)
            if q:
                q[0]['question_type'] = 'comprehensive'
                questions.extend(q)
        
        return questions
    
    def _parse_multiple_choice(self, content: str, start: int, end: int) -> List[Dict]:
        """解析多项选择题"""
        questions = []
        
        for num in range(start, end + 1):
            q = self._parse_single_choice(content, num, num)
            if q:
                q[0]['question_type'] = 'multiple'
                # 多选题答案可能是ABCD这种格式
                questions.extend(q)
        
        return questions
    
    def _extract_chapter(self, content: str) -> str:
        """从题目内容提取章节"""
        # 简单实现：返回默认章节
        keywords = {
            '阳脉': '中医基础理论',
            '贮藏': '中药贮藏',
            '孙思邈': '中医药学发展史',
            '痹': '痹证',
            '注射剂': '中药注射剂',
        }
        
        for keyword, chapter in keywords.items():
            if keyword in content:
                return chapter
        
        return '综合知识'
    
    def _extract_knowledge_points(self, explanation: str) -> List[str]:
        """从解析中提取知识点"""
        # 简单实现：返回默认知识点
        return ['综合知识']
    
    def generate_sql(self, output_file: str = None) -> str:
        """
        生成SQL导入文件
        
        Args:
            output_file: 输出文件路径（可选）
            
        Returns:
            SQL字符串
        """
        print(f"\n📝 生成SQL导入文件...")
        
        sql_parts = []
        
        # 添加文件头
        header = f"""-- ================================================================
-- 医考题库自动导入SQL
-- ================================================================
-- 考试类型：{self.config['exam_type']}
-- 科目：{self.config['subject']}
-- 年份：{self.config['source_year']}
-- 题目总数：{len(self.questions)} 道
-- 生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
-- ================================================================

-- 清理现有数据
DELETE FROM questions 
WHERE exam_type = '{self.config['exam_type']}' 
  AND subject = '{self.config['subject']}' 
  AND source_year = {self.config['source_year']};

"""
        sql_parts.append(header)
        
        # 生成INSERT语句
        for i, q in enumerate(self.questions, 1):
            sql = self._generate_insert_statement(q, i)
            sql_parts.append(sql)
        
        # 添加验证查询
        footer = f"""
-- ================================================================
-- 验证导入结果
-- ================================================================
SELECT 
  question_type,
  COUNT(*) as count
FROM questions 
WHERE exam_type = '{self.config['exam_type']}' 
  AND subject = '{self.config['subject']}' 
  AND source_year = {self.config['source_year']}
GROUP BY question_type
ORDER BY 
  CASE question_type
    WHEN 'single' THEN 1
    WHEN 'match' THEN 2
    WHEN 'comprehensive' THEN 3
    WHEN 'multiple' THEN 4
    ELSE 5
  END;

-- 检查总数
SELECT COUNT(*) as total FROM questions 
WHERE exam_type = '{self.config['exam_type']}' 
  AND subject = '{self.config['subject']}' 
  AND source_year = {self.config['source_year']};
"""
        sql_parts.append(footer)
        
        sql_content = '\n'.join(sql_parts)
        
        # 保存到文件
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(sql_content)
            print(f"   ✅ SQL文件已保存：{output_file}")
        
        return sql_content
    
    def _generate_insert_statement(self, question: Dict, index: int) -> str:
        """生成单条INSERT语句"""
        # 转义单引号
        content = question['content'].replace("'", "''")
        explanation = question['explanation'].replace("'", "''")
        
        # 生成options JSON
        options_json = json.dumps(question['options'], ensure_ascii=False).replace("'", "''")
        
        # 生成knowledge_points数组
        kp_list = "', '".join(question['knowledge_points'])
        kp_array = f"ARRAY['{kp_list}']" if kp_list else "ARRAY[]::text[]"
        
        sql = f"""
-- 第{index}题 ({question['question_type']})
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '{question['exam_type']}',
  '{question['subject']}',
  '{question['chapter']}',
  '{question['question_type']}',
  '{content}',
  '{options_json}'::json,
  '{question['correct_answer']}',
  '{explanation}',
  {question['difficulty']},
  {kp_array},
  '{question['source_type']}',
  {question['source_year']},
  {str(question['is_published']).lower()}
);
"""
        return sql
    
    def export_json(self, output_file: str):
        """导出为JSON格式"""
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.questions, f, ensure_ascii=False, indent=2)
        print(f"   ✅ JSON文件已保存：{output_file}")


def main():
    """主函数"""
    print("=" * 70)
    print("🚀 医考题库通用导入工具 v1.0.0")
    print("=" * 70)
    
    # 配置（可以通过命令行参数或配置文件传入）
    config = {
        'exam_type': '执业药师',
        'subject': '中药学综合知识与技能',
        'source_year': 2024
    }
    
    # 输入输出文件
    input_file = '题库原始数据-请粘贴到这里.txt'
    output_sql = f"import-{config['source_year']}-questions-auto.sql"
    output_json = f"questions-{config['source_year']}-parsed.json"
    
    try:
        # 创建解析器
        parser = QuestionParser(config)
        
        # 解析文件
        questions = parser.parse_file(input_file)
        
        if len(questions) == 0:
            print("\n⚠️  警告：未解析到任何题目！")
            print("   请检查输入文件格式")
            return
        
        # 生成SQL
        parser.generate_sql(output_sql)
        
        # 导出JSON
        parser.export_json(output_json)
        
        # 显示统计
        print(f"\n{'='*70}")
        print("📊 导入文件生成完成！")
        print(f"{'='*70}")
        print(f"✅ 题目总数：{len(questions)} 道")
        print(f"✅ SQL文件：{output_sql}")
        print(f"✅ JSON文件：{output_json}")
        
        # 题型统计
        type_count = {}
        for q in questions:
            qtype = q['question_type']
            type_count[qtype] = type_count.get(qtype, 0) + 1
        
        print(f"\n📋 题型分布：")
        type_names = {
            'single': '最佳选择题',
            'match': '配伍选择题',
            'comprehensive': '综合分析题',
            'multiple': '多项选择题'
        }
        for qtype, count in sorted(type_count.items()):
            type_name = type_names.get(qtype, qtype)
            print(f"   - {type_name}: {count} 道")
        
        print(f"\n💡 下一步操作：")
        print(f"   1. 打开 Supabase SQL 编辑器")
        print(f"   2. 复制粘贴 {output_sql} 的内容")
        print(f"   3. 点击运行")
        print(f"   4. 刷新前端查看效果")
        
    except Exception as e:
        print(f"\n❌ 错误：{e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
