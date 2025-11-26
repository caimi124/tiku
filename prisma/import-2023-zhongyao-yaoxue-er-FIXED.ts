import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface QuestionJSON {
  number: number;
  question: string;
  options: string[];
  answer: string;
  analysis: string;
  source?: string;
}

// 智能获取选项：处理配伍题选项继承
function getSmartOptions(
  currentQuestion: QuestionJSON,
  allQuestions: QuestionJSON[],
  currentIndex: number
): string[] {
  const { number, options, question } = currentQuestion;

  // 配伍题选项处理（题41-90）
  if (number >= 41 && number <= 90) {
    // 如果当前题有选项，检查是否合理
    if (options && options.length >= 4) {
      const firstOption = options[0];
      
      // 黑名单：排除不合理的选项
      const invalidKeywords = [
        '聚乙烯醇', '亚硫酸钠', '苯乙醇', '卵磷脂', // 辅料名
        '散剂', '颗粒剂', '蜜丸', '舌下片', '口服液', // 剂型名
        '乳膏剂', '凝胶剂', '喷雾剂', '贴膏剂', '栓剂' // 更多剂型
      ];
      
      const isInvalid = invalidKeywords.some(keyword => firstOption.includes(keyword));
      
      if (!isInvalid) {
        // 选项合理，处理缺少A选项的情况
        if (options.length === 4 && options[0].startsWith('B.')) {
          const bOptionContent = options[0].substring(3);
          return ['A. ' + bOptionContent, ...options];
        }
        return options;
      }
    }
    
    // 向前10题内查找有效选项
    for (let i = currentIndex - 1; i >= 0 && i >= currentIndex - 10; i--) {
      const prevQ = allQuestions[i];
      if (prevQ.number >= 41 && prevQ.number <= 90) {
        if (prevQ.options && prevQ.options.length >= 4) {
          const firstOption = prevQ.options[0];
          
          const invalidKeywords = [
            '聚乙烯醇', '亚硫酸钠', '苯乙醇', '卵磷脂',
            '散剂', '颗粒剂', '蜜丸', '舌下片', '口服液',
            '乳膏剂', '凝胶剂', '喷雾剂', '贴膏剂', '栓剂'
          ];
          
          const isInvalid = invalidKeywords.some(keyword => firstOption.includes(keyword));
          
          if (!isInvalid) {
            console.log(`题${number}继承题${prevQ.number}的选项`);
            return prevQ.options;
          }
        }
      }
    }
    
    // 找不到有效选项，生成空选项
    return ['A.', 'B.', 'C.', 'D.', 'E.'];
  }

  // 综合分析题选项处理（题91-110）
  if (number >= 91 && number <= 110) {
    if (options && options.length >= 4) {
      // 处理缺少A选项的情况
      if (options.length === 4 && options[0].startsWith('B.')) {
        const bOptionContent = options[0].substring(3);
        return ['A. ' + bOptionContent, ...options];
      }
      return options;
    }
    return ['A.', 'B.', 'C.', 'D.', 'E.'];
  }

  // 其他题目直接使用原选项
  return options || ['A.', 'B.', 'C.', 'D.', 'E.'];
}

// 清洗题目内容：移除章节标记
function cleanQuestionContent(question: string): string {
  let cleaned = question;
  
  const markers = [
    '一、最佳选择题',
    '二、配伍选择题',
    '三、综合分析题',
    '四、多项选择题',
    '案例：'
  ];
  
  for (const marker of markers) {
    const markerIndex = cleaned.indexOf(marker);
    if (markerIndex !== -1) {
      cleaned = cleaned.substring(0, markerIndex).trim();
    }
  }
  
  return cleaned.trim();
}

async function importQuestions() {
  console.log('开始导入2023年执业药师中药药学专业知识（二）真题...');
  
  const jsonPath = path.join(process.cwd(), 'shuju', '2023年执业药师中药师药学专业知识（二）.json');
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const questions: QuestionJSON[] = JSON.parse(jsonContent);
  
  console.log(`读取到 ${questions.length} 道题目`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    
    try {
      // 清洗题目内容
      const questionContent = cleanQuestionContent(q.question);
      
      // 智能获取选项
      const processedOptions = getSmartOptions(q, questions, i);
      
      // 确定题型
      let questionType = 'single';
      if (q.number >= 111 && q.number <= 120) {
        questionType = 'multiple';
      }
      
      // 处理答案：多选题答案可能是"AC"、"ABDE"等
      let correctAnswer = q.answer;
      if (questionType === 'multiple' && correctAnswer.length > 1 && !correctAnswer.includes(',')) {
        // 多选题答案按字母排序
        correctAnswer = correctAnswer.split('').sort().join('');
      }
      
      // 确定章节
      const getChapter = (num: number): string => {
        if (num >= 1 && num <= 40) return '一、最佳选择题';
        if (num >= 41 && num <= 90) return '二、配伍选择题';
        if (num >= 91 && num <= 110) return '三、综合分析题';
        if (num >= 111 && num <= 120) return '四、多项选择题';
        return '未分类';
      };

      // 构建选项JSON - 前端期望value字段，不是text字段
      const optionsJson = processedOptions.map((opt, index) => {
        const key = String.fromCharCode(65 + index); // A, B, C, D, E
        const value = opt.replace(/^[A-E]\.?\s*/, '').trim();
        return { key, value };
      });
      
      // 插入数据库
      await prisma.questions.create({
        data: {
          exam_type: '执业药师',
          subject: '中药学专业知识（二）',
          chapter: getChapter(q.number),
          question_type: questionType,
          content: questionContent,
          options: optionsJson,
          correct_answer: correctAnswer,
          explanation: q.analysis || '',
          difficulty: 2,
          knowledge_points: [],
          source_type: '历年真题',
          source_year: 2023,
          is_published: true,
          ai_explanation: null
        }
      });
      
      successCount++;
      console.log(`✅ 题${q.number}导入成功 (${questionType}) - 选项数: ${processedOptions.length}`);
      
    } catch (error) {
      errorCount++;
      console.error(`❌ 题${q.number}导入失败:`, error);
    }
  }
  
  console.log('\n导入完成！');
  console.log(`成功: ${successCount} 题`);
  console.log(`失败: ${errorCount} 题`);
  console.log(`总计: ${questions.length} 题`);
  
  // 验证数据
  console.log('\n验证导入数据...');
  const importedCount = await prisma.questions.count({
    where: {
      source_year: 2023,
      subject: '中药学专业知识（二）'
    }
  });
  console.log(`数据库中2023年中药药学专业知识（二）题目数: ${importedCount}`);
  
  // 检查题型分布
  const singleCount = await prisma.questions.count({
    where: {
      source_year: 2023,
      subject: '中药学专业知识（二）',
      question_type: 'single'
    }
  });
  
  const multipleCount = await prisma.questions.count({
    where: {
      source_year: 2023,
      subject: '中药学专业知识（二）',
      question_type: 'multiple'
    }
  });
  
  console.log(`单选题: ${singleCount} 题`);
  console.log(`多选题: ${multipleCount} 题`);
  
  await prisma.$disconnect();
}

importQuestions().catch(console.error);
