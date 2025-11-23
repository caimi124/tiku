import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// 如果没有环境变量，使用Session Pooler连接
const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

console.log('使用数据库连接:', DATABASE_URL.substring(0, 60) + '...\n');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

interface QuestionData {
  number: number;
  question: string;
  options: string[];
  answer: string;
  analysis: string;
}

// 根据题号判断题型
function getQuestionType(number: number): string {
  if (number >= 1 && number <= 40) return '最佳选择题';
  if (number >= 41 && number <= 90) return '配伍选择题';
  if (number >= 91 && number <= 110) return '综合分析题';
  if (number >= 111 && number <= 120) return '多项选择题';
  return '最佳选择题';
}

async function main() {
  try {
    console.log('开始导入2022年执业药师中药学综合知识与技能真题...\n');

    // 读取JSON数据
    const jsonPath = path.join(__dirname, 'shuju', '2022年执业药师中药师药学综合与技能历年真题.json');
    console.log(`读取文件: ${jsonPath}`);
    
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const questions: QuestionData[] = JSON.parse(rawData);
    
    console.log(`成功读取 ${questions.length} 道题目\n`);

    // 删除旧的2022年中药学综合与技能题目
    console.log('正在删除旧的2022年题目...');
    const deleteResult = await prisma.questions.deleteMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2022
      }
    });
    console.log(`已删除 ${deleteResult.count} 道旧题目\n`);

    // 导入新题目
    console.log('开始导入新题目...');
    let successCount = 0;
    let errorCount = 0;

    for (const q of questions) {
      try {
        const questionType = getQuestionType(q.number);
        
        // 处理选项 - 将字符串数组转为JSON对象
        let optionsJson: any;
        if (q.options && q.options.length > 0) {
          // 标准格式：A、B、C、D、E
          optionsJson = {
            A: q.options[0]?.replace(/^A\./, '').trim() || '',
            B: q.options[1]?.replace(/^B\./, '').trim() || '',
            C: q.options[2]?.replace(/^C\./, '').trim() || '',
            D: q.options[3]?.replace(/^D\./, '').trim() || '',
            E: q.options[4]?.replace(/^E\./, '').trim() || ''
          };
        } else {
          // 对于没有选项的题目（如配伍选择题的共用题干）
          optionsJson = {};
        }

        await prisma.questions.create({
          data: {
            exam_type: '执业药师',
            subject: '中药学综合知识与技能',
            chapter: questionType,
            question_type: questionType,
            content: q.question,
            options: optionsJson,
            correct_answer: q.answer || '',
            explanation: q.analysis || '',
            source_type: '历年真题',
            source_year: 2022,
            is_published: true,
            difficulty: questionType === '多项选择题' ? 3 : (questionType === '综合分析题' ? 2 : 1),
            knowledge_points: []
          }
        });

        successCount++;
        if (successCount % 10 === 0) {
          process.stdout.write(`已导入 ${successCount} 道题目...\r`);
        }
      } catch (error) {
        console.error(`\n导入第 ${q.number} 题失败:`, error);
        errorCount++;
      }
    }

    console.log(`\n\n导入完成!`);
    console.log(`✅ 成功导入: ${successCount} 道题目`);
    console.log(`❌ 导入失败: ${errorCount} 道题目`);

    // 验证导入结果
    console.log('\n验证导入结果...');
    const total = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2022
      }
    });
    console.log(`数据库中2022年题目总数: ${total} 道\n`);

    // 按题型统计
    const typeGroups = await prisma.questions.groupBy({
      by: ['question_type'],
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2022
      },
      _count: true
    });

    console.log('题型分布:');
    typeGroups.forEach(group => {
      console.log(`  ${group.question_type}: ${group._count} 题`);
    });

  } catch (error) {
    console.error('导入过程出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
