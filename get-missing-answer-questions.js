// 获取所有缺失答案的题目详情，用于手动补充

const SUPABASE_URL = 'https://tparjdkxxtnentsdazfw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s';

async function getMissingAnswers() {
  try {
    console.log('📥 获取所有缺失答案的题目...\n');
    
    // 分批获取所有缺失答案的题目
    let allQuestions = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/questions?select=id,content,subject,source_year,chapter,question_number,options,correct_answer&or=(correct_answer.is.null,correct_answer.eq.)&order=source_year.desc,subject,question_number&limit=${limit}&offset=${offset}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          }
        }
      );
      
      const questions = await response.json();
      if (questions.length === 0) break;
      
      allQuestions = allQuestions.concat(questions);
      offset += limit;
      
      console.log(`已获取 ${allQuestions.length} 道题目...`);
    }
    
    console.log(`\n✅ 共获取 ${allQuestions.length} 道缺失答案的题目\n`);
    console.log('━'.repeat(100));
    
    // 按年份和科目分组
    const grouped = {};
    allQuestions.forEach(q => {
      const key = `${q.source_year}-${q.subject}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(q);
    });
    
    // 输出详细信息
    Object.keys(grouped).sort().forEach(key => {
      const [year, subject] = key.split('-');
      const questions = grouped[key];
      
      console.log(`\n\n📚 ${year}年 - ${subject} (${questions.length}道题)`);
      console.log('━'.repeat(100));
      
      questions.forEach((q, idx) => {
        console.log(`\n${idx + 1}. [题号 ${q.question_number || '未知'}] ID: ${q.id}`);
        console.log(`   章节: ${q.chapter || '未知'}`);
        console.log(`   题目: ${q.content?.substring(0, 100)}...`);
        console.log(`   选项:`);
        
        if (Array.isArray(q.options)) {
          q.options.forEach(opt => {
            console.log(`      ${opt.key}. ${opt.value?.substring(0, 80) || '(图片选项)'}`);
          });
        }
        
        console.log(`   当前答案: ${q.correct_answer || '【缺失】'}`);
        console.log(`   ⚠️  需要补充答案`);
      });
    });
    
    // 生成SQL更新脚本模板
    console.log('\n\n━'.repeat(100));
    console.log('📝 SQL更新脚本模板：');
    console.log('━'.repeat(100));
    console.log('\n-- 复制以下SQL到Supabase SQL Editor执行\n');
    console.log('-- 请根据实际答案修改对应的correct_answer值\n');
    
    Object.keys(grouped).sort().forEach(key => {
      const [year, subject] = key.split('-');
      const questions = grouped[key];
      
      console.log(`\n-- ${year}年 - ${subject}`);
      questions.slice(0, 5).forEach((q, idx) => {
        console.log(`UPDATE questions SET correct_answer = '答案' WHERE id = '${q.id}'; -- 题${q.question_number}: ${q.content?.substring(0, 50)}...`);
      });
      if (questions.length > 5) {
        console.log(`-- ... 还有 ${questions.length - 5} 道题需要补充`);
      }
    });
    
  } catch (error) {
    console.error('❌ 获取失败:', error.message);
  }
}

getMissingAnswers();

