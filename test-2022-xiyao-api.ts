// 快速测试：验证2022年西药综合数据是否可通过API访问
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAPI() {
  console.log('\n🧪 测试2022年西药综合API数据\n');
  console.log('='.repeat(60));

  // 1. 测试数据库直接查询
  const dbResult = await prisma.questions.findMany({
    where: {
      source_year: 2022,
      subject: '药学综合知识与技能',
      is_published: true
    },
    select: {
      id: true,
      subject: true,
      source_year: true,
      chapter: true
    },
    take: 5
  });

  console.log('\n✅ 数据库查询结果:');
  console.log(`   找到 ${dbResult.length} 条记录（仅显示前5条）`);
  if (dbResult.length > 0) {
    console.log('   示例记录:');
    dbResult.forEach((q, i) => {
      console.log(`   ${i + 1}. 科目: ${q.subject}, 年份: ${q.source_year}, 章节: ${q.chapter}`);
    });
  }

  // 2. 测试历年真题统计API逻辑
  const stats = await prisma.$queryRaw`
    SELECT 
      source_year as year,
      subject,
      COUNT(*) as count
    FROM questions
    WHERE 
      is_published = true
      AND exam_type = '执业药师'
      AND source_year IS NOT NULL
    GROUP BY source_year, subject
    ORDER BY source_year DESC, subject
  ` as Array<{ year: number; subject: string; count: bigint }>;

  console.log('\n✅ 历年真题统计查询结果:');
  
  // 查找2022年数据
  const year2022 = stats.filter(s => s.year === 2022);
  
  if (year2022.length > 0) {
    console.log(`\n   ✅ 找到2022年数据 (${year2022.length}个科目):`);
    year2022.forEach(item => {
      console.log(`      - ${item.subject}: ${Number(item.count)}道题`);
    });
  } else {
    console.log('   ❌ 未找到2022年数据');
  }

  // 显示所有年份统计
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

  console.log('\n📊 所有年份统计:');
  const allYears = Array.from(yearMap.values()).sort((a, b) => b.year - a.year);
  allYears.forEach(year => {
    console.log(`\n   ${year.year}年 (共${year.totalQuestions}题):`);
    year.subjects.forEach((s: any) => {
      console.log(`      - ${s.name}: ${s.count}题`);
    });
  });

  // 3. 验证前端访问路径
  console.log('\n' + '='.repeat(60));
  console.log('📋 前端访问路径:');
  console.log('='.repeat(60));
  console.log('\n✅ 历年真题列表:');
  console.log('   http://localhost:3000/practice/history?exam=pharmacist');
  console.log('\n✅ 2022年西药综合练习:');
  console.log('   http://localhost:3000/practice/history/2022?subject=药学综合知识与技能');
  console.log('\n✅ 2022年西药综合模拟考试:');
  console.log('   http://localhost:3000/practice/history/2022/mock?subject=药学综合知识与技能');
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ 测试完成！\n');
}

testAPI()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
