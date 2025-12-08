// 最终检查数据库数据
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tparjdkxxtnentsdazfw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s';

async function check() {
  console.log('=== 最终数据库检查 ===\n');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // 1. 检查所有 subject_code
  const { data: subjects, error: subjectsError } = await supabase
    .from('knowledge_tree')
    .select('subject_code')
    .limit(1000);
  
  if (subjectsError) {
    console.error('查询错误:', subjectsError);
    return;
  }
  
  const subjectCounts = {};
  subjects.forEach(s => {
    subjectCounts[s.subject_code] = (subjectCounts[s.subject_code] || 0) + 1;
  });
  
  console.log('所有 subject_code 的数量:');
  Object.entries(subjectCounts).forEach(([code, count]) => {
    console.log(`  ${code}: ${count}`);
  });
  
  // 2. 检查 xiyao_yaoxue_er 的详细数据
  console.log('\n--- xiyao_yaoxue_er 详细数据 ---');
  
  const { data: nodes, error: nodesError } = await supabase
    .from('knowledge_tree')
    .select('id, code, title, node_type, parent_id')
    .eq('subject_code', 'xiyao_yaoxue_er')
    .order('code');
  
  if (nodesError) {
    console.error('查询错误:', nodesError);
    return;
  }
  
  console.log('总节点数:', nodes.length);
  
  const chapters = nodes.filter(n => n.node_type === 'chapter');
  const sections = nodes.filter(n => n.node_type === 'section');
  const points = nodes.filter(n => n.node_type === 'point' || n.node_type === 'knowledge_point');
  
  console.log('章节数:', chapters.length);
  console.log('小节数:', sections.length);
  console.log('知识点数:', points.length);
  
  console.log('\n章节列表:');
  chapters.forEach(ch => {
    const chSections = sections.filter(s => s.parent_id === ch.id);
    console.log(`  ${ch.code}: ${ch.title} (${chSections.length}个小节)`);
  });
}

check().catch(console.error);
