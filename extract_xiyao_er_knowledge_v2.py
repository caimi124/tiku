#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
西药药二知识点提取脚本 V2 - 增强版
从 layout.json 中提取药理学知识点，包括图片中的表格信息

增强功能：
1. 解析layout.json中的表格HTML数据
2. 提取图片路径，支持后续OCR处理
3. 更完整地提取药物作用特点、典型不良反应、药物相互作用

使用方法：
python extract_xiyao_er_knowledge_v2.py

输入：shuju/layout.json, shuju/images/
输出：shuju/西药药二_知识点_完整版.json
"""

import json
import re
import os
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field, asdict
from collections import defaultdict
from pathlib import Path
from bs4 import BeautifulSoup
import html


@dataclass
class DrugCharacteristics:
    """药物作用特点"""
    mechanism: List[str] = field(default_factory=list)  # 作用机制
    selectivity: str = ""  # 选择性
    indications: List[str] = field(default_factory=list)  # 适应证
    pharmacokinetics: Dict[str, str] = field(default_factory=dict)  # 药动学特点
    special_features: List[str] = field(default_factory=list)  # 特殊作用特点


@dataclass
class AdverseReactions:
    """不良反应（按严重程度和类型分级）"""
    severe: List[str] = field(default_factory=list)      # 严重不良反应
    moderate: List[str] = field(default_factory=list)    # 中度不良反应
    mild: List[str] = field(default_factory=list)        # 轻度不良反应
    common: List[str] = field(default_factory=list)      # 常见不良反应
    typical: List[str] = field(default_factory=list)     # 典型不良反应


@dataclass
class DrugInteractions:
    """药物相互作用"""
    synergistic: List[str] = field(default_factory=list)  # 协同作用
    antagonistic: List[str] = field(default_factory=list)  # 拮抗作用
    contraindicated: List[str] = field(default_factory=list)  # 禁忌合用
    caution: List[str] = field(default_factory=list)  # 慎重合用
    general: List[str] = field(default_factory=list)  # 一般相互作用


@dataclass
class DrugInfo:
    """药物完整信息"""
    name: str
    category: str = ""  # 药物分类
    subcategory: str = ""  # 药物亚类
    characteristics: DrugCharacteristics = field(default_factory=DrugCharacteristics)
    adverse_reactions: AdverseReactions = field(default_factory=AdverseReactions)
    interactions: DrugInteractions = field(default_factory=DrugInteractions)
    contraindications: List[str] = field(default_factory=list)  # 禁忌证
    precautions: List[str] = field(default_factory=list)  # 注意事项
    dosage: Dict[str, str] = field(default_factory=dict)  # 用法用量
    clinical_use: List[str] = field(default_factory=list)  # 临床应用
    special_populations: Dict[str, str] = field(default_factory=dict)  # 特殊人群用药
    exam_points: List[str] = field(default_factory=list)  # 考点标记
    related_images: List[str] = field(default_factory=list)  # 相关图片路径


@dataclass
class TableData:
    """表格数据"""
    title: str = ""
    headers: List[str] = field(default_factory=list)
    rows: List[Dict[str, str]] = field(default_factory=list)
    source_image: str = ""
    page_idx: int = 0


@dataclass
class ExamPoint:
    """考点信息"""
    name: str
    chapter: str
    section: str
    exam_years: List[str] = field(default_factory=list)
    content: str = ""
    related_drugs: List[str] = field(default_factory=list)
    tables: List[TableData] = field(default_factory=list)
    images: List[str] = field(default_factory=list)


class EnhancedKnowledgeExtractor:
    """增强版知识点提取器"""
    
    # 章节标题正则
    CHAPTER_PATTERN = re.compile(r'^第([一二三四五六七八九十]+)章\s*(.+?)(?:\s*//\s*\d+)?$')
    SECTION_PATTERN = re.compile(r'^第([一二三四五六七八九十]+)节\s*(.+?)(?:\s*\.{2,}|\s+)?\d*$')
    EXAM_POINT_PATTERN = re.compile(r'^考点\s*(\d+)\s*(.+)$')
    
    # 中文数字映射
    CN_NUM_MAP = {
        '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
        '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
        '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15
    }
    
    # 药物名称识别 - 扩展列表
    KNOWN_DRUGS = [
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
        '塞来昔布', '依托考昔', '美洛昔康', '对乙酰氨基酚', '尼美舒利',
        '贝诺酯', '赖氨匹林', '二氟尼柳', '舒林酸', '氟比洛芬',
        '酮洛芬', '非诺洛芬钙', '奥沙普秦', '保泰松', '安乃近',
        '氨基比林', '萘丁美酮', '帕瑞昔布', '伐地考昔', '艾瑞昔布',
        # 抗痛风药
        '秋水仙碱', '别嘌醇', '非布司他', '苯溴马隆', '丙磺舒',
        # 抗风湿药
        '甲氨蝶呤', '来氟米特', '柳氮磺吡啶', '羟氯喹',
        # 镇咳药
        '右美沙芬', '喷托维林', '苯丙哌林', '可待因',
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
        # 止吐药
        '东莨菪碱', '苯海拉明', '氯丙嗪', '甲氧氯普胺', '昂丹司琼',
        # 肝胆药物
        '牛磺熊去氧胆酸', '熊去氧胆酸', '鹅去氧胆酸', '去氢胆酸',
        '丁二磺酸腺苷蛋氨酸', '奥德昔巴特', '氯马昔巴特', '利奈昔巴特',
    ]
    
    # 内容类型关键词
    CONTENT_TYPE_KEYWORDS = {
        'mechanism': ['作用机制', '机制', '原理', '通过抑制', '通过激动', '通过阻断'],
        'characteristics': ['作用特点', '特点', '特征', '选择性'],
        'pharmacokinetics': ['药动学', '半衰期', '代谢', '吸收', '分布', '排泄', '生物利用度'],
        'adverse_reactions': ['不良反应', '副作用', '毒性', '典型不良反应'],
        'contraindications': ['禁忌', '禁用', '禁忌证', '禁忌症'],
        'interactions': ['相互作用', '配伍', '合用', '联用', '药物相互作用'],
        'indications': ['适应证', '适应症', '用于', '治疗', '临床应用'],
        'dosage': ['用法', '用量', '剂量', '给药'],
        'precautions': ['注意事项', '慎用', '注意'],
    }
    
    # 严重程度关键词
    SEVERITY_KEYWORDS = {
        'severe': ['呼吸抑制', '过敏性休克', '骨髓抑制', '肝毒性', '肾毒性', '肝损伤',
                   'Stevens-Johnson', '中毒性表皮坏死', '恶性综合征', '依赖性',
                   '心律失常', '癫痫', '出血', '穿孔', '致畸', '粒细胞缺乏',
                   'QT延长', '5-HT综合征', '超敏反应', '胰腺炎', '瑞夷综合征',
                   '心肌梗死', '卒中', '急性肾衰竭', '剥脱性皮炎'],
        'moderate': ['肝功能', '肾功能', '低血压', '高血压', '心动过速',
                     '锥体外系', '代谢综合征', '高泌乳素', '体重增加', '血糖',
                     '便秘', '腹泻', '恶心', '呕吐', '溃疡', '牙龈增生',
                     '撤药综合征', '反跳', '耐受性', '低钠', '低钾', '低镁',
                     '骨质疏松', '糖尿病', '青光眼', '感染'],
        'mild': ['嗜睡', '头晕', '头痛', '口干', '皮疹', '瘙痒', '乏力',
                 '食欲下降', '腹胀', '腹部不适', '精神错乱', '宿醉现象'],
    }
    
    def __init__(self, layout_json_path: str, images_dir: str = None):
        self.layout_json_path = layout_json_path
        self.images_dir = images_dir or os.path.join(os.path.dirname(layout_json_path), 'images')
        self.pages = []
        self.chapters = []
        self.drugs: Dict[str, DrugInfo] = {}
        self.exam_points: List[ExamPoint] = []
        self.tables: List[TableData] = []
        self.image_references: Dict[str, Dict] = {}  # 图片路径 -> 相关信息
        
    def load_data(self):
        """加载 layout.json 数据"""
        print(f"正在加载 {self.layout_json_path}...")
        with open(self.layout_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        self.pages = data.get('pdf_info', [])
        print(f"共加载 {len(self.pages)} 页")
        
    def cn_to_num(self, cn: str) -> int:
        """中文数字转阿拉伯数字"""
        return self.CN_NUM_MAP.get(cn, 1)

    def parse_html_table(self, html_content: str, image_path: str = "", page_idx: int = 0) -> TableData:
        """解析HTML表格内容"""
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            table = soup.find('table')
            if not table:
                return None
            
            rows = table.find_all('tr')
            if not rows:
                return None
            
            # 提取表头
            headers = []
            first_row = rows[0]
            for cell in first_row.find_all(['th', 'td']):
                headers.append(cell.get_text(strip=True))
            
            # 提取数据行
            data_rows = []
            for row in rows[1:]:
                cells = row.find_all(['th', 'td'])
                row_data = {}
                for i, cell in enumerate(cells):
                    key = headers[i] if i < len(headers) else f"col_{i}"
                    row_data[key] = cell.get_text(strip=True)
                if row_data:
                    data_rows.append(row_data)
            
            return TableData(
                headers=headers,
                rows=data_rows,
                source_image=image_path,
                page_idx=page_idx
            )
        except Exception as e:
            print(f"解析HTML表格失败: {e}")
            return None
    
    def extract_from_page(self, page: dict) -> Dict[str, Any]:
        """从单个页面提取所有信息"""
        page_idx = page.get('page_idx', 0)
        result = {
            'page_idx': page_idx,
            'texts': [],
            'tables': [],
            'images': [],
            'chapter': None,
            'section': None,
        }
        
        para_blocks = page.get('para_blocks', [])
        
        for block in para_blocks:
            block_type = block.get('type', 'text')
            
            # 处理图片块
            if block_type == 'image':
                self._process_image_block(block, result, page_idx)
            
            # 处理普通文本块
            elif 'lines' in block:
                for line in block['lines']:
                    for span in line.get('spans', []):
                        span_type = span.get('type', 'text')
                        content = span.get('content', '').strip()
                        
                        if span_type == 'table' and 'html' in span:
                            # 解析表格
                            table_data = self.parse_html_table(
                                span['html'], 
                                span.get('image_path', ''),
                                page_idx
                            )
                            if table_data:
                                result['tables'].append(table_data)
                                self.tables.append(table_data)
                        elif span_type == 'image' and 'image_path' in span:
                            # 记录图片引用
                            img_path = span['image_path']
                            result['images'].append(img_path)
                            self.image_references[img_path] = {
                                'page_idx': page_idx,
                                'context': content
                            }
                        elif content:
                            result['texts'].append({
                                'type': block_type,
                                'content': content
                            })
            
            # 处理列表块
            if 'blocks' in block:
                for sub_block in block['blocks']:
                    self._process_sub_block(sub_block, result, page_idx)
        
        return result
    
    def _process_image_block(self, block: dict, result: dict, page_idx: int):
        """处理图片块"""
        if 'blocks' in block:
            for sub_block in block['blocks']:
                sub_type = sub_block.get('type', '')
                
                if sub_type == 'image_body' and 'lines' in sub_block:
                    for line in sub_block['lines']:
                        for span in line.get('spans', []):
                            if span.get('type') == 'image' and 'image_path' in span:
                                img_path = span['image_path']
                                result['images'].append(img_path)
                                self.image_references[img_path] = {
                                    'page_idx': page_idx,
                                    'type': 'image_body'
                                }
                            elif span.get('type') == 'table' and 'html' in span:
                                table_data = self.parse_html_table(
                                    span['html'],
                                    span.get('image_path', ''),
                                    page_idx
                                )
                                if table_data:
                                    result['tables'].append(table_data)
                                    self.tables.append(table_data)
                
                elif sub_type == 'image_caption' and 'lines' in sub_block:
                    for line in sub_block['lines']:
                        for span in line.get('spans', []):
                            content = span.get('content', '').strip()
                            if content:
                                result['texts'].append({
                                    'type': 'image_caption',
                                    'content': content
                                })
    
    def _process_sub_block(self, sub_block: dict, result: dict, page_idx: int):
        """处理子块"""
        if 'lines' in sub_block:
            for line in sub_block['lines']:
                for span in line.get('spans', []):
                    span_type = span.get('type', 'text')
                    content = span.get('content', '').strip()
                    
                    if span_type == 'table' and 'html' in span:
                        table_data = self.parse_html_table(
                            span['html'],
                            span.get('image_path', ''),
                            page_idx
                        )
                        if table_data:
                            result['tables'].append(table_data)
                            self.tables.append(table_data)
                    elif span_type == 'image' and 'image_path' in span:
                        img_path = span['image_path']
                        result['images'].append(img_path)
                        self.image_references[img_path] = {
                            'page_idx': page_idx,
                            'context': content
                        }
                    elif content:
                        result['texts'].append({
                            'type': sub_block.get('type', 'text'),
                            'content': content
                        })
    
    def identify_drug_name(self, text: str) -> Optional[str]:
        """识别文本中的药物名称"""
        for drug in self.KNOWN_DRUGS:
            if drug in text:
                return drug
        return None
    
    def identify_content_type(self, text: str) -> Optional[str]:
        """识别内容类型"""
        for content_type, keywords in self.CONTENT_TYPE_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text:
                    return content_type
        return None
    
    def classify_adverse_severity(self, text: str) -> str:
        """分类不良反应严重程度"""
        for severity, keywords in self.SEVERITY_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text:
                    return severity
        return 'mild'
    
    def extract_drug_info_from_table(self, table: TableData) -> Dict[str, Any]:
        """从表格中提取药物信息"""
        drug_info = {}
        
        # 检查表头，确定表格类型
        headers_lower = [h.lower() for h in table.headers]
        
        # 药物分类表
        if '分类' in table.headers and '代表药品' in table.headers:
            drug_info['type'] = 'classification'
            drug_info['data'] = []
            for row in table.rows:
                category = row.get('分类', '')
                drugs = row.get('代表药品', '')
                drug_info['data'].append({
                    'category': category,
                    'drugs': drugs
                })
        
        # 作用特点/不良反应表
        elif '项目' in table.headers and '具体内容' in table.headers:
            drug_info['type'] = 'details'
            drug_info['data'] = {}
            for row in table.rows:
                item = row.get('项目', '')
                content = row.get('具体内容', '')
                
                if '作用机制' in item:
                    drug_info['data']['mechanism'] = content
                elif '作用特点' in item:
                    drug_info['data']['characteristics'] = content
                elif '不良反应' in item or '典型不良反应' in item:
                    drug_info['data']['adverse_reactions'] = content
                elif '禁忌' in item:
                    drug_info['data']['contraindications'] = content
                elif '相互作用' in item or '药物相互作用' in item:
                    drug_info['data']['interactions'] = content
                elif '药动学' in item:
                    drug_info['data']['pharmacokinetics'] = content
        
        # 类别/作用特点/典型不良反应表
        elif '类别' in table.headers and '作用特点' in table.headers:
            drug_info['type'] = 'category_details'
            drug_info['data'] = []
            for row in table.rows:
                drug_info['data'].append({
                    'category': row.get('类别', ''),
                    'characteristics': row.get('作用特点', ''),
                    'adverse_reactions': row.get('典型不良反应', '')
                })
        
        # 考点/考查年份表
        elif '考点' in table.headers and '考查年份' in table.headers:
            drug_info['type'] = 'exam_points'
            drug_info['data'] = []
            for row in table.rows:
                drug_info['data'].append({
                    'point': row.get('考点', ''),
                    'years': row.get('考查年份', '')
                })
        
        return drug_info

    def parse_all_pages(self):
        """解析所有页面"""
        print("\n开始解析所有页面...")
        
        current_chapter = ""
        current_section = ""
        current_exam_point = ""
        current_content = []
        current_drug = None
        current_content_type = None
        
        for page in self.pages:
            page_data = self.extract_from_page(page)
            page_idx = page_data['page_idx']
            
            # 处理表格数据
            for table in page_data['tables']:
                drug_info = self.extract_drug_info_from_table(table)
                if drug_info:
                    self._process_table_drug_info(drug_info, current_chapter, current_section)
            
            # 处理文本内容
            for text_item in page_data['texts']:
                content = text_item['content']
                text_type = text_item['type']
                
                # 跳过页眉页脚
                if '百万大学生' in content or '微信' in content:
                    continue
                if content.isdigit() and len(content) <= 3:
                    continue
                
                # 识别章节
                chapter_match = self.CHAPTER_PATTERN.match(content)
                if chapter_match:
                    cn_num = chapter_match.group(1)
                    title = chapter_match.group(2).strip()
                    current_chapter = f"第{cn_num}章 {title}"
                    current_section = ""
                    print(f"  发现章节: {current_chapter}")
                    continue
                
                section_match = self.SECTION_PATTERN.match(content)
                if section_match:
                    cn_num = section_match.group(1)
                    title = section_match.group(2).strip()
                    current_section = f"第{cn_num}节 {title}"
                    print(f"    发现小节: {current_section}")
                    continue
                
                # 识别考点
                exam_point_match = self.EXAM_POINT_PATTERN.match(content)
                if exam_point_match:
                    # 保存之前的考点
                    if current_exam_point and current_content:
                        self._save_exam_point(current_chapter, current_section,
                                             current_exam_point, current_content)
                    
                    point_num = exam_point_match.group(1)
                    point_name = exam_point_match.group(2).strip()
                    current_exam_point = f"考点{point_num} {point_name}"
                    current_content = []
                    print(f"      发现考点: {current_exam_point}")
                    continue
                
                # 识别内容类型
                new_content_type = self.identify_content_type(content)
                if new_content_type:
                    current_content_type = new_content_type
                
                # 识别药物名称
                drug_name = self.identify_drug_name(content)
                if drug_name:
                    if drug_name not in self.drugs:
                        self.drugs[drug_name] = DrugInfo(
                            name=drug_name,
                            category=current_section or current_chapter
                        )
                    current_drug = drug_name
                
                # 收集药物相关内容
                if current_drug and current_drug in self.drugs:
                    self._add_content_to_drug(
                        self.drugs[current_drug],
                        content,
                        current_content_type
                    )
                
                # 收集考点内容
                if current_exam_point:
                    current_content.append(content)
        
        # 保存最后一个考点
        if current_exam_point and current_content:
            self._save_exam_point(current_chapter, current_section,
                                 current_exam_point, current_content)
        
        print(f"\n解析完成:")
        print(f"  - 药物数量: {len(self.drugs)}")
        print(f"  - 考点数量: {len(self.exam_points)}")
        print(f"  - 表格数量: {len(self.tables)}")
        print(f"  - 图片引用: {len(self.image_references)}")
    
    def _process_table_drug_info(self, drug_info: Dict, chapter: str, section: str):
        """处理从表格提取的药物信息"""
        info_type = drug_info.get('type', '')
        data = drug_info.get('data', {})
        
        if info_type == 'classification':
            # 药物分类表
            for item in data:
                category = item.get('category', '')
                drugs_str = item.get('drugs', '')
                # 提取药物名称
                for drug_name in self.KNOWN_DRUGS:
                    if drug_name in drugs_str:
                        if drug_name not in self.drugs:
                            self.drugs[drug_name] = DrugInfo(
                                name=drug_name,
                                category=section or chapter,
                                subcategory=category
                            )
                        else:
                            self.drugs[drug_name].subcategory = category
        
        elif info_type == 'details':
            # 详细信息表 - 解析并关联到具体药物
            for key, content in data.items():
                if not content:
                    continue
                self._parse_and_assign_drug_content(key, content, section or chapter)
        
        elif info_type == 'category_details':
            # 类别详情表
            for item in data:
                category = item.get('category', '')
                characteristics = item.get('characteristics', '')
                adverse = item.get('adverse_reactions', '')
                
                # 提取药物名称并关联信息
                for drug_name in self.KNOWN_DRUGS:
                    if drug_name in category or drug_name in characteristics:
                        if drug_name not in self.drugs:
                            self.drugs[drug_name] = DrugInfo(
                                name=drug_name,
                                category=section or chapter
                            )
                        
                        drug = self.drugs[drug_name]
                        if characteristics:
                            drug.characteristics.special_features.append(characteristics)
                        if adverse:
                            drug.adverse_reactions.typical.append(adverse)
    
    def _parse_and_assign_drug_content(self, content_type: str, content: str, section: str):
        """解析表格内容并分配到具体药物"""
        # 按药物名称分割内容
        # 常见格式: (1)药物名称: 内容 (2)药物名称: 内容
        # 或者: 1)药物名称: 内容 2)药物名称: 内容
        
        # 首先处理整体内容（如NSAIDs类的共性信息）
        if content_type == 'mechanism':
            # 作用机制通常是类别共性，分配给该类别下所有药物
            for drug_name in self.KNOWN_DRUGS:
                if drug_name in content:
                    if drug_name not in self.drugs:
                        self.drugs[drug_name] = DrugInfo(name=drug_name, category=section)
                    self.drugs[drug_name].characteristics.mechanism.append(content)
        
        elif content_type == 'characteristics':
            # 作用特点 - 解析具体药物信息
            self._parse_numbered_drug_content(content, 'characteristics', section)
        
        elif content_type == 'adverse_reactions':
            # 不良反应 - 解析具体药物信息
            self._parse_numbered_drug_content(content, 'adverse_reactions', section)
        
        elif content_type == 'interactions':
            # 药物相互作用
            self._parse_numbered_drug_content(content, 'interactions', section)
        
        elif content_type == 'contraindications':
            # 禁忌证
            self._parse_numbered_drug_content(content, 'contraindications', section)
    
    def _parse_numbered_drug_content(self, content: str, info_type: str, section: str):
        """解析带编号的药物内容"""
        # 尝试按编号分割: (1)xxx (2)xxx 或 1)xxx 2)xxx
        import re
        
        # 分割模式
        parts = re.split(r'\(\d+\)|\d+\)', content)
        
        for part in parts:
            part = part.strip()
            if not part:
                continue
            
            # 查找该部分提到的药物
            mentioned_drugs = []
            for drug_name in self.KNOWN_DRUGS:
                if drug_name in part:
                    mentioned_drugs.append(drug_name)
            
            # 如果找到药物，将内容关联到这些药物
            for drug_name in mentioned_drugs:
                if drug_name not in self.drugs:
                    self.drugs[drug_name] = DrugInfo(name=drug_name, category=section)
                
                drug = self.drugs[drug_name]
                
                if info_type == 'characteristics':
                    if part not in drug.characteristics.special_features:
                        drug.characteristics.special_features.append(part)
                elif info_type == 'adverse_reactions':
                    severity = self.classify_adverse_severity(part)
                    if severity == 'severe':
                        if part not in drug.adverse_reactions.severe:
                            drug.adverse_reactions.severe.append(part)
                    elif severity == 'moderate':
                        if part not in drug.adverse_reactions.moderate:
                            drug.adverse_reactions.moderate.append(part)
                    else:
                        if part not in drug.adverse_reactions.mild:
                            drug.adverse_reactions.mild.append(part)
                    # 同时添加到典型不良反应
                    if part not in drug.adverse_reactions.typical:
                        drug.adverse_reactions.typical.append(part)
                elif info_type == 'interactions':
                    if part not in drug.interactions.general:
                        drug.interactions.general.append(part)
                elif info_type == 'contraindications':
                    if part not in drug.contraindications:
                        drug.contraindications.append(part)
    
    def _add_content_to_drug(self, drug: DrugInfo, content: str, content_type: Optional[str]):
        """将内容添加到药物信息中"""
        if not content or len(content) < 5:
            return
        
        if content_type == 'mechanism':
            drug.characteristics.mechanism.append(content)
        elif content_type == 'characteristics':
            drug.characteristics.special_features.append(content)
        elif content_type == 'pharmacokinetics':
            # 解析药动学参数
            if '半衰期' in content:
                drug.characteristics.pharmacokinetics['半衰期'] = content
            elif '代谢' in content:
                drug.characteristics.pharmacokinetics['代谢'] = content
            elif '吸收' in content:
                drug.characteristics.pharmacokinetics['吸收'] = content
            else:
                drug.characteristics.pharmacokinetics['其他'] = content
        elif content_type == 'adverse_reactions':
            severity = self.classify_adverse_severity(content)
            if severity == 'severe':
                drug.adverse_reactions.severe.append(content)
            elif severity == 'moderate':
                drug.adverse_reactions.moderate.append(content)
            else:
                drug.adverse_reactions.mild.append(content)
        elif content_type == 'contraindications':
            drug.contraindications.append(content)
        elif content_type == 'interactions':
            drug.interactions.general.append(content)
        elif content_type == 'indications':
            drug.clinical_use.append(content)
        elif content_type == 'precautions':
            drug.precautions.append(content)
    
    def _save_exam_point(self, chapter: str, section: str, point_name: str, content: List[str]):
        """保存考点信息"""
        # 提取考试年份
        exam_years = []
        year_pattern = re.compile(r'20[12]\d')
        for text in content:
            years = year_pattern.findall(text)
            exam_years.extend(years)
        exam_years = list(set(exam_years))
        
        # 提取相关药物
        related_drugs = []
        for text in content:
            for drug in self.KNOWN_DRUGS:
                if drug in text and drug not in related_drugs:
                    related_drugs.append(drug)
        
        exam_point = ExamPoint(
            name=point_name,
            chapter=chapter,
            section=section,
            exam_years=sorted(exam_years),
            content='\n'.join(content),
            related_drugs=related_drugs
        )
        self.exam_points.append(exam_point)
    
    def extract(self):
        """执行提取"""
        self.load_data()
        self.parse_all_pages()
    
    def to_dict(self) -> dict:
        """转换为字典格式"""
        # 统计信息
        stats = {
            "药物总数": len(self.drugs),
            "考点总数": len(self.exam_points),
            "表格总数": len(self.tables),
            "图片引用数": len(self.image_references),
            "药物列表": list(self.drugs.keys())
        }
        
        # 药物信息
        drugs_data = {}
        for name, drug in self.drugs.items():
            drugs_data[name] = {
                "名称": drug.name,
                "分类": drug.category,
                "亚类": drug.subcategory,
                "作用特点": {
                    "作用机制": drug.characteristics.mechanism,
                    "选择性": drug.characteristics.selectivity,
                    "适应证": drug.characteristics.indications,
                    "药动学": drug.characteristics.pharmacokinetics,
                    "特殊特点": drug.characteristics.special_features
                },
                "不良反应": {
                    "严重": drug.adverse_reactions.severe,
                    "中度": drug.adverse_reactions.moderate,
                    "轻度": drug.adverse_reactions.mild,
                    "常见": drug.adverse_reactions.common,
                    "典型": drug.adverse_reactions.typical
                },
                "药物相互作用": {
                    "协同": drug.interactions.synergistic,
                    "拮抗": drug.interactions.antagonistic,
                    "禁忌合用": drug.interactions.contraindicated,
                    "慎重合用": drug.interactions.caution,
                    "一般": drug.interactions.general
                },
                "禁忌证": drug.contraindications,
                "注意事项": drug.precautions,
                "用法用量": drug.dosage,
                "临床应用": drug.clinical_use,
                "特殊人群用药": drug.special_populations,
                "考点标记": drug.exam_points,
                "相关图片": drug.related_images
            }
        
        # 考点列表
        exam_points_data = []
        for point in self.exam_points:
            exam_points_data.append({
                "名称": point.name,
                "章节": point.chapter,
                "小节": point.section,
                "考试年份": point.exam_years,
                "相关药物": point.related_drugs,
                "内容": point.content
            })
        
        # 表格数据
        tables_data = []
        for table in self.tables:
            tables_data.append({
                "标题": table.title,
                "表头": table.headers,
                "数据行": table.rows,
                "来源图片": table.source_image,
                "页码": table.page_idx
            })
        
        # 图片引用
        images_data = {}
        for img_path, info in self.image_references.items():
            images_data[img_path] = info
        
        return {
            "统计信息": stats,
            "药物信息": drugs_data,
            "考点列表": exam_points_data,
            "表格数据": tables_data,
            "图片引用": images_data
        }
    
    def save(self, output_path: str):
        """保存结果"""
        result = self.to_dict()
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(f"\n结果已保存到: {output_path}")
    
    def print_summary(self):
        """打印摘要"""
        print("\n" + "=" * 70)
        print("📚 西药药二知识点提取结果摘要")
        print("=" * 70)
        
        print(f"\n📊 统计信息:")
        print(f"  - 药物数量: {len(self.drugs)}")
        print(f"  - 考点数量: {len(self.exam_points)}")
        print(f"  - 表格数量: {len(self.tables)}")
        print(f"  - 图片引用: {len(self.image_references)}")
        
        print(f"\n💊 药物列表（前30个）:")
        for i, (name, drug) in enumerate(list(self.drugs.items())[:30]):
            features_count = len(drug.characteristics.special_features)
            adverse_count = (len(drug.adverse_reactions.severe) + 
                           len(drug.adverse_reactions.moderate) + 
                           len(drug.adverse_reactions.mild) +
                           len(drug.adverse_reactions.typical))
            interactions_count = len(drug.interactions.general)
            
            print(f"  {i+1}. {name}")
            print(f"      分类: {drug.category}")
            if drug.subcategory:
                print(f"      亚类: {drug.subcategory}")
            print(f"      作用特点: {features_count}条, 不良反应: {adverse_count}条, 相互作用: {interactions_count}条")
        
        print(f"\n📋 表格数据预览（前10个）:")
        for i, table in enumerate(self.tables[:10]):
            print(f"  {i+1}. 表头: {table.headers}")
            print(f"      数据行数: {len(table.rows)}")
            if table.source_image:
                print(f"      来源图片: {table.source_image}")
        
        print(f"\n🖼️ 图片引用（前10个）:")
        for i, (img_path, info) in enumerate(list(self.image_references.items())[:10]):
            print(f"  {i+1}. {img_path}")
            print(f"      页码: {info.get('page_idx', 'N/A')}")


def main():
    """主函数"""
    # 输入输出路径
    input_path = "shuju/layout.json"
    images_dir = "shuju/images"
    output_path = "shuju/西药药二_知识点_完整版.json"
    
    # 检查输入文件
    if not os.path.exists(input_path):
        print(f"错误: 找不到输入文件 {input_path}")
        return
    
    # 创建提取器并执行
    extractor = EnhancedKnowledgeExtractor(input_path, images_dir)
    extractor.extract()
    extractor.print_summary()
    extractor.save(output_path)
    
    print("\n✅ 提取完成!")
    print(f"  - 输出文件: {output_path}")
    print(f"  - 图片目录: {images_dir}")
    print("\n💡 提示: 图片中的表格内容已通过HTML解析提取")
    print("   如需进一步提取图片中的文字，可使用OCR工具处理 images 目录中的图片")


if __name__ == "__main__":
    main()
