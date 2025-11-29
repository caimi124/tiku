// 模拟前端API调用测试
async function testApiCall() {
  console.log('测试2022年API调用...\n');

  const baseUrl = 'http://localhost:3003';
  const year = 2022;
  const subject = '中药学专业知识（二）';
  
  // 1. 测试历年真题列表页面的API调用（检查数据是否存在）
  console.log('=== 测试1: 历年真题列表API调用 ===');
  const listApiUrl = `${baseUrl}/api/questions?sourceYear=${year}&subject=${encodeURIComponent(subject)}&limit=1`;
  console.log(`请求URL: ${listApiUrl}`);
  
  try {
    const response = await fetch(listApiUrl);
    const data = await response.json();
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('API调用失败:', error);
  }

  // 2. 测试练习页面的API调用（获取实际题目）
  console.log('\n=== 测试2: 练习页面API调用 ===');
  const practiceApiUrl = `${baseUrl}/api/questions?sourceYear=${year}&subject=${encodeURIComponent(subject)}&limit=200`;
  console.log(`请求URL: ${practiceApiUrl}`);
  
  try {
    const response = await fetch(practiceApiUrl);
    const data = await response.json();
    console.log('响应状态:', response.status);
    console.log('题目数量:', data.success ? data.data.questions.length : 0);
    console.log('总数:', data.success ? data.data.total : 0);
    
    if (data.success && data.data.questions.length > 0) {
      console.log('第一题示例:', {
        content: data.data.questions[0].content.substring(0, 50) + '...',
        subject: data.data.questions[0].subject,
        sourceYear: data.data.questions[0].sourceYear,
        questionType: data.data.questions[0].questionType
      });
    }
  } catch (error) {
    console.error('API调用失败:', error);
  }

  // 3. 检查URL编码问题
  console.log('\n=== 测试3: URL编码检查 ===');
  const originalSubject = '中药学专业知识（二）';
  const encodedSubject = encodeURIComponent(originalSubject);
  const urlEncodedSubject = '%E4%B8%AD%E8%8D%AF%E5%AD%A6%E4%B8%93%E4%B8%9A%E7%9F%A5%E8%AF%86%EF%BC%88%E4%BA%8C%EF%BC%89';
  
  console.log('原始科目:', originalSubject);
  console.log('JS编码结果:', encodedSubject);
  console.log('URL中的编码:', urlEncodedSubject);
  console.log('编码匹配:', encodedSubject === urlEncodedSubject ? '✅' : '❌');
  console.log('解码测试:', decodeURIComponent(urlEncodedSubject));
}

// 如果是在Node.js环境中运行，需要polyfill fetch
if (typeof fetch === 'undefined') {
  console.log('需要启动开发服务器来测试API调用');
  console.log('请运行: npm run dev');
  console.log('然后在浏览器控制台中运行此测试');
} else {
  testApiCall().catch(console.error);
}
