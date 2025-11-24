import * as fs from 'fs';
import * as path from 'path';

// 读取JSON源数据
const jsonPath = 'E:\\tiku\\shuju\\2022年执业药师中药师药一历年真题图片\\2022年执业药师中药师药一历年真题.json';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('🔍 调试图片题导入逻辑...\n');

// 图片目录
const imageDir = 'E:\\tiku\\shuju\\2022年执业药师中药师药一历年真题图片';

// 检查图片文件是否存在的函数
function checkImageExists(dir: string, filename: string): boolean {
  const fullPath = path.join(dir, filename);
  return fs.existsSync(fullPath);
}

// 应该是图片题的题号
const imageQuestionNumbers = [37, 38, 39, 40, 78, 79, 97, 98, 99, 100];

imageQuestionNumbers.forEach(num => {
  const q = data.find((item: any) => item.number === num);
  if (!q) {
    console.log(`❌ 题${num}在JSON中不存在`);
    return;
  }

  console.log(`\n🔍 题${num}:`);
  console.log(`  问题: ${q.question.substring(0, 50)}...`);
  console.log(`  source: ${q.source}`);
  
  // 检查是否有图片标记
  const hasImageMark = q.question.includes('图示') || 
                      q.question.includes('[图示]') || 
                      q.source === 'image' ||
                      // 化学结构题：包含"化合物"且在78-79范围
                      (q.question.includes('化合物') && (q.number === 78 || q.number === 79));
  
  console.log(`  图片标记检测: ${hasImageMark ? '✅' : '❌'}`);
  
  if (hasImageMark) {
    const options = ['A', 'B', 'C', 'D', 'E'];
    
    // 根据题号确定文件名前缀
    let prefix = '';
    if ([37, 38, 39, 40].includes(q.number)) {
      prefix = `${q.number}_`;
    } else if ([78, 79].includes(q.number)) {
      prefix = '78_79_';
    } else if ([97, 98].includes(q.number)) {
      prefix = '97_98_';
    } else if ([99, 100].includes(q.number)) {
      prefix = '99_100_';
    }
    
    console.log(`  文件名前缀: ${prefix}`);
    
    const existingImages: string[] = [];
    
    // 为每个选项查找图片文件
    for (const option of options) {
      const possibleNames = [
        `${prefix}${option}.jpg`,
        `${prefix}${option}.png`,
        `${prefix}${option} .jpg`, // 有空格
        `${prefix}${option} .png`,
        `${q.number}-${option}.jpg`, // 横线格式（题37特殊情况）
        `${q.number}-${option}.png`,
        `${q.number}_${option}.jpg`, // 下划线格式（题37-40通用）
        `${q.number}_${option}.png`,
        `${q.number}_${option} .jpg`, // 下划线+空格
        `${q.number}_${option} .png`,
      ];
      
      console.log(`    选项${option}候选文件名:`, possibleNames);
      
      // 找到第一个存在的文件即停止
      let found = false;
      for (const imgName of possibleNames) {
        if (checkImageExists(imageDir, imgName)) {
          existingImages.push(`/shuju/2022年执业药师中药师药一历年真题图片/${imgName}`);
          console.log(`    ✅ 找到: ${imgName}`);
          found = true;
          break;
        }
      }
      
      if (!found) {
        console.log(`    ❌ 选项${option}未找到图片文件`);
      }
    }
    
    console.log(`  总共找到图片: ${existingImages.length}张`);
    if (existingImages.length > 0) {
      console.log(`  图片路径:`, existingImages);
    }
  }
});

// 检查实际存在的图片文件
console.log('\n📁 实际存在的图片文件:');
const imageFiles = fs.readdirSync(imageDir).filter(file => 
  file.toLowerCase().endsWith('.jpg') || 
  file.toLowerCase().endsWith('.jpeg') || 
  file.toLowerCase().endsWith('.png')
);

imageFiles.forEach(file => {
  console.log(`  - ${file}`);
});
