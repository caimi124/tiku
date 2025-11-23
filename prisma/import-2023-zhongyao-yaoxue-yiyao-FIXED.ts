import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

config({ path: '.env.local' });

const prisma = new PrismaClient();

interface QuestionJSON {
  number: number;
  question: string;
  options: string[];
  answer: string;
  analysis: string;
}

// 根据题号和规则匹配图片
function getImageNames(questionNumber: number, hasImageMark: boolean): string[] {
  if (!hasImageMark) return [];

  const images: string[] = [];
  
  // 最佳选择题：37、38、39、40题
  if ([37, 38, 39, 40].includes(questionNumber)) {
    ['A', 'B', 'C', 'D', 'E'].forEach(option => {
      images.push(`${questionNumber}-${option}.jpeg`);
    });
  }
  // 配伍选择题：52-53题（注意文件名有空格，且格式混合）
  else if (questionNumber === 52 || questionNumber === 53) {
    images.push('52-53-A .jpeg');
    images.push('52-53-B .png');
    images.push('52-53-C .jpeg');
    images.push('52-53-D .png');
    images.push('52-53-E .png');
  }
  // 综合分析题：97-98题
  else if (questionNumber === 97 || questionNumber === 98) {
    images.push('97-98-A .jpeg');
    images.push('97-98-B .jpeg');
    images.push('97-98-C .jpeg');
    images.push('97-98-D .jpeg');
    images.push('97-98-E.jpeg'); // 注意：这个没有空格
  }
  // 综合分析题：99-100题
  else if (questionNumber === 99 || questionNumber === 100) {
    images.push('99-100-A .jpeg');
    images.push('99-100-B.jpeg'); // 注意：后面几个没有空格
    images.push('99-100-C.jpeg');
    images.push('99-100-D.jpeg');
    images.push('99-100-E.jpeg');
  }

  return images;
}

// 检查文件是否存在
function checkImageExists(imageDir: string, imageName: string): boolean {
  const imagePath = path.join(imageDir, imageName);
  return fs.existsSync(imagePath);
}

// 解析选项
function parseOptions(optionsArray: string[]): { key: string; value: string }[] {
  return optionsArray.map(opt => {
    const match = opt.match(/^([A-E])\.\s*(.*)$/);
    if (match) {
      return { key: match[1], value: match[2].trim() };
    }
    return { key: '', value: opt };
  });
}

// 确定题型
function getQuestionType(number: number, options: string[], answer: string): string {
  // 多项选择题：答案包含多个字母
  if (answer && answer.length > 1 && /^[A-E]+$/.test(answer.replace(/,\s*/g, ''))) {
    return 'multiple';
  }
  
  // 配伍选择题：题目编号41-90
  if (number >= 41 && number <= 90) {
    return 'match';
  }
  
  // 综合分析题：题目编号91-110
  if (number >= 91 && number <= 110) {
    return 'comprehensive';
  }
  
  // 最佳选择题：题目编号1-40
  if (number >= 1 && number <= 40) {
    return 'single';
  }
  
  return 'single';
}

// 确定章节
function getChapter(number: number): string {
  if (number >= 1 && number <= 40) return '一、最佳选择题';
  if (number >= 41 && number <= 90) return '二、配伍选择题';
  if (number >= 91 && number <= 110) return '三、综合分析题';
  if (number >= 111 && number <= 120) return '四、多项选择题';
  return '未分类';
}

