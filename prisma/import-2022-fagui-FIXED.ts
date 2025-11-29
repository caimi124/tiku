import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface QuestionJSON {
  number: number;
  question: string;
  type?: string;
  source?: string;
  options: string[];
  answer: string;
  analysis: string;
}

/**
 * 🎯 2022年执业药师法规历年真题导入脚本 - 终极版本
 * 
 * 集成的修复方案：
 * 1. ✅ 法规真题8选项问题修复（配伍题组最后一题包含8个选项）
 * 2. ✅ chapter字段自动设置（一、二、三章节）
 * 3. ✅ 多选题自动识别和答案排序
 * 4. ✅ 答案清理（移除可能混入的解析内容）
 * 5. ✅ 详细日志输出
 * 6. ✅ 完整验证流程
 */

async function main() {
  console.log('🚀 开始导入2022年执业药师法规历年真题...\n');

  // 1. 读取JSON文件
  const jsonPath = path.join(process.cwd(), 'shuju', '2022年执业药师法规历年真题.json');
  
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`❌ 找不到数据文件: ${jsonPath}`);
  }

  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  const questions: QuestionJSON[] = JSON.parse(fileContent);

  console.log(`📊 找到 ${questions.length} 道题目\n`);

  // 2. 删除旧数据（2022年法规）
  console.log('🗑️  删除旧数据...');
  const deleteResult = await prisma.questions.deleteMany({
    where: {
      source_year: 2022,
      subject: '药事管理与法规'
    }
  });
  console.log(`✅ 已删除 ${deleteResult.count} 条旧数据\n`);

  // 3. 导入新数据
  let successCount = 0;
  let errorCount = 0;
  const eightOptionQuestions: number[] = []; // 记录8选项题目

  console.log('📝 开始导入题目...\n');

  for (const q of questions) {
    try {
      let question = q.question;
      let options = q.options;
      let answer = q.answer;

      // 🔑 修复1：法规真题8选项问题
      // 配伍题组的最后一题包含了当前组和下一组的选项（8个）
      // 只保留前4个选项（当前配伍题组的选项）
      if (options && options.length === 8 && q.number >= 41 && q.number <= 110) {
        console.log(`⚠️  题${q.number}: 检测到8个选项，只保留前4个（当前配伍题组的选项）`);
        options = options.slice(0, 4); // 只取前4个选项
        eightOptionQuestions.push(q.number);
      }

      // 🔑 修复2：清理答案字段（移除可能包含的解析内容）
      // 如果答案长度超过10个字符，很可能是错误的（混入了解析）
      if (answer.length > 10) {
        const match = answer.match(/^([A-E]+)/);
        if (match) {
          const oldAnswer = answer;
          answer = match[1];
          console.log(`⚠️  题${q.number}: 清理答案 "${oldAnswer.substring(0, 20)}..." → "${answer}"`);
        }
      }

      // 🔑 修复3：确定题型和章节
      let questionType = 'single';
      let chapter = '';
      
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
          content: question.trim(),
          options: options,
          correct_answer: answer,
          ai_explanation: q.analysis || '',
          source_type: 'history',
          source_year: 2022,
          subject: '药事管理与法规',
          question_type: questionType,
          chapter: chapter,
          difficulty: 2,
          exam_type: '执业药师'
        }
      });

      successCount++;
      
      // 显示详细导入信息（每10题或特殊题目）
      if (q.number % 10 === 0 || options.length === 8) {
        console.log(`✅ 题${q.number}: ${chapter} - ${questionType === 'multiple' ? '多选' : '单选'} - 答案${answer}`);
      }

    } catch (error) {
      errorCount++;
      console.error(`❌ 题${q.number}导入失败:`, error);
    }
  }

  // 4. 显示统计信息
  console.log('\n' + '='.repeat(60));
  console.log('📊 导入统计:');
  console.log('='.repeat(60));
  console.log(`✅ 成功: ${successCount} 道题`);
  console.log(`❌ 失败: ${errorCount} 道题`);
  console.log(`📈 成功率: ${((successCount / questions.length) * 100).toFixed(2)}%`);
  
  if (eightOptionQuestions.length > 0) {
    console.log(`\n🔧 修复了 ${eightOptionQuestions.length} 道8选项题目:`);
    console.log(`   题号: ${eightOptionQuestions.join(', ')}`);
  }
  
  console.log('='.repeat(60));

  // 5. 验证题型分布
  const singleCount = await prisma.questions.count({
    where: {
      source_year: 2022,
      subject: '药事管理与法规',
      question_type: 'single'
    }
  });

  const multipleCount = await prisma.questions.count({
    where: {
      source_year: 2022,
      subject: '药事管理与法规',
      question_type: 'multiple'
    }
  });

  console.log('\n📊 题型分布验证:');
  console.log(`   一、最佳选择题: ${await prisma.questions.count({
    where: { source_year: 2022, subject: '药事管理与法规', chapter: '一、最佳选择题' }
  })} 道 (预期: 40)`);
  console.log(`   二、配伍选择题: ${await prisma.questions.count({
    where: { source_year: 2022, subject: '药事管理与法规', chapter: '二、配伍选择题' }
  })} 道 (预期: 70)`);
  console.log(`   三、多选题: ${multipleCount} 道 (预期: 10)`);
  console.log(`   总计: ${singleCount + multipleCount} 道 (预期: 120)`);

  // 6. 验证选项数量（抽查几道配伍题）
  console.log('\n📊 选项数量验证:');
  const samplePeiwuQuestions = await prisma.questions.findMany({
    where: {
      source_year: 2022,
      subject: '药事管理与法规',
      chapter: '二、配伍选择题'
    },
    orderBy: { created_at: 'asc' },
    take: 5,
    select: {
      content: true,
      options: true
    }
  });
  
  samplePeiwuQuestions.forEach((q, idx) => {
    const optionCount = (q.options as string[]).length;
    console.log(`   配伍题${idx + 41}: ${optionCount}个选项 ${optionCount === 4 ? '✅' : '⚠️'}`);
  });

  // 7. 抽查关键题目
  console.log('\n🔍 抽查关键题目:');
  const sampleQuestions = [1, 40, 41, 80, 110, 111, 120];
  for (const qNum of sampleQuestions) {
    const question = await prisma.questions.findFirst({
      where: {
        source_year: 2022,
        subject: '药事管理与法规'
      },
      orderBy: { created_at: 'asc' },
      skip: qNum - 1,
      take: 1,
      select: {
        content: true,
        options: true,
        correct_answer: true,
        chapter: true,
        question_type: true
      }
    });
    
    if (question) {
      console.log(`   题${qNum}: ${question.chapter} | ${question.question_type} | 选项${(question.options as string[]).length}个 | 答案${question.correct_answer}`);
    }
  }

  console.log('\n🎉 导入完成！');
  console.log('\n📝 前端访问路径:');
  console.log('   逐题练习: /practice/history/2022?subject=药事管理与法规');
  console.log('   模拟考试: /practice/history/2022/mock?subject=药事管理与法规');
}

main()
  .catch((error) => {
    console.error('❌ 导入过程出错:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
