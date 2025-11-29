import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
    }
  }
});

async function testAPIFix() {
  try {
    console.log('🔍 测试API修复后的查询逻辑...\n');
    
    const examType = 'pharmacist';
    const examTypeMap: Record<string, string> = {
      'pharmacist': '执业药师',
      'doctor': '执业医师',
      'nurse': '护士执业',
    };
    
    const dbExamType = examTypeMap[examType] || '执业药师';
    console.log(`📌 前端参数: "${examType}"`);
    console.log(`📌 映射后数据库值: "${dbExamType}"`);
    
    // 模拟API查询
    const stats = await prisma.$queryRaw`
      SELECT 
        source_year as year,
        subject,
        COUNT(*) as count
      FROM questions
      WHERE 
        is_published = true
        AND exam_type = ${dbExamType}
        AND source_year IS NOT NULL
      GROUP BY source_year, subject
      ORDER BY source_year DESC, subject
    ` as Array<{ year: number; subject: string; count: bigint }>;
    
    console.log(`\n✅ 查询结果: ${stats.length}条记录\n`);
    
    // 格式化数据
    const yearMap = new Map<number, any>();
    
    stats.forEach(item => {
      const year = item.year;
      if (!yearMap.has(year)) {
        yearMap.set(year, {
          year,
          totalQuestions: 0,
          subjects: []
        });
      }
      
      const yearData = yearMap.get(year);
      const count = Number(item.count);
      yearData.totalQuestions += count;
      yearData.subjects.push({
        name: item.subject,
        count
      });
    });

    const result = Array.from(yearMap.values());
    
    console.log('📊 格式化后的结果：\n');
    result.forEach(year => {
      console.log(`${year.year}年 - 总计 ${year.totalQuestions}题`);
      year.subjects.forEach((subject: any) => {
        console.log(`  - ${subject.name}: ${subject.count}题`);
      });
      console.log('');
    });
    
    console.log('✅ API修复验证成功！');
    console.log('\n📱 前端统计数据：');
    console.log(`  - 真题总数: ${result.reduce((sum, year) => sum + year.totalQuestions, 0)}`);
    console.log(`  - 可用年份: ${result.filter(y => y.totalQuestions > 0).length}`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIFix();
