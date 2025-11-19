import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as fs from 'fs';

config({ path: '.env.import' });
const prisma = new PrismaClient();

console.log('\n🚀 开始导入2024年执业药师中药综合真题（完整120道）\n');

// 解析原始文本为结构化数据
function parseRawText(): any[] {
  const rawText = fs.readFileSync('题库原始数据-请粘贴到这里.txt', 'utf-8');
  const lines = rawText.split('\n').map(l => l.trim());
  
  const questions: any[] = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // 查找题号
    const qMatch = line.match(/^(\d+)\.(.+)/);
    if (qMatch && parseInt(qMatch[1]) >= 1 && parseInt(qMatch[1]) <= 120) {
      const qNum = parseInt(qMatch[1]);
      let content = qMatch[2].trim();
      const options: any[] = [];
      let answer = '';
      let explanation = '';
      
      // 继续读取内容和选项
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        
        // 检测选项
        const optMatch = nextLine.match(/^([A-E])\.(.+)/);
        if (optMatch) {
          options.push({ key: optMatch[1], value: optMatch[2].trim() });
          i++;
          continue;
        }
        
        // 检测答案
        if (nextLine.includes('正确答案：') || nextLine.includes('答案：')) {
          const ansMatch = nextLine.match(/[：:]\s*([A-E,]+)/);
          if (ansMatch) answer = ansMatch[1];
          i++;
          continue;
        }
        
        // 检测解析
        if (nextLine.includes('解题思路：') || nextLine.includes('解析：')) {
          explanation = nextLine.replace(/^.+[：:]\s*/, '').trim();
          i++;
          break;
        }
        
        // 如果是下一题，退出
        if (nextLine.match(/^\d+\./)) break;
        
        // 继续收集内容
        if (nextLine && !nextLine.startsWith('一、') && !nextLine.startsWith('二、') && 
            !nextLine.startsWith('三、') && !nextLine.startsWith('四、') &&
            !nextLine.startsWith('【') && options.length === 0) {
          content += ' ' + nextLine;
        }
        i++;
      }
      
      if (content && options.length > 0 && answer) {
        questions.push({
          number: qNum,
          exam_type: '执业药师',
          subject: '中药学综合知识与技能',
          chapter: getChapter(qNum),
          question_type: getQuestionType(qNum),
          content: content.trim(),
          options,
          correct_answer: answer,
          explanation: explanation || '暂无解析',
          difficulty: 2,
          knowledge_points: ['中药综合'],
          source_type: '历年真题',
          source_year: 2024
        });
      }
    } else {
      i++;
    }
  }
  
  return questions;
}

function getChapter(n: number): string {
  if (n <= 40) return '最佳选择题';
  if (n <= 90) return '配伍选择题';
  if (n <= 110) return '综合分析题';
  return '多项选择题';
}

function getQuestionType(n: number): string {
  if (n <= 40) return 'single';
  if (n <= 90) return 'matching';
  if (n <= 110) return 'case';
  return 'multiple';
}

async function main() {
  try {
    console.log('📖 正在解析题目...');
    const questions = parseRawText();
    console.log(`✅ 成功解析 ${questions.length} 道题目\n`);
    
    if (questions.length < 50) {
      console.log('⚠️  解析题目数量过少，请检查数据格式');
      console.log('前3题示例：');
      questions.slice(0, 3).forEach(q => {
        console.log(`  [${q.number}] ${q.content.substring(0, 40)}...`);
      });
    }
    
    console.log('🗑️  清理旧数据...');
    const deleted = await prisma.questions.deleteMany({
      where: { exam_type: '执业药师', subject: '中药学综合知识与技能', source_year: 2024 }
    });
    console.log(`✅ 已清理 ${deleted.count} 条\n`);
    
    console.log(`📦 开始导入 ${questions.length} 道题目...\n`);
    
    let success = 0;
    for (let i = 0; i < questions.length; i++) {
      try {
        await prisma.questions.create({ data: questions[i] });
        success++;
        if (i % 10 === 0 || i === questions.length - 1) {
          const pct = ((i + 1) / questions.length * 100).toFixed(1);
          console.log(`✅ [${i + 1}/${questions.length}] (${pct}%)`);
        }
      } catch (e: any) {
        console.error(`❌ [${i + 1}] 失败: ${e.message.substring(0, 50)}`);
      }
    }
    
    console.log(`\n📊 导入完成: ${success}/${questions.length} 道题目`);
    
    const total = await prisma.questions.count({
      where: { exam_type: '执业药师', subject: '中药学综合知识与技能', source_year: 2024 }
    });
    console.log(`✨ 数据库验证: ${total} 道题目\n`);
    
    if (total === 120) {
      console.log('🎉 完美！120道题目全部导入成功！\n');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
