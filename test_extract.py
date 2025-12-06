#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""测试脚本 - 快速提取知识点"""

import json
import re
import sys

# 设置输出编码
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def extract_text_from_json(json_data):
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

def parse_chapters(text):
    """解析章节结构"""
    chapters = []
    chapter_pattern = re.compile(r'第[一二三四五六七八九十]+章\s+([^/]+)')
    section_pattern = re.compile(r'第[一二三四五六七八九十]+节\s+([^\n]+)')
    
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
        chapter_match = chapter_pattern.search(line)
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
        section_match = section_pattern.search(line)
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
                'knowledge_points': []
            }
            continue
    
    # 添加最后一个
    if current_section and current_chapter:
        current_chapter['sections'].append(current_section)
    if current_chapter:
        chapters.append(current_chapter)
    
    return chapters

def main():
    input_file = r'e:\tiku\shuju\西药药二1-50页.json'
    output_file = r'e:\tiku\shuju\西药药二知识树.json'
    
    print("=" * 60)
    print("开始构建知识树...")
    print("=" * 60)
    
    try:
        print(f"📖 正在读取文件: {input_file}")
        with open(input_file, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        print("📝 正在提取文本内容...")
        text = extract_text_from_json(json_data)
        print(f"   提取了 {len(text)} 个字符")
        
        print("🌳 正在解析章节结构...")
        chapters = parse_chapters(text)
        print(f"   找到 {len(chapters)} 个章节")
        
        # 构建知识树
        knowledge_tree = {
            'title': '西药药二知识点体系',
            'chapters': []
        }
        
        for chapter in chapters:
            chapter_data = {
                'chapter_id': f"第{chapter['chapter_id']}章",
                'chapter_name': chapter['chapter_name'],
                'sections': []
            }
            
            for section in chapter['sections']:
                section_data = {
                    'section_id': f"{chapter['chapter_id']}.{section['section_id']}",
                    'section_name': section['section_name'],
                    'knowledge_points': []
                }
                chapter_data['sections'].append(section_data)
            
            knowledge_tree['chapters'].append(chapter_data)
        
        print(f"\n💾 正在保存知识树到: {output_file}")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(knowledge_tree, f, ensure_ascii=False, indent=2)
        
        # 统计信息
        total_chapters = len(knowledge_tree['chapters'])
        total_sections = sum(len(ch['sections']) for ch in knowledge_tree['chapters'])
        
        print(f"\n✅ 知识树构建完成！")
        print(f"   📚 章节数: {total_chapters}")
        print(f"   📖 节数: {total_sections}")
        print(f"   💾 已保存到: {output_file}")
        print("\n🎉 处理完成！")
        
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
