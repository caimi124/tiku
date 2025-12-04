// 使用Node.js内置的fetch (Node 18+)

const SUPABASE_URL = 'https://tparjdkxxtnentsdazfw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s';

async function checkDatabase() {
  try {
    console.log('🔍 开始检查数据库...\n');
    
    // 1. 检查总题目数
    const totalResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/questions?select=count`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'count=exact'
        }
      }
    );
    
    const totalCount = totalResponse.headers.get('content-range')?.split('/')[1] || 0;
    console.log(`📊 总题目数: ${totalCount}\n`);
    
    // 2. 检查没有答案的题目
    const noAnswerResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/questions?select=id,content,subject,source_year,chapter,correct_answer,options&or=(correct_answer.is.null,correct_answer.eq.)&limit=10`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'count=exact'
        }
      }
    );
    
    const noAnswerCount = noAnswerResponse.headers.get('content-range')?.split('/')[1] || 0;
    const noAnswerQuestions = await noAnswerResponse.json();
    
    console.log(`❌ 没有答案的题目数: ${noAnswerCount}`);
    
    if (noAnswerQuestions.length > 0) {
      console.log('\n示例题目（前10条）：');
      console.log('━'.repeat(80));
      noAnswerQuestions.forEach((q, idx) => {
        console.log(`\n${idx + 1}. ID: ${q.id}`);
        console.log(`   年份: ${q.source_year || '未知'}, 科目: ${q.subject || '未知'}`);
        console.log(`   章节: ${q.chapter || '未知'}`);
        console.log(`   题目: ${q.content?.substring(0, 80)}...`);
        console.log(`   答案: ${q.correct_answer || '【无答案】'}`);
        console.log(`   选项类型: ${typeof q.options}, 内容: ${JSON.stringify(q.options)?.substring(0, 100)}`);
      });
    }
    
    // 3. 按年份统计
    console.log('\n\n📅 按年份统计：');
    console.log('━'.repeat(80));
    
    for (const year of [2024, 2023, 2022]) {
      const yearResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/questions?select=subject&source_year=eq.${year}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'count=exact'
          }
        }
      );
      
      const yearCount = yearResponse.headers.get('content-range')?.split('/')[1] || 0;
      const yearQuestions = await yearResponse.json();
      
      // 统计科目
      const subjects = {};
      yearQuestions.forEach(q => {
        subjects[q.subject] = (subjects[q.subject] || 0) + 1;
      });
      
      console.log(`\n${year}年: 总计 ${yearCount} 道题`);
      Object.entries(subjects).forEach(([subject, count]) => {
        console.log(`  - ${subject}: ${count} 道`);
      });
      
      // 检查该年份缺答案的题目
      const yearNoAnswerResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/questions?select=id&source_year=eq.${year}&or=(correct_answer.is.null,correct_answer.eq.)`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'count=exact'
          }
        }
      );
      
      const yearNoAnswerCount = yearNoAnswerResponse.headers.get('content-range')?.split('/')[1] || 0;
      if (yearNoAnswerCount > 0) {
        console.log(`  ⚠️  缺少答案: ${yearNoAnswerCount} 道`);
      }
    }
    
    // 4. 检查选项格式问题
    console.log('\n\n🔧 检查选项格式：');
    console.log('━'.repeat(80));
    
    const optionsCheckResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/questions?select=id,content,options,subject,source_year&limit=5`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );
    
    const sampleQuestions = await optionsCheckResponse.json();
    sampleQuestions.forEach((q, idx) => {
      console.log(`\n${idx + 1}. ${q.source_year}年 - ${q.subject}`);
      console.log(`   题目: ${q.content?.substring(0, 60)}...`);
      console.log(`   选项格式: ${typeof q.options}`);
      console.log(`   选项内容: ${JSON.stringify(q.options)?.substring(0, 150)}...`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error(error);
  }
}

checkDatabase();

