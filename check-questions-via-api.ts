// 通过API检查题目数据
async function checkQuestions() {
  console.log('🔍 通过API检查2024年中药学综合知识与技能真题数据\n');

  try {
    // 查询所有题目
    const response = await fetch(
      'http://localhost:3000/api/questions?sourceYear=2024&subject=中药学综合知识与技能&limit=200'
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || '查询失败');
    }

    const questions = data.data.questions;
    const total = data.data.total;

    console.log(`📊 API返回总题目数: ${total} 道`);
    console.log(`📊 实际获取题目数: ${questions.length} 道\n`);

    // 按题型统计
    const typeCount: Record<string, number> = {};
    const typeNames: Record<string, string> = {
      single: '最佳选择题',
      match: '配伍选择题',
      comprehensive: '综合分析题',
      multiple: '多项选择题',
    };

    questions.forEach((q: any) => {
      const type = q.questionType || q.question_type;
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    console.log('📋 按题型分类统计:');
    Object.entries(typeCount).forEach(([type, count]) => {
      const typeName = typeNames[type] || type;
      console.log(`   ${typeName} (${type}): ${count} 道`);
    });
    console.log('');

    // 检查重复
    const contentMap = new Map<string, any[]>();
    questions.forEach((q: any) => {
      const content = q.content.trim();
      if (!contentMap.has(content)) {
        contentMap.set(content, []);
      }
      contentMap.get(content)!.push(q);
    });

    const duplicates = Array.from(contentMap.entries()).filter(([_, items]) => items.length > 1);
    
    if (duplicates.length > 0) {
      console.log(`⚠️  发现 ${duplicates.length} 组重复题目:`);
      duplicates.forEach(([content, items], idx) => {
        console.log(`\n   [${idx + 1}] 题目: ${content.substring(0, 50)}...`);
        console.log(`   重复次数: ${items.length}`);
        items.forEach((item: any) => {
          console.log(`   - ID: ${item.id}, 类型: ${item.questionType || item.question_type}`);
        });
      });
      console.log('');
    } else {
      console.log('✅ 没有发现重复题目\n');
    }

    // 检查测试数据
    const testData = questions.filter((q: any) => 
      q.content.includes('请将您的完整题目') ||
      q.content.includes('保持原始格式') ||
      q.content.includes('题目内容') ||
      q.content === '题目内容'
    );

    if (testData.length > 0) {
      console.log(`⚠️  发现 ${testData.length} 条测试占位数据:`);
      testData.forEach((q: any) => {
        console.log(`   - ID: ${q.id}, 内容: ${q.content.substring(0, 60)}...`);
      });
      console.log('');
    } else {
      console.log('✅ 没有发现测试占位数据\n');
    }

    // 显示前10题
    console.log('📝 前10道题:');
    questions.slice(0, 10).forEach((q: any, idx: number) => {
      const type = q.questionType || q.question_type;
      const typeName = typeNames[type] || type;
      console.log(`   ${idx + 1}. [${typeName}] ${q.content.substring(0, 40)}...`);
    });

    console.log('\n' + '='.repeat(60));
    console.log(`\n💡 数据分析结论:`);
    console.log(`   原始数据应有: 120 道题`);
    console.log(`   数据库实际: ${total} 道题`);
    console.log(`   缺失题目: ${120 - total} 道\n`);

    if (total < 120) {
      console.log(`⚠️  建议操作:`);
      console.log(`   1. 检查原始数据源文件是否完整`);
      console.log(`   2. 重新导入完整的120道题目`);
      console.log(`   3. 确认是否有题目导入失败\n`);
    }

  } catch (error: any) {
    console.error('❌ 检查失败:', error.message);
    console.log('\n💡 请确保:');
    console.log('   1. Next.js开发服务器正在运行 (npm run dev)');
    console.log('   2. API路由 /api/questions 可以访问');
  }
}

checkQuestions();
