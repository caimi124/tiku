#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
医考题库高级解析器 - Advanced Question Parser
==========================================
支持命令行参数、配置文件、多种输入格式

使用方法：
  python question_parser_advanced.py                    # 使用默认配置
  python question_parser_advanced.py --year 2023        # 指定年份
  python question_parser_advanced.py --input data.txt   # 指定输入文件
  python question_parser_advanced.py --config custom.json  # 指定配置文件

作者：AI Assistant (Senior Architect)
版本：1.0.0
"""

import re
import json
import argparse
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path


class AdvancedQuestionParser:
    """高级题库解析器 - 支持多种配置和格式"""
    
    def __init__(self, config_file: str = 'question_config.json'):
        """初始化解析器"""
        self.config = self._load_config(config_file)
        self.questions = []
        self.stats = {
            'total': 0,
            'by_type': {},
            'parsing_errors': [],
            'validation_errors': []
        }
    
    def _load_config(self, config_file: str) -> Dict:
        """加载配置文件"""
        if os.path.exists(config_file):
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            # 返回默认配置
            return self._get_default_config()
    
    def _get_default_config(self) -> Dict:
        """获取默认配置"""
        return {
            'exam_type': '执业药师',
            'subject': '中药学综合知识与技能',
            'source_year': 2024,
            'total_questions': 120,
            'sections': [
                {'type': 'single', 'title': '最佳选择题', 'start': 1, 'end': 40},
                {'type': 'match', 'title': '配伍选择题', 'start': 41, 'end': 90},
                {'type': 'comprehensive', 'title': '综合分析题', 'start': 91, 'end': 110},
                {'type': 'multiple', 'title': '多项选择题', 'start': 111, 'end': 120}
            ]
        }
    
    def parse_from_text(self, text: str, exam_config: Dict) -> List[Dict]:
        """
        从文本解析题目
        
        Args:
            text: 原始文本内容
            exam_config: 考试配置
            
        Returns:
            解析后的题目列表
        """
        print(f"\n{'='*70}")
        print(f"📚 开始解析：{exam_config['exam_type']} - {exam_config['subject']}")
        print(f"📅 年份：{exam_config['source_year']}")
        print(f"{'='*70}\n")
        
        self.questions = []
        
        for section in exam_config.get('sections', []):
            self._parse_section(text, section, exam_config)
        
        # 统计信息
        self._update_stats()
        
        return self.questions
    
    def _parse_section(self, text: str, section: Dict, exam_config: Dict):
        """解析单个题型章节"""
        section_type = section['type']
        section_title = section['title']
        start_num = section['start']
        end_num = section['end']
        
        print(f"📝 正在解析：{section_title} (第{start_num}-{end_num}题)...")
        
        parsed_count = 0
        
        for num in range(start_num, end_num + 1):
            try:
                question = self._parse_single_question(text, num, section_type, exam_config)
                if question:
                    self.questions.append(question)
                    parsed_count += 1
            except Exception as e:
                error_msg = f"第{num}题解析失败: {str(e)}"
                self.stats['parsing_errors'].append(error_msg)
                print(f"   ⚠️  {error_msg}")
        
        print(f"   ✅ 成功解析 {parsed_count} 道题\n")
    
    def _parse_single_question(self, text: str, num: int, qtype: str, exam_config: Dict) -> Optional[Dict]:
        """解析单道题目 - 核心解析逻辑"""
        
        # 1. 提取题目内容
        content_pattern = rf'{num}\.(.+?)(?=\n[A-E]\.|正确答案：)'
        content_match = re.search(content_pattern, text, re.DOTALL)
        
        if not content_match:
            return None
        
        question_text = content_match.group(1).strip()
        
        # 2. 提取选项
        options = []
        question_start_pos = content_match.start()
        next_question_pattern = rf'{num + 1}\.'
        next_match = re.search(next_question_pattern, text[question_start_pos:])
        question_end_pos = question_start_pos + next_match.start() if next_match else len(text)
        question_block = text[question_start_pos:question_end_pos]
        
        for opt_key in ['A', 'B', 'C', 'D', 'E']:
            opt_pattern = rf'{opt_key}\.(.+?)(?=\n[A-E]\.|正确答案：|\n\d+\.)'
            opt_match = re.search(opt_pattern, question_block, re.DOTALL)
            if opt_match:
                opt_value = opt_match.group(1).strip()
                options.append({'key': opt_key, 'value': opt_value})
        
        # 3. 提取答案
        answer_pattern = rf'正确答案：([A-E]+)'
        answer_match = re.search(answer_pattern, question_block)
        correct_answer = answer_match.group(1) if answer_match else ''
        
        # 4. 提取解析
        expl_pattern = rf'解题思路：(.+?)(?=\n\d+\.|$)'
        expl_match = re.search(expl_pattern, question_block, re.DOTALL)
        explanation = expl_match.group(1).strip() if expl_match else ''
        
        # 5. 构建题目对象
        question = {
            'exam_type': exam_config['exam_type'],
            'subject': exam_config['subject'],
            'chapter': self._extract_chapter(question_text),
            'question_type': qtype,
            'content': question_text,
            'options': options,
            'correct_answer': correct_answer,
            'explanation': explanation,
            'difficulty': self._estimate_difficulty(question_text, explanation),
            'knowledge_points': self._extract_knowledge_points(question_text, explanation),
            'source_type': '历年真题',
            'source_year': exam_config['source_year'],
            'is_published': True
        }
        
        # 6. 验证题目
        if not self._validate_question(question, num):
            return None
        
        return question
    
    def _extract_chapter(self, content: str) -> str:
        """智能提取章节"""
        chapter_keywords = {
            '中医基础理论': ['阳脉', '阴阳', '五行', '脏腑', '经络', '气血'],
            '中药贮藏': ['贮藏', '密封', '遮光', '阴凉', '冷处'],
            '中医药学发展史': ['孙思邈', '李时珍', '本草', '伤寒论', '千金'],
            '痹证辨治': ['痹', '关节', '肢体', '酸楚', '活动不利'],
            '中药注射剂': ['注射剂', '静脉', '滴注', '输液'],
            '方剂应用': ['方剂', '汤', '丸', '散', '基础方剂'],
            '病例分析': ['某男', '某女', '岁', '症见', '舌', '脉'],
            '中药鉴别': ['鉴别', '性状', '显微', '理化'],
            '用药指导': ['用药', '服用', '用法', '注意事项'],
        }
        
        for chapter, keywords in chapter_keywords.items():
            for keyword in keywords:
                if keyword in content:
                    return chapter
        
        return '综合知识'
    
    def _estimate_difficulty(self, content: str, explanation: str) -> int:
        """智能估计难度"""
        # 简单规则：根据题目长度和解析长度估计
        total_length = len(content) + len(explanation)
        
        if total_length < 100:
            return 1  # 简单
        elif total_length < 200:
            return 2  # 中等
        else:
            return 3  # 困难
    
    def _extract_knowledge_points(self, content: str, explanation: str) -> List[str]:
        """智能提取知识点"""
        knowledge_points = []
        
        # 从解析中提取关键词
        keywords = ['辨证', '选用', '治法', '方剂', '证候', '病机']
        for keyword in keywords:
            if keyword in explanation:
                knowledge_points.append(keyword)
        
        # 如果没有提取到，返回默认
        if not knowledge_points:
            knowledge_points = ['综合知识']
        
        return knowledge_points
    
    def _validate_question(self, question: Dict, num: int) -> bool:
        """验证题目完整性"""
        errors = []
        
        # 检查必填字段
        if not question['content']:
            errors.append(f"第{num}题：题目内容为空")
        
        if not question['options']:
            errors.append(f"第{num}题：缺少选项")
        
        if len(question['options']) < 4:
            errors.append(f"第{num}题：选项不足（{len(question['options'])}个）")
        
        if not question['correct_answer']:
            errors.append(f"第{num}题：缺少正确答案")
        
        if errors:
            self.stats['validation_errors'].extend(errors)
            for error in errors:
                print(f"   ⚠️  验证失败：{error}")
            return False
        
        return True
    
    def _update_stats(self):
        """更新统计信息"""
        self.stats['total'] = len(self.questions)
        
        for q in self.questions:
            qtype = q['question_type']
            self.stats['by_type'][qtype] = self.stats['by_type'].get(qtype, 0) + 1
    
    def generate_sql(self, output_file: str) -> str:
        """生成SQL导入文件 - 优化版"""
        print(f"\n{'='*70}")
        print(f"📝 生成SQL导入文件：{output_file}")
        print(f"{'='*70}\n")
        
        sql_parts = []
        
        # 文件头
        exam_config = self.config.get('exams', {}).get('pharmacist_2024', {})
        header = f"""-- ================================================================
