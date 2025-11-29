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
}

// 🔑 答案修复映射表（如果JSON中有答案错误，在这里添加修复）
const ANSWER_FIXES: Record<number, string> = {
  // 根据验证结果，如果发现答案错误，在这里添加修复
  // 例如：99: 'C',
};

async function main() {
  console.log('🚀 开始导入2023年执业药师法规历年真题...\n');

  // 1. 读取JSON文件
  const jsonPath = path.join(process.cwd(), 'shuju', '2023年执业药师法规历年真题.json');
  
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`❌ 找不到数据文件: ${jsonPath}`);
  }

  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  const questions: QuestionJSON[] = JSON.parse(fileContent);

  console.log(`📊 找到 ${questions.length} 道题目\n`);

  // 2. 删除旧数据（2023年法规）
  console.log('🗑️  删除旧数据...');
  const deleteResult = await prisma.questions.deleteMany({
    where: {
      source_year: 2023,
      subject: '药事管理与法规'
    }
  });
  console.log(`✅ 已删除 ${deleteResult.count} 条旧数据\n`);

  // 3. 导入新数据
  let successCount = 0;
  let errorCount = 0;
  const fixedQuestions: number[] = []; // 记录被修复的题目

  for (const q of questions) {
    try {
      // 🔑 修复配伍题8选项问题
      // 配伍题组的最后一题包含了当前组和下一组的选项（8个）
      // 只保留前4个选项（当前配伍题组的选项）
      let options = q.options;
      if (options && options.length === 8) {
        console.log(`⚠️  题${q.number}: 检测到8个选项，只保留前4个`);
        options = options.slice(0, 4); // 只取前4个选项
        fixedQuestions.push(q.number);
      }

      // 🔑 应用答案修复
      let answer = q.answer;
      if (ANSWER_FIXES[q.number]) {
        console.log(`⚠️  题${q.number}: 应用答案修复 ${q.answer} -> ${ANSWER_FIXES[q.number]}`);
        answer = ANSWER_FIXES[q.number];
        if (!fixedQuestions.includes(q.number)) {
          fixedQuestions.push(q.number);
        }
      }

      // 🔑 清理答案字段（移除可能包含的解析内容）
      // 如果答案长度超过10个字符，很可能是错误的（混入了解析）
      if (answer.length > 10) {
        const originalAnswer = answer;
        // 尝试从开头提取答案（通常是ABC、ABCD等）
        const match = answer.match(/^([A-E]+)/);
        if (match) {
          answer = match[1];
          console.log(`⚠️  题${q.number}: 清理答案 "${originalAnswer}" -> "${answer}"`);
          if (!fixedQuestions.includes(q.number)) {
            fixedQuestions.push(q.number);
          }
        }
      }

      // 🔑 确定题型和章节
      let questionType = 'single';
      let chapter = null;
      
      if (q.number >= 1 && q.number <= 40) {
        chapter = '一、最佳选择题';
      } else if (q.number >= 41 && q.number <= 110) {
        chapter = '二、配伍选择题';
      } else if (q.number >= 111 && q.number <= 120) {
        chapter = '三、多项选择题';
        questionType = 'multiple';
        // 多选题答案排序
        answer = answer.split('').sort().join('');
      }

      // 🔑 创建题目记录
      await prisma.questions.create({
        data: {
          content: q.question.trim(),
          options: options,
          correct_answer: answer,
          ai_explanation: q.analysis || '',
          source_type: 'history',
          source_year: 2023,
          subject: '药事管理与法规',
          question_type: questionType,
          chapter: chapter,
          difficulty: 2,
          exam_type: '执业药师'
        }
      });

      successCount++;
      
      // 显示详细导入信息（每10题或修复的题目）
      if (q.number % 10 === 0 || fixedQuestions.includes(q.number)) {
        const fixInfo = fixedQuestions.includes(q.number) ? ' ✨修复' : '';
        console.log(`✅ 题${q.number}: ${questionType === 'multiple' ? '多选' : '单选'} - ${answer}${fixInfo}`);
      }

    } catch (error) {
      errorCount++;
      console.error(`❌ 题${q.number}导入失败:`, error);
    }
  }

  // 4. 显示统计信息
  console.log('\n' + '='.repeat(50));
  console.log('📊 导入统计:');
  console.log('='.repeat(50));
  console.log(`✅ 成功: ${successCount} 道题`);
  console.log(`❌ 失败: ${errorCount} 道题`);
  console.log(`📈 成功率: ${((successCount / questions.length) * 100).toFixed(2)}%`);
  console.log(`🔧 修复: ${fixedQuestions.length} 道题`);
  console.log('='.repeat(50));

  // 5. 验证题型分布
  const singleCount = await prisma.questions.count({
    where: {
      source_year: 2023,
      subject: '药事管理与法规',
      question_type: 'single'
    }
  });

  const multipleCount = await prisma.questions.count({
    where: {
      source_year: 2023,
      subject: '药事管理与法规',
      question_type: 'multiple'
    }
  });

  console.log('\n📊 题型分布验证:');
  console.log(`   单选题: ${singleCount} 道 (预期: 110)`);
  console.log(`   多选题: ${multipleCount} 道 (预期: 10)`);
  console.log(`   总计: ${singleCount + multipleCount} 道 (预期: 120)`);

  // 6. 显示修复的题目列表
  if (fixedQuestions.length > 0) {
    console.log('\n🔧 修复题目列表:');
    console.log(`   ${fixedQuestions.sort((a, b) => a - b).join(', ')}`);
  }

  // 7. 验证选项格式（抽查前5题）
  console.log('\n🔍 选项格式验证（前5题）:');
  const sampleQuestions = await prisma.questions.findMany({
    where: {
      source_year: 2023,
      subject: '药事管理与法规'
    },
    orderBy: { created_at: 'asc' },
    take: 5,
    select: {
      content: true,
      options: true,
      correct_answer: true
    }
  });

  sampleQuestions.forEach((q, index) => {
    const optionsCount = Array.isArray(q.options) ? q.options.length : 0;
    const firstOption = Array.isArray(q.options) && q.options.length > 0 ? q.options[0] : '';
    const optionStr = typeof firstOption === 'string' ? firstOption : String(firstOption);
    console.log(`   题${index + 1}: ${optionsCount}个选项, 示例: ${optionStr.substring(0, 20)}...`);
  });

  console.log('\n🎉 导入完成！');
}

main()
  .catch((error) => {
    console.error('❌ 导入过程出错:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
