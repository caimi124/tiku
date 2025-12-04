const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:CwKXguB7eIA4tfTn@db.tparjdkxxtnentsdazfw.supabase.co:5432/postgres'
    }
  }
});

async function checkMissingAnswers() {
  try {
    console.log('🔍 开始检查数据库中的题目...\n');
    
    // 检查没有答案的题目
    const noAnswerCount = await prisma.questions.count({
      where: {
        OR: [
          { correct_answer: null },
          { correct_answer: '' }
        ]
      }
    });
    
    // 检查没有解析的题目
    const noExplanationCount = await prisma.questions.count({
      where: {
        OR: [
          { explanation: null },
          { explanation: '' }
        ]
      }
    });
    
    // 检查没有选项的题目
    const noOptionsCount = await prisma.questions.count({
      where: {
        OR: [
          { options: null },
          { options: { equals: {} } },
          { options: { equals: [] } }
        ]
      }
    });
    
    // 总题目数
    const totalCount = await prisma.questions.count();
    
    // 按年份统计
    const yearStats = await prisma.$queryRaw`
      SELECT 
        source_year,
        subject,
        COUNT(*) as total,
        COUNT(CASE WHEN correct_answer IS NULL OR correct_answer = '' THEN 1 END) as no_answer,
        COUNT(CASE WHEN explanation IS NULL OR explanation = '' THEN 1 END) as no_explanation
      FROM questions
      WHERE source_year IS NOT NULL
      GROUP BY source_year, subject
      ORDER BY source_year DESC, subject
    `;
    
    console.log('📊 数据库统计：');
    console.log('━'.repeat(60));
    console.log(`总题目数量: ${totalCount}`);
    console.log(`没有答案的题目: ${noAnswerCount} (${(noAnswerCount/totalCount*100).toFixed(2)}%)`);
    console.log(`没有解析的题目: ${noExplanationCount} (${(noExplanationCount/totalCount*100).toFixed(2)}%)`);
    console.log(`没有选项的题目: ${noOptionsCount} (${(noOptionsCount/totalCount*100).toFixed(2)}%)`);
    console.log('━'.repeat(60));
    
    console.log('\n📅 按年份和科目统计：');
    console.log('━'.repeat(60));
    yearStats.forEach(stat => {
      console.log(`${stat.source_year}年 - ${stat.subject}`);
      console.log(`  总数: ${stat.total}, 缺答案: ${stat.no_answer}, 缺解析: ${stat.no_explanation}`);
    });
    
    // 获取一些没有答案的题目示例
    if (noAnswerCount > 0) {
      console.log('\n❌ 没有答案的题目示例（前5条）：');
      console.log('━'.repeat(60));
      const samples = await prisma.questions.findMany({
        where: {
          OR: [
            { correct_answer: null },
            { correct_answer: '' }
          ]
        },
        take: 5,
        select: {
          id: true,
          content: true,
          subject: true,
          source_year: true,
          chapter: true,
          options: true
        }
      });
      
      samples.forEach((q, idx) => {
        console.log(`\n${idx + 1}. ID: ${q.id}`);
        console.log(`   年份: ${q.source_year}, 科目: ${q.subject}`);
        console.log(`   章节: ${q.chapter}`);
        console.log(`   题目: ${q.content.substring(0, 100)}...`);
        console.log(`   选项: ${JSON.stringify(q.options)}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMissingAnswers();