// 【新增】清洗题目内容，提取案例内容
function cleanQuestionContent(question: string): { content: string; caseContent: string | null } {
  let cleaned = question;
  let caseContent: string | null = null;
  
  // 检查是否包含章节标题
  const chapterMarkers = [
    '二、配伍选择题',
    '三、综合分析题',
    '四、多项选择题'
  ];
  
  for (const marker of chapterMarkers) {
    const markerIndex = cleaned.indexOf(marker);
    if (markerIndex !== -1) {
      // 找到章节标题位置
      const afterMarker = cleaned.substring(markerIndex + marker.length).trim();
      
      // 检查章节标题后是否有案例
      if (afterMarker.startsWith('案例：') || afterMarker.startsWith('案例:')) {
        // 提取案例内容（保留完整案例）
        caseContent = afterMarker;
        console.log(`  📋 提取：从"${marker}"后提取案例内容（${caseContent.length}字符）`);
      }
      
      // 删除章节标题及之后的所有内容
      cleaned = cleaned.substring(0, markerIndex).trim();
      console.log(`  🧹 清洗：移除"${marker}"后的内容`);
      break; // 只处理第一个找到的标记
    }
  }
  
  // 如果没有找到章节标题，单独检查案例标记
  if (!caseContent) {
    const caseMarkers = ['案例：', '案例:'];
    for (const marker of caseMarkers) {
      const index = cleaned.indexOf(marker);
      if (index !== -1) {
        // 删除案例标记及之后的内容（这种情况案例已经在错误位置）
        cleaned = cleaned.substring(0, index).trim();
        console.log(`  🧹 清洗：移除"${marker}"后的内容`);
        break;
      }
    }
  }
  
  return { content: cleaned, caseContent };
}

// 确定题目类型
function getQuestionTypeNew(number: number, question: string): string {
  if (number >= 111 && number <= 120) return 'multiple';
  if (number >= 91 && number <= 110) return 'comprehensive';
  if (number >= 41 && number <= 90) return 'match';
  return 'single';
}

