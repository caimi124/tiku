import { PrismaClient } from '@prisma/client';

// 使用新的 tiku2 数据库连接字符串
const DATABASE_URL = 'postgresql://postgres:bdcW5inRuvSMfwYN@db.tparjdkxxtnentsdazfw.supabase.co:5432/postgres';

// 设置环境变量
process.env.DATABASE_URL = DATABASE_URL;

const prisma = new PrismaClient();

async function testTiku2Connection() {
  console.log('🔍 测试 tiku2 数据库连接...\n');
  console.log(`项目ID: tparjdkxxtnentsdazfw`);
  console.log(`数据库地址: db.tparjdkxxtnentsdazfw.supabase.co\n`);
  
  try {
    // 连接数据库
    console.log('正在连接到 Supabase PostgreSQL...');
    await prisma.$connect();
    console.log('✅ 数据库连接成功！\n');
    
    // 查询数据库版本
    console.log('📊 查询数据库信息...');
    const result: any = await prisma.$queryRaw`SELECT version()`;
    console.log('数据库版本:', result[0]?.version.substring(0, 80) + '...\n');
    
    // 查询现有表
    console.log('📋 查询数据表...');
    const tables: any = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    if (tables.length === 0) {
      console.log('ℹ️  数据库中没有表（这是新项目，正常情况）\n');
      console.log('下一步：运行 npx prisma db push 创建表结构\n');
    } else {
      console.log(`✨ 找到 ${tables.length} 个数据表:\n`);
      tables.forEach((t: any) => console.log(`   ✓ ${t.table_name}`));
      console.log('');
      
      // 如果有 questions 表，查询数据
      const hasQuestionsTable = tables.some((t: any) => t.table_name === 'questions');
      if (hasQuestionsTable) {
        const count = await prisma.question.count();
        console.log(`📚 题库总数: ${count} 道题目\n`);
      }
    }
    
    console.log('✅ 数据库连接测试成功！\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 tiku2 项目已就绪！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error: any) {
    console.error('\n❌ 数据库连接失败！\n');
    console.error('错误详情:', error.message);
    console.error('\n可能的原因:');
    console.error('  1. 项目刚创建，可能需要等待1-2分钟');
    console.error('  2. 密码错误');
    console.error('  3. 网络连接问题\n');
  } finally {
    await prisma.$disconnect();
  }
}

// 执行测试
testTiku2Connection();
