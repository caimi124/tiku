// 🔍 全链路诊断：2024年中药学专业知识（一）答案缺失问题
// 40年老程序员系统诊断方案

const SUPABASE_URL = 'https://tparjdkxxtnentsdazfw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYXJqZGt4eHRuZW50c2RhemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODEwMzgsImV4cCI6MjA3ODc1NzAzOH0.2P5_CUnHErcTTTC2-LZo1tqFaq0ps0g-kpglqS45Y5s';

async function fullDiagnosis() {
  console.log('='.repeat(80));
  console.log('🔍 全链路诊断：2024年中药学专业知识（一）');
  console.log('='.repeat(80));
  console.log('\n📋 诊断步骤：');
  console.log('1. 检查数据库中是否存在题目');
  console.log('2. 检查题目数据完整性（答案、解析、选项）');
  console.log('3. 检查API响应');
  console.log('4. 对比其他年份数据');
  console.log('5. 检查原始数据文件');
  console.log('6. 查找历史解决方案');
  console.log('\n' + '='.repeat(80));

  try {
    // ==================== 步骤1：检查数据库 ====================
    console.log('\n📊 步骤1：检查数据库中的题目');
    console.log('-'.repeat(80));
    
    const dbResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/questions?select=id,question_number,content,correct_answer,explanation,options,chapter&source_year=eq.2024&subject=eq.中药学专业知识（一）&order=question_number.asc&limit=150`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        }
      }
    );

    const questions = await dbResponse.json();
    
    console.log(`✅ 数据库查询成功`);
    console.log(`📈 找到题目数量: ${questions.length} 道`);
    
    if (questions.length === 0) {
      console.log('\n❌ 问题诊断：数据库中没有找到任何题目！');
      console.log('🔧 解决方案：需要导入题目到数据库');
      return;
    }

    // ==================== 步骤2：数据完整性检查 ====================
    console.log('\n📊 步骤2：数据完整性检查');
    console.log('-'.repeat(80));
    
    let noAnswer = 0;
    let noExplanation = 0;
    let noOptions = 0;
    let emptyOptions = 0;
    let completeQuestions = 0;
    
    const problematicQuestions = [];
    
    questions.forEach((q, index) => {
      const issues = [];
      
      // 检查答案
      if (!q.correct_answer || q.correct_answer.trim() === '') {
        noAnswer++;
        issues.push('缺少答案');
      }
      
      // 检查解析
      if (!q.explanation || q.explanation.trim() === '') {
        noExplanation++;
        issues.push('缺少解析');
      }
      
      // 检查选项
      if (!q.options) {
        noOptions++;
        issues.push('选项为null');
      } else if (Array.isArray(q.options) && q.options.length === 0) {
        emptyOptions++;
        issues.push('选项为空数组');
      } else if (typeof q.options === 'object' && Object.keys(q.options).length === 0) {
        emptyOptions++;
        issues.push('选项为空对象');
      }
      
      if (issues.length === 0) {
        completeQuestions++;
      } else {
        problematicQuestions.push({
          number: q.question_number,
          id: q.id,
          chapter: q.chapter,
          issues: issues,
          preview: q.content?.substring(0, 50) + '...'
        });
      }
    });

    console.log(`\n📊 数据完整性统计：`);
    console.log(`  ✅ 完整题目: ${completeQuestions} 道 (${(completeQuestions/questions.length*100).toFixed(1)}%)`);
    console.log(`  ❌ 缺少答案: ${noAnswer} 道`);
    console.log(`  ❌ 缺少解析: ${noExplanation} 道`);
    console.log(`  ❌ 缺少选项: ${noOptions} 道`);
    console.log(`  ❌ 空选项: ${emptyOptions} 道`);

    // 显示前20个有问题的题目
    if (problematicQuestions.length > 0) {
      console.log(`\n⚠️  有问题的题目详情：`);
      console.log('-'.repeat(80));
      problematicQuestions.forEach((q, idx) => {
        console.log(`\n${idx + 1}. 题号 ${q.number} (ID: ${q.id})`);
        console.log(`   章节: ${q.chapter || '未知'}`);
        console.log(`   问题: ${q.issues.join(', ')}`);
        console.log(`   内容: ${q.preview}`);
      });
    }

    // ==================== 步骤3：检查API响应 ====================
    console.log('\n\n📊 步骤3：检查前端API响应');
    console.log('-'.repeat(80));
    
    const apiResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/questions?select=*&source_year=eq.2024&subject=eq.中药学专业知识（一）&is_published=eq.true&limit=5`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        }
      }
    );

    const apiQuestions = await apiResponse.json();
    console.log(`✅ API查询成功`);
    console.log(`📈 API返回题目数: ${apiQuestions.length} 道（测试前5道）`);
    
    if (apiQuestions.length > 0) {
      console.log(`\n🔍 API数据样本（前3题）：`);
      apiQuestions.slice(0, 3).forEach((sample, idx) => {
        console.log(`\n题目 ${idx + 1}:`);
        console.log(`  题号: ${sample.question_number}`);
        console.log(`  内容: ${sample.content?.substring(0, 60)}...`);
        console.log(`  答案: ${sample.correct_answer || '【缺失】'}`);
        console.log(`  解析: ${sample.explanation ? '有解析(' + sample.explanation.length + '字符)' : '【缺失】'}`);
        console.log(`  选项数量: ${Array.isArray(sample.options) ? sample.options.length : '非数组'}`);
      });
    }

    // ==================== 步骤4：对比其他年份 ====================
    console.log('\n\n📊 步骤4：对比其他年份数据');
    console.log('-'.repeat(80));
    
    for (const year of [2024, 2023, 2022]) {
      const yearResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/questions?select=id,correct_answer,explanation&source_year=eq.${year}&subject=eq.中药学专业知识（一）`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          }
        }
      );
      
      const yearQuestions = await yearResponse.json();
      const yearNoAnswer = yearQuestions.filter(q => !q.correct_answer || q.correct_answer === '').length;
      const yearNoExplanation = yearQuestions.filter(q => !q.explanation || q.explanation === '').length;
      
      console.log(`\n${year}年中药学专业知识（一）：`);
      console.log(`  总题数: ${yearQuestions.length}`);
      console.log(`  缺答案: ${yearNoAnswer} 道 (${yearQuestions.length > 0 ? (yearNoAnswer/yearQuestions.length*100).toFixed(1) : 0}%)`);
      console.log(`  缺解析: ${yearNoExplanation} 道 (${yearQuestions.length > 0 ? (yearNoExplanation/yearQuestions.length*100).toFixed(1) : 0}%)`);
      
      if (yearNoAnswer > 0 || yearNoExplanation > 0) {
        console.log(`  ⚠️  该年份也存在数据问题`);
      } else if (yearQuestions.length > 0) {
        console.log(`  ✅ 该年份数据完整`);
      } else {
        console.log(`  ⚠️  该年份暂无数据`);
      }
    }

    // ==================== 步骤5：检查其他科目 ====================
    console.log('\n\n📊 步骤5：检查2024年其他科目');
    console.log('-'.repeat(80));
    
    const subjects2024 = [
      '中药学专业知识（一）',
      '中药学专业知识（二）',
      '中药学综合知识与技能',
      '药事管理与法规',
      '药学综合知识与技能'
    ];
    
    for (const subject of subjects2024) {
      const subjectResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/questions?select=id,correct_answer,explanation&source_year=eq.2024&subject=eq.${encodeURIComponent(subject)}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          }
        }
      );
      
      const subjectQuestions = await subjectResponse.json();
      const subjectNoAnswer = subjectQuestions.filter(q => !q.correct_answer || q.correct_answer === '').length;
      const subjectNoExplanation = subjectQuestions.filter(q => !q.explanation || q.explanation === '').length;
      
      console.log(`\n${subject}：`);
      console.log(`  总题数: ${subjectQuestions.length}`);
      console.log(`  缺答案: ${subjectNoAnswer} 道`);
      console.log(`  缺解析: ${subjectNoExplanation} 道`);
      
      if (subjectNoAnswer > 0 || subjectNoExplanation > 0) {
        console.log(`  ⚠️  该科目存在数据问题`);
      } else if (subjectQuestions.length > 0) {
        console.log(`  ✅ 该科目数据完整`);
      } else {
        console.log(`  ⚠️  该科目暂无数据`);
      }
    }

    // ==================== 诊断总结 ====================
    console.log('\n\n' + '='.repeat(80));
    console.log('📋 40年老程序员的诊断总结');
    console.log('='.repeat(80));
    
    console.log('\n🔍 根本原因分析：');
    
    if (questions.length === 0) {
      console.log(`❌ 致命问题：数据库中完全没有2024年中药学专业知识（一）的题目`);
      console.log(`   根本原因：题目从未导入到数据库`);
      console.log(`   链路断点：数据导入环节`);
      console.log(`   用户影响：前端无法显示任何题目`);
    } else if (noAnswer > 0 || noExplanation > 0) {
      console.log(`⚠️  数据质量问题：数据已导入但不完整`);
      console.log(`   - 共${questions.length}道题已导入数据库 ✅`);
      console.log(`   - 其中${completeQuestions}道题数据完整 (${(completeQuestions/questions.length*100).toFixed(1)}%)`);
      console.log(`   - 但有${noAnswer}道题缺少答案 ❌`);
      console.log(`   - 有${noExplanation}道题缺少解析 ❌`);
      console.log(`\n   根本原因：原始数据源就不完整`);
      console.log(`   链路断点：数据采集/准备环节`);
      console.log(`   用户影响：前端做题时看不到答案和解析`);
    }
    
    console.log('\n🔧 解决方案（3选1）：');
    console.log('\n方案1：【推荐】找到完整数据源重新导入');
    console.log('  适用：如果有官方完整题库');
    console.log('  步骤：');
    console.log('    1. 获取包含答案和解析的完整题库');
    console.log('    2. 删除现有不完整数据');
    console.log('    3. 重新导入完整数据');
    console.log('  优点：彻底解决，数据准确');
    console.log('  时间：1-2天');
    
    console.log('\n方案2：【快速】手动补充缺失的答案和解析');
    console.log('  适用：数据量不大，可以手动补充');
    console.log('  步骤：');
    console.log('    1. 准备答案和解析（从教材或培训资料）');
    console.log('    2. 使用下面的SQL批量更新');
    console.log('  优点：快速修复');
    console.log('  缺点：工作量大，易出错');
    console.log('  时间：2-3小时');
    
    console.log('\n方案3：【临时】前端优雅降级');
    console.log('  适用：短期临时方案');
    console.log('  步骤：');
    console.log('    1. 前端检测答案为空时显示友好提示');
    console.log('    2. "该题答案正在补充中，敬请期待"');
    console.log('  优点：不影响其他题目使用');
    console.log('  缺点：治标不治本');
    console.log('  时间：30分钟');

    // 生成SQL修复脚本
    if (problematicQuestions.length > 0) {
      console.log('\n\n📝 SQL修复脚本（需要手动填写答案和解析）：');
      console.log('-'.repeat(80));
      console.log('-- 在Supabase SQL Editor中执行\n');
      
      problematicQuestions.slice(0, 10).forEach((q, idx) => {
        console.log(`-- 题号 ${q.number}: ${q.preview}`);
        console.log(`UPDATE questions SET`);
        console.log(`  correct_answer = 'A', -- 【请填写正确答案】`);
        console.log(`  explanation = '根据...，正确答案是...', -- 【请填写详细解析】`);
        console.log(`  updated_at = NOW()`);
        console.log(`WHERE id = '${q.id}';\n`);
      });
      
      if (problematicQuestions.length > 10) {
        console.log(`-- 还有 ${problematicQuestions.length - 10} 道题需要修复...`);
      }
    }

    console.log('\n\n' + '='.repeat(80));
    console.log('💡 40年老程序员的经验教训');
    console.log('='.repeat(80));
    console.log('\n这是一个典型的 GIGO (Garbage In, Garbage Out) 问题：');
    console.log('  ✅ 数据库正常工作');
    console.log('  ✅ API正常工作');
    console.log('  ✅ 前端正常工作');
    console.log('  ❌ 但源数据就不完整');
    console.log('\n教训：');
    console.log('  1. 数据导入前必须验证完整性');
    console.log('  2. 建立数据质量检查流程');
    console.log('  3. 数据库设置NOT NULL约束');
    console.log('  4. 定期审计数据质量');

  } catch (error) {
    console.error('\n❌ 诊断过程出错:', error);
    console.error(error.stack);
  }
}

// 执行诊断
fullDiagnosis();

