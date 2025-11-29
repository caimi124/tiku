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

// 🔑 智能选项处理函数
function getSmartOptions(
  currentQuestion: QuestionJSON,
  allQuestions: QuestionJSON[],
  currentIndex: number
): string[] {
  const { number, options, question } = currentQuestion;

  // 优先级1：检查选项数量异常（西药综合特有问题）
  if (options && options.length > 0 && options.length < 5) {
    console.log(`  ⚠️  题${number}: 选项数量异常（${options.length}个）`);
    
    // 如果是4个选项且第一个是B开头，补全A选项
    if (options.length === 4 && options[0].startsWith('B.')) {
      const bOptionContent = options[0].substring(3);
      const completeOptions = ['A. ' + bOptionContent, ...options];
      console.log(`  → 补全A选项`);
      return completeOptions;
    }
    
    // 配伍题（41-90）：向前查找继承
    if (number >= 41 && number <= 90) {
      for (let i = currentIndex - 1; i >= 0 && i >= currentIndex - 10; i--) {
        const prevQ = allQuestions[i];
        if (prevQ.number >= 41 && prevQ.number <= 90) {
          if (prevQ.options && prevQ.options.length >= 4) {
            console.log(`  → 题${number}继承题${prevQ.number}的选项`);
            
            // 补全A选项
            if (prevQ.options.length === 4 && prevQ.options[0].startsWith('B.')) {
              const bOptionContent = prevQ.options[0].substring(3);
              return ['A. ' + bOptionContent, ...prevQ.options];
            }
            
            return prevQ.options;
          }
        }
      }
    }
    
    // 如果仍然少于5个，生成空选项补足
    const paddedOptions = [...options];
    const letters = ['A', 'B', 'C', 'D', 'E'];
    while (paddedOptions.length < 5) {
      const letter = letters[paddedOptions.length];
      paddedOptions.push(`${letter}.`);
    }
    console.log(`  → 补足至5个选项`);
    return paddedOptions;
  }

  // 优先级2：如果当前题有完整的5个选项，直接返回
  if (options && options.length === 5) {
    return options;
  }

  // 优先级3：配伍题智能继承（题41-90）
  if (number >= 41 && number <= 90) {
    // 向前查找最近10题内的有效选项
    for (let i = currentIndex - 1; i >= 0 && i >= currentIndex - 10; i--) {
      const prevQ = allQuestions[i];
      
      // 只从配伍题范围内查找
      if (prevQ.number >= 41 && prevQ.number <= 90) {
        if (prevQ.options && prevQ.options.length >= 4) {
          console.log(`  → 题${number}继承题${prevQ.number}的选项`);
          
          // 如果只有4个选项且第一个是B开头，补全A选项
          if (prevQ.options.length === 4 && prevQ.options[0].startsWith('B.')) {
            const bOptionContent = prevQ.options[0].substring(3);
            return ['A. ' + bOptionContent, ...prevQ.options];
          }
          
          return prevQ.options;
        }
      }
    }
    
    // 如果找不到有效选项，生成空选项
    console.log(`  ⚠️  题${number}无有效选项，生成空选项`);
    return ['A.', 'B.', 'C.', 'D.', 'E.'];
  }

  // 优先级4：综合分析题（题91-110）
  if (number >= 91 && number <= 110) {
    if (options && options.length > 0) {
      // 如果选项少于5个，补足
      if (options.length < 5) {
        const paddedOptions = [...options];
        const letters = ['A', 'B', 'C', 'D', 'E'];
        while (paddedOptions.length < 5) {
          const letter = letters[paddedOptions.length];
          paddedOptions.push(`${letter}.`);
        }
        console.log(`  ⚠️  题${number}综合分析题选项少于5个，已补足`);
        return paddedOptions;
      }
      return options;
    }
    
    // 生成空选项
    console.log(`  ⚠️  题${number}综合分析题无选项，生成空选项`);
    return ['A.', 'B.', 'C.', 'D.', 'E.'];
  }

  // 默认返回
  return options || ['A.', 'B.', 'C.', 'D.', 'E.'];
}

