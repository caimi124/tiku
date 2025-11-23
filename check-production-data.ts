// 检查生产环境数据
async function checkProductionQuestions() {
  console.log('🔍 检查生产环境2024年中药学综合知识与技能真题数据\n');

  try {
    // 查询生产环境
    const response = await fetch(
      'https://yikaobiguo.com/api/questions?sourceYear=2024&subject=中药学综合知识与技能&limit=200'
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

    console.log(`📊 生产环境总题目数: ${total} 道`);
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
    const sortedTypes = [
      { key: 'single', name: '一、最佳选择题' },
      { key: 'match', name: '二、配伍选择题' },
      { key: 'comprehensive', name: '三、综合分析题' },
      { key: 'multiple', name: '四、多项选择题' },
    ];

    let runningTotal = 0;
    sortedTypes.forEach(({ key, name }) => {
      const count = typeCount[key] || 0;
      const start = runningTotal + 1;
      const end = runningTotal + count;
      runningTotal += count;
      console.log(`   ${name}: ${count} 道 (第${start}-${end}题)`);
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
      console.log(`⚠️  发现 ${duplicates.length} 组重复题目 (共${duplicates.reduce((sum, [_, items]) => sum + items.length, 0)}道):`);
      duplicates.forEach(([content, items], idx) => {
        console.log(`\n   [${idx + 1}] 题目: ${content.substring(0, 50)}...`);
        console.log(`   重复次数: ${items.length}`);
        items.forEach((item: any, i: number) => {
          const type = item.questionType || item.question_type;
          console.log(`   ${i + 1}. ID: ${item.id}, 类型: ${typeNames[type] || type}`);
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
      q.content.includes('保存后告诉我') ||
      q.content === '题目内容'
    );

    if (testData.length > 0) {
      console.log(`⚠️  发现 ${testData.length} 条测试占位数据:`);
      testData.forEach((q: any, idx: number) => {
        console.log(`   ${idx + 1}. ID: ${q.id}, 内容: ${q.content.substring(0, 60)}...`);
      });
      console.log('');
    } else {
      console.log('✅ 没有发现测试占位数据\n');
    }

    // 显示每个题型的第一题
    console.log('📝 各题型示例题目:');
    sortedTypes.forEach(({ key, name }) => {
      const firstQ = questions.find((q: any) => (q.questionType || q.question_type) === key);
      if (firstQ) {
        console.log(`   ${name}:`);
        console.log(`   - ${firstQ.content.substring(0, 50)}...`);
      }
    });

    console.log('\n' + '='.repeat(70));
    console.log(`\n📊 数据分析报告:`);
    console.log(`   ┌─────────────────────────────────────────────────┐`);
    console.log(`   │ 原始数据应有: 120 道题                          │`);
    console.log(`   │ 数据库实际有: ${String(total).padEnd(3)} 道题                          │`);
    console.log(`   │ 缺失题目数量: ${String(120 - total).padEnd(3)} 道题                          │`);
    console.log(`   └─────────────────────────────────────────────────┘`);

    if (total !== 120) {
      console.log(`\n⚠️  问题诊断:`);
      console.log(`   原因1: 数据导入不完整（${120 - total}道题未成功导入）`);
      console.log(`   原因2: 数据清理过度（误删有效题目）`);
      console.log(`   原因3: 原始数据源不完整`);
      
      console.log(`\n💡 解决方案:`);
      console.log(`   1. 找到完整的120道题原始数据源`);
      console.log(`   2. 清空现有2024年数据`);
      console.log(`   3. 重新导入完整120道题`);
      console.log(`   4. 按题型排序: 最佳(1-40)→配伍(41-90)→综合(91-110)→多项(111-120)`);
    }

    console.log('\n✨ 检查完成！\n');

  } catch (error: any) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkProductionQuestions();