-- 医考题库自动导入SQL - 高级版
-- ================================================================
-- 考试类型：{exam_config.get('exam_type', '执业药师')}
-- 科目：{exam_config.get('subject', '中药学综合知识与技能')}
-- 年份：{exam_config.get('source_year', 2024)}
-- 题目总数：{len(self.questions)} 道
-- 生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
-- 生成工具：Advanced Question Parser v1.0.0
-- ================================================================

-- 步骤1：清理现有数据
DELETE FROM questions 
WHERE exam_type = '{exam_config.get('exam_type', '执业药师')}' 
  AND subject = '{exam_config.get('subject', '中药学综合知识与技能')}' 
  AND source_year = {exam_config.get('source_year', 2024)};

-- 步骤2：批量插入新数据
"""
        sql_parts.append(header)
        
        # 批量INSERT语句
        for i, q in enumerate(self.questions, 1):
            sql = self._generate_insert_sql(q, i)
            sql_parts.append(sql)
        
        # 验证查询
        footer = f"""
-- ================================================================
-- 步骤3：验证导入结果
-- ================================================================

-- 检查题型分布
SELECT 
  question_type as "题型",
  COUNT(*) as "数量"
FROM questions 
WHERE exam_type = '{exam_config.get('exam_type', '执业药师')}' 
  AND subject = '{exam_config.get('subject', '中药学综合知识与技能')}' 
  AND source_year = {exam_config.get('source_year', 2024)}
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
  {exam_config.get('total_questions', 120)} as "预期数量",
  CASE 
    WHEN COUNT(*) = {exam_config.get('total_questions', 120)} THEN '✅ 正确'
    ELSE '⚠️ 数量不符'
  END as "状态"
