import * as fs from 'fs';

// 读取JSON源数据
const jsonPath = 'E:\\tiku\\shuju\\2022年执业药师中药师药一历年真题图片\\2022年执业药师中药师药一历年真题.json';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('🔍 调试题41-43的JSON源数据和处理逻辑...\n');

// 检查题41-43的源数据
[41, 42, 43].forEach(num => {
  const q = data.find((item: any) => item.number === num);
  console.log(`题${num}:`);
  console.log(`  问题: ${q.question.substring(0, 50)}...`);
  console.log(`  选项数量: ${q.options?.length || 0}`);
  console.log(`  选项内容:`, q.options);
  console.log(`  答案: ${q.answer}`);
  console.log('');
});

// 模拟getSmartOptions逻辑
function simulateGetSmartOptions(currentQuestion: any, allQuestions: any[], currentIndex: number): string[] {
  const { number, options, question } = currentQuestion;
  
  console.log(`\n🔧 模拟题${number}的选项处理逻辑:`);
  
  // 检查是否是图示题
  const isImageQuestion = question.includes('图示') || question.includes('[图示]') || question.includes('图中');
  if (isImageQuestion) {
    console.log(`  → 图示题，生成A-E空选项`);
    return ['A.', 'B.', 'C.', 'D.', 'E.'];
  }
  
  // 配伍题处理
  if (number >= 41 && number <= 90) {
    console.log(`  → 配伍题范围`);
    
    // 检查自带选项
    if (options && options.length >= 4) {
      console.log(`  → 有${options.length}个选项`);
      const firstOption = options[0];
      console.log(`  → 第一个选项: ${firstOption}`);
      
      // 黑名单检查
      const invalidKeywords = [
        '聚乙烯醇', '亚硫酸钠', '苯乙醇', '葡萄糖', '卵磷脂',
        '散剂', '颗粒剂', '蜜丸', '舌下片', '口服液',
        '乳膏剂', '凝胶剂', '喷雾剂', '贴膏剂', '栓剂'
      ];
      
      const isInvalid = invalidKeywords.some(keyword => firstOption.includes(keyword));
      console.log(`  → 黑名单检查: ${isInvalid ? '❌ 无效' : '✅ 有效'}`);
      
      if (!isInvalid) {
        // 补全A选项
        if (options.length === 4 && options[0].startsWith('B.')) {
          const bOptionContent = options[0].substring(3);
          const completeOptions = [
            'A. ' + bOptionContent,
            ...options
          ];
          console.log(`  → 补全A选项: A. ${bOptionContent}`);
          return completeOptions;
        } else if (options.length === 5) {
          console.log(`  → 使用完整的5个选项`);
          return options;
        }
      }
    } else {
      console.log(`  → 选项不足4个或为空`);
    }
    
    // 向前查找
    console.log(`  → 开始向前查找...`);
    for (let i = currentIndex - 1; i >= 0 && i >= currentIndex - 10; i--) {
      const prevQ = allQuestions[i];
      if (prevQ.number >= 41 && prevQ.number <= 90) {
        console.log(`    → 检查题${prevQ.number}`);
        if (prevQ.options && prevQ.options.length >= 4) {
          const firstOption = prevQ.options[0];
          console.log(`    → 题${prevQ.number}有${prevQ.options.length}个选项，第一个: ${firstOption}`);
          
          const invalidKeywords = [
            '聚乙烯醇', '亚硫酸钠', '苯乙醇', '葡萄糖', '卵磷脂',
            '散剂', '颗粒剂', '蜜丸', '舌下片', '口服液',
            '乳膏剂', '凝胶剂', '喷雾剂', '贴膏剂', '栓剂'
          ];
          
          const isInvalid = invalidKeywords.some(keyword => firstOption.includes(keyword));
          console.log(`    → 黑名单检查: ${isInvalid ? '❌ 无效' : '✅ 有效'}`);
          
          if (!isInvalid) {
            if (prevQ.options.length === 4 && prevQ.options[0].startsWith('B.')) {
              const bOptionContent = prevQ.options[0].substring(3);
              const completeOptions = [
                'A. ' + bOptionContent,
                ...prevQ.options
              ];
              console.log(`    → 继承题${prevQ.number}并补全A选项`);
              return completeOptions;
            } else {
              console.log(`    → 继承题${prevQ.number}的选项`);
              return prevQ.options;
            }
          }
        }
      }
    }
    
    console.log(`  → 未找到有效选项，生成空选项`);
    return ['A.', 'B.', 'C.', 'D.', 'E.'];
  }
  
  return options || ['A.', 'B.', 'C.', 'D.', 'E.'];
}

// 模拟处理题41-43
[41, 42, 43].forEach(num => {
  const currentIndex = data.findIndex((item: any) => item.number === num);
  const currentQuestion = data[currentIndex];
  const result = simulateGetSmartOptions(currentQuestion, data, currentIndex);
  
  console.log(`\n✅ 题${num}最终选项:`, result);
  console.log('='.repeat(50));
});
