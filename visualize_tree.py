#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
可视化知识树结构
"""

import json
import sys

def print_tree(knowledge_tree, indent=0):
    """打印树状结构"""
    prefix = "  " * indent
    
    if isinstance(knowledge_tree, dict):
        if 'title' in knowledge_tree:
            print(f"\n{'='*60}")
            print(f"{knowledge_tree['title']}")
            print(f"{'='*60}")
            print(f"总章节数: {knowledge_tree.get('total_chapters', 0)}")
            print(f"总节数: {knowledge_tree.get('total_sections', 0)}")
            print(f"总知识点数: {knowledge_tree.get('total_points', 0)}")
            print(f"{'='*60}\n")
        
        if 'chapters' in knowledge_tree:
            for chapter in knowledge_tree['chapters']:
                print(f"{prefix}📚 {chapter.get('chapter_id', '')} {chapter.get('chapter_name', '')}")
                
                if 'sections' in chapter:
                    for section in chapter['sections']:
                        print(f"{prefix}  📖 {section.get('section_id', '')} {section.get('section_name', '')} ({section.get('point_count', 0)}个知识点)")
                        
                        if 'knowledge_points' in section:
                            for point in section['knowledge_points'][:3]:  # 只显示前3个
                                print(f"{prefix}    🎯 [{point.get('point_id', '')}] {point.get('point_title', '')[:50]}")
                                print(f"{prefix}       药物: {point.get('drug_name', '未识别')}")
                                print(f"{prefix}       类型: {', '.join(point.get('knowledge_types', []))}")
                                print(f"{prefix}       重要性: {'★' * point.get('importance_level', 3)}")
                            
                            if len(section['knowledge_points']) > 3:
                                print(f"{prefix}    ... 还有 {len(section['knowledge_points']) - 3} 个知识点")
                        print()

def main():
    json_file = r'e:\tiku\shuju\西药药二知识树.json'
    
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            knowledge_tree = json.load(f)
        
        print_tree(knowledge_tree)
        
    except FileNotFoundError:
        print(f"❌ 文件不存在: {json_file}")
        print("请先运行 build_knowledge_tree.py 生成知识树文件")
    except Exception as e:
        print(f"❌ 发生错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
