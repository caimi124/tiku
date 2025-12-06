#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
西药药二知识点提取脚本
从 layout.json 中提取药理学知识点，生成结构化数据

使用方法：
python extract_xiyao_er_knowledge.py

输入：shuju/layout.json
输出：shuju/西药药二_知识点_提取结果.json
"""

import json
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict

@dataclass
class DrugInfo:
    """药物信息"""
    name: str
    category: str = ""  # 药物分类
    mechanism: List[str] = None  # 作用机制
    pharmacokinetics: List[str] = None  # 药动学
    adverse_reactions: Dict[str, List[str]] = None  # 不良反应（按严重程度分级）
    contraindications: List[str] = None  # 禁忌
    interactions: List[str] = None  # 相互作用
    clinical_use: List[str] = None  # 临床应用
    special_populations: List[str] = None  # 特殊人群用药
    
    def __post_init__(self):
        if self.mechanism is None:
            self.mechanism = []
        if self.pharmacokinetics is None:
            self.pharmacokinetics = []
        if self.adverse_reactions is None:
            self.adverse_reactions = {"severe": [], "moderate": [], "mild": []}
        if self.contraindications is None:
            self.contraindications = []
        if self.interactions is None:
            self.interactions = []
        if self.clinical_use is None:
            self.clinical_use = []
        if self.special_populations is None:
            self.special_populations = []


@dataclass
class ExamPoint:
    """考点信息"""
    name: str
    chapter: str
    section: str
    exam_years: List[str] = None  # 考试年份
    content: str = ""
    related_drugs: List[str] = None
    
    def __post_init__(self):
        if self.exam_years is None:
            self.exam_years = []
        if self.related_drugs is None:
            self.related_drugs = []

class KnowledgeExtractor:
    """知识点提取器"""
    
    # 章节标题正则
    CHAPTER_PATTERN = re.compile(r'^第[一二三四五六七八九十]+章\s*(.+?)(?:\s*//\s*\d+)?$')
    SECTION_PATTERN = re.compile(r'^第[一二三四五六七八九十]+节\s*(.+?)(?:\s*\.{2,}|\s+)?\d*$')
    EXAM_POINT_PATTERN = re.compile(r'^考点\s*(\d+)\s*(.+)$')
    
    # 药物名称识别正则（常见药物后缀）
    DRUG_SUFFIXES = [
        '西泮', '唑仑', '唑坦', '克隆', '替胺',  # 镇静催眠
        '西平', '英钠', '酸钠', '三嗪', '西坦',  # 抗癫痫
        '西汀', '曲林', '氮平', '替林',  # 抗抑郁
        '吗啡', '芬太尼', '待因', '曲马多',  # 镇痛
        '多巴', '克索', '吉兰', '卡朋', '海索',  # 抗帕金森
        '丙嗪', '啶醇', '培酮', '氮平', '硫平', '哌唑',  # 抗精神病
        '匹林', '布洛芬', '美辛', '昔布', '考昔',  # NSAIDs
        '嘌醇', '司他', '马隆', '仙碱',  # 抗痛风
        '沙芬', '维林', '托品',  # 镇咳
        '溴索', '半胱氨酸',  # 祛痰
        '胺醇', '特罗', '溴铵', '茶碱', '奈德', '卡松', '司特',  # 平喘
        '拉唑', '替丁', '糖铝', '前列醇',  # 消化系统
        '普胺', '立酮', '必利',  # 胃肠动力
        '司琼',  # 止吐
    ]
    
    # 常见药物名称列表
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
        '塞来昔布', '依托考昔', '美洛昔康', '对乙酰氨基酚',
        # 抗痛风药
        '秋水仙碱', '别嘌醇', '非布司他', '苯溴马隆', '丙磺舒',
        # 镇咳药
        '右美沙芬', '可待因', '喷托维林', '苯丙哌林',
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
    
    # 不良反应关键词
    ADVERSE_SEVERE_KEYWORDS = [
        '呼吸抑制', '过敏性休克', '骨髓抑制', '肝毒性', '肾毒性',
        'Stevens-Johnson', '中毒性表皮坏死', '恶性综合征', '依赖性',
        '心律失常', '癫痫', '出血', '穿孔', '致畸', '粒细胞缺乏',
        'QT延长', '5-HT综合征', '超敏反应', '胰腺炎',
    ]
    ADVERSE_MODERATE_KEYWORDS = [
        '肝功能', '肾功能', '低血压', '高血压', '心动过速',
        '锥体外系', '代谢综合征', '高泌乳素', '体重增加', '血糖',
        '便秘', '腹泻', '恶心', '呕吐', '溃疡', '牙龈增生',
        '撤药综合征', '反跳', '耐受性', '低钠', '低钾', '低镁',
    ]
    
    def __init__(self, layout_json_path: str):
        self.layout_json_path = layout_json_path
        self.pages = []
        self.chapters = []
        self.drugs = {}
        self.exam_points = []
        
    def load_data(self):
        """加载 layout.json 数据"""
        print(f"正在加载 {self.layout_json_path}...")
        with open(self.layout_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        self.pages = data.get('pdf_info', [])
        print(f"共加载 {len(self.pages)} 页")
        
    def extract_text_from_page(self, page: dict) -> List[Tuple[str, str]]:
        """从页面提取文本，返回 (类型, 内容) 列表"""
        texts = []
        para_blocks = page.get('para_blocks', [])
        
        for block in para_blocks:
            block_type = block.get('type', 'text')
            
            # 处理普通文本块
            if 'lines' in block:
                for line in block['lines']:
                    for span in line.get('spans', []):
                        content = span.get('content', '').strip()
                        if content:
                            texts.append((block_type, content))
            
            # 处理列表块
            if 'blocks' in block:
                for sub_block in block['blocks']:
                    if 'lines' in sub_block:
                        for line in sub_block['lines']:
                            for span in line.get('spans', []):
                                content = span.get('content', '').strip()
                                if content:
                                    texts.append(('list', content))
        
        return texts
    
    def extract_all_text(self) -> List[Tuple[int, str, str]]:
        """提取所有页面的文本，返回 (页码, 类型, 内容) 列表"""
        all_texts = []
        for page in self.pages:
            page_idx = page.get('page_idx', 0)
            texts = self.extract_text_from_page(page)
            for text_type, content in texts:
                all_texts.append((page_idx, text_type, content))
        return all_texts
    
    def identify_drug_name(self, text: str) -> Optional[str]:
        """识别文本中的药物名称"""
        # 先检查已知药物列表
        for drug in self.KNOWN_DRUGS:
            if drug in text:
                return drug
        
        # 使用后缀匹配
        for suffix in self.DRUG_SUFFIXES:
            pattern = rf'[\u4e00-\u9fa5]+{suffix}'
            match = re.search(pattern, text)
            if match:
                drug_name = match.group()
                # 过滤掉太短或太长的
                if 2 <= len(drug_name) <= 8:
                    return drug_name
        
        return None
    
    def classify_adverse_reaction(self, text: str) -> str:
        """分类不良反应严重程度"""
        for keyword in self.ADVERSE_SEVERE_KEYWORDS:
            if keyword in text:
                return 'severe'
        for keyword in self.ADVERSE_MODERATE_KEYWORDS:
            if keyword in text:
                return 'moderate'
        return 'mild'

    def parse_structure(self, all_texts: List[Tuple[int, str, str]]):
        """解析文档结构，提取章节、考点、药物信息"""
        current_chapter = ""
        current_section = ""
        current_exam_point = ""
        current_content = []
        
        # 用于收集药物信息的临时变量
        current_drug = None
        in_mechanism = False
        in_adverse = False
        in_contraindication = False
        in_interaction = False
        in_pharmacokinetics = False
        
        for page_idx, text_type, content in all_texts:
            # 跳过页眉页脚
            if '百万大学生' in content or '微信' in content:
                continue
            if content.isdigit() and len(content) <= 3:
                continue
                
            # 识别章节
            chapter_match = self.CHAPTER_PATTERN.match(content)
            if chapter_match:
                current_chapter = chapter_match.group(1).strip()
                current_section = ""
                print(f"  发现章节: {current_chapter}")
                continue
            
            section_match = self.SECTION_PATTERN.match(content)
            if section_match:
                current_section = section_match.group(1).strip()
                print(f"    发现小节: {current_section}")
                continue
            
            # 识别考点
            exam_point_match = self.EXAM_POINT_PATTERN.match(content)
            if exam_point_match:
                point_num = exam_point_match.group(1)
                point_name = exam_point_match.group(2).strip()
                
                # 保存之前的考点
                if current_exam_point and current_content:
                    self.save_exam_point(current_chapter, current_section, 
                                        current_exam_point, current_content)
                
                current_exam_point = f"考点{point_num} {point_name}"
                current_content = []
                print(f"      发现考点: {current_exam_point}")
                continue
            
            # 识别药物相关内容
            # 作用机制
            if '作用机制' in content or '机制' in content and '作用' in content:
                in_mechanism = True
                in_adverse = False
                in_contraindication = False
                in_interaction = False
                in_pharmacokinetics = False
            
            # 药动学
            if '药动学' in content or '半衰期' in content or '代谢' in content:
                in_pharmacokinetics = True
                in_mechanism = False
            
            # 不良反应
            if '不良反应' in content or '副作用' in content:
                in_adverse = True
                in_mechanism = False
                in_pharmacokinetics = False
            
            # 禁忌
            if '禁忌' in content or '禁用' in content:
                in_contraindication = True
                in_adverse = False
            
            # 相互作用
            if '相互作用' in content or '合用' in content:
                in_interaction = True
                in_contraindication = False
            
            # 识别药物名称
            drug_name = self.identify_drug_name(content)
            if drug_name and drug_name not in self.drugs:
                self.drugs[drug_name] = DrugInfo(
                    name=drug_name,
                    category=current_section or current_chapter
                )
                current_drug = drug_name
            
            # 收集内容
            if current_drug and current_drug in self.drugs:
                drug_info = self.drugs[current_drug]
                
                if in_mechanism and len(content) > 10:
                    drug_info.mechanism.append(content)
                elif in_pharmacokinetics and len(content) > 10:
                    drug_info.pharmacokinetics.append(content)
                elif in_adverse and len(content) > 5:
                    severity = self.classify_adverse_reaction(content)
                    drug_info.adverse_reactions[severity].append(content)
                elif in_contraindication and len(content) > 5:
                    drug_info.contraindications.append(content)
                elif in_interaction and len(content) > 10:
                    drug_info.interactions.append(content)
            
            # 收集考点内容
            if current_exam_point:
                current_content.append(content)
        
        # 保存最后一个考点
        if current_exam_point and current_content:
            self.save_exam_point(current_chapter, current_section, 
                                current_exam_point, current_content)
    
    def save_exam_point(self, chapter: str, section: str, 
                       point_name: str, content: List[str]):
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
            drug = self.identify_drug_name(text)
            if drug:
                related_drugs.append(drug)
        related_drugs = list(set(related_drugs))
        
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
        print("\n开始解析文档结构...")
        all_texts = self.extract_all_text()
        print(f"共提取 {len(all_texts)} 条文本")
        
        self.parse_structure(all_texts)
        
        print(f"\n提取完成:")
        print(f"  - 药物数量: {len(self.drugs)}")
        print(f"  - 考点数量: {len(self.exam_points)}")
    
    def to_dict(self) -> dict:
        """转换为字典格式"""
        return {
            "统计信息": {
                "药物总数": len(self.drugs),
                "考点总数": len(self.exam_points),
                "药物列表": list(self.drugs.keys())
            },
            "药物信息": {
                name: {
                    "名称": info.name,
                    "分类": info.category,
                    "作用机制": info.mechanism,
                    "药动学": info.pharmacokinetics,
                    "不良反应": info.adverse_reactions,
                    "禁忌": info.contraindications,
                    "相互作用": info.interactions,
                    "临床应用": info.clinical_use,
                    "特殊人群用药": info.special_populations
                }
                for name, info in self.drugs.items()
            },
            "考点列表": [
                {
                    "名称": point.name,
                    "章节": point.chapter,
                    "小节": point.section,
                    "考试年份": point.exam_years,
                    "相关药物": point.related_drugs,
                    "内容": point.content
                }
                for point in self.exam_points
            ]
        }
    
    def save(self, output_path: str):
        """保存结果"""
        result = self.to_dict()
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(f"\n结果已保存到: {output_path}")


def main():
    """主函数"""
    import os
    
    # 输入输出路径
    input_path = "shuju/layout.json"
    output_path = "shuju/西药药二_知识点_提取结果.json"
    
    # 检查输入文件
    if not os.path.exists(input_path):
        print(f"错误: 找不到输入文件 {input_path}")
        return
    
    # 创建提取器并执行
    extractor = KnowledgeExtractor(input_path)
    extractor.extract()
    extractor.save(output_path)
    
    # 打印部分结果预览
    print("\n=== 提取结果预览 ===")
    print("\n药物列表（前20个）:")
    for i, drug_name in enumerate(list(extractor.drugs.keys())[:20]):
        drug = extractor.drugs[drug_name]
        print(f"  {i+1}. {drug_name} ({drug.category})")
        if drug.mechanism:
            print(f"      机制: {drug.mechanism[0][:50]}...")
    
    print("\n考点列表（前10个）:")
    for i, point in enumerate(extractor.exam_points[:10]):
        print(f"  {i+1}. [{point.chapter}] {point.name}")
        if point.exam_years:
            print(f"      考试年份: {', '.join(point.exam_years)}")


if __name__ == "__main__":
    main()
