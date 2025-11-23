// 检查生产环境API
async function checkProductionAPI() {
  console.log('🔍 检查生产环境API\n');
  console.log('═'.repeat(60));

  const baseUrl = 'https://yikaobiguo.com';
  
  try {
    // 测试各个年份和科目的数据
    const subjects = [
      "中药学综合知识与技能",
      "中药学专业知识（一）",
      "药学专业知识（一）"
    ];
    const years = [2024, 2023, 2022];

    console.log('\n📊 API响应测试:\n');

    for (const year of years) {
      console.log(`\n${year}年:`);
      
      for (const subject of subjects) {
        try {
          const url = `${baseUrl}/api/questions?sourceYear=${year}&subject=${encodeURIComponent(subject)}&limit=1`;
          console.log(`   测试: ${subject}`);
          console.log(`   URL: ${url}`);
          
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.success && data.data.total > 0) {
            console.log(`   ✅ 找到 ${data.data.total} 道题`);
          } else {
            console.log(`   ❌ 未找到数据 (success: ${data.success})`);
            if (data.error) {
              console.log(`   错误: ${data.error}`);
            }
          }
        } catch (error: any) {
          console.log(`   ❌ API调用失败: ${error.message}`);
        }
        console.log('');
      }
    }

    // 测试不带科目的查询
    console.log('\n📋 测试不带科目筛选的查询:\n');
    for (const year of years) {
      try {
        const url = `${baseUrl}/api/questions?sourceYear=${year}&limit=1`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success && data.data.total > 0) {
          console.log(`${year}年: ✅ 找到 ${data.data.total} 道题`);
        } else {
          console.log(`${year}年: ❌ 未找到数据`);
        }
      } catch (error: any) {
        console.log(`${year}年: ❌ API调用失败: ${error.message}`);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ 检查完成\n');

  } catch (error: any) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkProductionAPI();
