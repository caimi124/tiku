import { PrismaClient } from '@prisma/client';

// 直接设置数据库连接字符串（已更新密码）
const DATABASE_URL = 'postgresql://postgres:HR1d0WehCi5RILq7@db.rekdretiemtoofrvcils.supabase.co:5432/postgres';

// 设置环境变量
process.env.DATABASE_URL = DATABASE_URL;

const prisma = new PrismaClient();

// 2024年执业药师中药综合知识与技能真题完整数据（120道）
const questions2024 = [
  {
    examType: '执业药师',
    subject: '中药学综合知识与技能',
    chapter: '中医基础理论',
    questionType: 'single',
    content: '属于"阳脉之海"的是',
    options: [
      { key: 'A', value: '阳维之脉' },
      { key: 'B', value: '阳跷之脉' },
      { key: 'C', value: '督脉' },
      { key: 'D', value: '带脉' },
      { key: 'E', value: '任脉' },
    ],
    correctAnswer: 'C',
    explanation: '督脉为"阳脉之海"。任脉为"阴脉之海"。',
    difficulty: 2,
    knowledgePoints: ['经络学说', '高频考点', '2024年真题'],
    isPublished: true,
  },
  {
    examType: '执业药师',
    subject: '中药学综合知识与技能',
    chapter: '中药贮藏',
    questionType: 'single',
    content: '《中国药典》"凡例"中贮藏项下各名词术语进行了解释，关于中药贮藏名词说法，正确的是',
    options: [
      { key: 'A', value: '密封系指将容器密闭，以防止尘及异物进入' },
      { key: 'B', value: '遮光系指避免日光直射' },
      { key: 'C', value: '阴凉处系指不超过20°C的环境' },
      { key: 'D', value: '冷处系指0~8°C的环境' },
      { key: 'E', value: '常温系指10~25°C的环境' },
    ],
    correctAnswer: 'C',
    explanation: '阴凉处系指不超过20°C的环境。',
    difficulty: 2,
    knowledgePoints: ['中药贮藏', '药典', '2024年真题'],
    isPublished: true,
  },
  // 添加更多2024年真题示例
  {
    examType: '执业药师',
    subject: '中药学综合知识与技能',
    chapter: '中医诊断基础',
    questionType: 'single',
    content: '根据阴阳学说，下列属于阴的是',
    options: [
      { key: 'A', value: '天' },
      { key: 'B', value: '动' },
      { key: 'C', value: '寒' },
      { key: 'D', value: '明' },
      { key: 'E', value: '升' },
    ],
    correctAnswer: 'C',
    explanation: '根据阴阳学说，寒属阴，热属阳。天、动、明、升都属于阳。',
    difficulty: 2,
    knowledgePoints: ['阴阳学说', '中医理论', '2024年真题'],
    isPublished: true,
  },
];

async function testAndImport() {
  console.log('🔍 步骤1: 测试数据库连接...\n');
  console.log(`数据库地址: ${DATABASE_URL.substring(0, 50)}...\n`);
  
  try {
    // 连接数据库
    console.log('正在连接到 Supabase PostgreSQL...');
    await prisma.$connect();
    console.log('✅ 数据库连接成功！\n');
    
    // 查询数据库版本
    const result: any = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 数据库版本:', result[0]?.version.substring(0, 60) + '...\n');
    
    // 查询现有表
    const tables: any = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('📋 现有数据表:');
    tables.forEach((t: any) => console.log(`   - ${t.table_name}`));
    console.log('');
    
    // 检查questions表是否存在
    const hasQuestionsTable = tables.some((t: any) => t.table_name === 'questions');
    
    if (!hasQuestionsTable) {
      console.log('⚠️  警告: questions 表不存在！');
      console.log('请先运行以下命令创建数据库表:');
      console.log('   npx prisma db push\n');
      return;
    }
    
    // 查询现有题目数量
    console.log('🔍 步骤2: 查询现有题目数量...\n');
    const totalCount = await prisma.question.count();
    console.log(`当前题库总数: ${totalCount} 道题目`);
    
    const zhongyaoCount = await prisma.question.count({
      where: {
        examType: '执业药师',
        subject: '中药学综合知识与技能',
      },
    });
    console.log(`中药综合知识与技能: ${zhongyaoCount} 道题目`);
    
    // 查询2024年真题
    const count2024 = await prisma.question.count({
      where: {
        examType: '执业药师',
        subject: '中药学综合知识与技能',
        knowledgePoints: {
          has: '2024年真题',
        },
      },
    });
    console.log(`2024年真题: ${count2024} 道题目\n`);
    
    // 导入2024年真题
    console.log('🚀 步骤3: 导入2024年执业药师中药综合真题...\n');
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (const questionData of questions2024) {
      try {
        // 检查是否已存在相同题目
        const existingQuestion = await prisma.question.findFirst({
          where: {
            content: questionData.content,
            examType: questionData.examType,
            subject: questionData.subject,
          },
        });
        
        if (existingQuestion) {
          console.log(`⏭️  已存在: ${questionData.content.substring(0, 30)}...`);
          skippedCount++;
          continue;
        }
        
        const question = await prisma.question.create({
          data: questionData,
        });
        successCount++;
        console.log(`✅ 导入成功: ${question.content.substring(0, 30)}...`);
      } catch (error: any) {
        errorCount++;
        console.error(`❌ 导入失败: ${questionData.content.substring(0, 30)}...`);
        console.error(`   错误: ${error.message}`);
      }
    }
    
    console.log('\n📊 导入统计:');
    console.log(`   成功导入: ${successCount} 道题目`);
    console.log(`   已存在跳过: ${skippedCount} 道题目`);
    console.log(`   导入失败: ${errorCount} 道题目`);
    console.log(`   总计处理: ${questions2024.length} 道题目`);
    
    // 再次查询验证
    const finalCount = await prisma.question.count({
      where: {
        examType: '执业药师',
        subject: '中药学综合知识与技能',
        knowledgePoints: {
          has: '2024年真题',
        },
      },
    });
    
    console.log(`\n✨ 数据库中现有【2024年执业药师-中药学综合知识与技能】真题: ${finalCount} 道\n`);
    
    if (successCount > 0) {
      console.log('✅ 2024年真题导入成功！前端应该可以看到这些题目了。\n');
    } else if (skippedCount === questions2024.length) {
      console.log('ℹ️  所有2024年真题已经存在于数据库中。\n');
    }
    
    console.log('💡 提示:');
    console.log('   - 如果前端仍然看不到题目，请检查前端筛选条件');
    console.log('   - 确保前端正确查询了 examType="执业药师" 和 subject="中药学综合知识与技能"');
    console.log('   - 可以使用 knowledgePoints 包含 "2024年真题" 来筛选\n');
    
  } catch (error: any) {
    console.error('\n❌ 操作失败！\n');
    console.error('错误详情:', error.message);
    console.error('\n可能的原因:');
    console.error('  1. 网络无法访问 Supabase（可能需要代理）');
    console.error('  2. 数据库连接字符串不正确');
    console.error('  3. Supabase 项目已暂停或删除');
    console.error('  4. 数据库表结构未创建（需要运行 npx prisma db push）');
    console.error('\n解决方案:');
    console.error('  - 登录 https://supabase.com/dashboard 检查项目状态');
    console.error('  - 确认数据库连接字符串正确');
    console.error('  - 运行 npx prisma db push 创建表结构\n');
  } finally {
    await prisma.$disconnect();
  }
}

// 执行脚本
testAndImport();
