/**
 * 全面诊断前端显示问题
 * 检查API、前端代码、浏览器渲染等各个环节
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
    }
  }
});

async function diagnoseFrontend() {
  console.log('🔍 全面诊断前端显示问题\n');
  console.log('=' .repeat(60));
  
  try {
    // 1. 检查数据库原始数据
    console.log('\n【第1步】检查数据库原始数据');
    console.log('-'.repeat(60));
    
    const totalCount = await prisma.questions.count();
    console.log(`✅ 数据库总题数: ${totalCount}`);
    
    const publishedCount = await prisma.questions.count({
      where: { is_published: true }
    });
    console.log(`✅ 已发布题数: ${publishedCount}`);
    
    const withYearCount = await prisma.questions.count({
      where: { 
        is_published: true,
        source_year: { not: null }
      }
    });
    console.log(`✅ 有年份的题数: ${withYearCount}`);
    
    // 2. 模拟API查询（使用映射后的exam_type）
    console.log('\n【第2步】模拟API查询逻辑');
    console.log('-'.repeat(60));
    
    const examType = 'pharmacist';
    const examTypeMap: Record<string, string> = {
      'pharmacist': '执业药师',
      'doctor': '执业医师',
      'nurse': '护士执业',
    };
    const dbExamType = examTypeMap[examType] || '执业药师';
    
    console.log(`前端参数: "${examType}"`);
    console.log(`映射后数据库值: "${dbExamType}"`);
    
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
    
    console.log(`\n✅ SQL查询返回: ${stats.length}条记录`);
    
    if (stats.length === 0) {
      console.log('❌ 查询结果为空！');
      console.log('\n检查可能的原因：');
      console.log('1. exam_type值不匹配');
      console.log('2. is_published全部为false');
      console.log('3. source_year全部为null');
      return;
    }
    
    // 3. 格式化API响应数据（完整模拟前端会收到的数据）
    console.log('\n【第3步】格式化API响应数据');
    console.log('-'.repeat(60));
    
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
    
    console.log('\n✅ API将返回以下JSON数据：');
    console.log(JSON.stringify({
      success: true,
      data: result,
      cached: false
    }, null, 2));
    
    // 4. 检查前端统计值
    console.log('\n【第4步】计算前端统计卡片应显示的值');
    console.log('-'.repeat(60));
    
    const totalQuestionsForFrontend = result.reduce((sum, year) => sum + year.totalQuestions, 0);
    const availableYears = result.filter(y => y.totalQuestions > 0).length;
    
    console.log(`真题总数: ${totalQuestionsForFrontend}`);
    console.log(`已完成: 0 (需从用户答题记录获取)`);
    console.log(`可用年份: ${availableYears}`);
    
    if (totalQuestionsForFrontend === 0) {
      console.log('\n❌ 警告：前端统计值为0！');
    } else {
      console.log('\n✅ 前端统计值正常');
    }
    
    // 5. 检查每年的详细数据
    console.log('\n【第5步】检查每年详细数据');
    console.log('-'.repeat(60));
    
    result.forEach(year => {
      console.log(`\n${year.year}年：`);
      console.log(`  总题数: ${year.totalQuestions}`);
      console.log(`  科目数: ${year.subjects.length}`);
      console.log(`  科目列表:`);
      year.subjects.forEach((subject: any) => {
        console.log(`    - ${subject.name}: ${subject.count}题`);
      });
    });
    
    // 6. 生成前端测试URL
    console.log('\n【第6步】生成测试URL');
    console.log('-'.repeat(60));
    console.log('\n请在浏览器中测试以下URL：');
    console.log('\n1. API端点测试：');
    console.log('   http://localhost:3000/api/history-stats?exam=pharmacist');
    console.log('\n2. 前端页面测试：');
    console.log('   http://localhost:3000/practice/history?exam=pharmacist');
    
    // 7. 检查可能的前端问题
    console.log('\n【第7步】前端常见问题检查清单');
    console.log('-'.repeat(60));
    console.log('\n如果API返回正常但前端不显示，请检查：');
    console.log('');
    console.log('□ 浏览器缓存问题');
    console.log('  - 按 Ctrl+Shift+Delete 清除缓存');
    console.log('  - 或使用无痕模式 (Ctrl+Shift+N)');
    console.log('');
    console.log('□ JavaScript错误');
    console.log('  - 打开浏览器开发者工具 (F12)');
    console.log('  - 查看Console标签是否有红色错误');
    console.log('');
    console.log('□ API请求失败');
    console.log('  - 开发者工具 -> Network标签');
    console.log('  - 刷新页面，查看history-stats请求');
    console.log('  - 检查Status Code是否为200');
    console.log('  - 点击请求查看Response内容');
    console.log('');
    console.log('□ React状态更新问题');
    console.log('  - 检查useState是否正确更新');
    console.log('  - 检查useEffect依赖项是否正确');
    console.log('');
    console.log('□ 开发服务器问题');
    console.log('  - 重启开发服务器: npm run dev');
    console.log('  - 检查是否有TypeScript编译错误');
    
    // 8. 输出诊断报告摘要
    console.log('\n' + '='.repeat(60));
    console.log('📊 诊断报告摘要');
    console.log('='.repeat(60));
    console.log(`✅ 数据库数据: ${totalCount}题`);
    console.log(`✅ SQL查询结果: ${stats.length}条记录`);
    console.log(`✅ API响应数据: ${result.length}个年份`);
    console.log(`✅ 前端应显示: ${totalQuestionsForFrontend}题，${availableYears}个年份`);
    
    if (totalQuestionsForFrontend > 0) {
      console.log('\n🎉 后端数据流程完全正常！');
      console.log('📱 如果前端仍不显示，问题在浏览器/React层面');
    } else {
      console.log('\n⚠️  后端数据流程有问题，需要进一步排查');
    }
    
  } catch (error) {
    console.error('\n❌ 诊断过程中发生错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseFrontend();
