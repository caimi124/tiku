// 测试前端修复效果
console.log('测试前端修复效果...\n');

// 模拟前端API调用
async function testFrontendFix() {
  const baseUrl = 'http://localhost:3003';
  const year = 2022;
  const subject = '中药学专业知识（二）';
  
  try {
    console.log('=== 测试API调用 ===');
    const url = `${baseUrl}/api/questions?sourceYear=${year}&subject=${encodeURIComponent(subject)}&limit=10`;
    console.log(`请求URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`响应状态: ${response.status}`);
    console.log(`成功: ${data.success}`);
    
    if (data.success) {
      console.log(`题目总数: ${data.data.total}`);
      console.log(`返回题目数: ${data.data.questions.length}`);
      
      if (data.data.questions.length > 0) {
        console.log('\n=== 题目数据检查 ===');
        
        // 检查前3题的关键字段
        data.data.questions.slice(0, 3).forEach((q, idx) => {
          console.log(`题${idx + 1}:`);
          console.log(`  内容: ${q.content.substring(0, 50)}...`);
          console.log(`  科目: ${q.subject}`);
          console.log(`  年份: ${q.sourceYear}`);
          console.log(`  题型: ${q.questionType}`);
          console.log(`  章节: ${q.chapter}`);
          console.log(`  选项数: ${q.options.length}`);
          console.log('');
        });
        
        // 按章节统计
        console.log('=== 章节统计 ===');
        const chapterStats = {};
        data.data.questions.forEach(q => {
          const chapter = q.chapter;
          chapterStats[chapter] = (chapterStats[chapter] || 0) + 1;
        });
        
        Object.entries(chapterStats).forEach(([chapter, count]) => {
          console.log(`${chapter}: ${count} 题`);
        });
        
        console.log('\n✅ 数据结构正确，前端应该能正常显示了！');
        console.log(`\n🌐 请访问: ${baseUrl}/practice/history/${year}?subject=${encodeURIComponent(subject)}`);
        
      } else {
        console.log('❌ 没有找到题目数据');
      }
    } else {
      console.log(`❌ API调用失败: ${data.error}`);
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 检查是否在浏览器环境
if (typeof window !== 'undefined') {
  testFrontendFix();
} else {
  console.log('请在浏览器控制台中运行此测试，或启动开发服务器后访问页面');
}
