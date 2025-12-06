# -*- coding: utf-8 -*-
"""
西药药二知识点提取脚本
从PDF解析的JSON中提取结构化知识点，构建树状知识体系
"""

import json
import re
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field, asdict
from pathlib import Path

@dataclass
class KnowledgePoint:
    """知识点数据结构"""
    id: str                          # 唯一ID，如 "2.1.1"
    title: str                       # 标题
    content: str                     # 内容
    point_type: str = ""             # 类型：适应证/禁忌/不良反应/用法用量/注意事项
    drug_name: str = ""              # 所属药物
    importance: int = 3              # 重要性 1-5
    memory_tips: str = ""            # 记忆口诀
    parent_id: str = ""              # 父节点ID
    children: List[str] = field(default_factory=list)  # 子节点ID列表

@dataclass  
class Chapter:
    """章节数据结构"""
    id: str                          # 章节ID，如 "2"
    title: str                       # 章节标题
    sections: List[Dict] = field(default_factory=list)  # 小节列表

class KnowledgeExtractor:
    """知识点提取器"""
    
    def __init__(self):
        self.chapters = []           # 章节列表
        self.knowledge_points = []   # 知识点列表
        self.current_chapter = None
        self.current_section = None
        self.current_drug = None
        
        # 章节标题正则
        self.chapter_pattern = re.compile(r'第([一二三四五六七八九十]+)章\s*(.+?)(?:\s*//|$)')
        self.section_pattern = re.compile(r'第([一二三四五六七八九十]+)节\s*(.+?)(?:\s*\d+|$)')
        self.point_pattern = re.compile(r'考点(\d+)\s*(.+)')
        
        # 知识点类型关键词
        self.type_keywords = {
            '适应证': ['适应证', '适应症', '用于', '治疗'],
            '禁忌': ['禁忌', '禁用', '不宜'],
            '不良反应': ['不良反应', '副作用', '毒性'],
            '用法用量': ['用法', '用量', '剂量', '给药'],
            '注意事项': ['注意', '慎用', '警告'],
            '相互作用': ['相互作用', '配伍', '联用'],
            '作用机制': ['机制', '作用', '原理']
        }
        
        # 高频考点关键词（用于计算重要性）
        self.importance_keywords = ['首选', '一线', '金标准', '最常用', '主要', 
                                    '严重', '禁忌', '禁用', '慎用', '特别注意',
                                    '相互作用', '配伍禁忌', '重点', '★']
    
    def extract_from_json(self, json_path: str) -> Dict:
        """从JSON文件提取知识点"""
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 提取所有文本内容
        all_text = self._extract_all_text(data)
        
        # 解析章节结构
        self._parse_structure(all_text)
        
        # 构建知识树
        knowledge_tree = self._build_knowledge_tree()
        
        return knowledge_tree
    
    def _extract_all_text(self, data: Dict) -> List[Dict]:
        """从JSON中提取所有文本块"""
        text_blocks = []
        
        if 'pdf_info' not in data:
            return text_blocks
            
        for page in data['pdf_info']:
            page_idx = page.get('page_idx', 0)
            
            if 'para_blocks' not in page:
                continue
                
            for block in page['para_blocks']:
                block_type = block.get('type', 'text')
                content = self._extract_block_content(block)
                
                if content.strip():
                    text_blocks.append({
                        'page': page_idx,
                        'type': block_type,
                        'content': content.strip(),
                        'bbox': block.get('bbox', [])
                    })
        
        return text_blocks
    
    def _extract_block_content(self, block: Dict) -> str:
        """提取块内容"""
        content_parts = []
        
        # 处理普通文本块
        if 'lines' in block:
            for line in block['lines']:
                if 'spans' in line:
                    for span in line['spans']:
                        if 'content' in span:
                            content_parts.append(span['content'])
        
        # 处理列表块
        if 'blocks' in block:
            for sub_block in block['blocks']:
                sub_content = self._extract_block_content(sub_block)
                if sub_content:
                    content_parts.append(sub_content)
        
        return ' '.join(content_parts)
    
    def _parse_structure(self, text_blocks: List[Dict]):
        """解析文档结构"""
        current_chapter_id = ""
        current_section_id = ""
        current_content = []
        
        for block in text_blocks:
            content = block['content']
            block_type = block['type']
            
            # 检测章节标题
            chapter_match = self.chapter_pattern.search(content)
            if chapter_match or (block_type == 'title' and '章' in content):
                # 保存之前的内容
                if current_content and current_section_id:
                    self._save_section_content(current_chapter_id, current_section_id, current_content)
                    current_content = []
                
                # 解析章节
                if chapter_match:
                    chapter_num = self._chinese_to_num(chapter_match.group(1))
                    chapter_title = chapter_match.group(2).strip()
                else:
                    # 尝试从内容中提取
                    chapter_num = len(self.chapters) + 1
                    chapter_title = content
                
                current_chapter_id = str(chapter_num)
                self.chapters.append({
                    'id': current_chapter_id,
                    'title': chapter_title,
                    'sections': []
                })
                continue
            
            # 检测小节标题
            section_match = self.section_pattern.search(content)
            if section_match:
                # 保存之前的内容
                if current_content and current_section_id:
                    self._save_section_content(current_chapter_id, current_section_id, current_content)
                    current_content = []
                
                section_num = self._chinese_to_num(section_match.group(1))
                section_title = section_match.group(2).strip()
                current_section_id = f"{current_chapter_id}.{section_num}"
                
                if self.chapters:
                    self.chapters[-1]['sections'].append({
                        'id': current_section_id,
                        'title': section_title,
                        'content': [],
                        'knowledge_points': []
                    })
                continue
            
            # 收集内容
            if current_chapter_id:
                current_content.append({
                    'type': block_type,
                    'content': content,
                    'page': block['page']
                })
        
        # 保存最后的内容
        if current_content and current_section_id:
            self._save_section_content(current_chapter_id, current_section_id, current_content)
    
    def _save_section_content(self, chapter_id: str, section_id: str, content: List[Dict]):
        """保存小节内容并提取知识点"""
        for chapter in self.chapters:
            if chapter['id'] == chapter_id:
                for section in chapter['sections']:
                    if section['id'] == section_id:
                        section['content'] = content
                        # 提取知识点
                        section['knowledge_points'] = self._extract_knowledge_points(
                            section_id, content
                        )
                        break
                break
    
    def _extract_knowledge_points(self, section_id: str, content: List[Dict]) -> List[Dict]:
        """从内容中提取知识点"""
        knowledge_points = []
        current_drug = None
        point_counter = 1
        
        full_text = ' '.join([c['content'] for c in content])
        
        # 检测药物名称（通常是标题或加粗文本）
        drug_patterns = [
            r'([一二三四五六七八九十\d]+)[、.．]\s*(\S+)',  # 如 "一、阿司匹林"
            r'【(\S+)】',  # 如 "【阿司匹林】"
            r'考点\d+\s+(\S+)',  # 如 "考点1 阿司匹林"
        ]
        
        for block in content:
            text = block['content']
            
            # 检测药物名称
            for pattern in drug_patterns:
                match = re.search(pattern, text)
                if match:
                    current_drug = match.group(1) if len(match.groups()) == 1 else match.group(2)
                    break
            
            # 检测知识点类型并提取
            for point_type, keywords in self.type_keywords.items():
                for keyword in keywords:
                    if keyword in text:
                        point_id = f"{section_id}.{point_counter}"
                        importance = self._calculate_importance(text)
                        
                        knowledge_points.append({
                            'id': point_id,
                            'title': f"{current_drug or ''}的{point_type}" if current_drug else point_type,
                            'content': text,
                            'point_type': point_type,
                            'drug_name': current_drug or '',
                            'importance': importance,
                            'section_id': section_id
                        })
                        point_counter += 1
                        break
        
        return knowledge_points
    
    def _calculate_importance(self, text: str) -> int:
        """计算知识点重要性"""
        score = 3  # 默认3星
        
        for keyword in self.importance_keywords:
            if keyword in text:
                score += 0.5
        
        # 限制在1-5之间
        return min(5, max(1, int(score)))
    
    def _chinese_to_num(self, chinese: str) -> int:
        """中文数字转阿拉伯数字"""
        mapping = {
            '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
            '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
            '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15
        }
        return mapping.get(chinese, 1)
    
    def _build_knowledge_tree(self) -> Dict:
        """构建知识树"""
        tree = {
            'subject': '药学专业知识（二）',
            'subject_code': 'xiyao_yaoxue_er',
            'chapters': []
        }
        
        for chapter in self.chapters:
            chapter_node = {
                'id': chapter['id'],
                'title': chapter['title'],
                'sections': []
            }
            
            for section in chapter.get('sections', []):
                section_node = {
                    'id': section['id'],
                    'title': section['title'],
                    'knowledge_points': section.get('knowledge_points', [])
                }
                chapter_node['sections'].append(section_node)
            
            tree['chapters'].append(chapter_node)
        
        return tree
    
    def export_to_json(self, output_path: str):
        """导出为JSON文件"""
        tree = self._build_knowledge_tree()
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(tree, f, ensure_ascii=False, indent=2)
        
        print(f"知识树已导出到: {output_path}")
        return tree
    
    def export_for_database(self, output_path: str):
        """导出为数据库导入格式"""
        tree = self._build_knowledge_tree()
        
        # 扁平化为数据库记录
        records = []
        
        for chapter in tree['chapters']:
            # 章节记录
            records.append({
                'type': 'chapter',
                'id': chapter['id'],
                'title': chapter['title'],
                'parent_id': None,
                'subject_code': tree['subject_code']
            })
            
            for section in chapter['sections']:
                # 小节记录
                records.append({
                    'type': 'section',
                    'id': section['id'],
                    'title': section['title'],
                    'parent_id': chapter['id'],
                    'subject_code': tree['subject_code']
                })
                
                for point in section['knowledge_points']:
                    # 知识点记录
                    records.append({
                        'type': 'knowledge_point',
                        'id': point['id'],
                        'title': point['title'],
                        'content': point['content'],
                        'point_type': point['point_type'],
                        'drug_name': point['drug_name'],
                        'importance': point['importance'],
                        'parent_id': section['id'],
                        'subject_code': tree['subject_code']
                    })
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(records, f, ensure_ascii=False, indent=2)
        
        print(f"数据库记录已导出到: {output_path}")
        print(f"总记录数: {len(records)}")
        return records


