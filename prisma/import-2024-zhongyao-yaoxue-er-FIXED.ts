import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// JSON数据接口
interface QuestionJSON {
  number: number;
  question: string;
  options: string[];
  answer: string;
  analysis: string;
}

// 🔑 智能选项处理函数（参考历史经验）
function getSmartOptions(
  currentQuestion: QuestionJSON,
  allQuestions: QuestionJSON[],
  currentIndex: number
): string[] {
  const { number, options, question } = currentQuestion;

  // 优先级1：如果当前题有完整的5个选项，验证合理性
  if (options && options.length === 5) {
    const firstOption = options[0];
    
    // 黑名单：辅料名、剂型名（来自历史记忆）
    const invalidKeywords = [
      '聚乙烯醇', '亚硫酸钠', '苯乙醇', '卵磷脂', // 辅料名
      '散剂', '颗粒剂', '蜜丸', '舌下片', '口服液', // 剂型名
      '乳膏剂', '凝胶剂', '喷雾剂', '贴膏剂', '栓剂' // 更多剂型
    ];
    
    const isInvalid = invalidKeywords.some(keyword => firstOption.includes(keyword));
    
    if (!isInvalid) {
      return options;
    }
  }

  // 优先级2：配伍题智能继承（题41-90）
  if (number >= 41 && number <= 90) {
    // 向前查找最近10题内的有效选项
    for (let i = currentIndex - 1; i >= 0 && i >= currentIndex - 10; i--) {
      const prevQ = allQuestions[i];
      
      // 只从配伍题范围内查找
      if (prevQ.number >= 41 && prevQ.number <= 90) {
        if (prevQ.options && prevQ.options.length >= 4) {
          const firstOption = prevQ.options[0];
          
          // 黑名单过滤
          const invalidKeywords = [
            '聚乙烯醇', '亚硫酸钠', '苯乙醇', '卵磷脂',
            '散剂', '颗粒剂', '蜜丸', '舌下片', '口服液',
            '乳膏剂', '凝胶剂', '喷雾剂', '贴膏剂', '栓剂'
          ];
          
          const isInvalid = invalidKeywords.some(keyword => firstOption.includes(keyword));
          
          if (!isInvalid) {
            console.log(`  → 题${number}继承题${prevQ.number}的选项: ${firstOption.substring(0, 20)}...`);
            
            // 如果只有4个选项且第一个是B开头，补全A选项
            if (prevQ.options.length === 4 && prevQ.options[0].startsWith('B.')) {
              const bOptionContent = prevQ.options[0].substring(3);
              return ['A. ' + bOptionContent, ...prevQ.options];
            }
            
            return prevQ.options;
          }
        }
      }
    }
    
    // 如果找不到有效选项，生成空选项
    console.log(`  ⚠️  题${number}无有效选项，生成空选项`);
    return ['A.', 'B.', 'C.', 'D.', 'E.'];
  }

  // 优先级3：综合分析题（题91-110）
  if (number >= 91 && number <= 110) {
    if (options && options.length > 0) {
      return options;
    }
    
    // 生成空选项
    console.log(`  ⚠️  题${number}综合分析题无选项，生成空选项`);
    return ['A.', 'B.', 'C.', 'D.', 'E.'];
  }

  // 默认返回
  return options || ['A.', 'B.', 'C.', 'D.', 'E.'];
}

// 🔑 处理配伍题答案合并问题
function parseAnswerForPairing(
  questionNumber: number,
  rawAnswer: string,
  allQuestions: QuestionJSON[]
): string {
  // 如果答案包含逗号，可能是多道题的答案合并了
  if (rawAnswer.includes(',')) {
    const answers = rawAnswer.split(',').map(a => a.trim());
    
    // 检查后续题目是否也是空答案
    let emptyCount = 0;
    for (let i = 1; i <= answers.length - 1; i++) {
      const nextQ = allQuestions.find(q => q.number === questionNumber + i);
      if (nextQ && !nextQ.answer) {
        emptyCount++;
      }
    }
    
    // 如果后续题目都是空答案，说明这是合并的答案
    if (emptyCount === answers.length - 1) {
      console.log(`  → 题${questionNumber}答案"${rawAnswer}"被拆分，取第一个: ${answers[0]}`);
      return answers[0];
    }
  }
  
  return rawAnswer;
}

// 🔑 处理解析合并问题
function parseAnalysisForPairing(
  questionNumber: number,
  rawAnalysis: string,
  answer: string
): string {
  // 如果解析包含多个"——"，可能是多道题的解析合并了
  if (rawAnalysis.includes('——')) {
    const parts = rawAnalysis.split(/[.。]/).filter(p => p.trim());
    
    // 尝试找到与答案相关的解析
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }
  
  return rawAnalysis;
}

