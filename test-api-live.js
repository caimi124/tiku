// 测试生产环境API
async function testAPI() {
  const urls = [
    'https://yikaobiguo.com/api/questions?sourceYear=2024&subject=中药学综合知识与技能&limit=1',
    'https://yikaobiguo.com/api/questions?sourceYear=2024&limit=5',
  ];

  for (const url of urls) {
    console.log(`\n🔍 测试: ${url}`);
    console.log('='.repeat(80));
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('状态码:', response.status);
      console.log('响应数据:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log(`✅ 成功！找到 ${data.data.total} 道题`);
        if (data.data.questions && data.data.questions.length > 0) {
          console.log(`\n第一题预览:`);
          const q = data.data.questions[0];
          console.log(`ID: ${q.id}`);
          console.log(`内容: ${q.content?.substring(0, 50)}...`);
        }
      } else {
        console.log('❌ API返回失败');
      }
    } catch (error) {
      console.error('❌ 请求失败:', error.message);
    }
  }
}

testAPI();
