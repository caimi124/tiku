#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从西药药二PDF解析JSON中提取知识点，构建树状知识体系
"""

import json
import re
from typing import Dict, List, Optional
from collections import defaultdict

class KnowledgeTreeBuilder:
    def __init__(self):
        # 章节匹配模式
        self.chapter_pattern = re.compile(r'第[一二三四五六七八九十]+章\s+([^/]+)')
        self.section_pattern = re.compile(r'第[一二三四五六七八九十]+节\s+([^\n]+)')
        
        # 知识点类型关键词
        self.knowledge_keywords = [
            '适应证', '禁忌', '不良反应', '临床应用', '用法', '用量',
            '相互作用', '作用机制', '作用特点', '典型', '药物',
            '润德巧记', '记忆口诀', '作用', '治疗', '用于', '适用于',
            '药物', '药品', '代表', '分类', '特点', '注意'
        ]
        
        # 高频考点关键词
        self.high_freq_keywords = [
            '首选', '一线', '金标准', '最常用', '主要', '重要',
            '严重', '禁忌', '禁用', '特别注意', '重点',
            '相互作用', '配伍禁忌', '常见', '典型'
        ]
    
    def extract_all_text(self, json_data: Dict) -> str:
        """从JSON数据中提取所有文本内容"""
        text_parts = []
        
        if 'pdf_info' in json_data:
            for page in json_data['pdf_info']:
                if 'para_blocks' in page:
                    for block in page['para_blocks']:
                        if 'lines' in block:
                            for line in block['lines']:
                                if 'spans' in line:
                                    line_text = []
                                    for span in line['spans']:
                                        if 'content' in span:
                                            content = span['content'].strip()
                                            if content:
                                                line_text.append(content)
                                    if line_text:
                                        text_parts.append(' '.join(line_text))
        
        return '\n'.join(text_parts)
    
    def extract_html_tables(self, json_data: Dict) -> List[Dict]:
        """提取HTML表格内容"""
        tables = []
        
        if 'pdf_info' in json_data:
            for page_idx, page in enumerate(json_data['pdf_info']):
                if 'para_blocks' in page:
                    for block in page['para_blocks']:
                        if 'lines' in block:
                            for line in block['lines']:
                                if 'spans' in line:
                                    for span in line['spans']:
                                        if 'html' in span:
                                            tables.append({
                                                'html': span['html'],
                                                'page_idx': page_idx
                                            })
        
        return tables
    
    def parse_structure(self, text: str) -> List[Dict]:
        """解析章节和节的结构"""
        chapters = []
        lines = text.split('\n')
        
        current_chapter = None
        current_section = None
        chapter_counter = 0
        section_counter = 0
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # 匹配章节
            chapter_match = self.chapter_pattern.search(line)
            if chapter_match:
                if current_chapter:
                    if current_section:
                        current_chapter['sections'].append(current_section)
                    chapters.append(current_chapter)
                
                chapter_counter += 1
                chapter_name = chapter_match.group(1).strip()
                chapter_name = re.sub(r'//.*$', '', chapter_name).strip()
                
                current_chapter = {
                    'chapter_id': chapter_counter,
                    'chapter_name': chapter_name,
                    'sections': []
                }
                current_section = None
                section_counter = 0
                continue
            
            # 匹配节
            section_match = self.section_pattern.search(line)
            if section_match and current_chapter:
                if current_section:
                    current_chapter['sections'].append(current_section)
                
                section_counter += 1
                section_name = section_match.group(1).strip()
                section_name = re.sub(r'\s+\d+$', '', section_name).strip()
                section_name = re.sub(r'\.\s*$', '', section_name).strip()
                
                current_section = {
                    'section_id': section_counter,
                    'section_name': section_name,
                    'start_line': line
                }
                continue
        
        # 添加最后一个
        if current_section and current_chapter:
            current_chapter['sections'].append(current_section)
        if current_chapter:
            chapters.append(current_chapter)
        
        return chapters
    
    def extract_knowledge_points(self, text: str, section_name: str, section_start_idx: int) -> List[Dict]:
        """从文本中提取知识点"""
        knowledge_points = []
        lines = text.split('\n')
        
        # 找到节开始位置
        section_text_start = section_start_idx
        section_text_end = len(lines)
        
        # 查找下一个节或章的开始
        for i in range(section_start_idx + 1, len(lines)):
            if (self.section_pattern.search(lines[i]) or 
                self.chapter_pattern.search(lines[i])):
                section_text_end = i
                break
        
        # 提取该节的文本
        section_text = '\n'.join(lines[section_text_start:section_text_end])
        
        # 按段落分割
        paragraphs = re.split(r'\n{2,}|【|考点|项目|具体内容|作用特点|典型不良反应|禁忌|药物相互作用', section_text)
        
        point_id = 1
        for para in paragraphs:
            para = para.strip()
            if len(para) < 50:  # 跳过太短的段落
                continue
            
            # 检查是否包含知识点关键词
            has_keyword = any(kw in para for kw in self.knowledge_keywords)
            
            if has_keyword:
                # 提取药物名称（简单模式）
                drug_name = None
                drug_patterns = [
                    r'([A-Za-z\u4e00-\u9fa5]{2,8}(?:替丁|拉唑|洛尔|地平|普利|沙坦|他汀|西林|霉素|头孢|索|醇|胺|酮|酸|碱|酯|苷|钠|钾))',
                    r'([\u4e00-\u9fa5]{2,6}(?:片|胶囊|注射液|颗粒|口服液))',
                ]
                for pattern in drug_patterns:
                    match = re.search(pattern, para)
                    if match:
                        drug_name = match.group(1)
                        break
                
                # 分类知识点类型
                knowledge_types = []
                if '适应证' in para or '用于' in para or '治疗' in para:
                    knowledge_types.append('适应证')
                if '禁忌' in para or '禁用' in para or '慎用' in para:
                    knowledge_types.append('禁忌')
                if '不良反应' in para or '副作用' in para:
                    knowledge_types.append('不良反应')
                if '相互作用' in para or '合用' in para or '联用' in para:
                    knowledge_types.append('药物相互作用')
                if '作用机制' in para or '作用特点' in para:
                    knowledge_types.append('作用机制')
                if '润德巧记' in para or '记忆口诀' in para or '巧记' in para:
                    knowledge_types.append('记忆口诀')
                if not knowledge_types:
                    knowledge_types.append('其他')
                
                # 计算重要性
                importance = 3
                for keyword in self.high_freq_keywords:
                    if keyword in para:
                        importance += 0.3
                if '对比' in para or '重点强化' in para:
                    importance += 1
                if '巧记' in para or '口诀' in para:
                    importance += 0.5
                importance = min(5, max(1, int(importance)))
                
                # 生成标题
                sentences = re.split(r'[。！？\n]', para)
                title = sentences[0].strip() if sentences else '知识点'
                if len(title) > 50:
                    title = title[:50] + '...'
                
                knowledge_point = {
                    'point_id': f"{point_id}",
                    'point_title': title,
                    'drug_name': drug_name,
                    'knowledge_types': knowledge_types,
                    'importance_level': importance,
                    'content': para[:1000],  # 限制长度
                    'full_content': para[:2000]
                }
                
                knowledge_points.append(knowledge_point)
                point_id += 1
        
        return knowledge_points
    
    def build_tree(self, json_file_path: str, output_file: str):
        """构建知识树"""
        print("=" * 60)
        print("开始构建知识树...")
        print("=" * 60)
        
        # 读取JSON文件
        print(f"📖 正在读取文件: {json_file_path}")
        with open(json_file_path, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        # 提取文本
        print("📝 正在提取文本内容...")
        text = self.extract_all_text(json_data)
        print(f"   提取了 {len(text)} 个字符")
        
        # 提取表格
        print("📊 正在提取表格内容...")
        tables = self.extract_html_tables(json_data)
        print(f"   找到 {len(tables)} 个表格")
        
        # 解析结构
        print("🌳 正在解析章节结构...")
        chapters = self.parse_structure(text)
        print(f"   找到 {len(chapters)} 个章节")
        
        # 构建知识树
        print("🔍 正在识别知识点...")
        knowledge_tree = {
            'title': '西药药二知识点体系',
            'total_chapters': len(chapters),
            'total_sections': 0,
            'total_points': 0,
            'chapters': []
        }
        
        lines = text.split('\n')
        
        for chapter in chapters:
            chapter_id = chapter['chapter_id']
            chapter_name = chapter['chapter_name']
            
            print(f"  处理第{chapter_id}章: {chapter_name}")
            
            chapter_data = {
                'chapter_id': f"第{chapter_id}章",
                'chapter_name': chapter_name,
                'sections': []
            }
            
            # 找到章节开始位置
            chapter_start_idx = -1
            for idx, line in enumerate(lines):
                if f"第{chapter_id}章" in line or chapter_name[:5] in line:
                    chapter_start_idx = idx
                    break
            
            for section in chapter['sections']:
                section_id = section['section_id']
                section_name = section['section_name']
                
                print(f"    处理第{section_id}节: {section_name}")
                
                # 找到节开始位置
                section_start_idx = -1
                for idx in range(chapter_start_idx if chapter_start_idx >= 0 else 0, len(lines)):
                    if section_name[:5] in lines[idx]:
                        section_start_idx = idx
                        break
                
                if section_start_idx < 0:
                    section_start_idx = chapter_start_idx if chapter_start_idx >= 0 else 0
                
                # 提取知识点
                knowledge_points = self.extract_knowledge_points(
                    text, section_name, section_start_idx
                )
                
                section_data = {
                    'section_id': f"{chapter_id}.{section_id}",
                    'section_name': section_name,
                    'knowledge_points': knowledge_points,
                    'point_count': len(knowledge_points)
                }
                
                chapter_data['sections'].append(section_data)
                knowledge_tree['total_points'] += len(knowledge_points)
            
            knowledge_tree['chapters'].append(chapter_data)
            knowledge_tree['total_sections'] += len(chapter_data['sections'])
        
        # 保存
        print(f"\n💾 正在保存知识树到: {output_file}")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(knowledge_tree, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ 知识树构建完成！")
        print(f"   📚 章节数: {knowledge_tree['total_chapters']}")
        print(f"   📖 节数: {knowledge_tree['total_sections']}")
        print(f"   🎯 知识点数: {knowledge_tree['total_points']}")
        print(f"   💾 已保存到: {output_file}")
        print("\n🎉 处理完成！")
        
        return knowledge_tree


def main():
    builder = KnowledgeTreeBuilder()
    
    input_file = r'e:\tiku\shuju\西药药二1-50页.json'
    output_file = r'e:\tiku\shuju\西药药二知识树.json'
    
    try:
        knowledge_tree = builder.build_tree(input_file, output_file)
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
