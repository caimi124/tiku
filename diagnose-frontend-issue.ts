// 全面诊断前端显示问题
async function diagnoseFrontend() {
  console.log('🔍 全面诊断前端历年真题显示问题\n');
  console.log('═'.repeat(70));

  const baseUrl = 'https://yikaobiguo.com';

  try {
    // 1. 测试前端页面的API调用逻辑
    console.log('\n📊 步骤1：测试前端实际调用的API\n');

    const subjects = [
      "中药学综合知识与技能",
      "中药学专业知识（一）",
      "药学专业知识（一）"
    ];
    const years = [2024, 2023, 2022];

    for (const year of years) {
      console.log(`\n${year}年:`);
      let yearTotal = 0;

      for (const subject of subjects) {
        try {
          // 模拟前端fetchYearData的调用
          const url = `${baseUrl}/api/questions?examType=执业药师&subject=${encodeURIComponent(subject)}&sourceYear=${year}&sourceType=历年真题`;
          console.log(`   API: ${url.substring(0, 100)}...`);

          const response = await fetch(url);
          const data = await response.json();

          if (data.success && data.data && data.data.total > 0) {
            console.log(`   ✅ ${subject}: ${data.data.total}道`);
            yearTotal += data.data.total;
          } else {
            console.log(`   ❌ ${subject}: 无数据 (success: ${data.success})`);
            if (data.error) {
              console.log(`      错误: ${data.error}`);
            }
          }
        } catch (error: any) {
          console.log(`   ❌ ${subject}: 请求失败 - ${error.message}`);
        }
      }

      console.log(`   📊 ${year}年总计: ${yearTotal}道`);
    }

    // 2. 测试不带examType的查询
    console.log('\n\n📋 步骤2：测试不带examType参数的查询\n');

    for (const year of years) {
      try {
        const url = `${baseUrl}/api/questions?subject=中药学综合知识与技能&sourceYear=${year}&sourceType=历年真题`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.data && data.data.total > 0) {
          console.log(`${year}年: ✅ ${data.data.total}道`);
        } else {
          console.log(`${year}年: ❌ 无数据`);
        }
      } catch (error: any) {
        console.log(`${year}年: ❌ 请求失败`);
      }
    }

    // 3. 测试最简单的查询
    console.log('\n\n🔍 步骤3：测试最简单的查询\n');

    try {
      const url = `${baseUrl}/api/questions?sourceType=历年真题&limit=1`;
      console.log(`URL: ${url}`);
      const response = await fetch(url);
      const data = await response.json();

      console.log(`状态: ${data.success ? '✅ 成功' : '❌ 失败'}`);
      if (data.data) {
        console.log(`总数: ${data.data.total}`);
        if (data.data.questions && data.data.questions.length > 0) {
          const q = data.data.questions[0];
          console.log(`\n示例题目:`);
          console.log(`  科目: ${q.subject}`);
          console.log(`  年份: ${q.source_year}`);
          console.log(`  内容: ${q.content.substring(0, 50)}...`);
        }
      }
      if (data.error) {
        console.log(`错误: ${data.error}`);
      }
    } catch (error: any) {
      console.log(`❌ 请求失败: ${error.message}`);
    }

    // 4. 检查数据库中的实际科目名称
    console.log('\n\n📚 步骤4：检查可能的科目名称差异\n');

    const possibleSubjects = [
      "中药学综合知识与技能",
      "中药学专业知识（一）",
      "中药学专业知识(一)",  // 可能用了半角括号
      "中药学专业知识一",
      "药学专业知识（一）",
    ];

    for (const subject of possibleSubjects) {
      try {
        const url = `${baseUrl}/api/questions?subject=${encodeURIComponent(subject)}&sourceYear=2024&limit=1`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.data && data.data.total > 0) {
          console.log(`✅ "${subject}": ${data.data.total}道`);
        }
      } catch (error) {
        // 忽略错误
      }
    }

    console.log('\n' + '═'.repeat(70));
    console.log('✅ 诊断完成\n');

  } catch (error: any) {
    console.error('❌ 诊断失败:', error.message);
  }
}

diagnoseFrontend();