FROM questions 
WHERE exam_type = '{exam_config.get('exam_type', '执业药师')}' 
  AND subject = '{exam_config.get('subject', '中药学综合知识与技能')}' 
  AND source_year = {exam_config.get('source_year', 2024)};
"""
        sql_parts.append(footer)
        
        sql_content = '\n'.join(sql_parts)
        
        # 保存文件
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(sql_content)
        
        print(f"✅ SQL文件生成成功：{output_file}")
        print(f"   文件大小：{len(sql_content) / 1024:.1f} KB")
        print(f"   题目数量：{len(self.questions)} 道\n")
        
        return sql_content
    
    def _generate_insert_sql(self, q: Dict, index: int) -> str:
        """生成单条INSERT语句 - SQL注入安全版"""
        # 转义特殊字符
        content = q['content'].replace("'", "''").replace("\\", "\\\\")
        explanation = q['explanation'].replace("'", "''").replace("\\", "\\\\")
        chapter = q['chapter'].replace("'", "''")
        
        # 生成options JSON
        options_json = json.dumps(q['options'], ensure_ascii=False).replace("'", "''")
        
        # 生成knowledge_points数组
        kp_list = "', '".join([kp.replace("'", "''") for kp in q['knowledge_points']])
        kp_array = f"ARRAY['{kp_list}']" if kp_list else "ARRAY[]::text[]"
        
        type_emoji = {'single': '📝', 'match': '🔗', 'comprehensive': '📋', 'multiple': '✅'}
        emoji = type_emoji.get(q['question_type'], '❓')
        
        sql = f"""
