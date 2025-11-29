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

async function importMissingQuestions() {
  console.log('开始导入2022年中药药学专业知识（二）缺失的8题...\n');

  // 读取JSON源数据
  const jsonPath = path.join(process.cwd(), 'shuju', '2022年执业药师中药师药学专业知识（二）.json');
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const questions: QuestionJSON[] = JSON.parse(jsonContent);

  // 只处理前8题（缺失的题目）
  const missingQuestions = questions.slice(0, 8);
  
  console.log(`准备导入前8题: ${missingQuestions.map(q => q.number).join(', ')}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const q of missingQuestions) {
    try {
      console.log(`正在导入题${q.number}: ${q.question.substring(0, 30)}...`);

      // 确定章节
      const getChapter = (num: number): string => {
        if (num >= 1 && num <= 40) return '一、最佳选择题';
        if (num >= 41 && num <= 90) return '二、配伍选择题';
        if (num >= 91 && num <= 110) return '三、综合分析题';
        if (num >= 111 && num <= 120) return '四、多项选择题';
        return '未分类';
      };

      // 构建选项JSON - 使用value字段
      const optionsJson = q.options.map((opt, index) => {
        const key = String.fromCharCode(65 + index); // A, B, C, D, E
        const value = opt.replace(/^[A-E]\.?\s*/, '').trim();
        return { key, value };
      });

      // 确定题型
      let questionType = 'single';
      if (q.number >= 111 && q.number <= 120) {
        questionType = 'multiple';
      }

      // 处理答案
      let correctAnswer = q.answer;
      if (questionType === 'multiple' && correctAnswer.length > 1 && !correctAnswer.includes(',')) {
        correctAnswer = correctAnswer.split('').sort().join('');
      }

      // 插入数据库
      await prisma.questions.create({
        data: {
          exam_type: '执业药师',
          subject: '中药学专业知识（二）',
          chapter: getChapter(q.number),
          question_type: questionType,
          content: q.question.trim(),
          options: optionsJson,
          correct_answer: correctAnswer,
          explanation: q.analysis || '',
          difficulty: 2,
          knowledge_points: [],
          source_type: '历年真题',
          source_year: 2022,
          is_published: true,
          ai_explanation: null
        }
      });

      successCount++;
      console.log(`✅ 题${q.number}导入成功`);

    } catch (error) {
      errorCount++;
      console.error(`❌ 题${q.number}导入失败:`, error);
      
      // 详细错误信息
      if (error instanceof Error) {
        console.error(`   错误详情: ${error.message}`);
      }
    }
  }

  console.log('\n=== 补充导入完成 ===');
  console.log(`成功: ${successCount} 题`);
  console.log(`失败: ${errorCount} 题`);

  // 验证最终结果
  const finalCount = await prisma.questions.count({
    where: {
      source_year: 2022,
      subject: '中药学专业知识（二）'
    }
  });

  console.log(`\n数据库中2022年中药药学专业知识（二）最终题目数: ${finalCount}`);
  
  if (finalCount === 120) {
    console.log('🎉 恭喜！所有120题已全部导入成功！');
  } else {
    console.log(`⚠️  仍有 ${120 - finalCount} 题未导入`);
  }

  await prisma.$disconnect();
}

importMissingQuestions().catch(console.error);
