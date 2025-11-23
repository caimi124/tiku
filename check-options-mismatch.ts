import * as fs from 'fs';
import * as path from 'path';

interface Question {
  number: number;
  question: string;
  options: string[];
  answer: string;
  analysis: string;
}

const jsonPath = './shuju/2024年执业药师中药药一历年真题/2024年中药药一历年真题.json';
const rawData: Question[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log('🔍 检查选项与题目/答案解析是否匹配\n');
console.log('='.repeat(80) + '\n');

let mismatchCount = 0;
const mismatches: any[] = [];

rawData.forEach(q => {
  const issues: string[] = [];
  
  // 检查选项内容是否与题目相关
  const questionLower = q.question.toLowerCase();
  const optionsText = q.options.join(' ').toLowerCase();
  const analysisLower = q.analysis.toLowerCase();
  
  // 1. 检查选项是否包含"羟基黄酮"但题目不相关
  if (optionsText.includes('羟基黄酮') && !questionLower.includes('黄酮') && !questionLower.includes('化合物')) {
    issues.push('选项含黄酮类化合物，但题目不是化学结构题');
  }
  
  // 2. 检查选项是否包含药材名但题目是化学题
  const medicineKeywords = ['红景天', '附子', '蛤蟆油', '太子参', '酸枣仁', '当归', '黄芪'];
  const hasMedicineName = medicineKeywords.some(med => optionsText.includes(med));
  if ((questionLower.includes('结构') || questionLower.includes('化合物')) && hasMedicineName) {
    issues.push('题目是化学结构题，但选项包含药材名称');
  }
  
  // 3. 检查答案解析是否提到选项中的内容
  const optionKeywords = q.options.map(opt => {
    const match = opt.match(/[A-E]\.\s*(.+)/);
    return match ? match[1].trim() : opt.trim();
  });
  
  let analysisMatchCount = 0;
  optionKeywords.forEach(keyword => {
    if (keyword.length > 2 && analysisLower.includes(keyword.toLowerCase())) {
      analysisMatchCount++;
    }
  });
  
  // 如果解析中提到的选项内容很少，可能有问题
  if (optionKeywords.length > 0 && analysisMatchCount === 0 && q.analysis !== '同上。') {
    // 检查解析中提到了哪些药材或化合物
    const analysisWords = medicineKeywords.filter(med => analysisLower.includes(med));
    if (analysisWords.length > 0) {
      issues.push(`解析提到${analysisWords.join('、')}，但选项中没有`);
    }
  }
  
  if (issues.length > 0) {
    mismatchCount++;
    mismatches.push({
      number: q.number,
      question: q.question,
      options: q.options,
      answer: q.answer,
      analysis: q.analysis.substring(0, 100),
      issues
    });
    
    console.log(`❌ 题${q.number}: ${q.question}`);
    console.log(`   答案: ${q.answer}`);
    console.log(`   选项:`, q.options.slice(0, 3).join(', '));
    console.log(`   问题: ${issues.join('; ')}`);
    console.log(`   解析片段: ${q.analysis.substring(0, 80)}...`);
    console.log('');
  }
});

console.log('='.repeat(80));
console.log(`\n📊 检查结果: 发现 ${mismatchCount} 道题目存在选项不匹配问题\n`);

if (mismatches.length > 0) {
  console.log('📋 问题清单:\n');
  mismatches.forEach(m => {
    console.log(`题${m.number}: ${m.issues.join('; ')}`);
  });
}
