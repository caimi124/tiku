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

console.log('🔧 修复配伍选择题的选项错位问题\n');
console.log('='.repeat(80) + '\n');

// 正确的选项映射关系
const correctOptionsMapping = {
  // 第42-43题：散剂粒度（需要找到正确的选项）
  '42-43': {
    options: ['A. 细粉', 'B. 最细粉', 'C. 稀粉', 'D. 极细粉', 'E. 中粉'],
    reason: '根据第43题解析：内服散剂应为细粉；眼用散剂应为极细粉；儿科及局部用散剂应为最细粉'
  },
  
  // 第44-45题：药材产地（选项在第43题）
  '44-45': {
    currentLocation: 43,
    correctOptions: ['A. 红景天', 'B. 附子', 'C. 蛤蟆油', 'D. 太子参', 'E. 酸枣仁'],
    reason: '第45题解析提到：红景天主产于青藏高原，酸枣仁主产于河北陕西'
  },
  
  // 第46-47题：化合物酸性（选项在第45题）
  '46-47': {
    currentLocation: 45,
    correctOptions: ['A. 3\' -羟基黄酮', 'B. 4\' -羟基黄酮', 'C. 5\' -羟基黄酮', 'D. 7\' -羟基黄酮', 'E. 7, 4\' -二羟基黄酮'],
    reason: '第47题解析提到：黄酮类化合物的酸性强弱'
  },
  
  // 第48-50题：明胶胶囊辅料（选项在第47题）
  '48-50': {
    currentLocation: 47,
    correctOptions: ['A. 增稠剂', 'B. 增塑剂', 'C. 芳香矫味剂', 'D. 遮光剂', 'E. 防腐剂'],
    reason: '第48题解析应该提到甘油可作为增塑剂'
  }
};

console.log('📋 选项错位分析:\n');
console.log('1. 第43题（儿科散剂）有"红景天"等药材选项 → 应该属于第44-45题');
console.log('2. 第45题（药材产地）有"羟基黄酮"选项 → 应该属于第46-47题');
console.log('3. 第47题（化合物酸性）有"增稠剂"等选项 → 应该属于第48-50题');
console.log('4. 第42-43题（散剂粒度）缺失选项 → 需要推断\n');

console.log('='.repeat(80) + '\n');
console.log('🔧 开始修复...\n');

// 获取错位的选项
const q43Options = rawData.find(q => q.number === 43)?.options || [];
const q45Options = rawData.find(q => q.number === 45)?.options || [];
const q47Options = rawData.find(q => q.number === 47)?.options || [];

console.log('获取到的错位选项:');
console.log(`  第43题选项 (应该给44-45):`, q43Options);
console.log(`  第45题选项 (应该给46-47):`, q45Options);
console.log(`  第47题选项 (应该给48-50):`, q47Options);
console.log('');

// 根据解析推断第42-43题的正确选项
const scatterOptions = ['A. 细粉', 'B. 最细粉', 'C. 稀粉', 'D. 极细粉', 'E. 中粉'];

// 创建修复后的数据
const fixedData = rawData.map(q => {
  if (q.number === 42 || q.number === 43) {
    // 散剂粒度组
    return { ...q, options: scatterOptions };
  } else if (q.number === 44 || q.number === 45) {
    // 药材产地组（使用第43题的选项）
    return { ...q, options: q43Options };
  } else if (q.number === 46 || q.number === 47) {
    // 化合物酸性组（使用第45题的选项）
    return { ...q, options: q45Options };
  } else if (q.number === 48 || q.number === 49 || q.number === 50) {
    // 明胶胶囊辅料组（使用第47题的选项）
    return { ...q, options: q47Options };
  }
  return q;
});

console.log('✅ 修复完成！\n');
console.log('验证修复结果:\n');

[42, 43, 44, 45, 46, 47, 48, 49, 50].forEach(num => {
  const original = rawData.find(q => q.number === num);
  const fixed = fixedData.find(q => q.number === num);
  
  if (original && fixed) {
    console.log(`题${num}: ${fixed.question}`);
    console.log(`  原选项数: ${original.options.length}`);
    console.log(`  新选项数: ${fixed.options.length}`);
    if (fixed.options.length > 0) {
      console.log(`  新选项[0]: ${fixed.options[0]}`);
    }
    console.log(`  答案: ${fixed.answer}`);
    console.log('');
  }
});

// 保存修复后的文件
const backupPath = './shuju/2024年执业药师中药药一历年真题/2024年中药药一历年真题.json.backup';
const outputPath = './shuju/2024年执业药师中药药一历年真题/2024年中药药一历年真题.json';

// 备份原文件
fs.copyFileSync(outputPath, backupPath);
console.log(`✅ 已备份原文件到: ${backupPath}\n`);

// 保存修复后的文件
fs.writeFileSync(outputPath, JSON.stringify(fixedData, null, 2), 'utf-8');
console.log(`✅ 已保存修复后的文件到: ${outputPath}\n`);

console.log('='.repeat(80));
console.log('\n🎉 修复完成！修复了以下问题：');
console.log('  ✅ 第42-43题：添加了散剂粒度选项');
console.log('  ✅ 第44-45题：修正为药材名称选项');
console.log('  ✅ 第46-47题：修正为化合物选项');
console.log('  ✅ 第48-50题：修正为胶囊辅料选项\n');
