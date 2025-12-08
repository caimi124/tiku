// 检查生产环境数据库中的数据
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tparjdkxxtnentsdazfw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s';

async function checkProductionDB() {
  console.log('检查生产环境数据库...\n');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // 检查 knowledge_tree 表
  const { data: nodes, error } = await supabase
    .from('knowledge_tree')
    .select('id, code, title, node_type, subject_code')
    .eq('subject_code', 'xiyao_yaoxue_er')
    .order('code');
  
  if (error) {
    console.error('查询错误:', error);
    return;
  }
  
  console.log('总节点数:', nodes?.length || 0);
  
  if (nodes && nodes.length > 0) {
    const chapters = nodes.filter(n => n.node_type === 'chapter');
    const sections = nodes.filter(n => n.node_type === 'section');
    const points = nodes.filter(n => n.node_type === 'point' || n.node_type === 'knowledge_point');
    
    console.log('章节数:', chapters.length);
    console.log('小节数:', sections.length);
    console.log('知识点数:', points.length);
    
    console.log('\n章节列表:');
    chapters.forEach(ch => {
      console.log(`  ${ch.code}: ${ch.title}`);
    });
  }
}

checkProductionDB().catch(console.error);
