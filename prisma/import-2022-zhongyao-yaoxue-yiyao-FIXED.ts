import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

config({ path: '.env.local' });

const prisma = new PrismaClient();

interface QuestionJSON {
  number: number;
  question: string;
  type: string;
  source: string;
  options: string[];
  answer: string;
  analysis: string;
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

// 清洗题目内容和解析，移除章节标记
function cleanContent(text: string): string {
  let cleaned = text;
  
  // 移除章节标题
  const chapterMarkers = [
    '一、最佳选择题',
    '二、配伍选择题',
    '三、综合分析题',
    '四、多项选择题',
    '案例：',
    '案例:'
  ];
  
  for (const marker of chapterMarkers) {
    const markerIndex = cleaned.indexOf(marker);
    if (markerIndex !== -1) {
      cleaned = cleaned.substring(0, markerIndex).trim();
    }
  }
  
  return cleaned;
}

// 【核心修复】智能处理选项
function getSmartOptions(
  currentQuestion: QuestionJSON,
  allQuestions: QuestionJSON[],
  currentIndex: number
): string[] {
  const { number, options, question } = currentQuestion;
  
  // 🔑 优先级1：图示题强制生成空选项（忽略任何自带选项）
  const isImageQuestion = question.includes('图示') || question.includes('[图示]') || question.includes('图中');
  if (isImageQuestion) {
    console.log(`  ℹ️  题${number}是图示题，生成A-E空选项`);
    return ['A.', 'B.', 'C.', 'D.', 'E.'];
  }
  
  // 🔑 优先级2：配伍题选项继承
  if (number >= 41 && number <= 90) {
    // 先检查自带选项
    if (options && options.length >= 4) {
      const firstOption = options[0];
      
      // 黑名单过滤（错误选项关键词）- 精确匹配避免误杀
      const invalidKeywords = [
        '聚乙烯醇', '亚硫酸钠', '苯乙醇', '卵磷脂', // 辅料名（移除"葡萄糖"避免误杀"葡萄糖苷"）
        '散剂', '颗粒剂', '蜜丸', '舌下片', '口服液', // 剂型名
        '乳膏剂', '凝胶剂', '喷雾剂', '贴膏剂', '栓剂' // 更多剂型
      ];
      
      const isInvalid = invalidKeywords.some(keyword => firstOption.includes(keyword));
      
      if (!isInvalid) {
        // 补全缺失的A选项（如果需要）
        if (options.length === 4 && options[0].startsWith('B.')) {
          // 从B选项中提取内容作为A选项
          const bOptionContent = options[0].substring(3); // 去掉"B. "
          const completeOptions = [
            'A. ' + bOptionContent,
            ...options
          ];
          console.log(`  ✓ 题${number}补全A选项后使用自带选项（A=${bOptionContent.substring(0, 10)}...）`);
          return completeOptions;
        } else if (options.length === 5) {
          console.log(`  ✓ 题${number}使用自带选项（完整且有效）`);
          return options;
        }
      } else {
        console.log(`  ⚠️ 题${number}检测到错误选项：${firstOption.substring(0, 20)}...`);
      }
    }
    
    // 选项不完整或无效，向前查找（最多10题）
    for (let i = currentIndex - 1; i >= 0 && i >= currentIndex - 10; i--) {
      const prevQ = allQuestions[i];
      if (prevQ.number >= 41 && prevQ.number <= 90) {
        if (prevQ.options && prevQ.options.length >= 4) {
          const firstOption = prevQ.options[0];
          
          // 黑名单过滤
          const invalidKeywords = [
            '聚乙烯醇', '亚硫酸钠', '苯乙醇', '卵磷脂', // 移除"葡萄糖"避免误杀
            '散剂', '颗粒剂', '蜜丸', '舌下片', '口服液',
            '乳膏剂', '凝胶剂', '喷雾剂', '贴膏剂', '栓剂'
          ];
          
          const isInvalid = invalidKeywords.some(keyword => firstOption.includes(keyword));
          
          if (!isInvalid) {
            // 如果找到的选项缺少A，补全它
            if (prevQ.options.length === 4 && prevQ.options[0].startsWith('B.')) {
              const bOptionContent = prevQ.options[0].substring(3);
              const completeOptions = [
                'A. ' + bOptionContent,
                ...prevQ.options
              ];
              console.log(`  ✓ 题${number}继承题${prevQ.number}的选项（补全A选项）`);
              return completeOptions;
            } else {
              console.log(`  ✓ 题${number}继承题${prevQ.number}的选项`);
              return prevQ.options;
            }
          }
        }
      }
    }
    
    // 如果没找到合理的选项，生成空选项
    console.log(`  ℹ️  题${number}生成A-E空选项（配伍题未找到有效选项）`);
    return ['A.', 'B.', 'C.', 'D.', 'E.'];
  }
  
  // 🔑 优先级3：综合分析题选项处理
  if (number >= 91 && number <= 110) {
    // 如果有选项，检查是否合理
    if (options && options.length === 5) {
      const firstOption = options[0];
      // 排除明显的错误选项
      const invalidForComprehensive = ['乳膏剂', '凝胶剂', '喷雾剂', '贴膏剂', '栓剂', '散剂', '颗粒剂'];
      const isInvalid = invalidForComprehensive.some(keyword => firstOption.includes(keyword));
      
      if (isInvalid) {
        console.log(`  ⚠️ 题${number}检测到错误选项，生成A-E空选项`);
        return ['A.', 'B.', 'C.', 'D.', 'E.'];
      }
      
      console.log(`  ✓ 题${number}使用自带选项`);
      return options;
    }
    
    // 向前查找同组题目的选项（综合分析题通常3-4题共用一组选项）
    for (let i = currentIndex - 1; i >= 0 && i >= currentIndex - 4; i--) {
      const prevQ = allQuestions[i];
      if (prevQ.number >= 91 && prevQ.number <= 110) {
        if (prevQ.options && prevQ.options.length === 5) {
          console.log(`  ✓ 题${number}继承题${prevQ.number}的选项`);
          return prevQ.options;
        }
      }
    }
    
    // 没有选项，生成空选项
    console.log(`  ℹ️  题${number}生成A-E空选项（综合分析题）`);
    return ['A.', 'B.', 'C.', 'D.', 'E.'];
  }
  
  // 🔑 优先级4：多选题选项处理（题111-120）
  if (number >= 111 && number <= 120) {
    if (options && options.length > 0) {
      console.log(`  ✓ 题${number}使用自带选项（${options.length}个）`);
      return options;
    }
    
    // 向前查找最近的题目选项
    for (let i = currentIndex - 1; i >= 0 && i >= currentIndex - 3; i--) {
      const prevQ = allQuestions[i];
      if (prevQ.number >= 111 && prevQ.number <= 120) {
        if (prevQ.options && prevQ.options.length > 0) {
          console.log(`  ✓ 题${number}继承题${prevQ.number}的选项`);
          return prevQ.options;
        }
      }
    }
    
    // 生成默认选项
    console.log(`  ℹ️  题${number}生成A-E空选项（多选题）`);
    return ['A.', 'B.', 'C.', 'D.', 'E.'];
  }
  
  // 其他题型：使用自带选项或生成空选项
  if (options && options.length > 0) {
    console.log(`  ✓ 题${number}使用自带选项`);
    return options;
  }
  
  console.log(`  ⚠️ 题${number}没有选项，生成默认选项`);
  return ['A.', 'B.', 'C.', 'D.', 'E.'];
}

async function main() {
  console.log('🚀 开始导入2022年执业药师中药药学专业知识（一）真题（修复版）\n');

  try {
    // 读取JSON文件
    const jsonPath = path.join(__dirname, '../shuju/2022年执业药师中药师药一历年真题图片/2022年执业药师中药师药一历年真题.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const questions: QuestionJSON[] = JSON.parse(jsonContent);

    console.log(`📖 读取到 ${questions.length} 道题目\n`);

    // 图片目录
    const imageDir = path.join(__dirname, '../shuju/2022年执业药师中药师药一历年真题图片');
    
    // 删除已存在的2022年中药药学专业知识（一）题目
    const deleted = await prisma.questions.deleteMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2022,
      },
    });
    console.log(`🗑️  已清理旧数据: ${deleted.count} 条\n`);

