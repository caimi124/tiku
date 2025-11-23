"""
2024年执业药师中药学综合知识与技能真题导入脚本
解析题库原始数据并批量导入到Supabase数据库
"""

import re
import psycopg2
from datetime import datetime

# 数据库连接配置
# 使用Transaction pooler连接（更稳定）
DATABASE_URL = "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

def parse_questions(file_path):
    """解析题目文件"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    questions = []
    lines = content.split('\n')
    
    i = 0
    current_question = None
    collecting_content = False
    collecting_explanation = False
    
    while i < len(lines):
        line = lines[i].strip()
        
        # 跳过空行和分隔线
        if not line or line.startswith('=') or line.startswith('【') or line.startswith('（'):
            i += 1
            continue
        
        # 检测题号 - 支持多种格式
        # 格式1: "1.题目内容"
        # 格式2: "1\n题目内容"  
        question_match = re.match(r'^(\d+)[\.\s]*(.*)$', line)
        if question_match:
            q_num_str = question_match.group(1)
            q_num = int(q_num_str)
            
            # 只处理1-120的题号
            if 1 <= q_num <= 120:
                # 保存上一题
                if current_question and current_question.get('content'):
                    questions.append(current_question)
                
                q_content = question_match.group(2).strip()
                
                # 确定题目类型
                if 1 <= q_num <= 40:
                    q_type = 'single'
                    q_chapter = '最佳选择题'
                elif 41 <= q_num <= 90:
                    q_type = 'match'
                    q_chapter = '配伍选择题'
                elif 91 <= q_num <= 110:
                    q_type = 'comprehensive'
                    q_chapter = '综合分析题'
                else:
                    q_type = 'multiple'
                    q_chapter = '多项选择题'
                
                current_question = {
                    'number': q_num,
                    'type': q_type,
                    'chapter': q_chapter,
                    'content': q_content,
                    'options': [],
                    'answer': '',
                    'explanation': ''
                }
                collecting_content = True if not q_content else False
                collecting_explanation = False
        
        # 如果题目内容在下一行
        elif collecting_content and current_question and not re.match(r'^[A-E]\.', line):
            if not line.startswith('正确答案') and not line.startswith('解题思路'):
                if current_question['content']:
                    current_question['content'] += line
                else:
                    current_question['content'] = line
        
        # 解析选项
        elif re.match(r'^[A-E]\.', line):
            option_match = re.match(r'^([A-E])\.(.+)$', line)
            if option_match and current_question:
                collecting_content = False
                current_question['options'].append({
                    'key': option_match.group(1),
                    'value': option_match.group(2).strip()
                })
        
        # 解析答案
        elif line.startswith('正确答案：') or line.startswith('正确答案:'):
            if current_question:
                collecting_content = False
                answer_text = re.sub(r'^正确答案[：:]', '', line).strip()
                current_question['answer'] = answer_text
        
        # 解析解题思路
        elif line.startswith('解题思路：') or line.startswith('解题思路:'):
            if current_question:
                collecting_content = False
                collecting_explanation = True
                explanation_text = re.sub(r'^解题思路[：:]', '', line).strip()
                current_question['explanation'] = explanation_text
        
        # 继续收集解题思路（多行）
        elif collecting_explanation and current_question:
            if not re.match(r'^\d+\.', line) and not line.startswith('正确答案'):
                current_question['explanation'] += line
        
        i += 1
    
    # 保存最后一题
    if current_question and current_question.get('content'):
        questions.append(current_question)
    
    return questions

def get_question_type_db(q_type):
    """转换题目类型到数据库格式"""
    type_map = {
        'single': 'single',
        'match': 'match',
        'comprehensive': 'comprehensive',
        'multiple': 'multiple'
    }
    return type_map.get(q_type, 'single')

def import_to_database(questions):
    """导入题目到数据库"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    try:
        # 先删除已存在的2024年题目
        delete_sql = """
        DELETE FROM questions 
        WHERE exam_type = '执业药师' 
        AND subject = '中药学综合知识与技能' 
        AND source_year = 2024
        """
        cur.execute(delete_sql)
        conn.commit()
        deleted_count = cur.rowcount
        print(f"🗑️  已清理旧数据: {deleted_count} 条\n")
        
        # 批量插入
        success_count = 0
        error_count = 0
        
        import json
        
        for q in questions:
            try:
                # 构建SQL插入语句
                insert_sql = """
                INSERT INTO questions (
                    exam_type, subject, chapter, question_type, 
                    content, options, correct_answer, explanation,
                    difficulty, knowledge_points, source_type, source_year,
                    created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                """
                
                # 准备数据
                now = datetime.now()
                difficulty = 2  # 默认难度
                knowledge_points = [q['chapter']]
                
                # 将options转换为JSON格式
                options_json = json.dumps(q['options'], ensure_ascii=False)
                
                cur.execute(insert_sql, (
                    '执业药师',
                    '中药学综合知识与技能',
                    q['chapter'],
                    get_question_type_db(q['type']),
                    q['content'],
                    options_json,
                    q['answer'],
                    q['explanation'],
                    difficulty,
                    knowledge_points,  # 直接传递数组，不用json.dumps
                    '历年真题',
                    2024,
                    now,
                    now
                ))
                
                # 每题单独提交
                conn.commit()
                
                success_count += 1
                preview = q['content'][:40] if len(q['content']) > 40 else q['content']
                print(f"✅ [{q['number']}/120] {preview}...")
                
            except Exception as e:
                # 回滚当前事务
                conn.rollback()
                error_count += 1
                error_msg = str(e)
                # 只显示前100个字符的错误信息
                if len(error_msg) > 100:
                    error_msg = error_msg[:100] + '...'
                print(f"❌ [{q['number']}] 导入失败: {error_msg}")
                # 显示第一个错误的完整信息
                if error_count == 1:
                    print(f"  完整错误: {str(e)}")
        
        print(f"\n{'='*60}")
        print('📊 导入统计:')
        print(f"   ✅ 成功: {success_count} 道")
        print(f"   ❌ 失败: {error_count} 道")
        print(f"   📝 总计: {len(questions)} 道")
        print(f"{'='*60}\n")
        
        # 验证
        verify_sql = """
        SELECT COUNT(*) FROM questions 
        WHERE exam_type = '执业药师' 
        AND subject = '中药学综合知识与技能' 
        AND source_year = 2024
        """
        cur.execute(verify_sql)
        total = cur.fetchone()[0]
        print(f"✨ 数据库中现有【2024年中药学综合知识与技能】题目: {total} 道\n")
        print('🎉 导入完成！\n')
        
    except Exception as e:
        conn.rollback()
        print(f"❌ 导入失败: {str(e)}")
        raise
    finally:
        cur.close()
        conn.close()

def main():
    print('🚀 开始导入2024年执业药师中药学综合知识与技能真题（120题）\n')
    
    # 解析题目
    print('📖 正在解析题目文件...')
    questions = parse_questions(r'e:\tiku\题库原始数据-请粘贴到这里.txt')
    print(f'✅ 成功解析 {len(questions)} 道题目\n')
    
    # 导入数据库
    if questions:
        import_to_database(questions)
    else:
        print('⚠️  未找到题目数据')

if __name__ == '__main__':
    main()