// 【核心修复】智能处理选项 - 完全重写
function getSmartOptions(
  currentQuestion: QuestionJSON,
  allQuestions: QuestionJSON[],
  currentIndex: number
): string[] {
  const { number, options, question } = currentQuestion;
  
  // 🔑 关键修复：图示题只生成空选项，忽略任何自带选项
  const isImageQuestion = question.includes('图示') || question.includes('[图示]');
  if (isImageQuestion) {
    console.log(`  ℹ️  题${number}是图示题，生成A-E空选项（忽略JSON中的错误选项）`);
    return ['A.', 'B.', 'C.', 'D.', 'E.'];
  }
  
  // 【修复配伍题】强制继承规则
  if (number >= 41 && number <= 90) {
    // 🔑 特殊处理：题41-42的选项在题40（图示题）中
    if (number === 41 || number === 42) {
      // 向前查找题40
      const q40 = allQuestions.find(q => q.number === 40);
      if (q40 && q40.options && q40.options.length > 0) {
        const firstOption = q40.options[0];
        // 检查是否是鹿茸规格选项（四岔、三岔等）
        if (firstOption.includes('四岔') || firstOption.includes('三岔') || firstOption.includes('单门')) {
          console.log(`  ℹ️  题${number}从题40获取鹿茸规格选项`);
          return q40.options;
        }
      }
    }
    
    // 向前查找最近的有效选项题（最多查找10题）
    for (let i = currentIndex - 1; i >= 0 && i >= currentIndex - 10; i--) {
      const prevQ = allQuestions[i];
      if (prevQ.number >= 41 && prevQ.number <= 90) {
        if (prevQ.options && prevQ.options.length > 0) {
          const firstOption = prevQ.options[0];
          
          // 🔑 关键：排除错误选项（但不包括鹿茸规格，因为它是题41-42的正确选项）
          const invalidKeywords = [
            '聚乙烯醇', '亚硫酸钠', '苯乙醇', '葡萄糖', '卵磷脂', // 辅料名
            '散剂', '颗粒剂', '蜜丸', '舌下片', '口服液', // 剂型名
            '乳膏剂', '凝胶剂', '喷雾剂', '贴膏剂', '栓剂', // 更多剂型
            '牡蛎', '炉甘石', '石膏', '自然铜', '赭石' // 矿物药（属于题91-93）
          ];
          
          // 注意：移除了'四岔', '三岔', '单门'，因为这是题41-42的正确选项
          const isInvalid = invalidKeywords.some(keyword => firstOption.includes(keyword));
          
          if (!isInvalid) {
            console.log(`  ℹ️  题${number}继承题${prevQ.number}的选项`);
            return prevQ.options;
          }
        }
      }
    }
    
    // 如果没找到合理的选项，生成空选项
    console.log(`  ℹ️  题${number}生成A-E空选项（配伍题未找到有效选项）`);
    return ['A.', 'B.', 'C.', 'D.', 'E.'];
  }
  
  // 【修复综合分析题】也要检查选项合理性
  if (number >= 91 && number <= 110) {
    // 🔑 特殊处理：题91-93的选项在题90（配伍题）中
    if (number === 91 || number === 92 || number === 93) {
      // 向前查找题90
      const q90 = allQuestions.find(q => q.number === 90);
      if (q90 && q90.options && q90.options.length > 0) {
        const firstOption = q90.options[0];
        // 检查是否是矿物药选项（牡蛎、炉甘石等）
        if (firstOption.includes('牡蛎') || firstOption.includes('炉甘石') || firstOption.includes('石膏')) {
          console.log(`  ℹ️  题${number}从题90获取矿物药选项`);
          return q90.options;
        }
      }
    }
    
    // 如果有选项，检查是否合理
    if (options && options.length > 0) {
      const firstOption = options[0];
      // 排除明显的剂型名（这些选项不应出现在91-93题）
      const invalidForComprehensive = ['乳膏剂', '凝胶剂', '喷雾剂', '贴膏剂', '栓剂'];
      const isInvalid = invalidForComprehensive.some(keyword => firstOption.includes(keyword));
      
      if (isInvalid) {
        console.log(`  ℹ️  题${number}检测到错误选项，生成A-E空选项`);
        return ['A.', 'B.', 'C.', 'D.', 'E.'];
      }
      
      return options; // 选项合理，使用
    }
    
    // 没有选项，生成空选项
    console.log(`  ℹ️  题${number}生成A-E空选项（综合分析题）`);
    return ['A.', 'B.', 'C.', 'D.', 'E.'];
  }
  
  // 其他题型：如果有选项就用，没有就生成空选项
  if (options && options.length > 0) {
    return options;
  }
  
  // 处理图示题（有图片但无选项）：生成A-E空选项
  const hasImageMark = question.includes('图示') || question.includes('[图示]');
  if (hasImageMark) {
    console.log(`  ℹ️  题${number}是图示题，生成A-E空选项`);
    return [
      'A.',
      'B.',
      'C.',
      'D.',
      'E.'
    ];
  }
  
  // 处理综合分析题（91-110）：向前查找或生成空选项
  if (number >= 91 && number <= 110) {
    // 先尝试向前查找
    for (let i = currentIndex - 1; i >= 0; i--) {
      const prevQ = allQuestions[i];
      if (prevQ.number >= 91 && prevQ.number <= 110 && number - prevQ.number <= 5) {
        if (prevQ.options && prevQ.options.length > 0) {
          console.log(`  ℹ️  题${number}继承题${prevQ.number}的选项`);
          return prevQ.options;
        }
      }
    }
    // 如果没找到，生成空选项
    console.log(`  ℹ️  题${number}生成A-E空选项`);
    return ['A.', 'B.', 'C.', 'D.', 'E.'];
  }
  
  // 其他情况：生成空选项
  console.log(`  ⚠️  题${number}没有选项，生成默认选项`);
  return ['A.', 'B.', 'C.', 'D.', 'E.'];
}

