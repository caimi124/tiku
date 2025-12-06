#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
西药药二知识点提取脚本 - Markdown版本
从树状复习笔记Markdown文件中提取结构化知识点

使用方法：
python extract_markdown_knowledge.py

输入：西药药二-药理学树状复习笔记.md
输出：shuju/西药药二_知识点_from_markdown.json
"""

import json
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field, asdict
from pathlib import Path
from enum import Enum


class PointType(Enum):
    """知识点类型"""
    MECHANISM = "作用机制"
    INDICATION = "适应证"
    CONTRAINDICATION = "禁忌"
    ADVERSE_REACTION = "不良反应"
    INTERACTION = "相互作用"
    PHARMACOKINETICS = "药动学"
    DOSAGE = "用法用量"
    MEMORY_TIP = "记忆口诀"
    COMPARISON = "药物对比"
    OTHER = "其他"


@dataclass
class AdverseReaction:
    """不良反应（按严重程度分级）"""
    severe: List[str] = field(default_factory=list)      # 严重
    moderate: List[str] = field(default_factory=list)    # 中度
    mild: List[str] = field(default_factory=list)        # 轻度


@dataclass
class DrugInfo:
    """药物信息"""
    name: str
    category: str = ""
    mechanism: str = ""
    pharmacokinetics: List[str] = field(default_factory=list)
    adverse_reactions: AdverseReaction = field(default_factory=AdverseReaction)
    contraindications: List[str] = field(default_factory=list)
    interactions: List[str] = field(default_factory=list)
    indications: List[str] = field(default_factory=list)
    memory_tips: List[str] = field(default_factory=list)
    importance: int = 3  # 1-5星


@dataclass
class KnowledgePoint:
    """知识点"""
    id: str
    title: str
    content: str
    point_type: str = ""
    drug_name: str = ""
    drug_category: str = ""
    importance: int = 3
    memory_tips: str = ""
    chapter_id: str = ""
    section_id: str = ""
    exam_frequency: str = ""  # 考试频率标记


@dataclass
class Section:
    """小节"""
    id: str
    title: str
    points: List[KnowledgePoint] = field(default_factory=list)


@dataclass
class Chapter:
    """章节"""
    id: str
    title: str
    sections: List[Section] = field(default_factory=list)


class MarkdownKnowledgeExtractor:
    """Markdown知识点提取器"""
    
    def __init__(self):
        self.chapters: List[Chapter] = []
        self.drugs: Dict[str, DrugInfo] = {}
        self.knowledge_points: List[KnowledgePoint] = []
        self.point_counter = 0
        
        # 正则模式
        self.patterns = {
            # 章节标题: # 第一章 xxx
            'chapter': re.compile(r'^#\s+第([一二三四五六七八九十]+)章\s+(.+)$'),
            # 小节标题: ## 🧠 第一节 xxx 或 ## 💊 第一节 xxx
            'section': re.compile(r'^##\s+[🧠💊🫁🍽️📊🎯📝]*\s*第([一二三四五六七八九十]+)节\s+(.+)$'),
            # 药物标题: #### 🔸 xxx（⭐⭐⭐⭐⭐ 高频考点）
            'drug': re.compile(r'^#{3,4}\s+[🔸🔹]*\s*(.+?)(?:（([⭐☆]+)\s*(.+?)）)?$'),
            # 具体药物名称（如 **地西泮**）
            'drug_name_bold': re.compile(r'\*\*([^*]+)\*\*'),
            # 重要性星级
            'importance': re.compile(r'[⭐]+'),
            # 记忆口诀
            'memory_tip': re.compile(r'^>\s*["""](.+?)["""]$'),
            # 表格行
            'table_row': re.compile(r'^\|(.+)\|$'),
            # 代码块开始/结束
            'code_block': re.compile(r'^```'),
            # 不良反应分级
            'adverse_severe': re.compile(r'[🔴]\s*严重'),
            'adverse_moderate': re.compile(r'[🟡]\s*中度'),
            'adverse_mild': re.compile(r'[🟢]\s*轻度'),
        }
        
        # 已知药物名称列表（用于精确匹配）
        self.known_drugs = [
            # 镇静催眠药
            '地西泮', '艾司唑仑', '三唑仑', '咪达唑仑', '劳拉西泮', '氯硝西泮',
            '唑吡坦', '佐匹克隆', '扎来普隆', '雷美替胺',
            '苯巴比妥', '司可巴比妥', '水合氯醛',
            '巴氯芬', '替扎尼定', '乙哌立松',
            # 抗癫痫药
            '卡马西平', '奥卡西平', '苯妥英钠', '丙戊酸钠', '拉莫三嗪',
            '左乙拉西坦', '托吡酯', '加巴喷丁', '普瑞巴林', '乙琥胺',
            # 抗抑郁药
            '氟西汀', '帕罗西汀', '舍曲林', '西酞普兰', '艾司西酞普兰',
            '文拉法辛', '度洛西汀', '米氮平', '阿米替林', '丙米嗪',
            # 镇痛药
            '吗啡', '芬太尼', '舒芬太尼', '瑞芬太尼', '羟考酮', '氢吗啡酮',
            '哌替啶', '曲马多', '可待因', '丁丙诺啡', '纳洛酮', '纳曲酮',
            # 抗帕金森药
            '左旋多巴', '卡比多巴', '苄丝肼', '普拉克索', '罗匹尼罗',
            '司来吉兰', '雷沙吉兰', '恩他卡朋', '苯海索', '金刚烷胺',
            # 抗精神病药
            '氯丙嗪', '氟哌啶醇', '利培酮', '奥氮平', '喹硫平',
            '阿立哌唑', '齐拉西酮', '氯氮平', '碳酸锂',
            # NSAIDs
            '阿司匹林', '布洛芬', '萘普生', '吲哚美辛', '双氯芬酸',
            '塞来昔布', '依托考昔', '美洛昔康', '对乙酰氨基酚',
            # 抗痛风药
            '秋水仙碱', '别嘌醇', '非布司他', '苯溴马隆', '丙磺舒',
            # 抗风湿药
            '甲氨蝶呤', '来氟米特', '柳氮磺吡啶', '羟氯喹',
            # 镇咳药
            '右美沙芬', '喷托维林', '苯丙哌林',
            # 祛痰药
            '氨溴索', '溴己新', '乙酰半胱氨酸', '羧甲司坦', '愈创甘油醚',
            # 平喘药
            '沙丁胺醇', '特布他林', '沙美特罗', '福莫特罗', '茚达特罗',
            '异丙托溴铵', '噻托溴铵', '氨茶碱', '多索茶碱',
            '布地奈德', '氟替卡松', '倍氯米松', '孟鲁司特', '扎鲁司特',
            '色甘酸钠', '奥马珠单抗',
            # 消化系统
            '奥美拉唑', '兰索拉唑', '泮托拉唑', '雷贝拉唑', '艾司奥美拉唑',
            '伏诺拉生', '西咪替丁', '雷尼替丁', '法莫替丁',
            '硫糖铝', '枸橼酸铋钾', '米索前列醇', '铝碳酸镁',
            '甲氧氯普胺', '多潘立酮', '莫沙必利', '伊托必利',
            '昂丹司琼', '格拉司琼', '帕洛诺司琼', '阿瑞匹坦',
            '乳果糖', '聚乙二醇', '比沙可啶', '洛哌丁胺', '蒙脱石散',
        ]
        
        # 中文数字映射
        self.cn_num_map = {
            '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
            '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
            '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15
        }
        
        # 知识点类型关键词
        self.type_keywords = {
            PointType.MECHANISM: ['作用机制', '机制', '原理', '通过'],
            PointType.INDICATION: ['适应证', '适应症', '用于', '治疗'],
            PointType.CONTRAINDICATION: ['禁忌', '禁用', '不宜', '慎用'],
            PointType.ADVERSE_REACTION: ['不良反应', '副作用', '毒性'],
            PointType.INTERACTION: ['相互作用', '配伍', '合用', '联用'],
            PointType.PHARMACOKINETICS: ['药动学', '半衰期', '代谢', '吸收', '分布'],
            PointType.DOSAGE: ['用法', '用量', '剂量', '给药'],
            PointType.MEMORY_TIP: ['记忆口诀', '口诀', '巧记'],
        }
        
        # 高频考点关键词（用于计算重要性）
        self.importance_keywords = {
            5: ['首选', '一线', '金标准', '最常用', '高频考点', '⭐⭐⭐⭐⭐'],
            4: ['禁忌', '禁用', '严重', '致死', '特别注意', '相互作用', '⭐⭐⭐⭐'],
            3: ['常用', '主要', '重要', '⭐⭐⭐'],
        }
    
    def cn_to_num(self, cn: str) -> int:
        """中文数字转阿拉伯数字"""
        return self.cn_num_map.get(cn, 1)
    
    def count_stars(self, text: str) -> int:
        """计算星级数量"""
        stars = text.count('⭐')
        return min(5, max(1, stars)) if stars > 0 else 3
    
    def calculate_importance(self, text: str) -> int:
        """计算知识点重要性"""
        # 先检查星级标记
        stars = self.count_stars(text)
        if stars >= 4:
            return stars
        
        # 再检查关键词
        for level, keywords in self.importance_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    return level
        
        return 3  # 默认3星
    
    def detect_point_type(self, text: str) -> str:
        """检测知识点类型"""
        for ptype, keywords in self.type_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    return ptype.value
        return PointType.OTHER.value
    
    def extract_from_markdown(self, md_path: str) -> Dict:
        """从Markdown文件提取知识点"""
        print(f"正在读取 {md_path}...")
        
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        print(f"共 {len(lines)} 行")
        
        # 解析文档结构
        self._parse_structure(lines)
        
        # 构建知识树
        return self._build_tree()
    
    def _parse_structure(self, lines: List[str]):
        """解析Markdown文档结构"""
        current_chapter: Optional[Chapter] = None
        current_section: Optional[Section] = None
        current_drug: Optional[str] = None
        current_drug_info: Optional[DrugInfo] = None
        
        in_code_block = False
        in_table = False
        table_data = []
        content_buffer = []
        current_content_type = ""
        adverse_level = ""
        
        i = 0
        while i < len(lines):
            line = lines[i].rstrip()
            
            # 处理代码块
            if self.patterns['code_block'].match(line):
                in_code_block = not in_code_block
                if in_code_block:
                    content_buffer.append(line)
                else:
                    content_buffer.append(line)
                    # 保存代码块内容
                    if current_drug_info and current_content_type:
                        self._save_content(current_drug_info, current_content_type, 
                                          '\n'.join(content_buffer))
                    content_buffer = []
                i += 1
                continue
            
            if in_code_block:
                content_buffer.append(line)
                i += 1
                continue
            
            # 检测章节标题
            chapter_match = self.patterns['chapter'].match(line)
            if chapter_match:
                cn_num = chapter_match.group(1)
                title = chapter_match.group(2).strip()
                chapter_id = str(self.cn_to_num(cn_num))
                
                current_chapter = Chapter(id=chapter_id, title=title)
                self.chapters.append(current_chapter)
                current_section = None
                current_drug = None
                print(f"  章节: 第{chapter_id}章 {title}")
                i += 1
                continue
            
            # 检测小节标题
            section_match = self.patterns['section'].match(line)
            if section_match and current_chapter:
                cn_num = section_match.group(1)
                title = section_match.group(2).strip()
                section_num = self.cn_to_num(cn_num)
                section_id = f"{current_chapter.id}.{section_num}"
                
                current_section = Section(id=section_id, title=title)
                current_chapter.sections.append(current_section)
                current_drug = None
                print(f"    小节: {section_id} {title}")
                i += 1
                continue
            
            # 检测药物标题
            drug_match = self.patterns['drug'].match(line)
            if drug_match and current_section:
                drug_name = drug_match.group(1).strip()
                # 清理药物名称中的emoji和特殊字符
                drug_name = re.sub(r'[🔸🔹💊🔬📊⚠️🚫📝📌]', '', drug_name).strip()
                # 清理序号前缀（如 "一、"、"1. "、"二、" 等）
                drug_name = re.sub(r'^[一二三四五六七八九十\d]+[、.．]\s*', '', drug_name).strip()
                # 清理其他常见前缀
                drug_name = re.sub(r'^(代表药物详解|作用机制分类|作用机制|药物分类|药物对比)\s*', '', drug_name).strip()
                
                if drug_name and len(drug_name) > 1:
                    stars = drug_match.group(2) if drug_match.group(2) else ""
                    freq_tag = drug_match.group(3) if drug_match.group(3) else ""
                    
                    importance = self.count_stars(stars) if stars else 3
                    
                    current_drug = drug_name
                    current_drug_info = DrugInfo(
                        name=drug_name,
                        category=current_section.title if current_section else "",
                        importance=importance
                    )
                    self.drugs[drug_name] = current_drug_info
                    
                    # 创建知识点
                    self._create_drug_point(current_chapter, current_section, 
                                           drug_name, importance, freq_tag)
                i += 1
                continue
            
            # 检测内容类型标记
            if '作用机制' in line or '🔬 作用机制' in line:
                current_content_type = "mechanism"
            elif '药动学' in line or '📊 药动学' in line:
                current_content_type = "pharmacokinetics"
            elif '不良反应' in line or '⚠️ 不良反应' in line:
                current_content_type = "adverse"
            elif '禁忌' in line or '🚫 禁忌' in line:
                current_content_type = "contraindication"
            elif '相互作用' in line:
                current_content_type = "interaction"
            
            # 检测不良反应严重程度
            if self.patterns['adverse_severe'].search(line):
                adverse_level = "severe"
            elif self.patterns['adverse_moderate'].search(line):
                adverse_level = "moderate"
            elif self.patterns['adverse_mild'].search(line):
                adverse_level = "mild"
            
            # 检测记忆口诀
            memory_match = self.patterns['memory_tip'].match(line)
            if memory_match and current_drug_info:
                tip = memory_match.group(1).strip()
                current_drug_info.memory_tips.append(tip)
                
                # 为当前药物创建记忆口诀知识点
                if current_section:
                    self._create_memory_point(current_chapter, current_section,
                                             current_drug, tip)
            
            # 检测表格
            if self.patterns['table_row'].match(line):
                if not in_table:
                    in_table = True
                    table_data = []
                table_data.append(line)
            elif in_table and line.strip() == '':
                # 表格结束，处理表格数据
                if current_section and table_data:
                    self._process_table(current_chapter, current_section, 
                                       current_drug, table_data)
                in_table = False
                table_data = []
            
            # 收集列表项内容
            if line.strip().startswith(('- ', '• ', '├', '└', '│')):
                item = re.sub(r'^[\s\-•├└│─]+', '', line).strip()
                if item and current_drug_info:
                    if current_content_type == "adverse" and adverse_level:
                        getattr(current_drug_info.adverse_reactions, adverse_level).append(item)
                    elif current_content_type == "contraindication":
                        if item.startswith(('❌', '⚠️')):
                            item = re.sub(r'^[❌⚠️]\s*', '', item)
                        current_drug_info.contraindications.append(item)
                    elif current_content_type == "interaction":
                        current_drug_info.interactions.append(item)
                    elif current_content_type == "pharmacokinetics":
                        current_drug_info.pharmacokinetics.append(item)
            
            i += 1
        
        print(f"\n提取完成: {len(self.drugs)} 个药物, {len(self.knowledge_points)} 个知识点")
    
    def _create_drug_point(self, chapter: Chapter, section: Section, 
                          drug_name: str, importance: int, freq_tag: str):
        """创建药物知识点"""
        # 跳过一些通用标题，不创建知识点
        skip_titles = ['代表药物详解', '作用机制分类', '作用机制', '药物分类', 
                       '药物对比', '阿片受体分类与效应', '镇痛药强度比较']
        if drug_name in skip_titles:
            return
        
        self.point_counter += 1
        point_id = f"{section.id}.{self.point_counter}"
        
        # 清理药物名称
        clean_drug_name = re.sub(r'^[一二三四五六七八九十\d]+[、.．]\s*', '', drug_name).strip()
        clean_drug_name = re.sub(r'[📌🔸🔹💊🔬📊⚠️🚫📝]', '', clean_drug_name).strip()
        
        point = KnowledgePoint(
            id=point_id,
            title=f"{clean_drug_name}的临床用药评价",
            content="",
            point_type=PointType.OTHER.value,
            drug_name=clean_drug_name,
            drug_category=section.title,
            importance=importance,
            chapter_id=chapter.id,
            section_id=section.id,
            exam_frequency=freq_tag
        )
        
        section.points.append(point)
        self.knowledge_points.append(point)
    
    def _create_memory_point(self, chapter: Chapter, section: Section,
                            drug_name: str, tip: str):
        """创建记忆口诀知识点"""
        self.point_counter += 1
        point_id = f"{section.id}.{self.point_counter}"
        
        point = KnowledgePoint(
            id=point_id,
            title=f"{drug_name}记忆口诀" if drug_name else "记忆口诀",
            content=tip,
            point_type=PointType.MEMORY_TIP.value,
            drug_name=drug_name or "",
            drug_category=section.title,
            importance=4,  # 记忆口诀通常重要
            memory_tips=tip,
            chapter_id=chapter.id,
            section_id=section.id
        )
        
        section.points.append(point)
        self.knowledge_points.append(point)
    
    def _process_table(self, chapter: Chapter, section: Section,
                      drug_name: str, table_data: List[str]):
        """处理表格数据，提取药物对比信息"""
        if len(table_data) < 3:  # 至少需要表头、分隔符、一行数据
            return
        
        # 解析表头
        header_line = table_data[0]
        headers = [h.strip() for h in header_line.split('|') if h.strip()]
        
        # 跳过分隔符行
        # 解析数据行
        for row_line in table_data[2:]:
            cells = [c.strip() for c in row_line.split('|') if c.strip()]
            if len(cells) >= 2:
                # 创建对比知识点
                self.point_counter += 1
                point_id = f"{section.id}.{self.point_counter}"
                
                # 构建内容
                content_parts = []
                for i, cell in enumerate(cells):
                    if i < len(headers):
                        content_parts.append(f"{headers[i]}: {cell}")
                
                drug_in_row = cells[0] if cells else ""
                # 清理药物名称
                drug_in_row = re.sub(r'\*\*|\*', '', drug_in_row).strip()
                
                point = KnowledgePoint(
                    id=point_id,
                    title=f"{drug_in_row}特点" if drug_in_row else "药物对比",
                    content='; '.join(content_parts),
                    point_type=PointType.COMPARISON.value,
                    drug_name=drug_in_row,
                    drug_category=section.title,
                    importance=3,
                    chapter_id=chapter.id,
                    section_id=section.id
                )
                
                section.points.append(point)
                self.knowledge_points.append(point)
    
    def _save_content(self, drug_info: DrugInfo, content_type: str, content: str):
        """保存内容到药物信息"""
        if content_type == "mechanism":
            drug_info.mechanism = content
        elif content_type == "pharmacokinetics":
            drug_info.pharmacokinetics.append(content)
    
    def _build_tree(self) -> Dict:
        """构建知识树"""
        # 统计信息
        total_sections = sum(len(c.sections) for c in self.chapters)
        total_points = len(self.knowledge_points)
        
        # 构建章节数据
        chapters_data = []
        for chapter in self.chapters:
            sections_data = []
            for section in chapter.sections:
                points_data = []
                for point in section.points:
                    points_data.append({
                        'id': point.id,
                        'title': point.title,
                        'content': point.content,
                        'point_type': point.point_type,
                        'drug_name': point.drug_name,
                        'drug_category': point.drug_category,
                        'importance': point.importance,
                        'memory_tips': point.memory_tips,
                        'exam_frequency': point.exam_frequency
                    })
                
                sections_data.append({
                    'id': section.id,
                    'title': section.title,
                    'points': points_data,
                    'point_count': len(points_data)
                })
            
            chapters_data.append({
                'id': chapter.id,
                'title': chapter.title,
                'sections': sections_data,
                'section_count': len(sections_data)
            })
        
        # 构建药物信息
        drugs_data = {}
        for name, info in self.drugs.items():
            drugs_data[name] = {
                'name': info.name,
                'category': info.category,
                'mechanism': info.mechanism,
                'pharmacokinetics': info.pharmacokinetics,
                'adverse_reactions': {
                    'severe': info.adverse_reactions.severe,
                    'moderate': info.adverse_reactions.moderate,
                    'mild': info.adverse_reactions.mild
                },
                'contraindications': info.contraindications,
                'interactions': info.interactions,
                'indications': info.indications,
                'memory_tips': info.memory_tips,
                'importance': info.importance
            }
        
        tree = {
            'subject': '药学专业知识（二）',
            'subject_code': 'xiyao_yaoxue_er',
            'source': 'markdown_notes',
            'statistics': {
                'total_chapters': len(self.chapters),
                'total_sections': total_sections,
                'total_points': total_points,
                'total_drugs': len(self.drugs)
            },
            'chapters': chapters_data,
            'drugs': drugs_data
        }
        
        return tree
    
    def export_to_json(self, tree: Dict, output_path: str):
        """导出JSON"""
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(tree, f, ensure_ascii=False, indent=2)
        
        print(f"已导出到: {output_path}")

    
    def export_for_database(self, tree: Dict, output_path: str) -> List[Dict]:
        """导出数据库格式（用于导入Supabase）"""
        records = []
        
        subject_code = tree['subject_code']
        
        for chapter in tree['chapters']:
            # 章节记录
            chapter_record = {
                'type': 'chapter',
                'id': f"{subject_code}_{chapter['id']}",
                'code': chapter['id'],
                'title': chapter['title'],
                'parent_id': None,
                'subject_code': subject_code,
                'level': 1,
                'importance': 3,
                'content': None,
                'point_type': None,
                'drug_name': None,
                'memory_tips': None
            }
            records.append(chapter_record)
            
            for section in chapter['sections']:
                # 小节记录
                section_record = {
                    'type': 'section',
                    'id': f"{subject_code}_{section['id']}",
                    'code': section['id'],
                    'title': section['title'],
                    'parent_id': f"{subject_code}_{chapter['id']}",
                    'subject_code': subject_code,
                    'level': 2,
                    'importance': 3,
                    'content': None,
                    'point_type': None,
                    'drug_name': None,
                    'memory_tips': None
                }
                records.append(section_record)
                
                for point in section['points']:
                    # 知识点记录
                    point_record = {
                        'type': 'knowledge_point',
                        'id': f"{subject_code}_{point['id']}",
                        'code': point['id'],
                        'title': point['title'],
                        'content': point['content'],
                        'point_type': point['point_type'],
                        'drug_name': point['drug_name'],
                        'drug_category': point['drug_category'],
                        'importance': point['importance'],
                        'memory_tips': point['memory_tips'],
                        'parent_id': f"{subject_code}_{section['id']}",
                        'subject_code': subject_code,
                        'level': 3,
                        'exam_frequency': point.get('exam_frequency', '')
                    }
                    records.append(point_record)
        
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(records, f, ensure_ascii=False, indent=2)
        
        print(f"已导出数据库记录: {output_path}")
        print(f"总记录数: {len(records)}")
        
        return records
    
    def export_sql(self, tree: Dict, output_path: str):
        """导出SQL插入语句"""
        sql_lines = []
        sql_lines.append("-- 西药药二知识点导入SQL")
        sql_lines.append("-- 自动生成于 extract_markdown_knowledge.py")
        sql_lines.append("")
        sql_lines.append("-- 清理旧数据（可选）")
        sql_lines.append("-- DELETE FROM knowledge_tree WHERE subject_code = 'xiyao_yaoxue_er';")
        sql_lines.append("")
        sql_lines.append("-- 插入知识点数据")
        
        subject_code = tree['subject_code']
        
        for chapter in tree['chapters']:
            # 章节
            sql_lines.append(f"""
INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('{subject_code}_{chapter['id']}', '{chapter['id']}', '{self._escape_sql(chapter['title'])}', NULL, '{subject_code}', 1, 3, 'chapter')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;""")
            
            for section in chapter['sections']:
                # 小节
                sql_lines.append(f"""
INSERT INTO knowledge_tree (id, code, title, parent_id, subject_code, level, importance, node_type)
VALUES ('{subject_code}_{section['id']}', '{section['id']}', '{self._escape_sql(section['title'])}', '{subject_code}_{chapter['id']}', '{subject_code}', 2, 3, 'section')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;""")
                
                for point in section['points']:
                    # 知识点
                    content = self._escape_sql(point['content']) if point['content'] else ''
                    memory = self._escape_sql(point['memory_tips']) if point['memory_tips'] else ''
                    drug = self._escape_sql(point['drug_name']) if point['drug_name'] else ''
                    
                    sql_lines.append(f"""
INSERT INTO knowledge_tree (id, code, title, content, parent_id, subject_code, level, importance, node_type, point_type, drug_name, memory_tips)
VALUES ('{subject_code}_{point['id']}', '{point['id']}', '{self._escape_sql(point['title'])}', '{content}', '{subject_code}_{section['id']}', '{subject_code}', 3, {point['importance']}, 'point', '{point['point_type']}', '{drug}', '{memory}')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, importance = EXCLUDED.importance;""")
        
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(sql_lines))
        
        print(f"已导出SQL: {output_path}")
    
    def _escape_sql(self, text: str) -> str:
        """转义SQL特殊字符"""
        if not text:
            return ''
        return text.replace("'", "''").replace('\n', ' ').replace('\r', '')
    
    def print_summary(self, tree: Dict):
        """打印摘要"""
        stats = tree['statistics']
        
        print("\n" + "=" * 60)
        print(f"📚 {tree['subject']}")
        print("=" * 60)
        print(f"章节数: {stats['total_chapters']}")
        print(f"小节数: {stats['total_sections']}")
        print(f"知识点数: {stats['total_points']}")
        print(f"药物数: {stats['total_drugs']}")
        
        print("\n📖 章节目录:")
        for chapter in tree['chapters']:
            print(f"\n第{chapter['id']}章 {chapter['title']}")
            for section in chapter['sections']:
                print(f"  ├─ {section['id']} {section['title']}")
                print(f"  │   └─ 知识点: {section['point_count']}个")
                
                # 显示前3个知识点
                for point in section['points'][:3]:
                    stars = '★' * point['importance'] + '☆' * (5 - point['importance'])
                    title = point['title'][:25] + '...' if len(point['title']) > 25 else point['title']
                    print(f"  │       • {title} [{stars}]")
                
                if len(section['points']) > 3:
                    print(f"  │       ... 还有 {len(section['points']) - 3} 个知识点")
        
        print("\n💊 药物列表（前20个）:")
        for i, (name, info) in enumerate(list(tree['drugs'].items())[:20]):
            stars = '★' * info['importance'] + '☆' * (5 - info['importance'])
            print(f"  {i+1}. {name} ({info['category']}) [{stars}]")
            if info['memory_tips']:
                print(f"      口诀: {info['memory_tips'][0][:30]}...")


def main():
    """主函数"""
    # 输入输出路径
    input_path = "西药药二-药理学树状复习笔记.md"
    tree_output = "shuju/西药药二_知识点_from_markdown.json"
    db_output = "shuju/西药药二_数据库记录_from_markdown.json"
    sql_output = "shuju/西药药二_导入.sql"
    
    # 检查输入文件
    if not Path(input_path).exists():
        print(f"错误: 找不到输入文件 {input_path}")
        return
    
    # 创建提取器
    extractor = MarkdownKnowledgeExtractor()
    
    # 提取知识点
    print("开始从Markdown提取知识点...")
    tree = extractor.extract_from_markdown(input_path)
    
    # 打印摘要
    extractor.print_summary(tree)
    
    # 导出文件
    print("\n正在导出文件...")
    extractor.export_to_json(tree, tree_output)
    extractor.export_for_database(tree, db_output)
    extractor.export_sql(tree, sql_output)
    
    print("\n✅ 提取完成!")
    print(f"  - 知识树JSON: {tree_output}")
    print(f"  - 数据库记录: {db_output}")
    print(f"  - SQL导入脚本: {sql_output}")


if __name__ == "__main__":
    main()
