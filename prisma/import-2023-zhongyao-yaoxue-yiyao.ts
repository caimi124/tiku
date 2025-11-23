import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

config({ path: '.env.local' });

const prisma = new PrismaClient();

interface QuestionJSON {
  number: number;
  question: string;
  options: string[];
  answer: string;
  analysis: string;
}

// 根据题号和规则匹配图片
function getImageNames(questionNumber: number, hasImageMark: boolean): string[] {
  if (!hasImageMark) return [];

  const images: string[] = [];
  
  // 最佳选择题：37、38、39、40题
  if ([37, 38, 39, 40].includes(questionNumber)) {
    ['A', 'B', 'C', 'D', 'E'].forEach(option => {
      images.push(`${questionNumber}-${option}.jpeg`);
    });
  }
  // 配伍选择题：52-53题（注意文件名有空格，且格式混合）
  else if (questionNumber === 52 || questionNumber === 53) {
    images.push('52-53-A .jpeg');
    images.push('52-53-B .png');
    images.push('52-53-C .jpeg');
    images.push('52-53-D .png');
    images.push('52-53-E .png');
  }
  // 综合分析题：97-98题
  else if (questionNumber === 97 || questionNumber === 98) {
    images.push('97-98-A .jpeg');
    images.push('97-98-B .jpeg');
    images.push('97-98-C .jpeg');
    images.push('97-98-D .jpeg');
    images.push('97-98-E.jpeg'); // 注意：这个没有空格
  }
  // 综合分析题：99-100题
  else if (questionNumber === 99 || questionNumber === 100) {
    images.push('99-100-A .jpeg');
    images.push('99-100-B.jpeg'); // 注意：后面几个没有空格
    images.push('99-100-C.jpeg');
    images.push('99-100-D.jpeg');
    images.push('99-100-E.jpeg');
  }

  return images;
}

// 检查文件是否存在
function checkImageExists(imageDir: string, imageName: string): boolean {
  const imagePath = path.join(imageDir, imageName);
  return fs.existsSync(imagePath);
}

// 解析选项
function parseOptions(optionsArray: string[]): { key: string; value: string }[] {
  return optionsArray.map(opt => {
    const match = opt.match(/^([A-E])\.\s*(.*)$/);
    if (match) {
      return { key: match[1], value: match[2].trim() };
    }
    return { key: '', value: opt };
  });
}

// 确定题型
function getQuestionType(number: number, options: string[], answer: string): string {
  // 多项选择题：答案包含多个字母
  if (answer && answer.length > 1 && /^[A-E]+$/.test(answer.replace(/,\s*/g, ''))) {
    return 'multiple';
  }
  
  // 配伍选择题：题目编号41-90
  if (number >= 41 && number <= 90) {
    return 'match';
  }
  
  // 综合分析题：题目编号91-110
  if (number >= 91 && number <= 110) {
    return 'comprehensive';
  }
  
  // 最佳选择题：题目编号1-40
  if (number >= 1 && number <= 40) {
    return 'single';
  }
  
  return 'single';
}

// 确定章节
function getChapter(number: number): string {
  if (number >= 1 && number <= 40) return '一、最佳选择题';
  if (number >= 41 && number <= 90) return '二、配伍选择题';
  if (number >= 91 && number <= 110) return '三、综合分析题';
  if (number >= 111 && number <= 120) return '四、多项选择题';
  return '未分类';
}

async function main() {
  console.log('🚀 开始导入2023年执业药师中药药学专业知识（一）真题\n');

  try {
    // 读取JSON文件
    const jsonPath = path.join(__dirname, '../shuju/2023年执业药师中药药一历年真题图片/2023年执业药师中药药学专业知识（一）.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const questions: QuestionJSON[] = JSON.parse(jsonContent);

    console.log(`📖 读取到 ${questions.length} 道题目\n`);

    // 图片目录（public目录）
    const imageDir = path.join(__dirname, '../public/shuju/2023年执业药师中药药一历年真题图片/img');
    
    // 验证图片
    console.log('🔍 验证图片文件...\n');
    const allImages = new Set<string>();
    questions.forEach(q => {
      const hasImageMark = q.question.includes('图示') || q.question.includes('[图示]');
      const imageNames = getImageNames(q.number, hasImageMark);
      imageNames.forEach(img => allImages.add(img));
    });

    console.log(`📋 发现 ${allImages.size} 张图片需要关联\n`);
    
    let foundCount = 0;
    for (const imageName of allImages) {
      if (checkImageExists(imageDir, imageName)) {
        foundCount++;
        console.log(`✅ 找到图片: ${imageName}`);
      } else {
        console.log(`⚠️  图片不存在: ${imageName}`);
      }
    }
    console.log(`\n📊 图片验证: ${foundCount}/${allImages.size}\n`);

    // 删除已存在的2023年中药药学专业知识（一）题目
    const deleted = await prisma.questions.deleteMany({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
      },
    });
    console.log(`🗑️  已清理旧数据: ${deleted.count} 条\n`);

    // 导入题目
    console.log('📝 开始导入题目...\n');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      try {
        // 检查是否有图片标记
        const hasImageMark = q.question.includes('图示') || q.question.includes('[图示]');
        const imageNames = getImageNames(q.number, hasImageMark);
        
        // 处理图片 - 使用public目录的相对路径
        const imageData = imageNames
          .filter(img => checkImageExists(imageDir, img))
          .map(img => `/shuju/2023年执业药师中药药一历年真题图片/img/${img}`);

        // 构建content
        let content = q.question;
        if (imageData.length > 0) {
          content += '\n\n【题目包含图片】';
        }

        await prisma.questions.create({
          data: {
            exam_type: '执业药师',
            subject: '中药学专业知识（一）',
            chapter: getChapter(q.number),
            question_type: getQuestionType(q.number, q.options, q.answer),
            content: content,
            options: parseOptions(q.options),
            correct_answer: q.answer,
            explanation: q.analysis || '',
            difficulty: 2,
            knowledge_points: [],
            source_type: '历年真题',
            source_year: 2023,
            is_published: true,
            // 将图片信息存储到ai_explanation字段
            ai_explanation: imageData.length > 0 ? JSON.stringify({ images: imageData }) : null,
          },
        });

        successCount++;
        const progress = `[${i + 1}/${questions.length}]`;
        const preview = q.question.substring(0, 30);
        const imageInfo = imageData.length > 0 ? `📷×${imageData.length}` : '';
        console.log(`✅ ${progress} Q${q.number} ${preview}... ${imageInfo}`);
      } catch (error: any) {
        errorCount++;
        console.error(`❌ [${i + 1}] Q${q.number} 导入失败:`, error.message);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 导入统计:');
    console.log(`   ✅ 成功: ${successCount} 道`);
    console.log(`   ❌ 失败: ${errorCount} 道`);
    console.log(`   📝 总计: ${questions.length} 道`);
    console.log(`   📷 图片: ${foundCount} 张`);
    console.log(`${'='.repeat(60)}\n`);

    // 验证
    const total = await prisma.questions.count({
      where: {
        exam_type: '执业药师',
        subject: '中药学专业知识（一）',
        source_year: 2023,
      },
    });
    console.log(`✨ 数据库中现有【2023年中药药学专业知识（一）】题目: ${total} 道\n`);
    console.log('🎉 导入完成！\n');

  } catch (error: any) {
    console.error('❌ 导入失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
