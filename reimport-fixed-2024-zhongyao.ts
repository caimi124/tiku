import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

config({ path: '.env.local' });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.tparjdkxxtnentsdazfw:CwKXguB7eIA4tfTn@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
    }
  }
});

interface Question {
  number: number;
  question: string;
  options: string[];
  answer: string;
  analysis: string;
}

// 修复选项数组（处理配伍选择题的选项问题）
function fixOptions(options: string[], questionNumber: number): string[] {
  // 如果选项为空，返回空数组
  if (!options || options.length === 0) {
    return [];
  }

  // 配伍选择题的图片题（61-64, 90-92）
  // 如果是图片题且选项只有"A.", "B."等，保持原样
  if (options.length === 5 && options.every(opt => /^[A-E]\.\s*$/.test(opt))) {
    return options;
  }

  // 如果选项数量超过5个，说明可能混入了下一题的选项
  if (options.length > 5) {
    console.log(`⚠️  题${questionNumber}选项异常(${options.length}个)，截取前5个`);
    
    // 检查是否有两组ABCDE
    const firstFive = options.slice(0, 5);
    if (firstFive.every(opt => /^[A-E]\./.test(opt))) {
      return firstFive;
    }
  }

  return options;
}

// 从相邻题目推断缺失的选项（针对配伍选择题）
function inferOptions(questions: Question[], currentIndex: number): string[] {
  const currentQ = questions[currentIndex];
  
  // 检查前后题目是否有相同选项组
  for (let offset of [-1, 1, -2, 2]) {
    const neighborIndex = currentIndex + offset;
    if (neighborIndex >= 0 && neighborIndex < questions.length) {
      const neighbor = questions[neighborIndex];
      
      // 如果相邻题有选项且题号差距在2以内（配伍题通常成组）
      if (neighbor.options.length > 0 && 
          Math.abs(currentQ.number - neighbor.number) <= 2) {
        console.log(`  ℹ️  从题${neighbor.number}推断题${currentQ.number}的选项`);
        return neighbor.options;
      }
    }
  }
  
  return [];
}

function getImageNames(questionNumber: number, hasImageMark: boolean): string[] {
  if (!hasImageMark) return [];

  const images: string[] = [];
  
  // 最佳选择题：8、9、10、11题
  if ([8, 9, 10, 11].includes(questionNumber)) {
    ['A', 'B', 'C', 'D', 'E'].forEach(option => {
      images.push(`${questionNumber}-${option}.jpeg`);
    });
  }
  // 配伍选择题：61-62、63-64题
  else if (questionNumber === 61 || questionNumber === 62) {
    ['A', 'B', 'C', 'D', 'E'].forEach(option => {
      images.push(`61-62-${option} .jpeg`);
    });
  }
  else if (questionNumber === 63 || questionNumber === 64) {
    ['A', 'B', 'C', 'D', 'E'].forEach(option => {
      images.push(`63-64-${option} .jpeg`);
    });
  }
  // 综合分析题：90-92题
  else if (questionNumber >= 90 && questionNumber <= 92) {
    ['A', 'B', 'C', 'D', 'E'].forEach(option => {
      images.push(`90-92-${option}.jpeg`);
    });
  }

  return images;
}

function findImageFile(baseDir: string, imageName: string): string | null {
  if (fs.existsSync(path.join(baseDir, imageName))) {
    return imageName;
  }
  const noSpace = imageName.replace(/\s/g, '');
  if (fs.existsSync(path.join(baseDir, noSpace))) {
    return noSpace;
  }
  const withSpace = imageName.replace('.jpeg', ' .jpeg');
  if (fs.existsSync(path.join(baseDir, withSpace))) {
    return withSpace;
  }
  return null;
}

function parseOptions(optionsArray: string[]): { key: string; value: string }[] {
  return optionsArray.map(opt => {
    const match = opt.match(/^([A-E])\.\s*(.*)$/);
    if (match) {
      return { key: match[1], value: match[2].trim() };
    }
    return { key: '', value: opt };
  });
}

