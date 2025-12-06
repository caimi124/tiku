# -*- coding: utf-8 -*-
"""分析PDF JSON结构"""
import json

with open('shuju/西药药二1-50页.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"总页数: {len(data['pdf_info'])}")
print("\n前20页内容预览:")

for page in data['pdf_info'][:20]:
    page_idx = page.get('page_idx', 0)
    blocks = page.get('para_blocks', [])
    
    # 提取所有文本
    texts = []
    for block in blocks:
        if 'lines' in block:
            for line in block['lines']:
                if 'spans' in line:
                    for span in line['spans']:
                        if 'content' in span:
                            texts.append(span['content'])
        if 'blocks' in block:
            for sub in block['blocks']:
                if 'lines' in sub:
                    for line in sub['lines']:
                        if 'spans' in line:
                            for span in line['spans']:
                                if 'content' in span:
                                    texts.append(span['content'])
    
    # 合并文本
    full_text = ' '.join(texts)[:200]
    print(f"\nPage {page_idx}: {len(blocks)} blocks")
    print(f"  内容: {full_text}...")
