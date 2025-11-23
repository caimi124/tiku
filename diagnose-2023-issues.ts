import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function diagnose() {
  console.log('🔍 全面诊断2023年数据问题\n');

  try {
    // 问题1：检查题目顺序
    console.log('=' .repeat(60));
    console.log('【问题1】检查题目排序');
    console.log('=' .repeat(60) + '\n');

    const questions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
      },
      orderBy: {
        created_at: 'asc',
      },
      select: {
        id: true,
        content: true,
        chapter: true,
        question_type: true,
        created_at: true,
      },
    });

    console.log(`总题目数: ${questions.length}\n`);
    
    // 显示前10题和后10题的顺序
    console.log('前10题:');
    questions.slice(0, 10).forEach((q, index) => {
      const preview = q.content.substring(0, 30).replace(/\n/g, ' ');
      console.log(`  ${index + 1}. ${q.chapter} | ${preview}...`);
    });
    
    console.log('\n后10题:');
    questions.slice(-10).forEach((q, index) => {
      const actualIndex = questions.length - 10 + index + 1;
      const preview = q.content.substring(0, 30).replace(/\n/g, ' ');
      console.log(`  ${actualIndex}. ${q.chapter} | ${preview}...`);
    });

    // 检查章节分布
    console.log('\n章节分布:');
    const byChapter = questions.reduce((acc, q) => {
      const chapter = q.chapter || '未分类';
      acc[chapter] = (acc[chapter] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(byChapter).forEach(([chapter, count]) => {
      console.log(`  ${chapter}: ${count}题`);
    });

    // 问题2：检查图片题
    console.log('\n' + '='.repeat(60));
    console.log('【问题2】检查图片显示');
    console.log('='.repeat(60) + '\n');

    const imageQuestions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
        content: {
          contains: '图示',
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    console.log(`包含"图示"的题目: ${imageQuestions.length}题\n`);
    
    imageQuestions.forEach((q, index) => {
      const preview = q.content.substring(0, 50).replace(/\n/g, ' ');
      console.log(`题 ${index + 1}:`);
      console.log(`  内容: ${preview}`);
      console.log(`  章节: ${q.chapter}`);
      console.log(`  有ai_explanation: ${!!q.ai_explanation}`);
      
      if (q.ai_explanation) {
        try {
          const data = JSON.parse(q.ai_explanation);
          console.log(`  图片数量: ${data.images?.length || 0}`);
          if (data.images && data.images.length > 0) {
            console.log(`  首张图片: ${data.images[0]}`);
          }
        } catch (e) {
          console.log(`  ❌ 解析失败`);
        }
      } else {
        console.log(`  ⚠️ 没有ai_explanation字段`);
      }
      console.log();
    });

    // 问题3：检查多选题
    console.log('='.repeat(60));
    console.log('【问题3】检查多选题');
    console.log('='.repeat(60) + '\n');

    const multipleQuestions = await prisma.questions.findMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
        question_type: 'multiple',
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    console.log(`多选题数量: ${multipleQuestions.length}题\n`);
    
    multipleQuestions.slice(0, 3).forEach((q, index) => {
      const preview = q.content.substring(0, 40).replace(/\n/g, ' ');
      console.log(`多选题 ${index + 1}:`);
      console.log(`  内容: ${preview}...`);
      console.log(`  章节: ${q.chapter}`);
      console.log(`  题型标记: ${q.question_type}`);
      console.log(`  正确答案: ${q.correct_answer}`);
      console.log(`  答案长度: ${q.correct_answer.length}个字符`);
      console.log();
    });

    console.log('='.repeat(60));
    console.log('✅ 诊断完成');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ 诊断失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
