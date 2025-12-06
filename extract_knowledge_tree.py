#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从西药药二PDF解析JSON中提取知识点，构建树状知识体系
"""

import json
import re
from typing import Dict, List, Optional, Any
from collections import defaultdict

class KnowledgeTreeExtractor:
    def __init__(self):
        # 章节匹配模式
        self.chapter_pattern = re.compile(r'第[一二三四五六七八九十]+章\s+([^/]+)')
        self.section_pattern = re.compile(r'第[一二三四五六七八九十]+节\s+([^\n]+)')
        
        # 知识点类型关键词
        self.knowledge_types = {
            '适应证': ['适应证', '适应症', '用于', '适用于', '治疗'],
            '禁忌': ['禁忌', '禁用', '慎用', '禁止', '不宜'],
            '不良反应': ['不良反应', '副作用', '毒性', '常见', '偶见', '罕见'],
            '临床应用': ['临床应用', '用药注意', '注意事项', '用药指导'],
            '用法用量': ['用法', '用量', '剂量', '给药', '服用'],
            '药物相互作用': ['相互作用', '合用', '联用', '配伍'],
            '作用机制': ['作用机制', '药理作用', '作用特点', '机制'],
            '记忆口诀': ['润德巧记', '记忆口诀', '巧记', '口诀']
        }
        
        # 高频考点关键词
        self.high_freq_keywords = [
            '首选', '一线', '金标准', '最常用', '主要', '重要',
            '严重', '禁忌', '禁用', '特别注意', '重点',
            '相互作用', '配伍禁忌', '常见', '典型'
        ]
        
        # 药物名称模式（常见药物后缀）
        self.drug_suffixes = ['片', '胶囊', '注射液', '颗粒', '口服液', '栓', '膏', '散', '丸']
        
    def extract_text_from_json(self, json_data: Dict) -> str:
        """从JSON数据中提取所有文本内容"""
        text_parts = []
        
        if 'pdf_info' in json_data:
            for page in json_data['pdf_info']:
                if 'para_blocks' in page:
                    for block in page['para_blocks']:
                        # 处理普通文本块
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
                        # 处理列表块
                        elif 'blocks' in block:
                            for sub_block in block['blocks']:
                                if 'lines' in sub_block:
                                    for line in sub_block['lines']:
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
            for page in json_data['pdf_info']:
                if 'para_blocks' in page:
                    for block in page['para_blocks']:
                        # 处理普通文本块
                        if 'lines' in block:
                            for line in block['lines']:
                                if 'spans' in line:
                                    for span in line['spans']:
                                        if 'html' in span:
                                            tables.append({
                                                'html': span['html'],
                                                'content': span.get('content', ''),
                                                'page_idx': page.get('page_idx', 0)
                                            })
                        # 处理列表块
                        elif 'blocks' in block:
                            for sub_block in block['blocks']:
                                if 'lines' in sub_block:
                                    for line in sub_block['lines']:
                                        if 'spans' in line:
                                            for span in line['spans']:
                                                if 'html' in span:
                                                    tables.append({
                                                        'html': span['html'],
                                                        'content': span.get('content', ''),
                                                        'page_idx': page.get('page_idx', 0)
                                                    })
        
        return tables
    
    def parse_chapters(self, text: str) -> List[Dict]:
        """解析章节结构"""
        chapters = []
        lines = text.split('\n')
        
        current_chapter = None
        current_section = None
        chapter_counter = 0
        section_counter = 0
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            
            # 匹配章节（支持多种格式）
            chapter_match = self.chapter_pattern.search(line)
            if chapter_match:
                if current_chapter:
                    if current_section:
                        current_chapter['sections'].append(current_section)
                    chapters.append(current_chapter)
                
                chapter_counter += 1
                chapter_name = chapter_match.group(1).strip()
                # 清理章节名称（移除页码等）
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
                # 清理节名称（移除页码等）
                section_name = re.sub(r'\s+\d+$', '', section_name).strip()
                section_name = re.sub(r'\.\s*$', '', section_name).strip()
                
                current_section = {
                    'section_id': section_counter,
                    'section_name': section_name,
                    'knowledge_points': []
                }
                continue
        
        # 添加最后一个章节和节
        if current_section and current_chapter:
            current_chapter['sections'].append(current_section)
        if current_chapter:
            chapters.append(current_chapter)
        
        return chapters
    
    def extract_drug_name(self, text: str) -> Optional[str]:
        """提取药物名称"""
        # 常见药物名称模式
        drug_patterns = [
            r'([A-Za-z\u4e00-\u9fa5]+(?:片|胶囊|注射液|颗粒|口服液|栓|膏|散|丸|钠|钾|素|醇|胺|酮|酸|碱|酯|苷))',
            r'([A-Za-z\u4e00-\u9fa5]{2,8}(?:替丁|拉唑|洛尔|地平|普利|沙坦|他汀|西林|霉素|头孢))',
        ]
        
        for pattern in drug_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        
        return None
    
    def classify_knowledge_type(self, text: str) -> List[str]:
        """分类知识点类型"""
        types = []
        text_lower = text.lower()
        
        for ktype, keywords in self.knowledge_types.items():
            if any(keyword in text for keyword in keywords):
                types.append(ktype)
        
        return types if types else ['其他']
    
    def calculate_importance(self, text: str) -> int:
        """计算重要性等级（1-5星）"""
        score = 3  # 默认3星
        
        # 根据关键词加分
        for keyword in self.high_freq_keywords:
            if keyword in text:
                score += 0.3
        
        # 根据是否有表格对比加分
        if '对比' in text or '重点强化' in text or '表格' in text:
            score += 1
        
        # 根据记忆口诀加分
        if '巧记' in text or '口诀' in text:
            score += 0.5
        
        # 限制在1-5之间
        return min(5, max(1, int(score)))
    
    def extract_structured_knowledge(self, text: str, tables: List[Dict]) -> Dict:
        """提取结构化知识点"""
        knowledge = {
            'drug_name': self.extract_drug_name(text),
            'knowledge_types': self.classify_knowledge_type(text),
            'importance_level': self.calculate_importance(text),
            'content': text[:500] if len(text) > 500 else text,  # 限制长度
            'structured_data': {}
        }
        
        # 提取适应证
        indications = self._extract_indications(text)
        if indications:
            knowledge['structured_data']['indications'] = indications
        
        # 提取禁忌
        contraindications = self._extract_contraindications(text)
        if contraindications:
            knowledge['structured_data']['contraindications'] = contraindications
        
        # 提取不良反应
        adverse_reactions = self._extract_adverse_reactions(text)
        if adverse_reactions:
            knowledge['structured_data']['adverse_reactions'] = adverse_reactions
        
        # 提取记忆口诀
        memory_tips = self._extract_memory_tips(text)
        if memory_tips:
            knowledge['structured_data']['memory_tips'] = memory_tips
        
        # 从表格中提取信息
        if tables:
            knowledge['structured_data']['tables'] = self._parse_tables(tables)
        
        return knowledge
    
    def _extract_indications(self, text: str) -> List[Dict]:
        """提取适应证"""
        indications = []
        
        # 查找浓度相关的适应证
        pattern = r'(\d+(?:\.\d+)?%)\s*[：:]\s*(.+?)(?=\n|$)'
        matches = re.findall(pattern, text)
        
        for concentration, usage in matches:
            indications.append({
                'type': '浓度特定',
                'concentration': concentration,
                'description': usage.strip(),
                'is_high_freq': any(kw in usage for kw in ['首选', '一线'])
            })
        
        # 查找列表项
        list_pattern = r'[①-⑩]\s*(.+?)(?=[②-⑩]|$)'
        matches = re.findall(list_pattern, text)
        
        for item in matches:
            if '适应证' in text or '用于' in item or '治疗' in item:
                indications.append({
                    'type': '列表项',
                    'description': item.strip(),
                    'is_high_freq': self._is_high_frequency(item)
                })
        
        return indications
    
    def _extract_contraindications(self, text: str) -> List[str]:
        """提取禁忌"""
        contraindications = []
        
        # 查找禁忌相关内容
        if '禁忌' in text or '禁用' in text or '慎用' in text:
            # 提取列表项
            list_pattern = r'[①-⑩]\s*([^②-⑩]+?)(?=[②-⑩]|$)'
            matches = re.findall(list_pattern, text)
            
            for item in matches:
                if any(kw in item for kw in ['禁用', '慎用', '禁忌', '不宜']):
                    contraindications.append(item.strip())
        
        return contraindications
    
    def _extract_adverse_reactions(self, text: str) -> Dict:
        """提取不良反应"""
        reactions = {
            'common': [],
            'serious': [],
            'prevention': []
        }
        
        lines = text.split('\n')
        for line in lines:
            line_lower = line.lower()
            
            if any(word in line for word in ['不良反应', '副作用', '毒性']):
                if '常见' in line or '多见' in line:
                    reactions['common'].append(line.strip())
                elif '严重' in line or '危险' in line or '致死' in line:
                    reactions['serious'].append(line.strip())
                elif '注意' in line or '预防' in line or '避免' in line:
                    reactions['prevention'].append(line.strip())
        
        return reactions
    
    def _extract_memory_tips(self, text: str) -> List[str]:
        """提取记忆口诀"""
        tips = []
        
        # 查找润德巧记
        pattern = r'【润德巧记】[：:]?\s*([^\n]+)'
        matches = re.findall(pattern, text)
        tips.extend(matches)
        
        # 查找其他记忆口诀
        pattern2 = r'记忆口诀[：:]?\s*([^\n]+)'
        matches2 = re.findall(pattern2, text)
        tips.extend(matches2)
        
        return tips
    
    def _parse_tables(self, tables: List[Dict]) -> List[Dict]:
        """解析表格内容"""
        parsed_tables = []
        
        for table in tables:
            html = table.get('html', '')
            if '<table>' in html:
                # 简单提取表格文本
                # 移除HTML标签
                text = re.sub(r'<[^>]+>', ' ', html)
                text = re.sub(r'\s+', ' ', text).strip()
                
                parsed_tables.append({
                    'type': 'table',
                    'content': text[:1000]  # 限制长度
                })
        
        return parsed_tables
    
    def _is_high_frequency(self, text: str) -> bool:
        """判断是否为高频考点"""
        return any(keyword in text for keyword in self.high_freq_keywords)
    
    def build_knowledge_tree(self, json_file_path: str) -> Dict:
        """构建知识树"""
        print(f"📖 正在读取文件: {json_file_path}")
        
        with open(json_file_path, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        print("📝 正在提取文本内容...")
        text = self.extract_text_from_json(json_data)
        
        print("📊 正在提取表格内容...")
        tables = self.extract_html_tables(json_data)
        
        print("🌳 正在解析章节结构...")
        chapters = self.parse_chapters(text)
        
        print("🔍 正在识别知识点...")
        # 按章节和节组织知识点
        knowledge_tree = {
            'title': '西药药二知识点体系',
            'chapters': []
        }
        
        # 将文本按章节分割
        chapter_texts = re.split(r'第[一二三四五六七八九十]+章', text)
        
        for i, chapter in enumerate(chapters):
            chapter_id = chapter['chapter_id']
            chapter_name = chapter['chapter_name']
            
            print(f"  处理第{chapter_id}章: {chapter_name}")
            
            chapter_data = {
                'chapter_id': f"第{chapter_id}章",
                'chapter_name': chapter_name,
                'sections': []
            }
            
            # 获取该章节的文本内容
            chapter_text = chapter_texts[i] if i < len(chapter_texts) else ''
            
            # 处理每个节
            for section in chapter['sections']:
                section_id = section['section_id']
                section_name = section['section_name']
                
                print(f"    处理第{section_id}节: {section_name}")
                
                section_data = {
                    'section_id': f"{chapter_id}.{section_id}",
                    'section_name': section_name,
                    'knowledge_points': []
                }
                
                # 在该节的文本中查找知识点
                # 使用更灵活的匹配策略
                section_keywords = section_name[:5]  # 使用节名称的前几个字作为关键词
                
                # 尝试多种匹配方式
                section_patterns = [
                    re.compile(rf'{re.escape(section_keywords)}.*?(?=第[一二三四五六七八九十]+节|第[一二三四五六七八九十]+章|$)', re.DOTALL),
                    re.compile(rf'{re.escape(section_name)}.*?(?=第[一二三四五六七八九十]+节|第[一二三四五六七八九十]+章|$)', re.DOTALL),
                ]
                
                section_text = ''
                for pattern in section_patterns:
                    match = pattern.search(chapter_text)
                    if match:
                        section_text = match.group(0)
                        break
                
                # 如果没找到，尝试在整个文本中搜索
                if not section_text:
                    # 查找包含节名称关键词的文本段
                    lines = chapter_text.split('\n')
                    start_idx = -1
                    for idx, line in enumerate(lines):
                        if section_keywords in line:
                            start_idx = idx
                            break
                    
                    if start_idx >= 0:
                        # 获取后续的文本，直到下一个节或章
                        end_idx = len(lines)
                        for idx in range(start_idx + 1, len(lines)):
                            if (re.search(r'第[一二三四五六七八九十]+节', lines[idx]) or 
                                re.search(r'第[一二三四五六七八九十]+章', lines[idx])):
                                end_idx = idx
                                break
                        section_text = '\n'.join(lines[start_idx:end_idx])
                
                if section_text:
                    # 提取知识点
                    # 按段落分割（使用多个换行或特定标记）
                    paragraphs = re.split(r'\n{2,}|【|考点|项目|具体内容', section_text)
                    
                    point_id = 1
                    for para in paragraphs:
                        para = para.strip()
                        if len(para) < 50:  # 跳过太短的段落
                            continue
                        
                        # 检查是否包含知识点关键词
                        has_keyword = any(kw in para for kw in [
                            '适应证', '禁忌', '不良反应', '临床应用', '用法', '用量',
                            '相互作用', '作用机制', '作用特点', '典型', '药物',
                            '润德巧记', '记忆口诀', '作用', '治疗', '用于', '适用于'
                        ])
                        
                        if has_keyword:
                            # 获取相关的表格（简化处理，使用所有表格）
                            knowledge = self.extract_structured_knowledge(para, tables)
                            
                            # 如果提取到了有效信息，添加到知识点列表
                            if (knowledge['drug_name'] or 
                                knowledge['knowledge_types'] != ['其他'] or
                                knowledge['structured_data'] or
                                len(para) > 100):  # 长段落也认为是知识点
                                knowledge['point_id'] = f"{chapter_id}.{section_id}.{point_id}"
                                knowledge['point_title'] = self._generate_point_title(para)
                                knowledge['full_content'] = para[:2000]  # 保存完整内容（限制长度）
                                section_data['knowledge_points'].append(knowledge)
                                point_id += 1
                
                # 将节添加到章节中
                if section_data['knowledge_points']:
                    chapter_data['sections'].append(section_data)
            
            # 将章节添加到知识树中
            if chapter_data['sections']:
                knowledge_tree['chapters'].append(chapter_data)
        
        return knowledge_tree
    
    def _generate_point_title(self, text: str) -> str:
        """生成知识点标题"""
        # 尝试提取第一句话作为标题
        sentences = re.split(r'[。！？\n]', text)
        if sentences:
            title = sentences[0].strip()
            if len(title) > 50:
                title = title[:50] + '...'
            return title
        return '知识点'
    
    def save_knowledge_tree(self, knowledge_tree: Dict, output_file: str):
        """保存知识树到JSON文件"""
        print(f"\n💾 正在保存知识树到: {output_file}")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(knowledge_tree, f, ensure_ascii=False, indent=2)
        
        # 统计信息
        total_chapters = len(knowledge_tree['chapters'])
        total_sections = sum(len(ch['sections']) for ch in knowledge_tree['chapters'])
        total_points = sum(
            len(sec['knowledge_points'])
            for ch in knowledge_tree['chapters']
            for sec in ch['sections']
        )
        
        print(f"\n✅ 知识树构建完成！")
        print(f"   📚 章节数: {total_chapters}")
        print(f"   📖 节数: {total_sections}")
        print(f"   🎯 知识点数: {total_points}")
        print(f"   💾 已保存到: {output_file}")


def main():
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    
    extractor = KnowledgeTreeExtractor()
    
    input_file = r'e:\tiku\shuju\西药药二1-50页.json'
    output_file = r'e:\tiku\shuju\西药药二知识树.json'
    
    print("=" * 60)
    print("开始构建知识树...")
    print("=" * 60)
    
    try:
        knowledge_tree = extractor.build_knowledge_tree(input_file)
        extractor.save_knowledge_tree(knowledge_tree, output_file)
        
        print("\n🎉 处理完成！")
        
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
