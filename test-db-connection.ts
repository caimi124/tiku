import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 测试数据库连接...\n');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 60)}...\n`);
  
  try {
    console.log('正在连接数据库...');
    await prisma.$connect();
    console.log('✅ 数据库连接成功！\n');
    
    // 测试查询
    console.log('查询数据库版本...');
    const result: any = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 数据库版本:', result[0]?.version.substring(0, 50) + '...\n');
    
    // 查询现有表
    console.log('查询现有数据表...');
    const tables: any = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('📋 现有数据表:');
    tables.forEach((t: any) => console.log(`   - ${t.table_name}`));
    
    // 查询题目数量
    console.log('\n查询题目数量...');
    try {
      const count = await prisma.question.count();
      console.log(`✨ 题目总数: ${count} 道\n`);
      
      if (count > 0) {
        const zhongyaoCount = await prisma.question.count({
          where: {
            examType: '执业药师',
            subject: '中药学综合知识与技能'
          }
        });
        console.log(`📚 执业药师-中药学综合知识与技能: ${zhongyaoCount} 道\n`);
      }
    } catch (error) {
      console.log('⚠️  questions 表可能还不存在，需要先运行 npx prisma db push\n');
    }
    
    console.log('✅ 所有测试通过！数据库连接正常。\n');
    
  } catch (error: any) {
    console.error('\n❌ 数据库连接失败！\n');
    console.error('错误详情:', error.message);
    console.error('\n可能的原因:');
    console.error('  1. 网络无法访问 Supabase（可能需要代理）');
    console.error('  2. 数据库连接字符串不正确');
    console.error('  3. Supabase 项目已暂停或删除');
    console.error('\n解决方案:');
    console.error('  - 查看 🔧数据库连接问题诊断.md 文件');
    console.error('  - 登录 https://supabase.com/dashboard 检查项目状态');
    console.error('  - 从 Supabase 获取最新的连接字符串\n');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
