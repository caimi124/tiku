import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as fs from 'fs';

config({ path: '.env.import' });
const prisma = new PrismaClient();

console.log('\n' + '='.repeat(70));
console.log('🚀 自动解析并导入2024年执业药师中药综合真题');
console.log('='.repeat(70) + '\n');

// 读取原始题目文件
const rawData = fs.readFileSync('题库原始数据-请粘贴到这里.txt', 'utf-8');

// 解析函数
function parseQuestions(text: string) {
  const questions: any[] = [];
  
  // 按题号分割（匹配类似 "1." 或 "41." 这样的模式）
  const lines = text.split('\n');
  let currentQuestion: any = null;
  let currentOptions: any[] = [];
  let collectingContent = false;
  let contentLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过空行和分隔符
    if (!line || line.startsWith('=') || line.startsWith('【') || 
        line.includes('使用说明') || line.includes('请在此处粘贴')) {
      continue;
    }
    
    // 检测题号（1. 2. 3. 等或 41-43, 44-46等配伍题格式）
    const questionMatch = line.match(/^(\d+)\s*\./);
    const pairQuestionMatch = line.match(/^【(\d+)-(\d+)】/);
    
    if (questionMatch) {
      // 保存上一题
      if (currentQuestion && currentQuestion.content) {
        currentQuestion.content = contentLines.join(' ').trim();
        currentQuestion.options = currentOptions;
        questions.push(currentQuestion);
      }
      
      // 开始新题
      const questionNum = parseInt(questionMatch[1]);
      currentQuestion = {
        number: questionNum,
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        chapter: getChapter(questionNum),
        question_type: getQuestionType(questionNum),
        difficulty: 2,
        source_type: '历年真题',
        source_year: 2024,
        knowledge_points: ['中药学综合']
      };
      currentOptions = [];
      contentLines = [line.substring(questionMatch[0].length).trim()];
      collectingContent = true;
    }
    // 检测选项 A. B. C. D. E.
    else if (line.match(/^[A-E]\s*\./)) {
      collectingContent = false;
      const optionMatch = line.match(/^([A-E])\s*\.\s*(.+)/);
      if (optionMatch) {
        currentOptions.push({
          key: optionMatch[1],
          value: optionMatch[2].trim()
        });
      }
    }
    // 检测正确答案
    else if (line.includes('正确答案：') || line.includes('答案：')) {
      const answerMatch = line.match(/[：:]\s*([A-E]+)/);
      if (answerMatch && currentQuestion) {
        currentQuestion.correct_answer = answerMatch[1];
      }
    }
    // 检测解析
    else if (line.includes('解题思路：') || line.includes('解析：')) {
      const explanationMatch = line.match(/[：:]\s*(.+)/);
      if (explanationMatch && currentQuestion) {
        currentQuestion.explanation = explanationMatch[1].trim();
      }
    }
    // 继续收集题目内容
    else if (collectingContent && line && !line.startsWith('一、') && !line.startsWith('二、') && !line.startsWith('三、')) {
      contentLines.push(line);
    }
  }
  
  // 保存最后一题
  if (currentQuestion && currentQuestion.content) {
    currentQuestion.content = contentLines.join(' ').trim();
    currentQuestion.options = currentOptions;
    questions.push(currentQuestion);
  }
  
  return questions;
}

function getChapter(questionNum: number): string {
  if (questionNum <= 40) return '最佳选择题';
  if (questionNum <= 90) return '配伍选择题';
  if (questionNum <= 110) return '综合分析题';
  return '多项选择题';
}

function getQuestionType(questionNum: number): string {
  if (questionNum <= 40) return 'single';
  if (questionNum <= 90) return 'matching';
  if (questionNum <= 110) return 'case';
  return 'multiple';
}

async function main() {
  try {
    console.log('📖 正在解析题目文件...\n');
    const parsedQuestions = parseQuestions(rawData);
    
    console.log(`✅ 成功解析 ${parsedQuestions.length} 道题目\n`);
    
    if (parsedQuestions.length === 0) {
      console.log('❌ 没有解析到任何题目，请检查文件格式');
      return;
    }
    
    // 显示前3题作为示例
    console.log('📋 解析示例（前3题）：');
    parsedQuestions.slice(0, 3).forEach((q, idx) => {
      console.log(`\n[${idx + 1}] ${q.content?.substring(0, 40)}...`);
      console.log(`    答案: ${q.correct_answer}, 选项数: ${q.options?.length || 0}`);
    });
    
    console.log('\n' + '-'.repeat(70));
    console.log('🗑️  正在清理旧数据...');
    const deleted = await prisma.questions.deleteMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024
      }
    });
    console.log(`✅ 已清理 ${deleted.count} 条旧数据\n`);
    
    console.log(`📦 开始导入 ${parsedQuestions.length} 道题目...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (let i = 0; i < parsedQuestions.length; i++) {
      try {
        const q = parsedQuestions[i];
        
        // 确保必要字段存在
        if (!q.content || !q.correct_answer || !q.options || q.options.length === 0) {
          throw new Error('题目数据不完整');
        }
        
        await prisma.questions.create({ 
          data: {
            exam_type: q.exam_type,
            subject: q.subject,
            chapter: q.chapter,
            question_type: q.question_type,
            content: q.content,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation || '',
            difficulty: q.difficulty,
            knowledge_points: q.knowledge_points,
            source_type: q.source_type,
            source_year: q.source_year
          }
        });
        
        successCount++;
        const percent = ((i + 1) / parsedQuestions.length * 100).toFixed(1);
        console.log(`✅ [${i + 1}/${parsedQuestions.length}] (${percent}%) 题${q.number}: ${q.content.substring(0, 30)}...`);
      } catch (error: any) {
        errorCount++;
        const errorMsg = `题${parsedQuestions[i].number}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ [${i + 1}] ${errorMsg}`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 导入完成统计');
    console.log('='.repeat(70));
    console.log(`✅ 成功导入: ${successCount} 道题目`);
    console.log(`❌ 导入失败: ${errorCount} 道题目`);
    console.log(`📝 总计题目: ${parsedQuestions.length} 道`);
    console.log(`🎯 成功率: ${(successCount / parsedQuestions.length * 100).toFixed(2)}%`);
    console.log('='.repeat(70) + '\n');
    
    if (errors.length > 0 && errors.length <= 10) {
      console.log('❌ 失败详情:');
      errors.forEach((err, idx) => console.log(`   ${idx + 1}. ${err}`));
      console.log('');
    }
    
    // 验证数据库
    const total = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024
      }
    });
    console.log(`✨ 数据库验证: 现有2024年真题 ${total} 道\n`);
    
    if (total === 120) {
      console.log('🎉 完美！所有120道题目已成功导入数据库！\n');
    } else {
      console.log(`⚠️  提示: 预期120道，实际导入${total}道，请检查\n`);
    }
    
  } catch (error) {
    console.error('❌ 导入失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
