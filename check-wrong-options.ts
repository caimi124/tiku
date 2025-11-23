import * as fs from 'fs';

interface Question {
  number: number;
  question: string;
  options: string[];
  answer: string;
  analysis: string;
}

const jsonPath = './shuju/2024年执业药师中药药一历年真题/2024年中药药一历年真题.json';
const rawData: Question[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log('🔍 详细检查问题题目\n');
console.log('='.repeat(80) + '\n');

// 检查第44-46题（配伍选择题）
console.log('📋 第44-46题（配伍选择题组）:\n');
const q44_46 = rawData.filter(q => q.number >= 44 && q.number <= 46);
q44_46.forEach(q => {
  console.log(`题${q.number}: ${q.question}`);
  console.log(`选项:`, q.options);
  console.log(`答案: ${q.answer}`);
  console.log(`解析: ${q.analysis.substring(0, 120)}...`);
  console.log('');
});

console.log('='.repeat(80) + '\n');

// 检查有问题的题目
console.log('❌ 问题题目详情:\n');
[11, 45, 58, 120].forEach(num => {
  const q = rawData.find(q => q.number === num);
  if (q) {
    console.log(`\n题${num}: ${q.question}`);
    console.log(`选项:`);
    q.options.forEach(opt => console.log(`  ${opt}`));
    console.log(`答案: ${q.answer}`);
    console.log(`解析: ${q.analysis}`);
    console.log('-'.repeat(80));
  }
});

// 查找可能有"羟基黄酮"选项的其他题目
console.log('\n\n🔍 查找包含"羟基黄酮"的所有题目:\n');
rawData.forEach(q => {
  const hasHuangTong = q.options.some(opt => opt.includes('羟基黄酮'));
  if (hasHuangTong) {
    console.log(`题${q.number}: ${q.question}`);
    console.log(`  这道题的选项包含"羟基黄酮"`);
  }
});

// 查找可能有药材名称选项的化学题
console.log('\n\n🔍 查找化学结构题但选项有药材名的:\n');
rawData.forEach(q => {
  const isChemQuestion = q.question.includes('结构') || q.question.includes('化合物');
  const medicineNames = ['红景天', '附子', '蛤蟆油', '太子参', '酸枣仁', '当归', '黄芪', '白芍', '丹参'];
  const hasMedicineName = q.options.some(opt => medicineNames.some(med => opt.includes(med)));
  
  if (isChemQuestion && hasMedicineName) {
    console.log(`题${q.number}: ${q.question}`);
    console.log(`  选项:`, q.options);
  }
});
