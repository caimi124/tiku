# -*- coding: utf-8 -*-
"""
西药药二知识点提取脚本 V2
更精确地从PDF解析JSON中提取结构化知识点
"""

import json
import re
from typing import Dict, List, Optional
from dataclasses import dataclass, field

@dataclass
class KnowledgePoint:
    """知识点"""
    id: str
    title: str
    content: str
    point_type: str = ""  # 适应证/禁忌/不良反应/用法用量/注意事项/相互作用
    drug_name: str = ""
    importance: int = 3
    memory_tips: str = ""

@dataclass
class Section:
    """小节"""
    id: str
    title: str
    points: List[Dict] = field(default_factory=list)

@dataclass
class Chapter:
    """章节"""
    id: str
    title: str
    sections: List[Section] = field(default_factory=list)


class KnowledgeExtractorV2:
    """知识点提取器V2"""
    
    def __init__(self):
        self.chapters = []
        self.all_text_by_page = {}
        
        # 正则模式
        self.patterns = {
            'chapter': re.compile(r'第([一二三四五六七八九十]+)章\s*(.+?)(?:\s*//|$)'),
            'section': re.compile(r'第([一二三四五六七八九十]+)节\s*(.+?)(?:\s*\d+|$)'),
            'point': re.compile(r'考点(\d+)\s*(.+)'),
            'drug_eval': re.compile(r'(.+?)的临床用药评价'),
            'memory': re.compile(r'【润德巧记】(.+?)(?=考点|$)', re.DOTALL),
        }
        
        # 知识点类型关键词
        self.type_patterns = {
            '适应证': [r'适应证', r'适应症', r'用于治疗', r'主要用于', r'临床用于'],
            '禁忌': [r'禁忌', r'禁用于', r'不宜用于', r'慎用'],
            '不良反应': [r'不良反应', r'副作用', r'毒性反应', r'常见不良'],
            '用法用量': [r'用法', r'用量', r'剂量', r'给药途径', r'口服', r'静脉'],
            '注意事项': [r'注意事项', r'临床应用注意', r'使用注意', r'警告'],
            '相互作用': [r'相互作用', r'药物相互', r'配伍', r'联合用药'],
            '作用机制': [r'作用机制', r'药理作用', r'机制', r'通过抑制', r'通过阻断'],
        }
        
        # 重要性关键词
        self.importance_keywords = {
            5: ['首选', '一线药物', '金标准', '最常用'],
            4: ['禁忌', '禁用', '严重', '致死', '特别注意', '相互作用'],
            3: ['常用', '主要', '重要'],
        }
        
        # 中文数字映射
        self.cn_num = {
            '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
            '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
            '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15,
            '十六': 16, '十七': 17, '十八': 18, '十九': 19, '二十': 20
        }
    
    def extract_from_json(self, json_path: str) -> Dict:
        """从JSON提取知识点"""
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 1. 提取所有页面文本
        self._extract_all_text(data)
        
        # 2. 解析目录结构（从前几页）
        self._parse_toc()
        
        # 3. 解析正文内容
        self._parse_content()
        
        # 4. 构建知识树
        return self._build_tree()
    
    def _extract_all_text(self, data: Dict):
        """提取所有页面文本"""
        for page in data.get('pdf_info', []):
            page_idx = page.get('page_idx', 0)
            texts = []
            
            for block in page.get('para_blocks', []):
                text = self._get_block_text(block)
                if text.strip():
                    texts.append({
                        'text': text.strip(),
                        'type': block.get('type', 'text')
                    })
            
            self.all_text_by_page[page_idx] = texts
    
    def _get_block_text(self, block: Dict) -> str:
        """获取块文本"""
        parts = []
        
        if 'lines' in block:
            for line in block['lines']:
                for span in line.get('spans', []):
                    if 'content' in span:
                        parts.append(span['content'])
        
        if 'blocks' in block:
            for sub in block['blocks']:
                parts.append(self._get_block_text(sub))
        
        return ' '.join(parts)
    
    def _parse_toc(self):
        """解析目录"""
        # 目录通常在前5页
        toc_text = ""
        for page_idx in range(min(6, len(self.all_text_by_page))):
            for item in self.all_text_by_page.get(page_idx, []):
                toc_text += item['text'] + "\n"
        
        # 提取章节
        for match in self.patterns['chapter'].finditer(toc_text):
            cn_num = match.group(1)
            title = match.group(2).strip()
            chapter_id = str(self.cn_num.get(cn_num, len(self.chapters) + 1))
            
            # 避免重复
            if not any(c['id'] == chapter_id for c in self.chapters):
                self.chapters.append({
                    'id': chapter_id,
                    'title': title,
                    'sections': []
                })
        
        print(f"从目录解析到 {len(self.chapters)} 个章节")
    
    def _parse_content(self):
        """解析正文内容"""
        current_chapter = None
        current_section = None
        current_point = None
        content_buffer = []
        
        # 从第6页开始是正文
        for page_idx in range(6, len(self.all_text_by_page)):
            for item in self.all_text_by_page.get(page_idx, []):
                text = item['text']
                
                # 检测小节标题
                section_match = self.patterns['section'].search(text)
                if section_match:
                    # 保存之前的内容
                    if current_point and content_buffer:
                        current_point['content'] = '\n'.join(content_buffer)
                        self._classify_point(current_point)
                        content_buffer = []
                    
                    cn_num = section_match.group(1)
                    section_title = section_match.group(2).strip()
                    section_num = self.cn_num.get(cn_num, 1)
                    
                    # 确定所属章节
                    current_chapter = self._find_chapter_for_section(section_title)
                    if current_chapter:
                        section_id = f"{current_chapter['id']}.{section_num}"
                        current_section = {
                            'id': section_id,
                            'title': section_title,
                            'points': []
                        }
                        current_chapter['sections'].append(current_section)
                        current_point = None
                    continue
                
                # 检测考点
                point_match = self.patterns['point'].search(text)
                if point_match and current_section:
                    # 保存之前的内容
                    if current_point and content_buffer:
                        current_point['content'] = '\n'.join(content_buffer)
                        self._classify_point(current_point)
                        content_buffer = []
                    
                    point_num = point_match.group(1)
                    point_title = point_match.group(2).strip()
                    point_id = f"{current_section['id']}.{point_num}"
                    
                    current_point = {
                        'id': point_id,
                        'title': point_title,
                        'content': '',
                        'point_type': '',
                        'drug_name': '',
                        'importance': 3,
                        'memory_tips': ''
                    }
                    current_section['points'].append(current_point)
                    
                    # 检测药物名称
                    drug_match = self.patterns['drug_eval'].search(point_title)
                    if drug_match:
                        current_point['drug_name'] = drug_match.group(1)
                    continue
                
                # 检测记忆口诀
                memory_match = self.patterns['memory'].search(text)
                if memory_match and current_point:
                    current_point['memory_tips'] = memory_match.group(1).strip()
                
                # 收集内容
                if current_point and text.strip():
                    content_buffer.append(text.strip())
        
        # 保存最后的内容
        if current_point and content_buffer:
            current_point['content'] = '\n'.join(content_buffer)
            self._classify_point(current_point)
    
    def _find_chapter_for_section(self, section_title: str) -> Optional[Dict]:
        """根据小节标题找到所属章节"""
        # 关键词映射
        keyword_chapter = {
            '解热': '2', '镇痛': '2', '抗炎': '2', '抗风湿': '2', '抗痛风': '2',
            '镇咳': '3', '祛痰': '3', '平喘': '3', '呼吸': '3', '肺纤维化': '3',
            '抑酸': '4', '胃': '4', '肠': '4', '消化': '4', '肝胆': '4', '止吐': '4',
            '心律': '5', '高血压': '5', '血脂': '5', '心绞痛': '5', '心力衰竭': '5',
            '血栓': '6', '出血': '6', '贫血': '6', '白细胞': '6', '骨髓': '6',
            '利尿': '7', '前列腺': '7', '勃起': '7', '膀胱': '7',
            '垂体': '8', '糖皮质': '8', '甲状腺': '8', '胰岛素': '8', '血糖': '8', '骨代谢': '8', '性激素': '8',
            '抗菌': '9', '青霉素': '9', '头孢': '9', '抗感染': '9', '抗病毒': '9', '抗真菌': '9',
            '抗肿瘤': '10', 'DNA': '10', '抗代谢': '10',
            '电解质': '11', '营养': '11', '维生素': '11',
            '眼科': '12', '耳鼻': '12', '口腔': '12',
            '皮肤': '13', '抗过敏': '13',
            '镇静': '1', '催眠': '1', '中枢': '1', '精神': '1',
        }
        
        for keyword, chapter_id in keyword_chapter.items():
            if keyword in section_title:
                for chapter in self.chapters:
                    if chapter['id'] == chapter_id:
                        return chapter
        
        # 默认返回最后一个章节
        return self.chapters[-1] if self.chapters else None
    
    def _classify_point(self, point: Dict):
        """分类知识点类型"""
        content = point.get('content', '') + point.get('title', '')
        
        # 检测类型
        for ptype, patterns in self.type_patterns.items():
            for pattern in patterns:
                if re.search(pattern, content):
                    point['point_type'] = ptype
                    break
            if point['point_type']:
                break
        
        # 计算重要性
        for level, keywords in self.importance_keywords.items():
            for keyword in keywords:
                if keyword in content:
                    point['importance'] = max(point['importance'], level)
                    break
    
    def _build_tree(self) -> Dict:
        """构建知识树"""
        # 清理空章节
        valid_chapters = []
        for chapter in self.chapters:
            valid_sections = [s for s in chapter['sections'] if s['points']]
            if valid_sections:
                chapter['sections'] = valid_sections
                valid_chapters.append(chapter)
        
        tree = {
            'subject': '药学专业知识（二）',
            'subject_code': 'xiyao_yaoxue_er',
            'total_chapters': len(valid_chapters),
            'total_sections': sum(len(c['sections']) for c in valid_chapters),
            'total_points': sum(len(s['points']) for c in valid_chapters for s in c['sections']),
            'chapters': valid_chapters
        }
        
        return tree
    
    def export_to_json(self, tree: Dict, output_path: str):
        """导出JSON"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(tree, f, ensure_ascii=False, indent=2)
        print(f"已导出到: {output_path}")
    
    def export_for_database(self, tree: Dict, output_path: str):
        """导出数据库格式"""
        records = []
        
        for chapter in tree['chapters']:
            # 章节记录
            records.append({
                'type': 'chapter',
                'id': f"xiyao_er_{chapter['id']}",
                'code': chapter['id'],
                'title': chapter['title'],
                'parent_id': None,
                'subject_code': tree['subject_code'],
                'level': 1
            })
            
            for section in chapter['sections']:
                # 小节记录
                records.append({
                    'type': 'section',
                    'id': f"xiyao_er_{section['id']}",
                    'code': section['id'],
                    'title': section['title'],
                    'parent_id': f"xiyao_er_{chapter['id']}",
                    'subject_code': tree['subject_code'],
                    'level': 2
                })
                
                for point in section['points']:
                    # 知识点记录
                    records.append({
                        'type': 'knowledge_point',
                        'id': f"xiyao_er_{point['id']}",
                        'code': point['id'],
                        'title': point['title'],
                        'content': point['content'],
                        'point_type': point['point_type'],
                        'drug_name': point['drug_name'],
                        'importance': point['importance'],
                        'memory_tips': point['memory_tips'],
                        'parent_id': f"xiyao_er_{section['id']}",
                        'subject_code': tree['subject_code'],
                        'level': 3
                    })
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(records, f, ensure_ascii=False, indent=2)
        
        print(f"已导出数据库记录: {output_path}")
        print(f"总记录数: {len(records)}")
        return records
    
    def print_summary(self, tree: Dict):
        """打印摘要"""
        print("\n" + "="*60)
        print(f"📚 {tree['subject']}")
        print("="*60)
        print(f"章节数: {tree['total_chapters']}")
        print(f"小节数: {tree['total_sections']}")
        print(f"知识点数: {tree['total_points']}")
        
        print("\n📖 章节目录:")
        for chapter in tree['chapters']:
            print(f"\n第{chapter['id']}章 {chapter['title']}")
            for section in chapter['sections']:
                print(f"  ├─ {section['id']} {section['title']}")
                print(f"  │   └─ 知识点: {len(section['points'])}个")
                
                # 显示前3个知识点
                for point in section['points'][:3]:
                    importance_stars = '★' * point['importance'] + '☆' * (5 - point['importance'])
                    print(f"  │       • {point['title'][:30]}... [{importance_stars}]")
                if len(section['points']) > 3:
                    print(f"  │       ... 还有 {len(section['points']) - 3} 个知识点")


def main():
    input_path = "shuju/西药药二1-50页.json"
    tree_output = "shuju/西药药二_知识树_v2.json"
    db_output = "shuju/西药药二_数据库记录_v2.json"
    
    extractor = KnowledgeExtractorV2()
    
    print("开始提取知识点...")
    tree = extractor.extract_from_json(input_path)
    
    extractor.print_summary(tree)
    extractor.export_to_json(tree, tree_output)
    extractor.export_for_database(tree, db_output)


if __name__ == "__main__":
    main()
