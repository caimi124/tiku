import { createClient } from '@supabase/supabase-js';

// tiku2 项目配置
const supabaseUrl = 'https://tparjdkxxtnentsdazfw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s';

const supabase = createClient(supabaseUrl, supabaseKey);

// 2024年执业药师中药学综合知识与技能真题
const questions2024 = [
  {
    exam_type: '执业药师',
    subject: '中药学综合知识与技能',
    chapter: '中医基础理论',
    question_type: 'single',
    content: '属于"阳脉之海"的是',
    options: [
      { key: 'A', value: '阳维之脉' },
      { key: 'B', value: '阳跷之脉' },
      { key: 'C', value: '督脉' },
      { key: 'D', value: '带脉' },
      { key: 'E', value: '任脉' },
    ],
    correct_answer: 'C',
    explanation: '督脉为"阳脉之海"。任脉为"阴脉之海"。',
    difficulty: 2,
    knowledge_points: ['经络学说', '高频考点', '2024年真题'],
    is_published: true,
  },
  {
    exam_type: '执业药师',
    subject: '中药学综合知识与技能',
    chapter: '中药贮藏与养护',
    question_type: 'single',
    content: '《中国药典》"凡例"中贮藏项下各名词术语进行了解释，关于中药贮藏名词说法，正确的是',
    options: [
      { key: 'A', value: '密封系指将容器密闭，以防止尘及异物进入' },
      { key: 'B', value: '遮光系指避免日光直射' },
      { key: 'C', value: '阴凉处系指不超过20°C的环境' },
      { key: 'D', value: '冷处系指0~8°C的环境' },
      { key: 'E', value: '常温系指10~25°C的环境' },
    ],
    correct_answer: 'C',
    explanation: '阴凉处系指不超过20°C的环境。',
    difficulty: 2,
    knowledge_points: ['中药贮藏', '药典', '2024年真题'],
    is_published: true,
  },
  {
    exam_type: '执业药师',
    subject: '中药学综合知识与技能',
    chapter: '中药调剂',
    question_type: 'single',
    content: '根据《医疗机构中药煎药室管理规范》，关于中药煎药室管理的说法，错误的是',
    options: [
      { key: 'A', value: '煎药人员应当熟悉中药饮片性能和煎药操作规程' },
      { key: 'B', value: '煎药室应当配备必要的煎药设备和质量检测设备' },
      { key: 'C', value: '煎药用水应当符合饮用水标准' },
      { key: 'D', value: '代煎药品不得使用含朱砂、雄黄等矿物类药材' },
      { key: 'E', value: '煎好的药液应当在4小时内包装' },
    ],
    correct_answer: 'E',
    explanation: '煎好的药液应当及时滤过，并在2小时内包装。',
    difficulty: 3,
    knowledge_points: ['中药煎药', '管理规范', '2024年真题'],
    is_published: true,
  },
];

async function importViaAPI() {
  console.log('🚀 使用 Supabase API 导入2024年真题\n');
  console.log(`项目: tiku2`);
  console.log(`URL: ${supabaseUrl}\n`);
  
  try {
    // 测试API连接
    console.log('1️⃣ 测试API连接...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('questions')
      .select('count', { count: 'exact', head: true });
    
    if (healthError) {
      if (healthError.message.includes('relation') || healthError.message.includes('does not exist')) {
        console.log('⚠️  questions 表不存在');
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('❌ 需要先创建数据库表结构！');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('请选择以下方式之一：\n');
        console.log('方式1：使用 Prisma（需要数据库直连）');
        console.log('  npx prisma db push\n');
        console.log('方式2：在 Supabase Dashboard 的 SQL Editor 中运行');
        console.log('  打开文件：create-tables-for-dashboard.sql');
        console.log('  复制SQL并在 Dashboard 中执行\n');
        console.log('创建表后再运行此脚本导入数据。\n');
        return;
      }
      throw healthError;
    }
    
    console.log('✅ API连接成功\n');
    
    // 查询现有题目数量
    const { count: existingCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 当前题库: ${existingCount || 0} 道题目\n`);
    
    // 批量导入题目
    console.log('2️⃣ 开始导入2024年真题...\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < questions2024.length; i++) {
      const question = questions2024[i];
      console.log(`导入第 ${i + 1}/${questions2024.length} 题...`);
      
      try {
        const { data, error } = await supabase
          .from('questions')
          .insert([question])
          .select();
        
        if (error) throw error;
        
        console.log(`✅ 成功: ${question.content.substring(0, 30)}...`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ 失败: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 导入统计');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ 成功: ${successCount} 道`);
    console.log(`❌ 失败: ${errorCount} 道`);
    console.log(`📚 总计: ${questions2024.length} 道`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // 查询最终题目数量
    const { count: finalCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });
    
    console.log(`🎉 题库总数: ${finalCount || 0} 道题目\n`);
    
    if (successCount > 0) {
      console.log('✅ 导入完成！下一步：');
      console.log('   1. 更新前端配置使用 tiku2 项目');
      console.log('   2. 启动开发服务器：npm run dev');
      console.log('   3. 访问：http://localhost:3000/practice\n');
    }
    
  } catch (error: any) {
    console.error('\n❌ 操作失败！\n');
    console.error('错误详情:', error.message);
    console.error('\n可能的原因:');
    console.error('  1. API密钥权限不足');
    console.error('  2. 表结构不存在');
    console.error('  3. 网络连接问题\n');
  }
}

// 执行导入
importViaAPI();
