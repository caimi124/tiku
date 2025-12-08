// 测试生产环境 API
const https = require('https');

const url = 'https://yikaobiguo.com/api/knowledge/structure?subject=xiyao_yaoxue_er';

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('API 响应成功:', json.success);
      
      if (json.data) {
        console.log('\n统计信息:');
        console.log('  total_chapters:', json.data.stats?.total_chapters);
        console.log('  total_sections:', json.data.stats?.total_sections);
        console.log('  total_points:', json.data.stats?.total_points);
        
        console.log('\n章节数量:', json.data.structure?.length || 0);
        
        if (json.data.structure && json.data.structure.length > 0) {
          console.log('\n前5个章节:');
          json.data.structure.slice(0, 5).forEach(ch => {
            console.log(`  ${ch.code}: ${ch.title} (${ch.point_count}个考点, ${ch.sections?.length || 0}个小节)`);
          });
        }
      }
    } catch (e) {
      console.error('解析错误:', e.message);
      console.log('原始响应:', data.substring(0, 500));
    }
  });
}).on('error', (e) => {
  console.error('请求错误:', e.message);
});
