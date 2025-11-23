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

console.log('🔍 分析配伍选择题的选项分组\n');
console.log('='.repeat(80) + '\n');

// 配伍选择题是41-90题
console.log('📋 配伍选择题组（41-90题）:\n');

// 找出有选项的题目
const withOptions = rawData.filter(q => q.number >= 41 && q.number <= 90 && q.options.length > 0);
const withoutOptions = rawData.filter(q => q.number >= 41 && q.number <= 90 && q.options.length === 0);

console.log(`有选项的题目数: ${withOptions.length}`);
console.log(`无选项的题目数: ${withoutOptions.length}\n`);

console.log('有选项的题目:\n');
withOptions.forEach(q => {
  console.log(`题${q.number}: ${q.question}`);
  console.log(`  选项[0]: ${q.options[0]}`);
  console.log(`  选项数量: ${q.options.length}`);
  console.log('');
});

console.log('='.repeat(80) + '\n');

// 分析第42-48题（应该是2-3组配伍题）
console.log('📋 详细分析第42-48题:\n');

const group1 = [42, 43]; // 散剂组
const group2 = [44, 45]; // 药材产地组  
const group3 = [46, 47, 48]; // 化合物酸性组

console.log('🔹 组1（第42-43题）- 散剂粒度:\n');
[42, 43].forEach(num => {
  const q = rawData.find(q => q.number === num);
  if (q) {
    console.log(`题${num}: ${q.question}`);
    console.log(`  答案: ${q.answer}`);
    console.log(`  选项: ${q.options.length > 0 ? q.options[0] : '无'}`);
    console.log(`  解析片段: ${q.analysis.substring(0, 80)}`);
    console.log('');
  }
});

console.log('🔹 组2（第44-45题）- 药材产地:\n');
[44, 45].forEach(num => {
  const q = rawData.find(q => q.number === num);
  if (q) {
    console.log(`题${num}: ${q.question}`);
    console.log(`  答案: ${q.answer}`);
    console.log(`  选项:`, q.options.length > 0 ? q.options : '无');
    console.log(`  解析片段: ${q.analysis.substring(0, 120)}`);
    console.log('');
  }
});

console.log('🔹 组3（第46-47-48题）- 化合物酸性:\n');
[46, 47, 48].forEach(num => {
  const q = rawData.find(q => q.number === num);
  if (q) {
    console.log(`题${num}: ${q.question}`);
    console.log(`  答案: ${q.answer}`);
    console.log(`  选项:`, q.options.length > 0 ? q.options : '无');
    console.log(`  解析片段: ${q.analysis.substring(0, 100)}`);
    console.log('');
  }
});

console.log('='.repeat(80) + '\n');

console.log('💡 分析结论:\n');
console.log('1. 第43题有"红景天"等药材选项 → 应该是44-45题的共享选项');
console.log('2. 第45题有"羟基黄酮"选项 → 应该是46-47题的共享选项');
console.log('3. 第47题有"增稠剂"选项 → 可能是48题或其他题的选项');
console.log('\n结论：选项被错位了！需要重新分配。');
