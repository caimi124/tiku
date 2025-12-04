import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function diagnose() {
  try {
    console.log('🔍 诊断2024年西药药学综合与技能问题...\n');

    // 问题1：检查第13题选项
    console.log('=' .repeat(60));
    console.log('问题1：检查第13题选项');
    console.log('=' .repeat(60));
    
    const questions = await prisma.questions.findMany({
      where: {
        source_year: 2024,
        subject: '药学综合知识与技能'
      },
      orderBy: {
        created_at: 'asc'
      },
      select: {
        content: true,
        options: true,
        correct_answer: true,
        chapter: true
      }
    });

    // 找到第13题（索引12）
    if (questions.length >= 13) {
      const q13 = questions[12];
      console.log('\n第13题内容:');
      console.log(q13.content.substring(0, 100));
      console.log('\n选项:');
      if (Array.isArray(q13.options)) {
        q13.options.forEach((opt: any, idx: number) => {
          if (typeof opt === 'string') {
            console.log(`  ${idx + 1}. ${opt}`);
          } else if (typeof opt === 'object' && opt !== null) {
            console.log(`  ${idx + 1}. ${opt.key || ''}.${opt.value || ''}`);
          }
        });
        console.log(`\n选项数量: ${q13.options.length}个`);
      }
      console.log(`答案: ${q13.correct_answer}`);
    }

    // 检查JSON源文件
    console.log('\n\n检查JSON源文件:');
    const jsonPath = path.join(__dirname, 'shuju', '2024年执业药师西药师药学综合与技能历年真题.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const jsonQuestions = JSON.parse(jsonData);
    
    const jsonQ13 = jsonQuestions[12];
    console.log('\nJSON第13题:');
    console.log('题目:', jsonQ13.question.substring(0, 100));
    console.log('\n选项:');
    jsonQ13.options.forEach((opt: string, idx: number) => {
      console.log(`  ${idx + 1}. ${opt}`);
    });
    console.log(`\n选项数量: ${jsonQ13.options.length}个`);

    // 问题2：检查综合分析题（题91-110）
    console.log('\n\n' + '='.repeat(60));
    console.log('问题2：检查综合分析题（题91-110）');
    console.log('='.repeat(60));
    
    const comprehensiveQuestions = questions.slice(90, 110); // 题91-110
    
    console.log(`\n综合分析题数量: ${comprehensiveQuestions.length}道\n`);
    
    // 检查前5题的内容长度和案例信息
    comprehensiveQuestions.slice(0, 5).forEach((q, idx) => {
      console.log(`题${91 + idx}:`);
      console.log(`  内容长度: ${q.content.length}字符`);
      console.log(`  内容预览: ${q.content.substring(0, 80)}...`);
      console.log(`  是否包含"案例"关键词: ${q.content.includes('案例') ? '是' : '否'}`);
      console.log(`  是否包含"患者"关键词: ${q.content.includes('患者') ? '是' : '否'}`);
      console.log('');
    });

    // 检查JSON中的综合分析题
    console.log('\nJSON中的综合分析题（前5题）:');
    jsonQuestions.slice(90, 95).forEach((q: any, idx: number) => {
      console.log(`\n题${91 + idx}:`);
      console.log(`  内容长度: ${q.question.length}字符`);
      console.log(`  内容预览: ${q.question.substring(0, 80)}...`);
      console.log(`  是否包含"案例"关键词: ${q.question.includes('案例') ? '是' : '否'}`);
      console.log(`  是否包含"患者"关键词: ${q.question.includes('患者') ? '是' : '否'}`);
    });

    // 检查所有选项数量不等于5的题目
    console.log('\n\n' + '='.repeat(60));
    console.log('全面检查：选项数量异常的题目');
    console.log('='.repeat(60));
    
    const abnormalOptions = questions.filter((q, idx) => {
      if (!Array.isArray(q.options)) return true;
      return q.options.length !== 5;
    });

    if (abnormalOptions.length > 0) {
      console.log(`\n发现 ${abnormalOptions.length} 道题目选项数量异常:\n`);
      abnormalOptions.forEach((q, idx) => {
        const questionIndex = questions.findIndex(item => item === q);
        const optionCount = Array.isArray(q.options) ? q.options.length : 0;
        console.log(`题${questionIndex + 1}: 选项数量 ${optionCount}个`);
        console.log(`  内容: ${q.content.substring(0, 50)}...`);
        console.log('');
      });
    } else {
      console.log('\n✅ 所有题目选项数量正常（5个）');
    }

    // 检查选项内容为空的情况
    console.log('\n\n' + '='.repeat(60));
    console.log('全面检查：选项内容为空的题目');
    console.log('='.repeat(60));
    
    const emptyOptions: any[] = [];
    questions.forEach((q, idx) => {
      if (Array.isArray(q.options)) {
        q.options.forEach((opt: any, optIdx: number) => {
          let isEmpty = false;
          if (typeof opt === 'string') {
            // 字符串格式：检查是否只有"A."这样的前缀
            isEmpty = opt.trim().length <= 2 || opt.trim().match(/^[A-E]\.\s*$/);
          } else if (typeof opt === 'object' && opt !== null) {
            // 对象格式：检查value是否为空
            isEmpty = !opt.value || opt.value.trim() === '';
          }
          
          if (isEmpty) {
            emptyOptions.push({
              questionIndex: idx + 1,
              optionIndex: optIdx + 1,
              content: q.content.substring(0, 50)
            });
          }
        });
      }
    });

    if (emptyOptions.length > 0) {
      console.log(`\n⚠️  发现 ${emptyOptions.length} 个空选项:\n`);
      emptyOptions.forEach(item => {
        console.log(`题${item.questionIndex} 选项${item.optionIndex}: ${item.content}...`);
      });
    } else {
      console.log('\n✅ 所有选项内容正常');
    }

  } catch (error) {
    console.error('❌ 诊断失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
