const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tparjdkxxtnentsdazfw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s';

async function testSupabaseClient() {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Using key:', supabaseKey.substring(0, 20) + '...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // 测试 /api/knowledge/structure 使用的查询
  const subject = 'xiyao_yaoxue_er';
  
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
  
  console.log('\n查询到的节点总数:', chapters?.length || 0);
  
  if (chapters && chapters.length > 0) {
    const chapterNodes = chapters.filter(n => n.node_type === 'chapter');
    const sectionNodes = chapters.filter(n => n.node_type === 'section');
    const pointNodes = chapters.filter(n => n.node_type === 'point' || n.node_type === 'knowledge_point');
    
    console.log('章节数:', chapterNodes.length);
    console.log('小节数:', sectionNodes.length);
    console.log('知识点数:', pointNodes.length);
    
    console.log('\n前3个章节:');
    chapterNodes.slice(0, 3).forEach(ch => {
      console.log(`  ${ch.code}: ${ch.title}`);
    });
  } else {
    console.log('没有查询到数据！');
  }
}

testSupabaseClient().catch(console.error);
