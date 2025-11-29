import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// JSON数据接口
interface QuestionJSON {
  number: number;
  question: string;
  type: string;
  source: string;
  options: string[];
  answer: string;
  analysis: string;
}

// 🔑 智能选项处理函数
function getSmartOptions(
  currentQuestion: QuestionJSON,
  allQuestions: QuestionJSON[],
  currentIndex: number
): string[] {
  const { number, options, question } = currentQuestion;

  // 优先级1：如果当前题有完整的5个选项，验证合理性
  if (options && options.length === 5) {
    const firstOption = options[0];
    
    // 黑名单：辅料名、剂型名（可能出现的错误选项）
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

// 🔑 处理多选题答案
function parseAnswerForMultiple(rawAnswer: string): string {
  // 如果答案已经是连续的字母（如"ABC"），直接返回排序后的结果
  if (/^[A-E]+$/.test(rawAnswer)) {
    return rawAnswer.split('').sort().join('');
  }
  
  // 如果答案包含逗号或空格，拆分并排序
  if (rawAnswer.includes(',') || rawAnswer.includes(' ')) {
    const answers = rawAnswer
      .replace(/[,，\s]/g, '')
      .split('')
      .filter(a => /[A-E]/.test(a))
      .sort();
    return answers.join('');
  }
  
  return rawAnswer;
}

// 🔑 清洗题目内容（移除章节标记）
function cleanQuestionContent(question: string): string {
  let cleaned = question;
  
  // 移除常见的章节标记
  const markers = [
    '一、最佳选择题',
    '二、配伍选择题',
    '三、综合分析题',
    '四、多项选择题',
    '案例：',
    '【共用备选答案】'
  ];
  
  for (const marker of markers) {
    const markerIndex = cleaned.indexOf(marker);
    if (markerIndex !== -1) {
      cleaned = cleaned.substring(0, markerIndex).trim();
    }
  }
  
  return cleaned.trim();
}

async function main() {
  try {
    console.log('🚀 开始导入2024年执业药师西药药学综合与技能历年真题...\n');

    // 读取JSON文件
    const jsonPath = path.join(__dirname, '..', 'shuju', '2024年执业药师西药师药学综合与技能历年真题.json');
    console.log(`📖 读取文件: ${jsonPath}`);
    
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`文件不存在: ${jsonPath}`);
    }

    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const questions: QuestionJSON[] = JSON.parse(jsonData);
    console.log(`✅ 成功读取 ${questions.length} 道题目\n`);

    // 统计信息
    const stats = {
      total: questions.length,
      single: 0,
      multiple: 0,
      success: 0,
      failed: 0
    };

    // 删除旧数据
    console.log('🗑️  删除旧数据...');
    await prisma.questions.deleteMany({
      where: {
        source_year: 2024,
        subject: '药学综合知识与技能'
      }
    });
    console.log('✅ 旧数据已删除\n');

    // 开始导入
    console.log('📝 开始导入新数据...\n');

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      try {
        // 确定题型
        let questionType = 'single';
        let chapter = '';
        
        if (q.number >= 1 && q.number <= 40) {
          chapter = '一、最佳选择题';
          questionType = 'single';
        } else if (q.number >= 41 && q.number <= 90) {
          chapter = '二、配伍选择题';
          questionType = 'single';
        } else if (q.number >= 91 && q.number <= 110) {
          chapter = '三、综合分析题';
          questionType = 'single';
        } else if (q.number >= 111 && q.number <= 120) {
          chapter = '四、多项选择题';
          questionType = 'multiple';
        }

        // 统计题型
        if (questionType === 'multiple') {
          stats.multiple++;
        } else {
          stats.single++;
        }

        // 获取智能选项
        const smartOptions = getSmartOptions(q, questions, i);

        // 清洗题目内容
        const cleanedQuestion = cleanQuestionContent(q.question);

        // 处理答案
        let correctAnswer = q.answer;
        if (questionType === 'multiple') {
          correctAnswer = parseAnswerForMultiple(q.answer);
        }

        // 插入数据库
        await prisma.questions.create({
          data: {
            content: cleanedQuestion,
            options: smartOptions,
            correct_answer: correctAnswer,
            question_type: questionType,
            exam_type: '执业药师',
            source_year: 2024,
            source_type: 'history',
            subject: '药学综合知识与技能',
            chapter: chapter,
            ai_explanation: q.analysis || '',
            is_published: true,
            created_at: new Date()
          }
        });

        stats.success++;
        console.log(`✅ [${stats.success}/${stats.total}] 题${q.number}: ${cleanedQuestion.substring(0, 30)}...`);

      } catch (error) {
        stats.failed++;
        console.error(`❌ 题${q.number}导入失败:`, error);
      }
    }

    // 输出统计
    console.log('\n' + '='.repeat(60));
    console.log('📊 导入统计:');
    console.log('='.repeat(60));
    console.log(`总题数: ${stats.total}`);
    console.log(`单选题: ${stats.single}道`);
    console.log(`多选题: ${stats.multiple}道`);
    console.log(`成功: ${stats.success}道 ✅`);
    console.log(`失败: ${stats.failed}道 ❌`);
    console.log(`成功率: ${((stats.success / stats.total) * 100).toFixed(2)}%`);
    console.log('='.repeat(60));
    console.log('\n✨ 导入完成！');

  } catch (error) {
    console.error('❌ 导入过程出错:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
