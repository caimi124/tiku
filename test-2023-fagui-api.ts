import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 模拟API的formatOptions函数
function formatOptions(options: any) {
  if (!options) return [];
  
  if (Array.isArray(options)) {
    if (options.length > 0 && typeof options[0] === 'string') {
      return options.map((opt: string) => {
        const dotIndex = opt.indexOf('.');
        if (dotIndex > 0) {
          return {
            key: opt.substring(0, dotIndex).trim(),
            value: opt.substring(dotIndex + 1).trim()
          };
        }
        return { key: '', value: opt };
      });
    }
    return options;
  }
  
  if (typeof options === 'object') {
    return Object.entries(options).map(([key, value]) => ({
      key,
      value: value as string
    }));
  }
  
  return [];
}

// 模拟API的formatQuestion函数
function formatQuestion(question: any) {
  return {
    ...question,
    options: formatOptions(question.options),
    correctAnswer: question.correct_answer,
    questionType: question.question_type,
    examType: question.exam_type,
    sourceYear: question.source_year,
    sourceType: question.source_type,
    knowledgePoints: question.knowledge_points || [],
    isPublished: question.is_published,
    aiExplanation: question.ai_explanation,
    explanation: question.ai_explanation,  // 🔑 关键映射
    chapter: question.chapter,
  };
}

async function main() {
  console.log('🧪 测试API返回2023年法规题8的数据\n');

  const questions = await prisma.questions.findMany({
    where: {
      source_year: 2023,
      subject: '药事管理与法规'
    },
    orderBy: { created_at: 'asc' },
    skip: 7,
    take: 1
  });

  if (questions.length === 0) {
    console.log('❌ 没有找到题目');
    return;
  }

  const formatted = formatQuestion(questions[0]);

  console.log('题目内容:', formatted.content.substring(0, 50) + '...');
  console.log('答案:', formatted.correctAnswer);
  console.log('\nexplanation字段（前端使用）:');
  console.log(formatted.explanation || '(空)');
  console.log('\naiExplanation字段（图片题使用）:');
  console.log(formatted.aiExplanation || '(空)');
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ API会返回explanation字段:', !!formatted.explanation);
  console.log('✅ explanation内容:', formatted.explanation?.substring(0, 50) + '...');
}

main()
  .catch((error) => {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
