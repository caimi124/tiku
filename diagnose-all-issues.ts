import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as fs from 'fs';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function diagnoseAllIssues() {
  console.log('🔍 全面诊断题库问题\n');
  console.log('='.repeat(80) + '\n');

  // 1. 检查题目总数和顺序
  console.log('📊 问题1：检查题目顺序和题型分布\n');
  
  const allQuestions = await prisma.questions.findMany({
    where: {
      exam_type: '执业药师',
      subject: '中药学专业知识（一）',
      source_year: 2024,
    },
    orderBy: {
      created_at: 'asc'
    }
  });

  console.log(`总题目数: ${allQuestions.length}`);
  console.log(`\n前20题的章节和题型分布：\n`);
  
  allQuestions.slice(0, 20).forEach((q, idx) => {
    console.log(`${idx + 1}. 章节: ${q.chapter?.padEnd(20)} | 题型: ${q.question_type} | 题干: ${q.content.substring(0, 30)}...`);
  });

  console.log('\n' + '='.repeat(80) + '\n');

  // 2. 检查选项重复问题
  console.log('📊 问题2：检查配伍选择题的选项情况\n');
  
  const problematicQuestion = allQuestions.find(q => 
    q.content.includes('图示中药为秦皮的是')
  );

  if (problematicQuestion) {
    console.log(`找到问题题目: ${problematicQuestion.content.substring(0, 50)}...`);
    console.log(`题型: ${problematicQuestion.question_type}`);
    console.log(`章节: ${problematicQuestion.chapter}`);
    console.log(`\n选项数据:`);
    console.log(JSON.stringify(problematicQuestion.options, null, 2));
    console.log(`\n是否有ai_explanation: ${problematicQuestion.ai_explanation ? '是' : '否'}`);
    if (problematicQuestion.ai_explanation) {
      try {
        const data = JSON.parse(problematicQuestion.ai_explanation);
        console.log(`图片数量: ${data.images?.length || 0}`);
      } catch (e) {}
    }
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // 3. 检查第61题（缺失选项）
  console.log('📊 问题3：检查第61题的选项情况\n');
  
  const question61 = allQuestions.find(q => 
    q.content.includes('含量测定指标成分为双酮哌啶类生物碱的药材是')
  );

  if (question61) {
    console.log(`找到第61题: ${question61.content.substring(0, 50)}...`);
    console.log(`题型: ${question61.question_type}`);
    console.log(`章节: ${question61.chapter}`);
    console.log(`\n选项数据:`);
    console.log(JSON.stringify(question61.options, null, 2));
    console.log(`\n正确答案: ${question61.correct_answer}`);
  } else {
    console.log('❌ 未找到该题');
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // 4. 检查JSON源文件
  console.log('📊 检查JSON源文件的题目顺序\n');
  
  const jsonPath = './shuju/2024年执业药师中药药一历年真题/2024年中药药一历年真题.json';
  if (fs.existsSync(jsonPath)) {
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`JSON文件题目总数: ${jsonData.length}`);
    console.log(`\n前10题的number字段：`);
    jsonData.slice(0, 10).forEach((q: any) => {
      console.log(`  ${q.number}. ${q.question.substring(0, 40)}...`);
    });
    
    console.log(`\n第61题数据：`);
    const q61 = jsonData.find((q: any) => q.number === 61);
    if (q61) {
      console.log(JSON.stringify(q61, null, 2));
    }

    console.log(`\n第64题数据：`);
    const q64 = jsonData.find((q: any) => q.number === 64);
    if (q64) {
      console.log(JSON.stringify(q64, null, 2));
    }
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // 5. 检查前端API返回的顺序
  console.log('📊 总结：数据库中的题型分布\n');
  
  const typeDistribution: Record<string, number> = {};
  const chapterDistribution: Record<string, number> = {};
  
  allQuestions.forEach(q => {
    typeDistribution[q.question_type] = (typeDistribution[q.question_type] || 0) + 1;
    chapterDistribution[q.chapter || '未知'] = (chapterDistribution[q.chapter || '未知'] || 0) + 1;
  });

  console.log('题型分布：');
  Object.entries(typeDistribution).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}题`);
  });

  console.log('\n章节分布：');
  Object.entries(chapterDistribution).forEach(([chapter, count]) => {
    console.log(`  ${chapter}: ${count}题`);
  });

  await prisma.$disconnect();
}

diagnoseAllIssues().catch(console.error);
