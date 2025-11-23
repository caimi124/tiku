import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tparjdkxxtnentsdazfw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE4MTAzOCwiZXhwIjoyMDc4NzU3MDM4fQ.i0nA_AOLnBdeK7chICmeltFchkdJmYKMVqVxu8IaofE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteYaoxue2024() {
  console.log('🗑️  删除2024年药学专业知识（一）数据\n');
  
  try {
    // 查询要删除的数据数量
    const { count, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('exam_type', '执业药师')
      .eq('subject', '药学专业知识（一）')
      .eq('source_year', 2024);

    if (countError) {
      console.error('❌ 查询失败:', countError.message);
      return;
    }

    console.log(`📊 找到 ${count} 道题目需要删除\n`);

    if (count === 0) {
      console.log('✅ 没有需要删除的数据');
      return;
    }

    // 确认删除
    console.log('🔍 即将删除：');
    console.log('   考试类型: 执业药师');
    console.log('   科目: 药学专业知识（一）');
    console.log('   年份: 2024');
    console.log(`   数量: ${count} 道题\n`);

    // 执行删除
    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .eq('exam_type', '执业药师')
      .eq('subject', '药学专业知识（一）')
      .eq('source_year', 2024);

    if (deleteError) {
      console.error('❌ 删除失败:', deleteError.message);
      return;
    }

    console.log(`✅ 成功删除 ${count} 道题目\n`);

    // 验证删除结果
    const { count: verifyCount, error: verifyError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('exam_type', '执业药师')
      .eq('subject', '药学专业知识（一）')
      .eq('source_year', 2024);

    if (verifyError) {
      console.error('⚠️  验证失败:', verifyError.message);
    } else {
      console.log(`🔍 验证: 当前还有 ${verifyCount} 道药学专业知识（一）2024年题目`);
      if (verifyCount === 0) {
        console.log('✅ 删除成功，数据已清空\n');
      }
    }

    // 显示剩余的2024年数据
    console.log('📊 2024年剩余数据统计:\n');
    const { data: remaining, error: remainingError } = await supabase
      .from('questions')
      .select('subject')
      .eq('exam_type', '执业药师')
      .eq('source_year', 2024);

    if (!remainingError && remaining) {
      const stats: Record<string, number> = {};
      remaining.forEach((item: any) => {
        const subject = item.subject || '未知';
        stats[subject] = (stats[subject] || 0) + 1;
      });

      Object.keys(stats).forEach(subject => {
        console.log(`   ${subject}: ${stats[subject]}道`);
      });
    }

    console.log('\n✅ 操作完成！\n');

  } catch (error: any) {
    console.error('❌ 操作失败:', error.message);
  }
}

deleteYaoxue2024();