-- {emoji} 第{index}题 ({q['question_type']})
INSERT INTO questions (
  exam_type, subject, chapter, question_type, content, options,
  correct_answer, explanation, difficulty, knowledge_points,
  source_type, source_year, is_published
) VALUES (
  '{q['exam_type']}',
  '{q['subject']}',
  '{chapter}',
  '{q['question_type']}',
  '{content}',
  '{options_json}'::json,
  '{q['correct_answer']}',
  '{explanation}',
  {q['difficulty']},
  {kp_array},
  '{q['source_type']}',
  {q['source_year']},
  {str(q['is_published']).lower()}
);
"""
        return sql
    
    def print_report(self):
        """打印详细报告"""
        print(f"\n{'='*70}")
        print("📊 解析报告")
        print(f"{'='*70}\n")
        
        print(f"✅ 题目总数：{self.stats['total']} 道")
        
        print(f"\n📋 题型分布：")
        type_names = {
            'single': '最佳选择题',
            'match': '配伍选择题',
            'comprehensive': '综合分析题',
            'multiple': '多项选择题'
        }
        
        for qtype, count in sorted(self.stats['by_type'].items()):
            type_name = type_names.get(qtype, qtype)
            print(f"   - {type_name}: {count} 道")
        
        if self.stats['parsing_errors']:
            print(f"\n⚠️  解析错误 ({len(self.stats['parsing_errors'])} 个)：")
            for error in self.stats['parsing_errors'][:5]:
                print(f"   - {error}")
            if len(self.stats['parsing_errors']) > 5:
                print(f"   ... 还有 {len(self.stats['parsing_errors']) - 5} 个错误")
        
        if self.stats['validation_errors']:
            print(f"\n⚠️  验证错误 ({len(self.stats['validation_errors'])} 个)：")
            for error in self.stats['validation_errors'][:5]:
                print(f"   - {error}")
            if len(self.stats['validation_errors']) > 5:
                print(f"   ... 还有 {len(self.stats['validation_errors']) - 5} 个错误")
        
        print(f"\n{'='*70}\n")


def main():
    """主函数 - 支持命令行参数"""
    parser = argparse.ArgumentParser(
        description='医考题库高级解析器 - 流程化导入系统',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例：
  python question_parser_advanced.py
  python question_parser_advanced.py --year 2023
  python question_parser_advanced.py --input data/2023.txt --year 2023
  python question_parser_advanced.py --config custom_config.json
        """
    )
    
    parser.add_argument('--input', '-i', 
                       default='题库原始数据-请粘贴到这里.txt',
                       help='输入文件路径')
    parser.add_argument('--year', '-y', 
                       type=int,
                       help='年份（如2024, 2023）')
    parser.add_argument('--config', '-c',
                       default='question_config.json',
                       help='配置文件路径')
    parser.add_argument('--output-sql', '-s',
                       help='SQL输出文件路径')
    parser.add_argument('--output-json', '-j',
                       help='JSON输出文件路径')
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("🚀 医考题库高级解析器 v1.0.0")
    print("   流程化标准导入系统")
    print("=" * 70)
    
    try:
        # 创建解析器
        parser_obj = AdvancedQuestionParser(args.config)
        
        # 读取输入文件
        if not os.path.exists(args.input):
            print(f"\n❌ 错误：输入文件不存在：{args.input}")
            return
        
        with open(args.input, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # 获取配置
        exam_key = 'pharmacist_2024'
        if args.year:
            exam_key = f'pharmacist_{args.year}'
        
        exam_config = parser_obj.config.get('exams', {}).get(exam_key, parser_obj._get_default_config())
        
        if args.year:
            exam_config['source_year'] = args.year
        
        # 解析题目
        questions = parser_obj.parse_from_text(text, exam_config)
        
        # 生成输出文件名
        year = exam_config['source_year']
        output_sql = args.output_sql or f'import-{year}-questions-auto.sql'
        output_json = args.output_json or f'questions-{year}-parsed.json'
        
        # 生成SQL
        parser_obj.generate_sql(output_sql)
        
        # 导出JSON
        with open(output_json, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        print(f"✅ JSON文件生成成功：{output_json}\n")
        
        # 打印报告
        parser_obj.print_report()
        
        # 下一步提示
        print("💡 下一步操作：")
        print(f"   1. 打开 Supabase SQL 编辑器")
        print(f"   2. 复制粘贴 {output_sql} 的内容")
        print(f"   3. 点击运行")
        print(f"   4. 验证结果\n")
        
    except Exception as e:
        print(f"\n❌ 错误：{e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