def main():
    """主函数"""
    # 输入文件路径
    input_path = "shuju/西药药二1-50页.json"
    
    # 输出文件路径
    tree_output = "shuju/西药药二_知识树.json"
    db_output = "shuju/西药药二_数据库记录.json"
    
    # 创建提取器
    extractor = KnowledgeExtractor()
    
    # 提取知识点
    print("开始提取知识点...")
    tree = extractor.extract_from_json(input_path)
    
    # 导出知识树
    extractor.export_to_json(tree_output)
    
    # 导出数据库格式
    extractor.export_for_database(db_output)
    
    # 打印统计信息
    print("\n=== 提取统计 ===")
    print(f"章节数: {len(tree['chapters'])}")
    total_sections = sum(len(c['sections']) for c in tree['chapters'])
    print(f"小节数: {total_sections}")
    total_points = sum(
        len(s['knowledge_points']) 
        for c in tree['chapters'] 
        for s in c['sections']
    )
    print(f"知识点数: {total_points}")
    
    # 打印章节目录
    print("\n=== 章节目录 ===")
    for chapter in tree['chapters']:
        print(f"\n{chapter['id']}. {chapter['title']}")
        for section in chapter['sections']:
            print(f"  {section['id']} {section['title']}")
            if section['knowledge_points']:
                print(f"    └─ 知识点: {len(section['knowledge_points'])}个")


if __name__ == "__main__":
    main()