// 🔑 识别题目类型
function getQuestionType(number: number, answer: string): string {
  // 多选题：题111-120
  if (number >= 111 && number <= 120) {
    return 'multiple';
  }
  
  // 单选题（默认）
  return 'single';
}

// 🔑 识别章节
function getChapter(number: number): string {
  if (number >= 1 && number <= 40) {
    return '一、最佳选择题';
  } else if (number >= 41 && number <= 90) {
    return '二、配伍选择题';
  } else if (number >= 91 && number <= 110) {
    return '三、综合分析题';
  } else if (number >= 111 && number <= 120) {
    return '四、多项选择题';
  }
  return '未分类';
}

async function main() {
  console.log('\n🚀 开始导入2024年中药药学专业知识（二）历年真题...\n');

  // 1. 读取JSON文件
  const jsonPath = path.join(process.cwd(), 'shuju', '2024年执业药师中药师药学专业知识（二）.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf-8');
  const questions: QuestionJSON[] = JSON.parse(jsonData);

  console.log(`✅ 读取到 ${questions.length} 道题目\n`);

  // 2. 清理现有数据（可选）
  const existingCount = await prisma.questions.count({
    where: {
      source_year: 2024,
      subject: '中药学专业知识（二）'
    }
  });

  if (existingCount > 0) {
    console.log(`⚠️  发现 ${existingCount} 道已存在的题目，正在删除...\n`);
    await prisma.questions.deleteMany({
      where: {
        source_year: 2024,
        subject: '中药学专业知识（二）'
      }
    });
    console.log('✅ 清理完成\n');
  }

  // 3. 导入题目
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    
    try {
      // 智能处理选项
      const finalOptions = getSmartOptions(q, questions, i);
      
      // 处理答案
      let finalAnswer = q.answer || '';
      if (q.number >= 41 && q.number <= 110 && finalAnswer.includes(',')) {
        finalAnswer = parseAnswerForPairing(q.number, finalAnswer, questions);
      }
      
      // 处理解析
      let finalAnalysis = q.analysis || '';
      if (finalAnalysis.includes('——') && finalAnswer) {
        finalAnalysis = parseAnalysisForPairing(q.number, finalAnalysis, finalAnswer);
      }
      
      // 识别题型
      const questionType = getQuestionType(q.number, finalAnswer);
      
      // 构建options JSON
      const optionsJson = finalOptions.map((opt, idx) => ({
        key: String.fromCharCode(65 + idx), // A, B, C, D, E
        value: opt.replace(/^[A-E]\.\s*/, '') // 移除前缀
      }));

      // 插入数据库
      await prisma.questions.create({
        data: {
          exam_type: '执业药师',
          subject: '中药学专业知识（二）',
          chapter: getChapter(q.number),
          question_type: questionType,
          content: q.question,
          options: optionsJson,
          correct_answer: finalAnswer,
          explanation: finalAnalysis,
          difficulty: 2,
          knowledge_points: [],
          source_type: '历年真题',
          source_year: 2024,
          is_published: true,
          ai_explanation: null // 无图片题
        }
      });

      successCount++;
      
      // 详细日志
      if (q.number <= 5 || q.number >= 116 || !finalAnswer) {
        console.log(`✅ 题${q.number}: ${questionType} | 答案: ${finalAnswer || '(空)'} | 选项: ${finalOptions[0].substring(0, 15)}...`);
      }
      
    } catch (error) {
      errorCount++;
      console.error(`❌ 题${q.number}导入失败:`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 导入统计');
  console.log('='.repeat(60));
  console.log(`✅ 成功: ${successCount} 道题`);
  console.log(`❌ 失败: ${errorCount} 道题`);
  console.log(`📚 科目: 中药学专业知识（二）`);
  console.log(`📅 年份: 2024年`);
  console.log('='.repeat(60) + '\n');

  // 4. 验证数据
  const finalCount = await prisma.questions.count({
    where: {
      source_year: 2024,
      subject: '中药学专业知识（二）'
    }
  });

  console.log(`🎯 数据库中共有 ${finalCount} 道2024年中药药学专业知识（二）题目\n`);

  // 5. 检查关键题目
  console.log('🔍 验证关键题目...\n');
  
  const checkQuestions = [1, 41, 42, 70, 72, 91, 111, 116, 120];
  for (const num of checkQuestions) {
    const question = await prisma.questions.findFirst({
      where: {
        source_year: 2024,
        subject: '中药学专业知识（二）'
      },
      skip: num - 1,
      take: 1,
      orderBy: { created_at: 'asc' }
    });

    if (question) {
      const options = question.options as any;
      const firstOption = options && options[0] ? options[0].value : '(无)';
      console.log(`题${num}: ${question.question_type} | 答案: ${question.correct_answer || '(空)'} | A: ${firstOption.substring(0, 20)}...`);
    }
  }

  console.log('\n✅ 导入完成！');
}

main()
  .catch((e) => {
    console.error('💥 导入失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
