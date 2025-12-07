import * as fs from 'fs';
import * as path from 'path';

async function checkFailedQuestions() {
  console.log('检查2022年导入失败的题目...\n');
  
  const jsonPath = path.join(process.cwd(), 'shuju', '2022年执业药师中药师药学专业知识（二）.json');
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const questions = JSON.parse(jsonContent);
  
  console.log(`JSON文件总题数: ${questions.length}`);
  console.log('数据库成功导入: 112题');
  console.log('失败题数: 8题\n');
  
  // 检查可能的问题题目
  console.log('检查可能的问题题目:');
  
  questions.forEach((q: any, index: number) => {
    // 检查选项数量异常
    if (!q.options || q.options.length < 4) {
      console.log(`❌ 题${q.number}: 选项数量异常 (${q.options ? q.options.length : 0}个)`);
    }
    
    // 检查题目内容异常
    if (!q.question || q.question.trim().length < 5) {
      console.log(`❌ 题${q.number}: 题目内容异常`);
    }
    
    // 检查答案异常
    if (!q.answer || q.answer.trim().length === 0) {
      console.log(`❌ 题${q.number}: 答案缺失`);
    }
    
    // 检查解析异常
    if (!q.analysis || q.analysis.trim().length === 0) {
      console.log(`❌ 题${q.number}: 解析缺失`);
    }
  });
  
  // 检查特定题目
  console.log('\n检查前10题详情:');
  questions.slice(0, 10).forEach((q: any) => {
    console.log(`题${q.number}: ${q.question.substring(0, 30)}... | 选项数: ${q.options?.length || 0} | 答案: ${q.answer}`);
  });
}

checkFailedQuestions().catch(console.error);