// 🔑 检测综合分析题案例背景
function detectMissingCase(
  questionNumber: number,
  questionContent: string
): { needsCase: boolean; caseWarning: string | null } {
  // 综合分析题范围（91-110）
  if (questionNumber < 91 || questionNumber > 110) {
    return { needsCase: false, caseWarning: null };
  }
  
  // 检测是否以"该患者"、"该病人"等开头，但没有患者信息
  const startsWithPatient = /^(该患者|该病人|患者|关于)/;
  
  if (startsWithPatient.test(questionContent)) {
    // 检查前面是否有案例描述（通常包含年龄、性别、诊断等）
    const hasPatientInfo = /患者.*[男女].*\d+岁/.test(questionContent);
    
    if (!hasPatientInfo) {
      return {
        needsCase: true,
        caseWarning: '【⚠️ 案例背景可能缺失】本题组可能需要患者案例背景，但数据源中未找到。'
      };
    }
  }
  
  return { needsCase: false, caseWarning: null };
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

// 🔑 处理多选题答案（排序）
function normalizeMultipleAnswer(answer: string): string {
  // 如果答案包含逗号或空格分隔的多个字母，排序
  if (answer.includes(',') || answer.includes(' ')) {
    const letters = answer.replace(/[^A-E]/g, '').split('');
    return letters.sort().join('');
  }
  
  // 如果是连续字母，排序
  if (answer.length > 1 && /^[A-E]+$/.test(answer)) {
    return answer.split('').sort().join('');
  }
  
  return answer;
}

async function main() {
  console.log('\n🚀 开始导入2022年西药药学综合与技能历年真题...\n');

  // 1. 读取JSON文件
  const jsonPath = path.join(process.cwd(), 'shuju', '2022年执业药师西药师药学综合与技能历年真题.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf-8');
  const questions: QuestionJSON[] = JSON.parse(jsonData);

  console.log(`✅ 读取到 ${questions.length} 道题目\n`);

  // 2. 清理现有数据（可选）
  const existingCount = await prisma.questions.count({
    where: {
      source_year: 2022,
      subject: '药学综合知识与技能'
    }
  });

  if (existingCount > 0) {
    console.log(`⚠️  发现 ${existingCount} 道已存在的题目，正在删除...\n`);
    await prisma.questions.deleteMany({
      where: {
        source_year: 2022,
        subject: '药学综合知识与技能'
      }
    });
    console.log('✅ 清理完成\n');
  }

  // 3. 导入题目
  let successCount = 0;
  let warningCount = 0;
  const warningQuestions: number[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    
    console.log(`\n📝 处理题${q.number}: ${q.question.substring(0, 30)}...`);
    
    // 智能处理选项
    const smartOptions = getSmartOptions(q, questions, i);
    
    // 检测案例缺失
    const { needsCase, caseWarning } = detectMissingCase(q.number, q.question);
    
    // 识别题型和章节
    const questionType = getQuestionType(q.number, q.answer);
    const chapter = getChapter(q.number);
    
    // 处理答案
    let finalAnswer = q.answer;
    if (questionType === 'multiple') {
      finalAnswer = normalizeMultipleAnswer(q.answer);
      console.log(`  → 多选题答案排序: ${q.answer} → ${finalAnswer}`);
    }
    
    // 处理题目内容（添加案例缺失警告）
    let finalContent = q.question;
    if (needsCase && caseWarning) {
      finalContent = caseWarning + '\n\n' + q.question;
      console.log(`  ⚠️  检测到案例可能缺失`);
      warningCount++;
      warningQuestions.push(q.number);
    }
    
    // 处理解析
    let finalAnalysis = q.analysis || '';
    
    try {
      await prisma.questions.create({
        data: {
          content: finalContent,
          options: smartOptions,
          correct_answer: finalAnswer,
          ai_explanation: finalAnalysis,
          subject: '药学综合知识与技能',
          chapter: chapter,
          source_year: 2022,
          source_type: 'history',
          exam_type: '执业药师',
          question_type: questionType,
          difficulty: 2,
          is_published: true,
          knowledge_points: []
        }
      });
      
      successCount++;
      console.log(`✅ 题${q.number}导入成功 [${chapter}]`);
      
    } catch (error) {
      console.error(`❌ 题${q.number}导入失败:`, error);
    }
  }

  // 4. 导入统计
  console.log('\n' + '='.repeat(60));
  console.log('📊 导入完成统计');
  console.log('='.repeat(60));
  console.log(`✅ 成功导入: ${successCount}/${questions.length} 道题`);
  console.log(`⚠️  案例缺失警告: ${warningCount} 道题`);
  
  if (warningQuestions.length > 0) {
    console.log(`\n⚠️  需要人工检查的题目（可能缺少案例背景）:`);
    console.log(`   ${warningQuestions.join(', ')}`);
  }
  
  console.log('\n✨ 导入任务完成！');
  console.log('\n📋 下一步操作：');
  console.log('1. 运行验证脚本检查数据质量');
  console.log('2. 更新前端历年真题列表页');
  console.log('3. 测试前端显示效果');
  console.log('4. 如有案例缺失，需要补充完整案例背景\n');
}

main()
  .catch((e) => {
    console.error('❌ 导入失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
