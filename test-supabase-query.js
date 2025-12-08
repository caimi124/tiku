// 测试 Supabase 查询 - 模拟 API 的查询
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tparjdkxxtnentsdazfw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s';

async function test() {
  console.log('=== 测试 Supabase 查询 ===\n');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  const subject = 'xiyao_yaoxue_er';
  
  // 模拟 API 的查询
  const { data: chapters, error: chaptersError } = await supabase
    .from('knowledge_tree')
    .select('id, code, title, parent_id, node_type, importance')
    .eq('subject_code', subject)
    .in('node_type', ['chapter', 'section', 'point', 'knowledge_point'])
    .order('code');
  
  if (chaptersError) {
    console.error('查询错误:', chaptersError);
    return;
  }
  
  console.log('查询返回的总数:', chapters?.length || 0);
  
  if (chapters) {
    const chapterNodes = chapters.filter(n => n.node_type === 'chapter');
    const sectionNodes = chapters.filter(n => n.node_type === 'section');
    const pointNodes = chapters.filter(n => n.node_type === 'point' || n.node_type === 'knowledge_point');
    
    console.log('章节数:', chapterNodes.length);
    console.log('小节数:', sectionNodes.length);
    console.log('知识点数:', pointNodes.length);
    
    console.log('\n章节列表:');
    chapterNodes.forEach(ch => {
      console.log(`  ${ch.code}: ${ch.title}`);
    });
  }
}

test().catch(console.error);