function getQuestionType(number: number, options: string[], answer: string): string {
  const cleanAnswer = answer.replace(/,\s*/g, '');
  
  // 多项选择题：答案包含多个字母（111-120题）
  if (number >= 111 && number <= 120) {
    return 'multiple';
  }
  
  if (cleanAnswer.length > 1 && /^[A-E]+$/.test(cleanAnswer)) {
    return 'multiple';
  }
  
  // 配伍选择题：41-90题
  if (number >= 41 && number <= 90) {
    return 'match';
  }
  
  // 综合分析题：91-110题
  if (number >= 91 && number <= 110) {
    return 'comprehensive';
  }
  
  // 最佳选择题：1-40题
  return 'single';
}

function getChapter(number: number): string {
  if (number >= 1 && number <= 40) return '一、最佳选择题';
  if (number >= 41 && number <= 90) return '二、配伍选择题';
  if (number >= 91 && number <= 110) return '三、综合分析题';
  if (number >= 111 && number <= 120) return '四、多项选择题';
  return '未知';
}

async function reimportQuestions() {
  console.log('🚀 开始重新导入2024年中药学专业知识（一）真题\n');
  console.log('='.repeat(80) + '\n');

  // 1. 读取JSON文件
  const jsonPath = './shuju/2024年执业药师中药药一历年真题/2024年中药药一历年真题.json';
  const rawData: Question[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  console.log(`📖 读取到 ${rawData.length} 道题目\n`);

  // 2. 删除旧数据
  console.log('🗑️  删除旧数据...');
  const deleteResult = await prisma.questions.deleteMany({
    where: {
      exam_type: '执业药师',
      subject: '中药学专业知识（一）',
      source_year: 2024,
    }
  });
  console.log(`✅ 已删除 ${deleteResult.count} 道旧题目\n`);

  // 3. 处理图片
  const imageDir = path.join(__dirname, 'public/shuju/2024年执业药师中药药一历年真题/img');
  
  // 4. 导入题目
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const q = rawData[i];
    
    try {
      // 修复选项
      let fixedOptions = fixOptions(q.options, q.number);
      
      // 如果选项为空但有答案，尝试推断
      if (fixedOptions.length === 0 && q.answer && q.answer.trim()) {
        fixedOptions = inferOptions(rawData, i);
      }

      // 检查是否有图片
      // 方法1：题目包含"图示"
      // 方法2：选项都是空标记（"A.", "B."等），说明是图片选项
      const hasImageInQuestion = q.question.includes('图示');
      const hasEmptyOptions = fixedOptions.length > 0 && 
        fixedOptions.every(opt => opt.trim().match(/^[A-E]\.$/));
      const hasImage = hasImageInQuestion || hasEmptyOptions;
      const imageNames = getImageNames(q.number, hasImage);
      
      // 构建图片路径
      const imagePaths: string[] = [];
      if (imageNames.length > 0) {
        for (const imgName of imageNames) {
          const actualFileName = findImageFile(imageDir, imgName);
          if (actualFileName) {
            imagePaths.push(`/shuju/2024年执业药师中药药一历年真题/img/${actualFileName}`);
          }
        }
      }

      // 确定题型
      const questionType = getQuestionType(q.number, fixedOptions, q.answer);
      const chapter = getChapter(q.number);

      // 构建内容
      let content = q.question;
      if (imagePaths.length > 0) {
        content += '\n\n【题目包含图片】';
      }

      // 创建题目
      await prisma.questions.create({
        data: {
          exam_type: '执业药师',
          subject: '中药学专业知识（一）',
          chapter,
          question_type: questionType,
          question_number: q.number,
          content,
          options: parseOptions(fixedOptions),
          correct_answer: q.answer,
          explanation: q.analysis || null,
          ai_explanation: imagePaths.length > 0 ? JSON.stringify({ images: imagePaths }) : null,
          source_type: 'historical',
          source_year: 2024,
          difficulty: 2,
          is_published: true,
        },
      });

      successCount++;
      
      if (q.number % 10 === 0) {
        console.log(`✅ 已导入 ${successCount} / ${rawData.length} 题`);
      }

    } catch (error: any) {
      errorCount++;
      const errorMsg = `题${q.number}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 导入完成:`);
  console.log(`   ✅ 成功: ${successCount} 题`);
  console.log(`   ❌ 失败: ${errorCount} 题`);
  
  if (errors.length > 0) {
    console.log(`\n错误详情:`);
    errors.forEach(err => console.log(`   - ${err}`));
  }

  console.log('\n' + '='.repeat(80));

  await prisma.$disconnect();
}

reimportQuestions().catch(console.error);
