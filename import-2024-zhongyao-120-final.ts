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

// 题型分类函数
function getQuestionType(questionNumber: number): string {
  if (questionNumber >= 1 && questionNumber <= 40) {
    return '最佳选择题';
  } else if (questionNumber >= 41 && questionNumber <= 90) {
    return '配伍选择题';
  } else if (questionNumber >= 91 && questionNumber <= 110) {
    return '综合分析题';
  } else if (questionNumber >= 111 && questionNumber <= 120) {
    return '多项选择题';
  }
  return '其他';
}

async function main() {
  try {
    console.log('开始导入2024年执业药师中药学综合知识与技能真题...\n');

    // 读取JSON数据
    const jsonPath = path.join(__dirname, 'shuju', '202年执业药师中药师药学综合与技能历年真题.json');
    console.log(`读取文件: ${jsonPath}`);
    
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const questions: QuestionData[] = JSON.parse(rawData);
    
    console.log(`成功读取 ${questions.length} 道题目\n`);

    // 删除旧的2024年中药学综合与技能题目
    console.log('正在删除旧的2024年题目...');
    const deleteResult = await prisma.questions.deleteMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024
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
            source_year: 2024,
            is_published: true,
            difficulty: questionType === '多项选择题' ? 3 : (questionType === '综合分析题' ? 2 : 1),
            knowledge_points: []
          }
        });

        successCount++;
        
        // 每10题输出一次进度
        if (successCount % 10 === 0) {
          console.log(`已导入 ${successCount}/${questions.length} 题...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`导入第 ${q.number} 题失败:`, error);
      }
    }

    console.log('\n=== 导入完成 ===');
    console.log(`成功导入: ${successCount} 题`);
    console.log(`失败: ${errorCount} 题`);
    
    // 验证导入结果
    const totalCount = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024
      }
    });
    
    console.log(`\n数据库中现有2024年题目总数: ${totalCount}`);
    
    // 按题型统计
    const typeStats = await prisma.questions.groupBy({
      by: ['question_type'],
      where: {
        exam_type: '执业药师',
        subject: '中药学综合知识与技能',
        source_year: 2024
      },
      _count: true
    });
    
    console.log('\n题型分布:');
    typeStats.forEach(stat => {
      console.log(`  ${stat.question_type}: ${stat._count} 题`);
    });

  } catch (error) {
    console.error('导入过程出错:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
