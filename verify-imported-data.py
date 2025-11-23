"""
验证导入的题目数据
"""
import psycopg2

DATABASE_URL = "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

def verify_data():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    try:
        # 按题型统计
        print("📊 题型分布统计：\n")
        cur.execute("""
            SELECT question_type, COUNT(*) 
            FROM questions 
            WHERE exam_type = '执业药师' 
            AND subject = '中药学综合知识与技能' 
            AND source_year = 2024
            GROUP BY question_type
            ORDER BY question_type
        """)
        
        for row in cur.fetchall():
            print(f"  {row[0]:15s}: {row[1]:3d} 道")
        
        # 总数
        print("\n" + "="*50)
        cur.execute("""
            SELECT COUNT(*) 
            FROM questions 
            WHERE exam_type = '执业药师' 
            AND subject = '中药学综合知识与技能' 
            AND source_year = 2024
        """)
        total = cur.fetchone()[0]
        print(f"✅ 总计: {total} 道题目\n")
        
        # 抽样检查
        print("🔍 随机抽样检查（前3道题）：\n")
        cur.execute("""
            SELECT content, question_type, correct_answer 
            FROM questions 
            WHERE exam_type = '执业药师' 
            AND subject = '中药学综合知识与技能' 
            AND source_year = 2024
            ORDER BY id
            LIMIT 3
        """)
        
        for i, row in enumerate(cur.fetchall(), 1):
            content = row[0][:50] + '...' if len(row[0]) > 50 else row[0]
            print(f"  {i}. [{row[1]}] {content}")
            print(f"     答案: {row[2]}\n")
        
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    verify_data()
