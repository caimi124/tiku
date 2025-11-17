import { PrismaClient } from '@prisma/client';

// 使用新的数据库连接字符串
const NEW_DATABASE_URL = 'postgresql://postgres:HR1d0WehCi5RILq7@db.rekdretiemtoofrvcils.supabase.co:5432/postgres';

// 设置环境变量
process.env.DATABASE_URL = NEW_DATABASE_URL;

const prisma = new PrismaClient();

async function testNewConnection() {
  console.log('🔍 测试新的数据库连接...\n');
  console.log(`数据库地址: ${NEW_DATABASE_URL.substring(0, 50)}...\n`);
  
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
      console.log('⚠️  数据库中没有表！需要运行 npx prisma db push 创建表结构\n');
    } else {
      console.log('现有数据表:');
      tables.forEach((t: any) => console.log(`   ✓ ${t.table_name}`));
      console.log('');
    }
    
    // 检查questions表是否存在
    const hasQuestionsTable = tables.some((t: any) => t.table_name === 'questions');
    
    if (!hasQuestionsTable) {
      console.log('❌ questions 表不存在！\n');
      console.log('需要运行以下命令创建数据库结构:');
      console.log('   npx prisma db push\n');
      return;
    }
    
    // 查询题目数据
    console.log('📚 查询题目数据...\n');
    
    const totalCount = await prisma.question.count();
    console.log(`题库总数: ${totalCount} 道题目`);
    
    if (totalCount > 0) {
      // 按考试类型统计
      const examTypes: any = await prisma.$queryRaw`
        SELECT exam_type, COUNT(*) as count
        FROM questions
        GROUP BY exam_type
        ORDER BY count DESC
      `;
      
      console.log('\n按考试类型统计:');
      examTypes.forEach((type: any) => {
        console.log(`   • ${type.exam_type}: ${type.count} 道`);
      });
      
      // 按科目统计
      const subjects: any = await prisma.$queryRaw`
        SELECT subject, COUNT(*) as count
        FROM questions
        GROUP BY subject
        ORDER BY count DESC
        LIMIT 10
      `;
      
      console.log('\n按科目统计 (前10):');
      subjects.forEach((subj: any) => {
        console.log(`   • ${subj.subject}: ${subj.count} 道`);
      });
      
      // 查询2024年真题
      const count2024 = await prisma.question.count({
        where: {
          knowledgePoints: {
            has: '2024年真题',
          },
        },
      });
      
      console.log(`\n🔥 2024年真题: ${count2024} 道`);
      
      // 查询执业药师-中药学综合知识与技能
      const zhongyaoCount = await prisma.question.count({
        where: {
          examType: '执业药师',
          subject: '中药学综合知识与技能',
        },
      });
      
      console.log(`📖 执业药师-中药学综合知识与技能: ${zhongyaoCount} 道`);
      
      // 查询最近添加的题目
      const recentQuestions = await prisma.question.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          examType: true,
          subject: true,
          content: true,
          createdAt: true,
          knowledgePoints: true,
        },
      });
      
      console.log('\n📝 最近添加的题目:');
      recentQuestions.forEach((q, index) => {
        const is2024 = q.knowledgePoints?.includes('2024年真题') ? ' 🔥' : '';
        console.log(`   ${index + 1}. [${q.examType}/${q.subject}] ${q.content.substring(0, 40)}...${is2024}`);
      });
      
    } else {
      console.log('\n⚠️  数据库中没有题目数据！');
      console.log('运行以下命令导入2024年真题:');
      console.log('   npx tsx setup-db-2024.ts\n');
    }
    
    console.log('\n✅ 数据库连接测试完成！\n');
    
    // 生成新的 .env.local 内容
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 更新你的 .env.local 文件内容:\n');
    console.log('DATABASE_URL="postgresql://postgres:HR1d0WehCi5RILq7@db.rekdretiemtoofrvcils.supabase.co:5432/postgres"');
    console.log('NEXTAUTH_SECRET="your-secret-key-123456"');
    console.log('NEXTAUTH_URL="http://localhost:3000"');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error: any) {
    console.error('\n❌ 数据库连接失败！\n');
    console.error('错误详情:', error.message);
    console.error('\n可能的原因:');
    console.error('  1. Supabase 项目已暂停 - 访问 https://supabase.com/dashboard 恢复项目');
    console.error('  2. 密码错误 - 请确认密码是否为: HR1d0WehCi5RILq7');
    console.error('  3. 网络连接问题 - 检查网络是否正常');
    console.error('  4. 防火墙阻止 - 检查防火墙设置\n');
  } finally {
    await prisma.$disconnect();
  }
}

// 执行测试
testNewConnection();
