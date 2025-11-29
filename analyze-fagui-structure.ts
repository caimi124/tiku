import * as fs from 'fs';

// 读取JSON文件
const jsonPath = 'E:\\tiku\\shuju\\2024年执业药师法规历年真题.json';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log('🔍 分析法规真题结构\n');

// 统计选项数量分布
const optionCounts: Record<number, number[]> = {};
data.forEach((q: any) => {
  const count = q.options?.length || 0;
  if (!optionCounts[count]) {
    optionCounts[count] = [];
  }
  optionCounts[count].push(q.number);
});

console.log('📊 选项数量分布:');
Object.keys(optionCounts).sort((a, b) => Number(a) - Number(b)).forEach(count => {
  const questions = optionCounts[Number(count)];
  console.log(`${count}个选项: ${questions.length}道题 (题号: ${questions.slice(0, 10).join(', ')}${questions.length > 10 ? '...' : ''})`);
});

// 检查8选项的题目
console.log('\n🔍 8个选项的题目详情:');
const eightOptions = data.filter((q: any) => q.options?.length === 8);
eightOptions.forEach((q: any) => {
  console.log(`\n题${q.number}:`);
  console.log(`问题: ${q.question.substring(0, 50)}...`);
  console.log(`选项: ${q.options.map((o: string, i: number) => `${i + 1}.${o.substring(0, 20)}`).join(', ')}`);
  console.log(`答案: ${q.answer}`);
});

// 分析可能的配伍题组
console.log('\n\n🔍 可能的配伍题组分析:');
let currentGroup: any[] = [];
let lastOptions: string[] = [];

data.forEach((q: any, index: number) => {
  if (q.options && q.options.length === 4) {
    const firstOption = q.options[0];
    
    // 检查是否与上一题选项相同或相似
    if (lastOptions.length > 0) {
      const similarity = q.options.filter((opt: string) => lastOptions.includes(opt)).length;
      
      if (similarity >= 3) {
        // 选项相似，属于同一组
        if (currentGroup.length === 0) {
          currentGroup.push(data[index - 1]);
        }
        currentGroup.push(q);
      } else {
        // 选项不同，新的一组
        if (currentGroup.length >= 2) {
          console.log(`\n配伍题组 (题${currentGroup[0].number}-${currentGroup[currentGroup.length - 1].number}):`);
          console.log(`  题数: ${currentGroup.length}`);
          console.log(`  共用选项: ${currentGroup[0].options.join(', ')}`);
          currentGroup.forEach(gq => {
            console.log(`  题${gq.number}: ${gq.question.substring(0, 40)}... → ${gq.answer}`);
          });
        }
        currentGroup = [];
      }
    }
    
    lastOptions = q.options;
  } else {
    // 非4选项题目，重置
    if (currentGroup.length >= 2) {
      console.log(`\n配伍题组 (题${currentGroup[0].number}-${currentGroup[currentGroup.length - 1].number}):`);
      console.log(`  题数: ${currentGroup.length}`);
      console.log(`  共用选项: ${currentGroup[0].options.join(', ')}`);
      currentGroup.forEach(gq => {
        console.log(`  题${gq.number}: ${gq.question.substring(0, 40)}... → ${gq.answer}`);
      });
    }
    currentGroup = [];
    lastOptions = [];
  }
});
