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

// 🔑 答案修复映射表（修复JSON中答案字段错误的题目）
const ANSWER_FIXES: Record<number, string> = {
  99: 'C',    // 说明书项目名称（答案混入了解析）
  100: 'B',   // 化学药品加快上市注册程序（答案混入了解析）
  112: 'ABD', // 儿童化妆品（C说法错误，应该是12岁以下不是16岁）
  116: 'ABC', // 零售连锁企业门店禁止行为（D错误，门店可以直接配送）
  119: 'BCD', // 药品上市许可持有人销售（A错误，只能委托经营企业不能委托生产企业）
  120: 'ABC', // 疫苗临床试验（D不完整）
};

// 🔑 题目内容修复（题120不完整）
const QUESTION_FIXES: Record<number, { question?: string; options?: string[] }> = {
  120: {
    question: '关于疫苗临床试验和上市许可规定的说法正确的(多选)',
    options: [
      'A.对疾病预防、控制急需的疫苗和创新疫苗，国务院药品监督管理部门应当予以优先审评审批',
      'B.开展疫苗临床试验应当经国务院药品监督管理部门依法批准，并取得受试者的书面知情同意',
      'C.应对重大突发公共卫生事件急需的疫苗，经评估获益大于风险的，国务院药品监督管理部门可以附条件批准疫苗注册申请',
      'D.出现特别重大突发公共卫生事件，国家疾病预防控制机构根据传染病预防、控制需要提出紧急使用疫苗的建议，经国务院药品监督管理部门组织论证同意后可以在一定范围和期限内紧急使用'
    ]
  }
};

async function main() {
  console.log('🚀 开始导入2024年执业药师法规历年真题...\n');

  // 1. 读取JSON文件
  const jsonPath = path.join(process.cwd(), 'shuju', '2024年执业药师法规历年真题.json');
  
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`❌ 找不到数据文件: ${jsonPath}`);
  }

  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  const questions: QuestionJSON[] = JSON.parse(fileContent);

  console.log(`📊 找到 ${questions.length} 道题目\n`);

  // 2. 删除旧数据（2024年法规）
  console.log('🗑️  删除旧数据...');
  const deleteResult = await prisma.questions.deleteMany({
    where: {
      source_year: 2024,
      subject: '药事管理与法规'
    }
  });
  console.log(`✅ 已删除 ${deleteResult.count} 条旧数据\n`);

  // 3. 导入新数据
  let successCount = 0;
  let errorCount = 0;

  for (const q of questions) {
    try {
      // 🔑 应用题目内容修复
      let question = q.question;
      let options = q.options;
      if (QUESTION_FIXES[q.number]) {
        if (QUESTION_FIXES[q.number].question) {
          question = QUESTION_FIXES[q.number].question!;
        }
        if (QUESTION_FIXES[q.number].options) {
          options = QUESTION_FIXES[q.number].options!;
        }
      }

      // 🔑 修复配伍题8选项问题
      // 配伍题组的最后一题包含了当前组和下一组的选项（8个）
      // 只保留前4个选项（当前配伍题组的选项）
      if (options && options.length === 8) {
        console.log(`⚠️  题${q.number}: 检测到8个选项，只保留前4个`);
        options = options.slice(0, 4); // 只取前4个选项
      }

      // 🔑 应用答案修复
      let answer = q.answer;
      if (ANSWER_FIXES[q.number]) {
        answer = ANSWER_FIXES[q.number];
      }

      // 🔑 清理答案字段（移除可能包含的解析内容）
      // 如果答案长度超过10个字符，很可能是错误的（混入了解析）
      if (answer.length > 10) {
        // 尝试从开头提取答案（通常是ABC、ABCD等）
        const match = answer.match(/^([A-E]+)/);
        if (match) {
          answer = match[1];
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
          content: question.trim(),
          options: options,
          correct_answer: answer,
          ai_explanation: q.analysis || '',
          source_type: 'history',
          source_year: 2024,
          subject: '药事管理与法规',
          question_type: questionType,
          chapter: chapter,
          difficulty: 2,
          exam_type: '执业药师'
        }
      });

      successCount++;
      
      // 显示详细导入信息（每10题或特殊题目）
      if (q.number % 10 === 0 || ANSWER_FIXES[q.number] || QUESTION_FIXES[q.number]) {
        const fixInfo = ANSWER_FIXES[q.number] || QUESTION_FIXES[q.number] ? ' ✨修复' : '';
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
  console.log('='.repeat(50));

  // 5. 验证题型分布
  const singleCount = await prisma.questions.count({
    where: {
      source_year: 2024,
      subject: '药事管理与法规',
      question_type: 'single'
    }
  });

  const multipleCount = await prisma.questions.count({
    where: {
      source_year: 2024,
      subject: '药事管理与法规',
      question_type: 'multiple'
    }
  });

  console.log('\n📊 题型分布验证:');
  console.log(`   单选题: ${singleCount} 道 (预期: 110)`);
  console.log(`   多选题: ${multipleCount} 道 (预期: 10)`);
  console.log(`   总计: ${singleCount + multipleCount} 道 (预期: 120)`);

  // 6. 验证修复的题目
  console.log('\n🔧 修复题目验证:');
  for (const questionNumber of Object.keys(ANSWER_FIXES).map(Number)) {
    const question = await prisma.questions.findFirst({
      where: {
        source_year: 2024,
        subject: '药事管理与法规'
      },
      orderBy: { created_at: 'asc' },
      skip: questionNumber - 1,
      take: 1
    });
    
    if (question) {
      console.log(`   题${questionNumber}: 答案=${question.correct_answer} ✅`);
    }
  }

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
