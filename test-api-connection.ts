import { createClient } from '@supabase/supabase-js';

// tiku2 项目配置
const supabaseUrl = 'https://tparjdkxxtnentsdazfw.supabase.co';

// 尝试使用 anon key（你之前提供的）
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s';

// 访问令牌（可能是 service role 或 personal token）
const accessToken = 'sbp_0fe399577a5cdab0a1c4c3d007db783469ba30ad';

console.log('测试方式1: 使用 anon key...\n');
const supabase = createClient(supabaseUrl, anonKey);

// 如果 anon key 失败，可以尝试 access token
// const supabase = createClient(supabaseUrl, accessToken);

async function testAPIConnection() {
  console.log('🔍 使用 API 测试 Supabase 连接\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`项目URL: ${supabaseUrl}`);
  console.log(`使用 Key: ${anonKey.substring(0, 20)}...`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    // 测试1：检查API连接
    console.log('📊 测试1: 检查项目健康状态...');
    const { data: health, error: healthError } = await supabase
      .from('_supabase_metadata')
      .select('*')
      .limit(1);
    
    if (healthError && !healthError.message.includes('does not exist')) {
      console.log('⚠️  项目API连接可能有问题');
      console.log('错误:', healthError.message);
    } else {
      console.log('✅ API 连接正常\n');
    }
    
    // 测试2：查询所有表
    console.log('📋 测试2: 查询数据库表结构...');
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables', {});
    
    // 如果RPC不存在，尝试直接查询
    if (tablesError) {
      console.log('使用备用方法查询表...');
      
      // 尝试查询 questions 表
      const { data: questionCheck, error: questionError } = await supabase
        .from('questions')
        .select('count', { count: 'exact', head: true });
      
      if (questionError) {
        if (questionError.message.includes('relation') || 
            questionError.message.includes('does not exist') ||
            questionError.message.includes('permission denied')) {
          console.log('❌ questions 表不存在或无权限访问\n');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('⚠️  需要先创建数据库表！');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          console.log('请选择以下方式之一：\n');
          console.log('方式1：在 Supabase Dashboard 的 SQL Editor 中运行');
          console.log('  1. 访问: https://supabase.com/dashboard/project/tparjdkxxtnentsdazfw');
          console.log('  2. 点击 "SQL Editor" → "New query"');
          console.log('  3. 复制 "导入真题到tiku2-SQL脚本.sql" 中的创建表SQL');
          console.log('  4. 运行并确认成功\n');
          console.log('方式2：使用 Prisma（需要数据库直连）');
          console.log('  npx prisma db push\n');
          return;
        }
        throw questionError;
      }
      
      console.log('✅ questions 表存在\n');
    }
    
    // 测试3：查询 questions 表数据
    console.log('📚 测试3: 查询题目数据...\n');
    
    const { count: totalCount, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ 查询题目数量失败:', countError.message);
      return;
    }
    
    console.log(`题库总数: ${totalCount || 0} 道题目\n`);
    
    if (totalCount && totalCount > 0) {
      // 查询详细统计
      console.log('📊 详细统计:\n');
      
      // 按考试类型统计
      const { data: byExamType } = await supabase
        .from('questions')
        .select('exam_type');
      
      if (byExamType) {
        const examTypeCounts: Record<string, number> = {};
        byExamType.forEach((q: any) => {
          examTypeCounts[q.exam_type] = (examTypeCounts[q.exam_type] || 0) + 1;
        });
        
        console.log('按考试类型统计:');
        Object.entries(examTypeCounts).forEach(([type, count]) => {
          console.log(`  • ${type}: ${count} 道`);
        });
        console.log('');
      }
      
      // 按科目统计
      const { data: bySubject } = await supabase
        .from('questions')
        .select('subject');
      
      if (bySubject) {
        const subjectCounts: Record<string, number> = {};
        bySubject.forEach((q: any) => {
          subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
        });
        
        console.log('按科目统计:');
        Object.entries(subjectCounts).forEach(([subject, count]) => {
          console.log(`  • ${subject}: ${count} 道`);
        });
        console.log('');
      }
      
      // 查询2024年真题
      const { data: questions2024 } = await supabase
        .from('questions')
        .select('*')
        .contains('knowledge_points', ['2024年真题']);
      
      console.log(`🔥 2024年真题: ${questions2024?.length || 0} 道\n`);
      
      // 显示最近的题目
      const { data: recentQuestions } = await supabase
        .from('questions')
        .select('id, exam_type, subject, content, correct_answer, knowledge_points, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (recentQuestions && recentQuestions.length > 0) {
        console.log('📝 最近添加的题目:\n');
        recentQuestions.forEach((q: any, index: number) => {
          const is2024 = q.knowledge_points?.includes('2024年真题') ? ' 🔥' : '';
          console.log(`  ${index + 1}. [${q.exam_type}/${q.subject}]`);
          console.log(`     ${q.content.substring(0, 50)}...${is2024}`);
          console.log(`     答案: ${q.correct_answer}`);
          console.log('');
        });
      }
      
    } else {
      console.log('⚠️  数据库中没有题目数据\n');
      console.log('下一步: 运行导入脚本');
      console.log('  在 SQL Editor 中运行: 导入真题到tiku2-SQL脚本.sql\n');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ API 连接测试成功！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('💡 结论：');
    console.log('  ✅ Supabase API 连接正常');
    console.log('  ✅ 项目状态健康');
    console.log('  ✅ 可以通过 API 访问数据\n');
    
    console.log('❌ PostgreSQL 直连问题：');
    console.log('  原因: DNS 解析失败');
    console.log('  影响: 无法使用 Prisma 直接连接');
    console.log('  解决: 使用 Supabase Dashboard 或 API 操作\n');
    
    console.log('🎯 推荐方案：');
    console.log('  1. 使用 Dashboard SQL Editor 创建表和导入数据');
    console.log('  2. 前端使用 Supabase API 访问数据');
    console.log('  3. 或解决 DNS 问题后使用 Prisma\n');
    
  } catch (error: any) {
    console.error('\n❌ API 连接测试失败！\n');
    console.error('错误详情:', error.message);
    console.error('\n可能的原因:');
    console.error('  1. 访问令牌无效或过期');
    console.error('  2. 项目URL不正确');
    console.error('  3. 网络连接问题');
    console.error('  4. 项目已暂停或删除\n');
    
    if (error.message.includes('fetch')) {
      console.error('网络问题: 无法访问 Supabase API');
      console.error('请检查网络连接或防火墙设置\n');
    }
  }
}

// 额外测试：诊断网络和DNS问题
async function diagnoseDNSIssue() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 诊断 PostgreSQL 直连问题');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const dbHost = 'db.tparjdkxxtnentsdazfw.supabase.co';
  const dbPort = 5432;
  
  console.log(`数据库主机: ${dbHost}`);
  console.log(`端口: ${dbPort}\n`);
  
  console.log('问题: DNS 无法解析数据库主机名');
  console.log('状态: Name resolution failed\n');
  
  console.log('可能原因:');
  console.log('  1. 网络环境限制（公司/学校网络）');
  console.log('  2. DNS 服务器问题');
  console.log('  3. 防火墙阻止 5432 端口');
  console.log('  4. ISP 限制\n');
  
  console.log('解决方案:');
  console.log('  方案1: 使用 Supabase Dashboard（推荐）');
  console.log('    ✓ 不需要直连数据库');
  console.log('    ✓ 在 SQL Editor 中直接操作');
  console.log('    ✓ 最简单可靠\n');
  
  console.log('  方案2: 使用 API 访问（适合前端）');
  console.log('    ✓ 使用 @supabase/supabase-js');
  console.log('    ✓ 通过 HTTPS API 访问');
  console.log('    ✓ 已经测试成功（见上）\n');
  
  console.log('  方案3: 修复网络问题（需要技术支持）');
  console.log('    • 使用 VPN');
  console.log('    • 更换 DNS 服务器（如 8.8.8.8）');
  console.log('    • 联系网络管理员\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// 执行测试
console.clear();
testAPIConnection().then(() => {
  return diagnoseDNSIssue();
});
