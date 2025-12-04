// 📊 全面数据质量报告
// 检查所有年份、所有科目的答案和题目缺失情况

const SUPABASE_URL = 'https://tparjdkxxtnentsdazfw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s';

// 定义所有应该有的科目
const SUBJECTS = {
  pharmacy: [
    '药学专业知识（一）',
    '药学专业知识（二）',
    '药事管理与法规',
    '药学综合知识与技能'
  ],
  chinese: [
    '中药学专业知识（一）',
    '中药学专业知识（二）',
    '药事管理与法规',  // 共用科目
    '中药学综合知识与技能'
  ]
};

const YEARS = [2024, 2023, 2022, 2021, 2020];
const EXPECTED_QUESTIONS_PER_SUBJECT = 120; // 每科应该有120道题

async function generateFullReport() {
  console.log('═'.repeat(100));
  console.log('📊 执业药师题库 - 全面数据质量报告');
  console.log('═'.repeat(100));
  console.log(`生成时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log('\n');

  try {
    // 获取所有年份和科目的数据
    const allSubjects = [
      ...SUBJECTS.pharmacy,
      ...SUBJECTS.chinese.filter(s => s !== '药事管理与法规') // 去重
    ];
    const uniqueSubjects = [...new Set(allSubjects)];

    console.log('📚 检查范围：');
    console.log(`  年份: ${YEARS.join(', ')}`);
    console.log(`  科目数: ${uniqueSubjects.length} 个`);
    console.log(`  药学类: ${SUBJECTS.pharmacy.join(', ')}`);
    console.log(`  中药学类: ${SUBJECTS.chinese.join(', ')}`);
    console.log('\n' + '═'.repeat(100));

    const report = [];
    let totalQuestions = 0;
    let totalMissingAnswers = 0;
    let totalMissingExplanations = 0;
    let totalMissingSubjects = 0;

    // 按年份循环
    for (const year of YEARS) {
      console.log(`\n\n📅 ${year}年数据检查`);
      console.log('─'.repeat(100));

      const yearStats = {
        year,
        subjects: [],
        totalQuestions: 0,
        totalMissingAnswers: 0,
        totalMissingExplanations: 0,
        missingSubjects: []
      };

      // 按科目循环
      for (const subject of uniqueSubjects) {
        // 查询该年份该科目的所有题目
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/questions?select=id,question_number,correct_answer,explanation&source_year=eq.${year}&subject=eq.${encodeURIComponent(subject)}`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            }
          }
        );

        const questions = await response.json();
        const total = questions.length;

        if (total === 0) {
          // 该科目没有数据
          yearStats.missingSubjects.push(subject);
          totalMissingSubjects++;
          
          console.log(`\n❌ ${subject}:`);
          console.log(`   状态: 完全缺失（0道题）`);
          console.log(`   预期: ${EXPECTED_QUESTIONS_PER_SUBJECT}道题`);
          console.log(`   缺失: ${EXPECTED_QUESTIONS_PER_SUBJECT}道题 (100%)`);
          
          yearStats.subjects.push({
            name: subject,
            total: 0,
            expected: EXPECTED_QUESTIONS_PER_SUBJECT,
            missingAnswers: 0,
            missingExplanations: 0,
            status: '完全缺失',
            completeness: 0
          });
          
          continue;
        }

        // 统计缺失情况
        const missingAnswers = questions.filter(q => !q.correct_answer || q.correct_answer.trim() === '').length;
        const missingExplanations = questions.filter(q => !q.explanation || q.explanation.trim() === '').length;
        
        totalQuestions += total;
        totalMissingAnswers += missingAnswers;
        totalMissingExplanations += missingExplanations;
        yearStats.totalQuestions += total;
        yearStats.totalMissingAnswers += missingAnswers;
        yearStats.totalMissingExplanations += missingExplanations;

        // 计算完整性
        const completeness = ((total - missingAnswers) / total * 100).toFixed(1);
        
        // 状态判断
        let status = '✅ 完整';
        if (total < EXPECTED_QUESTIONS_PER_SUBJECT) {
          status = '⚠️ 题目不足';
        } else if (missingAnswers > 0 || missingExplanations > 0) {
          status = '❌ 数据不完整';
        }

        console.log(`\n${status === '✅ 完整' ? '✅' : status.includes('不足') ? '⚠️' : '❌'} ${subject}:`);
        console.log(`   题目数: ${total}/${EXPECTED_QUESTIONS_PER_SUBJECT} ${total < EXPECTED_QUESTIONS_PER_SUBJECT ? '(少' + (EXPECTED_QUESTIONS_PER_SUBJECT - total) + '道)' : ''}`);
        console.log(`   缺答案: ${missingAnswers} 道 (${(missingAnswers/total*100).toFixed(1)}%)`);
        console.log(`   缺解析: ${missingExplanations} 道 (${(missingExplanations/total*100).toFixed(1)}%)`);
        console.log(`   完整性: ${completeness}%`);
        console.log(`   状态: ${status}`);

        yearStats.subjects.push({
          name: subject,
          total,
          expected: EXPECTED_QUESTIONS_PER_SUBJECT,
          missingAnswers,
          missingExplanations,
          status,
          completeness: parseFloat(completeness)
        });
      }

      report.push(yearStats);
    }

    // ==================== 汇总报告 ====================
    console.log('\n\n');
    console.log('═'.repeat(100));
    console.log('📈 数据质量汇总报告');
    console.log('═'.repeat(100));

    console.log(`\n📊 总体统计：`);
    console.log(`  题库总题数: ${totalQuestions} 道`);
    console.log(`  缺少答案: ${totalMissingAnswers} 道 (${totalQuestions > 0 ? (totalMissingAnswers/totalQuestions*100).toFixed(2) : 0}%)`);
    console.log(`  缺少解析: ${totalMissingExplanations} 道 (${totalQuestions > 0 ? (totalMissingExplanations/totalQuestions*100).toFixed(2) : 0}%)`);
    console.log(`  完全缺失的科目: ${totalMissingSubjects} 个`);

    // 按严重程度排序
    console.log('\n\n🔥 数据问题严重程度排行（按缺失答案数）：');
    console.log('─'.repeat(100));

    const problemList = [];
    report.forEach(yearData => {
      yearData.subjects.forEach(subjectData => {
        if (subjectData.missingAnswers > 0 || subjectData.total === 0) {
          problemList.push({
            year: yearData.year,
            subject: subjectData.name,
            total: subjectData.total,
            expected: subjectData.expected,
            missingAnswers: subjectData.missingAnswers,
            missingExplanations: subjectData.missingExplanations,
            completeness: subjectData.completeness
          });
        }
      });
    });

    // 排序：先按缺失答案数，再按年份
    problemList.sort((a, b) => {
      if (a.total === 0 && b.total > 0) return -1;
      if (a.total > 0 && b.total === 0) return 1;
      if (b.missingAnswers !== a.missingAnswers) return b.missingAnswers - a.missingAnswers;
      return b.year - a.year;
    });

    problemList.forEach((item, idx) => {
      console.log(`\n${idx + 1}. ${item.year}年 - ${item.subject}`);
      if (item.total === 0) {
        console.log(`   ❌ 完全缺失: 0/${item.expected}道题 (需要导入${item.expected}道题)`);
      } else {
        console.log(`   题目数: ${item.total}/${item.expected}道 ${item.total < item.expected ? '❌ 缺' + (item.expected - item.total) + '道' : '✅'}`);
        console.log(`   缺答案: ${item.missingAnswers}道 (${item.total > 0 ? (item.missingAnswers/item.total*100).toFixed(1) : 0}%)`);
        console.log(`   缺解析: ${item.missingExplanations}道 (${item.total > 0 ? (item.missingExplanations/item.total*100).toFixed(1) : 0}%)`);
        console.log(`   完整性: ${item.completeness}%`);
      }
    });

    // 完整的科目
    console.log('\n\n✅ 数据完整的科目（可正常使用）：');
    console.log('─'.repeat(100));

    const completeList = [];
    report.forEach(yearData => {
      yearData.subjects.forEach(subjectData => {
        if (subjectData.total > 0 && subjectData.missingAnswers === 0 && subjectData.missingExplanations === 0) {
          completeList.push({
            year: yearData.year,
            subject: subjectData.name,
            total: subjectData.total
          });
        }
      });
    });

    if (completeList.length > 0) {
      completeList.forEach((item, idx) => {
        console.log(`${idx + 1}. ${item.year}年 - ${item.subject} (${item.total}道题)`);
      });
    } else {
      console.log('暂无完全完整的科目');
    }

    // ==================== 按年份汇总 ====================
    console.log('\n\n');
    console.log('═'.repeat(100));
    console.log('📅 按年份汇总表');
    console.log('═'.repeat(100));

    console.log('\n' + '年份'.padEnd(8) + '总题数'.padEnd(10) + '缺答案'.padEnd(10) + '缺解析'.padEnd(10) + '完整性'.padEnd(10) + '状态');
    console.log('─'.repeat(100));

    report.forEach(yearData => {
      const completeness = yearData.totalQuestions > 0 
        ? ((yearData.totalQuestions - yearData.totalMissingAnswers) / yearData.totalQuestions * 100).toFixed(1)
        : 0;
      
      const status = yearData.totalMissingAnswers === 0 && yearData.totalMissingExplanations === 0 
        ? '✅ 完整'
        : '❌ 不完整';

      console.log(
        `${yearData.year}`.padEnd(8) +
        `${yearData.totalQuestions}`.padEnd(10) +
        `${yearData.totalMissingAnswers}`.padEnd(10) +
        `${yearData.totalMissingExplanations}`.padEnd(10) +
        `${completeness}%`.padEnd(10) +
        status
      );
    });

    // ==================== 详细表格 ====================
    console.log('\n\n');
    console.log('═'.repeat(100));
    console.log('📋 详细数据表（按年份和科目）');
    console.log('═'.repeat(100));

    report.forEach(yearData => {
      console.log(`\n\n【${yearData.year}年】`);
      console.log('─'.repeat(100));
      console.log('科目'.padEnd(30) + '题目数'.padEnd(12) + '缺答案'.padEnd(12) + '缺解析'.padEnd(12) + '完整性'.padEnd(10) + '状态');
      console.log('─'.repeat(100));

      yearData.subjects.forEach(subject => {
        const statusIcon = subject.status === '✅ 完整' ? '✅' : 
                          subject.status === '完全缺失' ? '❌' : 
                          subject.status === '⚠️ 题目不足' ? '⚠️' : '❌';
        
        console.log(
          subject.name.padEnd(30) +
          `${subject.total}/${subject.expected}`.padEnd(12) +
          `${subject.missingAnswers}`.padEnd(12) +
          `${subject.missingExplanations}`.padEnd(12) +
          `${subject.completeness}%`.padEnd(10) +
          `${statusIcon} ${subject.status}`
        );
      });
    });

    // ==================== 行动建议 ====================
    console.log('\n\n');
    console.log('═'.repeat(100));
    console.log('🎯 修复建议（按优先级）');
    console.log('═'.repeat(100));

    console.log('\n🔴 高优先级（影响用户使用）：');
    const highPriority = problemList.filter(item => item.missingAnswers > 20 || item.total === 0);
    if (highPriority.length > 0) {
      highPriority.forEach((item, idx) => {
        if (item.total === 0) {
          console.log(`${idx + 1}. ${item.year}年《${item.subject}》- 需要导入${item.expected}道完整题目`);
        } else {
          console.log(`${idx + 1}. ${item.year}年《${item.subject}》- 需要补充${item.missingAnswers}道题的答案和解析`);
        }
      });
    } else {
      console.log('无');
    }

    console.log('\n🟡 中优先级（部分题目缺失）：');
    const mediumPriority = problemList.filter(item => item.missingAnswers > 0 && item.missingAnswers <= 20 && item.total > 0);
    if (mediumPriority.length > 0) {
      mediumPriority.forEach((item, idx) => {
        console.log(`${idx + 1}. ${item.year}年《${item.subject}》- 需要补充${item.missingAnswers}道题的答案`);
      });
    } else {
      console.log('无');
    }

    console.log('\n🟢 低优先级（只缺解析，有答案）：');
    const lowPriority = problemList.filter(item => item.missingAnswers === 0 && item.missingExplanations > 0);
    if (lowPriority.length > 0) {
      lowPriority.forEach((item, idx) => {
        console.log(`${idx + 1}. ${item.year}年《${item.subject}》- 需要补充${item.missingExplanations}道题的解析`);
      });
    } else {
      console.log('无');
    }

    // ==================== 工作量估算 ====================
    console.log('\n\n');
    console.log('═'.repeat(100));
    console.log('⏰ 修复工作量估算');
    console.log('═'.repeat(100));

    const totalMissingQuestionsToImport = problemList
      .filter(item => item.total === 0)
      .reduce((sum, item) => sum + item.expected, 0);

    const totalAnswersToFix = totalMissingAnswers;
    const totalExplanationsToFix = totalMissingExplanations - totalMissingAnswers; // 只缺解析的

    console.log(`\n📊 工作量统计：`);
    console.log(`  需要导入的完整题目: ${totalMissingQuestionsToImport}道 (${totalMissingSubjects}个科目)`);
    console.log(`  需要补充答案的题目: ${totalAnswersToFix}道`);
    console.log(`  需要补充解析的题目: ${totalExplanationsToFix}道`);

    console.log(`\n⏱️  预计时间：`);
    console.log(`  导入完整题目: ${Math.ceil(totalMissingQuestionsToImport / 120 * 2)}天 (按每科2天计算)`);
    console.log(`  补充答案: ${Math.ceil(totalAnswersToFix / 50 * 3)}小时 (按每小时处理50题计算)`);
    console.log(`  补充解析: ${Math.ceil(totalExplanationsToFix / 30 * 2)}小时 (按每小时处理30题计算)`);

    console.log(`\n👥 建议人力：`);
    console.log(`  数据录入: 1-2人`);
    console.log(`  专业审核: 1人（执业药师）`);
    console.log(`  技术支持: 1人`);

    // ==================== 导出JSON ====================
    const jsonReport = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalQuestions,
        totalMissingAnswers,
        totalMissingExplanations,
        totalMissingSubjects,
        completeness: totalQuestions > 0 ? ((totalQuestions - totalMissingAnswers) / totalQuestions * 100).toFixed(2) : 0
      },
      byYear: report,
      problemList: problemList,
      completeList: completeList
    };

    // 保存到文件
    const fs = require('fs');
    fs.writeFileSync('data-quality-report.json', JSON.stringify(jsonReport, null, 2), 'utf-8');
    console.log('\n\n✅ 详细报告已保存到: data-quality-report.json');

    console.log('\n\n');
    console.log('═'.repeat(100));
    console.log('✅ 报告生成完成');
    console.log('═'.repeat(100));

  } catch (error) {
    console.error('\n❌ 报告生成失败:', error.message);
    console.error(error.stack);
  }
}

// 执行
generateFullReport();