    // 导入题目
    console.log('📝 开始导入题目（智能处理选项）...\n');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      try {
        // 检查是否有图片标记
        // 修复：题78-79虽然source是"self"但实际是化学结构图片题
        const hasImageMark = q.question.includes('图示') || 
                            q.question.includes('[图示]') || 
                            q.source === 'image' ||
                            // 化学结构题：包含"化合物"且在78-79范围
                            (q.question.includes('化合物') && (q.number === 78 || q.number === 79));
        
        // 处理图片 - 查找实际存在的图片文件（每个选项一张）
        const existingImages: string[] = [];
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
            
            // 找到第一个存在的文件即停止
            for (const imgName of possibleNames) {
              if (checkImageExists(imageDir, imgName)) {
                existingImages.push(`/shuju/2022年执业药师中药师药一历年真题图片/${imgName}`);
                break; // 找到一个就跳出内层循环
              }
            }
          }
          
          // 如果是图片题但没找到图片
          if (existingImages.length === 0) {
            console.log(`  ⚠️ 题${q.number}是图片题但未找到图片文件`);
          }
        }

        // 获取智能处理后的选项
        const finalOptions = getSmartOptions(q, questions, i);
        const optionObjects = finalOptions.map((opt, idx) => ({
          key: String.fromCharCode(65 + idx),
          value: opt.replace(/^[A-E]\./, '').trim(),
        }));

        // 清洗题目内容和解析
        const cleanedQuestion = cleanContent(q.question.replace(/\s+/g, ' ').trim());
        const cleanedAnalysis = cleanContent(q.analysis || '');

        await prisma.questions.create({
          data: {
            exam_type: '执业药师',
            subject: '中药学专业知识（一）',
            chapter: getChapter(q.number),
            question_type: getQuestionType(q.number, finalOptions, q.answer),
            content: cleanedQuestion,
            options: optionObjects,
            correct_answer: q.answer,
            explanation: cleanedAnalysis,
            difficulty: 2,
            knowledge_points: [],
            source_type: '历年真题',
            source_year: 2022,
            is_published: true,
            // 将图片信息存储到ai_explanation字段
            ai_explanation: existingImages.length > 0 ? JSON.stringify({ images: existingImages }) : null,
          },
        });

        successCount++;
        const progress = `[${i + 1}/${questions.length}]`;
        const preview = cleanedQuestion.substring(0, 30);
        const imageInfo = existingImages.length > 0 ? `📷×${existingImages.length}` : '';
        const optionInfo = `✓${finalOptions.length}选项`;
        const typeInfo = getQuestionType(q.number, finalOptions, q.answer);
        console.log(`✅ ${progress} Q${q.number} [${typeInfo}] ${preview}... ${optionInfo} ${imageInfo}`);
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
        source_year: 2022,
      },
    });
    
    // 按章节统计
    const byChapter = await prisma.questions.groupBy({
      by: ['chapter'],
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2022,
      },
      _count: true,
    });
    
    console.log(`✨ 数据库中现有【2022年中药药学专业知识（一）】题目: ${total} 道\n`);
    console.log('📋 章节分布:');
    byChapter.forEach(item => {
      console.log(`   ${item.chapter}: ${item._count} 道`);
    });
    console.log('\n🎉 导入完成！\n');

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