async function main() {
  console.log('🚀 开始导入2023年执业药师中药药学专业知识（一）真题（修复版）\n');

  try {
    // 读取JSON文件
    const jsonPath = path.join(__dirname, '../shuju/2023年执业药师中药药一历年真题图片/2023年执业药师中药药学专业知识（一）.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const questions: QuestionJSON[] = JSON.parse(jsonContent);

    console.log(`📖 读取到 ${questions.length} 道题目\n`);

    // 图片目录（public目录）
    const imageDir = path.join(__dirname, '../public/shuju/2023年执业药师中药药一历年真题图片/img');
    
    // 删除已存在的2023年中药药学专业知识（一）题目
    const deleted = await prisma.questions.deleteMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
      },
    });
    console.log(`🗑️  已清理旧数据: ${deleted.count} 条\n`);

    // 导入题目
    console.log('📝 开始导入题目（智能处理选项）...\n');
    let successCount = 0;
    let errorCount = 0;
    let extractedCase: string | null = null; // 保存从前一题提取的案例

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      try {
        // 检查是否有图片标记
        const hasImageMark = q.question.includes('图示') || q.question.includes('[图示]');
        const imageNames = getImageNames(q.number, hasImageMark);
        
        // 处理图片 - 使用public目录的相对路径
        const imageData = imageNames
          .filter(img => checkImageExists(imageDir, img))
          .map(img => `/shuju/2023年执业药师中药药一历年真题图片/img/${img}`);

        // 获取智能处理后的选项
    const finalOptions = getSmartOptions(q, questions, i);
    const optionObjects = finalOptions.map((opt, idx) => ({
      key: String.fromCharCode(65 + idx),
      value: opt.replace(/^[A-E]\./, '').trim(),
    }));

    // 【新增】清洗题目内容
    const rawContent = q.question
      .replace(/\s+/g, ' ')
      .replace(/\n/g, ' ')
      .trim();
    const cleanResult = cleanQuestionContent(rawContent);
    
    // 如果从前一题提取了案例，且当前题是综合分析题的第一题，添加案例
    let content = cleanResult.content;
    if (extractedCase && (q.number === 101 || q.number === 104 || q.number === 107)) {
      content = extractedCase + '\n\n' + content;
      console.log(`  ✅ 添加案例到题${q.number}（${extractedCase.length}字符）`);
      extractedCase = null; // 案例已使用，清空
    }
    
    // 保存当前题提取的案例，供下一题使用
    if (cleanResult.caseContent) {
      extractedCase = cleanResult.caseContent;
    }

        await prisma.questions.create({
          data: {
            exam_type: '执业药师',
            subject: '中药学专业知识（一）',
            chapter: getChapter(q.number),
            question_type: getQuestionType(q.number, finalOptions, q.answer),
            content: content,
            options: parseOptions(finalOptions),
            correct_answer: q.answer,
            explanation: q.analysis || '',
            difficulty: 2,
            knowledge_points: [],
            source_type: '历年真题',
            source_year: 2023,
            is_published: true,
            // 将图片信息存储到ai_explanation字段
            ai_explanation: imageData.length > 0 ? JSON.stringify({ images: imageData }) : null,
          },
        });

        successCount++;
        const progress = `[${i + 1}/${questions.length}]`;
        const preview = q.question.substring(0, 30);
        const imageInfo = imageData.length > 0 ? `📷×${imageData.length}` : '';
        const optionInfo = finalOptions.length > 0 ? `✓${finalOptions.length}选项` : '⚠️无选项';
        console.log(`✅ ${progress} Q${q.number} ${preview}... ${optionInfo} ${imageInfo}`);
      } catch (error: any) {
        errorCount++;
        console.error(`❌ [${i + 1}] Q${q.number} 导入失败:`, error.message);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 导入统计:');
    console.log(`   ✅ 成功: ${successCount} 道`);
    console.log(`   ❌ 失败: ${errorCount} 道`);
    console.log(`   📝 总计: ${questions.length} 道`);
    console.log(`${'='.repeat(60)}\n`);

    // 验证
    const total = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
      },
    });
    console.log(`✨ 数据库中现有【2023年中药药学专业知识（一）】题目: ${total} 道\n`);
    console.log('🎉 导入完成！\n');

  } catch (error: any) {
    console.error('❌ 导入失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
